/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  ExperimentModel 
} from "../types";
import { 
  Activity, 
  FlaskConical, 
  Settings, 
  CheckCircle, 
  TrendingUp, 
  ChevronRight,
  HelpCircle
} from "lucide-react";

export function ExperimentLab() {
  const [activeTab, setActiveTab] = useState<"decoherence" | "propagation" | "cosmo">("decoherence");

  // Slider inputs for Experiment 1
  const [laserIntensity, setLaserIntensity] = useState(5.0); // 1.0 to 10.0
  const [vacuumLevel, setVacuumLevel] = useState(9); // 1 (poor) to 12 (ultra high vacuum)
  const [gradientSteepness, setGradientSteepness] = useState(50.0); // 10 to 150 K/m

  // Slider inputs for Experiment 2
  const [tunnelGradient, setTunnelGradient] = useState(4.0); // 1 to 10 scale
  const [particleCrossSection, setParticleCrossSection] = useState(1.5); // 0.1 to 3.0

  // Slider inputs for Experiment 3
  const [voidScale, setVoidScale] = useState(3.0); // 1 to 5 scale
  const [vacuumEnergyPress, setVacuumEnergyPress] = useState(2.0); // 0.5 to 5.0

  // Computed data points for graphing
  const [chartData, setChartData] = useState<{ label: string; standard: number; ipt: number }[]>([]);

  useEffect(() => {
    generateChartData();
  }, [
    activeTab, 
    laserIntensity, 
    vacuumLevel, 
    gradientSteepness, 
    tunnelGradient, 
    particleCrossSection,
    voidScale,
    vacuumEnergyPress
  ]);

  const generateChartData = () => {
    const data: { label: string; standard: number; ipt: number }[] = [];

    if (activeTab === "decoherence") {
      // Formula for Decoherence:
      // Standard: flat environmental thermal decoherence proportional to absolute temp T (e.g. constant gas collisions)
      // Standard = BaseNoise + TempNoise
      // IPT = Standard + alpha * |grad T| / T^2
      // Let x represent position across the focused vacuum laser core (-50 to 50 mm)
      const baseNoise = Math.max(0.01, 13 - vacuumLevel); // lower vacuum = higher collision noise
      const alpha = 8.0;

      for (let pos = -50; pos <= 50; pos += 5) {
        const distToLaser = Math.abs(pos);
        // Local temperature peak right in the laser hub at pos=0
        const localTemp = 10 + (laserIntensity * 60) * Math.exp(-Math.pow(pos / 15, 2));
        
        // Standard decoherence depends primarily on local absolute T and gas collision noise:
        const standardRate = baseNoise + localTemp * 0.05;

        // Gradient dT/dx: derivative of Gaussian
        const gradT = Math.abs(-2 * pos / (15 * 15)) * (laserIntensity * 60) * Math.exp(-Math.pow(pos / 15, 2)) * (gradientSteepness / 50);
        // IPT Anomalous spike peaks right in the steepest part of the gradient (at pos = +-10mm)
        const iptAnomalous = alpha * (gradT / (localTemp + 1));
        const iptRate = standardRate + iptAnomalous;

        data.push({
          label: `${pos}`,
          standard: Number(standardRate.toFixed(3)),
          ipt: Number(iptRate.toFixed(3))
        });
      }
    } else if (activeTab === "propagation") {
      // Wave packet acceleration through focused heat tunnel
      // Let label represents time steps (seconds)
      // Standard: linear path (zero acceleration in a force-free potential)
      // IPT: experience Force = -grad P_ipt which pulls packet forward, causing curved trajectory!
      let standardPos = 1.0;
      let iptPos = 1.0;
      let iptVel = 0.5;

      for (let t = 0; t <= 20; t++) {
        standardPos += 0.4; // constant speed standard
        
        // IPT accelerates due to force F = -grad P proportional to tunnelGradient and crossSection
        const force = (tunnelGradient * particleCrossSection * 0.1) / (1 + t * 0.05);
        iptVel += force * 0.15;
        iptPos += iptVel;

        data.push({
          label: `t=${t}s`,
          standard: Number(standardPos.toFixed(2)),
          ipt: Number(iptPos.toFixed(2))
        });
      }
    } else if (activeTab === "cosmo") {
      // Cosmological density profiles around massive cosmic voids (x representing distance from void boundary)
      // Standard CDM: standard gravity clustering profile
      // IPT prediction: anomalous over-density boundaries near void transitions where grad P is maximum!
      for (let r = 0; r <= 100; r += 5) {
        // Standard CDM profiles drop smooth into voids
        const standardDensity = 1.0 + Math.pow(r / 50, 2);

        // IPT creates a compression "pile-up" halo boundary near void interfaces (r ≈ 40)
        const haloPeak = 4.0 * vacuumEnergyPress * Math.exp(-Math.pow((r - 45) / (12 * voidScale), 2));
        const iptDensity = standardDensity + haloPeak;

        data.push({
          label: `${r}Mpc`,
          standard: Number(standardDensity.toFixed(2)),
          ipt: Number(iptDensity.toFixed(2))
        });
      }
    }
    setChartData(data);
  };

  // Find max value in chart data to scale plotting nicely
  const getMaxChartVal = () => {
    let max = 1;
    chartData.forEach(d => {
      if (d.standard > max) max = d.standard;
      if (d.ipt > max) max = d.ipt;
    });
    return max * 1.1;
  };

  const chartMax = getMaxChartVal();  return (
    <div className="p-4 md:p-6 bg-transparent text-slate-300 font-sans" id="experiment-lab-screen">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Option Column */}
        <div className="lg:col-span-1 bg-black/40 border border-white/10 p-5 rounded-2xl flex flex-col justify-between shadow-2xl backdrop-blur-md">
          <div className="space-y-4">
            <h3 className="text-xs font-bold tracking-[0.2em] text-white uppercase italic border-b border-white/10 pb-2 flex items-center gap-2">
              <FlaskConical size={14} className="text-cyan-400" /> Testing Suite
            </h3>
            
            <p className="text-xs text-slate-400 leading-relaxed">
              Verify the Invisible Pressure Theory through 3 testable, falsifiable experimental setups that differentiate IPT from Standard Physics.
            </p>

            {/* Experiment selector Tabs */}
            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => setActiveTab("decoherence")}
                className={`w-full p-3 rounded-xl border text-left text-xs font-mono font-medium transition cursor-pointer flex justify-between items-center ${
                  activeTab === "decoherence"
                    ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                    : "bg-white/5 text-slate-450 border-white/10 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span>1. BEC Decohere Shift</span>
                <ChevronRight size={14} />
              </button>

              <button
                onClick={() => setActiveTab("propagation")}
                className={`w-full p-3 rounded-xl border text-left text-xs font-mono font-medium transition cursor-pointer flex justify-between items-center ${
                  activeTab === "propagation"
                    ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                    : "bg-white/5 text-slate-450 border-white/10 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span>2. Heat-Tunnel Accel</span>
                <ChevronRight size={14} />
              </button>

              <button
                onClick={() => setActiveTab("cosmo")}
                className={`w-full p-3 rounded-xl border text-left text-xs font-mono font-medium transition cursor-pointer flex justify-between items-center ${
                  activeTab === "cosmo"
                    ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                    : "bg-white/5 text-slate-455 border-white/10 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span>3. Cosmic Matter Halo</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          <div className="bg-white/5 p-4 rounded-xl border border-white/5 text-[10px] text-slate-500 font-mono space-y-1 mt-6">
            <span className="block text-cyan-400 font-bold uppercase tracking-wider mb-2">Status Report</span>
            <div className="flex items-center gap-1.5 text-[11px] text-cyan-300">
              <CheckCircle size={12} className="text-cyan-400" /> Telemetries Connected
            </div>
            <p className="text-[9px] text-slate-550 pt-1">
              Data calculated in real-time under normalized physical units to highlight anomalous gradient predictions.
            </p>
          </div>
        </div>

        {/* Dynamic Graph and Interface Controls */}
        <div className="lg:col-span-3 space-y-6">
          {/* Main Panel Content */}
          <div className="bg-black/30 border border-white/10 p-5 md:p-6 rounded-2xl shadow-xl">
            {activeTab === "decoherence" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-bold tracking-[0.2em] text-white uppercase italic border-l-2 border-cyan-500 pl-2">
                    Focused Thermal-Gradient Decoherence Shift
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mt-1.5">
                    Experiment places a Bose-Einstein Condensate inside a high-vacuum core. A focused laser creates a massive 100 K/m temperature gradient. 
                    Standard physics expects flattening decoherence following absolute temperature. IPT predicts a massive <strong>decoherence spike</strong> right inside the boundary steepness ($\nabla T$)!
                  </p>
                </div>

                {/* Sub-Sliders for Exp 1 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white/5 p-4 rounded-xl border border-white/5" id="exp-sliders-1">
                  <div>
                    <div className="flex justify-between text-[11px] font-mono mb-1">
                      <span>Focused Laser Intensity</span>
                      <span className="text-cyan-400 font-bold">{laserIntensity.toFixed(1)} kW</span>
                    </div>
                    <input 
                      type="range" min="1.0" max="10.0" step="0.5"
                      value={laserIntensity}
                      onChange={(e) => setLaserIntensity(Number(e.target.value))}
                      className="w-full h-1 bg-white/5 rounded appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-mono mb-1">
                      <span>Vacuum Depth (Torr-scale)</span>
                      <span className="text-cyan-400 font-bold">10⁻{vacuumLevel}</span>
                    </div>
                    <input 
                      type="range" min="5" max="12" step="1"
                      value={vacuumLevel}
                      onChange={(e) => setVacuumLevel(Number(e.target.value))}
                      className="w-full h-1 bg-white/5 rounded appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-mono mb-1">
                      <span>Gradient Rate (dT/dx)</span>
                      <span className="text-cyan-400 font-bold">{gradientSteepness.toFixed(0)} K/m</span>
                    </div>
                    <input 
                      type="range" min="10" max="150" step="5"
                      value={gradientSteepness}
                      onChange={(e) => setGradientSteepness(Number(e.target.value))}
                      className="w-full h-1 bg-white/5 rounded appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "propagation" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-bold tracking-[0.2em] text-white uppercase italic border-l-2 border-cyan-500 pl-2">
                    Anomalous Wave Packet Tunnel Acceleration
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mt-1.5">
                    Propagating electrons or neutral atom wave packets through a highly focused thermal shield tunnel. 
                    Standard quantum mechanics allows standard inert propagation. IPT projects the gradient generates an anomalous motive force ($F = -\nabla P$) pulling mass-energy packs forward!
                  </p>
                </div>

                {/* Sub-Sliders for Exp 2 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/5 p-4 rounded-xl border border-white/5" id="exp-sliders-2">
                  <div>
                    <div className="flex justify-between text-[11px] font-mono mb-1">
                      <span>Shield Tunnel Temp Gradient</span>
                      <span className="text-cyan-400 font-bold">Scale {tunnelGradient.toFixed(1)}</span>
                    </div>
                    <input 
                      type="range" min="1.0" max="10.0" step="0.5"
                      value={tunnelGradient}
                      onChange={(e) => setTunnelGradient(Number(e.target.value))}
                      className="w-full h-1 bg-white/5 rounded appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-mono mb-1">
                      <span>Wave cross-section (σ_ipt)</span>
                      <span className="text-cyan-400 font-bold">{particleCrossSection.toFixed(2)}</span>
                    </div>
                    <input 
                      type="range" min="0.2" max="3.0" step="0.1"
                      value={particleCrossSection}
                      onChange={(e) => setParticleCrossSection(Number(e.target.value))}
                      className="w-full h-1 bg-white/5 rounded appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "cosmo" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-bold tracking-[0.2em] text-white uppercase italic border-l-2 border-cyan-500 pl-2">
                    Cosmological Void-Boundary Matter Halos
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mt-1.5">
                    On massive cosmos scales, background dark pressure creates dynamic clusters. 
                    Near borders of extreme cosmic voids—where energy density temperature drops to {"T_CMB"}—large temperature/pressure differentials predict localized matter clustering signatures (halos) far beyond basic GR estimates.
                  </p>
                </div>

                {/* Sub-Sliders for Exp 3 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/5 p-4 rounded-xl border border-white/5" id="exp-sliders-3">
                  <div>
                    <div className="flex justify-between text-[11px] font-mono mb-1">
                      <span>Void Scale Boundary Diameter</span>
                      <span className="text-cyan-400 font-bold">{voidScale.toFixed(1)} Mpc</span>
                    </div>
                    <input 
                      type="range" min="1.0" max="5.0" step="0.2"
                      value={voidScale}
                      onChange={(e) => setVoidScale(Number(e.target.value))}
                      className="w-full h-1 bg-white/5 rounded appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-mono mb-1">
                      <span>Background Dark Pressure (P₀-eff)</span>
                      <span className="text-cyan-400 font-bold">{vacuumEnergyPress.toFixed(2)} Pa-eq</span>
                    </div>
                    <input 
                      type="range" min="0.5" max="5.0" step="0.1"
                      value={vacuumEnergyPress}
                      onChange={(e) => setVacuumEnergyPress(Number(e.target.value))}
                      className="w-full h-1 bg-white/5 rounded appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Simulated Live Laboratory Graph Plot */}
            <div className="mt-6 border-t border-white/10 pt-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-mono font-bold text-slate-405 text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Activity size={14} className="text-cyan-400" /> Virtualized Oscilloscope Output
                </span>
                
                <div className="flex gap-4 font-mono text-[9px]">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <span className="w-2 h-2 rounded-full border border-amber-500 bg-amber-500/10 block" /> Standard Predictions
                  </span>
                  <span className="flex items-center gap-1.5 text-cyan-400">
                    <span className="w-2 h-2 rounded-full border border-cyan-400 bg-cyan-400/10 block animate-pulse" /> IPT Predictions
                  </span>
                </div>
              </div>

              {/* Responsive SVG Chart */}
              <div className="bg-black/30 border border-white/5 rounded-xl p-4 overflow-hidden relative shadow-inner">
                <svg viewBox="0 0 540 220" className="w-full h-auto overflow-visible">
                  {/* Grid Lines */}
                  <line x1="10" y1="10" x2="530" y2="10" stroke="rgba(255,255,255,0.03)" />
                  <line x1="10" y1="60" x2="530" y2="60" stroke="rgba(255,255,255,0.03)" />
                  <line x1="10" y1="110" x2="530" y2="110" stroke="rgba(255,255,255,0.03)" />
                  <line x1="10" y1="160" x2="530" y2="160" stroke="rgba(255,255,255,0.03)" />
                  <line x1="10" y1="200" x2="530" y2="200" stroke="rgba(255,255,255,0.06)" />

                  <line x1="270" y1="10" x2="270" y2="200" stroke="rgba(255,255,255,0.03)" strokeDasharray="3,3" />

                  {/* Graph plot scaler lines */}
                  {chartData.length > 0 && (
                    <>
                      {/* Standard physics polyline */}
                      <polyline
                        fill="none"
                        stroke="#f59e0b" // Amber
                        strokeWidth="1.5"
                        strokeDasharray="4,2"
                        points={chartData
                          .map((d, i) => {
                            const x = 10 + (i / (chartData.length - 1)) * 520;
                            const y = 200 - (d.standard / chartMax) * 180;
                            return `${x.toFixed(1)},${y.toFixed(1)}`;
                          })
                          .join(" ")}
                      />

                      {/* IPT polyline */}
                      <polyline
                        fill="none"
                        stroke="#22d3ee" // Cyan
                        strokeWidth="2.5"
                        points={chartData
                          .map((d, i) => {
                            const x = 10 + (i / (chartData.length - 1)) * 520;
                            const y = 200 - (d.ipt / chartMax) * 180;
                            return `${x.toFixed(1)},${y.toFixed(1)}`;
                          })
                          .join(" ")}
                      />
                    </>
                  )}
                </svg>

                {/* X Axis Labels */}
                <div className="flex justify-between text-[9px] font-mono text-slate-505 text-slate-500 mt-2 px-1">
                  {activeTab === "decoherence" && (
                    <>
                      <span>Laser fringe (-50mm)</span>
                      <span>Gradient focal zone (0mm)</span>
                      <span>Laser fringe (+50mm)</span>
                    </>
                  )}
                  {activeTab === "propagation" && (
                    <>
                      <span>Initial injection</span>
                      <span>Halfway shield core</span>
                      <span>Extraction collector</span>
                    </>
                  )}
                  {activeTab === "cosmo" && (
                    <>
                      <span>Void Core Center</span>
                      <span>Halo threshold boundary</span>
                      <span>Active Galaxy clusters</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Summary Note */}
            <div className="mt-4 p-3.5 bg-black/40 border border-white/5 rounded-xl text-xs text-slate-400 font-mono">
              {activeTab === "decoherence" && (
                <span><strong>Conclusion:</strong> If BEC atomic samples show standard flat decay profiles, IPT is falsified. If anomalous spikes arise at maximum $\nabla T$ (as shown above), it verifies that spatial temperature slopes force pressure field measurement events.</span>
              )}
              {activeTab === "propagation" && (
                <span><strong>Conclusion:</strong> IPT predicts wave packets experience non-zero acceleration under steep external heat slopes, revealing a direct quantum-thermodynamic force coupling that separates it from inert Newtonian gravity.</span>
              )}
              {activeTab === "cosmo" && (
                <span><strong>Conclusion:</strong> Dark matter models assume smooth density drops inside deep space voids. IPT boundary halos predict a physical compression border, providing a potential explanation for modern cosmic structures.</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
