import { FootSide } from "@/types";

export interface SensorPadInfo {
  pinNumber: number; // Insole Pin number: 1, 2, 3, 4, 5, 6, 8, 9, 11, 12, 13, 14, 16, 17, 18, 19
  sensorNum: number; // Alias to pinNumber for backward compatibility
  arrayIndex: number; // 0 to 15 (position in ESP32 JSON payload "fsr" array)
  name: string;
  region: "Toe" | "Forefoot" | "Midfoot" | "Heel";
  side: "Medial" | "Central" | "Lateral";
  // SVG coordinates on the 737x721 canvas
  coords: {
    left: { cx: number; cy: number; rx: number; ry: number };
    right: { cx: number; cy: number; rx: number; ry: number };
  };
}

/**
 * 20-PIN CONNECTOR INSOLE SENSOR MAPPING
 * 
 * Active insole pins: [1, 2, 3, 4, 5, 6, 8, 9, 11, 12, 13, 14, 16, 17, 18, 19]
 * (Pins 7, 10, 15, 20 are unused / reference lines).
 * 
 * ESP32 publishes fsr array sorted strictly by insole pin number (1 to 19):
 * fsr[0]=Pin 1, fsr[1]=Pin 2, ..., fsr[15]=Pin 19.
 * 
 * Physical Insole Layout (Right foot perspective, Row by Row):
 * Row 1 (Toes):            Pin 11 (Lesser Toe),             Pin 12 (Big Toe)
 * Row 2 (Metatarsals):     Pin 13 (Lateral), Pin 9 (Center), Pin 1 (Medial)
 * Row 3 (Forefoot-Mid):    Pin 14 (Lateral), Pin 5 (Center), Pin 2 (Medial)
 * Row 4 (Lower Mid Arch):  Pin 19 (Lateral), Pin 6 (Center), Pin 3 (Medial)
 * Row 5 (Arch / Heel-Lead):Pin 18 (Lateral), Pin 8 (Center), Pin 4 (Medial)
 * Row 6 (Heel):            Pin 16 (Lateral),                Pin 17 (Medial)
 */
