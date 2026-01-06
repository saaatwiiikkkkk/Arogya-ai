import os
import sys
import uuid
import json
import asyncio
import random
from datetime import datetime, timezone
from typing import Optional, List

from fastapi import FastAPI, HTTPException, UploadFile, File, Query, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel

from dotenv import load_dotenv
import pathlib

# Load .env from the root directory (parent of backend)
env_path = pathlib.Path(__file__).parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

sys.path.insert(0, os.path.dirname(__file__))

from db import init_db, get_db
from schemas import (
    PatientCreate, Patient, PatientList,
    Document, DocumentList,
    Image, ImageList, ImageAnalysis,
    SummaryResponse, QARequest, QAResponse, Citation,
    InteractionCheckRequest, InteractionCheckResponse, InteractionMatch,
    HealthResponse, ErrorResponse, ErrorDetail,
    UserCreate, UserLogin, AuthResponse
)
from services.files import save_document, save_image, get_document_path, get_image_path, DOCUMENTS_DIR, IMAGES_DIR
from services.audit import log_event
from services.gemini import generate_summary, grounded_qa, extract_text_from_pdf
from services.medgemma import analyze_medical_image
# from services.interactions import check_interactions
import bcrypt

def verify_password(plain_password, hashed_password):
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_password_hash(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

app = FastAPI(title="Arogya AI API", version="1.0.0")

CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5000,http://127.0.0.1:5000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS + ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    init_db()
    os.makedirs(DOCUMENTS_DIR, exist_ok=True)
    os.makedirs(IMAGES_DIR, exist_ok=True)

def make_error(code: str, message: str, details: dict = None):
    return JSONResponse(
        status_code=400 if code == "VALIDATION_ERROR" else 404 if code == "NOT_FOUND" else 500,
        content={"error": {"code": code, "message": message, "details": details or {}}}
    )

@app.get("/health", response_model=HealthResponse)
async def health():
    return {"status": "ok"}

@app.post("/api/auth/register", response_model=AuthResponse)
async def register(user: UserCreate):
    with get_db() as conn:
        cursor = conn.cursor()

        
        # Check if user exists
        cursor.execute("SELECT id FROM users WHERE username = ?", (user.username,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Username already registered")
        
        user_id = str(uuid.uuid4())
        hashed_password = get_password_hash(user.password)
        created_at = datetime.now(timezone.utc).isoformat()
        
        patient_id = None
        if user.role == "patient":
            # Create patient record automatically
            patient_id = f"pat_{uuid.uuid4().hex[:12]}"
            cursor.execute(
                "INSERT INTO patients (id, name, phone, created_at) VALUES (?, ?, ?, ?)",
                (patient_id, user.name or user.username, None, created_at)
            )
            
        cursor.execute(
            "INSERT INTO users (id, username, password_hash, role, patient_id, created_at) VALUES (?, ?, ?, ?, ?, ?)",
            (user_id, user.username, hashed_password, user.role, patient_id, created_at)
        )
        
        return AuthResponse(
            token="dummy-token", # In a real app, generate JWT here
            user_id=user_id,
            username=user.username,
            role=user.role,
            patient_id=patient_id
        )

@app.post("/api/auth/login", response_model=AuthResponse)
async def login(user: UserLogin):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, username, password_hash, role, patient_id FROM users WHERE username = ?", (user.username,))

        row = cursor.fetchone()
        
        if not row or not verify_password(user.password, row["password_hash"]):
            raise HTTPException(status_code=401, detail="Incorrect username or password")
            
        if user.role and user.role != row["role"]:
            raise HTTPException(status_code=403, detail=f"Access denied. This account is for {row['role']}s only.")

        return AuthResponse(
            token="dummy-token",
            user_id=row["id"],
            username=row["username"],
            role=row["role"],
            patient_id=row["patient_id"]
        )


@app.post("/patients", response_model=Patient, status_code=201)
async def create_patient(patient: PatientCreate):
    patient_id = f"pat_{uuid.uuid4().hex[:12]}"
    created_at = datetime.now(timezone.utc).isoformat()
    
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO patients (id, name, phone, created_at) VALUES (?, ?, ?, ?)",
            (patient_id, patient.name, patient.phone, created_at)
        )
    
    log_event("PATIENT_CREATED", patient_id, {"name": patient.name})
    
    return Patient(id=patient_id, name=patient.name, phone=patient.phone, created_at=created_at)

@app.get("/patients", response_model=PatientList)
async def list_patients():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, name, phone, created_at FROM patients ORDER BY created_at DESC")
        rows = cursor.fetchall()
    
    return PatientList(items=[
        Patient(id=row["id"], name=row["name"], phone=row["phone"], created_at=row["created_at"])
        for row in rows
    ])

@app.get("/patients/{patient_id}", response_model=Patient)
async def get_patient(patient_id: str):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, name, phone, created_at FROM patients WHERE id = ?", (patient_id,))
        row = cursor.fetchone()
    
    if not row:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    return Patient(id=row["id"], name=row["name"], phone=row["phone"], created_at=row["created_at"])

@app.post("/patients/{patient_id}/documents", response_model=Document, status_code=201)
async def upload_document(patient_id: str, file: UploadFile = File(...)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM patients WHERE id = ?", (patient_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Patient not found")
    
    doc_id = f"doc_{uuid.uuid4().hex[:12]}"
    submitted_at = datetime.now(timezone.utc).isoformat()
    
    storage_path = await save_document(file, doc_id)
    
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO documents (id, patient_id, filename, mime_type, submitted_at, storage_path) VALUES (?, ?, ?, ?, ?, ?)",
            (doc_id, patient_id, file.filename, file.content_type or "application/octet-stream", submitted_at, storage_path)
        )
    
    log_event("DOCUMENT_UPLOADED", patient_id, {"doc_id": doc_id, "filename": file.filename})
    
    return Document(
        id=doc_id,
        patient_id=patient_id,
        filename=file.filename,
        mime_type=file.content_type or "application/octet-stream",
        submitted_at=submitted_at,
        download_url=f"/files/documents/{doc_id}"
    )

@app.get("/patients/{patient_id}/documents", response_model=DocumentList)
async def list_documents(patient_id: str):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, patient_id, filename, mime_type, submitted_at FROM documents WHERE patient_id = ? ORDER BY submitted_at DESC",
            (patient_id,)
        )
        rows = cursor.fetchall()
    
    return DocumentList(items=[
        Document(
            id=row["id"],
            patient_id=row["patient_id"],
            filename=row["filename"],
            mime_type=row["mime_type"],
            submitted_at=row["submitted_at"],
            download_url=f"/files/documents/{row['id']}"
        )
        for row in rows
    ])

