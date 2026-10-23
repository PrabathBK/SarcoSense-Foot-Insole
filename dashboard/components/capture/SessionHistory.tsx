"use client";

import React, { useState, useEffect } from "react";
import { fetchSessions, StoredSession } from "@/lib/sessions";
import { exportSessionToCSV } from "@/lib/exportCsv";
import { History, X, Download, Calendar, Clock, FileSpreadsheet, Layers } from "lucide-react";

interface SessionHistoryProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SessionHistory({ isOpen, onClose }: SessionHistoryProps) {
  const [sessions, setSessions] = useState<StoredSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      fetchSessions()
        .then((list) => setSessions(list))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <History className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 tracking-tight">
                Capture Session History
              </h3>
              <p className="text-xs text-slate-400">
                Browse recorded gait assessments & download research CSVs
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

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
          {isLoading ? (
            <div className="py-16 text-center text-slate-500 text-xs font-mono">
              Loading session archive...
            </div>
          ) : sessions.length === 0 ? (
            <div className="py-16 text-center flex flex-col items-center justify-center gap-2 text-slate-500 text-xs">
              <FileSpreadsheet className="w-8 h-8 text-slate-700" />
              <span>No recorded sessions yet. Click "Start Capture" to record one!</span>
            </div>
          ) : (
            sessions.map((sess) => {
              const dateStr = new Date(sess.startTime).toLocaleString(undefined, {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={sess.id}
                  className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-100 text-sm">
                        {sess.patientName}
                      </span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-900 text-cyan-400 border border-slate-800">
                        {sess.patientId}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 uppercase">
                        {sess.mode}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {dateStr}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        {sess.durationSeconds}s duration
                      </span>
                      <span className="flex items-center gap-1 font-mono text-cyan-400">
                        <Layers className="w-3.5 h-3.5 text-cyan-500" />
                        {sess.sampleCount} samples
                      </span>
                    </div>
                  </div>

                  {/* Download CSV Action */}
                  <button
                    onClick={() => {
                      if (sess.samples && sess.samples.length > 0) {
                        exportSessionToCSV(sess.samples, sess.patientId, sess.patientName);
                      } else {
                        alert("Raw samples for this historical session were not retained in local buffer.");
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 self-start sm:self-center transition-colors shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5 text-cyan-400" />
                    Download CSV
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

