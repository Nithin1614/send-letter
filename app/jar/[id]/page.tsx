"use client";
import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";

type JarNote = {
  id: string;
  content: string | null;
  opened: boolean;
  sealed?: boolean;
  order?: number;
};

type Jar = {
  id: string;
  title: string;
  notes: JarNote[];
  unlock_mode: "daily" | "weekly" | "all";
  created_at: string;
};

export default function JarViewPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const justCreated = searchParams.get("created") === "true";

  const [jar, setJar]         = useState<Jar | null>(null);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(true);
  const [openedNote, setOpenedNote] = useState<string | null>(null);
  const [copied, setCopied]   = useState(false);

  useEffect(() => {
    fetch(`/api/jar/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setError(data.error); setLoading(false); return; }
        setJar(data);
        setLoading(false);
      })
      .catch(() => { setError("Could not load this jar."); setLoading(false); });
  }, [id]);

  const shareUrl = typeof window !== "undefined" ? window.location.href.split("?")[0] : "";

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const unlockedNotes = jar?.notes.filter(n => !n.sealed) || [];
  const sealedCount   = jar?.notes.filter(n => n.sealed).length || 0;

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "16px", alignItems: "center" }}>
        <div style={{ width: 44, height: 44, border: "2px solid rgba(212,165,116,0.15)", borderTopColor: "var(--gold)", borderRadius: "50%", animation: "spin 1s linear infinite" }}/>
        <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: "15px", color: "rgba(212,165,116,0.5)", letterSpacing: "0.12em" }}>Opening the jar…</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ textAlign: "center", maxWidth: "400px", display: "flex", flexDirection: "column", gap: "16px", alignItems: "center" }}>
        <div style={{ fontSize: "40px" }}>🫙</div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.6rem", color: "var(--cream)", fontWeight: 600 }}>Jar Not Found</h1>
        <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: "16px", color: "rgba(250,248,245,0.45)" }}>{error}</p>
        <Link href="/" className="btn-primary">Return Home</Link>
      </div>
    </div>
  );

  if (!jar) return null;

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />
      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "100px 1.5rem 80px" }}>

        {/* Created banner */}
        {justCreated && (
          <div style={{
            background: "rgba(139,32,32,0.15)",
            border: "1px solid rgba(139,32,32,0.3)",
            borderRadius: "10px",
            padding: "20px 24px",
            marginBottom: "32px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "17px", color: "var(--cream)", fontWeight: 600 }}>🎉 Your jar is sealed!</p>
            <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: "15px", color: "rgba(250,248,245,0.55)" }}>Share this link with the person you made it for:</p>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <div style={{ flex: 1, background: "rgba(10,6,6,0.5)", border: "1px solid rgba(212,165,116,0.12)", borderRadius: "6px", padding: "10px 14px", fontFamily: "monospace", fontSize: "13px", color: "rgba(250,248,245,0.6)", wordBreak: "break-all" }}>
                {shareUrl}
              </div>
              <button onClick={copyLink} className="btn-primary" style={{ whiteSpace: "nowrap" }}>
                {copied ? "✓ Copied!" : "Copy Link"}
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div style={{ marginBottom: "48px" }}>
          <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: "12px", letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(212,165,116,0.45)", marginBottom: "10px" }}>
            Note Jar
          </p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.8rem, 4vw, 2.5rem)", color: "var(--cream)", fontWeight: 600, marginBottom: "12px", lineHeight: 1.2 }}>
            {jar.title}
          </h1>
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: "15px", color: "rgba(250,248,245,0.4)" }}>
              {unlockedNotes.length} note{unlockedNotes.length !== 1 ? "s" : ""} unlocked
              {sealedCount > 0 && ` · ${sealedCount} still sealed`}
            </p>
            {jar.unlock_mode !== "all" && sealedCount > 0 && (
              <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: "15px", color: "rgba(212,165,116,0.4)", fontStyle: "italic" }}>
                {jar.unlock_mode === "daily" ? "A new note unlocks every day" : "A new note unlocks every week"}
              </p>
            )}
          </div>
        </div>

        {/* Unlocked notes */}
        {unlockedNotes.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "32px" }}>
            {unlockedNotes.map((note, i) => (
              <div key={note.id}>
                <div
                  onClick={() => setOpenedNote(openedNote === note.id ? null : note.id)}
                  style={{
                    background: "#f5f0e6",
                    borderRadius: "6px",
                    padding: "20px 24px",
                    cursor: "pointer",
                    boxShadow: "0 3px 12px rgba(0,0,0,0.4)",
                    transition: "transform 0.15s, box-shadow 0.15s",
                    position: "relative",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 20px rgba(0,0,0,0.5)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "none"; (e.currentTarget as HTMLElement).style.boxShadow = "0 3px 12px rgba(0,0,0,0.4)"; }}
                >
                  {/* Fold indicator top */}
                  <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "24px", height: "4px", background: "rgba(42,21,21,0.12)", borderRadius: "0 0 4px 4px" }}/>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: "12px", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(42,21,21,0.4)" }}>
                      № {(note.order ?? i) + 1}
                    </p>
                    <span style={{ color: "rgba(139,32,32,0.4)", fontSize: "14px", transform: openedNote === note.id ? "rotate(180deg)" : "none", transition: "transform 0.25s" }}>▼</span>
                  </div>

                  {openedNote === note.id && note.content && (
                    <p style={{
                      fontFamily: "'Crimson Pro', serif",
                      fontSize: "17px",
                      color: "#2a1515",
                      lineHeight: 1.75,
                      marginTop: "14px",
                      whiteSpace: "pre-wrap",
                      animation: "fade-in 0.3s ease-out",
                    }}>
                      {note.content}
                    </p>
                  )}

                  {openedNote !== note.id && (
                    <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: "15px", color: "rgba(42,21,21,0.4)", marginTop: "6px", fontStyle: "italic" }}>
                      Tap to read…
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Sealed notes */}
        {sealedCount > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "40px" }}>
            <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: "14px", letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(212,165,116,0.35)", marginBottom: "8px" }}>
              Still sealed
            </p>
            {jar.notes.filter(n => n.sealed).map((note, i) => (
              <div key={note.id} style={{
                background: "rgba(18,8,8,0.6)",
                border: "1px solid rgba(212,165,116,0.08)",
                borderRadius: "6px",
                padding: "14px 20px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                opacity: Math.max(0.2, 0.6 - i * 0.12),
              }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(139,32,32,0.4)", flexShrink: 0 }}/>
                <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: "14px", color: "rgba(212,165,116,0.35)", fontStyle: "italic" }}>
                  № {(unlockedNotes.length + i + 1)} · {jar.unlock_mode === "daily" ? `Opens in ${i + 1} day${i > 0 ? "s" : ""}` : jar.unlock_mode === "weekly" ? `Opens in ${i + 1} week${i > 0 ? "s" : ""}` : "Sealed"}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {unlockedNotes.length === 0 && sealedCount === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🫙</div>
            <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: "17px", color: "rgba(250,248,245,0.4)" }}>This jar is empty.</p>
          </div>
        )}

        {/* Footer action */}
        <div style={{ textAlign: "center", marginTop: "40px" }}>
          <Link href="/jar/create" style={{ fontFamily: "'Crimson Pro', serif", fontSize: "15px", color: "rgba(212,165,116,0.45)", textDecoration: "none" }}>
            Create your own jar →
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fade-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </main>
  );
}
