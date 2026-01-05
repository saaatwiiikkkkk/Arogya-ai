import os
import csv
from typing import List, Dict, Tuple

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
CSV_PATH = os.path.join(DATA_DIR, "data_final_v5.csv")

BUILTIN_INTERACTIONS = [
    {"drug_a": "warfarin", "drug_b": "aspirin", "severity": "major", "note": "Increased bleeding risk"},
    {"drug_a": "warfarin", "drug_b": "ibuprofen", "severity": "major", "note": "Increased bleeding risk"},
    {"drug_a": "metformin", "drug_b": "alcohol", "severity": "moderate", "note": "Risk of lactic acidosis"},
    {"drug_a": "lisinopril", "drug_b": "potassium", "severity": "moderate", "note": "Hyperkalemia risk"},
    {"drug_a": "simvastatin", "drug_b": "grapefruit", "severity": "moderate", "note": "Increased statin levels"},
    {"drug_a": "methotrexate", "drug_b": "nsaids", "severity": "major", "note": "Reduced methotrexate clearance"},
    {"drug_a": "digoxin", "drug_b": "amiodarone", "severity": "major", "note": "Digoxin toxicity risk"},
    {"drug_a": "ssri", "drug_b": "maoi", "severity": "contraindicated", "note": "Serotonin syndrome risk"},
    {"drug_a": "ciprofloxacin", "drug_b": "theophylline", "severity": "major", "note": "Theophylline toxicity"},
    {"drug_a": "fluconazole", "drug_b": "warfarin", "severity": "major", "note": "Increased INR/bleeding risk"},
]

FOOD_INTERACTIONS = [
    {"drug": "warfarin", "food": "vitamin k", "severity": "moderate", "note": "Reduced anticoagulant effect"},
    {"drug": "warfarin", "food": "green leafy vegetables", "severity": "moderate", "note": "High vitamin K content"},
    {"drug": "tetracycline", "food": "dairy", "severity": "moderate", "note": "Reduced absorption"},
    {"drug": "maoi", "food": "tyramine", "severity": "major", "note": "Hypertensive crisis risk"},
    {"drug": "statin", "food": "grapefruit", "severity": "moderate", "note": "Increased drug levels"},
    {"drug": "levothyroxine", "food": "calcium", "severity": "moderate", "note": "Reduced absorption"},
    {"drug": "metronidazole", "food": "alcohol", "severity": "major", "note": "Disulfiram-like reaction"},
]

def load_csv_interactions() -> List[Dict]:
    if os.path.exists(CSV_PATH):
        try:
            interactions = []
            with open(CSV_PATH, "r") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    interactions.append(row)
            return interactions
        except Exception:
            return []
    return []

def normalize_drug_name(name: str) -> str:
    return name.lower().strip()

def check_drug_drug_interactions(drugs: List[Dict]) -> List[Dict]:
    matches = []
    csv_interactions = load_csv_interactions()
    
    drug_names = [normalize_drug_name(d["name"]) for d in drugs]
    
    for i, drug_a in enumerate(drug_names):
        for j, drug_b in enumerate(drug_names):
            if i >= j:
                continue
            
            for interaction in BUILTIN_INTERACTIONS:
                ia = normalize_drug_name(interaction["drug_a"])
                ib = normalize_drug_name(interaction["drug_b"])
                
                if (ia in drug_a or drug_a in ia) and (ib in drug_b or drug_b in ib):
                    matches.append({
                        "type": "drug-drug",
                        "a": drugs[i]["name"],
                        "b": drugs[j]["name"],
                        "severity": interaction.get("severity"),
                        "note": interaction.get("note")
                    })
                elif (ib in drug_a or drug_a in ib) and (ia in drug_b or drug_b in ia):
                    matches.append({
                        "type": "drug-drug",
                        "a": drugs[i]["name"],
                        "b": drugs[j]["name"],
                        "severity": interaction.get("severity"),
                        "note": interaction.get("note")
                    })
            
            for csv_int in csv_interactions:
                csv_a = normalize_drug_name(csv_int.get("drug_a", ""))
                csv_b = normalize_drug_name(csv_int.get("drug_b", ""))
                
                if (csv_a in drug_a or drug_a in csv_a) and (csv_b in drug_b or drug_b in csv_b):
                    matches.append({
                        "type": "drug-drug",
                        "a": drugs[i]["name"],
                        "b": drugs[j]["name"],
                        "severity": csv_int.get("severity"),
                        "note": csv_int.get("description") or csv_int.get("note")
                    })
    
    return matches

def check_drug_food_interactions(drugs: List[Dict], foods: List[str]) -> List[Dict]:
    matches = []
    drug_names = [normalize_drug_name(d["name"]) for d in drugs]
    food_names = [f.lower().strip() for f in foods]
    
    for drug in drug_names:
        for food in food_names:
            for interaction in FOOD_INTERACTIONS:
                idrug = normalize_drug_name(interaction["drug"])
                ifood = interaction["food"].lower()
                
                if (idrug in drug or drug in idrug) and (ifood in food or food in ifood):
                    matches.append({
                        "type": "drug-food",
                        "a": drug,
                        "b": food,
                        "severity": interaction.get("severity"),
                        "note": interaction.get("note")
                    })
    
    return matches

def generate_explanation(matches: List[Dict], patient_info: Dict) -> str:
    if not matches:
        return "No significant drug interactions were identified based on the provided medications and foods. However, always consult with your healthcare provider or pharmacist before making any changes to your medication regimen."
    
    severity_order = {"contraindicated": 4, "major": 3, "moderate": 2, "minor": 1}
    max_severity = max(severity_order.get(m.get("severity", "").lower(), 0) for m in matches)
    
    explanations = []
    
    if max_severity >= 3:
        explanations.append("IMPORTANT: Significant drug interactions have been identified that require immediate attention from your healthcare provider.")
    else:
        explanations.append("Potential interactions have been identified. Please discuss these with your healthcare provider.")
    
    for match in matches[:5]:
        interaction_type = "Drug-drug" if match["type"] == "drug-drug" else "Drug-food"
        severity = match.get("severity", "unknown").capitalize()
        note = match.get("note", "Interaction noted")
        explanations.append(f"- {interaction_type} ({severity}): {match['a']} and {match['b']} - {note}")
    
    if patient_info.get("age", 0) > 65:
        explanations.append("Note: Patients over 65 may be more susceptible to drug interactions. Extra caution advised.")
    
    explanations.append("\nPlease consult with your clinician or pharmacist before making any changes to your medications.")
    
    return "\n".join(explanations)

def check_interactions(drugs: List[Dict], patient: Dict, foods: List[str]) -> Tuple[str, List[Dict], str]:
    drug_drug_matches = check_drug_drug_interactions(drugs)
    drug_food_matches = check_drug_food_interactions(drugs, foods)
    
    all_matches = drug_drug_matches + drug_food_matches
    
    if not all_matches:
        overall = "safe"
    else:
        severities = [m.get("severity", "").lower() for m in all_matches]
        if "contraindicated" in severities or "major" in severities:
            overall = "warning"
        else:
            overall = "warning"
    
    explanation = generate_explanation(all_matches, patient)
    
    return overall, all_matches, explanation
