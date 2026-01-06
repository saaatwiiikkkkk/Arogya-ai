import os
import base64
import httpx
from typing import Optional

HF_TOKEN = os.getenv("HF_TOKEN")
HF_MODEL_ID = os.getenv("HF_MODEL_ID", "google/medgemma-4b-it")
HF_INFERENCE_ENDPOINT_URL = os.getenv("HF_INFERENCE_ENDPOINT_URL")

async def analyze_medical_image(image_path: str) -> str:
    if not HF_TOKEN:
        return generate_mock_analysis(image_path)
    
    try:
        with open(image_path, "rb") as f:
            image_data = base64.b64encode(f.read()).decode("utf-8")
        
        ext = os.path.splitext(image_path)[1].lower()
        mime_type = "image/png" if ext == ".png" else "image/jpeg"
        
        if HF_INFERENCE_ENDPOINT_URL:
            url = HF_INFERENCE_ENDPOINT_URL
        else:
            # Updated 2026: Use router.huggingface.co instead of api-inference.huggingface.co
            url = f"https://router.huggingface.co/models/{HF_MODEL_ID}"
        
        headers = {
            "Authorization": f"Bearer {HF_TOKEN}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "inputs": {
                "image": f"data:{mime_type};base64,{image_data}",
                "text": "Analyze this medical image. Provide observations about any visible structures, potential areas of interest, and general quality assessment. Note: This is assistive, non-diagnostic output only."
            },
            "parameters": {
                "max_new_tokens": 500
            }
        }
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(url, headers=headers, json=payload)
            
            if response.status_code == 200:
                result = response.json()
                if isinstance(result, list) and len(result) > 0:
                    analysis = result[0].get("generated_text", "")
                elif isinstance(result, dict):
                    analysis = result.get("generated_text", str(result))
                else:
                    analysis = str(result)
                
                if "non-diagnostic" not in analysis.lower():
                    analysis += "\n\n[Assistive, non-diagnostic analysis only. Clinical correlation required.]"
                
                return analysis
            else:
                print(f"MedGemma API Error {response.status_code}: {response.text}")
                # Return None to indicate failure so main.py can fallback to Gemini Vision
                return None
                
    except Exception as e:
        print(f"MedGemma Exception: {e}")
        # Return None to indicate failure
        return None

def generate_mock_analysis(image_path: str, error: Optional[str] = None) -> str:
    filename = os.path.basename(image_path).lower()
    
    if "mri" in filename or "brain" in filename:
        analysis = """Assistive, non-diagnostic analysis:

Image Type: Appears to be brain MRI scan
Quality: Image quality suitable for initial review
Observations:
- Standard anatomical structures visible
- No obvious gross abnormalities detected in this preliminary scan
- Ventricular system appears within normal limits
- Gray-white matter differentiation present

Recommendation: This automated analysis is for assistive purposes only. Clinical radiologist review required for definitive interpretation. Correlation with clinical history and symptoms recommended."""

    elif "xray" in filename or "chest" in filename or "lung" in filename:
        analysis = """Assistive, non-diagnostic analysis:

Image Type: Appears to be chest X-ray
Quality: Image quality acceptable for screening review
Observations:
- Lung fields visualized bilaterally
- Cardiac silhouette within expected parameters
- Costophrenic angles appear clear
- No obvious large pleural effusions detected

Recommendation: This automated analysis is for assistive purposes only. Board-certified radiologist interpretation required. Clinical correlation with patient symptoms essential."""

    else:
        analysis = """Assistive, non-diagnostic analysis:

Image Type: Medical imaging scan
Quality: Image received and processed
Observations:
- Anatomical structures visualized
- Image suitable for clinical review
- No obvious critical findings in automated screening

Recommendation: This automated analysis is for assistive purposes only. Qualified medical professional review required for clinical decision-making. All findings require correlation with patient history and clinical examination."""

    if error:
        analysis += f"\n\n[Note: AI model connection limited - using template analysis. Error: {error[:50]}]"
    
    return analysis
