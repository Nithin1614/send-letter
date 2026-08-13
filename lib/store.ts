// Shared in-memory letter store
// In production, replace with Supabase or another database

export interface Letter {
  id: string;
  token: string;
  title: string;
  message: string;
  signature: string;
  font: string;
  theme: string;
  envelope: string;
  sticker?: string;
  photo?: string;
  song?: string;
  songArtist?: string;
  songArtwork?: string;
  songPreviewUrl?: string;
  voiceMessage?: string;
  voiceDuration?: number;
  difficulty: "easy" | "wait";
  guardianType: "none" | "question" | "timelock";
  question?: string;
  answer?: string;
  unlockAt?: string;
  createdAt: string;
  openedAt?: string;
}

// Global store — persists across hot reloads in dev
const globalStore = global as typeof globalThis & {
  __letterStore?: Map<string, Letter>;
};

if (!globalStore.__letterStore) {
  globalStore.__letterStore = new Map<string, Letter>();
}

export const letterStore: Map<string, Letter> = globalStore.__letterStore;
