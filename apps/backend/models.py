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
    coupons = relationship("Coupon", foreign_keys="[Coupon.student_id]", back_populates="student")

class Institution(Base):
    __tablename__ = "institutions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    subscription_plan = Column(String)
    total_students = Column(Integer)
    onboarding_status = Column(String)
    qr_secret = Column(String, default="sec_annapurna_mess_qr_key_2026")

    users = relationship("User", back_populates="institution")
    meals = relationship("Meal", back_populates="institution")

class Meal(Base):
    __tablename__ = "meals"

    id = Column(Integer, primary_key=True, index=True)
    institution_id = Column(Integer, ForeignKey("institutions.id"))
    meal_type = Column(String) # BREAKFAST, LUNCH, DINNER
    menu_items = Column(String) # JSON or comma separated
    scheduled_time = Column(DateTime)
    start_hour = Column(Integer, default=12)
    start_minute = Column(Integer, default=30)
    end_hour = Column(Integer, default=14)
    end_minute = Column(Integer, default=0)
    cutoff_minutes_before_start = Column(Integer, default=60)
    predicted_count = Column(Integer, nullable=True)
    actual_count = Column(Integer, nullable=True)

    institution = relationship("Institution", back_populates="meals")
    attendance = relationship("Attendance", back_populates="meal")

class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    meal_id = Column(Integer, ForeignKey("meals.id"))
    status = Column(String) # ATTENDING, SKIPPING, SCANNED
    skip_reason = Column(String, nullable=True)
    verification_method = Column(String, default="MESS_QR") # MESS_QR, MANUAL_OVERRIDE
    verified_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="attendance")
    meal = relationship("Meal", back_populates="attendance")

class InventoryItem(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True)
    institution_id = Column(Integer, ForeignKey("institutions.id"))
    item_name = Column(String)
    category = Column(String)
    unit = Column(String)
    current_stock = Column(Float)
    reorder_limit = Column(Float)
    status = Column(String) # OPTIMAL, LOW, CRITICAL
    last_updated = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    institution = relationship("Institution")

class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, index=True)
    institution_id = Column(Integer, ForeignKey("institutions.id"))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    meal_id = Column(Integer, ForeignKey("meals.id"))
    rating = Column(Integer) # 1 to 5
    comment = Column(String, nullable=True)
    sentiment = Column(String) # POSITIVE, NEUTRAL, NEGATIVE
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    institution = relationship("Institution")
    meal = relationship("Meal")
    user = relationship("User")

class RewardRule(Base):
    __tablename__ = "reward_rules"

    id = Column(String, primary_key=True, index=True) # e.g. "rule_10_meals", "rule_20_meals_10_feedbacks"
    name = Column(String, index=True)
    reward_type = Column(String) # FREE_COFFEE, FREE_MEAL, BONUS_DESSERT, SPECIAL_SNACK
    reward_title = Column(String)
    reward_description = Column(String)
    required_scanned_meals = Column(Integer, default=0)
    required_feedbacks = Column(Integer, default=0)
    required_streak_days = Column(Integer, default=0)
    validity_days = Column(Integer, default=30)
    is_active = Column(Boolean, default=True)
    reason_template = Column(String) # Template with placeholders e.g. "You attended {scanned_count} verified meals!"

    coupons = relationship("Coupon", back_populates="rule")

class Coupon(Base):
    __tablename__ = "coupons"

    id = Column(String, primary_key=True, index=True) # e.g. "CPN-COFFEE-84920"
    student_id = Column(Integer, ForeignKey("users.id"), index=True)
    rule_id = Column(String, ForeignKey("reward_rules.id"))
    reward_type = Column(String) # FREE_COFFEE, FREE_MEAL, etc.
    title = Column(String)
    description = Column(String)
    status = Column(String, default="AVAILABLE", index=True) # AVAILABLE, REDEEMED, EXPIRED
    earned_date = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    expiry_date = Column(DateTime)
    redeemed_date = Column(DateTime, nullable=True)
    reason = Column(String) # Human-readable "Why you got this" message
    redemption_code = Column(String, unique=True, index=True) # e.g. "ANN-7392-CF"
    redeemed_by_manager_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    milestone_cycle = Column(Integer, default=1) # Cycle number to prevent duplicate rewards for same milestone

    student = relationship("User", foreign_keys=[student_id], back_populates="coupons")
    rule = relationship("RewardRule", back_populates="coupons")
    manager = relationship("User", foreign_keys=[redeemed_by_manager_id])

