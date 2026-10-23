import { FootSide } from "@/types";

export interface SensorPadInfo {
  pinNumber: number; // Insole Pin number: 1, 2, 3, 4, 5, 6, 8, 9, 11, 12, 13, 14, 16, 17, 18, 19
  sensorNum: number; // Alias to pinNumber
  arrayIndex: number; // 0 to 15 (position in ESP32 JSON payload "fsr" array)
  name: string;
  region: "Toe" | "Forefoot" | "Midfoot" | "Heel";
  side: "Medial" | "Central" | "Lateral";
  coords: {
    left: { cx: number; cy: number; rx: number; ry: number };
    right: { cx: number; cy: number; rx: number; ry: number };
  };
}

export interface FootPadDisplayInfo {
  padId: string;
  pinNumber: number;
  sensorNum: number;
  arrayIndex: number;
  name: string;
  region: "Toe" | "Forefoot" | "Midfoot" | "Heel";
  side: "Medial" | "Central" | "Lateral";
  coords: { cx: number; cy: number; rx: number; ry: number };
}

/**
 * Fast lookup from Insole Pin Number to ESP32 payload array index (0..15)
 * ESP32 publishes fsr in ascending Pin order:
 * [1, 2, 3, 4, 5, 6, 8, 9, 11, 12, 13, 14, 16, 17, 18, 19]
 * Note: Pin 11 = Big Toe (C14), Pin 12 = Lesser Toe (C6)
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
  const idx = PIN_TO_ARRAY_INDEX[pinOrIndex];
  if (idx !== undefined && idx >= 0 && idx < fsr.length) {
    return fsr[idx] || 0;
  }
  // Fallback to direct array index (0..15)
  if (pinOrIndex >= 0 && pinOrIndex < fsr.length) {
    return fsr[pinOrIndex] || 0;
  }
  return 0;
}

/**
 * RIGHT FOOT PADS (Baseline Master Mapping)
 * 
 * Row 1 (Toes):            Pin 12 (Left),                Pin 11 (Right)
 * Row 2 (Metatarsals):     Pin 13 (Left), Pin 9 (Center), Pin 1 (Right)
 * Row 3 (Midfoot):         Pin 14 (Left), Pin 5 (Center), Pin 2 (Right)
 * Row 4 (Lower Mid Arch):  Pin 19 (Left), Pin 6 (Center), Pin 3 (Right)
 * Row 5 (Arch):            Pin 18 (Left), Pin 8 (Center), Pin 4 (Right)
 * Row 6 (Heel):            Pin 16 (Left),                Pin 17 (Right)
 */
