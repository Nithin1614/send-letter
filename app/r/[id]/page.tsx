"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
// @ts-ignore
import confetti from "canvas-confetti";

/* ── Theme → full page background (same as create page) ───────────── */
const THEME_PAGE_BG: Record<string, string> = {
  'Classic Burgundy':  'radial-gradient(ellipse at 50% 20%, #24080d 0%, #140407 50%, #080204 100%)',
  'Sunset':            'linear-gradient(180deg, #1c0516 0%, #4a0c28 22%, #8c2038 42%, #d44830 65%, #f48838 85%, #fca448 100%)',
  'Aurora':            'linear-gradient(135deg, #0a0422 0%, #200850 25%, #4c1288 50%, #7e1eb8 75%, #081e36 100%)',
  'Soft Paper':        'radial-gradient(ellipse at 50% 40%, #2e2418 0%, #1e160e 55%, #120d08 100%)',
  'Linen':             'radial-gradient(ellipse at 50% 35%, #2a1e12 0%, #1b120a 50%, #100a04 100%)',
  'Vintage Parchment': 'radial-gradient(ellipse at 45% 35%, #3c220c 0%, #281406 45%, #160a02 80%, #0b0401 100%)',
  'Midnight Stars':    'linear-gradient(180deg, #04040e 0%, #07081c 50%, #040410 100%)',
  'Falling Hearts':    'linear-gradient(135deg, #180408 0%, #360c1c 50%, #180408 100%)',
  'Vines & Roses':     'linear-gradient(135deg, #0a0418 0%, #1a0828 50%, #0c0420 100%)',
};


interface LetterData {
  id: string;
  title: string;
  message: string;
  signature: string;
  font: string;
  theme: string;
  envelope: string;
  sticker?: string;
  song?: string;
  songArtist?: string;
  songArtwork?: string;
  songPreviewUrl?: string;
  difficulty: string;
  guardianType: string;
  question?: string;
  hasGuardian: boolean;
}

type Phase = "loading" | "guardian" | "sealed" | "unfolding" | "revealed";

/* ── Font map ─────────────────────────────── */
const FONT_MAP: Record<string, string> = {
  Classic: "'Crimson Pro', Georgia, serif",
  Flowing: "'Dancing Script', cursive",
  Elegant: "'Cormorant Garamond', serif",
  Casual:  "'Caveat', cursive",
  Retro:   "'Pacifico', cursive",
};

/* ── Theme → letter card background ─────── */
function getThemeCard(theme: string): { bg: string; textColor: string; isBright: boolean } {
  const map: Record<string, { bg: string; textColor: string; isBright: boolean }> = {
    "Classic Burgundy":  { bg: "linear-gradient(160deg, #0e0404 0%, #1c0808 50%, #100404 100%)", textColor: "rgba(250,248,245,0.85)", isBright: false },
    "Sunset":            { bg: "linear-gradient(135deg, #f4a24a 0%, #e8602a 20%, #c03860 45%, #7a2070 65%, #2e1050 85%, #1a0840 100%)", textColor: "rgba(255,248,240,0.92)", isBright: false },
    "Aurora":            { bg: "linear-gradient(135deg, #2a0e60 0%, #5a18a8 30%, #8820c0 55%, #3a0e70 80%, #1a0840 100%)", textColor: "rgba(235,220,255,0.9)", isBright: false },
    "Soft Paper":        { bg: "linear-gradient(135deg, #cbb98a 0%, #c4a870 40%, #b89858 100%)", textColor: "#2a1a08", isBright: true },
    "Linen":             { bg: "linear-gradient(135deg, #b09060 0%, #9a7848 40%, #7a5830 100%)", textColor: "#1a1008", isBright: true },
    "Vintage Parchment": { bg: "linear-gradient(160deg, #a07830 0%, #c09040 40%, #8a6820 80%, #604810 100%)", textColor: "#1a1008", isBright: true },
    "Midnight Stars":    { bg: "radial-gradient(ellipse at 30% 20%, #0e0e30 0%, #060618 60%, #040410 100%)", textColor: "rgba(200,215,255,0.9)", isBright: false },
    "Falling Hearts":    { bg: "linear-gradient(135deg, #380818 0%, #680c38 40%, #4a0c28 70%, #200810 100%)", textColor: "rgba(255,220,235,0.9)", isBright: false },
    "Vines & Roses":     { bg: "linear-gradient(135deg, #200830 0%, #3a1048 40%, #280a38 70%, #140620 100%)", textColor: "rgba(220,255,210,0.9)", isBright: false },
  };
  return map[theme] ?? map["Classic Burgundy"];
}

