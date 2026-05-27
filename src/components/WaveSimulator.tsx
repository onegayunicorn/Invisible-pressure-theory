/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from "react";
import { 
  SimulationParameters, 
  SimulationState, 
  ActualizationEvent 
} from "../types";
import { 
  computeFields, 
  initializeWavePacket, 
  stepSchrodinger,
  GRID_POINTS,
  EARTH_R,
  R_MIN,
  R_MAX,
  drawLifeEvent
} from "../simulator-logic";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  Activity, 
  Sparkles, 
  Thermometer, 
  Gauge, 
  Compass, 
  Atom,
  HelpCircle
} from "lucide-react";

interface WaveSimulatorProps {
  parameters: SimulationParameters;
  setParameters: React.Dispatch<React.SetStateAction<SimulationParameters>>;
  onEventGenerated: (event: ActualizationEvent) => void;
  events: ActualizationEvent[];
  clearEvents: () => void;
}

export function WaveSimulator({
  parameters,
  setParameters,
  onEventGenerated,
  events,
  clearEvents
}: WaveSimulatorProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  
  // Local simulation state of the quantum solver
  const [simState, setSimState] = useState<SimulationState>(() => {
    const f = computeFields(parameters);
    const { psiReal, psiImag } = initializeWavePacket(parameters, f);
    const psiSqu = new Array(GRID_POINTS);
    for (let i = 0; i < GRID_POINTS; i++) {
      psiSqu[i] = psiReal[i] * psiReal[i] + psiImag[i] * psiImag[i];
    }
    return {
      step: 0,
      time: 0,
      psiReal,
      psiImag,
      psiSqu,
      fields: f,
      isCollapsed: false,
      collapseProgress: 0,
      collapseCenter: null,
      events: []
    };
  });

  // Canvas refs for plotting
  const psiCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const potentialCanvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Animation loops and active simulation reference to current parameters
  const requestRef = useRef<number | null>(null);
  const paramsRef = useRef(parameters);
  paramsRef.current = parameters;

  // Track Center of Mass
  const [com, setCom] = useState(parameters.x_0);
  const [dispersion, setDispersion] = useState(parameters.width_0);
  const [collapseRateAtCom, setCollapseRateAtCom] = useState(0);

  // Recalculate fields and reinitchallenge wavefunction when parameters change
  const handleReset = () => {
    const f = computeFields(paramsRef.current);
    const { psiReal, psiImag } = initializeWavePacket(paramsRef.current, f);
    const psiSqu = new Array(GRID_POINTS);
    for (let i = 0; i < GRID_POINTS; i++) {
      psiSqu[i] = psiReal[i] * psiReal[i] + psiImag[i] * psiImag[i];
    }
    setSimState({
      step: 0,
      time: 0,
      psiReal,
      psiImag,
      psiSqu,
      fields: f,
      isCollapsed: false,
      collapseProgress: 0,
      collapseCenter: null,
      events: []
    });
    setIsPlaying(false);
  };

  useEffect(() => {
    // Only reset automatically when critical initial parameters shift
    handleReset();
  }, [
    parameters.x_0, 
    parameters.width_0, 
    parameters.k_0, 
    parameters.m, 
    parameters.C, 
    parameters.T_cmb, 
    parameters.P_0, 
    parameters.sigma_ipt, 
    parameters.g_constant
  ]);

  // Single time evolution step
  const executeSimulationStep = (currentState: SimulationState, dt: number): SimulationState => {
    if (currentState.isCollapsed) {
      return currentState; // frozen in actualized particle state
    }

    const { psiReal, psiImag } = stepSchrodinger(
      currentState.psiReal,
      currentState.psiImag,
      currentState.fields,
      paramsRef.current,
      dt
    );

    const psiSqu = new Array(GRID_POINTS);
    const dx = currentState.fields.x[1] - currentState.fields.x[0];
    
    let sumWeight = 0;
    let weightedX = 0;
    
    for (let i = 0; i < GRID_POINTS; i++) {
      psiSqu[i] = psiReal[i] * psiReal[i] + psiImag[i] * psiImag[i];
      sumWeight += psiSqu[i] * dx;
      weightedX += currentState.fields.x[i] * psiSqu[i] * dx;
    }

    const nextTime = currentState.time + dt;
    const currentCOM = weightedX / (sumWeight || 1);

    // Dynamic environmental decoherence and collapse trigger check
    // If wave packet penetrates the warm zone (near Earth or Sun, T(r) becomes steep),
    // we calculate overall probability of sudden environmental localization.
    const comIndex = Math.min(
      GRID_POINTS - 1, 
      Math.max(0, Math.floor(((currentCOM - R_MIN) / (R_MAX - R_MIN)) * GRID_POINTS))
    );
    const rateAtCom = currentState.fields.collapseRate[comIndex];

    // Probability of collapse over this time frame
    const collapseProbability = 1.0 - Math.exp(-rateAtCom * dt * 50);

    if (Math.random() < collapseProbability && currentCOM < 2.0 && !currentState.isCollapsed) {
      // TRIGGER SUDDEN WAVE COLLAPSE AT Earth goldilocks threshold!
      return triggerCollapseSequence(currentState, currentCOM);
    }

    return {
      ...currentState,
      step: currentState.step + 1,
      time: nextTime,
      psiReal,
      psiImag,
      psiSqu
    };
  };

  const triggerCollapseSequence = (state: SimulationState, center: number): SimulationState => {
    // Modify wavefunction into a highly localized delta-like Gaussian
    const dx = state.fields.x[1] - state.fields.x[0];
    const collapseWidth = 0.08; // extremely narrow
    const nextPsiReal = new Array<number>(GRID_POINTS);
    const nextPsiImag = new Array<number>(GRID_POINTS);
    let norm = 0;

    for (let i = 0; i < GRID_POINTS; i++) {
      const r = state.fields.x[i];
      const gaussian = Math.exp(-Math.pow(r - center, 2) / (2 * Math.pow(collapseWidth, 2)));
      nextPsiReal[i] = gaussian; // in-phase spike
      nextPsiImag[i] = 0;
      norm += gaussian * gaussian * dx;
    }

    const sqrtNorm = Math.sqrt(norm);
    for (let i = 0; i < GRID_POINTS; i++) {
      nextPsiReal[i] /= sqrtNorm;
    }

    const psiSqu = nextPsiReal.map(val => val * val);

    // Procedural Life Event Generation
    const comIndex = Math.min(
      GRID_POINTS - 1, 
      Math.max(0, Math.floor(((center - R_MIN) / (R_MAX - R_MIN)) * GRID_POINTS))
    );
    const collapseIntensity = psiSqu[comIndex];
    const rawEvent = drawLifeEvent(center, collapseIntensity);
    
    const finalEvent: ActualizationEvent = {
      ...rawEvent,
      id: "event-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
      timestamp: Date.now()
    };

    onEventGenerated(finalEvent);

    return {
      ...state,
      isCollapsed: true,
      collapseCenter: center,
      collapseProgress: 1.0,
      psiReal: nextPsiReal,
      psiImag: nextPsiImag,
      psiSqu
    };
  };

  const handleManualCollapse = () => {
    setSimState(prev => triggerCollapseSequence(prev, com));
    setIsPlaying(false);
  };

  // Run solver loop
  useEffect(() => {
    if (isPlaying) {
      const loop = () => {
        setSimState(prev => executeSimulationStep(prev, 0.05));
        requestRef.current = requestAnimationFrame(loop);
      };
      requestRef.current = requestAnimationFrame(loop);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying]);

  // Telemetry updates
  useEffect(() => {
    const dx = simState.fields.x[1] - simState.fields.x[0];
    let sumWeight = 0;
    let weightedX = 0;
    
    for (let i = 0; i < GRID_POINTS; i++) {
       sumWeight += simState.psiSqu[i] * dx;
       weightedX += simState.fields.x[i] * simState.psiSqu[i] * dx;
    }
    const currentCOM = weightedX / (sumWeight || 1);
    setCom(currentCOM);

    // Track width dispersion: sigma_r^2 = <r^2> - <r>^2
    let weightedRSqu = 0;
    for (let i = 0; i < GRID_POINTS; i++) {
      weightedRSqu += Math.pow(simState.fields.x[i], 2) * simState.psiSqu[i] * dx;
    }
    const avgRSqu = weightedRSqu / (sumWeight || 1);
    const disp = Math.sqrt(Math.max(0, avgRSqu - currentCOM * currentCOM));
    setDispersion(disp);

    // Collapse rate at center of mass
    const comIndex = Math.min(
      GRID_POINTS - 1, 
      Math.max(0, Math.floor(((currentCOM - R_MIN) / (R_MAX - R_MIN)) * GRID_POINTS))
    );
    setCollapseRateAtCom(simState.fields.collapseRate[comIndex]);

  }, [simState]);

  // Wave presets
  const applyPreset = (presetName: string) => {
    switch (presetName) {
      case "outer-voyager":
        setParameters(prev => ({
          ...prev,
          x_0: 4.5,
          width_0: 0.5,
          k_0: -1.0,
          m: 1.0,
          C: 6.0
        }));
        break;
      case "high-mass-fall":
        setParameters(prev => ({
          ...prev,
          x_0: 4.2,
          width_0: 0.35,
          k_0: -2.5,
          m: 1.8,
          sigma_ipt: 1.5,
          P_0: 1.2
        }));
        break;
      case "sunbound-rocket":
        setParameters(prev => ({
          ...prev,
          x_0: 4.8,
          width_0: 0.25,
          k_0: -4.5,
          m: 0.8,
          sigma_ipt: 0.5,
          C: 10.0
        }));
        break;
    }
  };

  // Rendering graphs
  useEffect(() => {
    drawWavefunctionPlot();
    drawPotentialPlot();
  }, [simState, com, dispersion]);

  const drawWavefunctionPlot = () => {
    const canvas = psiCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Draw grid lines
    ctx.strokeStyle = "rgba(71, 85, 105, 0.15)";
    ctx.lineWidth = 1;
    for (let gridX = 0; gridX < W; gridX += W / 10) {
      ctx.beginPath();
      ctx.moveTo(gridX, 0);
      ctx.lineTo(gridX, H);
      ctx.stroke();
    }
    for (let gridY = 0; gridY < H; gridY += H / 4) {
      ctx.beginPath();
      ctx.moveTo(0, gridY);
      ctx.lineTo(W, gridY);
      ctx.stroke();
    }

    const { x, collapseRate } = simState.fields;
    const paddingLeft = 30;
    const paddingRight = 10;
    const drawW = W - paddingLeft - paddingRight;

    // Mapping coords
    const getCanvasX = (r: number) => {
      return paddingLeft + ((r - R_MIN) / (R_MAX - R_MIN)) * drawW;
    };
    const getCanvasY = (prob: number) => {
      const scale = H * 0.75; // max amplitude scaling
      return H - 15 - Math.min(H * 0.85, prob * scale);
    };

    // Draw planet marks (Earth & Jupiter)
    // Earth (1.0 AU)
    const earthX = getCanvasX(EARTH_R);
    ctx.strokeStyle = "rgba(59, 130, 246, 0.5)"; // Blue
    ctx.setLineDash([5, 5]);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(earthX, 0);
    ctx.lineTo(earthX, H);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "rgba(59, 130, 246, 0.85)";
    ctx.font = "10px monospace";
    ctx.fillText("Earth Orbit (1.0 AU)", earthX + 4, 15);

    // Jupiter (5.2 is off screen, but let's label Mars or Jupiter as 4.0 representation)
    const jupiterX = getCanvasX(4.0);
    ctx.strokeStyle = "rgba(239, 68, 68, 0.25)"; 
    ctx.beginPath();
    ctx.moveTo(jupiterX, 0);
    ctx.lineTo(jupiterX, H);
    ctx.stroke();
    ctx.fillStyle = "rgba(239, 68, 68, 0.4)";
    ctx.fillText("Deep Void Boundary", jupiterX - 110, H - 25);

    // Draw temperature gradient threshold shaded overlay
    const gradient = ctx.createLinearGradient(paddingLeft, 0, W, 0);
    gradient.addColorStop(0, "rgba(224, 120, 50, 0.08)");
    gradient.addColorStop(0.3, "rgba(100, 116, 139, 0.02)");
    gradient.addColorStop(1, "rgba(51, 65, 85, 0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(paddingLeft, 0, drawW, H);

    // Draw Thermal Collapse rate curve scaled at bottom in soft red
    ctx.beginPath();
    ctx.strokeStyle = "rgba(239, 68, 68, 0.4)";
    ctx.lineWidth = 1.5;
    for (let i = 0; i < GRID_POINTS; i++) {
      const rx = getCanvasX(x[i]);
      // Normalize decay rate curve (0 to max rate -> scale to bottom 50px)
      const rRate = collapseRate[i];
      const ry = H - 5 - (rRate / 1e11) * 60;
      if (i === 0) ctx.moveTo(rx, ry);
      else ctx.lineTo(rx, ry);
    }
    ctx.stroke();
    ctx.fillStyle = "rgba(239, 68, 68, 0.5)";
    ctx.fillText("Thermal Coherence Decay Rate Γ(T)", paddingLeft + 15, H - 8);

    // Plot Wavefunction Probability Density ||psi||^2 with real-time color mapping representing quantum phase!
    for (let i = 0; i < GRID_POINTS - 1; i++) {
      const r1 = x[i];
      const r2 = x[i + 1];
      const cx1 = getCanvasX(r1);
      const cx2 = getCanvasX(r2);
      const cy1 = getCanvasY(simState.psiSqu[i]);
      const cy2 = getCanvasY(simState.psiSqu[i + 1]);

      // Calculate the quantum phase: phase = atan2(psiImag, psiReal) 
      // Map phase (-pi to +pi) to an electric cyan/pink/purple color scale
      const pr = simState.psiReal[i];
      const pi = simState.psiImag[i];
      const phase = Math.atan2(pi, pr);
      
      const hue = Math.floor(((phase + Math.PI) / (Math.PI * 2)) * 360);
      ctx.strokeStyle = `hsl(${hue}, 80%, 55%)`;
      ctx.lineWidth = 3.5;
      
      ctx.beginPath();
      ctx.moveTo(cx1, cy1);
      ctx.lineTo(cx2, cy2);
      ctx.stroke();

      // Shading under the wavefunction curve
      ctx.fillStyle = `hsla(${hue}, 80%, 55%, 0.05)`;
      ctx.beginPath();
      ctx.moveTo(cx1, H - 15);
      ctx.lineTo(cx1, cy1);
      ctx.lineTo(cx2, cy2);
      ctx.lineTo(cx2, H - 15);
      ctx.fill();
    }

    // Draw center of mass marker
    const comX = getCanvasX(com);
    ctx.fillStyle = "#f59e0b"; // Goldenrod
    ctx.beginPath();
    ctx.arc(comX, getCanvasY(simState.psiSqu[Math.min(GRID_POINTS - 1, Math.max(0, Math.floor(((com - R_MIN) / (R_MAX - R_MIN)) * GRID_POINTS)))]), 5, 0, Math.PI * 2);
    ctx.fill();

    // Wave packet dispersion indicator line at the bottom
    const startDispX = getCanvasX(com - dispersion);
    const endDispX = getCanvasX(com + dispersion);
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(startDispX, H - 18);
    ctx.lineTo(endDispX, H - 18);
    ctx.stroke();
    ctx.fillRect(startDispX, H - 20, 1, 4);
    ctx.fillRect(endDispX, H - 20, 1, 4);

    // If collapse has triggered: show a lightning spike and a text actualizer
    if (simState.isCollapsed && simState.collapseCenter) {
      const colX = getCanvasX(simState.collapseCenter);
      ctx.strokeStyle = "rgba(244, 63, 94, 0.8)"; // bright rose
      ctx.lineWidth = 2.5;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(colX, 0);
      ctx.lineTo(colX, H - 15);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "#e11d48";
      ctx.font = "bold 11px font-display, sans-serif";
      ctx.fillText("⚡ COLLAPSE / ACTUALIZATION TRIGGERED", colX + 8, H / 2 - 10);
    }
  };

  const drawPotentialPlot = () => {
    const canvas = potentialCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    ctx.strokeStyle = "rgba(71, 85, 105, 0.1)";
    ctx.lineWidth = 1;
    for (let gridX = 0; gridX < W; gridX += W / 10) {
      ctx.beginPath();
      ctx.moveTo(gridX, 0);
      ctx.lineTo(gridX, H);
      ctx.stroke();
    }

    const { x, potentialGravity, potentialIPT, potentialTotal } = simState.fields;
    const paddingLeft = 30;
    const paddingRight = 10;
    const drawW = W - paddingLeft - paddingRight;

    const getCanvasX = (r: number) => {
      return paddingLeft + ((r - R_MIN) / (R_MAX - R_MIN)) * drawW;
    };

    // Auto find limits for visual potential scaling
    const maxVal = 2.0;
    const minVal = -15.0; // gravity curves drop deep
    const getCanvasY = (val: number) => {
      const clamped = Math.max(minVal, Math.min(maxVal, val));
      return 10 + ((clamped - maxVal) / (minVal - maxVal)) * (H - 20);
    };

    // Draw Potential lines
    // 1. Gravity (dotted orange)
    ctx.strokeStyle = "rgba(217, 119, 6, 0.4)";
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    for (let i = 0; i < GRID_POINTS; i++) {
      const cx = getCanvasX(x[i]);
      const cy = getCanvasY(potentialGravity[i]);
      if (i === 0) ctx.moveTo(cx, cy);
      else ctx.lineTo(cx, cy);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // 2. IPT Potential (cyan)
    ctx.strokeStyle = "rgba(6, 182, 212, 0.4)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < GRID_POINTS; i++) {
      const cx = getCanvasX(x[i]);
      const cy = getCanvasY(potentialIPT[i]);
      if (i === 0) ctx.moveTo(cx, cy);
      else ctx.lineTo(cx, cy);
    }
    ctx.stroke();

    // 3. Total Combined Potential (Thick solid white, represents the "hills")
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    for (let i = 0; i < GRID_POINTS; i++) {
      const cx = getCanvasX(x[i]);
      const cy = getCanvasY(potentialTotal[i]);
      if (i === 0) ctx.moveTo(cx, cy);
      else ctx.lineTo(cx, cy);
    }
    ctx.stroke();

    // Fill area below/above total potential to show barrier depth
    ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
    ctx.beginPath();
    for (let i = 0; i < GRID_POINTS; i++) {
      const cx = getCanvasX(x[i]);
      const cy = getCanvasY(potentialTotal[i]);
      if (i === 0) ctx.moveTo(cx, cy);
      else ctx.lineTo(cx, cy);
    }
    ctx.lineTo(getCanvasX(R_MAX), H);
    ctx.lineTo(getCanvasX(R_MIN), H);
    ctx.closePath();
    ctx.fill();

    // Axis marker at y=0 potential
    const zeroY = getCanvasY(0);
    ctx.strokeStyle = "rgba(148, 163, 184, 0.2)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(paddingLeft, zeroY);
    ctx.lineTo(W, zeroY);
    ctx.stroke();

    // Draw particle overlay representing the wave center of mass sliding down
    const comX = getCanvasX(com);
    const comIndex = Math.min(GRID_POINTS - 1, Math.max(0, Math.floor(((com - R_MIN) / (R_MAX - R_MIN)) * GRID_POINTS)));
    const comY = getCanvasY(potentialTotal[comIndex]);
    
    // Wave packet visual ball
    ctx.fillStyle = "rgba(239, 68, 68, 0.8)";
    ctx.beginPath();
    ctx.arc(comX, comY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Labels
    ctx.font = "9px monospace";
    ctx.fillStyle = "rgba(217, 119, 6, 0.6)";
    ctx.fillText("Gravity V_g", W - 75, getCanvasY(potentialGravity[GRID_POINTS - 5]) - 5);
    ctx.fillStyle = "rgba(6, 182, 212, 0.6)";
    ctx.fillText("IPT Potential V_ipt", W - 110, getCanvasY(potentialIPT[GRID_POINTS - 5]) + 10);
    ctx.fillStyle = "#cbd5e1";
    ctx.fillText("Total Potential V_eff(r)", paddingLeft + 15, 20);
    
    // Earth label
    const earthX = getCanvasX(EARTH_R);
    ctx.strokeStyle = "rgba(59, 130, 246, 0.3)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(earthX, 0);
    ctx.lineTo(earthX, H);
    ctx.stroke();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-4 md:p-6 text-slate-300 bg-transparent font-sans" id="wave-sim-screen">
      {/* Simulation Controls Column */}
      <div className="lg:col-span-1 space-y-6 bg-black/40 border border-white/10 p-5 rounded-2xl flex flex-col justify-between shadow-2xl backdrop-blur-md" id="sim-sidebar">
        <div>
          <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
            <h3 className="text-xs font-bold tracking-[0.2em] text-white uppercase italic flex items-center gap-2">
              <Compass size={14} className="text-cyan-400" /> Engine Controls
            </h3>
            <button 
              onClick={() => setShowHelp(!showHelp)}
              className="text-slate-500 hover:text-white p-1 rounded hover:bg-white/5 transition"
              title="Help"
            >
              <HelpCircle size={14} />
            </button>
          </div>

          {showHelp && (
            <div className="text-[11px] font-mono bg-white/5 border border-white/5 p-3 rounded-lg text-slate-400 space-y-2 mb-4 animate-fadeIn">
              <p>
                <strong>Wave Packet Solver:</strong> Integrates the 1D Schrödinger equation. 
                Gravity and Invisible Pressure push the packet from the outer void inward.
              </p>
              <p>
                <strong>Environmental Decay:</strong> As the wave approaches Earth, the high heat triggers 
                decay, causing wavefunction collapse into localized particles, producing organic events.
              </p>
            </div>
          )}

          {/* Preset selector */}
          <div className="mb-5">
            <label className="block text-[10px] text-slate-500 uppercase tracking-widest mb-2 pl-1">Simulation Presets</label>
            <select 
              onChange={(e) => applyPreset(e.target.value)}
              className="w-full bg-white/5 border border-white/10 p-2 text-xs rounded-lg text-cyan-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-mono tracking-wider"
            >
              <option value="" className="bg-slate-950">-- Apply Wave Setup --</option>
              <option value="outer-voyager" className="bg-slate-950">Standard Outer Wave (M=1.0)</option>
              <option value="high-mass-fall" className="bg-slate-950">Heavy Sluggish Packet (M=1.8)</option>
              <option value="sunbound-rocket" className="bg-slate-950">Rapid Lightweight Rocket (M=0.8)</option>
            </select>
          </div>

          <div className="space-y-4">
            {/* Solar Intensity Constant C */}
            <div>
              <div className="flex justify-between text-[11px] font-mono text-slate-300 mb-1">
                <span>Solar Intensity Constant (C)</span>
                <span className="text-cyan-400 font-bold">{parameters.C.toFixed(1)}</span>
              </div>
              <input 
                type="range" min="1.0" max="15.0" step="0.5"
                value={parameters.C}
                onChange={(e) => setParameters(prev => ({ ...prev, C: Number(e.target.value) }))}
                className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <span className="text-[9px] text-slate-500 font-mono">Steepens primary temperature gradient.</span>
            </div>

            {/* Baseline Pressure P0 */}
            <div>
              <div className="flex justify-between text-[11px] font-mono text-slate-300 mb-1">
                <span>Void Baseline Pressure (P₀)</span>
                <span className="text-cyan-400 font-bold">{parameters.P_0.toFixed(2)}</span>
              </div>
              <input 
                type="range" min="0.10" max="3.00" step="0.10"
                value={parameters.P_0}
                onChange={(e) => setParameters(prev => ({ ...prev, P_0: Number(e.target.value) }))}
                className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <span className="text-[9px] text-slate-500 font-mono">Modulates intensity of Invisible Pressure.</span>
            </div>

            {/* Wave cross-section coupling sigma_ipt */}
            <div>
              <div className="flex justify-between text-[11px] font-mono text-slate-300 mb-1">
                <span>IPT Coupling (σ_ipt)</span>
                <span className="text-cyan-400 font-bold">{parameters.sigma_ipt.toFixed(2)}</span>
              </div>
              <input 
                type="range" min="0.10" max="2.50" step="0.05"
                value={parameters.sigma_ipt}
                onChange={(e) => setParameters(prev => ({ ...prev, sigma_ipt: Number(e.target.value) }))}
                className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <span className="text-[9px] text-slate-500 font-mono">How sensitive matter is to the pressure pot.</span>
            </div>

            {/* Gravity Constant (g) */}
            <div>
              <div className="flex justify-between text-[11px] font-mono text-slate-300 mb-1">
                <span>Gravitational Scale (G)</span>
                <span className="text-cyan-400 font-bold">{parameters.g_constant.toFixed(1)}</span>
              </div>
              <input 
                type="range" min="0.0" max="8.0" step="0.5"
                value={parameters.g_constant}
                onChange={(e) => setParameters(prev => ({ ...prev, g_constant: Number(e.target.value) }))}
                className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <span className="text-[9px] text-slate-500 font-mono">Standard planetary pull force.</span>
            </div>

            {/* Initial velocity (k0) */}
            <div>
              <div className="flex justify-between text-[11px] font-mono text-slate-300 mb-1">
                <span>Initial Velocity/Momentum (k₀)</span>
                <span className="text-rose-400 font-bold">{parameters.k_0.toFixed(1)}</span>
              </div>
              <input 
                type="range" min="-6.0" max="0.0" step="0.2"
                value={parameters.k_0}
                onChange={(e) => setParameters(prev => ({ ...prev, k_0: Number(e.target.value) }))}
                className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
              <span className="text-[9px] text-slate-500 font-mono">Inward momentum vector from void.</span>
            </div>

            {/* Mass constant (m) */}
            <div>
              <div className="flex justify-between text-[11px] font-mono text-slate-300 mb-1">
                <span>State Inertial Mass (m)</span>
                <span className="text-cyan-400 font-bold">{parameters.m.toFixed(1)}</span>
              </div>
              <input 
                type="range" min="0.5" max="3.0" step="0.1"
                value={parameters.m}
                onChange={(e) => setParameters(prev => ({ ...prev, m: Number(e.target.value) }))}
                className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <span className="text-[9px] text-slate-500 font-mono">Governs standard quantum dispersion speeds.</span>
            </div>

            {/* Temperature threshold Activation Energy (E_a) */}
            <div>
              <div className="flex justify-between text-[11px] font-mono text-slate-300 mb-1">
                <span>Thermal Collapse Threshold (E_a)</span>
                <span className="text-rose-400 font-bold">{parameters.E_a.toFixed(1)}</span>
              </div>
              <input 
                type="range" min="0.5" max="6.0" step="0.1"
                value={parameters.E_a}
                onChange={(e) => setParameters(prev => ({ ...prev, E_a: Number(e.target.value) }))}
                className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
              <span className="text-[9px] text-slate-500 font-mono">Governs threshold temperature of collapse trigger.</span>
            </div>
          </div>
        </div>

        {/* Action Button Strip */}
        <div className="mt-8 border-t border-white/10 pt-5 space-y-3" id="sim-controls">
          <div className="grid grid-cols-3 gap-2">
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className={`py-2 px-3 rounded-lg font-mono tracking-wider uppercase text-[10px] transition border ${
                isPlaying 
                  ? "bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20" 
                  : "bg-cyan-500/10 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/20"
              }`}
            >
              {isPlaying ? <Pause size={12} /> : <Play size={12} />}
              {isPlaying ? "Pause" : "Evolve"}
            </button>
            <button 
              onClick={() => setSimState(prev => executeSimulationStep(prev, 0.05))}
              disabled={isPlaying || simState.isCollapsed}
              className="py-2 px-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg font-mono tracking-wider uppercase text-[10px] text-slate-300 transition disabled:opacity-30 disabled:pointer-events-none"
            >
              <SkipForward size={12} /> Step
            </button>
            <button 
              onClick={handleReset}
              className="py-2 px-3 bg-black/40 border border-white/10 hover:bg-white/5 text-slate-500 hover:text-white rounded-lg font-mono tracking-wider uppercase text-[10px] transition"
            >
              <RotateCcw size={12} /> Reset
            </button>
          </div>

          <button 
            onClick={handleManualCollapse}
            disabled={simState.isCollapsed}
            className="w-full py-2.5 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg font-mono font-bold transition flex items-center justify-center gap-2 text-[10px] tracking-wider uppercase shadow-md disabled:opacity-35 disabled:pointer-events-none"
          >
            <Sparkles size={12} className="animate-spin" /> FORCE WAVE MEASUREMENT
          </button>
        </div>
      </div>

      {/* Numerical Visualization and Charting Area */}
      <div className="lg:col-span-3 space-y-6">
        {/* Real-time Wave Telemetry Indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="telemetry-bar">
          <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center gap-4">
            <div className="p-2.5 rounded-full bg-cyan-500/10 text-cyan-400">
              <Atom size={16} />
            </div>
            <div>
              <span className="block text-[9px] font-mono text-slate-500 uppercase tracking-wider">Wave Center ⟨r⟩</span>
              <span className="font-mono text-base font-bold text-cyan-400">
                {com.toFixed(3)} <span className="text-[10px] font-normal text-slate-500">AU</span>
              </span>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center gap-4">
            <div className="p-2.5 rounded-full bg-emerald-500/10 text-emerald-400">
              <Activity size={16} />
            </div>
            <div>
              <span className="block text-[9px] font-mono text-slate-500 uppercase tracking-wider">Dispersion σ_r</span>
              <span className="font-mono text-base font-bold text-emerald-400">
                {dispersion.toFixed(3)} <span className="text-[10px] font-normal text-slate-500">AU</span>
              </span>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center gap-4">
            <div className="p-2.5 rounded-full bg-rose-500/10 text-rose-400">
              <Thermometer size={16} />
            </div>
            <div>
              <span className="block text-[9px] font-mono text-slate-500 uppercase tracking-wider">COM Temp T(⟨r⟩)</span>
              <span className="font-mono text-base font-bold text-rose-400">
                {com > R_MIN ? (parameters.C / com + parameters.T_cmb).toFixed(1) : "—"} <span className="text-[10px] font-normal text-slate-500">K</span>
              </span>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center gap-4">
            <div className="p-2.5 rounded-full bg-sky-500/10 text-sky-450 text-cyan-400">
              <Gauge size={16} />
            </div>
            <div>
              <span className="block text-[9px] font-mono text-slate-500 uppercase tracking-wider">Decoherence Rate Γ</span>
              <span className="font-mono text-base font-bold text-cyan-300">
                {collapseRateAtCom < 1 ? "1.0 K-Hz" : (collapseRateAtCom / 1e9).toFixed(2) + " GHz"}
              </span>
            </div>
          </div>
        </div>

        {/* The Live Interactive Wave Canvas */}
        <div className="bg-black/30 border border-white/10 p-5 md:p-6 rounded-2xl shadow-xl space-y-6" id="canvas-card">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div>
              <h4 className="text-xs font-bold tracking-[0.2em] text-white uppercase italic">
                Wavefunction Evolution <span className="text-[10px] text-cyan-400 not-italic ml-2">||Ψ(r, t)||²</span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-1 font-mono">
                COMPLEX GRADIENT PHASE [atan2(Im, Re)] MODELING INJECTED FIELD MOMENTUM
              </p>
            </div>
            <div className="flex items-center gap-2 text-[9px] font-mono text-slate-500 bg-white/5 px-2 py-1 rounded border border-white/5">
              <span>Timeline t: {simState.time.toFixed(2)}s</span>
              <span>•</span>
              <span>Step: {simState.step}</span>
            </div>
          </div>

          <div className="relative border border-white/5 bg-black/40 rounded-xl overflow-hidden shadow-inner p-2">
            <canvas 
              ref={psiCanvasRef} 
              width={750} 
              height={260}
              className="w-full h-auto block"
            />
          </div>

          <div className="border-t border-white/5 pt-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-xs font-bold tracking-[0.2em] text-white uppercase italic">
                  Cosmic Pressure Potentials <span className="text-[10px] text-cyan-400 not-italic ml-2">V_eff(r)</span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                  WHITE CURVE REPRESENTS TOTAL ENERGY POTENTIAL BARRIER: V_eff = V_gravity + V_IPT
                </p>
              </div>
            </div>

            <div className="border border-white/5 bg-black/40 rounded-xl overflow-hidden shadow-inner p-2">
              <canvas 
                ref={potentialCanvasRef} 
                width={750} 
                height={150}
                className="w-full h-auto block"
              />
            </div>
          </div>
        </div>

        {/* Sandbox Simulation Telemetry / Log list of collapses */}
        <div className="bg-black/30 border border-white/10 p-5 rounded-2xl shadow-lg" id="collapse-logs-holder">
          <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-3">
            <h4 className="text-[10px] font-bold tracking-widest uppercase text-emerald-400 flex items-center gap-2 border-l-2 border-emerald-500 pl-2">
              <Sparkles size={12} /> Actualization Chrono-Log (Collapse Products)
            </h4>
            {events.length > 0 && (
              <button 
                onClick={clearEvents}
                className="text-[9px] font-mono bg-white/5 hover:bg-rose-500/10 text-rose-400 border border-white/10 hover:border-rose-500/20 px-2.5 py-1 rounded-md transition"
              >
                Flush Channels
              </button>
            )}
          </div>

          {events.length === 0 ? (
            <div className="p-8 text-center bg-black/10 rounded-xl border border-white/5">
              <p className="text-xs text-slate-500 font-mono italic">
                 NO ENERGETIC SINK EVENT REGISTRY DETECTED. EVO Timelines ready...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-1">
              {events.map((evt, idx) => (
                <div 
                  key={evt.id} 
                  className="bg-white/5 border border-white/10 p-3 rounded-lg flex flex-col justify-between hover:border-white/20 transition relative overflow-hidden group"
                >
                  {/* Category color indicator */}
                  <div className={`absolute top-0 left-0 w-1 h-full ${
                    evt.category === "biological" ? "bg-emerald-500" :
                    evt.category === "chemical" ? "bg-rose-500" :
                    evt.category === "quantum" ? "bg-cyan-500" : "bg-cyan-400"
                  }`} />

                  <div className="pl-2 flex justify-between items-start">
                    <div>
                      <span className="font-mono text-[9px] text-slate-500 uppercase tracking-widest font-bold">
                        {evt.category} Event
                      </span>
                      <h5 className="font-mono font-medium text-xs mt-0.5 text-slate-200 group-hover:text-white transition">
                        {evt.eventName}
                      </h5>
                    </div>
                    <span className="text-[10px] font-mono font-medium text-cyan-400 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-500/10">
                      {evt.location.toFixed(2)} AU
                    </span>
                  </div>

                  <div className="pl-2 mt-2 flex justify-between items-center text-[9px] text-slate-500 font-mono">
                    <span>Intensity: <span className="text-white">{evt.intensity.toFixed(3)}</span></span>
                    <span>T ≈ {((parameters.C / evt.location) + parameters.T_cmb).toFixed(1)} K</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
