import { create } from "zustand";
import { FootSide, IMUData, InsoleData, RecordedSample } from "@/types";

export type BrokerStatus = "disconnected" | "connecting" | "connected" | "error";

export interface FootDataState {
  fsr: number[]; // 16 values
  imu: IMUData;
  connected: boolean;
  lastPacketTime: number | null;
  sampleRate: number; // Hz
  packetCount: number;
}

export interface IMUHistoryPoint {
  time: string;
  ax: number;
  ay: number;
  az: number;
  gx: number;
  gy: number;
  gz: number;
}

interface SensorStoreState {
  // Broker connection
  brokerStatus: BrokerStatus;
  brokerError: string | null;
  setBrokerStatus: (status: BrokerStatus, error?: string | null) => void;

  // Sensor state per foot
  left: FootDataState;
  right: FootDataState;

  // Rolling IMU history for real-time charts (max 50 points)
  imuHistory: {
    left: IMUHistoryPoint[];
    right: IMUHistoryPoint[];
  };

  // Recording / Capture buffer
  isRecording: boolean;
  recordingStartTime: number | null;
  recordedSamples: RecordedSample[];
  activePatientId: string | null;
  activePatientName: string | null;

  // Actions
  updateSensorData: (data: InsoleData) => void;
  checkHeartbeats: (timeoutMs?: number) => void;
  startRecording: (patientId?: string, patientName?: string) => void;
  stopRecording: () => RecordedSample[];
  clearRecording: () => void;
  resetAll: () => void;
}

const DEFAULT_IMU: IMUData = { ax: 0, ay: 0, az: 0, gx: 0, gy: 0, gz: 0 };
const DEFAULT_FSR = Array(16).fill(0);
const MAX_HISTORY = 40;

const initialFootState = (): FootDataState => ({
  fsr: [...DEFAULT_FSR],
  imu: { ...DEFAULT_IMU },
  connected: false,
  lastPacketTime: null,
  sampleRate: 0,
  packetCount: 0,
});

export const useSensorStore = create<SensorStoreState>((set, get) => ({
  brokerStatus: "disconnected",
  brokerError: null,
  setBrokerStatus: (status, error = null) =>
    set({ brokerStatus: status, brokerError: error }),

  left: initialFootState(),
  right: initialFootState(),

  imuHistory: {
    left: [],
    right: [],
  },

  isRecording: false,
  recordingStartTime: null,
  recordedSamples: [],
  activePatientId: null,
  activePatientName: null,

  updateSensorData: (data: InsoleData) => {
    const foot = data.foot;
    if (foot !== "left" && foot !== "right") return;

    const now = Date.now();
    const currentFoot = get()[foot];
    const dt = currentFoot.lastPacketTime ? (now - currentFoot.lastPacketTime) / 1000 : 0.05;
    const currentRate = dt > 0 && dt < 2 ? 1 / dt : 20;
    // Smoothed sample rate
    const smoothedRate = currentFoot.sampleRate === 0
      ? currentRate
      : Math.round((currentFoot.sampleRate * 0.7 + currentRate * 0.3) * 10) / 10;

    const imu: IMUData = {
      ax: Number(data.ax.toFixed(2)),
      ay: Number(data.ay.toFixed(2)),
      az: Number(data.az.toFixed(2)),
      gx: Number(data.gx.toFixed(2)),
      gy: Number(data.gy.toFixed(2)),
      gz: Number(data.gz.toFixed(2)),
    };

    // Ensure 16 FSR values
    const fsr = Array.isArray(data.fsr) && data.fsr.length === 16
      ? data.fsr
      : [...currentFoot.fsr];

    // Format time label for chart
    const date = new Date(now);
    const timeLabel = `${date.getSeconds()}.${Math.floor(date.getMilliseconds() / 100)}`;

    const newHistoryPoint: IMUHistoryPoint = {
      time: timeLabel,
      ...imu,
    };

    set((state) => {
      const updatedHistory = [...state.imuHistory[foot], newHistoryPoint];
      if (updatedHistory.length > MAX_HISTORY) {
        updatedHistory.shift();
      }

      // If recording, accumulate sample
      let updatedSamples = state.recordedSamples;
      if (state.isRecording) {
        const sample: RecordedSample = {
          timestamp: now,
          [foot]: {
            fsr: [...fsr],
            imu: { ...imu },
          },
        };
        updatedSamples = [...state.recordedSamples, sample];
      }

      return {
        [foot]: {
          fsr,
          imu,
          connected: true,
          lastPacketTime: now,
          sampleRate: Math.min(smoothedRate, 50),
          packetCount: currentFoot.packetCount + 1,
        },
        imuHistory: {
          ...state.imuHistory,
          [foot]: updatedHistory,
        },
        recordedSamples: updatedSamples,
      };
    });
  },

  checkHeartbeats: (timeoutMs = 2500) => {
    const now = Date.now();
    set((state) => {
      const leftTimeout = state.left.lastPacketTime
        ? now - state.left.lastPacketTime > timeoutMs
        : true;
      const rightTimeout = state.right.lastPacketTime
        ? now - state.right.lastPacketTime > timeoutMs
        : true;

      if (!leftTimeout && !rightTimeout) return state;

      return {
        left: {
          ...state.left,
          connected: !leftTimeout,
          sampleRate: leftTimeout ? 0 : state.left.sampleRate,
        },
        right: {
          ...state.right,
          connected: !rightTimeout,
          sampleRate: rightTimeout ? 0 : state.right.sampleRate,
        },
      };
    });
  },

  startRecording: (patientId = "P-DEMO", patientName = "Demo Subject") => {
    set({
      isRecording: true,
      recordingStartTime: Date.now(),
      recordedSamples: [],
      activePatientId: patientId,
      activePatientName: patientName,
    });
  },

  stopRecording: () => {
    const samples = get().recordedSamples;
    set({
      isRecording: false,
    });
    return samples;
  },

  clearRecording: () => {
    set({
      isRecording: false,
      recordingStartTime: null,
      recordedSamples: [],
    });
  },

  resetAll: () => {
    set({
      left: initialFootState(),
      right: initialFootState(),
      imuHistory: { left: [], right: [] },
      isRecording: false,
      recordedSamples: [],
    });
  },
}));