export const SENSOR_DEFINITIONS: SensorPadInfo[] = [
  // ==========================================
  // ROW 1: TOES
  // ==========================================
  {
    pinNumber: 11,
    sensorNum: 11,
    arrayIndex: 8,
    name: "Lesser Toe",
    region: "Toe",
    side: "Lateral",
    coords: {
      left: { cx: 203.9, cy: 94.5, rx: 28, ry: 32 },
      right: { cx: 471.0, cy: 100.3, rx: 20, ry: 33 },
    },
  },
  {
    pinNumber: 12,
    sensorNum: 12,
    arrayIndex: 9,
    name: "Big Toe",
    region: "Toe",
    side: "Medial",
    coords: {
      left: { cx: 274.0, cy: 100.0, rx: 20, ry: 33 },
      right: { cx: 539.7, cy: 95.8, rx: 28, ry: 32 },
    },
  },

  // ==========================================
  // ROW 2: METATARSALS / FOREFOOT
  // ==========================================
  {
    pinNumber: 13,
    sensorNum: 13,
    arrayIndex: 10,
    name: "Forefoot Lateral",
    region: "Forefoot",
    side: "Lateral",
    coords: {
      left: { cx: 157.7, cy: 181.0, rx: 23, ry: 34 },
      right: { cx: 462.6, cy: 183.6, rx: 17, ry: 33 },
    },
  },
  {
    pinNumber: 9,
    sensorNum: 9,
    arrayIndex: 7,
    name: "Forefoot Center",
    region: "Forefoot",
    side: "Central",
    coords: {
      left: { cx: 220.8, cy: 180.7, rx: 21, ry: 35 },
      right: { cx: 523.3, cy: 180.5, rx: 21, ry: 35 },
    },
  },
  {
    pinNumber: 1,
    sensorNum: 1,
    arrayIndex: 0,
    name: "Forefoot Medial",
    region: "Forefoot",
    side: "Medial",
    coords: {
      left: { cx: 281.9, cy: 184.4, rx: 17, ry: 33 },
      right: { cx: 587.6, cy: 180.1, rx: 23, ry: 34 },
    },
  },

  // ==========================================
  // ROW 3: FOREFOOT-MIDFOOT
  // ==========================================
  {
    pinNumber: 14,
    sensorNum: 14,
    arrayIndex: 11,
    name: "Midfoot Lateral",
    region: "Forefoot",
    side: "Lateral",
    coords: {
      left: { cx: 142.9, cy: 272.1, rx: 15, ry: 34 },
      right: { cx: 471.6, cy: 275.8, rx: 20, ry: 35 },
    },
  },
  {
    pinNumber: 5,
    sensorNum: 5,
    arrayIndex: 4,
    name: "Midfoot Center",
    region: "Forefoot",
    side: "Central",
    coords: {
      left: { cx: 205.5, cy: 270.6, rx: 18, ry: 35 },
      right: { cx: 538.5, cy: 270.6, rx: 18, ry: 35 },
    },
  },
  {
    pinNumber: 2,
    sensorNum: 2,
    arrayIndex: 1,
    name: "Midfoot Medial",
    region: "Forefoot",
    side: "Medial",
    coords: {
      left: { cx: 273.2, cy: 276.0, rx: 20, ry: 35 },
      right: { cx: 600.9, cy: 272.0, rx: 15, ry: 34 },
    },
  },

  // ==========================================
  // ROW 4: LOWER MIDFOOT ARCH
  // ==========================================
  {
    pinNumber: 19,
    sensorNum: 19,
    arrayIndex: 15,
    name: "Lower Mid Lateral",
    region: "Midfoot",
    side: "Lateral",
    coords: {
      left: { cx: 146.6, cy: 365.2, rx: 17, ry: 34 },
      right: { cx: 487.9, cy: 369.2, rx: 19, ry: 34 },
    },
  },
  {
    pinNumber: 6,
    sensorNum: 6,
    arrayIndex: 5,
    name: "Lower Mid Center",
    region: "Midfoot",
    side: "Central",
    coords: {
      left: { cx: 198.4, cy: 365.0, rx: 16, ry: 34 },
      right: { cx: 546.7, cy: 364.8, rx: 16, ry: 34 },
    },
  },
  {
    pinNumber: 3,
    sensorNum: 3,
    arrayIndex: 2,
    name: "Lower Mid Medial",
    region: "Midfoot",
    side: "Medial",
    coords: {
      left: { cx: 256.7, cy: 369.3, rx: 19, ry: 34 },
      right: { cx: 597.7, cy: 365.3, rx: 17, ry: 34 },
    },
  },

  // ==========================================
  // ROW 5: ARCH / HEEL-LEAD
  // ==========================================
  {
    pinNumber: 18,
    sensorNum: 18,
    arrayIndex: 14,
    name: "Arch Lateral",
    region: "Midfoot",
    side: "Lateral",
    coords: {
      left: { cx: 152.1, cy: 456.9, rx: 14, ry: 34 },
      right: { cx: 501.7, cy: 459.3, rx: 17, ry: 34 },
    },
  },
  {
    pinNumber: 8,
    sensorNum: 8,
    arrayIndex: 6,
    name: "Arch Center",
    region: "Midfoot",
    side: "Central",
    coords: {
      left: { cx: 192.0, cy: 457.3, rx: 15, ry: 35 },
      right: { cx: 552.1, cy: 456.5, rx: 15, ry: 35 },
    },
  },
  {
    pinNumber: 4,
    sensorNum: 4,
    arrayIndex: 3,
    name: "Arch Medial",
    region: "Midfoot",
    side: "Medial",
    coords: {
      left: { cx: 241.3, cy: 459.1, rx: 17, ry: 34 },
      right: { cx: 592.1, cy: 455.9, rx: 14, ry: 34 },
    },
  },

  // ==========================================
  // ROW 6: HEEL
  // ==========================================
  {
    pinNumber: 16,
    sensorNum: 16,
    arrayIndex: 12,
    name: "Heel Lateral",
    region: "Heel",
    side: "Lateral",
    coords: {
      left: { cx: 160.3, cy: 571.2, rx: 16, ry: 45 },
      right: { cx: 516.1, cy: 567.2, rx: 19, ry: 45 },
    },
  },
  {
    pinNumber: 17,
    sensorNum: 17,
    arrayIndex: 13,
    name: "Heel Medial",
    region: "Heel",
    side: "Medial",
    coords: {
      left: { cx: 227.5, cy: 566.9, rx: 19, ry: 45 },
      right: { cx: 584.2, cy: 570.6, rx: 16, ry: 45 },
    },
  },
];

