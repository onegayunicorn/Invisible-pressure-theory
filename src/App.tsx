/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { SimulationParameters, ActualizationEvent } from "./types";
import { WaveSimulator } from "./components/WaveSimulator";
import { RadialMap } from "./components/RadialMap";
import { TheoryLedger } from "./components/TheoryLedger";
import { ExperimentLab } from "./components/ExperimentLab";
import { 
  Atom, 
  Orbit, 
  FlaskConical, 
  BookOpen, 
  Sparkles, 
  Network,
  Radio,
  Share2
} from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<"simulator" | "radial" | "experiments" | "ledger">("simulator");

  // Shared parameters across simulation components
  const [parameters, setParameters] = useState<SimulationParameters>({
    C: 8.0,            // Solar luminosity temp constant
    T_cmb: 2.73,       // Void background CMB (Kelvin)
    P_0: 1.0,          // baseline Invisible Pressure
    sigma_ipt: 1.0,    // cross section coupling factor
    E_a: 2.5,          // Activation energy threshold constant
    gamma_0: 1e11,     // scale rate multiplier for decoherence kinetics
    g_constant: 3.0,   // gravity constant
    m: 1.2,            // Wave packet mass
    k_0: -2.0,         // initial incoming momentum speed
    width_0: 0.35,     // Gaussian width spread
    x_0: 4.5           // initial radial injection distance (far)
  });

  // Persistent prebiotic actualization events log history
  const [events, setEvents] = useState<ActualizationEvent[]>([]);

  const handleEventGenerated = (newEvent: ActualizationEvent) => {
    setEvents(prev => [newEvent, ...prev]);
  };

  const clearEvents = () => {
    setEvents([]);
  };

  return (
    <div className="min-h-screen bg-[#050608] text-slate-300 flex flex-col font-sans antialiased selection:bg-cyan-500/30 selection:text-cyan-200" id="main-app-shell">
      {/* Top Banner Header */}
      <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-black/40 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-cyan-500/50 flex items-center justify-center relative bg-cyan-500/5">
            <Orbit className="animate-spin text-cyan-400" size={16} style={{ animationDuration: "12s" }} />
            <div className="absolute inset-0.5 rounded-full border border-cyan-400/30 animate-pulse pointer-events-none"></div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xs font-bold tracking-[0.2em] text-white uppercase italic">
                IPT: Quantum Dynamics Simulator
              </h1>
              <span className="font-mono text-[9px] bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-500/20 uppercase tracking-widest font-bold animate-pulse">
                OMEGA-ACTIVE
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">
              SYS_v2.0.0_FORMAL // UNIFIED COLLAPSE & INVISIBLE PRESSURE ENGINE
            </p>
          </div>
        </div>

        {/* Global telemetry status readout */}
        <div className="flex gap-8 text-[10px] font-mono">
          <div className="hidden lg:flex flex-col items-end">
            <span className="text-slate-500 uppercase">Radial Target</span>
            <span className="text-cyan-400 flex items-center gap-1">
              <Radio size={10} className="text-cyan-400 animate-pulse" /> Coordinate 1.0 AU (Earth)
            </span>
          </div>

          <div className="hidden md:flex flex-col items-end border-l border-white/10 pl-8">
            <span className="text-slate-500 uppercase">Solar Gradient</span>
            <span className="text-cyan-400">{parameters.C.toFixed(1)}C_0</span>
          </div>

          <div className="flex flex-col items-end border-l border-white/10 pl-8">
            <span className="text-slate-500 uppercase">Prebiotic Structures</span>
            <span className="text-emerald-400 flex items-center gap-1 font-bold">
              <Sparkles size={10} className="text-emerald-400" /> {events.length} LOGGED
            </span>
          </div>
        </div>
      </header>

      {/* Tabs navigation block */}
      <div className="bg-[#050608] border-b border-white/10 px-4 md:px-8 py-2 flex overflow-x-auto gap-2 scrollbar-none sticky top-16 z-40" id="tab-nav-bar">
        <button
          onClick={() => setActiveTab("simulator")}
          className={`px-4 py-2 rounded-lg font-mono font-medium text-xs tracking-wider transition uppercase flex items-center gap-2 cursor-pointer border ${
            activeTab === "simulator"
              ? "bg-white/5 text-cyan-400 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.1)] font-bold"
              : "text-slate-400 border-transparent hover:text-white hover:bg-white/5"
          }`}
          id="tab-btn-sim"
        >
          <Atom size={14} /> Wave Simulator
        </button>

        <button
          onClick={() => setActiveTab("radial")}
          className={`px-4 py-2 rounded-lg font-mono font-medium text-xs tracking-wider transition uppercase flex items-center gap-2 cursor-pointer border ${
            activeTab === "radial"
              ? "bg-white/5 text-cyan-400 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.1)] font-bold"
              : "text-slate-400 border-transparent hover:text-white hover:bg-white/5"
          }`}
          id="tab-btn-radial"
        >
          <Network size={14} /> Gradient Map
        </button>

        <button
          onClick={() => setActiveTab("experiments")}
          className={`px-4 py-2 rounded-lg font-mono font-medium text-xs tracking-wider transition uppercase flex items-center gap-2 cursor-pointer border ${
            activeTab === "experiments"
              ? "bg-white/5 text-cyan-400 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.1)] font-bold"
              : "text-slate-400 border-transparent hover:text-white hover:bg-white/5"
          }`}
          id="tab-btn-exp"
        >
          <FlaskConical size={14} /> Lab Trials
        </button>

        <button
          onClick={() => setActiveTab("ledger")}
          className={`px-4 py-2 rounded-lg font-mono font-medium text-xs tracking-wider transition uppercase flex items-center gap-2 cursor-pointer border ${
            activeTab === "ledger"
              ? "bg-white/5 text-cyan-400 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.1)] font-bold"
              : "text-slate-400 border-transparent hover:text-white hover:bg-white/5"
          }`}
          id="tab-btn-ledg"
        >
          <BookOpen size={14} /> Ledger Docs
        </button>
      </div>

      {/* Primary Dashboard Content Panel Router */}
      <main className="flex-1 overflow-y-auto" id="primary-view-container">
        {activeTab === "simulator" && (
          <WaveSimulator 
            parameters={parameters}
            setParameters={setParameters}
            onEventGenerated={handleEventGenerated}
            events={events}
            clearEvents={clearEvents}
          />
        )}
        {activeTab === "radial" && (
          <RadialMap parameters={parameters} />
        )}
        {activeTab === "experiments" && (
          <ExperimentLab />
        )}
        {activeTab === "ledger" && (
          <TheoryLedger />
        )}
      </main>

      {/* Polished Footing bar */}
      <footer className="h-10 border-t border-white/5 bg-black/60 px-6 flex items-center justify-between font-mono text-[9px] text-slate-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> CPU LOAD: 14%</span>
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span> Q-SYNC: 1.000</span>
          <span className="text-slate-600 px-4 border-l border-white/10 hidden md:inline">SOLAR_SIM_NODE_07</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-cyan-500 hover:text-cyan-400 cursor-pointer uppercase tracking-wider font-bold">IPT MODELING © 2026</span>
          <span className="text-slate-600 uppercase hidden sm:inline">Recursive Timeline: ∞ / ACTIVE</span>
        </div>
      </footer>
    </div>
  );
}
