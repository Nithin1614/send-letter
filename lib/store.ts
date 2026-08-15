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
  replyToId?: string;
  replyLetterId?: string;
  senderEmail?: string;
  recipientEmail?: string;
  scheduledFor?: string;
  deliveryStatus?: 'draft' | 'scheduled' | 'delivered';
  ambientSoundscape?: string;
  openingStyle?: 'wax-seal' | 'envelope-unfold';
  letterTheme?: string;
  reactions?: string[];
  viewCount?: number;
  attemptCount?: number;
  lastViewedAt?: string;
  events?: Array<{ id: string; type: string; metadata: any; createdAt: string }>;
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
