"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMQTT } from "@/hooks/useMQTT";
import {
  Footprints,
  Wifi,
  WifiOff,
  RefreshCw,
  FlaskConical,
  Stethoscope,
  ArrowRightLeft,
} from "lucide-react";

interface NavbarProps {
  currentMode: "demo" | "clinical";
}

export function Navbar({ currentMode }: NavbarProps) {
  const { brokerStatus, isConnected, reconnect } = useMQTT();
  const pathname = usePathname();

  return (
    <header className="border-b border-slate-800/80 bg-slate-900/70 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <Footprints className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white tracking-tight group-hover:text-cyan-400 transition-colors">
                  SarcoSense
                </span>
                {currentMode === "demo" ? (
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800 font-bold flex items-center gap-1">
                    <FlaskConical className="w-3 h-3 text-blue-400" />
                    Demo Mode
                  </span>
                ) : (
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold flex items-center gap-1">
                    <Stethoscope className="w-3 h-3 text-emerald-400" />
                    Clinical Mode
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Plantar Pressure & Gait Monitoring for Sarcopenia
              </p>
            </div>
          </Link>
        </div>

        {/* Right Actions: Mode Switcher & MQTT Status */}
        <div className="flex items-center gap-3">
          {/* Mode Switcher Pill */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <Link
              href="/demo"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                currentMode === "demo"
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5" />
              Demo
            </Link>
            <Link
              href="/clinical"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                currentMode === "clinical"
                  ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              Clinical
            </Link>
          </div>

          {/* MQTT Broker Status */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/70 border border-slate-700/60 text-xs">
            {isConnected ? (
              <>
                <Wifi className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 font-medium hidden md:inline">HiveMQ Connected</span>
                <span className="text-emerald-400 font-medium md:hidden">Live</span>
              </>
            ) : brokerStatus === "connecting" ? (
              <>
                <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
                <span className="text-amber-400 hidden md:inline">Connecting...</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-rose-400" />
                <span className="text-rose-400 hidden md:inline">Offline</span>
              </>
            )}
          </div>

          {!isConnected && (
            <button
              onClick={reconnect}
              className="px-2.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition-all shadow-md shadow-cyan-600/20 flex items-center gap-1"
              title="Reconnect MQTT"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Portal Switch Button */}
          <Link
            href="/"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
            title="Return to Portal Selection"
          >
            <ArrowRightLeft className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}

