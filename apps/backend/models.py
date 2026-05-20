from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    role = Column(String, index=True) # student, manager, super_admin
    institution_id = Column(Integer, ForeignKey("institutions.id"), nullable=True)
    student_id = Column(String, unique=True, index=True, nullable=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    department = Column(String, nullable=True)
    hostel = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    institution = relationship("Institution", back_populates="users")
    attendance = relationship("Attendance", back_populates="user")

class Institution(Base):
    __tablename__ = "institutions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    subscription_plan = Column(String)
    total_students = Column(Integer)
    onboarding_status = Column(String)

    users = relationship("User", back_populates="institution")
    meals = relationship("Meal", back_populates="institution")

class Meal(Base):
    __tablename__ = "meals"

    id = Column(Integer, primary_key=True, index=True)
    institution_id = Column(Integer, ForeignKey("institutions.id"))
    meal_type = Column(String) # BREAKFAST, LUNCH, DINNER
    menu_items = Column(String) # JSON or comma separated
    scheduled_time = Column(DateTime)
    predicted_count = Column(Integer, nullable=True)
    actual_count = Column(Integer, nullable=True)

    institution = relationship("Institution", back_populates="meals")
    attendance = relationship("Attendance", back_populates="meal")

class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    meal_id = Column(Integer, ForeignKey("meals.id"))
    status = Column(String) # ATTENDING, SKIPPED
    skip_reason = Column(String, nullable=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="attendance")
    meal = relationship("Meal", back_populates="attendance")