/**
 * Fast lookup from Insole Pin Number to ESP32 payload array index (0..15)
 */
export const PIN_TO_ARRAY_INDEX: Record<number, number> = {
  1: 0,
  2: 1,
  3: 2,
  4: 3,
  5: 4,
  6: 5,
  8: 6,
  9: 7,
  11: 8,
  12: 9,
  13: 10,
  14: 11,
  16: 12,
  17: 13,
  18: 14,
  19: 15,
};

/**
 * Returns raw FSR value for a given insole pin number or array index
 */
export function getSensorValue(fsr: number[], pinOrIndex: number): number {
  if (!fsr || !Array.isArray(fsr)) return 0;
  // If pin number is given (e.g. 1, 2, 12, 19)
  const idx = PIN_TO_ARRAY_INDEX[pinOrIndex];
  if (idx !== undefined && idx >= 0 && idx < fsr.length) {
    return fsr[idx] || 0;
  }
  // Direct array index fallback (0..15)
  if (pinOrIndex >= 0 && pinOrIndex < fsr.length) {
    return fsr[pinOrIndex] || 0;
  }
  return 0;
}

/**
 * Maps raw ADC value (0-4095) to heat map colors
 */
export function getPressureStyle(val: number) {
  const clamped = Math.max(0, Math.min(4095, val));
  const ratio = clamped / 4095;

  if (clamped < 25) {
    return {
      fill: "rgba(30, 41, 59, 0.45)", // Slate dark (idle)
      stroke: "rgba(100, 116, 139, 0.6)",
      glow: "none",
      textColor: "rgba(148, 163, 184, 0.7)",
      label: "0",
    };
  }

  if (ratio < 0.15) {
    // Low pressure: Cool Blue / Cyan
    return {
      fill: "rgba(6, 182, 212, 0.75)",
      stroke: "#22d3ee",
      glow: "drop-shadow(0 0 6px rgba(6, 182, 212, 0.6))",
      textColor: "#ffffff",
      label: `${clamped}`,
    };
  }

  if (ratio < 0.40) {
    // Medium-Low: Green / Emerald
    return {
      fill: "rgba(16, 185, 129, 0.85)",
      stroke: "#34d399",
      glow: "drop-shadow(0 0 10px rgba(16, 185, 129, 0.7))",
      textColor: "#ffffff",
      label: `${clamped}`,
    };
  }

  if (ratio < 0.70) {
    // Medium-High: Amber / Yellow
    return {
      fill: "rgba(245, 158, 11, 0.9)",
      stroke: "#fbbf24",
      glow: "drop-shadow(0 0 12px rgba(245, 158, 11, 0.8))",
      textColor: "#ffffff",
      label: `${clamped}`,
    };
  }

  // Peak: Red / Hot Coral
  return {
    fill: "rgba(239, 68, 68, 0.95)",
    stroke: "#f87171",
    glow: "drop-shadow(0 0 16px rgba(239, 68, 68, 0.9))",
    textColor: "#ffffff",
    label: `${clamped}`,
  };
}
