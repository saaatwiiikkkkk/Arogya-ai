import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";

const prescriptionAnalysisMock = {
  summary: "The prescription has been analyzed and contains 3 medications. The overall prescription appears to be clinically appropriate with standard dosages. Minor considerations have been identified.",
  medications: [
    { name: "Amoxicillin", dosage: "500mg", frequency: "Three times daily for 7 days" },
    { name: "Ibuprofen", dosage: "400mg", frequency: "As needed, max 3 times daily" },
    { name: "Omeprazole", dosage: "20mg", frequency: "Once daily before breakfast" },
  ],
  warnings: [
    "Ibuprofen may cause GI irritation; Omeprazole provides gastric protection",
    "Patient should complete full course of antibiotics",
  ],
  recommendations: [
    "Take Amoxicillin with food to reduce stomach upset",
    "Avoid alcohol during antibiotic treatment",
    "Monitor for allergic reactions in first 48 hours",
    "Follow up if symptoms persist after completing course",
  ],
};

const drugInteractionMocks = {
  safe: {
    status: "safe",
    explanation: "Based on the analysis, the combination of the specified medications appears to be safe for a patient with the provided characteristics. No significant drug-drug interactions were identified that would require dosage adjustments or alternative therapies.",
    suggestions: [
      "Continue monitoring for any unexpected side effects",
      "Maintain regular follow-up appointments",
      "Ensure patient understands proper dosing schedules",
      "Review medication list at each visit for any changes",
    ],
  },
  warning: {
    status: "warning",
    explanation: "The combination of medications may have potential interactions that require monitoring. While not contraindicated, healthcare providers should be aware of possible effects including altered drug metabolism and increased risk of certain side effects.",
    suggestions: [
      "Monitor liver function tests periodically",
      "Consider spacing doses by at least 2 hours",
      "Watch for signs of increased sedation or dizziness",
      "Adjust dosages if necessary based on patient response",
      "Document the interaction and monitoring plan",
    ],
  },
};

const scanAnalysisMock = {
  summary: "The scan analysis has been completed. The image quality is adequate for assessment. The AI has identified key anatomical structures and performed preliminary evaluation. All findings should be confirmed by a qualified radiologist.",
  findings: [
    "Normal bone density observed in visualized skeletal structures",
    "Soft tissue contours appear within normal limits",
    "No acute abnormalities or concerning lesions identified",
    "Joint spaces and alignment appear preserved",
    "No signs of fracture or dislocation in visible areas",
  ],
  recommendations: [
    "Confirm findings with clinical correlation",
    "Consider follow-up imaging if symptoms persist",
    "Compare with prior studies if available",
    "Consult radiology for formal interpretation",
  ],
};

const chatResponses = {
  prescription: [
    "Based on the prescription analysis, I found no major drug interactions. The dosages appear to be within standard therapeutic ranges.",
    "I've reviewed the medications listed. The combination of these drugs is commonly prescribed and generally well-tolerated.",
    "Looking at the prescription, I recommend monitoring for common side effects such as dizziness or nausea during the first week of treatment.",
  ],
  scan: [
    "The scan appears to show normal anatomical structures. However, please note this is an assistive analysis and should be confirmed by a radiologist.",
    "Based on the image analysis, I've identified the key regions of interest. The preliminary assessment suggests no significant abnormalities.",
    "I've analyzed the scan. The image quality is good, and I can provide a detailed breakdown of the findings upon request.",
  ],
};

const uploadRecordSchema = z.object({
  patientId: z.string().min(1),
  filename: z.string().min(1),
  fileType: z.string().optional(),
  fileSize: z.number().optional(),
});

const drugInteractionSchema = z.object({
  drugs: z.array(z.object({
    name: z.string().min(1),
    dosage: z.string().min(1),
  })).length(2),
  personalDetails: z.object({
    age: z.number().positive(),
    height: z.number().positive(),
    weight: z.number().positive(),
    additionalInfo: z.string().optional(),
  }),
});

const chatSchema = z.object({
  message: z.string().min(1),
  context: z.enum(["prescription", "scan"]),
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get("/api/records/:patientId", async (req, res) => {
    try {
      const { patientId } = req.params;
      const records = await storage.getRecordsByPatientId(patientId);
      res.json(records);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch records" });
    }
  });

  app.post("/api/records", async (req, res) => {
    try {
      const validation = uploadRecordSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid request body", details: validation.error.errors });
      }

      const record = await storage.addRecord({
        ...validation.data,
        uploadedAt: new Date().toISOString(),
      });

      res.status(201).json(record);
    } catch (error) {
      res.status(500).json({ error: "Failed to create record" });
    }
  });

  app.post("/api/analyze/prescription", async (_req, res) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      res.json(prescriptionAnalysisMock);
    } catch (error) {
      res.status(500).json({ error: "Failed to analyze prescription" });
    }
  });

  app.post("/api/analyze/drug-interactions", async (req, res) => {
    try {
      const validation = drugInteractionSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid request body", details: validation.error.errors });
      }

      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      const resultType = Math.random() > 0.5 ? "safe" : "warning";
      res.json(drugInteractionMocks[resultType]);
    } catch (error) {
      res.status(500).json({ error: "Failed to check drug interactions" });
    }
  });

  app.post("/api/analyze/scan", async (_req, res) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      res.json(scanAnalysisMock);
    } catch (error) {
      res.status(500).json({ error: "Failed to analyze scan" });
    }
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const validation = chatSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid request body", details: validation.error.errors });
      }

      await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 800));

      const responses = chatResponses[validation.data.context];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];

      res.json({
        id: Date.now().toString(),
        role: "assistant",
        content: randomResponse,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to process chat message" });
    }
  });

  return httpServer;
}
