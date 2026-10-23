import { create } from "zustand";
import { Patient } from "@/types";
import { fetchPatients, createPatient, removePatient } from "@/lib/patients";

interface PatientStoreState {
  patients: Patient[];
  activePatient: Patient | null;
  isLoading: boolean;
  error: string | null;

  loadPatients: () => Promise<void>;
  addPatient: (data: Omit<Patient, "id" | "bmi" | "createdAt">) => Promise<Patient>;
  deletePatient: (id: string) => Promise<void>;
  setActivePatient: (patient: Patient | null) => void;
}

export const usePatientStore = create<PatientStoreState>((set, get) => ({
  patients: [],
  activePatient: null,
  isLoading: false,
  error: null,

  loadPatients: async () => {
    set({ isLoading: true, error: null });
    try {
      const list = await fetchPatients();
      set({
        patients: list,
        activePatient: get().activePatient || list[0] || null,
        isLoading: false,
      });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : "Failed to load patients",
      });
    }
  },

  addPatient: async (data) => {
    set({ isLoading: true });
    try {
      const created = await createPatient(data);
      set((state) => ({
        patients: [created, ...state.patients],
        activePatient: created,
        isLoading: false,
      }));
      return created;
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  deletePatient: async (id) => {
    try {
      await removePatient(id);
      set((state) => {
        const remaining = state.patients.filter((p) => p.id !== id);
        return {
          patients: remaining,
          activePatient:
            state.activePatient?.id === id
              ? remaining[0] || null
              : state.activePatient,
        };
      });
    } catch (err) {
      console.error("Failed to delete patient:", err);
    }
  },

  setActivePatient: (patient) => set({ activePatient: patient }),
}));

