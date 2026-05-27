/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SimulationParameters {
  C: number;           // Solar luminosity constant (temperature driver)
  T_cmb: number;       // CMB baseline temperature (K)
  P_0: number;         // Baseline Invisible Pressure (Pa-scale)
  sigma_ipt: number;   // IPT potential coupling strength
  E_a: number;         // Activation energy for thermal collapse (eV equivalent)
  gamma_0: number;     // Attempt rate for collapse (Hz equivalent)
  g_constant: number;  // Gravitational pull constant
  m: number;           // Wave packet mass
  k_0: number;         // Initial wave packet velocity (momentum)
  width_0: number;     // Initial wave packet width
  x_0: number;         // Initial wave packet position
}

export interface ActualizationEvent {
  id: string;
  timestamp: number;
  location: number; // distance from Sun
  intensity: number; // probability density weight
  eventName: string; // descriptive event (e.g., "Amino Acid Stabilization")
  category: "chemical" | "biological" | "informational" | "quantum";
}

export interface GridFields {
  x: number[];
  temperature: number[];
  pressure: number[];
  potentialGravity: number[];
  potentialIPT: number[];
  potentialTotal: number[];
  collapseRate: number[];
  lifePotential: number[];
}

export interface SimulationState {
  step: number;
  time: number;
  psiReal: number[];
  psiImag: number[];
  psiSqu: number[];
  fields: GridFields;
  isCollapsed: boolean;
  collapseProgress: number; // 0 to 1 when active
  collapseCenter: number | null;
  events: ActualizationEvent[];
}

export interface ExperimentModel {
  id: string;
  name: string;
  description: string;
  status: "idle" | "running" | "completed";
  progress: number;
  standardValue: number;
  iptValue: number;
  dataPoints: { label: string; standard: number; ipt: number }[];
}