@app.post("/patients/{patient_id}/images", response_model=Image, status_code=201)
async def upload_image(patient_id: str, file: UploadFile = File(...)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM patients WHERE id = ?", (patient_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Patient not found")
    
    img_id = f"img_{uuid.uuid4().hex[:12]}"
    submitted_at = datetime.now(timezone.utc).isoformat()
    
    storage_path = await save_image(file, img_id)
    
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO images (id, patient_id, filename, mime_type, submitted_at, storage_path) VALUES (?, ?, ?, ?, ?, ?)",
            (img_id, patient_id, file.filename, file.content_type or "image/png", submitted_at, storage_path)
        )
    
    log_event("IMAGE_UPLOADED", patient_id, {"img_id": img_id, "filename": file.filename})
    
    return Image(
        id=img_id,
        patient_id=patient_id,
        filename=file.filename,
        mime_type=file.content_type or "image/png",
        submitted_at=submitted_at,
        download_url=f"/files/images/{img_id}"
    )

@app.get("/patients/{patient_id}/images", response_model=ImageList)
async def list_images(patient_id: str):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT i.id, i.patient_id, i.filename, i.mime_type, i.submitted_at,
                   ia.result as analysis_result, ia.created_at as analysis_created_at
            FROM images i
            LEFT JOIN image_analysis ia ON i.id = ia.image_id
            WHERE i.patient_id = ?
            ORDER BY i.submitted_at DESC
        """, (patient_id,))
        rows = cursor.fetchall()
    
    items = []
    for row in rows:
        analysis = None
        if row["analysis_result"]:
            analysis = ImageAnalysis(result=row["analysis_result"], created_at=row["analysis_created_at"])
        
        items.append(Image(
            id=row["id"],
            patient_id=row["patient_id"],
            filename=row["filename"],
            mime_type=row["mime_type"],
            submitted_at=row["submitted_at"],
            download_url=f"/files/images/{row['id']}",
            analysis=analysis
        ))
    
    return ImageList(items=items)

@app.post("/patients/{patient_id}/images/{image_id}/analyze", response_model=ImageAnalysis)
async def analyze_image(patient_id: str, image_id: str):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT storage_path FROM images WHERE id = ? AND patient_id = ?", (image_id, patient_id))
        row = cursor.fetchone()
    
    if not row:
        raise HTTPException(status_code=404, detail="Image not found")
    
    storage_path = row["storage_path"]
    
    result = await analyze_medical_image(storage_path)
    
    analysis_id = f"ana_{uuid.uuid4().hex[:12]}"
    created_at = datetime.now(timezone.utc).isoformat()
    
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO image_analysis (id, image_id, result, created_at) VALUES (?, ?, ?, ?)",
            (analysis_id, image_id, result, created_at)
        )
    
    log_event("IMAGE_ANALYZED", patient_id, {"image_id": image_id})
    
    return ImageAnalysis(result=result, created_at=created_at)

@app.post("/patients/{patient_id}/summary", response_model=SummaryResponse)
async def create_summary(patient_id: str):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM patients WHERE id = ?", (patient_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Patient not found")
        
        cursor.execute("SELECT id, filename, storage_path FROM documents WHERE patient_id = ?", (patient_id,))
        docs = cursor.fetchall()
    
    if not docs:
        return make_error("VALIDATION_ERROR", "No documents found for this patient")
    
    documents_text = []
    for doc in docs:
        if doc["storage_path"].endswith(".pdf"):
            text = extract_text_from_pdf(doc["storage_path"])
        else:
            try:
                with open(doc["storage_path"], "r") as f:
                    text = f.read()
            except:
                text = "[Unable to read document]"
        documents_text.append((doc["filename"], text))
    
    bullets = await generate_summary(documents_text)
    
    summary_id = f"sum_{uuid.uuid4().hex[:12]}"
    created_at = datetime.now(timezone.utc).isoformat()
    
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO summaries (id, patient_id, bullets_json, created_at) VALUES (?, ?, ?, ?)",
            (summary_id, patient_id, json.dumps(bullets), created_at)
        )
    
    log_event("SUMMARY_GENERATED", patient_id, {"summary_id": summary_id})
    
    return SummaryResponse(bullets=bullets, created_at=created_at)

@app.post("/patients/{patient_id}/qa", response_model=QAResponse)
async def patient_qa(patient_id: str, request: QARequest):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM patients WHERE id = ?", (patient_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Patient not found")
        
        cursor.execute("SELECT id, filename, storage_path FROM documents WHERE patient_id = ?", (patient_id,))
        docs = cursor.fetchall()
    
    if not docs:
        return make_error("VALIDATION_ERROR", "No documents found for this patient")
    
    documents_text = []
    for doc in docs:
        if doc["storage_path"].endswith(".pdf"):
            text = extract_text_from_pdf(doc["storage_path"])
        else:
            try:
                with open(doc["storage_path"], "r") as f:
                    text = f.read()
            except:
                text = "[Unable to read document]"
        documents_text.append((doc["filename"], text))
    
    answer, citations_data = await grounded_qa(request.question, documents_text)
    
    citations = [Citation(doc=c["doc"], note=c.get("note")) for c in citations_data]
    
    log_event("QA_ASKED", patient_id, {"question": request.question[:100]})
    
    return QAResponse(answer=answer, citations=citations)

@app.post("/safety/interactions/check", response_model=InteractionCheckResponse)
async def check_drug_interactions(request: InteractionCheckRequest):
    from services.interactions import interaction_service
    
    drug_names = [d.name for d in request.drugs]
    
    matches = interaction_service.check_interactions(drug_names)
    
    response_matches = []
    for m in matches:
        response_matches.append({
            "pair": [m['drug1'], m['drug2']],
            "severity": m['severity'],
            "description": m['description'],
            "source": "Database"
        })
    
    log_event("INTERACTION_CHECKED", None, {"drug_count": len(drug_names)})
    
    return InteractionCheckResponse(
        overall="warning" if matches else "safe",
        matches=[InteractionMatch(**m) for m in response_matches],
        explanation="Interactions found in database." if matches else "No interactions found."
    )

@app.get("/files/documents/{document_id}")
async def download_document(document_id: str):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT filename, storage_path, mime_type FROM documents WHERE id = ?", (document_id,))
        row = cursor.fetchone()
    
    if not row:
        raise HTTPException(status_code=404, detail="Document not found")
    
    return FileResponse(
        path=row["storage_path"],
        filename=row["filename"],
        media_type=row["mime_type"],
        content_disposition_type="inline"
    )

@app.get("/files/images/{image_id}")
async def download_image(image_id: str):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT filename, storage_path, mime_type FROM images WHERE id = ?", (image_id,))
        row = cursor.fetchone()
    
    if not row:
        raise HTTPException(status_code=404, detail="Image not found")
    
    return FileResponse(
        path=row["storage_path"],
        filename=row["filename"],
        media_type=row["mime_type"],
        content_disposition_type="inline"
    )

@app.get("/api/records/{patient_id}")
async def get_records_compat(patient_id: str):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, patient_id, filename, mime_type, submitted_at FROM documents WHERE patient_id = ? ORDER BY submitted_at DESC",
            (patient_id,)
        )
        docs = cursor.fetchall()
        
        cursor.execute(
            "SELECT id, patient_id, filename, mime_type, submitted_at FROM images WHERE patient_id = ? ORDER BY submitted_at DESC",
            (patient_id,)
        )
        images = cursor.fetchall()
    
    records = []
    for doc in docs:
        records.append({
            "id": doc["id"],
            "patientId": doc["patient_id"],
            "filename": doc["filename"],
            "fileType": doc["mime_type"],
            "uploadedAt": doc["submitted_at"]
        })
    for img in images:
        records.append({
            "id": img["id"],
            "patientId": img["patient_id"],
            "filename": img["filename"],
            "fileType": img["mime_type"],
            "uploadedAt": img["submitted_at"]
        })
    
    return records

@app.post("/api/records")
async def create_record_compat(request: dict):
    patient_id = request.get("patientId", "pat_default")
    filename = request.get("filename", "document")
    file_type = request.get("fileType", "application/octet-stream")
    
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM patients WHERE id = ?", (patient_id,))
        if not cursor.fetchone():
            pat_id = patient_id if patient_id.startswith("pat_") else f"pat_{patient_id}"
            created_at = datetime.now(timezone.utc).isoformat()
            cursor.execute(
                "INSERT INTO patients (id, name, phone, created_at) VALUES (?, ?, ?, ?)",
                (pat_id, f"Patient {patient_id}", None, created_at)
            )
            patient_id = pat_id
    
    doc_id = f"doc_{uuid.uuid4().hex[:12]}"
    submitted_at = datetime.now(timezone.utc).isoformat()
    storage_path = os.path.join(DOCUMENTS_DIR, f"{doc_id}.txt")
    
    with open(storage_path, "w") as f:
        f.write(f"Placeholder for {filename}")
    
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO documents (id, patient_id, filename, mime_type, submitted_at, storage_path) VALUES (?, ?, ?, ?, ?, ?)",
            (doc_id, patient_id, filename, file_type, submitted_at, storage_path)
        )
    
    log_event("DOCUMENT_UPLOADED", patient_id, {"doc_id": doc_id, "filename": filename})
    
    return {
        "id": doc_id,
        "patientId": patient_id,
        "filename": filename,
        "fileType": file_type,
        "uploadedAt": submitted_at
    }

class PrescriptionAnalysisRequest(BaseModel):
    text: Optional[str] = None

@app.post("/api/analyze/prescription-upload")
async def analyze_prescription_upload(file: UploadFile = File(...)):
    from services.gemini import configure_gemini, GEMINI_API_KEY, GEMINI_MODEL
    import google.generativeai as genai
    from PIL import Image
    import io
    
    if not GEMINI_API_KEY:
        return {
            "summary": "The prescription has been analyzed. This is a preliminary review - Gemini AI not configured.",
            "medications": [
                {"name": "Medication", "dosage": "As prescribed", "frequency": "As directed"}
            ],
            "warnings": ["Please consult with healthcare provider for complete analysis"],
            "recommendations": ["Configure GEMINI_API_KEY for AI-powered prescription analysis"]
        }
        
    try:
        configure_gemini()
        model = genai.GenerativeModel(GEMINI_MODEL)
        
        content = await file.read()
        
        image_part = None
        text_part = None
        
        if file.content_type.startswith("image/"):
            image = Image.open(io.BytesIO(content))
            image_part = image
        elif file.content_type == "application/pdf":
            # For PDF, we might need to extract text or convert to image
            # For simplicity in this demo, we'll try to extract text
            from services.gemini import extract_text_from_pdf_bytes
            text_part = extract_text_from_pdf_bytes(content)
        else:
            return JSONResponse(status_code=400, content={"error": "Unsupported file type"})

        prompt = """You are a clinical pharmacist assistant. Analyze this prescription image/text and extract the following information. Respond in valid JSON format only.

