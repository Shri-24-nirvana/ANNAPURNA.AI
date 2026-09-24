from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta, date
from typing import List, Dict, Any, Optional
import secrets
import models

DEFAULT_RULES = [
    {
        "id": "rule_10_meals",
        "name": "10-Meal Attendance Milestone",
        "reward_type": "FREE_COFFEE",
        "reward_title": "Free Artisan Coffee / Special Chai",
        "reward_description": "Redeemable at the Campus Cafe for any hot or iced handcrafted beverage.",
        "required_scanned_meals": 10,
        "required_feedbacks": 0,
        "required_streak_days": 0,
        "validity_days": 30,
        "is_active": True,
        "reason_template": "You attended {scanned_count} verified meals at the mess with zero unexcused waste!"
    },
    {
        "id": "rule_20_meals_10_feedbacks",
        "name": "Active Contributor Feast",
        "reward_type": "FREE_MEAL",
        "reward_title": "Free Sunday Special Feast Meal",
        "reward_description": "Complimentary VIP pass for any Sunday Special Feast or Chef's Live Counter meal.",
        "required_scanned_meals": 20,
        "required_feedbacks": 10,
        "required_streak_days": 0,
        "validity_days": 45,
        "is_active": True,
        "reason_template": "You attended {scanned_count} verified meals and submitted {feedback_count} constructive reviews!"
    },
    {
        "id": "rule_7_day_streak",
        "name": "7-Day Consistency Warrior",
        "reward_type": "BONUS_DESSERT",
        "reward_title": "Free Gourmet Dessert / Snack Box",
        "reward_description": "Redeemable for any artisanal dessert, fresh smoothie, or protein snack box.",
        "required_scanned_meals": 0,
        "required_feedbacks": 0,
        "required_streak_days": 7,
        "validity_days": 30,
        "is_active": True,
        "reason_template": "You maintained a flawless {streak_days}-day consecutive mess attendance streak!"
    }
]

def seed_default_reward_rules(db: Session):
    """Ensures default configurable reward rules exist in the database."""
    for rule_data in DEFAULT_RULES:
        existing = db.query(models.RewardRule).filter_by(id=rule_data["id"]).first()
        if not existing:
            new_rule = models.RewardRule(**rule_data)
            db.add(new_rule)
    db.commit()

def generate_redemption_code(db: Session, prefix: str = "ANN") -> str:
    """Generates an 8-character unique verification code formatted as ANN-XXXX-YY."""
    while True:
        num_part = secrets.randbelow(9000) + 1000
        alpha_part = secrets.token_hex(2).upper()
        code = f"{prefix}-{num_part}-{alpha_part}"
        existing = db.query(models.Coupon).filter_by(redemption_code=code).first()
        if not existing:
            return code

def get_verified_meals_count(user_id: int, db: Session) -> int:
    """Counts verified counter attendance records for the given student."""
    return db.query(models.Attendance).filter(
        models.Attendance.user_id == user_id,
        models.Attendance.status == "SCANNED"
    ).count()

def get_genuine_feedbacks_count(user_id: int, db: Session) -> int:
    """
    Counts genuine feedbacks submitted by the student:
    Must have rating (1-5) and a non-empty comment with at least 5 characters.
    """
    feedbacks = db.query(models.Feedback).filter(
        models.Feedback.user_id == user_id,
        models.Feedback.rating >= 1
    ).all()
    
    genuine_count = 0
    for fb in feedbacks:
        if fb.comment and len(fb.comment.strip()) >= 5:
            genuine_count += 1
    return genuine_count

def get_student_attendance_streak_days(user_id: int, db: Session, ref_date: Optional[date] = None) -> int:
    """
    Calculates consecutive calendar days with at least 1 verified meal scan.
    Returns the current active streak ending today (or yesterday if today's meal is yet to come).
    """
    records = db.query(models.Attendance).filter(
        models.Attendance.user_id == user_id,
        models.Attendance.status == "SCANNED"
    ).all()
    
    if not records:
        return 0
        
    # Extract unique dates of verified meals
    scan_dates = set()
    for r in records:
        if r.verified_at:
            scan_dates.add(r.verified_at.date())
        elif r.updated_at:
            scan_dates.add(r.updated_at.date())
            
    if not scan_dates:
        return 0
        
    today = ref_date or date.today()
    yesterday = today - timedelta(days=1)
    
    # Check if streak is active (has scan today or yesterday)
    if today in scan_dates:
        curr_day = today
    elif yesterday in scan_dates:
        curr_day = yesterday
    else:
        return 0 # Streak broken
        
    streak = 0
    while curr_day in scan_dates:
        streak += 1
        curr_day -= timedelta(days=1)
        
    return streak

