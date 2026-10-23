"use client";

import React, { useState, useEffect } from "react";
import { useSensorStore } from "@/store/sensorStore";
import { usePatientStore } from "@/store/patientStore";
import { exportSessionToCSV } from "@/lib/exportCsv";
import { saveSession } from "@/lib/sessions";
import {
  Play,
  Square,
  Download,
  History,
  Timer,
  FileSpreadsheet,
  AlertCircle,
} from "lucide-react";

interface CaptureControlsProps {
  onOpenHistory?: () => void;
  mode?: "demo" | "clinical";
}

export function CaptureControls({
  onOpenHistory,
  mode = "clinical",
}: CaptureControlsProps) {
  const isRecording = useSensorStore((s) => s.isRecording);
  const recordingStartTime = useSensorStore((s) => s.recordingStartTime);
  const recordedSamples = useSensorStore((s) => s.recordedSamples);
  const startRecording = useSensorStore((s) => s.startRecording);
  const stopRecording = useSensorStore((s) => s.stopRecording);

  const activePatient = usePatientStore((s) => s.activePatient);

  const [elapsedSec, setElapsedSec] = useState(0);
  const [lastSavedSamples, setLastSavedSamples] = useState(recordedSamples);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Stopwatch timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRecording && recordingStartTime) {
      interval = setInterval(() => {
        setElapsedSec(Math.floor((Date.now() - recordingStartTime) / 1000));
      }, 500);
    } else {
      setElapsedSec(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording, recordingStartTime]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleToggleRecord = async () => {
    if (!isRecording) {
      // Start
      const patientId = activePatient?.patientId || "DEMO-01";
      const patientName = activePatient?.name || "Anonymous Subject";
      startRecording(patientId, patientName);
      setSaveSuccessMsg(null);
    } else {
      // Stop
      const samples = stopRecording();
      setLastSavedSamples(samples);

      if (samples.length > 0) {
        const patientId = activePatient?.patientId || "DEMO-01";
        const patientName = activePatient?.name || "Anonymous Subject";

        try {
          await saveSession(
            {
              patientId,
              patientName,
              mode,
              startTime: recordingStartTime || Date.now(),
              endTime: Date.now(),
              durationSeconds: elapsedSec,
              sampleCount: samples.length,
            },
            samples
          );
          setSaveSuccessMsg(
            `Session saved (${samples.length} samples, ${elapsedSec}s). Ready to export CSV.`
          );
        } catch (err) {
          console.error("Save session failed:", err);
        }
      }
    }
  };

  const handleExportCSV = () => {
    const samplesToExport = isRecording ? recordedSamples : lastSavedSamples;
    const patientId = activePatient?.patientId || "DEMO-01";
    const patientName = activePatient?.name || "Subject";
    exportSessionToCSV(samplesToExport, patientId, patientName);
  };

  const hasExportableData =
    (isRecording && recordedSamples.length > 0) ||
    (!isRecording && lastSavedSamples.length > 0);

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 md:p-5 shadow-xl backdrop-blur-md flex flex-col gap-3">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
              isRecording
                ? "bg-rose-500/20 border-rose-500/40 text-rose-400"
                : "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
            }`}
          >
            <Timer className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-slate-100 uppercase tracking-wider">
                Gait Capture & Assessment Session
              </h3>
              {isRecording && (
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-950 border border-rose-800 text-rose-400 text-[10px] font-mono font-bold animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  RECORDING
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              {activePatient
                ? `Subject: ${activePatient.name} (${activePatient.patientId})`
                : "Attach capture data to active subject profile"}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Main Record Button */}
          <button
            onClick={handleToggleRecord}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg ${
              isRecording
                ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30 animate-pulse"
                : "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-600/30"
            }`}
          >
            {isRecording ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                Stop Capture
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                Start Capture
              </>
            )}
          </button>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            disabled={!hasExportableData}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700/60 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            title="Download CSV of current session"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Export</span> CSV
          </button>

          {/* History Modal Trigger */}
          {onOpenHistory && (
            <button
              onClick={onOpenHistory}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors"
              title="View past sessions"
            >
              <History className="w-4 h-4 text-slate-400" />
            </button>
          )}
        </div>
      </div>

      {/* Live Recording Telemetry Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono pt-2 border-t border-slate-800/80">
        <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
          <span className="text-slate-500 block text-[10px] uppercase">Duration</span>
          <span className={`text-base font-bold ${isRecording ? "text-rose-400" : "text-slate-200"}`}>
            {formatTime(elapsedSec)}
          </span>
        </div>

        <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
          <span className="text-slate-500 block text-[10px] uppercase">Recorded Packets</span>
          <span className="text-base font-bold text-cyan-400">
            {isRecording ? recordedSamples.length : lastSavedSamples.length}
          </span>
        </div>

        <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
          <span className="text-slate-500 block text-[10px] uppercase">Active Subject</span>
          <span className="text-xs font-bold text-slate-100 truncate block">
            {activePatient?.patientId || "None"}
          </span>
        </div>

        <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
          <span className="text-slate-500 block text-[10px] uppercase">Sampling Rate</span>
          <span className="text-xs font-bold text-emerald-400 block">
            20 Hz (Synchronized)
          </span>
        </div>
      </div>

      {/* Success Notification Bar */}
      {saveSuccessMsg && (
        <div className="p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-800/80 text-emerald-300 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>{saveSuccessMsg}</span>
          </div>
          <button
            onClick={handleExportCSV}
            className="underline font-bold text-emerald-200 hover:text-white ml-2"
          >
            Download CSV Now →
          </button>
        </div>
      )}
    </div>
  );
}

