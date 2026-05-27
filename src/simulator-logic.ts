/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GridFields, SimulationParameters, ActualizationEvent } from "./types";

// Simple Complex number operations for high performance quantum mechanics
export class Complex {
  constructor(public r: number, public i: number) {}

  static zero() { return new Complex(0, 0); }
  static real(r: number) { return new Complex(r, 0); }
  
  add(v: Complex): Complex {
    return new Complex(this.r + v.r, this.i + v.i);
  }
  
  sub(v: Complex): Complex {
    return new Complex(this.r - v.r, this.i - v.i);
  }
  
  mul(v: Complex | number): Complex {
    if (typeof v === "number") {
      return new Complex(this.r * v, this.i * v);
    }
    return new Complex(this.r * v.r - this.i * v.i, this.r * v.i + this.i * v.r);
  }
  
  div(v: Complex): Complex {
    const denom = v.r * v.r + v.i * v.i;
    if (denom === 0) return new Complex(0, 0);
    return new Complex(
      (this.r * v.r + this.i * v.i) / denom,
      (this.i * v.r - this.r * v.i) / denom
    );
  }

  magSq(): number {
    return this.r * this.r + this.i * this.i;
  }

  mag(): number {
    return Math.sqrt(this.r * this.r + this.i * this.i);
  }

  phase(): number {
    return Math.atan2(this.i, this.r);
  }
}

// Hardcoded standard grid size for rapid execution and consistency
export const GRID_POINTS = 128;
export const R_MIN = 0.1; // Sun boundary
export const R_MAX = 5.1; // Cold outer boundary (slightly beyond Jupiter)
export const EARTH_R = 1.0; // Earth orbit coordinate in AU

/**
 * Compute spatial grid fields based on IPT parameters
 */
export function computeFields(params: SimulationParameters): GridFields {
  const x: number[] = [];
  const temperature: number[] = [];
  const pressure: number[] = [];
  const potentialGravity: number[] = [];
  const potentialIPT: number[] = [];
  const potentialTotal: number[] = [];
  const collapseRate: number[] = [];
  const lifePotential: number[] = [];

  const dx = (R_MAX - R_MIN) / (GRID_POINTS - 1);

  for (let i = 0; i < GRID_POINTS; i++) {
    const r = R_MIN + i * dx;
    x.push(r);

    // 1. T(r) = C/r + T_cmb (Solar heat gradient)
    // Add small regularization to avoid singularity
    const temp = (params.C / r) + params.T_cmb;
    temperature.push(temp);

    // 2. P(r) = P_0 * T_cmb / T(r) (Invisible Pressure field)
    const press = params.P_0 * (params.T_cmb / temp);
    pressure.push(press);

    // 3. V_gravity = - G / r
    const vGrav = -params.g_constant / r;
    potentialGravity.push(vGrav);

    // 4. V_IPT = sigma * P(r)
    const vIPT = params.sigma_ipt * press;
    potentialIPT.push(vIPT);

    // 5. Total potential V(r)
    potentialTotal.push(vGrav + vIPT);

    // 6. Gamma = gamma_0 * exp(-E_a / T(r)) (Thermal collapse decoherence rate)
    // We normalize Boltzmann division for visual scale in arbitrary units:
    // With k_B = 1, E_a in K scale.
    const rate = params.gamma_0 * Math.exp(-params.E_a * 100 / temp);
    collapseRate.push(rate);

    // 7. L(r) = alpha * |dP/dr| * Gamma(T(r))
    // Analytical pressure gradient dP/dr derived from inverse formula:
    // P(r) = P_0 * T_cmb / (C/r + T_cmb) = P_0 * r * T_cmb / (C + r * T_cmb)
    // |dP/dr| = P_0 * C * T_cmb / (C + r * T_cmb)^2
    const dPdr = (params.P_0 * params.C * params.T_cmb) / Math.pow(params.C + r * params.T_cmb, 2);
    // Life Potential combining the compression force and the decoherence trigger
    const lifePot = dPdr * rate;
    lifePotential.push(lifePot * 10); // visual multiplier
  }

  return {
    x,
    temperature,
    pressure,
    potentialGravity,
    potentialIPT,
    potentialTotal,
    collapseRate,
    lifePotential,
  };
}

/**
 * Initializes a wave packet far out in the cold regions
 */
export function initializeWavePacket(params: SimulationParameters, fields: GridFields): { psiReal: number[], psiImag: number[] } {
  const psiReal: number[] = [];
  const psiImag: number[] = [];
  const dx = fields.x[1] - fields.x[0];

  // Create Gaussian wave packet: psi(x) = exp(-(x-x0)^2 / (2 w^2)) * exp(i * k0 * x)
  let norm = 0;
  for (let i = 0; i < GRID_POINTS; i++) {
    const r = fields.x[i];
    const gaussian = Math.exp(-Math.pow(r - params.x_0, 2) / (2 * Math.pow(params.width_0, 2)));
    const phaseValue = params.k_0 * r;

    const realPart = gaussian * Math.cos(phaseValue);
    const imagPart = gaussian * Math.sin(phaseValue);

    psiReal.push(realPart);
    psiImag.push(imagPart);
    norm += (realPart * realPart + imagPart * imagPart) * dx;
  }

  // Normalize wavefunction
  const sqrtNorm = Math.sqrt(norm);
  for (let i = 0; i < GRID_POINTS; i++) {
    psiReal[i] /= sqrtNorm;
    psiImag[i] /= sqrtNorm;
  }

  return { psiReal, psiImag };
}

/**
 * Steps the Schrödinger equation using Crank-Nicolson method (unitary and stable!)
 * H = -hbar^2/(2m) d^2/dx^2 + V(x)
 */