const RIGHT_FOOT_PADS: FootPadDisplayInfo[] = [
  // Row 1
  {
    padId: "r_row1_left",
    pinNumber: 12,
    sensorNum: 12,
    arrayIndex: 9,
    name: "Lesser Toe (Row 1 Left)",
    region: "Toe",
    side: "Lateral",
    coords: { cx: 471.0, cy: 100.3, rx: 20, ry: 33 },
  },
  {
    padId: "r_row1_right",
    pinNumber: 11,
    sensorNum: 11,
    arrayIndex: 8,
    name: "Big Toe (Row 1 Right)",
    region: "Toe",
    side: "Medial",
    coords: { cx: 539.7, cy: 95.8, rx: 28, ry: 32 },
  },
  // Row 2
  {
    padId: "r_row2_left",
    pinNumber: 13,
    sensorNum: 13,
    arrayIndex: 10,
    name: "Forefoot Lateral (Row 2 Left)",
    region: "Forefoot",
    side: "Lateral",
    coords: { cx: 462.6, cy: 183.6, rx: 17, ry: 33 },
  },
  {
    padId: "r_row2_mid",
    pinNumber: 9,
    sensorNum: 9,
    arrayIndex: 7,
    name: "Forefoot Center (Row 2 Mid)",
    region: "Forefoot",
    side: "Central",
    coords: { cx: 523.3, cy: 180.5, rx: 21, ry: 35 },
  },
  {
    padId: "r_row2_right",
    pinNumber: 1,
    sensorNum: 1,
    arrayIndex: 0,
    name: "Forefoot Medial (Row 2 Right)",
    region: "Forefoot",
    side: "Medial",
    coords: { cx: 587.6, cy: 180.1, rx: 23, ry: 34 },
  },
  // Row 3
  {
    padId: "r_row3_left",
    pinNumber: 14,
    sensorNum: 14,
    arrayIndex: 11,
    name: "Midfoot Lateral (Row 3 Left)",
    region: "Forefoot",
    side: "Lateral",
    coords: { cx: 471.6, cy: 275.8, rx: 20, ry: 35 },
  },
  {
    padId: "r_row3_mid",
    pinNumber: 5,
    sensorNum: 5,
    arrayIndex: 4,
    name: "Midfoot Center (Row 3 Mid)",
    region: "Forefoot",
    side: "Central",
    coords: { cx: 538.5, cy: 270.6, rx: 18, ry: 35 },
  },
  {
    padId: "r_row3_right",
    pinNumber: 2,
    sensorNum: 2,
    arrayIndex: 1,
    name: "Midfoot Medial (Row 3 Right)",
    region: "Forefoot",
    side: "Medial",
    coords: { cx: 600.9, cy: 272.0, rx: 15, ry: 34 },
  },
  // Row 4
  {
    padId: "r_row4_left",
    pinNumber: 19,
    sensorNum: 19,
    arrayIndex: 15,
    name: "Lower Mid Lateral (Row 4 Left)",
    region: "Midfoot",
    side: "Lateral",
    coords: { cx: 487.9, cy: 369.2, rx: 19, ry: 34 },
  },
  {
    padId: "r_row4_mid",
    pinNumber: 6,
    sensorNum: 6,
    arrayIndex: 5,
    name: "Lower Mid Center (Row 4 Mid)",
    region: "Midfoot",
    side: "Central",
    coords: { cx: 546.7, cy: 364.8, rx: 16, ry: 34 },
  },
  {
    padId: "r_row4_right",
    pinNumber: 3,
    sensorNum: 3,
    arrayIndex: 2,
    name: "Lower Mid Medial (Row 4 Right)",
    region: "Midfoot",
    side: "Medial",
    coords: { cx: 597.7, cy: 365.3, rx: 17, ry: 34 },
  },
  // Row 5
  {
    padId: "r_row5_left",
    pinNumber: 18,
    sensorNum: 18,
    arrayIndex: 14,
    name: "Arch Lateral (Row 5 Left)",
    region: "Midfoot",
    side: "Lateral",
    coords: { cx: 501.7, cy: 459.3, rx: 17, ry: 34 },
  },
  {
    padId: "r_row5_mid",
    pinNumber: 8,
    sensorNum: 8,
    arrayIndex: 6,
    name: "Arch Center (Row 5 Mid)",
    region: "Midfoot",
    side: "Central",
    coords: { cx: 552.1, cy: 456.5, rx: 15, ry: 35 },
  },
  {
    padId: "r_row5_right",
    pinNumber: 4,
    sensorNum: 4,
    arrayIndex: 3,
    name: "Arch Medial (Row 5 Right)",
    region: "Midfoot",
    side: "Medial",
    coords: { cx: 592.1, cy: 455.9, rx: 14, ry: 34 },
  },
  // Row 6
  {
    padId: "r_row6_left",
    pinNumber: 16,
    sensorNum: 16,
    arrayIndex: 12,
    name: "Heel Lateral (Row 6 Left)",
    region: "Heel",
    side: "Lateral",
    coords: { cx: 516.1, cy: 567.2, rx: 19, ry: 45 },
  },
  {
    padId: "r_row6_right",
    pinNumber: 17,
    sensorNum: 17,
    arrayIndex: 13,
    name: "Heel Medial (Row 6 Right)",
    region: "Heel",
    side: "Medial",
    coords: { cx: 584.2, cy: 570.6, rx: 16, ry: 45 },
  },
];

/**
 * LEFT FOOT PADS (Swapped horizontally in dashboard)
 * 
 * Row 1 (Toes):            Pin 11 (Left),                Pin 12 (Right)
 * Row 2 (Metatarsals):     Pin 1 (Left),  Pin 9 (Center), Pin 13 (Right)
 * Row 3 (Midfoot):         Pin 2 (Left),  Pin 5 (Center), Pin 14 (Right)
 * Row 4 (Lower Mid Arch):  Pin 3 (Left),  Pin 6 (Center), Pin 19 (Right)
 * Row 5 (Arch):            Pin 4 (Left),  Pin 8 (Center), Pin 18 (Right)
 * Row 6 (Heel):            Pin 17 (Left),                Pin 16 (Right)
 */
