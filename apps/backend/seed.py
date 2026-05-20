import os
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone

import database
import models
import auth

def seed_db():
    print("Seeding database...")
    db = database.SessionLocal()
    
    # 1. Create Institution
    inst = db.query(models.Institution).first()
    if not inst:
        inst = models.Institution(
            name="Example Tech University",
            subscription_plan="Premium",
            total_students=2000,
            onboarding_status="Completed"
        )
        db.add(inst)
        db.commit()
        db.refresh(inst)
        print("Created Institution.")
        
    # 2. Create Users (Student, Manager, Admin)
    # Student
    if not db.query(models.User).filter_by(email="student@example.com").first():
        student = models.User(
            email="student@example.com",
            password_hash=auth.get_password_hash("password123"),
            role="student",
            institution_id=inst.id,
            student_id="ET12345",
            department="Computer Science",
            hostel="Block C - R210"
        )
        db.add(student)
        
    # Manager
    if not db.query(models.User).filter_by(email="manager@example.com").first():
        manager = models.User(
            email="manager@example.com",
            password_hash=auth.get_password_hash("password123"),
            role="manager",
            institution_id=inst.id,
        )
        db.add(manager)
        
    # Admin
    if not db.query(models.User).filter_by(email="admin@example.com").first():
        admin = models.User(
            email="admin@example.com",
            password_hash=auth.get_password_hash("password123"),
            role="super_admin",
            institution_id=inst.id,
        )
        db.add(admin)
        
    db.commit()
    print("Created Users (student, manager, admin). Password is 'password123' for all.")
    
    # 3. Create dummy meals for today
    today = datetime.now(timezone.utc)
    if not db.query(models.Meal).first():
        lunch = models.Meal(
            institution_id=inst.id,
            meal_type="LUNCH",
            menu_items="Paneer Tikka, Rice, Daal, Naan",
            scheduled_time=today.replace(hour=12, minute=30, second=0, microsecond=0),
            predicted_count=1800
        )
        dinner = models.Meal(
            institution_id=inst.id,
            meal_type="DINNER",
            menu_items="Chicken Curry, Roti, Salad",
            scheduled_time=today.replace(hour=19, minute=0, second=0, microsecond=0),
            predicted_count=1650
        )
        db.add(lunch)
        db.add(dinner)
        db.commit()
        print("Created Meals for today.")
        
    db.close()
    print("Seeding complete.")

if __name__ == "__main__":
    # Ensure tables exist
    models.Base.metadata.create_all(bind=database.engine)
    seed_db()
