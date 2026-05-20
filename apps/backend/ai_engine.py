# Simulated AI Prediction Engine
import math

def calculate_predicted_attendance(total_students: int, skipped_count: int, historical_absentee_rate: float = 0.05) -> int:
    """
    Simulates AI predicting the actual attendance.
    Base calculation: Total students - explicit skips - historical average of people who just don't show up.
    """
    expected_noshows = int(total_students * historical_absentee_rate)
    predicted = total_students - skipped_count - expected_noshows
    return max(0, predicted)

def generate_prep_sheet(predicted_attendance: int) -> list:
    """
    Calculates ingredient amounts needed based on predicted attendance.
    Standard portion sizes per person:
    - Rice: 100g (0.1 kg)
    - Dal: 50g (0.05 kg)
    - Paneer: 80g (0.08 kg)
    - Onion: 30g (0.03 kg)
    - Tomato: 30g (0.03 kg)
    """
    
    portions = {
        "RICE": {"category": "Grains", "unit": "KG", "per_person": 0.1},
        "DAL": {"category": "Legumes", "unit": "KG", "per_person": 0.05},
        "PANEER": {"category": "Dairy", "unit": "KG", "per_person": 0.08},
        "ONION": {"category": "Vegetables", "unit": "KG", "per_person": 0.03},
        "TOMATO": {"category": "Vegetables", "unit": "KG", "per_person": 0.03},
    }
    
    prep_sheet = []
    for item, data in portions.items():
        total_amount = round(predicted_attendance * data["per_person"], 2)
        prep_sheet.append({
            "ingredient": item,
            "category": data["category"],
            "unit": data["unit"],
            "amount": total_amount
        })
        
    return prep_sheet
