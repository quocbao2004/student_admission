import { API_BASE } from '../config';

const PUBLIC_BASE = `${API_BASE}/admissions/public`;

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json();
}

export const publicApi = {
  getMajors: () => fetchJson(`${PUBLIC_BASE}/majors/`),
  getMethods: () => fetchJson(`${PUBLIC_BASE}/methods/`),
  getBenchmarks: () => fetchJson(`${PUBLIC_BASE}/benchmarks/`),
};
