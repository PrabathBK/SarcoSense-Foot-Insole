"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useMQTT } from "@/hooks/useMQTT";
import { usePatientStore } from "@/store/patientStore";
import { DualFootView } from "@/components/heatmap/DualFootView";
import { IMUChart } from "@/components/charts/IMUChart";
import { SensorTable } from "@/components/charts/SensorTable";
import { PatientCard } from "@/components/patient/PatientCard";
import { AddPatientDialog } from "@/components/patient/AddPatientDialog";
import { PatientList } from "@/components/patient/PatientList";
import { CaptureControls } from "@/components/capture/CaptureControls";
import { SessionHistory } from "@/components/capture/SessionHistory";
import {
  Layers,
  Activity,
  Table as TableIcon,
  Sliders,
  FlaskConical,
} from "lucide-react";

export default function DemoPage() {
  const { left, right } = useMQTT();
  const [activeTab, setActiveTab] = useState<"all" | "imu" | "table">("all");

  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [isPatientListOpen, setIsPatientListOpen] = useState(false);
  const [isSessionHistoryOpen, setIsSessionHistoryOpen] = useState(false);

  const loadPatients = usePatientStore((s) => s.loadPatients);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar currentMode="demo" />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col gap-6">
        {/* Demo Mode Top Banner */}
        <div className="bg-gradient-to-r from-blue-950/60 to-slate-900/60 border border-blue-900/50 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-white">Engineering & Hardware Demo Station</h2>
              <p className="text-xs text-slate-400">
                Live sensor testing, 16-channel pressure heatmaps, 6-DOF IMU dynamics, and packet inspection.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-mono px-3 py-1 rounded-lg bg-blue-950 text-blue-300 border border-blue-800 font-bold">
              PORTAL: DEMO
            </span>
          </div>
        </div>

        {/* Top Controls: Subject & Capture */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-5">
            <PatientCard
              onOpenAdd={() => setIsAddPatientOpen(true)}
              onOpenList={() => setIsPatientListOpen(true)}
            />
          </div>
          <div className="lg:col-span-7">
            <CaptureControls
              onOpenHistory={() => setIsSessionHistoryOpen(true)}
              mode="demo"
            />
          </div>
        </div>

        {/* Hardware Status Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
              left.connected
                ? "bg-slate-900/70 border-blue-500/40 shadow-blue-500/5 shadow-md"
                : "bg-slate-900/40 border-slate-800"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span
                className={`w-3 h-3 rounded-full ${
                  left.connected
                    ? "bg-blue-400 animate-pulse shadow-[0_0_8px_#3b82f6]"
                    : "bg-slate-600"
                }`}
              />
              <div>
                <h4 className="font-semibold text-xs text-slate-100">Left Insole (smart_insole/left)</h4>
                <p className="text-[11px] text-slate-400 font-mono">
                  {left.connected ? `${left.sampleRate.toFixed(1)} Hz • ${left.packetCount} packets` : "Awaiting hardware..."}
                </p>
              </div>
            </div>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                left.connected
                  ? "bg-blue-950 text-blue-300 border border-blue-800"
                  : "bg-slate-800 text-slate-400"
              }`}
            >
              {left.connected ? "ONLINE" : "STANDBY"}
            </span>
          </div>

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
                <h4 className="font-semibold text-xs text-slate-100">Right Insole (smart_insole/right)</h4>
                <p className="text-[11px] text-slate-400 font-mono">
                  {right.connected ? `${right.sampleRate.toFixed(1)} Hz • ${right.packetCount} packets` : "Awaiting hardware..."}
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
              {right.connected ? "ONLINE" : "STANDBY"}
            </span>
          </div>
        </div>

        {/* Live Heatmap Component */}
        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Real-Time Dual Foot Heatmap
            </h2>
            <span className="text-xs text-slate-400">
              {right.connected || left.connected ? (
                <span className="text-emerald-400 font-mono font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                  Streaming active telemetry
                </span>
              ) : (
                "Turn on your ESP32 to see live pressure"
              )}
            </span>
          </div>

          <DualFootView />
        </section>

        {/* View Selection Filter Tabs */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            Telemetry Panels
          </h2>
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === "all"
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              All Panels
            </button>
            <button
              onClick={() => setActiveTab("imu")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === "imu"
                  ? "bg-cyan-600 text-white shadow-sm shadow-cyan-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              IMU Graphs
            </button>
            <button
              onClick={() => setActiveTab("table")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === "table"
                  ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              FSR Table
            </button>
          </div>
        </div>

        {/* IMU Real-Time Graphs */}
        {(activeTab === "all" || activeTab === "imu") && <IMUChart />}

        {/* 16-Sensor Real-Time Matrix Table */}
        {(activeTab === "all" || activeTab === "table") && <SensorTable />}
      </main>

      {/* Modals */}
      <AddPatientDialog
        isOpen={isAddPatientOpen}
        onClose={() => setIsAddPatientOpen(false)}
      />

      <PatientList
        isOpen={isPatientListOpen}
        onClose={() => setIsPatientListOpen(false)}
        onOpenAdd={() => setIsAddPatientOpen(true)}
      />

      <SessionHistory
        isOpen={isSessionHistoryOpen}
        onClose={() => setIsSessionHistoryOpen(false)}
      />
    </div>
  );
}

