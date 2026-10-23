"use client";

import React, { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { useSensorStore } from "@/store/sensorStore";
import { FootSide } from "@/types";
import { Activity, Compass, Footprints } from "lucide-react";

export function IMUChart() {
  const [selectedFoot, setSelectedFoot] = useState<FootSide>("right");
  const imuHistory = useSensorStore((s) => s.imuHistory[selectedFoot]);
  const currentIMU = useSensorStore((s) => s[selectedFoot].imu);
  const isConnected = useSensorStore((s) => s[selectedFoot].connected);

  return (
    <div className="flex flex-col gap-4 bg-slate-900/60 border border-slate-800 rounded-2xl p-4 md:p-5 shadow-xl backdrop-blur-md">
      {/* Chart Header & Foot Selector Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-slate-100 uppercase tracking-wider">
              MPU6050 Motion & Orientation Telemetry
            </h3>
            <p className="text-xs text-slate-400">
              Real-time 6-DOF inertial sensor streaming (20 Hz)
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
            Left Foot
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
            Right Foot
          </button>
        </div>
      </div>

      {/* Live Value Pill Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs font-mono">
        <div className="bg-slate-950/60 border border-slate-800/80 p-2 rounded-lg">
          <span className="text-rose-400 block text-[10px] uppercase font-bold">Accel X</span>
          <span className="text-slate-100 font-bold">{currentIMU.ax.toFixed(2)} m/s²</span>
        </div>
        <div className="bg-slate-950/60 border border-slate-800/80 p-2 rounded-lg">
          <span className="text-emerald-400 block text-[10px] uppercase font-bold">Accel Y</span>
          <span className="text-slate-100 font-bold">{currentIMU.ay.toFixed(2)} m/s²</span>
        </div>
        <div className="bg-slate-950/60 border border-slate-800/80 p-2 rounded-lg">
          <span className="text-blue-400 block text-[10px] uppercase font-bold">Accel Z</span>
          <span className="text-slate-100 font-bold">{currentIMU.az.toFixed(2)} m/s²</span>
        </div>
        <div className="bg-slate-950/60 border border-slate-800/80 p-2 rounded-lg">
          <span className="text-amber-400 block text-[10px] uppercase font-bold">Gyro X</span>
          <span className="text-slate-100 font-bold">{currentIMU.gx.toFixed(2)} rad/s</span>
        </div>
        <div className="bg-slate-950/60 border border-slate-800/80 p-2 rounded-lg">
          <span className="text-purple-400 block text-[10px] uppercase font-bold">Gyro Y</span>
          <span className="text-slate-100 font-bold">{currentIMU.gy.toFixed(2)} rad/s</span>
        </div>
        <div className="bg-slate-950/60 border border-slate-800/80 p-2 rounded-lg">
          <span className="text-teal-400 block text-[10px] uppercase font-bold">Gyro Z</span>
          <span className="text-slate-100 font-bold">{currentIMU.gz.toFixed(2)} rad/s</span>
        </div>
      </div>

      {/* Two Graphs: Accelerometer & Gyroscope */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Accelerometer Chart */}
        <div className="bg-slate-950/50 border border-slate-800/60 rounded-xl p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs px-1">
            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-rose-400" />
              Linear Acceleration (m/s²)
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              {isConnected ? "Active" : "Awaiting data"}
            </span>
          </div>

          <div className="w-full h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={imuHistory} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} domain={[-20, 20]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    fontSize: "11px",
                    borderRadius: "8px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "4px" }} />
                <Line
                  type="monotone"
                  dataKey="ax"
                  name="ax"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="ay"
                  name="ay"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="az"
                  name="az"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gyroscope Chart */}
        <div className="bg-slate-950/50 border border-slate-800/60 rounded-xl p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs px-1">
            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              Angular Velocity / Gyro (rad/s)
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              {isConnected ? "Active" : "Awaiting data"}
            </span>
          </div>

          <div className="w-full h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={imuHistory} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} domain={[-5, 5]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    fontSize: "11px",
                    borderRadius: "8px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "4px" }} />
                <Line
                  type="monotone"
                  dataKey="gx"
                  name="gx"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="gy"
                  name="gy"
                  stroke="#a855f7"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="gz"
                  name="gz"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

