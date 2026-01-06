import sqlite3
import os
from contextlib import contextmanager

DB_PATH = os.path.join(os.path.dirname(__file__), "arogya.db")

def get_connection():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

@contextmanager
def get_db():
    conn = get_connection()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

def init_db():
    with get_db() as conn:
        cursor = conn.cursor()
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                username TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL,
                patient_id TEXT,
                created_at TEXT NOT NULL
            )
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS patients (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                phone TEXT NULL,
                created_at TEXT NOT NULL
            )
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS documents (
                id TEXT PRIMARY KEY,
                patient_id TEXT NOT NULL,
                filename TEXT NOT NULL,
                mime_type TEXT NOT NULL,
                submitted_at TEXT NOT NULL,
                storage_path TEXT NOT NULL,
                FOREIGN KEY (patient_id) REFERENCES patients (id)
            )
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS images (
                id TEXT PRIMARY KEY,
                patient_id TEXT NOT NULL,
                filename TEXT NOT NULL,
                mime_type TEXT NOT NULL,
                submitted_at TEXT NOT NULL,
                storage_path TEXT NOT NULL,
                FOREIGN KEY (patient_id) REFERENCES patients (id)
            )
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS image_analysis (
                id TEXT PRIMARY KEY,
                image_id TEXT NOT NULL,
                result TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (image_id) REFERENCES images (id)
            )
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS summaries (
                id TEXT PRIMARY KEY,
                patient_id TEXT NOT NULL,
                bullets_json TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (patient_id) REFERENCES patients (id)
            )
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS audit_logs (
                id TEXT PRIMARY KEY,
                patient_id TEXT NULL,
                event_type TEXT NOT NULL,
                payload_json TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
        """)
        
        conn.commit()
