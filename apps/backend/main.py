from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import List

import models, database, auth
from pydantic import BaseModel

# Create database tables
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Annapurna AI API", version="1.0.0")

# CORS Setup for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Pydantic Models for requests/responses
class Token(BaseModel):
    access_token: str
    token_type: str
    role: str

class UserResponse(BaseModel):
    id: int
    email: str
    role: str
    student_id: str | None = None
    department: str | None = None
    hostel: str | None = None
    
    class Config:
        from_attributes = True

class AttendanceUpdate(BaseModel):
    meal_id: int
    status: str # "ATTENDING" or "SKIPPING"

# --- AUTH ENDPOINTS ---

@app.post("/auth/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = auth.create_access_token(data={"sub": user.email, "role": user.role})
    return {"access_token": access_token, "token_type": "bearer", "role": user.role}

@app.get("/users/me", response_model=UserResponse)
def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

# --- STUDENT APP ENDPOINTS ---

@app.get("/meals/today")
def get_today_meals(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # In a real app, query by today's date. For MVP, just return all meals for the user's institution.
    meals = db.query(models.Meal).filter(models.Meal.institution_id == current_user.institution_id).all()
    
    # Check attendance status for the current user for these meals
    result = []
    for meal in meals:
        attendance = db.query(models.Attendance).filter(
            models.Attendance.user_id == current_user.id,
            models.Attendance.meal_id == meal.id
        ).first()
        
        status_str = attendance.status if attendance else "ATTENDING"
        
        result.append({
            "id": meal.id,
            "meal_type": meal.meal_type,
            "menu_items": meal.menu_items,
            "scheduled_time": meal.scheduled_time,
            "status": status_str
        })
        
    return result

@app.post("/attendance/skip")
def toggle_skip_meal(data: AttendanceUpdate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    attendance = db.query(models.Attendance).filter(
        models.Attendance.user_id == current_user.id,
        models.Attendance.meal_id == data.meal_id
    ).first()
    
    if attendance:
        attendance.status = data.status
        attendance.updated_at = datetime.now(timezone.utc)
    else:
        new_attendance = models.Attendance(
            user_id=current_user.id,
            meal_id=data.meal_id,
            status=data.status
        )
        db.add(new_attendance)
        
    db.commit()
    return {"message": "Attendance updated successfully", "status": data.status}
