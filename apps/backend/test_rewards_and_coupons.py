import unittest
from datetime import datetime, timezone, timedelta, date
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

import models
import database
import rewards_engine

class TestRewardsAndCoupons(unittest.TestCase):
    def setUp(self):
        # In-memory SQLite for clean isolated testing
        self.engine = create_engine("sqlite:///:memory:")
        models.Base.metadata.create_all(bind=self.engine)
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
        self.db = self.SessionLocal()

        # Seed institution
        self.inst = models.Institution(
            id=1,
            name="Test Campus Mess",
            subscription_plan="ENTERPRISE",
            total_students=1000,
            onboarding_status="ACTIVE",
            qr_secret="test_secret_123"
        )
        self.db.add(self.inst)

        # Seed test student
        self.student = models.User(
            id=10,
            role="student",
            institution_id=1,
            student_id="ET10001",
            email="student10@test.com",
            password_hash="fake_hash"
        )
        self.db.add(self.student)

        # Seed test manager
        self.manager = models.User(
            id=99,
            role="manager",
            institution_id=1,
            email="manager@test.com",
            password_hash="fake_hash"
        )
        self.db.add(self.manager)

        # Seed meal
        self.meal = models.Meal(
            id=1,
            institution_id=1,
            meal_type="LUNCH",
            menu_items="Dal, Rice, Paneer",
            scheduled_time=datetime.now(timezone.utc)
        )
        self.db.add(self.meal)
        self.db.commit()

        # Seed default reward rules
        rewards_engine.seed_default_reward_rules(self.db)

    def tearDown(self):
        self.db.close()

    def test_default_rules_seeded(self):
        rules = self.db.query(models.RewardRule).all()
        self.assertEqual(len(rules), 3)
        rule_ids = [r.id for r in rules]
        self.assertIn("rule_10_meals", rule_ids)
        self.assertIn("rule_20_meals_10_feedbacks", rule_ids)
        self.assertIn("rule_7_day_streak", rule_ids)

    def test_coupon_granted_at_10_meals(self):
        # 1. Add 9 scanned meals across 3 days (3 meals/day) -> streak is 3 days -> 0 coupons
        for i in range(9):
            day_offset = i // 3
            att = models.Attendance(
                user_id=self.student.id,
                meal_id=self.meal.id,
                status="SCANNED",
                verified_at=datetime.now(timezone.utc) - timedelta(days=day_offset, hours=i % 3)
            )
            self.db.add(att)
        self.db.commit()

        coupons = rewards_engine.evaluate_and_grant_rewards(self.student.id, self.db)
        self.assertEqual(len(coupons), 0)

        # 2. Add 10th scanned meal -> 1 coupon granted
        att10 = models.Attendance(
            user_id=self.student.id,
            meal_id=self.meal.id,
            status="SCANNED",
            verified_at=datetime.now(timezone.utc)
        )
        self.db.add(att10)
        self.db.commit()

        coupons = rewards_engine.evaluate_and_grant_rewards(self.student.id, self.db)
        self.assertEqual(len(coupons), 1)
        self.assertEqual(coupons[0].reward_type, "FREE_COFFEE")
        self.assertEqual(coupons[0].milestone_cycle, 1)
        self.assertEqual(coupons[0].status, "AVAILABLE")
        self.assertTrue(coupons[0].redemption_code.startswith("ANN-"))


    def test_duplicate_prevention_on_same_milestone(self):
        # Add 10 scans
        for i in range(10):
            self.db.add(models.Attendance(
                user_id=self.student.id,
                meal_id=self.meal.id,
                status="SCANNED",
                verified_at=datetime.now(timezone.utc)
            ))
        self.db.commit()

        # First evaluation grants 1 coupon
        c1 = rewards_engine.evaluate_and_grant_rewards(self.student.id, self.db)
        self.assertEqual(len(c1), 1)

        # Second evaluation with 10 or 11 scans should NOT grant duplicate coupon
        self.db.add(models.Attendance(
            user_id=self.student.id,
            meal_id=self.meal.id,
            status="SCANNED",
            verified_at=datetime.now(timezone.utc)
        ))
        self.db.commit()
        c2 = rewards_engine.evaluate_and_grant_rewards(self.student.id, self.db)
        self.assertEqual(len(c2), 0)

        all_coupons = self.db.query(models.Coupon).filter_by(student_id=self.student.id, rule_id="rule_10_meals").all()
        self.assertEqual(len(all_coupons), 1)

    def test_composite_rule_meals_and_feedback(self):
        # 20 meals + 10 feedbacks
        for i in range(20):
            self.db.add(models.Attendance(
                user_id=self.student.id,
                meal_id=self.meal.id,
                status="SCANNED",
                verified_at=datetime.now(timezone.utc)
            ))
        for j in range(10):
            self.db.add(models.Feedback(
                institution_id=1,
                user_id=self.student.id,
                meal_id=self.meal.id,
                rating=5,
                comment=f"Genuine detailed review #{j} regarding food taste and cleanliness."
            ))
        self.db.commit()

        coupons = rewards_engine.evaluate_and_grant_rewards(self.student.id, self.db)
        # Should grant 10-meal rule (cycles 1 and 2 = 2 coffee coupons) + composite rule (1 free meal coupon)
        types = [c.reward_type for c in coupons]
        self.assertIn("FREE_COFFEE", types)
        self.assertIn("FREE_MEAL", types)

    def test_streak_calculation_and_reward(self):
        today = date.today()
        # Add 7 consecutive days of verified meals
        for i in range(7):
            day = today - timedelta(days=i)
            dt = datetime(day.year, day.month, day.day, 12, 30, tzinfo=timezone.utc)
            self.db.add(models.Attendance(
                user_id=self.student.id,
                meal_id=self.meal.id,
                status="SCANNED",
                verified_at=dt
            ))
        self.db.commit()

        streak = rewards_engine.get_student_attendance_streak_days(self.student.id, self.db)
        self.assertEqual(streak, 7)

        coupons = rewards_engine.evaluate_and_grant_rewards(self.student.id, self.db)
        streak_coupons = [c for c in coupons if c.reward_type == "BONUS_DESSERT"]
        self.assertEqual(len(streak_coupons), 1)
        self.assertIn("7-day consecutive", streak_coupons[0].reason)

    def test_redemption_validation_and_double_redemption_prevention(self):
        # Create available coupon
        now = datetime.now(timezone.utc)
        coupon = models.Coupon(
            id="CPN-COFFEE-TEST1",
            student_id=self.student.id,
            rule_id="rule_10_meals",
            reward_type="FREE_COFFEE",
            title="Free Coffee",
            description="Free coffee coupon",
            status="AVAILABLE",
            earned_date=now,
            expiry_date=now + timedelta(days=30),
            reason="10 meals attended",
            redemption_code="ANN-9999-AA",
            milestone_cycle=1
        )
        self.db.add(coupon)
        self.db.commit()

        # 1. Successful redemption
        res = rewards_engine.redeem_student_coupon("CPN-COFFEE-TEST1", self.student.id, self.db)
        self.assertTrue(res["success"])
        self.assertEqual(res["coupon"]["status"], "REDEEMED")

        # 2. Second redemption attempt must fail
        with self.assertRaises(ValueError) as ctx:
            rewards_engine.redeem_student_coupon("CPN-COFFEE-TEST1", self.student.id, self.db)
        self.assertIn("already redeemed", str(ctx.exception).lower())

    def test_expired_coupon_cannot_be_redeemed(self):
        now = datetime.now(timezone.utc)
        expired_coupon = models.Coupon(
            id="CPN-COFFEE-EXP1",
            student_id=self.student.id,
            rule_id="rule_10_meals",
            reward_type="FREE_COFFEE",
            title="Free Coffee",
            description="Expired coupon",
            status="AVAILABLE",
            earned_date=now - timedelta(days=40),
            expiry_date=now - timedelta(days=10),
            reason="10 meals attended",
            redemption_code="ANN-1111-EX",
            milestone_cycle=1
        )
        self.db.add(expired_coupon)
        self.db.commit()

        with self.assertRaises(ValueError) as ctx:
            rewards_engine.redeem_student_coupon("CPN-COFFEE-EXP1", self.student.id, self.db)
        self.assertIn("expired", str(ctx.exception).lower())

    def test_manager_code_verification(self):
        now = datetime.now(timezone.utc)
        coupon = models.Coupon(
            id="CPN-COFFEE-MGR1",
            student_id=self.student.id,
            rule_id="rule_10_meals",
            reward_type="FREE_COFFEE",
            title="Free Coffee",
            description="Manager verification test",
            status="AVAILABLE",
            earned_date=now,
            expiry_date=now + timedelta(days=30),
            reason="10 meals attended",
            redemption_code="ANN-7777-ZZ",
            milestone_cycle=1
        )
        self.db.add(coupon)
        self.db.commit()

        res = rewards_engine.verify_manager_redemption_code("ANN-7777-ZZ", self.manager.id, self.db)
        self.assertTrue(res["valid"])
        self.assertEqual(res["student"]["student_id"], "ET10001")
        self.assertEqual(res["status"], "REDEEMED")

if __name__ == "__main__":
    unittest.main()
