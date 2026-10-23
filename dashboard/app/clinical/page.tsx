"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useMQTT } from "@/hooks/useMQTT";
import { usePatientStore } from "@/store/patientStore";
import { ClinicalBalanceCard } from "@/components/clinical/ClinicalBalanceCard";
import { PatientCard } from "@/components/patient/PatientCard";
import { AddPatientDialog } from "@/components/patient/AddPatientDialog";
import { PatientList } from "@/components/patient/PatientList";
import { CaptureControls } from "@/components/capture/CaptureControls";
import { SessionHistory } from "@/components/capture/SessionHistory";
import {
  Stethoscope,
  HeartPulse,
  History,
  ClipboardList,
} from "lucide-react";

export default function ClinicalPage() {
  const { left, right } = useMQTT();
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [isPatientListOpen, setIsPatientListOpen] = useState(false);
  const [isSessionHistoryOpen, setIsSessionHistoryOpen] = useState(false);

  const loadPatients = usePatientStore((s) => s.loadPatients);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar currentMode="clinical" />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col gap-6">
        {/* Clinical Mode Top Banner */}
        <div className="bg-gradient-to-r from-emerald-950/60 to-slate-900/60 border border-emerald-900/50 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-white">Clinical Assessment & Screening Station</h2>
              <p className="text-xs text-slate-400">
                Standardized gait protocol for Sarcopenia staging: anthropometrics, bilateral balance, and timestamped trial recording.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-mono px-3 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
              PORTAL: CLINICAL
            </span>
          </div>
        </div>

        {/* Primary Row: Subject Intake Card & Trial Capture Controls */}
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
              mode="clinical"
            />
          </div>
        </div>

        {/* Insole Hardware Connectivity & Signal Health */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
              left.connected
                ? "bg-slate-900/70 border-emerald-500/40 shadow-emerald-500/5 shadow-md"
                : "bg-slate-900/40 border-slate-800"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span
                className={`w-3 h-3 rounded-full ${
                  left.connected
                    ? "bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]"
                    : "bg-slate-600"
                }`}
              />
              <div>
                <h4 className="font-semibold text-xs text-slate-100">Left Insole Sensor</h4>
                <p className="text-[11px] text-slate-400 font-mono">
                  {left.connected ? `20 Hz Sync • ${left.packetCount} packets` : "Awaiting patient setup"}
                </p>
              </div>
            </div>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                left.connected
                  ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                  : "bg-slate-800 text-slate-400"
              }`}
            >
              {left.connected ? "ACTIVE" : "STANDBY"}
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
                <h4 className="font-semibold text-xs text-slate-100">Right Insole Sensor</h4>
                <p className="text-[11px] text-slate-400 font-mono">
                  {right.connected ? `20 Hz Sync • ${right.packetCount} packets` : "Awaiting patient setup"}
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

        {/* Clinical Plantar Balance & Asymmetry Card (Replaces the Footprint SVG Heatmap) */}
        <section>
          <ClinicalBalanceCard />
        </section>

        {/* Clinical Assessment Guidance & Protocol Card */}
        <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 flex flex-col gap-3 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-200">
              <ClipboardList className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-sm">Sarcopenia Gait Protocol Instructions</h3>
            </div>
            <button
              onClick={() => setIsSessionHistoryOpen(true)}
              className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-medium"
            >
              <History className="w-3.5 h-3.5" />
              View Session History Archive
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300">
            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 flex flex-col gap-1">
              <span className="font-bold text-white block">1. Static Balance Test</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Have the subject stand quietly for 10 seconds. Check the bilateral balance meter above for unilateral dominance or asymmetry (clinical target: ±5%).
              </p>
            </div>
            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 flex flex-col gap-1">
              <span className="font-bold text-white block">2. Timed Gait Trial</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Click <strong>"Start Capture"</strong>. Instruct patient to walk a 6-meter course at normal pace. Click <strong>"Stop Capture"</strong> when completed.
              </p>
            </div>
            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 flex flex-col gap-1">
              <span className="font-bold text-white block">3. Research Export</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Click <strong>"Export CSV"</strong> to download the full synchronized dataset (FSR 1-16 + 6-DOF IMU) for patient records or clinical statistical analysis.
              </p>
            </div>
          </div>
        </section>
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
