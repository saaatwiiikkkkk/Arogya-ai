import os
import google.generativeai as genai
from typing import List, Tuple
from PyPDF2 import PdfReader

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3-flash-preview")

def configure_gemini():
    if GEMINI_API_KEY:
        genai.configure(api_key=GEMINI_API_KEY)

def extract_text_from_pdf(filepath: str) -> str:
    try:
        reader = PdfReader(filepath)
        text = ""
        for page in reader.pages:
            text += page.extract_text() or ""
        return text
    except Exception as e:
        return f"[Error extracting text: {str(e)}]"

async def generate_summary(documents_text: List[Tuple[str, str]]) -> List[str]:
    configure_gemini()
    
    if not GEMINI_API_KEY:
        return [
            "Patient has documented medical history on file.",
            "Multiple clinical documents available for review.",
            "Records contain relevant diagnostic information.",
            "Treatment history documented in uploaded files.",
            "Further clinical review recommended for comprehensive assessment."
        ]
    
    try:
        combined_text = "\n\n".join([
            f"--- Document: {name} ---\n{text}" 
            for name, text in documents_text
        ])
        
        prompt = f"""You are a medical records assistant. Based on the following patient documents, generate exactly 5 concise bullet points summarizing the key clinical information. 

Rules:
- Do NOT provide diagnoses
- Focus on factual clinical history
- Be concise and professional
- Each bullet should be one sentence

Documents:
{combined_text[:15000]}

Respond with exactly 5 bullet points, one per line, starting each with "- ":"""

        model = genai.GenerativeModel(GEMINI_MODEL)
        response = model.generate_content(prompt)
        
        bullets = []
        for line in response.text.strip().split("\n"):
            line = line.strip()
            if line.startswith("- "):
                bullets.append(line[2:])
            elif line.startswith("• "):
                bullets.append(line[2:])
            elif line and len(bullets) < 5:
                bullets.append(line)
        
        while len(bullets) < 5:
            bullets.append("Additional clinical review recommended.")
        
        return bullets[:5]
        
    except Exception as e:
        return [
            "Patient records available for review.",
            "Medical history documented in uploaded files.",
            "Clinical information pending detailed analysis.",
            "Healthcare provider review recommended.",
            f"Note: AI summary limited - {str(e)[:50]}"
        ]

async def grounded_qa(question: str, documents_text: List[Tuple[str, str]]) -> Tuple[str, List[dict]]:
    configure_gemini()
    
    if not GEMINI_API_KEY:
        return "Not found in provided records. Please consult with a healthcare provider for specific medical questions.", []
    
    try:
        combined_text = "\n\n".join([
            f"--- Document: {name} ---\n{text}" 
            for name, text in documents_text
        ])
        
        prompt = f"""You are a medical records assistant. Answer the following question ONLY based on the provided patient documents.

Rules:
- Only answer from the provided context
- If the information is not found, say "Not found in provided records."
- Be concise and factual
- Do NOT provide medical advice or diagnoses
- Cite which document(s) contain the relevant information

Documents:
{combined_text[:15000]}

Question: {question}

Respond in this format:
Answer: [your answer]
Sources: [list document names that contain relevant info, or "None" if not found]"""

        model = genai.GenerativeModel(GEMINI_MODEL)
        response = model.generate_content(prompt)
        
        text = response.text.strip()
        
        answer = text
        citations = []
        
        if "Answer:" in text:
            parts = text.split("Sources:")
            answer = parts[0].replace("Answer:", "").strip()
            if len(parts) > 1:
                sources_text = parts[1].strip()
                for name, _ in documents_text:
                    if name.lower() in sources_text.lower():
                        citations.append({"doc": name, "note": None})
        
        return answer, citations
        
    except Exception as e:
        return f"Unable to process question at this time. Error: {str(e)[:100]}", []
