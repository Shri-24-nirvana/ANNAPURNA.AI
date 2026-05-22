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
        
    # 4. Add Inventory Items
    if not db.query(models.InventoryItem).first():
        items = [
            models.InventoryItem(institution_id=inst.id, item_name="RICE", category="Grains", unit="KG", current_stock=750, reorder_limit=200, status="OPTIMAL"),
            models.InventoryItem(institution_id=inst.id, item_name="DAL", category="Legumes", unit="KG", current_stock=180, reorder_limit=150, status="LOW"),
            models.InventoryItem(institution_id=inst.id, item_name="ONION", category="Vegetables", unit="KG", current_stock=40, reorder_limit=100, status="CRITICAL"),
            models.InventoryItem(institution_id=inst.id, item_name="PANEER", category="Dairy", unit="KG", current_stock=120, reorder_limit=50, status="OPTIMAL")
        ]
        db.add_all(items)
        db.commit()
        print("Created Inventory Items.")

    # 5. Add Feedback
    if not db.query(models.Feedback).first():
        lunch = db.query(models.Meal).filter_by(meal_type="LUNCH").first()
        if lunch:
            fb = [
                models.Feedback(institution_id=inst.id, meal_id=lunch.id, rating=5, comment="Paneer was amazing!", sentiment="POSITIVE"),
                models.Feedback(institution_id=inst.id, meal_id=lunch.id, rating=2, comment="Rice was undercooked", sentiment="NEGATIVE"),
                models.Feedback(institution_id=inst.id, meal_id=lunch.id, rating=4, comment="Good meal overall", sentiment="POSITIVE"),
                models.Feedback(institution_id=inst.id, meal_id=lunch.id, rating=3, comment="Decent, but dal was too salty", sentiment="NEUTRAL")
            ]
            db.add_all(fb)
            db.commit()
            print("Created Feedback.")
            
    # 6. Add Medical Campus
    med_inst = db.query(models.Institution).filter_by(name="Medical Campus").first()
    if not med_inst:
        med_inst = models.Institution(
            name="Medical Campus",
            subscription_plan="Premium",
            total_students=1500,
            onboarding_status="Completed"
        )
        db.add(med_inst)
        db.commit()
        db.refresh(med_inst)
        
        # Add meal
        med_lunch = models.Meal(
            institution_id=med_inst.id,
            meal_type="LUNCH",
            menu_items="Fish Curry, Rice",
            scheduled_time=today.replace(hour=12, minute=30, second=0, microsecond=0),
            predicted_count=1300
        )
        db.add(med_lunch)
        db.commit()
        db.refresh(med_lunch)
        
        student = db.query(models.User).filter_by(email="student@example.com").first()
        if student:
            # Add mock skips
            skips = []
            for i in range(120):
                skip = models.Attendance(
                    user_id=student.id, 
                    meal_id=med_lunch.id,
                    status="SKIPPING"
                )
                skips.append(skip)
            db.add_all(skips)
            db.commit()
            print("Created Medical Campus data.")
        
    db.close()
    print("Seeding complete.")

if __name__ == "__main__":
    # Ensure tables exist
    models.Base.metadata.create_all(bind=database.engine)
    seed_db()
