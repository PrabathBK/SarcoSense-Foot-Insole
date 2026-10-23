"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useMQTT } from "@/hooks/useMQTT";
import {
  Footprints,
  FlaskConical,
  Stethoscope,
  Wifi,
  WifiOff,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Activity,
  Layers,
  HeartPulse,
  FileSpreadsheet,
  CheckCircle2,
} from "lucide-react";

export default function PortalSelectionPage() {
  const { brokerStatus, isConnected, reconnect } = useMQTT();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-black">
      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Footprints className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-lg text-white tracking-tight">SarcoSense</span>
            <span className="text-xs text-slate-400 block -mt-0.5">
              Smart Insole Gait Assessment System
            </span>
          </div>
        </div>

        {/* Live Broker Status */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs">
            {isConnected ? (
              <>
                <Wifi className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 font-medium">HiveMQ Connected</span>
              </>
            ) : brokerStatus === "connecting" ? (
              <>
                <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
                <span className="text-amber-400">Connecting Broker...</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-rose-400" />
                <span className="text-rose-400">Broker Offline</span>
              </>
            )}
          </div>

          {!isConnected && (
            <button
              onClick={reconnect}
              className="p-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition-colors"
              title="Reconnect"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* Main Selection Area */}
      <main className="max-w-5xl w-full mx-auto px-6 py-12 flex flex-col items-center gap-10">
        {/* Title & Description */}
        <div className="text-center flex flex-col items-center gap-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/80 text-cyan-400 text-xs font-mono font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            Sarcopenia Clinical Research & Monitoring Platform
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Select Your Operating Portal
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Choose between full engineering sensor diagnostics in <strong>Demo Mode</strong> or streamlined patient intake & session recording in <strong>Clinical Mode</strong>.
          </p>
        </div>

        {/* Dual Portal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {/* Card 1: Demo Mode */}
          <div className="group relative bg-slate-900/70 border border-slate-800 hover:border-blue-500/60 rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-2xl hover:shadow-blue-500/10 transition-all duration-300">
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-105 group-hover:bg-blue-500/20 transition-all">
                  <FlaskConical className="w-7 h-7" />
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-950 text-blue-300 border border-blue-800">
                  Engineering & QA
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                  Demo Mode
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Full-featured engineering workspace for insole verification, real-time heatmaps, IMU motion curves, and telemetry inspection.
                </p>
              </div>

              {/* Feature Highlights */}
              <div className="flex flex-col gap-2 pt-2 border-t border-slate-800/80 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Dual Foot 16-Sensor Heatmaps & Balance</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Real-time 6-DOF IMU Oscilloscope (20 Hz)</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>16-Channel Raw ADC Telemetry Table</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Fast Session Capture & CSV Export</span>
                </div>
              </div>
            </div>

            {/* Launch Button */}
            <Link
              href="/demo"
              className="mt-8 flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-600/30 group-hover:shadow-blue-600/50"
            >
              Enter Demo Portal
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Card 2: Clinical Mode */}
          <div className="group relative bg-slate-900/70 border border-slate-800 hover:border-emerald-500/60 rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300">
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 group-hover:bg-emerald-500/20 transition-all">
                  <Stethoscope className="w-7 h-7" />
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Medical & Clinical
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                  Clinical Mode
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Streamlined patient assessment protocol for clinicians: subject intake, auto-BMI calculation, structured capture sessions, and data exports.
                </p>
              </div>

              {/* Feature Highlights */}
              <div className="flex flex-col gap-2 pt-2 border-t border-slate-800/80 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <HeartPulse className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Subject Profile with Real-Time BMI Engine</span>
                </div>
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Bilateral Plantar Pressure & Weight Ratio</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Timestamped Gait Session Stopwatch & CSV</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Session History & Firebase Firestore Archive</span>
                </div>
              </div>
            </div>

            {/* Launch Button */}
            <Link
              href="/clinical"
              className="mt-8 flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/30 group-hover:shadow-emerald-600/50"
            >
              Enter Clinical Portal
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 px-6 py-4 text-center text-xs text-slate-500 font-mono">
        SarcoSense Platform • ESP32 Smart Insole Telemetry System (20 Hz)
      </footer>
    </div>
  );
}