export function stepSchrodinger(
  psiReal: number[],
  psiImag: number[],
  fields: GridFields,
  params: SimulationParameters,
  dt: number
): { psiReal: number[], psiImag: number[] } {
  const N = GRID_POINTS;
  const dx = fields.x[1] - fields.x[0];
  
  // Normalized constants: hbar = 1
  const hbar = 1.0;
  
  // kinetic multiplier: a = hbar^2 / (2 * m * dx^2)
  const a = (hbar * hbar) / (2.0 * params.m * dx * dx);

  // s = i * dt / (2 * hbar)
  const s = new Complex(0, dt / (2.0 * hbar));

  // Set up Crank-Nicolson tridiagonal matrices
  // A_j * psi_new[j-1] + B_j * psi_new[j] + C_j * psi_new[j+1] = d_j
  const A = new Array<Complex>(N);
  const B = new Array<Complex>(N);
  const C = new Array<Complex>(N);
  const b = new Array<Complex>(N);

  const psi = new Array<Complex>(N);
  for (let i = 0; i < N; i++) {
    psi[i] = new Complex(psiReal[i], psiImag[i]);
  }

  // Tridiagonal coefficient formulas:
  // Left hand side operator ML = I + s*H
  // H_j(psi) = -a * psi[j-1] + (2a + V_j)*psi[j] - a * psi[j+1]
  const sa = s.mul(a); // Complex number representing s * a

  for (let j = 0; j < N; j++) {
    const V_j = fields.potentialTotal[j];
    
    // ML coefficients (I + s * H)
    A[j] = sa.mul(-1); // -s*a
    C[j] = sa.mul(-1); // -s*a
    
    const hDiag = 2.0 * a + V_j;
    B[j] = Complex.real(1.0).add(s.mul(hDiag)); // 1 + s * (2a + V)

    // Right-hand side evaluation d = (I - s*H)*psi
    // (I - s*H)psi_j = psi_j - s * [-a*psi[j-1] + (2a+V_j)psi_j - a*psi[j+1]]
    if (j > 0 && j < N - 1) {
      const h_psi_j = psi[j].mul(2.0 * a + V_j)
        .add(psi[j-1].mul(-a))
        .add(psi[j+1].mul(-a));
      
      b[j] = psi[j].sub(s.mul(h_psi_j));
    } else {
      // Dirichlet boundaries
      b[j] = Complex.zero();
    }
  }

  // Enforce boundary conditions on LHS tridiagonal matrices
  // Dirichlet: psi_new[0] = psi_new[N-1] = 0
  B[0] = Complex.real(1.0);
  C[0] = Complex.zero();
  b[0] = Complex.zero();

  A[N - 1] = Complex.zero();
  B[N - 1] = Complex.real(1.0);
  b[N - 1] = Complex.zero();

  // Solve the Complex Tridiagonal System using Thomas Algorithm
  const cPrime = new Array<Complex>(N);
  const dPrime = new Array<Complex>(N);

  cPrime[0] = C[0].div(B[0]);
  dPrime[0] = b[0].div(B[0]);

  for (let j = 1; j < N; j++) {
    const denom = B[j].sub(A[j].mul(cPrime[j - 1]));
    if (j < N - 1) {
      cPrime[j] = C[j].div(denom);
    }
    dPrime[j] = b[j].sub(A[j].mul(dPrime[j - 1])).div(denom);
  }

  // Back substitution
  const psiNew = new Array<Complex>(N);
  for (let i = 0; i < N; i++) psiNew[i] = Complex.zero();

  psiNew[N - 1] = dPrime[N - 1];
  for (let j = N - 2; j >= 0; j--) {
    psiNew[j] = dPrime[j].sub(cPrime[j].mul(psiNew[j + 1]));
  }

  // Return real and imaginary splits
  const nextPsiReal = new Array<number>(N);
  const nextPsiImag = new Array<number>(N);
  for (let i = 0; i < N; i++) {
    nextPsiReal[i] = psiNew[i].r;
    nextPsiImag[i] = psiNew[i].i;
  }

  return { psiReal: nextPsiReal, psiImag: nextPsiImag };
}

/**
 * Random biological / physical actualization event procedural creator
 */
export function drawLifeEvent(location: number, intensity: number): Omit<ActualizationEvent, "id" | "timestamp"> {
  const scientificPref = [
    "Polynucleotide Template",
    "Prebiotic Coacervate",
    "Self-Sealing Phospholipid",
    "Catalytic Ribozyme",
    "Proton Gradient Proton-Pump",
    "Adenosine Triphosphate Synthase Core",
    "Enzymatic Spin-Tunneling Cluster",
    "Chiral Self-Sorting Amino Acid",
    "Peptide Backbone",
    "Co-Enzyme Matrix",
    "Micellar Protocell Capsule"
  ];

  const actionSuf = [
    "Stabilization",
    "Autocatalytic Replication",
    "Quantum decoherence convergence",
    "Enantiomeric purification",
    "Symmetry-breaking assembly",
    "Thermodynamic phase encapsulation",
    "Information-encoding storage",
    "Metabolic loop closing",
    "Vesicular boundary sealing"
  ];

  const categories: Array<"chemical" | "biological" | "informational" | "quantum"> = [
    "biological",
    "chemical",
    "quantum",
    "informational"
  ];

  const pref = scientificPref[Math.floor(Math.random() * scientificPref.length)];
  const suf = actionSuf[Math.floor(Math.random() * actionSuf.length)];
  const category = categories[Math.floor(Math.random() * categories.length)];

  return {
    location: Number(location.toFixed(3)),
    intensity: Number(intensity.toFixed(4)),
    eventName: `${pref} ${suf}`,
    category
  };
}