Respond with this exact JSON structure:
{
  "summary": "Brief summary of the prescription and clinical appropriateness",
  "medications": [
    {"name": "Drug name", "dosage": "Dosage amount", "frequency": "How often to take"}
  ],
  "warnings": ["List of warnings or precautions"],
  "recommendations": ["List of recommendations for the patient"]
}

Important: Only return the JSON object, no markdown or extra text."""

        inputs = [prompt]
        if image_part:
            inputs.append(image_part)
        elif text_part:
            inputs.append(text_part)
        else:
             return JSONResponse(status_code=400, content={"error": "Could not process file content"})

        response = model.generate_content(inputs)
        text = response.text.strip()
        
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        text = text.strip()
        
        import json
        result = json.loads(text)
        
        log_event("PRESCRIPTION_ANALYZED", None, {"method": "gemini-vision"})
        return result
        
    except Exception as e:
        log_event("PRESCRIPTION_ANALYSIS_ERROR", None, {"error": str(e)[:100]})
        return {
            "summary": f"Analysis error: {str(e)[:50]}",
            "medications": [],
            "warnings": ["Error during analysis"],
            "recommendations": ["Please try again"]
        }

@app.post("/api/analyze/prescription")
async def analyze_prescription_compat(request: PrescriptionAnalysisRequest = None):
    from services.gemini import configure_gemini, GEMINI_API_KEY, GEMINI_MODEL
    import google.generativeai as genai
    
    prescription_text = request.text if request and request.text else "Standard prescription for review"
    
    if not GEMINI_API_KEY:
        return {
            "summary": "The prescription has been analyzed. This is a preliminary review - Gemini AI not configured.",
            "medications": [
                {"name": "Medication", "dosage": "As prescribed", "frequency": "As directed"}
            ],
            "warnings": ["Please consult with healthcare provider for complete analysis"],
            "recommendations": ["Configure GEMINI_API_KEY for AI-powered prescription analysis"]
        }
    
    try:
        configure_gemini()
        model = genai.GenerativeModel(GEMINI_MODEL)
        
        prompt = f"""You are a clinical pharmacist assistant. Analyze this prescription and extract the following information. Respond in valid JSON format only.

