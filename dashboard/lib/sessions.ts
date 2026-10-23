import { collection, addDoc, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "./firebase";
import { CaptureSession, RecordedSample } from "@/types";

const LOCAL_SESSIONS_KEY = "sarco_sessions_cache";

export interface StoredSession extends CaptureSession {
  samples: RecordedSample[];
}

function getLocalSessions(): StoredSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_SESSIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalSessions(sessions: StoredSession[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_SESSIONS_KEY, JSON.stringify(sessions.slice(0, 30)));
  } catch (e) {
    console.warn("Failed to save local session cache", e);
  }
}

export async function saveSession(
  sessionMeta: Omit<CaptureSession, "id">,
  samples: RecordedSample[]
): Promise<StoredSession> {
  const newSession: StoredSession = {
    id: `sess_${Date.now()}`,
    ...sessionMeta,
    samples,
  };

  try {
    const colRef = collection(db, "sessions");
    // Save metadata to Firestore
    const docRef = await addDoc(colRef, {
      ...sessionMeta,
      createdAt: Date.now(),
    });
    newSession.id = docRef.id;
  } catch (err) {
    console.warn("Firestore session write failed, saved locally:", err);
  }

  // Update local cache
  const local = getLocalSessions();
  saveLocalSessions([newSession, ...local]);

  return newSession;
}

export async function fetchSessions(): Promise<StoredSession[]> {
  const local = getLocalSessions();
  try {
    const colRef = collection(db, "sessions");
    const q = query(colRef, orderBy("startTime", "desc"), limit(20));
    const snap = await getDocs(q);

    if (!snap.empty) {
      // Map firestore sessions with local sample buffers
      const list: StoredSession[] = [];
      snap.forEach((d) => {
        const data = d.data();
        const matchedLocal = local.find((l) => l.id === d.id);
        list.push({
          id: d.id,
          patientId: data.patientId || "Unknown",
          patientName: data.patientName || "Unknown",
          mode: data.mode || "clinical",
          startTime: data.startTime || Date.now(),
          durationSeconds: data.durationSeconds || 0,
          sampleCount: data.sampleCount || 0,
          notes: data.notes || "",
          samples: matchedLocal ? matchedLocal.samples : [],
        });
      });
      return list;
    }
  } catch (err) {
    console.warn("Firestore fetchSessions failed, using local:", err);
  }

  return local;
}

