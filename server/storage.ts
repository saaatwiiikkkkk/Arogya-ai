import { randomUUID } from "crypto";

export interface PatientRecord {
  id: string;
  patientId: string;
  filename: string;
  uploadedAt: string;
  fileType?: string;
  fileSize?: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface IStorage {
  getRecordsByPatientId(patientId: string): Promise<PatientRecord[]>;
  addRecord(record: Omit<PatientRecord, "id">): Promise<PatientRecord>;
  getRecord(id: string): Promise<PatientRecord | undefined>;
}

export class MemStorage implements IStorage {
  private records: Map<string, PatientRecord>;

  constructor() {
    this.records = new Map();
  }

  async getRecordsByPatientId(patientId: string): Promise<PatientRecord[]> {
    const patientRecords = Array.from(this.records.values())
      .filter((record) => record.patientId.toUpperCase() === patientId.toUpperCase())
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
    return patientRecords;
  }

  async addRecord(record: Omit<PatientRecord, "id">): Promise<PatientRecord> {
    const id = randomUUID();
    const newRecord: PatientRecord = { ...record, id };
    this.records.set(id, newRecord);
    return newRecord;
  }

  async getRecord(id: string): Promise<PatientRecord | undefined> {
    return this.records.get(id);
  }
}

export const storage = new MemStorage();
