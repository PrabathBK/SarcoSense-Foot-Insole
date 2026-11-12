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

  // Rolling IMU history for real-time charts (max 40 points)
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

// High-speed telemetry buffer variables (outside React/Zustand render loop)
let pendingFootData: {
  left?: InsoleData;
  right?: InsoleData;
} = {};

let pendingRawSamples: RecordedSample[] = [];
let lastChartUpdate: { left: number; right: number } = { left: 0, right: 0 };
let rafId: number | null = null;

function flushUpdates() {
  const currentUpdates = pendingFootData;
  pendingFootData = {};

  const samplesToAppend = pendingRawSamples;
  pendingRawSamples = [];

  const now = Date.now();
  const state = useSensorStore.getState();
  const updates: Partial<SensorStoreState> = {};

  (["left", "right"] as const).forEach((foot) => {
    const data = currentUpdates[foot];
    if (!data) return;

    const currentFoot = state[foot];
    const dt = currentFoot.lastPacketTime ? (now - currentFoot.lastPacketTime) / 1000 : 0.05;
    const currentRate = dt > 0 && dt < 2 ? 1 / dt : 20;
    const smoothedRate =
      currentFoot.sampleRate === 0
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

    const fsr = Array.isArray(data.fsr) && data.fsr.length === 16 ? data.fsr : [...currentFoot.fsr];

    updates[foot] = {
      fsr,
      imu,
      connected: true,
      lastPacketTime: now,
      sampleRate: Math.min(smoothedRate, 50),
      packetCount: currentFoot.packetCount + 1,
    };

    // Throttle IMU chart history updates to max ~10 Hz (every 100ms) to prevent Recharts CPU exhaustion
    if (now - lastChartUpdate[foot] >= 100) {
      lastChartUpdate[foot] = now;
      const date = new Date(now);
      const timeLabel = `${date.getSeconds()}.${Math.floor(date.getMilliseconds() / 100)}`;
      const newHistoryPoint: IMUHistoryPoint = {
        time: timeLabel,
        ...imu,
      };

      const existingHistory = updates.imuHistory?.[foot] || state.imuHistory[foot];
      const updatedHistory = [...existingHistory, newHistoryPoint];
      if (updatedHistory.length > MAX_HISTORY) {
        updatedHistory.shift();
      }

      updates.imuHistory = {
        ...(updates.imuHistory || state.imuHistory),
        [foot]: updatedHistory,
      };
    }
  });

  if (samplesToAppend.length > 0) {
    updates.recordedSamples = [...state.recordedSamples, ...samplesToAppend];
  }

  useSensorStore.setState(updates);
}

export const useSensorStore = create<SensorStoreState>((set, get) => ({
  brokerStatus: "disconnected",
  brokerError: null,
  setBrokerStatus: (status, error = null) =>
    set({
      brokerStatus: status,
      brokerError: error,
    }),

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
    pendingFootData[foot] = data;

    // Buffer every single raw sample if recording is active (zero data loss for CSV export)
    if (get().isRecording) {
      pendingRawSamples.push({
        timestamp: now,
        [foot]: {
          fsr: [...data.fsr],
          imu: {
            ax: Number(data.ax.toFixed(2)),
            ay: Number(data.ay.toFixed(2)),
            az: Number(data.az.toFixed(2)),
            gx: Number(data.gx.toFixed(2)),
            gy: Number(data.gy.toFixed(2)),
            gz: Number(data.gz.toFixed(2)),
          },
        },
      });
    }

    // Schedule RAF update to batch render calls with the display refresh rate
    if (!rafId) {
      if (typeof window !== "undefined" && typeof window.requestAnimationFrame === "function") {
        rafId = window.requestAnimationFrame(() => {
          rafId = null;
          flushUpdates();
        });
      } else {
        // Fallback for non-browser or test environments
        rafId = setTimeout(() => {
          rafId = null;
          flushUpdates();
        }, 16) as unknown as number;
      }
    }
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
    pendingRawSamples = [];
    set({
      isRecording: true,
      recordingStartTime: Date.now(),
      recordedSamples: [],
      activePatientId: patientId,
      activePatientName: patientName,
    });
  },

  stopRecording: () => {
    if (pendingRawSamples.length > 0) {
      const remaining = pendingRawSamples;
      pendingRawSamples = [];
      const current = get().recordedSamples;
      const allSamples = [...current, ...remaining];
      set({
        isRecording: false,
        recordedSamples: allSamples,
      });
      return allSamples;
    }
    const samples = get().recordedSamples;
    set({
      isRecording: false,
    });
    return samples;
  },

  clearRecording: () => {
    pendingRawSamples = [];
    set({
      isRecording: false,
      recordingStartTime: null,
      recordedSamples: [],
    });
  },

  resetAll: () => {
    pendingFootData = {};
    pendingRawSamples = [];
    if (rafId) {
      if (typeof window !== "undefined" && typeof window.cancelAnimationFrame === "function") {
        window.cancelAnimationFrame(rafId);
      } else {
        clearTimeout(rafId);
      }
      rafId = null;
    }
    set({
      left: initialFootState(),
      right: initialFootState(),
      imuHistory: { left: [], right: [] },
      isRecording: false,
      recordedSamples: [],
    });
  },
}));
