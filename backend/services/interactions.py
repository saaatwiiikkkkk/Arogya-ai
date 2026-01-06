import os
import json
import pandas as pd
from typing import List, Dict, Any

# Correct paths based on workspace structure
DATASET_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "dataset")
DRUG_SYNONYMS_PATH = os.path.join(DATASET_DIR, "drugs_synonyms.json")
INTERACTIONS_PATH = os.path.join(DATASET_DIR, "data_final_v5.csv")

class InteractionService:
    _instance = None
    _synonyms = {}
    _interactions_df = None
    _name_to_id_map = {}

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(InteractionService, cls).__new__(cls)
            cls._instance._load_data()
        return cls._instance

    def _load_data(self):
        print(f"Loading drug interaction data from {DATASET_DIR}...")
        try:
            # Load synonyms
            if os.path.exists(DRUG_SYNONYMS_PATH):
                with open(DRUG_SYNONYMS_PATH, "r", encoding="utf-8") as f:
                    self._synonyms = json.load(f)
                
                # Create reverse map: Name -> ID
                for drug_id, names in self._synonyms.items():
                    for name in names:
                        if name:
                            self._name_to_id_map[name.lower()] = drug_id
            else:
                print(f"Warning: Synonyms file not found at {DRUG_SYNONYMS_PATH}")

            # Load interactions CSV
            if os.path.exists(INTERACTIONS_PATH):
                # Using pandas for efficient querying
                # Assuming columns: ["Drug1", "Interaction", "Drug2", "Adverse Effects"]
                self._interactions_df = pd.read_csv(INTERACTIONS_PATH)
                
                # Clean up IDs in CSV if they have prefixes like "Compound::"
                self._interactions_df["Drug1"] = self._interactions_df["Drug1"].apply(lambda x: x.replace("Compound::", "") if isinstance(x, str) else x)
                self._interactions_df["Drug2"] = self._interactions_df["Drug2"].apply(lambda x: x.replace("Compound::", "") if isinstance(x, str) else x)
                
                print("Drug interaction data loaded successfully.")
            else:
                print(f"Warning: Interactions file not found at {INTERACTIONS_PATH}")
                self._interactions_df = pd.DataFrame(columns=["Drug1", "Interaction", "Drug2", "Adverse Effects"])

        except Exception as e:
            print(f"Error loading interaction data: {e}")
            # Initialize empty if failed to prevent crashes
            self._interactions_df = pd.DataFrame(columns=["Drug1", "Interaction", "Drug2", "Adverse Effects"])

    def get_drug_id(self, drug_name: str) -> str:
        return self._name_to_id_map.get(drug_name.lower())

    def check_interactions(self, drug_names: List[str]) -> List[Dict[str, Any]]:
        drug_ids = {}
        found_interactions = []

        # Resolve names to IDs
        for name in drug_names:
            drug_id = self.get_drug_id(name)
            if drug_id:
                drug_ids[drug_id] = name
            else:
                # Try fuzzy match or just keep name if no ID found? 
                # Without ID, we can not query the CSV which uses IDs.
                pass
        
        if len(drug_ids) < 2:
            return []

        ids_to_check = list(drug_ids.keys())
        
        if self._interactions_df is None or self._interactions_df.empty:
            return []

        # Query DataFrame
        # We want rows where Drug1 is in our list AND Drug2 is in our list
        mask = (
            (self._interactions_df["Drug1"].isin(ids_to_check)) & 
            (self._interactions_df["Drug2"].isin(ids_to_check))
        )
        
        results = self._interactions_df[mask]
        
        for _, row in results.iterrows():
            id1 = row["Drug1"]
            id2 = row["Drug2"]
            
            # Skip self-interactions if any
            if id1 == id2:
                continue

            interaction = {
                "drug1": drug_ids.get(id1, id1),
                "drug2": drug_ids.get(id2, id2),
                "description": row["Interaction"],
                "severity": "Moderate", # Defaulting as dataset does not specify
                "adverse_effects": row["Adverse Effects"] if pd.notna(row["Adverse Effects"]) else "Not specified"
            }
            found_interactions.append(interaction)
            
        return found_interactions

interaction_service = InteractionService()

