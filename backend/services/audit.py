import uuid
import json
from datetime import datetime, timezone
from db import get_db

def log_event(event_type: str, patient_id: str = None, payload: dict = None):
    event_id = f"aud_{uuid.uuid4().hex[:12]}"
    created_at = datetime.now(timezone.utc).isoformat()
    
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO audit_logs (id, patient_id, event_type, payload_json, created_at)
            VALUES (?, ?, ?, ?, ?)
        """, (event_id, patient_id, event_type, json.dumps(payload or {}), created_at))
    
    return event_id
