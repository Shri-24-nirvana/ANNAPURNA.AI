import datetime
import models, database, auth, ai_engine
from main import determine_meal_phase

def test_meal_phase_transitions():
    print("Testing Meal Phase Resolution Engine...")
    meal = models.Meal(
        institution_id=1,
        meal_type="LUNCH",
        start_hour=12,
        start_minute=30,
        end_hour=14,
        end_minute=0,
        cutoff_minutes_before_start=60
    )

    # 1. Before cutoff (e.g. 10:00 AM) -> PLANNING, cutoff not passed
    t1 = datetime.datetime.now().replace(hour=10, minute=0, second=0)
    res1 = determine_meal_phase(meal, ref_time=t1)
    assert res1["phase"] == "PLANNING"
    assert res1["is_cutoff_passed"] is False
    print("[OK] 10:00 AM -> Phase: PLANNING (Cutoff Open)")

    # 2. After cutoff, before start (e.g. 12:00 PM) -> PLANNING, cutoff passed (LOCKED)
    t2 = datetime.datetime.now().replace(hour=12, minute=0, second=0)
    res2 = determine_meal_phase(meal, ref_time=t2)
    assert res2["phase"] == "PLANNING"
    assert res2["is_cutoff_passed"] is True
    print("[OK] 12:00 PM -> Phase: PLANNING (Cutoff Locked)")

    # 3. During service window (e.g. 13:00 / 1:00 PM) -> ATTENDANCE
    t3 = datetime.datetime.now().replace(hour=13, minute=0, second=0)
    res3 = determine_meal_phase(meal, ref_time=t3)
    assert res3["phase"] == "ATTENDANCE"
    print("[OK] 01:00 PM -> Phase: ATTENDANCE")

    # 4. After service window (e.g. 15:00 / 3:00 PM) -> SUMMARY
    t4 = datetime.datetime.now().replace(hour=15, minute=0, second=0)
    res4 = determine_meal_phase(meal, ref_time=t4)
    assert res4["phase"] == "SUMMARY"
    print("[OK] 03:00 PM -> Phase: SUMMARY")

def test_raw_material_calculations():
    print("\nTesting Raw Material Calculation...")
    
    # Standard 2000 headcount with 100 skips
    pred = ai_engine.calculate_predicted_attendance(2000, 100)
    assert pred == 1805 # 1900 - 5% of 1900 (95) = 1805
    prep = ai_engine.generate_prep_sheet(pred, "LUNCH")
    
    rice = next(item for item in prep if "RICE" in item["ingredient"])
    assert rice["amount"] == round(1805 * 0.10, 2)
    print(f"[OK] 1,805 Predicted -> Rice: {rice['amount']} KG, Dal: {prep[1]['amount']} KG")

    # Edge Case: 0 headcount
    pred_zero = ai_engine.calculate_predicted_attendance(0, 0)
    assert pred_zero == 0
    prep_zero = ai_engine.generate_prep_sheet(0, "LUNCH")
    for item in prep_zero:
        assert item["amount"] == 0.0
    print("[OK] 0 Students Edge Case -> All raw material amounts = 0.0 KG without error")

    print("\nALL PHASE AND PLANNING TESTS PASSED!")

if __name__ == "__main__":
    test_meal_phase_transitions()
    test_raw_material_calculations()
