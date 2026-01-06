# 🏥 Arogya AI - Intelligent Clinical Safety Platform

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Python](https://img.shields.io/badge/python-3.11+-yellow.svg)
![Node](https://img.shields.io/badge/node-18+-green.svg)
![React](https://img.shields.io/badge/react-18-blue.svg)

**Empowering Healthcare Providers and Patients with AI-Driven Medical Insights**

[Features](#-key-features) • [Tech Stack](#-technology-stack) • [Installation](#-installation-guide) • [Architecture](#-system-architecture)

</div>

---

## 📋 Table of Contents

- [Problem Statement](#-problem-statement)
- [Why It Matters](#-why-it-matters)
- [Our Solution](#-our-solution)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Technology Stack](#-technology-stack)
- [Installation Guide](#-installation-guide)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Problem Statement

Healthcare professionals face critical challenges in their daily practice:

- **📝 Prescription Safety**: Manual verification of prescriptions is time-consuming and prone to human error
- **⚠️ Drug Interactions**: Complex drug interaction checks require extensive knowledge and cross-referencing
- **🔬 Medical Imaging Analysis**: Radiological scan interpretation requires specialized expertise and can be time-intensive
- **📊 Patient Record Management**: Fragmented medical records make it difficult to access comprehensive patient histories
- **💊 Medication Errors**: Adverse drug reactions and medication errors contribute to significant healthcare costs and patient harm

According to studies, **medication errors affect 1.5 million people annually** in the US alone, with many being preventable through proper verification and interaction checking systems.

---

## 💡 Why It Matters

### For Healthcare Providers 👨‍⚕️👩‍⚕️

- **Enhanced Patient Safety**: AI-powered verification catches potential medication errors before they reach patients
- **Clinical Decision Support**: Real-time drug interaction analysis helps make safer prescribing decisions
- **Time Efficiency**: Automated document summarization and scan analysis save valuable clinical time
- **Comprehensive Insights**: Quick access to patient medical history enables better-informed treatment decisions
- **Reduced Liability**: Systematic safety checks reduce the risk of medical errors and associated liabilities

### For Patients 🧑‍🤝‍🧑

- **Transparency**: Easy access to their medical records and AI-generated summaries
- **Understanding**: AI chat assistant helps patients understand their prescriptions and medical reports
- **Empowerment**: Better informed about their medications and potential interactions
- **Accessibility**: 24/7 access to medical document storage and AI assistance
- **Safety**: Additional layer of verification for their medications and treatments

### Global Impact 🌍

- **Preventable Harm Reduction**: AI verification systems can reduce medication errors by up to 50%
- **Healthcare Cost Savings**: Preventing adverse drug events saves billions in healthcare costs annually
- **Accessibility**: Makes expert-level medical analysis more accessible to underserved communities
- **Scalability**: One platform can serve thousands of patients and healthcare providers simultaneously
- **Data-Driven Healthcare**: Aggregated insights can improve overall healthcare delivery and research

---

## 🚀 Our Solution

**Arogya AI** is a comprehensive, AI-powered clinical safety platform that serves as an intelligent layer between healthcare providers and patients. By leveraging cutting-edge AI technologies, we provide:

### 🤖 AI-Powered Analysis

- **Google Gemini 2.5 Flash**: Advanced natural language processing for prescription analysis, document summarization, and intelligent chat assistance
- **MedGemma 4B**: Specialized medical imaging model for analyzing X-rays, MRIs, and CT scans
- **Grounded QA**: Evidence-based question answering with citations from medical documents

### 🔐 Secure & Compliant

- Role-based access control (Doctor/Patient portals)
- Secure document and image storage
- Comprehensive audit logging for all medical actions
- HIPAA-ready architecture (with production enhancements)

### 🎨 Modern User Experience

- Intuitive, responsive design that works on all devices
- Dark/Light theme support for comfortable viewing
- Real-time AI chat assistance
- Drag-and-drop file uploads
- Interactive step-by-step wizards

---

## ✨ Key Features

### 🩺 For Doctors

#### 1. **Patient Records Management**
- 🔍 **Smart Search**: Quickly find patients by ID or name
- 📑 **Comprehensive History**: View complete medical records in organized cards
- 📊 **AI Summaries**: Auto-generated summaries of patient documents
- 📈 **Timeline View**: Chronological organization of medical events

#### 2. **AI Prescription Verifier**
- 📷 **Multi-Format Upload**: Support for images (JPG, PNG) and PDF documents
- 🤖 **Intelligent OCR**: Extract text from prescription images using AI
- 💊 **Medication Detection**: Automatically identify medications, dosages, and frequencies
- ⚠️ **Safety Alerts**: Flag potential issues, contraindications, and dosing concerns
- 💬 **Interactive Chat**: Ask follow-up questions about prescriptions in real-time
- 📋 **Structured Reports**: Clear, organized analysis with actionable insights

#### 3. **Drug Interaction Checker**
- 🧪 **3-Step Wizard Interface**:
  - **Step 1**: Enter or select multiple medications
  - **Step 2**: AI analyzes potential interactions
  - **Step 3**: View detailed interaction report with severity levels
- 🚨 **Severity Classification**: High, Moderate, Low, and Informational interactions
- 📝 **Clinical Recommendations**: Evidence-based suggestions for each interaction
- 💾 **Export Reports**: Save interaction analyses for patient records

#### 4. **Medical Scan Analysis**
- 🔬 **MRI/X-ray/CT Support**: Upload and analyze various imaging modalities
- 🎯 **AI-Powered Findings**: MedGemma identifies anatomical structures and abnormalities
- 📊 **Confidence Scoring**: Each finding includes a confidence level
- 🩹 **Recommendations**: AI-generated next steps and clinical considerations
- 💭 **Radiology Chat**: Ask questions about scan findings
- 📎 **Image Annotations**: Visual markers for identified regions of interest

### 🧑‍🤝‍🧑 For Patients

#### 1. **Upload Medical Records**
- 📤 **Drag-and-Drop Interface**: Effortless file uploads
- 📄 **Multiple Formats**: Support for PDFs, images (JPG, PNG)
- 🤖 **Automatic AI Processing**: Instant analysis and summarization
- 📱 **Mobile Friendly**: Upload from phone or camera
- ✅ **Upload Confirmation**: Real-time feedback on successful uploads

#### 2. **My Documents Portal**
- 📚 **Organized Library**: All medical documents in one place
- 👁️ **Quick Preview**: View document summaries without downloading
- ⬇️ **Easy Download**: One-click download of original files
- 🗓️ **Date Sorting**: Chronologically organized for easy navigation
- 🔍 **Search & Filter**: Find specific documents quickly

### 🌐 Universal Features

- 🌓 **Theme Toggle**: Dark/Light mode for eye comfort
- 📱 **Fully Responsive**: Seamless experience on desktop, tablet, and mobile
- 🔔 **Toast Notifications**: Non-intrusive feedback for all actions
- ⚡ **Fast Performance**: Optimized loading with React Query caching
- ♿ **Accessible**: WCAG compliant interface design
- 🔄 **Real-time Updates**: Instant synchronization across the platform

---

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   React 18   │  │  TanStack    │  │   Wouter     │         │
│  │  TypeScript  │  │ React Query  │  │   Router     │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                  │
│  ┌──────────────────────────────────────────────────────┐      │
│  │            shadcn/ui + Tailwind CSS                   │      │
│  │        (Doctor Dashboard | Patient Portal)            │      │
│  └──────────────────────────────────────────────────────┘      │
└────────────────────────┬─────────────────────────────────────────┘
                         │ HTTP/REST
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MIDDLEWARE LAYER                              │
│                                                                  │
│  ┌──────────────────────────────────────────────────────┐      │
│  │         Express.js Server (Port 5000)                 │      │
│  │    • API Proxy to FastAPI                             │      │
│  │    • Static File Serving                              │      │
│  │    • Vite Dev Server Integration                      │      │
│  │    • WhatsApp Bot Integration (Future)                │      │
│  └──────────────────────────────────────────────────────┘      │
└────────────────────────┬─────────────────────────────────────────┘
                         │ Proxy
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND LAYER                                 │
│                                                                  │
│  ┌──────────────────────────────────────────────────────┐      │
│  │         FastAPI Backend (Port 8000)                   │      │
│  │    • RESTful API Endpoints                            │      │
│  │    • Business Logic                                   │      │
│  │    • File Upload/Download Management                  │      │
│  │    • Authentication & Authorization                   │      │
│  └──────────────────────────────────────────────────────┘      │
│                         │                                        │
│         ┌───────────────┼───────────────┐                       │
│         ▼               ▼               ▼                       │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐                   │
│  │ Database │   │   AI     │   │  File    │                   │
│  │ Service  │   │ Services │   │  Storage │                   │
│  └──────────┘   └──────────┘   └──────────┘                   │
└─────────────────────────────────────────────────────────────────┘
         │                 │                │
         ▼                 ▼                ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   SQLite     │  │  Google      │  │   Local      │
│   Database   │  │  Gemini      │  │   Storage    │
│  (arogya.db) │  │  2.5 Flash   │  │   (docs/     │
└──────────────┘  │              │  │    images)   │
                  │  MedGemma    │  └──────────────┘
                  │  4B Model    │
                  └──────────────┘
```

### Data Flow

#### 1. **Prescription Analysis Flow**
```
User Upload → Express Proxy → FastAPI → File Storage
                                  ↓
                            Gemini API → OCR & Analysis
                                  ↓
                            Structured Response → Frontend
```

#### 2. **Medical Scan Analysis Flow**
```
Image Upload → Express Proxy → FastAPI → Image Storage
                                  ↓
                         MedGemma API → Image Analysis
                                  ↓
                         Findings + Recommendations → Frontend
```

#### 3. **Patient Record Flow**
```
Search Request → Express Proxy → FastAPI → SQLite Query
                                             ↓
                                       Fetch Documents
                                             ↓
                                    Gemini Summarization
                                             ↓
                                   Aggregated Response → Frontend
```

### Database Schema

```
┌─────────────┐       ┌──────────────┐       ┌──────────────┐
│   users     │       │   patients   │       │  documents   │
├─────────────┤       ├──────────────┤       ├──────────────┤
│ id          │       │ id           │◄──────│ patient_id   │
│ username    │       │ name         │       │ filename     │
│ password_   │       │ phone        │       │ file_path    │
│ role        │       │ created_at   │       │ ai_summary   │
│ patient_id  │───────►              │       │ created_at   │
│ created_at  │       └──────────────┘       └──────────────┘
└─────────────┘                │
                               │
                               │
                               ▼
                        ┌──────────────┐
                        │   images     │
                        ├──────────────┤
                        │ id           │
                        │ patient_id   │
                        │ filename     │
                        │ file_path    │
                        │ ai_analysis  │
                        │ created_at   │
                        └──────────────┘
```

---

## 🛠️ Technology Stack

### Frontend Technologies

| Technology | Purpose | Version |
|------------|---------|---------|
| **⚛️ React** | UI Framework | 18.3.1 |
| **📘 TypeScript** | Type Safety | 5.6.3 |
| **⚡ Vite** | Build Tool & Dev Server | 6.0.7 |
| **🎨 Tailwind CSS** | Styling | 3.4.17 |
| **🧩 shadcn/ui** | Component Library | Latest |
| **🔍 TanStack Query** | Data Fetching & Caching | 5.60.5 |
| **🗺️ Wouter** | Client-side Routing | 3.4.3 |
| **✅ Zod** | Schema Validation | 3.24.1 |
| **📝 React Hook Form** | Form Management | 7.54.2 |
| **🎭 Framer Motion** | Animations | 11.18.0 |
| **🎯 Lucide React** | Icon Library | 0.469.0 |

### Backend Technologies

| Technology | Purpose | Version |
|------------|---------|---------|
| **🐍 Python** | Backend Language | 3.11+ |
| **⚡ FastAPI** | REST API Framework | 0.109.2 |
| **🦄 Uvicorn** | ASGI Server | 0.27.1 |
| **🟢 Node.js** | Middleware Server | 18+ |
| **📦 Express.js** | Proxy Server | 4.21.2 |
| **💾 SQLite** | Database | 3.x |
| **🔐 bcrypt** | Password Hashing | Latest |

### AI & Machine Learning

| Service | Purpose | Model |
|---------|---------|-------|
| **🤖 Google Gemini** | Text Analysis, Chat, Summarization | gemini-2.5-flash |
| **🏥 MedGemma** | Medical Image Analysis | google/medgemma-4b-it |
| **🔬 Hugging Face** | Model Hosting & Inference | Inference API |

### Development Tools

| Tool | Purpose |
|------|---------|
| **📦 npm/pnpm** | Package Management |
| **🔧 tsx** | TypeScript Execution |
| **🎨 PostCSS** | CSS Processing |
| **🗃️ Drizzle ORM** | Schema Definitions |
| **🔄 cross-env** | Environment Variables |

---

## 📥 Installation Guide

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **Python** (v3.11 or higher) - [Download](https://www.python.org/)
- **npm** or **pnpm** - Comes with Node.js
- **Git** - [Download](https://git-scm.com/)

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd Arogya-AI
```

### Step 2: Install Node.js Dependencies

```bash
npm install
# or
pnpm install
```

### Step 3: Install Python Dependencies

```bash
pip install -r backend/requirements.txt
```

Or install individually:

```bash
pip install fastapi uvicorn python-dotenv python-multipart pydantic aiofiles httpx google-generativeai PyPDF2 huggingface-hub Pillow bcrypt
```

### Step 4: Download the Dataset

⚠️ **Important**: The dataset is required for the AI to function properly but is not included in the repository due to its size.

**Download the dataset and place it in the project root:**

1. Download the dataset from: [Dataset Link]
2. Extract the downloaded files into a `dataset/` folder in the project root
3. Ensure the following files are present:
   - `dataset/data_final_v5.csv`
   - `dataset/drug_info.json`
   - `dataset/drugs_synonyms.json`
   - `dataset/all_id_interaction.csv`

```
Arogya-AI/
├── dataset/
│   ├── data_final_v5.csv
│   ├── drug_info.json
│   ├── drugs_synonyms.json
│   └── all_id_interaction.csv
```

### Step 5: Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# Required API Keys
GEMINI_API_KEY=your_gemini_api_key_here
HF_TOKEN=your_huggingface_token_here

# Optional Configuration
GEMINI_MODEL=gemini-2.5-flash
HF_MODEL_ID=google/medgemma-4b-it
CORS_ORIGINS=http://localhost:5000,http://127.0.0.1:5000
PORT=8000
SESSION_SECRET=your_session_secret_here
```

#### Getting API Keys:

1. **Google Gemini API Key**:
   - Visit [Google AI Studio](https://aistudio.google.com/apikey)
   - Sign in with your Google account
   - Create a new API key
   - Copy and paste into `.env`

2. **Hugging Face Token**:
   - Visit [Hugging Face Settings](https://huggingface.co/settings/tokens)
   - Create a new access token
   - Ensure it has read access to `google/medgemma-4b-it`
   - Copy and paste into `.env`

### Step 6: Initialize the Database

The database will be automatically created on first run. To manually initialize:

```bash
python backend/db.py
```

### Step 7: Start the Development Server

```bash
npm run dev
```

This single command will:
- ✅ Start the FastAPI backend on `http://localhost:8000`
- ✅ Start the Express proxy server on `http://localhost:5000`
- ✅ Launch the Vite development server
- ✅ Open your browser automatically

### Step 8: Access the Application

Open your browser and navigate to:

```
http://localhost:5000
```

You should see the Arogya AI landing page! 🎉

---

## � WhatsApp Bot Setup (Optional)

Arogya AI includes a WhatsApp integration for patient interactions. Follow these steps to enable it:

### Prerequisites

- A WhatsApp Business Account
- Meta Developer Account
- WhatsApp Business API Access

### Setup Steps

1. **Create a Meta Developer App**:
   - Visit [Meta for Developers](https://developers.facebook.com/)
   - Create a new app and add WhatsApp product
   - Get your WhatsApp Business Account ID

2. **Configure Webhook**:
   - Set your webhook URL to: `https://your-domain.com/whatsapp/webhook`
   - Add a verify token in your `.env` file
   - Subscribe to `messages` webhook events

3. **Add Environment Variables**:

Update your `.env` file with:

```env
# WhatsApp Configuration
WHATSAPP_ACCESS_TOKEN=your_whatsapp_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_VERIFY_TOKEN=your_webhook_verify_token
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id
```

4. **Enable WhatsApp Routes**:

The WhatsApp webhook is already configured in [server/whatsapp.ts](server/whatsapp.ts). The bot will:
- Respond to patient queries about prescriptions
- Provide medication information
- Answer health-related questions using Gemini AI
- Send automated reminders (if configured)

5. **Test the Integration**:
   - Send a test message to your WhatsApp Business number
   - The bot should respond with AI-generated assistance

### WhatsApp Bot Features

- 🤖 **AI-Powered Responses**: Uses Gemini 2.5 Flash for intelligent replies
- 💊 **Drug Information**: Provides details about medications
- 📋 **Prescription Queries**: Answers questions about prescriptions
- ⚕️ **Health Assistance**: General health information and guidance
- 🔔 **Reminders**: Medication reminders (configure in patient portal)

**Note**: WhatsApp Business API may have costs associated with message volumes. Check Meta's pricing for details.

---

## �🗂️ Project Structure

```
Arogya-AI/
│
├── 📂 backend/                      # Python FastAPI Backend
│   ├── main.py                      # Main FastAPI application
│   ├── db.py                        # Database initialization & models
│   ├── schemas.py                   # Pydantic schemas
│   ├── requirements.txt             # Python dependencies
│   ├── arogya.db                    # SQLite database (auto-generated)
│   │
│   ├── 📂 services/                 # Business logic services
│   │   ├── __init__.py
│   │   ├── gemini.py                # Google Gemini integration
│   │   ├── medgemma.py              # MedGemma image analysis
│   │   ├── files.py                 # File upload/download handlers
│   │   ├── audit.py                 # Audit logging service
│   │   └── interactions.py          # Drug interaction checking
│   │
│   └── 📂 storage/                  # File storage
│       ├── documents/               # Patient documents (PDFs, etc.)
│       └── images/                  # Medical images (MRI, X-ray, CT)
│
├── 📂 client/                       # React Frontend
│   ├── index.html                   # HTML entry point
│   │
│   └── 📂 src/
│       ├── main.tsx                 # React app entry point
│       ├── App.tsx                  # Main app component & routing
│       ├── index.css                # Global styles & Tailwind
│       │
│       ├── 📂 components/           # Reusable components
│       │   ├── chatbot.tsx          # AI chatbot component
│       │   ├── file-upload.tsx      # File upload component
│       │   ├── doctor-layout.tsx    # Doctor dashboard layout
│       │   ├── patient-layout.tsx   # Patient dashboard layout
│       │   ├── theme-provider.tsx   # Theme context provider
│       │   ├── theme-toggle.tsx     # Dark/Light mode toggle
│       │   │
│       │   └── 📂 ui/               # shadcn/ui components
│       │       ├── button.tsx
│       │       ├── card.tsx
│       │       ├── dialog.tsx
│       │       ├── input.tsx
│       │       └── ... (30+ components)
│       │
│       ├── 📂 hooks/                # Custom React hooks
│       │   ├── use-toast.ts
│       │   ├── use-mobile.tsx
│       │   └── use-theme.tsx
│       │
│       ├── 📂 lib/                  # Utility libraries
│       │   ├── auth.tsx             # Authentication context
│       │   ├── queryClient.ts       # React Query setup
│       │   ├── records-store.ts     # Local storage management
│       │   └── utils.ts             # Helper functions
│       │
│       └── 📂 pages/                # Page components
│           ├── landing.tsx          # Landing page
│           ├── auth.tsx             # Login/Register page
│           ├── not-found.tsx        # 404 page
│           │
│           ├── 📂 doctor/           # Doctor dashboard pages
│           │   ├── index.tsx
│           │   ├── records.tsx
│           │   ├── prescription-verifier.tsx
│           │   ├── drug-interactions.tsx
│           │   └── scans.tsx
│           │
│           └── 📂 patient/          # Patient portal pages
│               ├── index.tsx
│               ├── upload.tsx
│               └── documents.tsx
│
├── 📂 server/                       # Express.js Middleware
│   ├── index.ts                     # Server entry point
│   ├── routes.ts                    # API proxy routes
│   ├── vite.ts                      # Vite integration
│   ├── storage.ts                   # In-memory storage
│   ├── static.ts                    # Static file serving
│   └── whatsapp.ts                  # WhatsApp bot (future)
│
├── 📂 shared/                       # Shared code
│   └── schema.ts                    # TypeScript types & Zod schemas
│
├── 📂 dataset/                      # Medical datasets
│   ├── data_final_v5.csv
│   ├── all_id_interaction.csv
│   ├── drug_info.json
│   └── drugs_synonyms.json
│
├── 📂 script/                       # Build scripts
│   └── build.ts                     # Production build script
│
├── 📄 package.json                  # Node.js dependencies
├── 📄 tsconfig.json                 # TypeScript configuration
├── 📄 vite.config.ts                # Vite configuration
├── 📄 tailwind.config.ts            # Tailwind CSS configuration
├── 📄 postcss.config.js             # PostCSS configuration
├── 📄 components.json               # shadcn/ui configuration
├── 📄 drizzle.config.ts             # Drizzle ORM configuration
├── 📄 .env                          # Environment variables (create this)
├── 📄 design_guidelines.md          # UI/UX design specs
├── 📄 replit.md                     # Quick reference guide
└── 📄 README.md                     # This file
```

---

## 📚 API Documentation

### Base URLs

- **Development**: `http://localhost:5000/api`
- **FastAPI Direct**: `http://localhost:8000`

### Authentication

All patient-specific endpoints require authentication (via frontend auth context).

### Endpoints

#### Health Check

```http
GET /health
```

**Response**:
```json
{
  "status": "ok"
}
```

---

#### Patient Management

##### Create Patient
```http
POST /patients
Content-Type: application/json

{
  "name": "John Doe",
  "phone": "+1234567890"
}
```

##### Get Patient by ID
```http
GET /patients/{patient_id}
```

##### List All Patients
```http
GET /patients
```

---

#### Document Management

##### Upload Document
```http
POST /patients/{patient_id}/documents
Content-Type: multipart/form-data

file: [PDF/Image File]
```

**Response**:
```json
{
  "id": "doc_123",
  "filename": "prescription.pdf",
  "ai_summary": ["Medication history documented...", "..."],
  "created_at": "2026-01-06T12:00:00Z"
}
```

##### List Patient Documents
```http
GET /patients/{patient_id}/documents
```

##### Download Document
```http
GET /documents/{document_id}/download
```

---

#### AI Analysis

##### Prescription Analysis
```http
POST /api/analyze/prescription
Content-Type: multipart/form-data

file: [Prescription Image/PDF]
```

**Response**:
```json
{
  "medications": [
    {
      "name": "Amoxicillin",
      "dosage": "500mg",
      "frequency": "3 times daily",
      "duration": "7 days"
    }
  ],
  "warnings": ["Take with food"],
  "analysis": "Prescription appears standard..."
}
```

##### Medical Scan Analysis
```http
POST /api/analyze/scan
Content-Type: multipart/form-data

file: [Medical Image]
scan_type: "mri" | "xray" | "ct"
```

**Response**:
```json
{
  "findings": [
    {
      "observation": "Normal lung fields",
      "confidence": 0.92,
      "severity": "normal"
    }
  ],
  "recommendations": ["No immediate action required"],
  "analysis_time": "2.3s"
}
```

##### AI Chat
```http
POST /api/chat
Content-Type: application/json

{
  "message": "What are the side effects?",
  "context_type": "prescription",
  "context_data": {...}
}
```

---

### Error Responses

All errors follow this format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input provided",
    "details": {
      "field": "patient_id",
      "reason": "Required field missing"
    }
  }
}
```

**Error Codes**:
- `VALIDATION_ERROR` (400)
- `NOT_FOUND` (404)
- `INTERNAL_ERROR` (500)
- `UNAUTHORIZED` (401)

---

## 🎨 Screenshots & Demo

### Landing Page
Modern, clean interface with animated gradients and clear call-to-action.

### Doctor Dashboard
Comprehensive tools for prescription verification, drug interaction checking, and scan analysis.

### Patient Portal
Simple, intuitive interface for uploading and managing medical records.

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

---

## 🐛 Known Issues & Roadmap

### Current Limitations

- ⚠️ **Authentication**: Currently uses mock authentication (not production-ready)
- ⚠️ **Database**: SQLite is suitable for development but should migrate to PostgreSQL for production
- ⚠️ **API Rate Limits**: Google Gemini and Hugging Face have rate limits on free tiers

### Future Enhancements

- [ ] Implement proper backend authentication with JWT
- [ ] Migrate to PostgreSQL database
- [ ] Add real-time notifications
- [ ] Implement appointment scheduling
- [ ] Add telemedicine video calls
- [ ] Mobile app development (React Native)
- [ ] HIPAA compliance certification
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] WhatsApp bot integration
- [ ] Email notifications
- [ ] Data export functionality
- [ ] Integration with EHR systems

---

## 📄 License

This project is licensed under the **MIT License** - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- **Google AI Studio** for providing Gemini API access
- **Hugging Face** for hosting MedGemma and providing inference APIs
- **shadcn/ui** for the beautiful component library
- **Vercel** for Vite and amazing tooling
- **FastAPI** team for the excellent Python framework
- **Open Source Community** for all the incredible libraries used in this project

---

## 📞 Support & Contact

For questions, support, or feedback:

- 📧 Email: support@arogyaai.com (placeholder)
- 🐛 Issues: [GitHub Issues](https://github.com/your-repo/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/your-repo/discussions)
- 📖 Documentation: See `replit.md` and `design_guidelines.md`

---

## 🌟 Conclusion

**Arogya AI** represents a significant step forward in making healthcare safer, more accessible, and more efficient. By combining cutting-edge AI technology with intuitive design, we're empowering healthcare providers to make better decisions and patients to take control of their health journey.

### Our Vision 🎯

We envision a world where:
- **Every prescription** is verified for safety before dispensing
- **Every patient** has easy access to their medical records
- **Every healthcare provider** has AI-powered decision support at their fingertips
- **Medical errors** are dramatically reduced through intelligent automation
- **Healthcare quality** is elevated through data-driven insights

### Why Choose Arogya AI? 💡

1. **🔬 Advanced AI**: Leverages state-of-the-art Google Gemini and MedGemma models
2. **🎯 Specialized**: Built specifically for healthcare workflows
3. **🚀 Modern Stack**: Uses cutting-edge technologies for performance and reliability
4. **♿ Accessible**: Intuitive interface designed for both technical and non-technical users
5. **🔐 Secure**: Built with security and privacy in mind
6. **📈 Scalable**: Architecture designed to grow with your needs
7. **🌍 Open Source**: Community-driven development and transparency

### Get Started Today! 🚀

```bash
git clone <repository-url>
cd Arogya-AI
npm install
pip install -r backend/requirements.txt
npm run dev
```

Join us in revolutionizing healthcare through AI! 🏥✨

---

<div align="center">

**Made with ❤️ by the Arogya AI Team**

⭐ Star this repo if you find it helpful! ⭐

[Report Bug](https://github.com/your-repo/issues) • [Request Feature](https://github.com/your-repo/issues) • [Documentation](./replit.md)

</div>
