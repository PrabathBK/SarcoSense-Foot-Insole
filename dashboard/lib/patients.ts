import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "./firebase";
import { Patient } from "@/types";

const LOCAL_STORAGE_KEY = "sarco_patients_cache";

export function calculateBMI(heightCm: number, weightKg: number): number {
  if (heightCm <= 0 || weightKg <= 0) return 0;
  const heightM = heightCm / 100;
  return Number((weightKg / (heightM * heightM)).toFixed(1));
}

export function getBMICategory(bmi: number): {
  label: string;
  color: string;
} {
  if (bmi <= 0) return { label: "N/A", color: "text-slate-400" };
  if (bmi < 18.5) return { label: "Underweight", color: "text-amber-400" };
  if (bmi < 25.0) return { label: "Normal weight", color: "text-emerald-400" };
  if (bmi < 30.0) return { label: "Overweight", color: "text-amber-400" };
  return { label: "Obese", color: "text-rose-400" };
}

// Local cache helpers
function getLocalPatients(): Patient[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalPatients(patients: Patient[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(patients));
  } catch (e) {
    console.warn("Failed to save local patient cache", e);
  }
}

/**
 * Fetch all patients from Firestore (falling back to local cache if offline)
 */
export async function fetchPatients(): Promise<Patient[]> {
  try {
    const colRef = collection(db, "patients");
    const q = query(colRef, orderBy("createdAt", "desc"));
    const snap = await getDocs(q);

    if (!snap.empty) {
      const list: Patient[] = [];
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          patientId: data.patientId || docSnap.id,
          name: data.name || "Unnamed",
          age: data.age || 0,
          gender: data.gender || "Other",
          heightCm: data.heightCm || 0,
          weightKg: data.weightKg || 0,
          bmi: data.bmi || calculateBMI(data.heightCm || 0, data.weightKg || 0),
          notes: data.notes || "",
          createdAt: data.createdAt || Date.now(),
        });
      });
      saveLocalPatients(list);
      return list;
    }
  } catch (err) {
    console.warn("Firestore fetch failed, using local cache:", err);
  }

  // Fallback to local storage
  const local = getLocalPatients();
  if (local.length > 0) return local;

  // Initial starter patient for demo purposes
  const defaultPatient: Patient = {
    id: "demo-subject-1",
    patientId: "P-1001",
    name: "Eleanor Vance",
    age: 68,
    gender: "Female",
    heightCm: 162,
    weightKg: 54,
    bmi: 20.6,
    notes: "Baseline sarcopenia mobility assessment. Moderate bilateral gait asymmetry.",
    createdAt: Date.now() - 86400000,
  };
  saveLocalPatients([defaultPatient]);
  return [defaultPatient];
}

/**
 * Add a new patient record
 */
export async function createPatient(
  patientData: Omit<Patient, "id" | "bmi" | "createdAt">
): Promise<Patient> {
  const bmi = calculateBMI(patientData.heightCm, patientData.weightKg);
  const now = Date.now();

  const newPatient: Patient = {
    id: `p_${Math.random().toString(36).substring(2, 9)}`,
    ...patientData,
    bmi,
    createdAt: now,
  };

  try {
    const colRef = collection(db, "patients");
    const docRef = await addDoc(colRef, {
      ...patientData,
      bmi,
      createdAt: now,
    });
    newPatient.id = docRef.id;
  } catch (err) {
    console.warn("Firestore write failed, saving to local cache:", err);
  }

  // Update local cache
  const local = getLocalPatients();
  const updated = [newPatient, ...local.filter((p) => p.id !== newPatient.id)];
  saveLocalPatients(updated);

  return newPatient;
}

/**
 * Delete a patient record
 */
export async function removePatient(id: string): Promise<void> {
  try {
    const docRef = doc(db, "patients", id);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn("Firestore delete failed, deleting locally:", err);
  }

  const local = getLocalPatients();
  saveLocalPatients(local.filter((p) => p.id !== id));
}

