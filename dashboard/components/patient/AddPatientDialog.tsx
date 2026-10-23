"use client";

import React, { useState } from "react";
import { usePatientStore } from "@/store/patientStore";
import { calculateBMI, getBMICategory } from "@/lib/patients";
import { UserPlus, X, HeartPulse, Check } from "lucide-react";

interface AddPatientDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddPatientDialog({ isOpen, onClose }: AddPatientDialogProps) {
  const addPatient = usePatientStore((s) => s.addPatient);

  const [patientId, setPatientId] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [gender, setGender] = useState<"Male" | "Female" | "Other">("Male");
  const [heightCm, setHeightCm] = useState<number | "">("");
  const [weightKg, setWeightKg] = useState<number | "">("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Live BMI Preview
  const currentBMI =
    typeof heightCm === "number" && typeof weightKg === "number"
      ? calculateBMI(heightCm, weightKg)
      : 0;
  const bmiCategory = getBMICategory(currentBMI);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !patientId || !heightCm || !weightKg) return;

    setIsSubmitting(true);
    try {
      await addPatient({
        patientId,
        name,
        age: Number(age) || 0,
        gender,
        heightCm: Number(heightCm),
        weightKg: Number(weightKg),
        notes,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 md:p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <UserPlus className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 tracking-tight">
                Register New Subject / Patient
              </h3>
              <p className="text-xs text-slate-400">
                Enter demographic and anthropometric parameters
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 md:p-5 flex flex-col gap-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Patient / Subject ID *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. P-1025"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Age (years)
              </label>
              <input
                type="number"
                min="1"
                max="120"
                placeholder="65"
                value={age}
                onChange={(e) => setAge(e.target.value ? Number(e.target.value) : "")}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">
                Gender
              </label>
              <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                {(["Male", "Female", "Other"] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={`py-1 text-center rounded-md font-medium transition-all ${
                      gender === g
                        ? "bg-slate-800 text-cyan-400 font-bold"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Height (cm) *
              </label>
              <input
                type="number"
                required
                min="50"
                max="250"
                step="0.5"
                placeholder="170"
                value={heightCm}
                onChange={(e) =>
                  setHeightCm(e.target.value ? Number(e.target.value) : "")
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Weight (kg) *
              </label>
              <input
                type="number"
                required
                min="20"
                max="300"
                step="0.5"
                placeholder="70"
                value={weightKg}
                onChange={(e) =>
                  setWeightKg(e.target.value ? Number(e.target.value) : "")
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Dynamic Auto BMI Calculator Card */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-cyan-400" />
              <div>
                <span className="text-slate-400 block text-[11px]">
                  Body Mass Index (BMI)
                </span>
                <span className="font-bold text-slate-100 text-sm font-mono">
                  {currentBMI > 0 ? `${currentBMI} kg/m²` : "--"}
                </span>
              </div>
            </div>
            {currentBMI > 0 && (
              <span
                className={`text-[11px] font-bold px-2.5 py-1 rounded-full border border-slate-800 ${bmiCategory.color}`}
              >
                {bmiCategory.label}
              </span>
            )}
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Clinical Notes / Mobility Observation
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Mild knee osteoarthritis, walking aid used, sarcopenia staging..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition-all shadow-md shadow-cyan-600/30 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              {isSubmitting ? "Saving..." : "Save Patient"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

