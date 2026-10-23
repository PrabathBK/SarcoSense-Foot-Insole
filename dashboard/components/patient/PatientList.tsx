"use client";

import React, { useState } from "react";
import { usePatientStore } from "@/store/patientStore";
import { Patient } from "@/types";
import { getBMICategory } from "@/lib/patients";
import { Search, UserPlus, Trash2, CheckCircle2, X, Users } from "lucide-react";

interface PatientListProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAdd: () => void;
}

export function PatientList({ isOpen, onClose, onOpenAdd }: PatientListProps) {
  const patients = usePatientStore((s) => s.patients);
  const activePatient = usePatientStore((s) => s.activePatient);
  const setActivePatient = usePatientStore((s) => s.setActivePatient);
  const deletePatient = usePatientStore((s) => s.deletePatient);

  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen) return null;

  const filtered = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.patientId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <Users className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 tracking-tight">
                Subject Registry ({patients.length})
              </h3>
              <p className="text-xs text-slate-400">
                Select active subject for session capture
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar & Add Button */}
        <div className="p-3 border-b border-slate-800 flex items-center gap-2 bg-slate-950/40">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by subject name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
            />
          </div>
          <button
            onClick={() => {
              onClose();
              onOpenAdd();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition-all shadow-md shadow-cyan-600/20 shrink-0"
          >
            <UserPlus className="w-3.5 h-3.5" />
            New Subject
          </button>
        </div>

        {/* Patients List Body */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 p-2">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No subjects found matching "{searchQuery}"
            </div>
          ) : (
            filtered.map((p) => {
              const isSelected = activePatient?.id === p.id;
              const bmiCat = getBMICategory(p.bmi);

              return (
                <div
                  key={p.id}
                  className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                    isSelected
                      ? "bg-slate-800/80 border border-cyan-500/40"
                      : "hover:bg-slate-800/30"
                  }`}
                >
                  <div
                    onClick={() => {
                      setActivePatient(p);
                      onClose();
                    }}
                    className="flex items-center gap-3 flex-1 cursor-pointer"
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                        isSelected
                          ? "bg-cyan-600 text-white"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {p.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .substring(0, 2)
                        .toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-100 text-sm">
                          {p.name}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950 text-cyan-400 border border-slate-800">
                          {p.patientId}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-1.5 py-0.5 rounded flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {p.gender} • {p.age} yrs • {p.heightCm} cm • {p.weightKg} kg •{" "}
                        <span className={`font-semibold ${bmiCat.color}`}>
                          BMI {p.bmi} ({bmiCat.label})
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setActivePatient(p);
                        onClose();
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        isSelected
                          ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                          : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                      }`}
                    >
                      {isSelected ? "Selected" : "Select"}
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Remove ${p.name} (${p.patientId})?`)) {
                          deletePatient(p.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800/80 transition-colors"
                      title="Delete patient"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

