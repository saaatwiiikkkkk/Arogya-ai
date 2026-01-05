import type { PatientRecord } from "@shared/schema";

const STORAGE_KEY = "patient_records";

export function getRecords(): PatientRecord[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }
  return [];
}

export function getRecordsByPatientId(patientId: string): PatientRecord[] {
  return getRecords().filter((r) => r.patientId === patientId);
}

export function addRecord(record: PatientRecord): void {
  const records = getRecords();
  records.unshift(record);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function generateRecordId(): string {
  return `REC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
