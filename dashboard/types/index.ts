export type FootSide = "left" | "right";

export interface IMUData {
  ax: number;
  ay: number;
  az: number;
  gx: number;
  gy: number;
  gz: number;
}

export interface InsoleData {
  foot: FootSide;
  fsr: number[]; // 20 values: fsr[pin-1], zeros for unused pins 7,10,15,20
  ax: number;
  ay: number;
  az: number;
  gx: number;
  gy: number;
  gz: number;
  ts?: number;
}

export interface FootState {
  fsr: number[]; // 20 values
  imu: IMUData;
  connected: boolean;
  lastPacketTime: number | null;
  sampleRate: number;
}

export interface Patient {
  id: string; // Firestore document ID
  patientId: string; // Clinical identifier e.g. "P-1001"
  name: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  heightCm: number;
  weightKg: number;
  bmi: number;
  notes?: string;
  createdAt: number;
}

export interface RecordedSample {
  timestamp: number;
  left?: {
    fsr: number[];
    imu: IMUData;
  };
  right?: {
    fsr: number[];
    imu: IMUData;
  };
}

export interface CaptureSession {
  id: string;
  patientId: string;
  patientName: string;
  mode: "demo" | "clinical";
  startTime: number;
  endTime?: number;
  durationSeconds: number;
  sampleCount: number;
  notes?: string;
}

