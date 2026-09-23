# AI Prediction and Raw Material Allocation Engine
import math

# Standard ingredient portion recipes per person (in KG)
MEAL_RECIPES = {
    "BREAKFAST": {
        "WHEAT FLOUR (ATTA)": {"category": "Grains", "unit": "KG", "per_person": 0.08},
        "POTATOES": {"category": "Vegetables", "unit": "KG", "per_person": 0.07},
        "CURD / YOGURT": {"category": "Dairy", "unit": "KG", "per_person": 0.06},
        "TEA LEAVES & SPICES": {"category": "Beverages", "unit": "KG", "per_person": 0.015},
        "COOKING OIL / GHEE": {"category": "Oils & Fats", "unit": "L", "per_person": 0.02},
    },
    "LUNCH": {
        "BASMATI RICE": {"category": "Grains", "unit": "KG", "per_person": 0.10},
        "YELLOW DAL / TOOR": {"category": "Legumes", "unit": "KG", "per_person": 0.05},
        "FRESH PANEER": {"category": "Dairy", "unit": "KG", "per_person": 0.08},
        "ONIONS": {"category": "Vegetables", "unit": "KG", "per_person": 0.03},
        "TOMATOES": {"category": "Vegetables", "unit": "KG", "per_person": 0.03},
        "WHEAT FLOUR (NAAN/ROTI)": {"category": "Grains", "unit": "KG", "per_person": 0.06},
    },
    "DINNER": {
        "BASMATI RICE": {"category": "Grains", "unit": "KG", "per_person": 0.09},
        "CHICKEN / PANEER": {"category": "Poultry / Dairy", "unit": "KG", "per_person": 0.11},
        "WHEAT FLOUR (ROTI)": {"category": "Grains", "unit": "KG", "per_person": 0.08},
        "CUCUMBER & SALAD": {"category": "Produce", "unit": "KG", "per_person": 0.04},
        "GRAVY SPICES & OIL": {"category": "Spices & Oils", "unit": "KG", "per_person": 0.025},
    }
}

def calculate_predicted_attendance(total_students: int, skipped_count: int, historical_absentee_rate: float = 0.05) -> int:
    """
    Simulates AI predicting the actual attendance based on enrolled, skips, and absentee buffers.
    """
    if total_students <= 0:
        return 0
    opted_in = max(0, total_students - skipped_count)
    expected_noshows = int(opted_in * historical_absentee_rate)
    predicted = max(0, opted_in - expected_noshows)
    return predicted

def generate_prep_sheet(predicted_attendance: int, meal_type: str = "LUNCH") -> list:
    """
    Calculates ingredient amounts needed based on predicted attendance and meal recipe.
    """
    meal_key = meal_type.upper() if meal_type else "LUNCH"
    recipe = MEAL_RECIPES.get(meal_key, MEAL_RECIPES["LUNCH"])
    
    prep_sheet = []
    for item, data in recipe.items():
        total_amount = round(max(0, predicted_attendance) * data["per_person"], 2)
        prep_sheet.append({
            "ingredient": item,
            "category": data["category"],
            "unit": data["unit"],
            "amount": total_amount,
            "per_person": data["per_person"]
        })
        
    return prep_sheet
