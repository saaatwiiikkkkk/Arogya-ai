from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ErrorDetail(BaseModel):
    code: str
    message: str
    details: dict = {}

class ErrorResponse(BaseModel):
    error: ErrorDetail

class PatientCreate(BaseModel):
    name: str
    phone: Optional[str] = None

class Patient(BaseModel):
    id: str
    name: str
    phone: Optional[str]
    created_at: str

class PatientList(BaseModel):
    items: List[Patient]

class Document(BaseModel):
    id: str
    patient_id: str
    filename: str
    mime_type: str
    submitted_at: str
    download_url: str

class DocumentList(BaseModel):
    items: List[Document]

class ImageAnalysis(BaseModel):
    result: str
    created_at: str

class Image(BaseModel):
    id: str
    patient_id: str
    filename: str
    mime_type: str
    submitted_at: str
    download_url: str
    analysis: Optional[ImageAnalysis] = None

class ImageList(BaseModel):
    items: List[Image]

class SummaryResponse(BaseModel):
    bullets: List[str]
    created_at: str

class QARequest(BaseModel):
    question: str

class Citation(BaseModel):
    doc: str
    note: Optional[str] = None

class QAResponse(BaseModel):
    answer: str
    citations: List[Citation]

class Drug(BaseModel):
    name: str
    dosage: str

class PatientInfo(BaseModel):
    age: int
    height_cm: float
    weight_kg: float
    additional_info: Optional[str] = None

class InteractionCheckRequest(BaseModel):
    drugs: List[Drug]
    patient: PatientInfo
    foods: List[str] = []

class InteractionMatch(BaseModel):
    type: str
    a: str
    b: str
    severity: Optional[str] = None
    note: Optional[str] = None

class InteractionCheckResponse(BaseModel):
    overall: str
    matches: List[InteractionMatch]
    explanation: str

class HealthResponse(BaseModel):
    status: str
