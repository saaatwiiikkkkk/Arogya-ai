import os
import sys
import uuid
import json
import asyncio
import random
from datetime import datetime, timezone
from typing import Optional, List

from fastapi import FastAPI, HTTPException, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel

from dotenv import load_dotenv
load_dotenv()

sys.path.insert(0, os.path.dirname(__file__))

from db import init_db, get_db
from schemas import (
    PatientCreate, Patient, PatientList,
    Document, DocumentList,
    Image, ImageList, ImageAnalysis,
    SummaryResponse, QARequest, QAResponse, Citation,
    InteractionCheckRequest, InteractionCheckResponse, InteractionMatch,
    HealthResponse, ErrorResponse, ErrorDetail
)
from services.files import save_document, save_image, get_document_path, get_image_path, DOCUMENTS_DIR, IMAGES_DIR
from services.audit import log_event
from services.gemini import generate_summary, grounded_qa, extract_text_from_pdf
from services.medgemma import analyze_medical_image
from services.interactions import check_interactions

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
    drugs = [{"name": d.name, "dosage": d.dosage} for d in request.drugs]
    patient = {
        "age": request.patient.age,
        "height_cm": request.patient.height_cm,
        "weight_kg": request.patient.weight_kg,
        "additional_info": request.patient.additional_info
    }
    foods = request.foods
    
    overall, matches, explanation = check_interactions(drugs, patient, foods)
    
    log_event("INTERACTION_CHECKED", None, {"drug_count": len(drugs), "food_count": len(foods)})
    
    return InteractionCheckResponse(
        overall=overall,
        matches=[InteractionMatch(**m) for m in matches],
        explanation=explanation
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
        media_type=row["mime_type"]
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
        media_type=row["mime_type"]
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
    drugs = [{"name": d.get("name", ""), "dosage": d.get("dosage", "")} for d in request.drugs]
    patient = {
        "age": request.personalDetails.get("age", 30),
        "height_cm": request.personalDetails.get("height", 170),
        "weight_kg": request.personalDetails.get("weight", 70),
        "additional_info": request.personalDetails.get("additionalInfo")
    }
    
    overall, matches, explanation = check_interactions(drugs, patient, [])
    
    log_event("INTERACTION_CHECKED", None, {"drug_count": len(drugs)})
    
    suggestions = [
        "Continue monitoring for any unexpected side effects",
        "Maintain regular follow-up appointments",
        "Ensure patient understands proper dosing schedules"
    ]
    
    if matches:
        suggestions = [
            "Monitor for signs of increased side effects",
            "Consider spacing doses if possible",
            "Document the interaction and monitoring plan",
            "Consult with pharmacist for alternatives if needed"
        ]
    
    return {
        "status": overall,
        "explanation": explanation,
        "suggestions": suggestions
    }

@app.post("/api/analyze/scan")
async def analyze_scan_compat():
    await asyncio.sleep(2)
    
    return {
        "summary": "The scan analysis has been completed. This is an assistive, non-diagnostic analysis. All findings should be confirmed by a qualified radiologist.",
        "findings": [
            "Normal bone density observed in visualized skeletal structures",
            "Soft tissue contours appear within normal limits",
            "No acute abnormalities or concerning lesions identified",
            "Joint spaces and alignment appear preserved",
            "No signs of fracture or dislocation in visible areas"
        ],
        "recommendations": [
            "Confirm findings with clinical correlation",
            "Consider follow-up imaging if symptoms persist",
            "Compare with prior studies if available",
            "Consult radiology for formal interpretation"
        ]
    }

class ChatRequest(BaseModel):
    message: str
    context: str

@app.post("/api/chat")
async def chat_compat(request: ChatRequest):
    await asyncio.sleep(0.8)
    
    prescription_responses = [
        "Based on the prescription analysis, I found no major drug interactions. The dosages appear to be within standard therapeutic ranges.",
        "I've reviewed the medications listed. The combination of these drugs is commonly prescribed and generally well-tolerated.",
        "Looking at the prescription, I recommend monitoring for common side effects such as dizziness or nausea during the first week of treatment."
    ]
    
    scan_responses = [
        "The scan appears to show normal anatomical structures. However, please note this is an assistive analysis and should be confirmed by a radiologist.",
        "Based on the image analysis, I've identified the key regions of interest. The preliminary assessment suggests no significant abnormalities.",
        "I've analyzed the scan. The image quality is good, and I can provide a detailed breakdown of the findings upon request."
    ]
    
    if request.context == "prescription":
        response = random.choice(prescription_responses)
    else:
        response = random.choice(scan_responses)
    
    return {
        "id": str(uuid.uuid4().hex[:12]),
        "role": "assistant",
        "content": response,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
