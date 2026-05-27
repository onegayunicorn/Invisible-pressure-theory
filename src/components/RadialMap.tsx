/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { SimulationParameters } from "../types";
import { computeFields, EARTH_R, R_MIN, R_MAX } from "../simulator-logic";
import { 
  Sun, 
  Orbit, 
  Eye, 
  HelpCircle,
  Thermometer, 
  Activity, 
  Gauge, 
  Wind 
} from "lucide-react";

interface RadialMapProps {
  parameters: SimulationParameters;
}

export function RadialMap({ parameters }: RadialMapProps) {
  const fields = computeFields(parameters);
  const [hoverRadius, setHoverRadius] = useState<number | null>(EARTH_R);

  // Calculate dynamic maximum/peak of Life Potential Density L(r)
  const maxLifeVal = Math.max(...fields.lifePotential, 0.0001);
  const maxLifeIdx = fields.lifePotential.indexOf(maxLifeVal);
  const maxLifeRadius = fields.x[maxLifeIdx];
  
  // Find hover variables
  const getHoverVariables = () => {
    if (hoverRadius === null) return null;
    const r = hoverRadius;
    const temp = (parameters.C / r) + parameters.T_cmb;
    const press = parameters.P_0 * (parameters.T_cmb / temp);
    const dPdr = (parameters.P_0 * parameters.C * parameters.T_cmb) / Math.pow(parameters.C + r * parameters.T_cmb, 2);
    const rate = parameters.gamma_0 * Math.exp(-parameters.E_a * 100 / temp);
    const life = dPdr * rate * 10;
    
    return {
      r,
      temp,
      press,
      dPdr,
      rate,
      life
    };
  };

  const hoverData = getHoverVariables();

  // Create SVG path for line charts
  const makeSvgPoints = (data: number[], scaleY: (val: number) => number) => {
    const W = 500;
    const dx = W / (data.length - 1);
    return data
      .map((val, idx) => {
        const xCoord = idx * dx;
        const yCoord = scaleY(val);
        return `${xCoord.toFixed(1)},${yCoord.toFixed(1)}`;
      })
      .join(" ");
  };

  // SVG Chart scalers
  const W = 500;
  const H = 160;

  // Temp Scaler
  const scaleTempY = (val: number) => {
    const minT = parameters.T_cmb;
    const maxT = parameters.C / R_MIN + parameters.T_cmb;
    // Log scale useful for extreme thermal jumps
    return H - 10 - (Math.log(val / minT) / Math.log(maxT / minT)) * (H - 20);
  };

  // Pressure Scaler
  const scalePressY = (val: number) => {
    const minP = 0;
    const maxP = parameters.P_0;
    return H - 10 - (val / (maxP || 1)) * (H - 20);
  };

  // Life Scaler
  const scaleLifeY = (val: number) => {
    // Normal scale mapping to screen
    const maxL = Math.max(...fields.lifePotential, 0.0001);
    return H - 10 - (val / maxL) * (H - 20);
  };

  return (
    <div className="p-4 md:p-6 bg-transparent text-slate-300 font-sans" id="radial-map-screen">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Conceptual Column / Concentric Solar Layout */}
        <div className="lg:col-span-2 bg-black/40 border border-white/10 p-5 rounded-2xl flex flex-col justify-between shadow-2xl backdrop-blur-md">
          <div>
            <h3 className="text-xs font-bold tracking-[0.2em] text-white uppercase italic mb-2 flex items-center gap-2 border-l-2 border-cyan-500 pl-2">
              <Sun size={14} className="text-cyan-450 text-cyan-400 animate-pulse" /> Concentric Solar Cradle
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Invisible Pressure (IPT) acts like a massive background force, compressing wave possibilities from high outer void space inwards. 
              Gradients peak near Earth, where heat collapses probability states into physical biochemistries.
            </p>

            {/* Concentric System Diagram */}
            <div className="relative flex justify-center items-center h-64 bg-black/40 rounded-xl border border-white/5 overflow-hidden mb-4">
              {/* Star Core (Sun) */}
              <div className="absolute w-8 h-8 rounded-full bg-orange-500 blur-sm animate-pulse flex items-center justify-center">
                <Sun size={10} className="text-white" />
              </div>
              
              {/* Radiating heat gradients */}
              <div className="absolute w-16 h-16 rounded-full border border-orange-500/20 bg-orange-500/5" />
              
              {/* Earth Ring Zone (Goldilocks Orbit of maximum life potential) */}
              <div className="absolute w-28 h-28 rounded-full border border-emerald-500/30 bg-emerald-500/2" />
              <div className="absolute w-28 h-28 rounded-full border-2 border-dashed border-cyan-400/20 animate-spin" style={{ animationDuration: "60s" }} />
              
              {/* Earth Ball */}
              <div className="absolute transform -translate-y-14 flex flex-col items-center">
                <div className="w-2 h-2 rounded-full bg-cyan-400 border border-white" />
                <span className="text-[8px] font-mono text-cyan-400 mt-1">Earth</span>
              </div>

              {/* Voyager boundary cold area */}
              <div className="absolute w-48 h-48 rounded-full border border-white/5 bg-transparent" />
              <div className="absolute w-56 h-56 rounded-full border border-dotted border-white/10 bg-transparent" />

              {/* Outside Flow vectors showing IPT compression direction */}
              <div className="absolute inset-0 flex p-3 pointer-events-none justify-between items-center text-slate-500">
                <div className="flex flex-col items-start font-mono text-[7px] space-y-1">
                  <span>OUTER VOID</span>
                  <span>T ≈ 2.7 K</span>
                  <span>IPT PISTON ➔</span>
                </div>
                <div className="flex flex-col items-end font-mono text-[7px] space-y-1">
                  <span>HIGH VACUUM</span>
                  <span>Γ ⬇ (Slow decay)</span>
                  <span>⬅ IPT PISTON</span>
                </div>
              </div>

              {/* Interactive spatial placement indicator */}
              {hoverRadius !== null && (
                <div 
                  className="absolute rounded-full border border-cyan-400/40 transition-all duration-150"
                  style={{
                    width: `${hoverRadius * 52}px`,
                    height: `${hoverRadius * 52}px`,
                  }}
                />
              )}
            </div>

            {/* Range Slider to query coordinates */}
            <div>
              <label className="block text-[10px] text-slate-500 uppercase tracking-widest mb-1.5 pl-1">Spatial Query Probe (r)</label>
              <input 
                type="range" min={R_MIN} max={R_MAX} step="0.05"
                value={hoverRadius || 1.0}
                onChange={(e) => setHoverRadius(Number(e.target.value))}
                className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                <span>0.1 AU (Sun edge)</span>
                <span className="text-cyan-400 font-bold">{hoverRadius?.toFixed(2)} AU</span>
                <span>5.1 AU (Outer Void)</span>
              </div>
            </div>
          </div>

          {/* Quick Info Box */}
          <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/5 text-[11px] text-slate-400 font-mono">
            <span className="text-cyan-400 font-bold">Goldilocks Phase:</span> At Earth Orbit (r = 1.0), the Invisible Pressure Gradient is optimized to produce maximum molecular assembly. Leftward is too incinerative; rightward has insufficient thermal triggers.
          </div>
        </div>

        {/* Mathematical Curves / Interactive Charts */}
        <div className="lg:col-span-3 space-y-6">
          {/* Spatial Probe Query Results panel */}
          <div className="bg-black/30 border border-white/10 p-5 rounded-2xl shadow-xl">
            <h4 className="text-xs font-bold tracking-[0.2em] text-white uppercase italic mb-4 flex items-center gap-2 border-l-2 border-cyan-500 pl-2">
              <Eye size={14} className="text-cyan-450 text-cyan-400" /> Space-Holographic Query Profile
            </h4>

            {hoverData ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                  <span className="text-[10px] font-mono text-slate-500 block uppercase">Temperature Field</span>
                  <span className="text-base font-mono font-bold text-cyan-400 flex items-center gap-1 mt-1">
                    <Thermometer size={12} /> {hoverData.temp.toFixed(1)} K
                  </span>
                  <span className="text-[9px] font-mono text-slate-500 block mt-0.5">T(r) = C/r + CMB</span>
                </div>

                <div className="bg-white/5 p-3 rounded-lg border border-white/5 font-mono">
                  <span className="text-[10px] text-slate-500 block uppercase">Invisible Pressure</span>
                  <span className="text-base font-bold text-cyan-400 flex items-center gap-1 mt-1">
                    <Wind size={12} /> {hoverData.press.toFixed(3)} P₀
                  </span>
                  <span className="text-[9px] text-slate-500 block mt-0.5">P(r) = T_cmb / T(r)</span>
                </div>

                <div className="bg-white/5 p-3 rounded-lg border border-white/5 font-mono">
                  <span className="text-[10px] text-slate-500 block uppercase font-mono">Thermal Collapse Rate</span>
                  <span className="text-base font-bold text-rose-400 flex items-center gap-1 mt-1">
                    <Gauge size={12} /> {(hoverData.rate / 1e9).toFixed(1)} GHz
                  </span>
                  <span className="text-[9px] text-slate-500 block mt-0.5">Γ(T) = γ₀·exp(-Eₐ/T)</span>
                </div>

                <div className="bg-white/5 p-3 rounded-lg border border-cyan-500/20 font-mono">
                  <span className="text-[10px] text-cyan-400 block uppercase">Life Potential (L)</span>
                  <span className="text-base font-bold text-emerald-400 flex items-center gap-1 mt-1">
                    <Activity size={12} /> {hoverData.life.toFixed(2)} %
                  </span>
                  <span className="text-[9px] text-slate-550 text-emerald-500 block mt-0.5">L ∝ |∇P|·Γ(T)</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic font-mono">Sweep the slider above or hover chart nodes to inspect the spatial properties of the IPT timeline.</p>
            )}
          </div>

          {/* Mathematical field curves plotted on SVG */}
          <div className="bg-black/30 border border-white/10 p-5 rounded-2xl shadow-xl space-y-6">
            <h4 className="text-xs font-bold tracking-[0.2em] text-white uppercase italic">
              FIELD CURVES ACROSS SOLAR SYSTEM DIAL
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Temperature Curve */}
              <div className="space-y-2">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-cyan-400">Solar Gradient T(r)</span>
                  <span className="text-slate-500">Max Log</span>
                </div>
                <div className="bg-black/40 border border-white/5 p-2 rounded-xl relative">
                  <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto overflow-visible">
                    {/* Curve line */}
                    <polyline
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="2.0"
                      points={makeSvgPoints(fields.temperature, scaleTempY)}
                    />
                    {/* Hover indicator node */}
                    {hoverRadius !== null && (
                      <circle
                        cx={((hoverRadius - R_MIN) / (R_MAX - R_MIN)) * W}
                        cy={scaleTempY((parameters.C / hoverRadius) + parameters.T_cmb)}
                        r="4"
                        fill="#f7a71b"
                      />
                    )}
                  </svg>
                  <div className="flex justify-between text-[9px] font-mono text-slate-600 mt-1">
                    <span>Sun</span>
                    <span>1.0 AU (Earth)</span>
                    <span>Void</span>
                  </div>
                </div>
              </div>

              {/* Invisible Pressure Curve */}
              <div className="space-y-2">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-cyan-400">Piston Pressure P(r)</span>
                  <span className="text-slate-500">Scale: P₀</span>
                </div>
                <div className="bg-black/40 border border-white/5 p-2 rounded-xl relative">
                  <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto overflow-visible">
                    {/* Curve line */}
                    <polyline
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth="2.0"
                      points={makeSvgPoints(fields.pressure, scalePressY)}
                    />
                    {/* Hover indicator node */}
                    {hoverRadius !== null && (
                      <circle
                        cx={((hoverRadius - R_MIN) / (R_MAX - R_MIN)) * W}
                        cy={scalePressY(parameters.P_0 * (parameters.T_cmb / ((parameters.C / hoverRadius) + parameters.T_cmb)))}
                        r="4"
                        fill="#06b6d4"
                      />
                    )}
                  </svg>
                  <div className="flex justify-between text-[9px] font-mono text-slate-600 mt-1">
                    <span>Sun</span>
                    <span>1.0 AU (Earth)</span>
                    <span>Void</span>
                  </div>
                </div>
              </div>

              {/* Life Potential Curve */}
              <div className="space-y-2">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-cyan-400">Bio-potential L(r)</span>
                  <span className="text-emerald-400 font-bold">Goldilocks Peak: {maxLifeRadius.toFixed(2)} AU</span>
                </div>
                <div className="bg-black/40 border border-white/5 p-2 rounded-xl relative">
                  <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto overflow-visible">
                    {/* Reference line for Earth Orbit (r = 1.0 AU, X = 90) */}
                    <line 
                      x1="90" 
                      y1="10" 
                      x2="90" 
                      y2={H - 10} 
                      stroke="rgba(56, 189, 248, 0.3)" 
                      strokeDasharray="2,2" 
                      strokeWidth="1.5"
                    />
                    <text 
                      x="94" 
                      y="20" 
                      fill="rgba(56, 189, 248, 0.7)" 
                      fontSize="8" 
                      fontFamily="monospace"
                    >
                      Earth AU
                    </text>

                    {/* Predicted Peak Line (r = maxLifeRadius) */}
                    <line 
                      x1={((maxLifeRadius - R_MIN) / (R_MAX - R_MIN)) * W} 
                      y1="10" 
                      x2={((maxLifeRadius - R_MIN) / (R_MAX - R_MIN)) * W} 
                      y2={H - 10} 
                      stroke="rgba(16, 185, 129, 0.55)" 
                      strokeDasharray="3,3" 
                      strokeWidth="1.5"
                    />
                    <text 
                      x={(((maxLifeRadius - R_MIN) / (R_MAX - R_MIN)) * W) + 5} 
                      y="110" 
                      fill="#10b981" 
                      fontSize="8" 
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      Peak L(r)
                    </text>

                    {/* Curve line */}
                    <polyline
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.5"
                      points={makeSvgPoints(fields.lifePotential, scaleLifeY)}
                    />
                    {/* Hover indicator node */}
                    {hoverRadius !== null && (
                      <circle
                        cx={((hoverRadius - R_MIN) / (R_MAX - R_MIN)) * W}
                        // Manual calculate for life potential
                        cy={scaleLifeY(
                          ((parameters.P_0 * parameters.C * parameters.T_cmb) / Math.pow(parameters.C + hoverRadius * parameters.T_cmb, 2)) * 
                          (parameters.gamma_0 * Math.exp(-parameters.E_a * 100 / ((parameters.C / hoverRadius) + parameters.T_cmb))) * 10
                        )}
                        r="5"
                        fill="#22d3ee"
                        stroke="#ffffff"
                        strokeWidth="1"
                      />
                    )}
                  </svg>
                  <div className="flex justify-between text-[9px] font-mono text-slate-600 mt-1">
                    <span>Sun (0.1 AU)</span>
                    <span className="text-cyan-400 font-bold">1.0 AU (Earth)</span>
                    <span>Void (5.1 AU)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-black/45 border border-cyan-500/15 p-4 rounded-xl text-slate-400 space-y-3">
              <h5 className="font-mono text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                Physical Interpretation of Life Potential Density L(r)
              </h5>
              <p className="text-[11px] leading-relaxed">
                In IPT, the <strong>Life Potential Density</strong>, represented as <code className="text-emerald-400 font-mono font-bold bg-emerald-950/40 px-1 py-0.5 rounded">L(r) = α · |∇P(r)| · Γ(T(r))</code>, functions as the mathematical <strong>probability density for complex, life-generating structures</strong> across space.
              </p>
              <p className="text-[11px] leading-relaxed">
                Under standard Copenhagen mechanics, quantum measurements are subjective observers collapsing arbitrary possibilities. In contrast, IPT models actualization as an objective environmental process:
              </p>
              <ul className="text-[11px] list-disc list-inside space-y-1 pl-2 font-mono text-slate-500">
                <li>
                  <span className="text-cyan-300">|∇P(r)| (Mechanical Compression Gradient):</span> Determines the driving piston force in-ward, concentrating and organizing quantum wave configurations into structured focal points.
                </li>
                <li>
                  <span className="text-rose-300 font-bold">Γ(T(r)) (Thermal Decoherence Rate):</span> Governs the spatial frequency of objective quantum collapse measurements. Highly coherent outer regions (near absolute zero) preserve wave delocalization, while warm bodies force measurements into specific localized physical states.
                </li>
                <li>
                  <span className="text-emerald-300 font-bold">Goldilocks Peak at r ≈ 1.0 AU (Earth):</span> A delicate thermal-pressure resonance. Leftward (closer to Sun) is too hot and incinerative; rightward (deep space) has zero decoherence actualization. Around Earth's orbit, the balance generates the organic cradles that assemble complex chemistry.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
