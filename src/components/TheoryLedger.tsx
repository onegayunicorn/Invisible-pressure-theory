/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { BookOpen, Award, Layers, ShieldCheck, Cpu } from "lucide-react";

export function TheoryLedger() {
  return (
    <div className="p-4 md:p-6 bg-transparent text-slate-300 font-sans leading-relaxed" id="theory-ledger-screen">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Theory Index Side Bar */}
        <div className="lg:col-span-1 bg-black/40 border border-white/10 p-5 rounded-2xl flex flex-col justify-between shadow-2xl backdrop-blur-md h-fit">
          <div className="space-y-4">
            <h3 className="text-xs font-bold tracking-[0.2em] text-white uppercase italic border-b border-white/10 pb-2 flex items-center gap-2">
              <BookOpen size={14} className="text-cyan-400" /> Ledger Index
            </h3>
            <nav className="flex flex-col gap-1 font-mono text-[11px]">
              <a href="#hypothesis" className="p-2 hover:bg-white/5 rounded-lg text-cyan-400 hover:text-white transition">§ 1. Core Hypothesis</a>
              <a href="#lagrangian" className="p-2 hover:bg-white/5 rounded-lg text-cyan-400 hover:text-white transition">§ 2. Lagrangian Formulation</a>
              <a href="#piston" className="p-2 hover:bg-white/5 rounded-lg text-cyan-400 hover:text-white transition">§ 3. IPT Scalar Field</a>
              <a href="#schrodinger" className="p-2 hover:bg-white/5 rounded-lg text-cyan-400 hover:text-white transition">§ 4. Modified Schrödinger</a>
              <a href="#decoherence" className="p-2 hover:bg-white/5 rounded-lg text-cyan-400 hover:text-white transition">§ 5. Decoherence & Collapse</a>
              <a href="#goldilocks" className="p-2 hover:bg-white/5 rounded-lg text-cyan-400 hover:text-white transition">§ 6. Life potential Density</a>
              <a href="#open-questions" className="p-2 hover:bg-white/5 rounded-lg text-cyan-400 hover:text-white transition">§ 7. Open Questions</a>
            </nav>
          </div>

          <div className="pt-4 border-t border-white/10 space-y-2 mt-6">
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
              <Award size={12} className="text-cyan-455 text-cyan-400" />
              <span>Architect: Tyrone J. Power Ω</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
              <ShieldCheck size={12} className="text-cyan-400" />
              <span>Version: 2.0.0-OMEGA</span>
            </div>
          </div>
        </div>

        {/* Beautiful Theoretical Document Column */}
        <div className="lg:col-span-3 bg-black/30 border border-white/10 p-6 md:p-8 rounded-2xl shadow-xl space-y-8 overflow-y-auto max-h-[85vh]">
          {/* Header */}
          <div className="border-b border-white/10 pb-5 text-center">
            <span className="font-mono text-[10px] text-cyan-400 tracking-widest font-semibold uppercase">Phase 2: Formal Unified Framework</span>
            <h2 className="text-xl font-bold tracking-[0.1em] text-white uppercase italic mt-2">
              Invisible Pressure Theory (IPT)
            </h2>
            <p className="text-[11px] text-slate-500 font-mono mt-2">
              Deriving Quantum Actualization and Thermodynamic Living Cradle via Cosmological Fields
            </p>
          </div>

          {/* Section 1 */}
          <section id="hypothesis" className="space-y-3">
            <h3 className="text-xs font-bold tracking-[0.2em] text-white uppercase italic border-b border-white/5 pb-1.5 flex items-center gap-2">
              <span className="text-cyan-400">§ 1.</span> Core Hypothesis: Cosmological Piston Effect
            </h3>
            <p className="text-sm text-slate-400">
              The Invisible Pressure Theory posits that classical empty vacuum (The Void) is not a passive canvas, but a zone of high background <strong>Invisible Pressure</strong>. Defined inversely alongside local energy densities:
            </p>
            <div className="bg-black/40 p-4 rounded-xl text-center border border-white/5 my-4 font-mono text-cyan-300 text-sm">
              P(r) ∝ 1 / T(r)
            </div>
            <p className="text-sm text-slate-400">
              Because outer cosmos holds at near-zero temperatures (T ≈ 2.7 K), the pressure exerted on uncollapsed, delocalized quantum options is immense. This acts as a cosmic piston, thrusting wave packets inward toward warm gravitational bodies like Star systems and biological environments (Earth).
            </p>
          </section>

          {/* Section 2 */}
          <section id="lagrangian" className="space-y-3">
            <h3 className="text-xs font-bold tracking-[0.2em] text-white uppercase italic border-b border-white/5 pb-1.5 flex items-center gap-2">
              <span className="text-cyan-400">§ 2.</span> Lagrangian Density Formulation
            </h3>
            <p className="text-sm text-slate-400">
              Grounding IPT in classical and quantum field theory, we define a scalar field variable <span className="font-mono text-cyan-405 text-cyan-400">φ</span> coupled directly to the thermal environment trace:
            </p>
            <div className="bg-black/40 p-5 rounded-xl border border-white/5 my-4 space-y-2 text-center text-xs md:text-sm font-mono text-slate-300">
              <div className="text-cyan-400">
                L_IPT = ½ (∂_t φ)² - ½ (∇φ)² - ( ½ m_φ² φ² + λ_φ φ⁴ ) - λ φ T
              </div>
            </div>
            <p className="text-sm text-slate-400">
              Applying the Euler-Lagrange operation leads to a dynamic Klein-Gordon wave equation driven by the background thermal trace source:
            </p>
            <div className="bg-black/40 p-4 rounded-xl text-center border border-white/5 font-mono text-cyan-300 text-sm">
              ■ φ + V'(φ) = -λ T
            </div>
            <p className="text-sm text-slate-400 hover:text-slate-100 transition">
              This provides our theoretical background for the field, ensuring Lorentz group action invariance and establishing local spatial slopes that exert forces on macroscopic potentials.
            </p>
          </section>

          {/* Section 3 */}
          <section id="piston" className="space-y-3">
            <h3 className="text-xs font-bold tracking-[0.2em] text-white uppercase italic border-b border-white/5 pb-1.5 flex items-center gap-2">
              <span className="text-cyan-400">§ 3.</span> IPT Scalar Field and Force Vector
            </h3>
            <p className="text-sm text-slate-400">
              We define the pressure field explicitly with reference to the base CMB temperature:
            </p>
            <div className="bg-black/40 p-4 rounded-xl text-center border border-white/5 font-mono text-cyan-400 text-sm">
              P(r) = P_0 * ( T_CMB / T(r) )
            </div>
            <p className="text-sm text-slate-400">
              The resultant motive force pushing wave packets down this environmental gradient is modeled as:
            </p>
            <div className="bg-black/40 p-4 rounded-xl text-center border border-white/5 font-mono text-slate-300 text-sm">
              F_IPT = -∇ P(r)
            </div>
            <p className="text-sm text-slate-400">
              In deep empty space, the gradient $|\nabla P|$ is near 0 (flat pressure). Near energetic star boundaries, the gradient steepens drastically—accelerating delocalized waves towards warm zones.
            </p>
          </section>

          {/* Section 4 */}
          <section id="schrodinger" className="space-y-3">
            <h3 className="text-xs font-bold tracking-[0.2em] text-white uppercase italic border-b border-white/5 pb-1.5 flex items-center gap-2">
              <span className="text-cyan-400">§ 4.</span> The Modified Schrödinger Equation
            </h3>
            <p className="text-sm text-slate-400">
              To evaluate the time-evolution of particles propelled under IPT, we modify the traditional Hamiltonian, adding the pressure potential:
            </p>
            <div className="bg-black/40 p-5 rounded-xl border border-white/5 text-center text-xs md:text-sm font-mono text-cyan-400">
              i ℏ ∂ψ/∂t = [ -(ℏ²/2m) ∇² + V_gravity(r) + V_IPT(r) ] ψ(r, t)
            </div>
            <p className="text-sm text-slate-400">
              Where <span className="font-mono text-slate-300">V_IPT(r) = P(r) * σ_ipt</span>, with <span className="font-mono text-slate-300">σ_ipt</span> representing the quantum wavefunction cross-section. The wave is literally squeezed and accelerated by the pressure field $P(r)$ inward towards the Sun.
            </p>
          </section>

          {/* Section 5 */}
          <section id="decoherence" className="space-y-3">
            <h3 className="text-xs font-bold tracking-[0.2em] text-white uppercase italic border-b border-white/5 pb-1.5 flex items-center gap-2">
              <span className="text-cyan-400">§ 5.</span> Thermal Decoherence and Wavefunction Collapse
            </h3>
            <p className="text-sm text-slate-400">
              Standard Copenhagen models treat measurement as an unmodeled, observer-dependent collapse. In IPT, measurement is an objective physical consequence of <strong>thermal decoherence</strong>. As the wave packet is pushed into warm regions, environmental phase scrambling induces collapse:
            </p>
            <div className="bg-black/40 p-5 rounded-xl border border-white/5 text-center text-xs md:text-sm font-mono text-rose-450 text-rose-400">
              ρ(r, r', t) = ψ(r, t) ψ*(r', t) * exp( -Γ(T) * t )
            </div>
            <p className="text-sm text-slate-400">
              The rate of collapse fits an Arrhenius form based on local temperature $T$:
            </p>
            <div className="bg-black/40 p-4 rounded-xl text-center border border-white/5 font-mono text-rose-400 text-sm animate-pulse">
              Γ(T) = γ_0 * exp( -E_a / (k_B * T) )
            </div>
            <p className="text-sm text-slate-400">
              At $2.7$ K, the decoherence speed is essentially zero; the wavefunction remains perfectly coherent. At Earth ($288$ K), decoherence spikes almost instantly. Warm environments act as permanent measurement nodes, actualizing waves into localised point-like matters.
            </p>
          </section>

          {/* Section 6 */}
          <section id="goldilocks" className="space-y-3">
            <h3 className="text-xs font-bold tracking-[0.2em] text-white uppercase italic border-b border-white/5 pb-1.5 flex items-center gap-2">
              <span className="text-cyan-400">§ 6.</span> Life Potential Density L(r)
            </h3>
            <p className="text-sm text-slate-400">
              The birth of probability and living complexity does not happen randomly. Life is a physical consequence of sustained cosmic wavefunction collapse feeding ordered states into localized biological templates. We define the <strong>Life Potential Density</strong>:
            </p>
            <div className="bg-black/40 p-5 rounded-xl border border-white/5 text-center text-xs md:text-sm font-mono text-cyan-400">
              L(r) = α * |∇ P(r)| * Γ(T)
            </div>
            <p className="text-sm text-slate-400">
              This metric establishes an extraordinary scientific zone—a "Goldilocks Zone" representing the thermodynamic cradle. Near the Sun, $\Gamma(T)$ is extremely high, but the pressure gradient is overly flat or incinerating. Far away, pressure gradients exist, but temperatures are close to absolute zero (no collapse). At Earth ($r \approx 1.0$), both are perfectly balanced, birthing carbon biochemistries and actualizing evolutionary paths!
            </p>
          </section>

          {/* Section 7 */}
          <section id="open-questions" className="space-y-4">
            <h3 className="text-xs font-bold tracking-[0.2em] text-white uppercase italic border-b border-white/5 pb-1.5 flex items-center gap-2">
              <span className="text-cyan-400">§ 7.</span> Open Questions and Standard Physics Analogies
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-4 bg-black/40 rounded-xl border border-white/5 space-y-2">
                <span className="text-cyan-400 block font-bold flex items-center gap-1">
                  <Cpu size={12} /> Quantum Decoherence
                </span>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Analogous to environment-induced superselection (einselection) formulated by Wojciech Zurek. The environment itself performs "measurements," forcing selection of pointer states.
                </p>
              </div>

              <div className="p-4 bg-black/40 rounded-xl border border-white/5 space-y-2">
                <span className="text-cyan-455 text-cyan-400 block font-bold flex items-center gap-1">
                  <Layers size={12} /> Cosmological Constant
                </span>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  In cosmological terms, the Invisible Pressure field $P(r)$ behaves similarly to dark energy models, acting as a background energy density that drives spatial fluxes of mass-energy configurations.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-500 mt-4 leading-relaxed font-mono">
              *Notice to Peer Reviewers:* The Lagrange scalar formulation satisfies normal conservation laws; our coupling variables require further quantization under a path-integral partition function {"Z = \\int \\mathcal{D}\\phi \\, e^{iS[\\phi]}"} to resolve short-distance micro-vibrations near zero temperature.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