/* ── Envelope styles for sealed view ─────── */
function getEnvelopeStyle(envelope: string) {
  const styles: Record<string, { bodyBg: string; flapBg: string; sealBg: string; sealIcon: string; isRibbon?: boolean }> = {
    "Classic Wax":       { bodyBg: "#f0ece4", flapBg: "rgba(0,0,0,0.12)", sealBg: "radial-gradient(circle at 38% 32%,#e0303a,#8b2020 60%,#5c1616)", sealIcon: "❤️" },
    "Silk Ribbon":       { bodyBg: "#fde8f0", flapBg: "rgba(0,0,0,0.08)", sealBg: "transparent", sealIcon: "🎀", isRibbon: true },
    "Twine & Botanical": { bodyBg: "#e8dcc0", flapBg: "rgba(0,0,0,0.15)", sealBg: "radial-gradient(circle at 38% 32%,#a06830,#6a4018)", sealIcon: "🌿" },
    "Vintage Crest":     { bodyBg: "#f5ead0", flapBg: "rgba(0,0,0,0.1)", sealBg: "radial-gradient(circle at 38% 32%,#d4a030,#a07820)", sealIcon: "👑" },
    "Floral Washi":      { bodyBg: "#fde0e8", flapBg: "rgba(0,0,0,0.08)", sealBg: "radial-gradient(circle at 38% 32%,#e060a0,#a83070)", sealIcon: "🌸" },
    "Lace & Pearl":      { bodyBg: "#f8f0f0", flapBg: "rgba(0,0,0,0.07)", sealBg: "radial-gradient(circle at 38% 32%,#d8c8c8,#b0a0a0)", sealIcon: "🤍" },
    "Gold Wax Drip":     { bodyBg: "#f0ece4", flapBg: "rgba(0,0,0,0.1)", sealBg: "radial-gradient(circle at 38% 32%,#f0c040,#c09020)", sealIcon: "⭐" },
    "Velvet & Tassel":   { bodyBg: "#3a1020", flapBg: "rgba(0,0,0,0.4)", sealBg: "radial-gradient(circle at 38% 32%,#c04080,#802860)", sealIcon: "🎗️" },
  };
  return styles[envelope] ?? styles["Classic Wax"];
}

/* ── Stars decoration ────────────────────── */
function MidnightStarsOverlay() {
  const dots = Array.from({ length: 24 }, (_, i) => ({
    left: `${(i * 37 + 11) % 100}%`, top: `${(i * 53 + 7) % 100}%`,
    size: i % 5 === 0 ? 2.5 : 1.5,
    delay: `${(i * 0.17) % 2}s`,
  }));
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", borderRadius: "inherit" }}>
      {dots.map((d, i) => (
        <div key={i} style={{
          position: "absolute", left: d.left, top: d.top,
          width: d.size, height: d.size, borderRadius: "50%",
          background: "rgba(180,210,255,0.65)",
          animation: `twinkle 2s ease-in-out ${d.delay} infinite`,
        }} />
      ))}
    </div>
  );
}

