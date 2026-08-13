"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

type UnlockMode = "daily" | "weekly" | "all";

interface Note {
  id: string;
  content: string;
}

export default function JarCreatePage() {
  const router = useRouter();
  const [title, setTitle]             = useState("");
  const [unlockMode, setUnlockMode]   = useState<UnlockMode>("daily");
  const [notes, setNotes]             = useState<Note[]>([{ id: crypto.randomUUID(), content: "" }]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");

  const addNote = () => {
    if (notes.length >= 100) return;
    setNotes(n => [...n, { id: crypto.randomUUID(), content: "" }]);
  };

  const updateNote = (id: string, content: string) => {
    setNotes(n => n.map(note => note.id === id ? { ...note, content } : note));
  };

  const removeNote = (id: string) => {
    if (notes.length <= 1) return;
    setNotes(n => n.filter(note => note.id !== id));
  };

  const handleSubmit = async () => {
    const filled = notes.filter(n => n.content.trim());
    if (filled.length === 0) { setError("Add at least one note."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/jar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title || "A Jar of Notes",
          unlock_mode: unlockMode,
          notes: filled.map(n => ({ content: n.content })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      router.push(`/jar/${data.id}?created=true`);
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const filledCount = notes.filter(n => n.content.trim()).length;

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />
      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "100px 1.5rem 80px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: "12px", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(212,165,116,0.5)", marginBottom: "14px" }}>Note Jar</p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem, 5vw, 2.8rem)", color: "var(--cream)", fontWeight: 600, marginBottom: "12px", lineHeight: 1.2 }}>
            Fill a Jar with Love
          </h1>
          <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: "17px", color: "rgba(250,248,245,0.45)", lineHeight: 1.6 }}>
            Write up to 100 small moments, reasons, and full letters.<br/>They unwrap one at a time — no peeking ahead.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>

          {/* Jar title */}
          <div>
            <label className="composer-label">Jar Title</label>
            <input className="composer-input" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="100 Reasons I Love You…" maxLength={120}/>
          </div>

          {/* Unlock mode */}
          <div>
            <label className="composer-label">How They Unlock Notes</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
              {([
                { id: "daily",  label: "One a Day",  desc: "A new note every 24h" },
                { id: "weekly", label: "One a Week", desc: "A new note every 7 days" },
                { id: "all",    label: "All at Once", desc: "All notes available immediately" },
              ] as const).map(m => (
                <button key={m.id} onClick={() => setUnlockMode(m.id)} style={{
                  padding: "14px 12px", borderRadius: "10px", cursor: "pointer",
                  background: unlockMode === m.id ? "rgba(139,32,32,0.2)" : "rgba(212,165,116,0.04)",
                  border: `1px solid ${unlockMode === m.id ? "var(--seal)" : "rgba(212,165,116,0.12)"}`,
                  color: unlockMode === m.id ? "var(--parchment)" : "rgba(250,248,245,0.5)",
                  fontFamily: "'Crimson Pro', serif",
                  transition: "all 0.2s",
                  textAlign: "left",
                }}>
                  <div style={{ fontSize: "16px", fontWeight: 600, marginBottom: "4px" }}>{m.label}</div>
                  <div style={{ fontSize: "13px", color: unlockMode === m.id ? "rgba(245,240,230,0.6)" : "rgba(250,248,245,0.3)" }}>{m.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Notes list */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "12px" }}>
              <label className="composer-label" style={{ marginBottom: 0 }}>
                Your Notes — {filledCount} / {notes.length} filled
              </label>
              <span style={{ fontFamily: "'Crimson Pro', serif", fontSize: "12px", color: "rgba(212,165,116,0.35)" }}>
                {notes.length} / 100
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {notes.map((note, i) => (
                <div key={note.id} style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                  {/* Note number */}
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                    background: note.content.trim() ? "rgba(139,32,32,0.25)" : "rgba(212,165,116,0.06)",
                    border: `1px solid ${note.content.trim() ? "rgba(139,32,32,0.4)" : "rgba(212,165,116,0.12)"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "'Crimson Pro', serif", fontSize: "11px",
                    color: note.content.trim() ? "rgba(245,240,230,0.7)" : "rgba(212,165,116,0.35)",
                    marginTop: "10px",
                  }}>{i + 1}</div>

                  <textarea
                    className="composer-input"
                    value={note.content}
                    onChange={e => updateNote(note.id, e.target.value)}
                    placeholder={i === 0 ? "Your first reason, memory, or full letter…" : `Note ${i + 1}…`}
                    style={{ flex: 1, minHeight: "72px", resize: "vertical" }}
                  />

                  {notes.length > 1 && (
                    <button onClick={() => removeNote(note.id)} style={{
                      background: "none", border: "none",
                      color: "rgba(212,165,116,0.25)", cursor: "pointer",
                      fontSize: "18px", marginTop: "10px", padding: "0 4px",
                      transition: "color 0.15s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = "rgba(196,30,58,0.6)")}
                    onMouseLeave={e => (e.currentTarget.style.color = "rgba(212,165,116,0.25)")}
                    >×</button>
                  )}
                </div>
              ))}
            </div>

            {notes.length < 100 && (
              <button onClick={addNote} style={{
                marginTop: "12px",
                width: "100%", padding: "12px",
                background: "rgba(212,165,116,0.03)",
                border: "1px dashed rgba(212,165,116,0.18)",
                borderRadius: "8px",
                color: "rgba(212,165,116,0.45)",
                fontFamily: "'Crimson Pro', serif", fontSize: "15px",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(212,165,116,0.4)"; (e.currentTarget as HTMLElement).style.color = "rgba(212,165,116,0.8)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(212,165,116,0.18)"; (e.currentTarget as HTMLElement).style.color = "rgba(212,165,116,0.45)"; }}
              >
                + Add another note ({100 - notes.length} remaining)
              </button>
            )}
          </div>

          {error && (
            <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: "14px", color: "rgba(196,30,58,0.9)", background: "rgba(139,32,32,0.1)", padding: "12px", borderRadius: "6px", border: "1px solid rgba(139,32,32,0.2)" }}>
              {error}
            </p>
          )}

          <button onClick={handleSubmit} disabled={loading || filledCount === 0} className="btn-primary"
            style={{ opacity: (loading || filledCount === 0) ? 0.4 : 1, justifyContent: "center", padding: "16px" }}>
            {loading ? "Sealing the jar…" : `Seal the Jar with ${filledCount} Note${filledCount !== 1 ? "s" : ""} →`}
          </button>

          <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: "13px", color: "rgba(250,248,245,0.3)", textAlign: "center" }}>
            Free · No account · They get a unique link
          </p>
        </div>
      </div>
    </main>
  );
}
