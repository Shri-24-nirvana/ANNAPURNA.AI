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

class FeedbackCreate(BaseModel):
    meal_id: int
    rating: int
    comment: str

@app.post("/student/feedback")
def submit_feedback(data: FeedbackCreate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    sentiment = "NEUTRAL"
    if data.rating >= 4:
        sentiment = "POSITIVE"
    elif data.rating <= 2:
        sentiment = "NEGATIVE"
        
    feedback = models.Feedback(
        institution_id=current_user.institution_id,
        user_id=current_user.id,
        meal_id=data.meal_id,
        rating=data.rating,
        comment=data.comment,
        sentiment=sentiment
    )
    db.add(feedback)
    db.commit()
    return {"message": "Feedback submitted successfully"}

# --- MANAGER APP ENDPOINTS ---

@app.get("/manager/prep-sheet")
def get_prep_sheet(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    # if current_user.role != "manager":
    #     raise HTTPException(status_code=403, detail="Not authorized")
        
    inst_id = current_user.institution_id
    inst = db.query(models.Institution).filter_by(id=inst_id).first()
    
    today = datetime.now(timezone.utc)
    # Find today's lunch
    lunch = db.query(models.Meal).filter(
        models.Meal.institution_id == inst_id,
        models.Meal.meal_type == "LUNCH"
    ).first()
    
    total_students = inst.total_students if inst else 2000
    
    if lunch:
        # Count explicit skips
        skipped_count = db.query(models.Attendance).filter(
            models.Attendance.meal_id == lunch.id,
            models.Attendance.status == "SKIPPING"
        ).count()
    else:
        skipped_count = 0
        
    import ai_engine
    predicted = ai_engine.calculate_predicted_attendance(total_students, skipped_count)
    prep_data = ai_engine.generate_prep_sheet(predicted)
    
    return {
        "predicted_attendance": predicted,
        "total_enrolled": total_students,
        "skipped_count": skipped_count,
        "prep_data": prep_data
    }

@app.get("/manager/inventory")
def get_inventory(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    items = db.query(models.InventoryItem).filter_by(institution_id=current_user.institution_id).all()
    return items

@app.get("/manager/feedback")
def get_feedback(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    feedbacks = db.query(models.Feedback).filter_by(institution_id=current_user.institution_id).order_by(models.Feedback.created_at.desc()).all()
    
    # Calculate distributions
    ratings = [f.rating for f in feedbacks]
    distribution = {
        "5": ratings.count(5),
        "4": ratings.count(4),
        "3": ratings.count(3),
        "2": ratings.count(2),
        "1": ratings.count(1),
    }
    
    return {
        "feedbacks": feedbacks,
        "distribution": distribution,
        "total": len(feedbacks)
    }

