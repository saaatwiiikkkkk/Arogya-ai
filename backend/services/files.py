import os
import uuid
import aiofiles
from fastapi import UploadFile

STORAGE_BASE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "storage")
DOCUMENTS_DIR = os.path.join(STORAGE_BASE, "documents")
IMAGES_DIR = os.path.join(STORAGE_BASE, "images")

os.makedirs(DOCUMENTS_DIR, exist_ok=True)
os.makedirs(IMAGES_DIR, exist_ok=True)

async def save_document(file: UploadFile, doc_id: str) -> str:
    ext = os.path.splitext(file.filename)[1] if file.filename else ""
    filename = f"{doc_id}{ext}"
    filepath = os.path.join(DOCUMENTS_DIR, filename)
    
    async with aiofiles.open(filepath, "wb") as f:
        content = await file.read()
        await f.write(content)
    
    return filepath

async def save_image(file: UploadFile, img_id: str) -> str:
    ext = os.path.splitext(file.filename)[1] if file.filename else ""
    filename = f"{img_id}{ext}"
    filepath = os.path.join(IMAGES_DIR, filename)
    
    async with aiofiles.open(filepath, "wb") as f:
        content = await file.read()
        await f.write(content)
    
    return filepath

def get_document_path(storage_path: str) -> str:
    return storage_path

def get_image_path(storage_path: str) -> str:
    return storage_path