const LEFT_FOOT_PADS: FootPadDisplayInfo[] = [
  // Row 1
  {
    padId: "l_row1_left",
    pinNumber: 11,
    sensorNum: 11,
    arrayIndex: 8,
    name: "Big Toe (Row 1 Left)",
    region: "Toe",
    side: "Medial",
    coords: { cx: 203.9, cy: 94.5, rx: 28, ry: 32 },
  },
  {
    padId: "l_row1_right",
    pinNumber: 12,
    sensorNum: 12,
    arrayIndex: 9,
    name: "Lesser Toe (Row 1 Right)",
    region: "Toe",
    side: "Lateral",
    coords: { cx: 274.0, cy: 100.0, rx: 20, ry: 33 },
  },
  // Row 2
  {
    padId: "l_row2_left",
    pinNumber: 1,
    sensorNum: 1,
    arrayIndex: 0,
    name: "Forefoot Medial (Row 2 Left)",
    region: "Forefoot",
    side: "Medial",
    coords: { cx: 157.7, cy: 181.0, rx: 23, ry: 34 },
  },
  {
    padId: "l_row2_mid",
    pinNumber: 9,
    sensorNum: 9,
    arrayIndex: 7,
    name: "Forefoot Center (Row 2 Mid)",
    region: "Forefoot",
    side: "Central",
    coords: { cx: 220.8, cy: 180.7, rx: 21, ry: 35 },
  },
  {
    padId: "l_row2_right",
    pinNumber: 13,
    sensorNum: 13,
    arrayIndex: 10,
    name: "Forefoot Lateral (Row 2 Right)",
    region: "Forefoot",
    side: "Lateral",
    coords: { cx: 281.9, cy: 184.4, rx: 17, ry: 33 },
  },
  // Row 3
  {
    padId: "l_row3_left",
    pinNumber: 2,
    sensorNum: 2,
    arrayIndex: 1,
    name: "Midfoot Medial (Row 3 Left)",
    region: "Forefoot",
    side: "Medial",
    coords: { cx: 142.9, cy: 272.1, rx: 15, ry: 34 },
  },
  {
    padId: "l_row3_mid",
    pinNumber: 5,
    sensorNum: 5,
    arrayIndex: 4,
    name: "Midfoot Center (Row 3 Mid)",
    region: "Forefoot",
    side: "Central",
    coords: { cx: 205.5, cy: 270.6, rx: 18, ry: 35 },
  },
  {
    padId: "l_row3_right",
    pinNumber: 14,
    sensorNum: 14,
    arrayIndex: 11,
    name: "Midfoot Lateral (Row 3 Right)",
    region: "Forefoot",
    side: "Lateral",
    coords: { cx: 273.2, cy: 276.0, rx: 20, ry: 35 },
  },
  // Row 4
  {
    padId: "l_row4_left",
    pinNumber: 3,
    sensorNum: 3,
    arrayIndex: 2,
    name: "Lower Mid Medial (Row 4 Left)",
    region: "Midfoot",
    side: "Medial",
    coords: { cx: 146.6, cy: 365.2, rx: 17, ry: 34 },
  },
  {
    padId: "l_row4_mid",
    pinNumber: 6,
    sensorNum: 6,
    arrayIndex: 5,
    name: "Lower Mid Center (Row 4 Mid)",
    region: "Midfoot",
    side: "Central",
    coords: { cx: 198.4, cy: 365.0, rx: 16, ry: 34 },
  },
  {
    padId: "l_row4_right",
    pinNumber: 19,
    sensorNum: 19,
    arrayIndex: 15,
    name: "Lower Mid Lateral (Row 4 Right)",
    region: "Midfoot",
    side: "Lateral",
    coords: { cx: 256.7, cy: 369.3, rx: 19, ry: 34 },
  },
  // Row 5
  {
    padId: "l_row5_left",
    pinNumber: 4,
    sensorNum: 4,
    arrayIndex: 3,
    name: "Arch Medial (Row 5 Left)",
    region: "Midfoot",
    side: "Medial",
    coords: { cx: 152.1, cy: 456.9, rx: 14, ry: 34 },
  },
  {
    padId: "l_row5_mid",
    pinNumber: 8,
    sensorNum: 8,
    arrayIndex: 6,
    name: "Arch Center (Row 5 Mid)",
    region: "Midfoot",
    side: "Central",
    coords: { cx: 192.0, cy: 457.3, rx: 15, ry: 35 },
  },
  {
    padId: "l_row5_right",
    pinNumber: 18,
    sensorNum: 18,
    arrayIndex: 14,
    name: "Arch Lateral (Row 5 Right)",
    region: "Midfoot",
    side: "Lateral",
    coords: { cx: 241.3, cy: 459.1, rx: 17, ry: 34 },
  },
  // Row 6
  {
    padId: "l_row6_left",
    pinNumber: 17,
    sensorNum: 17,
    arrayIndex: 13,
    name: "Heel Medial (Row 6 Left)",
    region: "Heel",
    side: "Medial",
    coords: { cx: 160.3, cy: 571.2, rx: 16, ry: 45 },
  },
  {
    padId: "l_row6_right",
    pinNumber: 16,
    sensorNum: 16,
    arrayIndex: 12,
    name: "Heel Lateral (Row 6 Right)",
    region: "Heel",
    side: "Lateral",
    coords: { cx: 227.5, cy: 566.9, rx: 19, ry: 45 },
  },
];

/**
 * Returns the exact 16 pads for the chosen foot side
 */
export function getFootPads(foot: FootSide): FootPadDisplayInfo[] {
  return foot === "left" ? LEFT_FOOT_PADS : RIGHT_FOOT_PADS;
}

/**
 * Backward compatibility export
 */
export const SENSOR_DEFINITIONS: SensorPadInfo[] = RIGHT_FOOT_PADS.map((pad, idx) => ({
  pinNumber: pad.pinNumber,
  sensorNum: pad.pinNumber,
  arrayIndex: pad.arrayIndex,
  name: pad.name,
  region: pad.region,
  side: pad.side,
  coords: {
    right: pad.coords,
    left: LEFT_FOOT_PADS[idx].coords,
  },
}));

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
