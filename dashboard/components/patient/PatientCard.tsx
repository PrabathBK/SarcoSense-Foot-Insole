"use client";

import React from "react";
import { usePatientStore } from "@/store/patientStore";
import { getBMICategory } from "@/lib/patients";
import { User, HeartPulse, Scale, Ruler, Calendar, FileText } from "lucide-react";

interface PatientCardProps {
  onOpenAdd?: () => void;
  onOpenList?: () => void;
}

export function PatientCard({ onOpenAdd, onOpenList }: PatientCardProps) {
  const activePatient = usePatientStore((s) => s.activePatient);

  if (!activePatient) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex flex-col items-center justify-center text-center gap-3">
        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-500">
          <User className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-semibold text-slate-200 text-sm">No Active Subject Selected</h4>
          <p className="text-xs text-slate-400">Register a patient to attach session telemetry</p>
        </div>
        <button
          onClick={onOpenAdd}
          className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition-all shadow-md shadow-cyan-600/20"
        >
          + Register Patient
        </button>
      </div>
    );
  }

  const bmiCat = getBMICategory(activePatient.bmi);

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 md:p-5 shadow-xl backdrop-blur-md flex flex-col gap-4">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-cyan-500/20">
            {activePatient.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .substring(0, 2)
              .toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-100 text-base">{activePatient.name}</h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                {activePatient.patientId}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {activePatient.gender} • {activePatient.age} years old
            </p>
          </div>
        </div>

        {/* Change / Add Buttons */}
        <div className="flex items-center gap-1.5 text-xs">
          <button
            onClick={onOpenList}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
          >
            Switch
          </button>
          <button
            onClick={onOpenAdd}
            className="px-2.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition-all shadow-sm shadow-cyan-600/30"
          >
            + New
          </button>
        </div>
      </div>

      {/* Anthropometric Parameters */}
      <div className="grid grid-cols-3 gap-2.5 text-xs">
        <div className="bg-slate-950/70 border border-slate-800/80 p-2.5 rounded-xl flex items-center gap-2">
          <Ruler className="w-4 h-4 text-cyan-400 shrink-0" />
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Height</span>
            <span className="font-bold text-slate-100 font-mono">{activePatient.heightCm} cm</span>
          </div>
        </div>

        <div className="bg-slate-950/70 border border-slate-800/80 p-2.5 rounded-xl flex items-center gap-2">
          <Scale className="w-4 h-4 text-cyan-400 shrink-0" />
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Weight</span>
            <span className="font-bold text-slate-100 font-mono">{activePatient.weightKg} kg</span>
          </div>
        </div>

        <div className="bg-slate-950/70 border border-slate-800/80 p-2.5 rounded-xl flex items-center gap-2">
          <HeartPulse className="w-4 h-4 text-cyan-400 shrink-0" />
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">BMI</span>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-100 font-mono">{activePatient.bmi}</span>
              <span className={`text-[9px] font-bold ${bmiCat.color}`}>({bmiCat.label})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Clinical Notes */}
      {activePatient.notes && (
        <div className="bg-slate-950/50 border border-slate-800/60 rounded-xl p-2.5 text-xs flex items-start gap-2 text-slate-300">
          <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
          <p className="text-slate-400 italic text-[11px] leading-relaxed">
            "{activePatient.notes}"
          </p>
        </div>
      )}
    </div>
  );
}

