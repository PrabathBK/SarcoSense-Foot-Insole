"use client";

import React, { useState } from "react";
import { useSensorStore } from "@/store/sensorStore";
import { FootSide } from "@/types";
import { getFootPads, getSensorValue, getPressureStyle } from "@/lib/sensorMapping";
import { Table, Footprints, Flame, BarChart2 } from "lucide-react";

export function SensorTable() {
  const [selectedFoot, setSelectedFoot] = useState<FootSide>("right");
  const fsr = useSensorStore((s) => s[selectedFoot].fsr);
  const isConnected = useSensorStore((s) => s[selectedFoot].connected);

  const footPads = getFootPads(selectedFoot);

  // Compute stats
  let maxVal = 0;
  let maxSensorNum = 1;
  let activeCount = 0;
  let sumVal = 0;

  footPads.forEach((s) => {
    const val = getSensorValue(fsr, s.pinNumber);
    sumVal += val;
    if (val > 50) activeCount++;
    if (val > maxVal) {
      maxVal = val;
      maxSensorNum = s.pinNumber;
    }
  });

  const avgVal = Math.round(sumVal / 16);

  // Sort sensors by pinNumber (1 to 19)
  const sortedSensors = [...footPads].sort((a, b) => a.pinNumber - b.pinNumber);

  return (
    <div className="flex flex-col gap-4 bg-slate-900/60 border border-slate-800 rounded-2xl p-4 md:p-5 shadow-xl backdrop-blur-md">
      {/* Table Header with Foot Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Table className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-slate-100 uppercase tracking-wider">
              16-Channel FSR Plantar Pressure Telemetry
            </h3>
            <p className="text-xs text-slate-400">
              Live multi-point resistive pressure matrix
            </p>
          </div>
        </div>

        {/* Foot Toggle */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setSelectedFoot("left")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedFoot === "left"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Footprints className="w-3.5 h-3.5" />
            Left Insole
          </button>
          <button
            onClick={() => setSelectedFoot("right")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedFoot === "right"
                ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Footprints className="w-3.5 h-3.5" />
            Right Insole
          </button>
        </div>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="bg-slate-950/60 border border-slate-800/80 p-2.5 rounded-xl">
          <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Active Sensors</span>
          <span className="text-base font-bold font-mono text-cyan-400">{activeCount} / 16</span>
        </div>
        <div className="bg-slate-950/60 border border-slate-800/80 p-2.5 rounded-xl">
          <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Peak Pressure</span>
          <span className="text-base font-bold font-mono text-rose-400">{maxVal} (Sensor #{maxSensorNum})</span>
        </div>
        <div className="bg-slate-950/60 border border-slate-800/80 p-2.5 rounded-xl">
          <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Mean Pressure</span>
          <span className="text-base font-bold font-mono text-emerald-400">{avgVal} ADC</span>
        </div>
        <div className="bg-slate-950/60 border border-slate-800/80 p-2.5 rounded-xl">
          <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Insole Status</span>
          <span className={`text-base font-bold font-mono ${isConnected ? "text-emerald-400" : "text-slate-500"}`}>
            {isConnected ? "ONLINE" : "OFFLINE"}
          </span>
        </div>
      </div>

      {/* 16-Sensor Data Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/90 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-2.5 px-3">Insole Pin</th>
              <th className="py-2.5 px-3">Array Index</th>
              <th className="py-2.5 px-3">Anatomical Region</th>
              <th className="py-2.5 px-3">Side</th>
              <th className="py-2.5 px-3">Raw ADC (0-4095)</th>
              <th className="py-2.5 px-3 w-44">Pressure Bar</th>
              <th className="py-2.5 px-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {sortedSensors.map((sensor) => {
              const rawVal = getSensorValue(fsr, sensor.sensorNum);
              const style = getPressureStyle(rawVal);
              const percentage = Math.min(100, Math.round((rawVal / 4095) * 100));

              return (
                <tr
                  key={`table-sensor-${sensor.sensorNum}`}
                  className="hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-2 px-3 font-mono font-bold text-slate-100 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: style.stroke }} />
                    #{sensor.sensorNum}
                  </td>
                  <td className="py-2 px-3 font-mono text-slate-400">
                    fsr[{sensor.arrayIndex}]
                  </td>
                  <td className="py-2 px-3 font-medium text-slate-200">
                    {sensor.name}
                  </td>
                  <td className="py-2 px-3">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {sensor.region} ({sensor.side})
                    </span>
                  </td>
                  <td className="py-2 px-3 font-mono font-bold text-slate-100">
                    {rawVal}
                  </td>
                  <td className="py-2 px-3">
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-100"
                        style={{
                          width: `${Math.max(percentage, 2)}%`,
                          backgroundColor: style.stroke,
                          boxShadow: rawVal > 50 ? `0 0 8px ${style.stroke}` : "none",
                        }}
                      />
                    </div>
                  </td>
                  <td className="py-2 px-3 text-right">
                    {rawVal > 50 ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded-full">
                        <Flame className="w-3 h-3 text-emerald-400" />
                        LOAD
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-slate-500">IDLE</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

