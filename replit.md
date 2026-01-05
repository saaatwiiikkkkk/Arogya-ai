# Arogya AI - Medical Healthcare Web Application

## Overview
Arogya AI is a medical-themed web application that serves as an intelligent clinical safety layer. The application provides tools for both healthcare providers (doctors) and patients to manage medical records, analyze prescriptions, check drug interactions, and analyze medical scans.

## Project Structure
```
client/
├── src/
│   ├── components/
│   │   ├── ui/           # shadcn/ui components
│   │   ├── chatbot.tsx   # AI chatbot component
│   │   ├── file-upload.tsx
│   │   ├── doctor-layout.tsx
│   │   ├── patient-layout.tsx
│   │   ├── theme-provider.tsx
│   │   └── theme-toggle.tsx
│   ├── lib/
│   │   ├── auth.tsx      # Auth context and hooks
│   │   ├── records-store.ts  # localStorage record management
│   │   ├── queryClient.ts
│   │   └── utils.ts
│   ├── pages/
│   │   ├── doctor/       # Doctor dashboard pages
│   │   ├── patient/      # Patient dashboard pages
│   │   ├── landing.tsx
│   │   ├── auth.tsx
│   │   └── not-found.tsx
│   ├── App.tsx
│   └── index.css
server/
├── routes.ts             # API endpoints
├── storage.ts            # In-memory storage
└── index.ts
shared/
└── schema.ts             # Zod schemas and TypeScript types
```

## Routes
- `/` - Landing page with hero section and features
- `/auth` - Authentication page with role selection (Doctor/Patient)
- `/doctor` - Doctor dashboard (redirects to /doctor/records)
  - `/doctor/records` - Search and view patient records
  - `/doctor/prescription-verifier` - AI prescription analysis with chatbot
  - `/doctor/drug-interactions` - 3-step drug interaction wizard
  - `/doctor/scans` - MRI/X-ray scan analysis with chatbot
- `/patient` - Patient dashboard (redirects to /patient/upload)
  - `/patient/upload` - Upload medical records
  - `/patient/documents` - View uploaded documents

## Features
1. **Landing Page**: Medical-themed hero section with features overview
2. **Authentication**: Role-based login (Doctor/Patient) with mock auth
3. **Doctor Dashboard**:
   - Patient Records: Search by Patient ID
   - AI Prescription Verifier: Upload prescriptions for AI analysis
   - Drug Interaction Check: 3-step wizard for checking drug interactions
   - MRI/X-ray Scan Analysis: Upload scans for AI-assisted analysis
4. **Patient Dashboard**:
   - Upload Records: Upload medical documents
   - My Documents: View and download uploaded files

## Tech Stack
- **Frontend**: React 18 + TypeScript, wouter (routing), TanStack Query
- **UI**: shadcn/ui + Tailwind CSS, Lucide icons
- **Backend**: Express.js with in-memory storage
- **Validation**: Zod schemas
- **State**: localStorage for client-side persistence, Context API for auth

## Data Storage
- Auth state stored in localStorage (`authState` key)
- Patient records stored in localStorage (`patient_records` key)
- Backend uses in-memory storage for API demonstration

## API Endpoints
- `GET /api/records/:patientId` - Fetch records by patient ID
- `POST /api/records` - Create new record
- `POST /api/analyze/prescription` - Analyze prescription (mock AI)
- `POST /api/analyze/drug-interactions` - Check drug interactions (mock AI)
- `POST /api/analyze/scan` - Analyze medical scan (mock AI)
- `POST /api/chat` - AI chatbot responses

## Running the Application
The application runs on port 5000 using `npm run dev`.

## Design Guidelines
See `design_guidelines.md` for comprehensive UI/UX design specifications including:
- Typography hierarchy
- Color palette (supports light/dark mode)
- Component usage patterns
- Layout specifications
- Medical theme guidelines
