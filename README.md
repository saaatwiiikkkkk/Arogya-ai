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
- [WhatsApp Bot Setup](#-whatsapp-bot-setup-optional)
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

### For Doctors 👨‍⚕️

#### 1. 📝 Prescription Verification
- **AI-Powered OCR**: Automatically extract prescription data from images
- **Dosage Validation**: Verify medication dosages against safe ranges
- **Interaction Checking**: Real-time drug interaction analysis
- **Alternative Suggestions**: AI recommends safer alternatives when needed

#### 2. ⚠️ Drug Interaction Analysis
- **Comprehensive Database**: Check interactions across thousands of medications
- **Severity Levels**: Clear categorization (major, moderate, minor)
- **Clinical Context**: Detailed explanations with medical evidence
- **Multi-Drug Analysis**: Check interactions between multiple medications

#### 3. 🔬 Medical Scan Analysis
- **AI Image Analysis**: MedGemma analyzes X-rays, MRIs, and CT scans
- **Diagnostic Insights**: AI-generated preliminary findings
- **Side-by-Side Comparison**: Compare multiple scans
- **Report Generation**: Automated preliminary reports

#### 4. 📋 Patient Records Management
- **Centralized Database**: All patient information in one place
- **Search & Filter**: Quick access to patient history
- **Document Linking**: Connect prescriptions, scans, and notes
- **Audit Trail**: Complete history of all actions

### For Patients 🧑‍🤝‍🧑

#### 1. 📄 Medical Documents
- **Secure Storage**: Upload and store medical documents
- **AI Summarization**: Get easy-to-understand summaries
- **Document Sharing**: Share with healthcare providers
- **Version History**: Track document updates

#### 2. 🤖 AI Health Assistant
- **24/7 Availability**: Ask health questions anytime
- **Personalized Responses**: Answers based on your medical history
- **Prescription Queries**: Understand your medications
- **Grounded Answers**: Evidence-based responses with citations

#### 3. 📸 Document Upload
- **Drag & Drop**: Easy file uploads
- **Multiple Formats**: Support for PDF, images, and more
- **Automatic Processing**: AI extraction and analysis
- **Organization**: Categorized storage

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Interface                          │
│                    (React + Vite + Tailwind)                    │
│    • Doctor Portal     • Patient Portal     • AI Chatbot       │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Express Proxy Server (Port 5000)             │
│    • Session Management                                         │
│    • API Proxy to FastAPI                                       │
│    • Static File Serving                                        │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                  FastAPI Backend (Port 8000)                    │
│    • RESTful API Endpoints                                      │
│    • SQLite Database (arogya.db)                               │
│    • File & Image Storage                                       │
│    • AI Service Integration                                     │
└─────────────────────────┬───────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
   ┌──────────┐   ┌──────────┐   ┌──────────┐
   │ Google   │   │ Hugging  │   │  SQLite  │
   │ Gemini   │   │   Face   │   │ Database │
   │ 2.5 Flash│   │ MedGemma │   │          │
   └──────────┘   └──────────┘   └──────────┘
```

### Data Flow Examples

#### Prescription Verification Flow
```
User Upload → Express Proxy → FastAPI → File Storage
                                       ↓
                            Gemini API → OCR & Analysis
                                       ↓
                            Drug DB → Interaction Check
                                       ↓
                            Response → User Interface
```

#### Medical Scan Analysis Flow
```
Image Upload → Express Proxy → FastAPI → Image Storage
                                        ↓
                         MedGemma API → Image Analysis
                                        ↓
                         Response → User Interface
```

#### Patient Record Search
```
Search Request → Express Proxy → FastAPI → SQLite Query
                                          ↓
                          Format Results → User Interface
```

---

## 🛠️ Technology Stack

### Frontend
| Technology | Purpose | Version |
|------------|---------|---------|
| **⚛️ React** | UI Framework | 18.x |
| **⚡ Vite** | Build Tool & Dev Server | 5.x |
| **🎨 Tailwind CSS** | Styling | 3.x |
| **🎯 TypeScript** | Type Safety | 5.x |
| **🌐 React Router** | Navigation | 6.x |
| **📦 Shadcn/ui** | UI Components | Latest |

### Backend
| Technology | Purpose | Version |
|------------|---------|---------|
| **⚡ FastAPI** | REST API Framework | 0.109.2 |
| **🐍 Python** | Backend Language | 3.11+ |
| **🗄️ SQLite** | Database | 3.x |
| **📄 Pydantic** | Data Validation | 2.x |

### AI & ML
| Technology | Purpose | Version |
|------------|---------|---------|
| **🤖 Google Gemini 2.5 Flash** | Language Model | Latest |
| **🏥 MedGemma 4B** | Medical Imaging AI | Latest |
| **🔬 Hugging Face** | Model Hosting & Inference | Inference API |

### DevOps & Tools
| Technology | Purpose |
|------------|---------|
| **📦 npm/pnpm** | Package Management |
| **🔧 Express** | Proxy Server |
| **🔒 bcrypt** | Password Hashing |

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
git clone https://github.com/saaatwiiikkkkk/Arogya-ai.git
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

1. Download the dataset from: [Dataset Link - Contact maintainers]
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

## 💬 WhatsApp Bot Setup (Optional)

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

The WhatsApp webhook is already configured in the server. The bot will:
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

## 🗂️ Project Structure

```
Arogya-AI/
│
├── 📂 backend/                      # Python FastAPI Backend
│   ├── main.py                      # Main FastAPI application
│   ├── db.py                        # Database initialization & models
│   ├── schemas.py                   # Pydantic schemas
│   ├── requirements.txt             # Python dependencies
│   ├── arogya.db                    # SQLite database
│   ├── 📂 services/                 # AI & business logic services
│   │   ├── gemini.py                # Gemini AI integration
│   │   ├── medgemma.py              # Medical imaging AI
│   │   └── interactions.py          # Drug interaction logic
│   └── 📂 storage/                  # File storage
│       ├── documents/               # Patient documents
│       └── images/                  # Medical scans
│
├── 📂 client/                       # React Frontend
│   ├── index.html                   # Entry HTML
│   ├── 📂 src/
│   │   ├── App.tsx                  # Main App component
│   │   ├── main.tsx                 # Entry point
│   │   ├── 📂 components/           # Reusable components
│   │   │   ├── chatbot.tsx          # AI chatbot
│   │   │   ├── doctor-layout.tsx    # Doctor dashboard layout
│   │   │   ├── patient-layout.tsx   # Patient dashboard layout
│   │   │   └── ui/                  # Shadcn UI components
│   │   ├── 📂 pages/                # Page components
│   │   │   ├── auth.tsx             # Login/signup
│   │   │   ├── 📂 doctor/           # Doctor features
│   │   │   │   ├── prescription-verifier.tsx
│   │   │   │   ├── drug-interactions.tsx
│   │   │   │   ├── scans.tsx
│   │   │   │   └── records.tsx
│   │   │   └── 📂 patient/          # Patient features
│   │   │       ├── documents.tsx
│   │   │       └── upload.tsx
│   │   └── 📂 lib/                  # Utilities
│   │       └── auth.tsx             # Authentication logic
│
├── 📂 server/                       # Express Proxy Server
│   ├── index.ts                     # Server entry point
│   ├── routes.ts                    # API routes
│   ├── storage.ts                   # File handling
│   ├── vite.ts                      # Vite dev server
│   └── whatsapp.ts                  # WhatsApp webhook
│
├── 📂 shared/                       # Shared TypeScript schemas
│   └── schema.ts                    # Type definitions
│
├── 📂 dataset/                      # Medical datasets (not in repo)
│   ├── data_final_v5.csv
│   ├── drug_info.json
│   ├── drugs_synonyms.json
│   └── all_id_interaction.csv
│
├── package.json                     # Node.js dependencies
├── tsconfig.json                    # TypeScript config
├── tailwind.config.ts               # Tailwind config
├── vite.config.ts                   # Vite config
├── drizzle.config.ts                # Database config (future)
├── .gitignore                       # Git ignore rules
└── README.md                        # This file
```

---

## 📚 API Documentation

### Authentication Endpoints

#### POST `/api/signup`
Create a new user account.

**Request:**
```json
{
  "name": "Dr. Smith",
  "email": "smith@hospital.com",
  "password": "securepass123",
  "role": "doctor"
}
```

**Response:**
```json
{
  "id": 1,
  "name": "Dr. Smith",
  "email": "smith@hospital.com",
  "role": "doctor"
}
```

#### POST `/api/login`
Authenticate user and create session.

**Request:**
```json
{
  "email": "smith@hospital.com",
  "password": "securepass123"
}
```

### Doctor Endpoints

#### POST `/api/doctor/verify-prescription`
Verify a prescription using AI-powered OCR and interaction checking.

**Request:** Multipart form with image file

**Response:**
```json
{
  "medications": ["Aspirin 100mg", "Metformin 500mg"],
  "interactions": [
    {
      "drug1": "Aspirin",
      "drug2": "Metformin",
      "severity": "moderate",
      "description": "May increase risk of hypoglycemia"
    }
  ],
  "alternatives": ["Consider alternative..."]
}
```

#### POST `/api/doctor/check-interactions`
Check interactions between multiple drugs.

**Request:**
```json
{
  "medications": ["Aspirin", "Warfarin", "Ibuprofen"]
}
```

#### POST `/api/doctor/analyze-scan`
Analyze medical scan using MedGemma AI.

**Request:** Multipart form with image file

### Patient Endpoints

#### GET `/api/patient/documents`
Retrieve patient's medical documents.

#### POST `/api/patient/upload`
Upload a new medical document.

#### POST `/api/chat`
Send a message to the AI health assistant.

**Request:**
```json
{
  "message": "What are the side effects of aspirin?",
  "userId": 1
}
```

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the Repository**
2. **Create a Feature Branch**: `git checkout -b feature/amazing-feature`
3. **Commit Changes**: `git commit -m 'Add amazing feature'`
4. **Push to Branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines

- Follow existing code style and conventions
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 📞 Support & Contact

For questions, support, or feedback:

- 📧 Email: support@arogyaai.com
- 🐛 Issues: [GitHub Issues](https://github.com/saaatwiiikkkkk/Arogya-ai/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/saaatwiiikkkkk/Arogya-ai/discussions)

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
git clone https://github.com/saaatwiiikkkkk/Arogya-ai.git
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

[Report Bug](https://github.com/saaatwiiikkkkk/Arogya-ai/issues) • [Request Feature](https://github.com/saaatwiiikkkkk/Arogya-ai/issues)

</div>

