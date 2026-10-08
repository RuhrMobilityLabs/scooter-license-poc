"use client";

import { useSyncExternalStore } from "react";

// All data in this PoC is dummy data and lives only in the browser's localStorage.

export const PRACTICAL_TOTAL_MINUTES = 120;
export const PRACTICAL_REQUIRED_MINUTES = 90;

export type Applicant = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  idNumber: string;
};

export type Ride = {
  at: string;
  minutes: number;
  passedMinutes: number;
  issues: string[];
};

export type License = {
  id: string;
  issuedAt: string;
  holder: Applicant;
  theory: { score: number; total: number; passedAt: string };
  practical: { rides: Ride[] };
};

export type LicenseStatus = "practical-pending" | "active" | "practical-failed";

export function practicalProgress(license: License) {
  const ridden = license.practical.rides.reduce((sum, r) => sum + r.minutes, 0);
  const passed = license.practical.rides.reduce((sum, r) => sum + r.passedMinutes, 0);
  return { ridden, passed };
}

export function licenseStatus(license: License): LicenseStatus {
  const { ridden, passed } = practicalProgress(license);
  if (ridden < PRACTICAL_TOTAL_MINUTES) return "practical-pending";
  return passed >= PRACTICAL_REQUIRED_MINUTES ? "active" : "practical-failed";
}

export function qrPayload(license: License) {
  // In a real system this would be a signed, short-lived token, not the raw ID.
  return `scooterlicense:demo:v1:${license.id}`;
}

function randomBlock() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(4));
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

export function createLicense(holder: Applicant, score: number, total: number): License {
  const now = new Date().toISOString();
  return {
    id: `SL-${randomBlock()}-${randomBlock()}`,
    issuedAt: now,
    holder,
    theory: { score, total, passedAt: now },
    practical: { rides: [] },
  };
}

const RIDE_ISSUES = [
  "Riding on the sidewalk",
  "Harsh braking",
  "Speeding in a pedestrian zone",
  "Running a red light",
  "Swerving between lanes",
  "Phone use while riding",
];

/** Simulates the provider-side AI analysis of a single ride. */
export function simulateRide(license: License, risky: boolean): Ride {
  const { ridden } = practicalProgress(license);
  const remaining = PRACTICAL_TOTAL_MINUTES - ridden;
  const minutes = Math.min(remaining, 10 + Math.floor(Math.random() * 16));
  const failRate = risky ? 0.35 + Math.random() * 0.4 : Math.random() < 0.6 ? 0 : Math.random() * 0.15;
  const failedMinutes = Math.round(minutes * failRate);
  const issues =
    failedMinutes === 0
      ? []
      : [...RIDE_ISSUES]
          .sort(() => Math.random() - 0.5)
          .slice(0, risky ? 2 : 1);
  return { at: new Date().toISOString(), minutes, passedMinutes: minutes - failedMinutes, issues };
}

// --- localStorage-backed store ---

const STORAGE_KEY = "scooter-license:v1";
const listeners = new Set<() => void>();
let cachedRaw: string | null | undefined;
let cachedLicense: License | null = null;

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function getLicense(): License | null {
  const raw = readRaw();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try {
      cachedLicense = raw ? (JSON.parse(raw) as License) : null;
    } catch {
      cachedLicense = null;
    }
  }
  return cachedLicense;
}

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

export function saveLicense(license: License) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(license));
  } catch {
    // Storage unavailable (e.g. private mode); the PoC simply won't persist.
  }
  emit();
}

export function clearLicense() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {}
  emit();
}

/** Returns `undefined` until the client has hydrated, then the stored license (or null). */
export function useLicense(): License | null | undefined {
  return useSyncExternalStore(subscribe, getLicense, () => undefined);
}
