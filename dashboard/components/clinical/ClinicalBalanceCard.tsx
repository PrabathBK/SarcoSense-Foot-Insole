"use client";

import React from "react";
import { useSensorStore } from "@/store/sensorStore";
import { Gauge, Scale, Activity, ShieldAlert, CheckCircle2 } from "lucide-react";

export function ClinicalBalanceCard() {
  const left = useSensorStore((s) => s.left);
  const right = useSensorStore((s) => s.right);

  // Compute total load per foot
  const leftTotal = left.fsr.reduce((a, b) => a + b, 0);
  const rightTotal = right.fsr.reduce((a, b) => a + b, 0);
  const combinedTotal = leftTotal + rightTotal;

  const leftPercent = combinedTotal > 0 ? Math.round((leftTotal / combinedTotal) * 100) : 50;
  const rightPercent = combinedTotal > 0 ? Math.round((rightTotal / combinedTotal) * 100) : 50;

  // Asymmetry Index: |L - R| / (L + R) * 100
  const asymmetryIndex = combinedTotal > 0
    ? Math.abs(leftPercent - rightPercent)
    : 0;

  // Clinical Asymmetry Classification
  let asymmetryBadge = {
    label: "Symmetrical Weight Bearing",
    desc: "Bilateral balance within normal clinical limits (±5%)",
    color: "text-emerald-400 bg-emerald-950/70 border-emerald-800",
    icon: CheckCircle2,
  };

  if (asymmetryIndex >= 6 && asymmetryIndex < 16) {
    asymmetryBadge = {
      label: "Mild Plantar Asymmetry",
      desc: "Mild unilateral loading detected. Monitor for gait compensation.",
      color: "text-amber-400 bg-amber-950/70 border-amber-800",
      icon: Gauge,
    };
  } else if (asymmetryIndex >= 16) {
    asymmetryBadge = {
      label: "Significant Gait Asymmetry",
      desc: "Marked weight discrepancy (>15%). Elevated fall & sarcopenia risk.",
      color: "text-rose-400 bg-rose-950/70 border-rose-800",
      icon: ShieldAlert,
    };
  }

  // Motion intensity from IMU magnitude sqrt(ax^2 + ay^2 + az^2)
  const rightAccelMag = Math.sqrt(
    right.imu.ax ** 2 + right.imu.ay ** 2 + right.imu.az ** 2
  );
  const isDynamicMoving = right.connected && Math.abs(rightAccelMag - 9.8) > 1.2;

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wider">
              Bilateral Plantar Balance & Gait Symmetry
            </h3>
            <p className="text-xs text-slate-400">
              Real-time weight distribution index for sarcopenia fall-risk screening
            </p>
          </div>
        </div>

        {/* Clinical Assessment Badge */}
        <div className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${asymmetryBadge.color}`}>
          <asymmetryBadge.icon className="w-4 h-4 shrink-0" />
          <div>
            <span className="block leading-none">{asymmetryBadge.label}</span>
            <span className="text-[10px] font-mono opacity-80">Asymmetry: {asymmetryIndex}%</span>
          </div>
        </div>
      </div>

      {/* Main Visual Balance Meter */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-medium">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span className="text-slate-200">
              Left Foot Load: <strong className="font-mono text-base text-blue-400">{leftPercent}%</strong>
            </span>
            <span className="text-slate-500 font-mono text-[11px]">({leftTotal.toLocaleString()} ADC)</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-mono text-[11px]">({rightTotal.toLocaleString()} ADC)</span>
            <span className="text-slate-200">
              Right Foot Load: <strong className="font-mono text-base text-cyan-400">{rightPercent}%</strong>
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
          </div>
        </div>

        {/* Split Bar */}
        <div className="relative w-full h-4 bg-slate-950 rounded-full overflow-hidden flex border border-slate-800 shadow-inner">
          {/* 50% Center Marker Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-600/70 z-10 -translate-x-1/2" />

          {/* Left Proportion */}
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-150"
            style={{ width: `${leftPercent}%` }}
          />
          {/* Right Proportion */}
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-teal-400 transition-all duration-150"
            style={{ width: `${rightPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono px-1">
          <span>100% Left Dominant</span>
          <span className="text-slate-400 font-bold">50 / 50 Equilateral Baseline</span>
          <span>100% Right Dominant</span>
        </div>
      </div>

      {/* Clinical Metrics Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 flex flex-col gap-1">
          <span className="text-slate-400 text-[11px] uppercase font-semibold">Total Plantar Force</span>
          <span className="text-lg font-bold font-mono text-slate-100">
            {combinedTotal.toLocaleString()} <span className="text-xs font-normal text-slate-500">ADC sum</span>
          </span>
          <span className="text-[10px] text-slate-500">Combined bilateral pressure output</span>
        </div>

        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 flex flex-col gap-1">
          <span className="text-slate-400 text-[11px] uppercase font-semibold">Gait Kinetic State</span>
          <div className="flex items-center gap-2 text-slate-100 font-bold text-sm">
            <Activity className={`w-4 h-4 ${isDynamicMoving ? "text-cyan-400 animate-spin" : "text-emerald-400"}`} />
            <span>{isDynamicMoving ? "Dynamic Walking Gait" : "Static Stance / Stance Phase"}</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            {right.connected ? `IMU Acceleration: ${rightAccelMag.toFixed(2)} m/s²` : "Sensor Offline"}
          </span>
        </div>

        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 flex flex-col gap-1">
          <span className="text-slate-400 text-[11px] uppercase font-semibold">Screening Guidance</span>
          <p className="text-[11px] text-slate-300 leading-snug">
            {asymmetryBadge.desc}
          </p>
        </div>
      </div>
    </div>
  );
}