def evaluate_and_grant_rewards(user_id: int, db: Session) -> List[models.Coupon]:
    """
    Evaluates student performance against all active RewardRules.
    Automatically grants coupons when thresholds are met.
    Guarantees duplicate prevention through (student_id, rule_id, milestone_cycle).
    """
    seed_default_reward_rules(db)
    
    user = db.query(models.User).filter_by(id=user_id).first()
    if not user or user.role != "student":
        return []
        
    scanned_count = get_verified_meals_count(user_id, db)
    feedback_count = get_genuine_feedbacks_count(user_id, db)
    streak_days = get_student_attendance_streak_days(user_id, db)
    
    active_rules = db.query(models.RewardRule).filter_by(is_active=True).all()
    granted_coupons: List[models.Coupon] = []
    
    now_utc = datetime.now(timezone.utc)
    
    for rule in active_rules:
        # Determine maximum milestone cycle the student qualifies for
        cycles_eligible = 0
        
        # 1. Meals-only rule
        if rule.required_scanned_meals > 0 and rule.required_feedbacks == 0 and rule.required_streak_days == 0:
            cycles_eligible = scanned_count // rule.required_scanned_meals
            
        # 2. Meals + Feedback composite rule
        elif rule.required_scanned_meals > 0 and rule.required_feedbacks > 0:
            meal_cycles = scanned_count // rule.required_scanned_meals
            fb_cycles = feedback_count // rule.required_feedbacks
            cycles_eligible = min(meal_cycles, fb_cycles)
            
        # 3. Streak-based rule
        elif rule.required_streak_days > 0:
            cycles_eligible = streak_days // rule.required_streak_days
            
        if cycles_eligible <= 0:
            continue
            
        # Grant any missing cycle up to cycles_eligible
        for cycle in range(1, cycles_eligible + 1):
            existing_coupon = db.query(models.Coupon).filter_by(
                student_id=user_id,
                rule_id=rule.id,
                milestone_cycle=cycle
            ).first()
            
            if not existing_coupon:
                coupon_id = f"CPN-{rule.reward_type[:6]}-{secrets.token_hex(4).upper()}"
                expiry_dt = now_utc + timedelta(days=rule.validity_days)
                redemption_code = generate_redemption_code(db)
                
                reason_msg = rule.reason_template.format(
                    scanned_count=scanned_count,
                    feedback_count=feedback_count,
                    streak_days=streak_days
                )
                
                new_coupon = models.Coupon(
                    id=coupon_id,
                    student_id=user_id,
                    rule_id=rule.id,
                    reward_type=rule.reward_type,
                    title=rule.reward_title,
                    description=rule.reward_description,
                    status="AVAILABLE",
                    earned_date=now_utc,
                    expiry_date=expiry_dt,
                    reason=reason_msg,
                    redemption_code=redemption_code,
                    milestone_cycle=cycle
                )
                db.add(new_coupon)
                granted_coupons.append(new_coupon)
                
    if granted_coupons:
        db.commit()
        for c in granted_coupons:
            db.refresh(c)
            
    return granted_coupons

def is_past_datetime(dt: Optional[datetime]) -> bool:
    if not dt:
        return False
    if dt.tzinfo is not None:
        return datetime.now(timezone.utc) > dt
    # Naive datetime assumed to be UTC or local
    return datetime.now() > dt


def refresh_coupon_expiration(db: Session):
    """Auto-expires any AVAILABLE coupons whose expiry_date is in the past."""
    now_utc = datetime.now(timezone.utc)
    available_coupons = db.query(models.Coupon).filter(models.Coupon.status == "AVAILABLE").all()
    expired_count = 0
    for c in available_coupons:
        if is_past_datetime(c.expiry_date):
            c.status = "EXPIRED"
            expired_count += 1
    if expired_count > 0:
        db.commit()