/* ── Full-page theme overlay ───────────────── */
function FullPageThemeOverlay({ theme }: { theme: string }) {
  if (theme === 'Falling Hearts') {
    const HEARTS = [
      { left: '4%', top: '8%', size: 22, delay: '0s', dur: '4s' },
      { left: '14%', top: '28%', size: 16, delay: '1s', dur: '5s' },
      { left: '24%', top: '65%', size: 24, delay: '2s', dur: '4.5s' },
      { left: '34%', top: '18%', size: 18, delay: '0.5s', dur: '3.8s' },
      { left: '46%', top: '82%', size: 26, delay: '1.5s', dur: '5.2s' },
      { left: '56%', top: '12%', size: 20, delay: '2.5s', dur: '4.2s' },
      { left: '66%', top: '60%', size: 28, delay: '0.8s', dur: '4.8s' },
      { left: '76%', top: '26%', size: 18, delay: '1.8s', dur: '3.5s' },
      { left: '86%', top: '75%', size: 24, delay: '2.2s', dur: '5s' },
      { left: '94%', top: '15%', size: 16, delay: '0.2s', dur: '4s' },
      { left: '8%', top: '50%', size: 20, delay: '1.2s', dur: '4.6s' },
      { left: '40%', top: '40%', size: 22, delay: '2.8s', dur: '5.5s' },
      { left: '80%', top: '45%', size: 26, delay: '0.7s', dur: '4.1s' },
    ];
    return (
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        {HEARTS.map((h, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: h.left,
              top: h.top,
              fontSize: h.size,
              color: '#f080a0',
              opacity: 0.55,
              animation: `floatHeart ${h.dur} ease-in-out ${h.delay} infinite alternate`,
              textShadow: '0 0 12px rgba(240, 128, 160, 0.5)',
            }}
          >
            ♥
          </div>
        ))}
      </div>
    );
  }

  if (theme === 'Midnight Stars') {
    const STARS = [
      { left: '4%', top: '8%', size: 3, delay: '0s' },
      { left: '12%', top: '25%', size: 2, delay: '1s' },
      { left: '22%', top: '15%', size: 4, delay: '2s' },
      { left: '32%', top: '45%', size: 2, delay: '0.5s' },
      { left: '42%', top: '10%', size: 3, delay: '1.5s' },
      { left: '52%', top: '30%', size: 2, delay: '2.5s' },
      { left: '62%', top: '18%', size: 4, delay: '0.8s' },
      { left: '72%', top: '55%', size: 2, delay: '1.8s' },
      { left: '82%', top: '22%', size: 3, delay: '2.2s' },
      { left: '92%', top: '12%', size: 2, delay: '0.3s' },
      { left: '8%', top: '75%', size: 3, delay: '1.2s' },
      { left: '28%', top: '85%', size: 2, delay: '2.8s' },
      { left: '48%', top: '70%', size: 4, delay: '0.7s' },
      { left: '68%', top: '88%', size: 2, delay: '1.4s' },
      { left: '88%', top: '78%', size: 3, delay: '2.1s' },
    ];
    return (
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        {STARS.map((s, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: s.left,
              top: s.top,
              width: s.size,
              height: s.size,
              borderRadius: '50%',
              backgroundColor: '#ffffff',
              boxShadow: '0 0 8px #ffffff',
              animation: `starTwinkle 3s ease-in-out ${s.delay} infinite alternate`,
            }}
          />
        ))}
      </div>
    );
  }

  if (theme === 'Vines & Roses') {
    return (
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden', opacity: 0.35 }}>
        <svg width="100%" height="100%" viewBox="0 0 800 800" preserveAspectRatio="none">
          <path d="M0,150 Q200,50 400,200 T800,100" fill="none" stroke="#d090c0" strokeWidth="2"/>
          <path d="M0,550 Q300,450 500,600 T800,500" fill="none" stroke="#b070a8" strokeWidth="2"/>
          <circle cx="200" cy="140" r="12" fill="none" stroke="#e0a0d0" strokeWidth="1.5"/>
          <circle cx="600" cy="160" r="15" fill="none" stroke="#d090c0" strokeWidth="1.5"/>
          <circle cx="350" cy="530" r="10" fill="none" stroke="#b070a8" strokeWidth="1.5"/>
          <circle cx="700" cy="550" r="14" fill="none" stroke="#e0a0d0" strokeWidth="1.5"/>
        </svg>
      </div>
    );
  }

  return null;
}

