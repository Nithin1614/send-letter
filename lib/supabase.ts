import { createClient } from "@supabase/supabase-js";

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// ─── OpenWhen Letter Types ─────────────────────────────────────────────────────

export interface OWLetter {
  id: string;
  management_token: string;
  title: string;
  message: string;
  signature: string;
  font: string;
  theme: string;
  envelope: string;
  sticker: string;
  photo: string;
  song: string;
  song_artist: string;
  song_artwork: string;
  song_preview_url: string;
  voice_message: string;
  voice_duration: number;
  difficulty: string;
  guardian_type: string;
  question: string;
  answer: string;
  unlock_at: string | null;
  seal_status: "unopened" | "unsealed";
  view_count: number;
  attempt_count: number;
  reply_to_id?: string | null;
  reply_letter_id?: string | null;
  sender_email?: string | null;
  recipient_email?: string | null;
  scheduled_for?: string | null;
  delivery_status?: "draft" | "scheduled" | "delivered" | null;
  ambient_soundscape?: string | null;
  created_at: string;
  opened_at: string | null;
  last_viewed_at: string | null;
}

export interface OWLetterEvent {
  id: string;
  letter_id: string;
  event_type: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

// ─── Legacy types (kept for jar feature compatibility) ─────────────────────────

export type Letter = {
  id: string;
  title: string;
  message: string;
  signature: string;
  font: string;
  sticker: string;
  bg_color: string;
  guardian_question: string;
  guardian_answer: string;
  question_type: "text" | "multiple";
  multiple_choices: string[];
  song_url: string;
  song_title: string;
  photo_url: string;
  gift_url: string;
  voice_url: string;
  typewriter_effect: boolean;
  created_at: string;
  expires_at: string;
  opened: boolean;
};

export type Jar = {
  id: string;
  title: string;
  notes: JarNote[];
  unlock_mode: "daily" | "weekly" | "all";
  created_at: string;
};

export type JarNote = {
  id: string;
  content: string;
  unlocked_at: string | null;
  opened: boolean;
};