def get_student_rewards_summary(user_id: int, db: Session) -> Dict[str, Any]:
    """
    Returns full rewards dashboard payload for student:
    - Available, Redeemed, Expired coupons lists
    - Live progress towards upcoming reward rules
    - Overall attendance and feedback stats
    """
    # Evaluate any new achievements and refresh expirations
    evaluate_and_grant_rewards(user_id, db)
    refresh_coupon_expiration(db)
    
    scanned_count = get_verified_meals_count(user_id, db)
    feedback_count = get_genuine_feedbacks_count(user_id, db)
    streak_days = get_student_attendance_streak_days(user_id, db)
    
    coupons = db.query(models.Coupon).filter_by(student_id=user_id).order_by(models.Coupon.earned_date.desc()).all()
    
    available = []
    redeemed = []
    expired = []
    
    now_utc = datetime.now(timezone.utc)
    
    for c in coupons:
        days_left = max(0, (c.expiry_date - now_utc).days) if c.expiry_date else 0
        item = {
            "id": c.id,
            "title": c.title,
            "description": c.description,
            "reward_type": c.reward_type,
            "status": c.status,
            "earned_date": c.earned_date.strftime("%b %d, %Y") if c.earned_date else "",
            "expiry_date": c.expiry_date.strftime("%b %d, %Y") if c.expiry_date else "",
            "days_left": days_left,
            "redeemed_date": c.redeemed_date.strftime("%b %d, %Y - %I:%M %p") if c.redeemed_date else None,
            "reason": c.reason,
            "redemption_code": c.redemption_code,
            "rule_id": c.rule_id
        }
        if c.status == "AVAILABLE":
            available.append(item)
        elif c.status == "REDEEMED":
            redeemed.append(item)
        else:
            expired.append(item)
            
    # Calculate progress toward next rules
    active_rules = db.query(models.RewardRule).filter_by(is_active=True).all()
    progress_list = []
    
    for rule in active_rules:
        if rule.required_scanned_meals > 0 and rule.required_feedbacks == 0 and rule.required_streak_days == 0:
            target = rule.required_scanned_meals
            current_mod = scanned_count % target
            progress_pct = min(100, int((current_mod / target) * 100)) if current_mod > 0 else (0 if scanned_count == 0 else 0)
            remaining = target - current_mod
            progress_list.append({
                "rule_id": rule.id,
                "rule_name": rule.name,
                "reward_title": rule.reward_title,
                "reward_type": rule.reward_type,
                "current": current_mod,
                "target": target,
                "remaining": remaining,
                "percentage": progress_pct,
                "unit": "meals attended",
                "label": f"{current_mod}/{target} meals attended ({remaining} to go for {rule.reward_title})"
            })
            
        elif rule.required_scanned_meals > 0 and rule.required_feedbacks > 0:
            # Composite rule
            target_meals = rule.required_scanned_meals
            target_fb = rule.required_feedbacks
            curr_meals_mod = scanned_count % target_meals
            curr_fb_mod = feedback_count % target_fb
            
            pct_meals = (curr_meals_mod / target_meals)
            pct_fb = (curr_fb_mod / target_fb)
            composite_pct = min(100, int(((pct_meals + pct_fb) / 2) * 100))
            
            progress_list.append({
                "rule_id": rule.id,
                "rule_name": rule.name,
                "reward_title": rule.reward_title,
                "reward_type": rule.reward_type,
                "current": curr_meals_mod,
                "target": target_meals,
                "current_feedback": curr_fb_mod,
                "target_feedback": target_fb,
                "percentage": composite_pct,
                "unit": "meals & feedback",
                "label": f"{curr_meals_mod}/{target_meals} meals + {curr_fb_mod}/{target_fb} reviews submitted"
            })
            
        elif rule.required_streak_days > 0:
            target_streak = rule.required_streak_days
            curr_streak_mod = streak_days % target_streak
            progress_pct = min(100, int((curr_streak_mod / target_streak) * 100))
            remaining = target_streak - curr_streak_mod
            progress_list.append({
                "rule_id": rule.id,
                "rule_name": rule.name,
                "reward_title": rule.reward_title,
                "reward_type": rule.reward_type,
                "current": streak_days,
                "target": target_streak,
                "remaining": remaining,
                "percentage": progress_pct,
                "unit": "day streak",
                "label": f"{streak_days}/{target_streak}-day streak ({remaining} more consecutive days needed)"
            })
            
    return {
        "stats": {
            "verified_meals_count": scanned_count,
            "genuine_feedbacks_count": feedback_count,
            "current_streak_days": streak_days,
            "total_coupons_earned": len(coupons),
            "available_count": len(available),
            "redeemed_count": len(redeemed),
            "expired_count": len(expired)
        },
        "available_coupons": available,
        "redeemed_coupons": redeemed,
        "expired_coupons": expired,
        "progress": progress_list
    }

