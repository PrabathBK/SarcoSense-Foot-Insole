import { FootSide } from "@/types";

export interface SensorPadInfo {
  sensorNum: number; // 1 to 16
  arrayIndex: number; // 0 to 15 (array index = 16 - sensorNum)
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
 * EXACT PHYSICAL MAPPING (from foot-numbered.jpeg)
 *
 * Layout on insole (Left to Right, Row by Row):
 * Row 1 (Toes):              #10 (Left),                     #2 (Right)
 * Row 2 (Metatarsals):       #6 (Left),      #15 (Center),   #1 (Right)
 * Row 3 (Forefoot):          #14 (Left),     #3 (Center),    #9 (Right)
 * Row 4 (Midfoot Arch):      #16 (Left),     #11 (Center),   #5 (Right)
 * Row 5 (Heel-Lead):         #8 (Left),      #7 (Center),    #13 (Right)
 * Row 6 (Heel):              #4 (Left),                      #12 (Right)
 *
 * Array mapping:
 * fsr[0]=16, fsr[1]=15, ..., fsr[15]=1 (arrayIndex = 16 - sensorNum)
 */
export const SENSOR_DEFINITIONS: SensorPadInfo[] = [
  // ==========================================
  // ROW 1: TOES
  // ==========================================
  {
    sensorNum: 10,
    arrayIndex: 6,
    name: "Toe Left (Outer)",
    region: "Toe",
    side: "Lateral",
    coords: {
      left: { cx: 274.0, cy: 100.0, rx: 20, ry: 33 }, // swapped with #2 on left insole
      right: { cx: 471.0, cy: 100.3, rx: 20, ry: 33 },
    },
  },
  {
    sensorNum: 2,
    arrayIndex: 14,
    name: "Toe Right (Inner)",
    region: "Toe",
    side: "Medial",
    coords: {
      left: { cx: 203.9, cy: 94.5, rx: 28, ry: 32 }, // swapped with #10 on left insole
      right: { cx: 539.7, cy: 95.8, rx: 28, ry: 32 },
    },
  },

  // ==========================================
  // ROW 2: METATARSALS
  // ==========================================
  {
    sensorNum: 6,
    arrayIndex: 10,
    name: "Forefoot Left",
    region: "Forefoot",
    side: "Lateral",
    coords: {
      left: { cx: 281.9, cy: 184.4, rx: 17, ry: 33 }, // swapped with #1 on left insole
      right: { cx: 462.6, cy: 183.6, rx: 17, ry: 33 },
    },
  },
  {
    sensorNum: 15,
    arrayIndex: 1,
    name: "Forefoot Center",
    region: "Forefoot",
    side: "Central",
    coords: {
      left: { cx: 220.8, cy: 180.7, rx: 21, ry: 35 },
      right: { cx: 523.3, cy: 180.5, rx: 21, ry: 35 },
    },
  },
  {
    sensorNum: 1,
    arrayIndex: 15,
    name: "Forefoot Right",
    region: "Forefoot",
    side: "Medial",
    coords: {
      left: { cx: 157.7, cy: 181.0, rx: 23, ry: 34 }, // swapped with #6 on left insole
      right: { cx: 587.6, cy: 180.1, rx: 23, ry: 34 },
    },
  },

  // ==========================================
  // ROW 3: FOREFOOT / MIDFOOT
  // ==========================================
  {
    sensorNum: 14,
    arrayIndex: 2,
    name: "Forefoot-Mid Left",
    region: "Forefoot",
    side: "Lateral",
    coords: {
      left: { cx: 273.2, cy: 276.0, rx: 20, ry: 35 }, // swapped with #9 on left insole
      right: { cx: 471.6, cy: 275.8, rx: 20, ry: 35 },
    },
  },
  {
    sensorNum: 3,
    arrayIndex: 13,
    name: "Forefoot-Mid Center",
    region: "Forefoot",
    side: "Central",
    coords: {
      left: { cx: 205.5, cy: 270.6, rx: 18, ry: 35 },
      right: { cx: 538.5, cy: 270.6, rx: 18, ry: 35 },
    },
  },
  {
    sensorNum: 9,
    arrayIndex: 7,
    name: "Forefoot-Mid Right",
    region: "Forefoot",
    side: "Medial",
    coords: {
      left: { cx: 142.9, cy: 272.1, rx: 15, ry: 34 }, // swapped with #14 on left insole
      right: { cx: 600.9, cy: 272.0, rx: 15, ry: 34 },
    },
  },

  // ==========================================
  // ROW 4: MIDFOOT ARCH
  // ==========================================
  {
    sensorNum: 16,
    arrayIndex: 0,
    name: "Midfoot Left",
    region: "Midfoot",
    side: "Lateral",
    coords: {
      left: { cx: 256.7, cy: 369.3, rx: 19, ry: 34 }, // swapped with #5 on left insole
      right: { cx: 487.9, cy: 369.2, rx: 19, ry: 34 },
    },
  },
  {
    sensorNum: 11,
    arrayIndex: 5,
    name: "Midfoot Center",
    region: "Midfoot",
    side: "Central",
    coords: {
      left: { cx: 198.4, cy: 365.0, rx: 16, ry: 34 },
      right: { cx: 546.7, cy: 364.8, rx: 16, ry: 34 },
    },
  },
  {
    sensorNum: 5,
    arrayIndex: 11,
    name: "Midfoot Right",
    region: "Midfoot",
    side: "Medial",
    coords: {
      left: { cx: 146.6, cy: 365.2, rx: 17, ry: 34 }, // swapped with #16 on left insole
      right: { cx: 597.7, cy: 365.3, rx: 17, ry: 34 },
    },
  },

  // ==========================================
  // ROW 5: HEEL-LEAD
  // ==========================================
  {
    sensorNum: 8,
    arrayIndex: 8,
    name: "Heel-Lead Left",
    region: "Midfoot",
    side: "Lateral",
    coords: {
      left: { cx: 241.3, cy: 459.1, rx: 17, ry: 34 }, // swapped with #13 on left insole
      right: { cx: 501.7, cy: 459.3, rx: 17, ry: 34 },
    },
  },
  {
    sensorNum: 7,
    arrayIndex: 9,
    name: "Heel-Lead Center",
    region: "Midfoot",
    side: "Central",
    coords: {
      left: { cx: 192.0, cy: 457.3, rx: 15, ry: 35 },
      right: { cx: 552.1, cy: 456.5, rx: 15, ry: 35 },
    },
  },
  {
    sensorNum: 13,
    arrayIndex: 3,
    name: "Heel-Lead Right",
    region: "Midfoot",
    side: "Medial",
    coords: {
      left: { cx: 152.1, cy: 456.9, rx: 14, ry: 34 }, // swapped with #8 on left insole
      right: { cx: 592.1, cy: 455.9, rx: 14, ry: 34 },
    },
  },

  // ==========================================
  // ROW 6: HEEL
  // ==========================================
  {
    sensorNum: 4,
    arrayIndex: 12,
    name: "Heel Left",
    region: "Heel",
    side: "Lateral",
    coords: {
      left: { cx: 227.5, cy: 566.9, rx: 19, ry: 45 }, // swapped with #12 on left insole
      right: { cx: 516.1, cy: 567.2, rx: 19, ry: 45 },
    },
  },
  {
    sensorNum: 12,
    arrayIndex: 4,
    name: "Heel Right",
    region: "Heel",
    side: "Medial",
    coords: {
      left: { cx: 160.3, cy: 571.2, rx: 16, ry: 45 }, // swapped with #4 on left insole
      right: { cx: 584.2, cy: 570.6, rx: 16, ry: 45 },
    },
  },
];

/**
 * Returns raw FSR value for a given sensor number (1 to 16)
 * Array is ordered [16..1], so fsr[0]=16, fsr[15]=1
 */
export function getSensorValue(fsr: number[], sensorNum: number): number {
  const index = 16 - sensorNum;
  if (!fsr || index < 0 || index >= fsr.length) return 0;
  return fsr[index] || 0;
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
