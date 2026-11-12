"use client";

import React from "react";
import { useSensorStore } from "@/store/sensorStore";

interface HardwareStatusStripProps {
  mode: "demo" | "clinical";
}

export function HardwareStatusStrip({ mode }: HardwareStatusStripProps) {
  const left = useSensorStore((s) => s.left);
  const right = useSensorStore((s) => s.right);

  const leftColor = mode === "clinical" ? "emerald" : "blue";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Left Insole */}
      <div
        className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
          left.connected
            ? mode === "clinical"
              ? "bg-slate-900/70 border-emerald-500/40 shadow-emerald-500/5 shadow-md"
              : "bg-slate-900/70 border-blue-500/40 shadow-blue-500/5 shadow-md"
            : "bg-slate-900/40 border-slate-800"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <span
            className={`w-3 h-3 rounded-full ${
              left.connected
                ? leftColor === "emerald"
                  ? "bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]"
                  : "bg-blue-400 animate-pulse shadow-[0_0_8px_#3b82f6]"
                : "bg-slate-600"
            }`}
          />
          <div>
            <h4 className="font-semibold text-xs text-slate-100">
              {mode === "clinical" ? "Left Insole Sensor" : "Left Insole (smart_insole/left)"}
            </h4>
            <p className="text-[11px] text-slate-400 font-mono">
              {left.connected
                ? `${left.sampleRate.toFixed(1)} Hz • ${left.packetCount} packets`
                : mode === "clinical"
                ? "Awaiting patient setup"
                : "Awaiting hardware..."}
            </p>
          </div>
        </div>
        <span
          className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
            left.connected
              ? leftColor === "emerald"
                ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                : "bg-blue-950 text-blue-300 border border-blue-800"
              : "bg-slate-800 text-slate-400"
          }`}
        >
          {left.connected ? "ACTIVE" : "STANDBY"}
        </span>
      </div>

      {/* Right Insole */}
      <div
        className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
          right.connected
            ? "bg-slate-900/70 border-cyan-500/40 shadow-cyan-500/5 shadow-md"
            : "bg-slate-900/40 border-slate-800"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <span
            className={`w-3 h-3 rounded-full ${
              right.connected
                ? "bg-cyan-400 animate-pulse shadow-[0_0_8px_#06b6d4]"
                : "bg-slate-600"
            }`}
          />
          <div>
            <h4 className="font-semibold text-xs text-slate-100">
              {mode === "clinical" ? "Right Insole Sensor" : "Right Insole (smart_insole/right)"}
            </h4>
            <p className="text-[11px] text-slate-400 font-mono">
              {right.connected
                ? `${right.sampleRate.toFixed(1)} Hz • ${right.packetCount} packets`
                : mode === "clinical"
                ? "Awaiting patient setup"
                : "Awaiting hardware..."}
            </p>
          </div>
        </div>
        <span
          className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
            right.connected
              ? "bg-cyan-950 text-cyan-300 border border-cyan-800"
              : "bg-slate-800 text-slate-400"
          }`}
        >
          {right.connected ? "ACTIVE" : "STANDBY"}
        </span>
      </div>
    </div>
  );
}

