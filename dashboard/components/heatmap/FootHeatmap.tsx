"use client";

import React, { useState } from "react";
import { FootSide } from "@/types";
import { SENSOR_DEFINITIONS, getSensorValue, getPressureStyle, SensorPadInfo } from "@/lib/sensorMapping";
import { LEFT_FOOT_OUTLINE, RIGHT_FOOT_OUTLINE } from "@/lib/footPaths";

interface FootHeatmapProps {
  foot: FootSide;
  fsr: number[]; // 16 values
  connected: boolean;
  sampleRate?: number;
  showLabels?: boolean;
  className?: string;
  onSelectSensor?: (sensor: SensorPadInfo | null) => void;
}

export function FootHeatmap({
  foot,
  fsr,
  connected,
  sampleRate = 0,
  showLabels = true,
  className = "",
  onSelectSensor,
}: FootHeatmapProps) {
  const [hoveredSensorNum, setHoveredSensorNum] = useState<number | null>(null);

  // ViewBox focused on the specific foot
  // Left foot is roughly X: 90..330, Y: 20..685
  // Right foot is roughly X: 410..650, Y: 20..685
  const viewBox = foot === "left" ? "90 15 245 675" : "405 15 245 675";
  const outlinePath = foot === "left" ? LEFT_FOOT_OUTLINE : RIGHT_FOOT_OUTLINE;

  // Calculate total foot load
  const totalLoad = fsr.reduce((acc, val) => acc + val, 0);
  const maxPossibleLoad = 16 * 4095;
  const loadPercentage = Math.round((totalLoad / maxPossibleLoad) * 100);

  return (
    <div className={`relative flex flex-col items-center bg-slate-900/60 rounded-2xl border border-slate-800 p-4 shadow-xl backdrop-blur-md ${className}`}>
      {/* Header Badge */}
      <div className="w-full flex items-center justify-between mb-2 px-2">
        <div className="flex items-center gap-2">
          <span className={`inline-block w-2.5 h-2.5 rounded-full ${connected ? "bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]" : "bg-rose-500"}`} />
          <h3 className="font-semibold text-slate-100 text-sm uppercase tracking-wider">
            {foot === "left" ? "Left Insole" : "Right Insole"}
          </h3>
        </div>
        <div className="text-xs text-slate-400 font-mono">
          {connected ? `${sampleRate.toFixed(1)} Hz` : "Offline"}
        </div>
      </div>

      {/* Main SVG Container */}
      <div className="relative w-full aspect-[245/675] max-h-[460px] flex items-center justify-center">
        <svg
          viewBox={viewBox}
          className="w-full h-full select-none overflow-visible"
        >
          {/* Subtle Outer Glow & Shadow Filters */}
          <defs>
            <filter id={`foot-glow-${foot}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <linearGradient id={`insole-fill-${foot}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0f172a" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#1e293b" stopOpacity="0.95" />
            </linearGradient>
          </defs>

          {/* Insole Body Fill */}
          <path
            d={outlinePath}
            fill={`url(#insole-fill-${foot})`}
            className="transition-colors duration-300"
          />

          {/* Insole Stroke Contour */}
          <path
            d={outlinePath}
            fill="none"
            stroke={connected ? "#38bdf8" : "#475569"}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-colors duration-500"
            filter={connected ? `url(#foot-glow-${foot})` : undefined}
            strokeOpacity={connected ? 0.8 : 0.4}
          />

          {/* Sensor Pads */}
          {SENSOR_DEFINITIONS.map((sensor) => {
            const padCoord = sensor.coords[foot];
            const rawVal = getSensorValue(fsr, sensor.sensorNum);
            const style = getPressureStyle(rawVal);
            const isHovered = hoveredSensorNum === sensor.sensorNum;

            return (
              <g
                key={`sensor-${foot}-${sensor.sensorNum}`}
                className="cursor-pointer transition-all duration-150"
                onMouseEnter={() => {
                  setHoveredSensorNum(sensor.sensorNum);
                  onSelectSensor?.(sensor);
                }}
                onMouseLeave={() => {
                  setHoveredSensorNum(null);
                  onSelectSensor?.(null);
                }}
              >
                {/* Pressure Halo / Glow (when active) */}
                {rawVal > 50 && (
                  <ellipse
                    cx={padCoord.cx}
                    cy={padCoord.cy}
                    rx={padCoord.rx + 8}
                    ry={padCoord.ry + 8}
                    fill={style.fill}
                    opacity="0.3"
                    className="animate-pulse"
                  />
                )}

                {/* Sensor Pad Capsule */}
                <ellipse
                  cx={padCoord.cx}
                  cy={padCoord.cy}
                  rx={isHovered ? padCoord.rx + 2 : padCoord.rx}
                  ry={isHovered ? padCoord.ry + 2 : padCoord.ry}
                  fill={style.fill}
                  stroke={isHovered ? "#ffffff" : style.stroke}
                  strokeWidth={isHovered ? 2.5 : 1.5}
                  className="transition-all duration-150"
                />

                {/* Sensor Number or Pressure Value */}
                {showLabels && (
                  <text
                    x={padCoord.cx}
                    y={padCoord.cy}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={isHovered ? "#ffffff" : style.textColor}
                    fontSize={isHovered ? "14" : "11"}
                    fontWeight="700"
                    fontFamily="monospace"
                    pointerEvents="none"
                  >
                    {isHovered ? rawVal : `#${sensor.sensorNum}`}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Foot Summary Stats */}
      <div className="w-full mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-center text-xs">
        <div className="bg-slate-800/50 rounded-lg p-1.5">
          <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Total Pressure</span>
          <span className="font-mono font-bold text-slate-100">{totalLoad.toLocaleString()}</span>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-1.5">
          <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Foot Load</span>
          <span className="font-mono font-bold text-cyan-400">{loadPercentage}%</span>
        </div>
      </div>
    </div>
  );
}