Prescription text: {prescription_text}

Respond with this exact JSON structure:
{{
  "summary": "Brief summary of the prescription and clinical appropriateness",
  "medications": [
    {{"name": "Drug name", "dosage": "Dosage amount", "frequency": "How often to take"}}
  ],
  "warnings": ["List of warnings or precautions"],
  "recommendations": ["List of recommendations for the patient"]
}}

Important: Only return the JSON object, no markdown or extra text."""

        response = model.generate_content(prompt)
        text = response.text.strip()
        
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        text = text.strip()
        
        import json
        result = json.loads(text)
        
        log_event("PRESCRIPTION_ANALYZED", None, {"method": "gemini"})
        return result
        
    except Exception as e:
        log_event("PRESCRIPTION_ANALYSIS_ERROR", None, {"error": str(e)[:100]})
        return {
            "summary": f"Prescription received for analysis. AI analysis encountered an issue: {str(e)[:50]}",
            "medications": [{"name": "See prescription", "dosage": "As written", "frequency": "As directed"}],
            "warnings": ["Manual review recommended"],
            "recommendations": ["Consult with pharmacist for detailed analysis"]
        }

class DrugInteractionCompatRequest(BaseModel):
    drugs: List[dict]
    personalDetails: dict

@app.post("/api/analyze/drug-interactions")
async def analyze_drug_interactions_compat(request: DrugInteractionCompatRequest):
    import google.generativeai as genai
    from services.interactions import interaction_service
    
    # Load environment variables properly
    import pathlib
    env_path = pathlib.Path(__file__).parent.parent / '.env'
    from dotenv import load_dotenv
    load_dotenv(dotenv_path=env_path)

    api_key = os.getenv("GEMINI_API_KEY")
    model_name = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")

    drugs = [{"name": d.get("name", ""), "dosage": d.get("dosage", "")} for d in request.drugs]
    drug_names = [d["name"] for d in drugs if d["name"]]
    
    # 1. Check local dataset
    found_interactions = interaction_service.check_interactions(drug_names)
    
    # 2. Prepare prompt for Gemini
    patient_details = request.personalDetails
    
    prompt = f"""
    Analyze the following drug interactions for a patient.
    
    Patient Details:
    - Age: {patient_details.get('age')}
    - Weight: {patient_details.get('weight')} {patient_details.get('weightUnit')}
    - Height: {patient_details.get('height')} {patient_details.get('heightUnit')}
    - Additional Info: {patient_details.get('additionalInfo')}
    
    Drugs:
    {json.dumps(drugs, indent=2)}
    
    Interactions found in database:
    {json.dumps(found_interactions, indent=2)}
    
    Task:
    1. Review the drugs and the found interactions.
    2. If database interactions are found, explain them clearly.
    3. If NO database interactions are found, use your internal knowledge to double-check for any missed interactions.
    4. Provide a clinical summary.
    5. Provide a list of actionable suggestions.
    6. Determine the overall status: "safe", "warning", or "danger".
    
    Output Format (JSON):
    {{
        "status": "safe" | "warning" | "danger",
        "explanation": "Detailed clinical explanation...",
        "suggestions": ["Suggestion 1", "Suggestion 2", ...]
    }}
    """
    
    log_event("INTERACTION_CHECKED", None, {"drug_count": len(drugs), "database_matches": len(found_interactions)})

    if not api_key:
        # Fallback if no API key
        return {
            "status": "warning" if found_interactions else "safe",
            "explanation": "Gemini API key not configured. Showing database results only. " + 
                           (f"Found {len(found_interactions)} interactions: " + ", ".join([i['description'] for i in found_interactions]) if found_interactions else "No interactions found in local database."),
            "suggestions": ["Configure Gemini API key for full analysis", "Consult a pharmacist"]
        }

    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(model_name)
        response = model.generate_content(prompt)
        
        # Parse JSON from response
        text = response.text.strip()
        # Clean up markdown code blocks if present
        if text.startswith("```json"):
            text = text[7:]
        if text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        
        result = json.loads(text)
        return result
        
    except Exception as e:
        print(f"Gemini Error: {e}")
        return {
            "status": "warning",
            "explanation": f"Error during AI analysis: {str(e)}. Database found {len(found_interactions)} interactions.",
            "suggestions": ["Consult a pharmacist manually"]
        }

@app.post("/api/analyze/scan")
async def analyze_scan_compat(file: UploadFile = File(...)):
    import google.generativeai as genai
    from services.medgemma import analyze_medical_image
    
    # Load environment variables properly
    import pathlib
    env_path = pathlib.Path(__file__).parent.parent / '.env'
    from dotenv import load_dotenv
    load_dotenv(dotenv_path=env_path)

    api_key = os.getenv("GEMINI_API_KEY")
    model_name = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
    
    # 1. Save file temporarily
    temp_filename = f"temp_scan_{uuid.uuid4()}.{file.filename.split('.')[-1]}"
    temp_path = os.path.join(IMAGES_DIR, temp_filename)
    
    try:
        with open(temp_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
            
        # Check if we have a valid HF token
        hf_token = os.getenv("HF_TOKEN")
        use_hf = hf_token and hf_token != "your_huggingface_token_here"

        if not api_key:
            return {
                "summary": "Gemini API key missing.",
                "findings": ["Please configure GEMINI_API_KEY in .env"],
                "recommendations": ["System configuration required"]
            }
            
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(model_name)
        
        if use_hf:
            # 2a. Analyze with Hugging Face (MedGemma)
            hf_analysis = await analyze_medical_image(temp_path)
            
            # Additional check: If MedGemma failed (returned None) or returned Mock data signature
            if hf_analysis is None or "Appears to be brain MRI scan" in hf_analysis:
                print("MedGemma failed or returned mock. Falling back to Gemini.")
                use_hf = False 
            
        if use_hf:
            prompt = f"""
            You are a helpful radiology assistant.
            
            I have an initial analysis of a medical scan from an AI model (MedGemma/HuggingFace).
            
            Initial Analysis:
            "{hf_analysis}"
            
            Task:
            1. Summarize this analysis into a clear, professional medical report.
            2. Extract key findings as a list.
            3. Provide standard recommendations for next steps (e.g., clinical correlation).
            4. Ensure the tone is assistive and non-diagnostic.
            
            Output Format (JSON):
            {{
                "summary": "Clear summary paragraph...",
                "findings": ["Finding 1", "Finding 2", ...],
                "recommendations": ["Recommendation 1", "Recommendation 2", ...]
            }}
            """
            response = model.generate_content(prompt)
        else:
            # 2b. Analyze directly with Gemini Vision
            print("HF_TOKEN missing or default. Using Gemini Vision directly.")
            import PIL.Image
            img = PIL.Image.open(temp_path)
            
            prompt = """
            You are an expert medical imaging assistant.
            Analyze this medical image (MRI, X-ray, or CT scan) with high attention to detail.
            
            Task:
            1. Identify the modality (MRI, CT, X-ray) and the body part.
            2. CAREFULLY inspect for any masses, tumors, lesions, fractures, or asymmetries.
            3. If you see a distinct anomaly (like a white mass in a brain MRI), describe it clearly.
            4. Provide a professional summary.
            5. List key findings (both normal and abnormal).
            6. Provide recommendations.
            
            IMPORTANT: 
            - Do not be overly conservative. If an anomaly is clearly visible, report it as a "visible abnormality" or "lesion" while maintaining that this is not a final diagnosis.
            - State clearly that this is an AI-assisted screening and NOT a diagnostic result.
            
            Output Format (JSON):
            {
                "summary": "Detailed summary including any abnormalities...",
                "findings": ["Finding 1", "Finding 2 (e.g., 'Hyperintense mass observed in left hemisphere')", ...],
                "recommendations": ["Recommendation 1", "Recommendation 2", ...]
            }
            """
            response = model.generate_content([prompt, img])
        text = response.text.strip()
        
        # Clean up markdown
        if text.startswith("```json"):
            text = text[7:]
        if text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
            
        return json.loads(text)

    except Exception as e:
        print(f"Scan Analysis Error: {e}")
        import traceback
        traceback.print_exc()
        # Return 500 error code so frontend knows it failed
        return JSONResponse(
            status_code=500,
            content={
                "error": str(e),
                "summary": "Error during analysis. Please check server logs.",
                "findings": ["Analysis failed independent of image content"],
                "recommendations": ["Contact administrator"]
            }
        )
    finally:
        # Cleanup
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception as e:
                print(f"Cleanup Error (Ignored): {e}")

class ChatRequest(BaseModel):
    message: str
    context: str
    analysis_context: Optional[str] = None

@app.post("/api/chat/vision")
async def chat_vision(file: UploadFile = File(...), question: str = Form(...)):
    import google.generativeai as genai
    import PIL.Image
    import io

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return JSONResponse(status_code=500, content={"error": "GEMINI_API_KEY not configured"})

    try:
        genai.configure(api_key=api_key)
        # Use a vision-capable model
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        content = await file.read()
        image = PIL.Image.open(io.BytesIO(content))
        
        prompt = f"You are a medical assistant. Answer this question about the image: {question}. \n\nLanguage Rule: Answer in the same language as the question (English, Telugu, Tanglish)."
        
        response = model.generate_content([prompt, image])
        return {"answer": response.text}
    except Exception as e:
        print(f"Vision Error: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.post("/api/chat")
async def chat_compat(request: ChatRequest):
    import google.generativeai as genai
    
    # Load environment variables properly
    import pathlib
    env_path = pathlib.Path(__file__).parent.parent / '.env'
    from dotenv import load_dotenv
    load_dotenv(dotenv_path=env_path)

    api_key = os.getenv("GEMINI_API_KEY")
    model_name = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
    
    if not api_key:
        fallback_responses = {
            "prescription": "I can help analyze prescriptions. Please configure GEMINI_API_KEY for AI-powered responses.",
            "scan": "I can help analyze medical scans. Please configure GEMINI_API_KEY for AI-powered responses."
        }
        return {
            "id": str(uuid.uuid4().hex[:12]),
            "role": "assistant",
            "content": fallback_responses.get(request.context, "How can I assist you today?"),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(model_name)
        
        context_prompts = {
            "prescription": "You are a helpful clinical pharmacist assistant. Answer questions about prescriptions, medications, dosages, and drug safety. Be concise and professional.",
            "scan": "You are a helpful radiology assistant. Answer questions about medical imaging, scan interpretations, and imaging procedures. Always note that your analysis is assistive and non-diagnostic."
        }
        
        system_prompt = context_prompts.get(request.context, "You are a helpful medical assistant. Be concise and professional.")
        
        additional_context = ""
        if request.analysis_context:
            additional_context = f"\n\nContext from analysis:\n{request.analysis_context}"

        prompt = f"""{system_prompt}{additional_context}

User question: {request.message}

Provide a helpful, concise response. Do not provide specific diagnoses - always recommend consulting with healthcare providers for medical decisions."""

        response = model.generate_content(prompt)
        
        return {
            "id": str(uuid.uuid4().hex[:12]),
            "role": "assistant",
            "content": response.text.strip(),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        
    except Exception as e:
        print(f"Chat error: {type(e).__name__}: {str(e)}")
        return {
            "id": str(uuid.uuid4().hex[:12]),
            "role": "assistant",
            "content": f"I apologize, but I encountered an issue processing your request. Please try again.",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