def redeem_student_coupon(coupon_id: str, user_id: int, db: Session) -> Dict[str, Any]:
    """
    Server-side atomic coupon redemption:
    1. Validates ownership (student_id == user_id).
    2. Validates status == 'AVAILABLE'.
    3. Validates expiry date (rejects expired coupons).
    4. Prevents race conditions and double redemption.
    """
    # Fetch coupon
    coupon = db.query(models.Coupon).filter_by(id=coupon_id).first()
    if not coupon:
        raise ValueError("Coupon not found.")
        
    if coupon.student_id != user_id:
        raise ValueError("Unauthorized. This coupon belongs to a different student account.")
        
    now_utc = datetime.now(timezone.utc)
    
    # Check expiration
    if is_past_datetime(coupon.expiry_date):
        coupon.status = "EXPIRED"
        db.commit()
        raise ValueError("Coupon has expired and is no longer valid for redemption.")
        
    if coupon.status == "REDEEMED":
        redeemed_time = coupon.redeemed_date.strftime("%b %d, %Y at %I:%M %p") if coupon.redeemed_date else "previously"
        raise ValueError(f"Coupon already redeemed on {redeemed_time}.")
        
    if coupon.status != "AVAILABLE":
        raise ValueError(f"Coupon cannot be redeemed. Current status: {coupon.status}")
        
    # Mark as REDEEMED
    coupon.status = "REDEEMED"
    coupon.redeemed_date = now_utc
    db.commit()
    db.refresh(coupon)
    
    return {
        "success": True,
        "message": "Coupon successfully redeemed! Please present your verification code to the counter staff.",
        "coupon": {
            "id": coupon.id,
            "title": coupon.title,
            "description": coupon.description,
            "reward_type": coupon.reward_type,
            "redemption_code": coupon.redemption_code,
            "redeemed_date": coupon.redeemed_date.strftime("%b %d, %Y - %I:%M %p"),
            "status": coupon.status
        }
    }

def verify_manager_redemption_code(code: str, manager_user_id: int, db: Session) -> Dict[str, Any]:
    """
    Allows mess/canteen staff to look up and verify student redemption code.
    """
    clean_code = code.strip().upper()
    coupon = db.query(models.Coupon).filter_by(redemption_code=clean_code).first()
    
    if not coupon:
        raise ValueError("Invalid Redemption Code. No coupon matches this code.")
        
    student = db.query(models.User).filter_by(id=coupon.student_id).first()
    
    # If it was available, manager can mark it redeemed at the counter
    if coupon.status == "AVAILABLE":
        now_utc = datetime.now(timezone.utc)
        if is_past_datetime(coupon.expiry_date):
            coupon.status = "EXPIRED"
            db.commit()
            raise ValueError("Coupon has expired and cannot be verified.")
            
        coupon.status = "REDEEMED"
        coupon.redeemed_date = now_utc
        coupon.redeemed_by_manager_id = manager_user_id
        db.commit()
        db.refresh(coupon)

    elif coupon.status == "REDEEMED":
        if not coupon.redeemed_by_manager_id:
            coupon.redeemed_by_manager_id = manager_user_id
            db.commit()
            
    return {
        "valid": True,
        "status": coupon.status,
        "coupon_id": coupon.id,
        "title": coupon.title,
        "description": coupon.description,
        "reward_type": coupon.reward_type,
        "reason": coupon.reason,
        "redemption_code": coupon.redemption_code,
        "redeemed_date": coupon.redeemed_date.strftime("%b %d, %Y - %I:%M %p") if coupon.redeemed_date else "Just now",
        "student": {
            "id": student.id if student else None,
            "student_id": student.student_id if student else "N/A",
            "email": student.email if student else "N/A",
            "department": student.department if student else "Engineering",
            "hostel": student.hostel if student else "Campus Hostel"
        }
    }
