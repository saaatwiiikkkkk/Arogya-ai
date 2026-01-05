import { z } from "zod";

export const userRoleSchema = z.enum(["doctor", "patient"]);
export type UserRole = z.infer<typeof userRoleSchema>;

export const patientRecordSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  filename: z.string(),
  uploadedAt: z.string(),
  url: z.string(),
  fileType: z.string().optional(),
  fileSize: z.number().optional(),
});

export type PatientRecord = z.infer<typeof patientRecordSchema>;

export const insertPatientRecordSchema = patientRecordSchema.omit({ id: true });
export type InsertPatientRecord = z.infer<typeof insertPatientRecordSchema>;

export const chatMessageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  timestamp: z.string(),
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;

export const drugInputSchema = z.object({
  name: z.string().min(1, "Drug name is required"),
  dosage: z.string().min(1, "Dosage is required"),
});

export type DrugInput = z.infer<typeof drugInputSchema>;

export const personalDetailsSchema = z.object({
  age: z.number().min(1, "Age is required").max(150, "Invalid age"),
  height: z.number().min(1, "Height is required"),
  heightUnit: z.string().default("cm"),
  weight: z.number().min(1, "Weight is required"),
  weightUnit: z.string().default("kg"),
  additionalInfo: z.string().optional(),
});

export type PersonalDetails = z.infer<typeof personalDetailsSchema>;

export const drugInteractionResultSchema = z.object({
  status: z.enum(["safe", "warning", "danger"]),
  explanation: z.string(),
  suggestions: z.array(z.string()),
});

export type DrugInteractionResult = z.infer<typeof drugInteractionResultSchema>;

export const scanAnalysisResultSchema = z.object({
  summary: z.string(),
  findings: z.array(z.string()),
  recommendations: z.array(z.string()),
});

export type ScanAnalysisResult = z.infer<typeof scanAnalysisResultSchema>;

export const prescriptionAnalysisSchema = z.object({
  summary: z.string(),
  medications: z.array(z.object({
    name: z.string(),
    dosage: z.string(),
    frequency: z.string(),
  })),
  warnings: z.array(z.string()),
  recommendations: z.array(z.string()),
});

export type PrescriptionAnalysis = z.infer<typeof prescriptionAnalysisSchema>;

export const authStateSchema = z.object({
  userRole: userRoleSchema.nullable(),
  patientId: z.string().nullable(),
  isAuthenticated: z.boolean(),
});

export type AuthState = z.infer<typeof authStateSchema>;