/* ── Song Player ─────────────────────────────── */
function SongPlayer({
  song, songArtist, songArtwork, songPreviewUrl,
}: {
  song: string;
  songArtist?: string;
  songArtwork?: string;
  songPreviewUrl?: string;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    if (!songPreviewUrl) return;
    const audio = new Audio(songPreviewUrl);
    audio.volume = 0.7;
    audioRef.current = audio;

    audio.addEventListener('timeupdate', () => {
      if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100);
    });
    audio.addEventListener('loadedmetadata', () => setDuration(audio.duration));
    audio.addEventListener('ended', () => { setPlaying(false); setProgress(0); });

    // Auto-play when component mounts
    audio.play().then(() => setPlaying(true)).catch(() => setBlocked(true));

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [songPreviewUrl]);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().then(() => { setPlaying(true); setBlocked(false); }).catch(() => {});
    }
  }

  const fmtTime = (s: number) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
  const elapsed = duration ? (progress / 100) * duration : 0;

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: 'rgba(6,2,2,0.97)',
      borderTop: '1px solid rgba(212,165,116,0.08)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      zIndex: 100,
    }}>
      {/* Progress bar */}
      <div style={{ height: 2, background: 'rgba(255,255,255,0.06)', position: 'relative' }}>
        <div style={{
          position: 'absolute', left: 0, top: 0, height: '100%',
          width: `${progress}%`,
          background: 'linear-gradient(90deg, #8b2020, #c41e3a)',
          transition: 'width 0.5s linear',
        }} />
      </div>

      {/* Player row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px' }}>
        {/* Album art */}
        {songArtwork ? (
          <img
            src={songArtwork}
            alt=""
            style={{ width: 38, height: 38, borderRadius: 6, objectFit: 'cover', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.5)' }}
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <div style={{ width: 38, height: 38, borderRadius: 6, background: 'rgba(139,32,32,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>♫</div>
        )}

        {/* Song info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: "'Crimson Pro',serif", fontSize: 14, color: 'rgba(250,248,245,0.88)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{song}</p>
          {songArtist && <p style={{ fontFamily: "'Crimson Pro',serif", fontSize: 12, color: 'rgba(250,248,245,0.35)', margin: 0 }}>{songArtist}</p>}
        </div>

        {/* Time */}
        {duration > 0 && (
          <span style={{ fontFamily: "'Crimson Pro',serif", fontSize: 11, color: 'rgba(250,248,245,0.28)', flexShrink: 0 }}>
            {fmtTime(elapsed)} / {fmtTime(duration)}
          </span>
        )}

        {/* Play / Pause button */}
        {songPreviewUrl && (
          <button
            onClick={togglePlay}
            title={playing ? 'Pause' : blocked ? 'Tap to play' : 'Play'}
            style={{
              width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
              background: playing ? 'rgba(139,32,32,0.5)' : 'rgba(196,30,58,0.8)',
              border: '1px solid rgba(196,30,58,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#fff', fontSize: 14,
              transition: 'all 0.2s',
            }}
          >
            {playing ? '❚❚' : '▶'}
          </button>
        )}

        {/* Blocked hint */}
        {blocked && !playing && (
          <span style={{ fontFamily: "'Crimson Pro',serif", fontSize: 11, color: 'rgba(212,165,116,0.5)', flexShrink: 0 }}>tap ▶ to play</span>
        )}
      </div>
    </div>
  );
}

export default function RevealPage() {
  const params = useParams();
  const id = params?.id as string;

  const [letter, setLetter] = useState<LetterData | null>(null);
  const [phase, setPhase] = useState<Phase>("loading");
  const [guardianAnswer, setGuardianAnswer] = useState("");
  const [guardianError, setGuardianError] = useState(false);
  const [guardianLoading, setGuardianLoading] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [reaction, setReaction] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const holdInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const holdStart = useRef(0);
  const HOLD_MS = 2500;

  useEffect(() => {
    if (!id) return;
    fetch(`/api/letters/${id}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) { setPhase("sealed"); return; }
        setLetter(data);
        if (data.hasGuardian && data.guardianType === "question") {
          setPhase("guardian");
        } else {
          setPhase("sealed");
        }
      })
      .catch(() => setPhase("sealed"));
  }, [id]);

  const startHold = useCallback(() => {
    if (phase !== "sealed") return;
    setIsHolding(true);
    holdStart.current = Date.now();
    holdInterval.current = setInterval(() => {
      const pct = Math.min(100, Math.round(((Date.now() - holdStart.current) / HOLD_MS) * 100));
      setHoldProgress(pct);
      if (pct >= 100) {
        clearInterval(holdInterval.current!);
        setIsHolding(false);
        setHoldProgress(0);
        setPhase("unfolding");
        // Record the unseal event in Supabase
        fetch(`/api/letters/${id}/unseal`, { method: "POST" }).catch(() => {});
        setTimeout(() => setPhase("revealed"), 2000);
      }
    }, 16);
  }, [phase, id]);

  const stopHold = useCallback(() => {
    if (holdInterval.current) clearInterval(holdInterval.current);
    setIsHolding(false);
    setHoldProgress(0);
  }, []);

  const submitGuardian = async () => {
    if (!guardianAnswer.trim()) return;
    setGuardianLoading(true);
    try {
      const res = await fetch(`/api/letters/${id}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer: guardianAnswer }),
      });
      const { correct } = await res.json();
      if (correct) {
        setPhase("sealed");
      } else {
        setGuardianError(true);
        setTimeout(() => setGuardianError(false), 900);
      }
    } catch {
      setGuardianError(true);
      setTimeout(() => setGuardianError(false), 900);
    } finally {
      setGuardianLoading(false);
    }
  };

  const pageBg = THEME_PAGE_BG[letter?.theme || 'Classic Burgundy'] || 'linear-gradient(160deg, #120606 0%, #200a0a 60%, #0e0404 100%)';

  /* ── LOADING ─────────────────────────────────────────── */
  if (phase === "loading") {
    return (
      <div style={{ minHeight: "100vh", background: pageBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 32, height: 32, border: "2px solid rgba(139,32,32,0.25)", borderTop: "2px solid #8b2020", borderRadius: "50%", animation: "spin 0.9s linear infinite" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  /* ── GUARDIAN GATE ───────────────────────────────────── */
  if (phase === "guardian") {
    return (
      <div style={{ minHeight: "100vh", background: pageBg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div style={{ width: 68, height: 68, borderRadius: "50%", background: "radial-gradient(circle at 35% 30%,#c41e3a,#8b2020 55%,#5c1616)", boxShadow: "0 0 48px rgba(139,32,32,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px", marginBottom: 28, animation: "floatSeal 3s ease-in-out infinite" }}>
          ❤️
        </div>
        <p style={{ fontFamily: "'Crimson Pro',serif", fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(212,165,116,0.38)", marginBottom: 10 }}>Guardian Question</p>
        <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, color: "rgba(250,248,245,0.85)", textAlign: "center", maxWidth: 380, marginBottom: 32, lineHeight: 1.5 }}>
          {letter?.question || "Only the one who truly knows can open this."}
        </p>
        <div style={{ width: "100%", maxWidth: 340, display: "flex", flexDirection: "column", gap: 10, animation: guardianError ? "shake 0.4s ease" : "none" }}>
          <input type="text" value={guardianAnswer}
            onChange={e => setGuardianAnswer(e.target.value)}
            onKeyDown={e => e.key === "Enter" && submitGuardian()}
            placeholder="Your answer..."
            style={{ background: "rgba(18,8,8,0.85)", border: `1px solid ${guardianError ? "rgba(196,30,58,0.7)" : "rgba(212,165,116,0.15)"}`, borderRadius: 8, padding: "14px 18px", fontFamily: "'Crimson Pro',serif", fontSize: 17, color: "rgba(250,248,245,0.9)", outline: "none", textAlign: "center" }}
          />
          {guardianError && <p style={{ fontFamily: "'Crimson Pro',serif", fontSize: 14, color: "rgba(196,30,58,0.7)", textAlign: "center" }}>That's not quite right.</p>}
          <button onClick={submitGuardian} disabled={guardianLoading}
            style={{ background: "#8b2020", border: "none", borderRadius: 8, padding: "13px 24px", color: "rgba(245,240,230,0.92)", fontFamily: "'Crimson Pro',serif", fontSize: 15, fontWeight: 600, cursor: "pointer", opacity: guardianLoading ? 0.6 : 1 }}>
            {guardianLoading ? "Checking..." : "Unlock →"}
          </button>
        </div>
        <style>{`@keyframes floatSeal{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}} @keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-7px)}40%{transform:translateX(7px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}`}</style>
      </div>
    );
  }

  /* ── SEALED ──────────────────────────────────────────── */
  if (phase === "sealed") {
    const env = getEnvelopeStyle(letter?.envelope || "Classic Wax");
    const CIRC = 239;
    const dashOffset = CIRC - (holdProgress / 100) * CIRC;

    return (
      <div style={{ minHeight: "100vh", background: pageBg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", userSelect: "none" }}
        onMouseUp={stopHold} onTouchEnd={stopHold} onMouseLeave={stopHold}>

        {letter?.title && (
          <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, color: "rgba(250,248,245,0.82)", marginBottom: 4, textAlign: "center", padding: "0 1rem" }}>{letter.title}</p>
        )}
        <p style={{ fontFamily: "'Crimson Pro',serif", fontSize: 13, fontStyle: "italic", color: "rgba(250,248,245,0.22)", marginBottom: 28 }}>hold to unseal</p>

        {/* Envelope illustration */}
        <div onMouseDown={startHold} onTouchStart={startHold}
          style={{ cursor: "pointer", width: 196, height: 126, position: "relative", filter: isHolding ? "brightness(1.1)" : "brightness(1)", transition: "filter 0.1s" }}>
          <div style={{ position: "absolute", inset: 0, background: env.bodyBg, borderRadius: 5, boxShadow: "0 16px 56px rgba(0,0,0,0.75), 0 2px 8px rgba(0,0,0,0.4)" }} />
          {/* Flap */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 63, background: env.flapBg, borderRadius: "5px 5px 0 0", clipPath: "polygon(0 0,100% 0,50% 65%)" }} />
          {/* Silk ribbon */}
          {env.isRibbon ? (
            <>
              <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 12, background: "#c84078", transform: "translateY(-50%)", boxShadow: "0 1px 6px rgba(0,0,0,0.2)" }} />
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", fontSize: 26 }}>🎀</div>
            </>
          ) : env.sealBg !== "transparent" ? (
            <div style={{
              position: "absolute", top: "50%", left: "50%",
              transform: `translate(-50%, -38%) scale(${isHolding ? 1.1 : 1})`,
              transition: "transform 0.15s, box-shadow 0.15s",
              width: 54, height: 54, borderRadius: "50%",
              background: env.sealBg,
              boxShadow: `0 0 ${isHolding ? 28 : 16}px rgba(196,30,58,0.5), 0 4px 16px rgba(0,0,0,0.5)`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px",
            }}>{env.sealIcon}</div>
          ) : null}
        </div>

        {/* Progress ring */}
        <div style={{ marginTop: 22, position: "relative", width: 56, height: 56, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="56" height="56" viewBox="0 0 90 90" style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
            <circle cx="45" cy="45" r="38" fill="none" stroke="rgba(212,165,116,0.07)" strokeWidth="3" />
            <circle cx="45" cy="45" r="38" fill="none" stroke={holdProgress > 0 ? "#8b2020" : "transparent"}
              strokeWidth="3" strokeDasharray={CIRC} strokeDashoffset={dashOffset} strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 0.04s linear" }}
            />
          </svg>
          <span style={{ fontFamily: "'Crimson Pro',serif", fontSize: 10, color: holdProgress > 0 ? "rgba(212,165,116,0.55)" : "rgba(250,248,245,0.15)" }}>
            {holdProgress > 0 ? `${holdProgress}%` : "0%"}
          </span>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  /* ── UNFOLDING ───────────────────────────────────────── */
  if (phase === "unfolding") {
    return (
      <div style={{ minHeight: "100vh", background: pageBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: "rgba(18,8,8,0.92)", border: "1px solid rgba(212,165,116,0.07)", borderRadius: 10, padding: "28px 36px", width: 300 }}>
          {[75, 58, 42, 65].map((w, i) => (
            <div key={i} style={{ height: 10, borderRadius: 5, background: "rgba(212,165,116,0.08)", width: `${w}%`, marginBottom: 10, animation: `pulse 1.2s ease-in-out ${i * 0.18}s infinite` }} />
          ))}
          <p style={{ fontFamily: "'Crimson Pro',serif", fontSize: 13, fontStyle: "italic", color: "rgba(212,165,116,0.3)", textAlign: "center", marginTop: 6 }}>unfolding...</p>
        </div>
        <style>{`@keyframes pulse{0%,100%{opacity:0.35}50%{opacity:0.75}}`}</style>
      </div>
    );
  }

  /* ── REVEALED ────────────────────────────────────────── */
  const card = getThemeCard(letter?.theme || "Classic Burgundy");
  const bodyFont = FONT_MAP[letter?.font || "Classic"] || FONT_MAP.Classic;
  const sigColor = card.isBright ? "rgba(42,21,10,0.55)" : "rgba(212,165,116,0.6)";

  // Sleek background for Classic Burgundy matching the reference screenshot:
  const cardBg = card.isBright ? card.bg : "radial-gradient(ellipse at 85% 15%, #2c0c13 0%, #16060a 45%, #0b0305 100%)";

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg, #14070a 0%, #0c0406 100%)",
      padding: "36px 16px 120px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 20,
    }}>

      {/* ── LETTER CARD (Exact Match to openwhen.cards/r/lpp97pyi) ── */}
      <div style={{
        width: "100%", maxWidth: 580,
        background: cardBg,
        border: "1px solid rgba(255, 215, 180, 0.08)",
        borderRadius: 16, padding: "36px 36px 28px",
        position: "relative", overflow: "hidden",
        boxShadow: "0 20px 60px rgba(0,0,0,0.85), 0 2px 10px rgba(0,0,0,0.4)",
        animation: "revealCard 0.7s cubic-bezier(0.22,1,0.36,1)",
      }}>
        {letter?.theme === "Midnight Stars" && <MidnightStarsOverlay />}

        {/* Falling hearts overlay */}
        {letter?.theme === "Falling Hearts" && (
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
            {["💕","❤️","🩷","💗"].map((h, i) => (
              <div key={i} style={{ position: "absolute", left: `${15 + i * 22}%`, top: `${8 + i * 14}%`, fontSize: 11, opacity: 0.22, animation: `floatHeart ${3 + i * 0.5}s ease-in-out ${i * 0.4}s infinite` }}>{h}</div>
            ))}
          </div>
        )}

        {/* Top-Left Bird / Note Ornament (Matching reference screenshot) */}
        <div style={{ position: "absolute", top: 18, left: 20, zIndex: 2, userSelect: "none", opacity: 0.4, color: "rgba(212, 165, 116, 0.85)" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
          </svg>
        </div>

        {/* Sticker */}
        {letter?.sticker && (
          <div style={{ position: "absolute", top: 14, right: 20, fontSize: 36, zIndex: 2, filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.3))", animation: "stickerPop 0.4s cubic-bezier(0.34,1.56,0.64,1) 0.5s both" }}>
            {letter.sticker}
          </div>
        )}

        {/* Title (Centered, serif font) */}
        {letter?.title && (
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 24, fontWeight: 500, color: card.textColor, marginBottom: 28, lineHeight: 1.35, position: "relative", zIndex: 2, textAlign: "center" }}>
            {letter.title}
          </h1>
        )}

        {/* Message (Left-aligned) */}
        <div style={{ fontFamily: bodyFont, fontSize: 16, color: card.textColor, lineHeight: 1.8, whiteSpace: "pre-wrap", position: "relative", zIndex: 2 }}>
          {letter?.message || ""}
        </div>

        {/* Signature & Bottom-Right Ornament */}
        {letter?.signature && (
          <div style={{ textAlign: "right", marginTop: 28, position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            <p style={{ fontFamily: "'Crimson Pro',serif", fontSize: 14, fontStyle: "italic", color: sigColor, margin: "0 0 2px" }}>
              — {letter.signature}
            </p>
            <div style={{ opacity: 0.35, color: "rgba(212, 165, 116, 0.8)", marginTop: 2 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* ── EMOJI REACTIONS (Exact Match to openwhen.cards) ── */}
      <div style={{ textAlign: "center", marginTop: 4, marginBottom: 2 }}>
        <p style={{ fontFamily: "'Crimson Pro',serif", fontSize: 12, color: "rgba(250,248,245,0.3)", marginBottom: 10, letterSpacing: "0.02em" }}>
          how did this make you feel?
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          {[
            { emoji: "❤️", label: "love it", activeBg: "radial-gradient(circle at 35% 35%, #e42038 0%, #8b1820 60%, #4a0810 100%)", glow: "0 0 14px rgba(228, 32, 56, 0.5)" },
            { emoji: "😂", label: "made me laugh", activeBg: "radial-gradient(circle at 35% 35%, #f4a020 0%, #a86810 60%, #5a3408 100%)", glow: "0 0 14px rgba(244, 160, 32, 0.5)" },
            { emoji: "🥰", label: "so sweet", activeBg: "radial-gradient(circle at 35% 35%, #e85090 0%, #a02860 60%, #501030 100%)", glow: "0 0 14px rgba(232, 80, 144, 0.5)" },
            { emoji: "😳", label: "speechless", activeBg: "radial-gradient(circle at 35% 35%, #e07030 0%, #904018 60%, #4a1e0a 100%)", glow: "0 0 14px rgba(224, 112, 48, 0.5)" },
          ].map(({ emoji, label, activeBg, glow }) => {
            const isSelected = reaction === emoji;
            return (
              <button
                key={emoji}
                onClick={() => {
                  setReaction(emoji);
                  try {
                    confetti({
                      particleCount: emoji === "❤️" ? 35 : 25,
                      spread: 50,
                      origin: { y: 0.65 },
                      colors: emoji === "❤️" ? ['#e42038', '#8b1820', '#ff6080'] : undefined,
                    });
                  } catch {
                    // fallback
                  }
                  fetch(`/api/letters/${id}/react`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ reaction: emoji }),
                  }).catch(() => {});
                }}
                style={{
                  width: 38, height: 38, borderRadius: "50%",
                  background: isSelected ? activeBg : "rgba(24, 10, 14, 0.8)",
                  border: `1px solid ${isSelected ? "rgba(255,255,255,0.2)" : "rgba(255, 215, 180, 0.08)"}`,
                  cursor: "pointer", fontSize: 17,
                  transition: "all 0.18s ease",
                  transform: isSelected ? "scale(1.12)" : "scale(1)",
                  boxShadow: isSelected ? glow : "none",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                {emoji}
              </button>
            );
          })}
        </div>

        {/* Reaction Label below buttons (matching 'love it' in reference screenshot) */}
        <div style={{ minHeight: 18, marginTop: 6 }}>
          {reaction && (
            <span style={{
              fontFamily: "'Crimson Pro', Georgia, serif",
              fontSize: 12,
              fontStyle: "italic",
              color: "rgba(212, 165, 116, 0.7)",
              animation: "fadeIn 0.2s ease",
            }}>
              {reaction === "❤️" && "love it"}
              {reaction === "😂" && "made me laugh"}
              {reaction === "🥰" && "so sweet"}
              {reaction === "😳" && "speechless"}
            </span>
          )}
        </div>
      </div>

      {/* ── THEY'D LOVE TO HEAR BACK (Exact Pixel Replica) ── */}
      <div style={{
        width: "100%", maxWidth: 580,
        background: "#100508",
        border: "1px solid rgba(255, 215, 180, 0.08)",
        borderRadius: 20, padding: "36px 28px 28px",
        textAlign: "center",
        boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
      }}>
        {/* Red Wax Seal Circle */}
        <div style={{
          width: 56, height: 56, borderRadius: "50%",
          background: "radial-gradient(circle at 35% 30%, #e42038 0%, #8b1420 60%, #4a0810 100%)",
          boxShadow: "0 0 30px rgba(228, 32, 56, 0.5), 0 8px 20px rgba(0,0,0,0.6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "24px", color: "#ffffff",
          margin: "0 auto 20px",
        }}>
          ❤
        </div>

        <h3 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 22, fontWeight: 500, color: "#faf8f5",
          margin: "0 0 6px",
        }}>
          They'd love to hear back
        </h3>

        <p style={{
          fontFamily: "'Crimson Pro',serif",
          fontSize: 14, fontStyle: "italic",
          color: "rgba(250, 248, 245, 0.45)",
          margin: "0 0 24px",
        }}>
          Write something back — it only takes a moment
        </p>

        {/* Crimson Action Button */}
        <Link href="/create" style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          width: "100%", padding: "15px",
          background: "linear-gradient(180deg, #9e2430 0%, #761822 100%)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          borderRadius: 12,
          fontFamily: "'Crimson Pro', serif", fontSize: 16, fontWeight: 600,
          color: "#faf8f5", textDecoration: "none",
          boxShadow: "0 6px 24px rgba(158, 36, 48, 0.4)",
          transition: "all 0.2s ease",
        }}>
          <span style={{ fontSize: 18 }}>✉</span> Seal a Message Back
        </Link>

      </div>

      {/* ── 2-BUTTON SHARE ROW (Only share link and copy link) ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, width: "100%", maxWidth: 580 }}>
        {/* Share link */}
        <button
          onClick={() => navigator.share?.({ url: window.location.href }) ?? navigator.clipboard.writeText(window.location.href)}
          style={{
            background: "#100508",
            border: "1px solid rgba(212, 165, 116, 0.15)",
            borderRadius: 14, padding: "16px 10px",
            cursor: "pointer", fontFamily: "'Crimson Pro', serif",
            fontSize: 13.5, fontWeight: 500, color: "#d4a574",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            transition: "all 0.18s ease",
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(212, 165, 116, 0.35)")}
          onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(212, 165, 116, 0.15)")}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
          <span>share link</span>
        </button>

        {/* Copy link */}
        <button
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            setCopiedLink(true);
            setTimeout(() => setCopiedLink(false), 2000);
          }}
          style={{
            background: "#100508",
            border: "1px solid rgba(212, 165, 116, 0.15)",
            borderRadius: 14, padding: "16px 10px",
            cursor: "pointer", fontFamily: "'Crimson Pro', serif",
            fontSize: 13.5, fontWeight: 500, color: "#d4a574",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            transition: "all 0.18s ease",
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(212, 165, 116, 0.35)")}
          onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(212, 165, 116, 0.15)")}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
          <span>{copiedLink ? "copied!" : "copy link"}</span>
        </button>
      </div>

      <p style={{ fontFamily: "'Crimson Pro',serif", fontSize: 11, color: "rgba(250,248,245,0.12)", marginTop: 8, letterSpacing: "0.05em" }}>
        made with send letter
      </p>

      {/* Song bar with real audio player */}
      {letter?.song && (
        <SongPlayer
          song={letter.song}
          songArtist={letter.songArtist}
          songArtwork={letter.songArtwork}
          songPreviewUrl={letter.songPreviewUrl}
        />
      )}

      <style>{`
        @keyframes revealCard { from{opacity:0;transform:translateY(24px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes stickerPop { from{transform:scale(0) rotate(-20deg)} to{transform:scale(1) rotate(0deg)} }
        @keyframes twinkle { 0%,100%{opacity:0.3} 50%{opacity:0.9} }
        @keyframes floatHeart { 0%,100%{transform:translateY(0) rotate(-5deg)} 50%{transform:translateY(-12px) rotate(5deg)} }
        @keyframes floatSeal { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes pulse { 0%,100%{opacity:0.35} 50%{opacity:0.75} }
        @keyframes spin { to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
}
