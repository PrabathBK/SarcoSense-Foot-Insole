"use client";

import React, { useState } from "react";
import { FootHeatmap } from "./FootHeatmap";
import { useSensorStore } from "@/store/sensorStore";
import { SensorPadInfo, getSensorValue } from "@/lib/sensorMapping";
import { Info, Gauge } from "lucide-react";

export function DualFootView() {
  const left = useSensorStore((s) => s.left);
  const right = useSensorStore((s) => s.right);

  const [selectedSensor, setSelectedSensor] = useState<{
    foot: "left" | "right";
    info: SensorPadInfo;
  } | null>(null);

  // Compute bilateral weight distribution
  const leftTotal = left.fsr.reduce((a, b) => a + b, 0);
  const rightTotal = right.fsr.reduce((a, b) => a + b, 0);
  const combined = leftTotal + rightTotal;
  const leftBalance = combined > 0 ? Math.round((leftTotal / combined) * 100) : 50;
  const rightBalance = combined > 0 ? Math.round((rightTotal / combined) * 100) : 50;

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Top Bilateral Weight Balance Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 shadow-lg">
        <div className="flex items-center justify-between text-xs text-slate-300 font-medium mb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Left Foot: <strong className="font-mono text-blue-400">{leftBalance}%</strong></span>
          </div>
          <div className="flex items-center gap-1 text-slate-400 text-[11px]">
            <Gauge className="w-3.5 h-3.5 text-cyan-400" />
            <span>Bilateral Pressure Balance</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>Right Foot: <strong className="font-mono text-cyan-400">{rightBalance}%</strong></span>
            <span className="w-2 h-2 rounded-full bg-cyan-500" />
          </div>
        </div>
        <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden flex">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-150"
            style={{ width: `${leftBalance}%` }}
          />
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-teal-400 transition-all duration-150"
            style={{ width: `${rightBalance}%` }}
          />
        </div>
      </div>

      {/* Side-by-Side Dual Insole View */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Insole */}
        <FootHeatmap
          foot="left"
          fsr={left.fsr}
          connected={left.connected}
          sampleRate={left.sampleRate}
          onSelectSensor={(sensor) =>
            setSelectedSensor(sensor ? { foot: "left", info: sensor } : null)
          }
        />

        {/* Right Insole */}
        <FootHeatmap
          foot="right"
          fsr={right.fsr}
          connected={right.connected}
          sampleRate={right.sampleRate}
          onSelectSensor={(sensor) =>
            setSelectedSensor(sensor ? { foot: "right", info: sensor } : null)
          }
        />
      </div>

      {/* Sensor Detail & Color Scale Legend */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        {/* Active Hover Inspector */}
        <div className="flex items-center gap-2 text-slate-300">
          <Info className="w-4 h-4 text-cyan-400 shrink-0" />
          {selectedSensor ? (
            <div>
              <span className="font-semibold text-slate-100">
                {selectedSensor.foot === "left" ? "Left" : "Right"} Foot Sensor #{selectedSensor.info.sensorNum}:
              </span>{" "}
              <span className="text-cyan-400 font-medium">{selectedSensor.info.name}</span> ({selectedSensor.info.region} • {selectedSensor.info.side}) — Value:{" "}
              <strong className="font-mono text-emerald-400">
                {getSensorValue(
                  selectedSensor.foot === "left" ? left.fsr : right.fsr,
                  selectedSensor.info.sensorNum
                )}
              </strong>
            </div>
          ) : (
            <span className="text-slate-400">
              Hover over any sensor pad to inspect anatomical location and raw ADC pressure (0 - 4095).
            </span>
          )}
        </div>

        {/* Pressure Color Scale Legend */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] text-slate-500 font-mono">0</span>
          <div className="flex h-2.5 rounded overflow-hidden shadow-inner">
            <span className="w-6 bg-slate-700" title="Idle" />
            <span className="w-6 bg-cyan-500" title="Low" />
            <span className="w-6 bg-emerald-500" title="Medium-Low" />
            <span className="w-6 bg-amber-500" title="Medium-High" />
            <span className="w-6 bg-rose-500" title="Peak" />
          </div>
          <span className="text-[10px] text-slate-500 font-mono">4095</span>
        </div>
      </div>
    </div>
  );
}

