"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
// @ts-ignore
import confetti from "canvas-confetti";
import UnsealParticles from "@/components/UnsealParticles";
import { generateOrigamiPDF } from "@/lib/pdfGenerator";
import { ambientEngine } from "@/lib/ambientAudio";

interface LetterData {
  id: string;
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
  difficulty: string;
  guardianType: string;
  question?: string;
  unlockAt?: string | null;
  ambientSoundscape?: string | null;
  replyToId?: string | null;
  replyLetterId?: string | null;
  openingStyle?: 'wax-seal' | 'envelope-unfold';
  letterTheme?: string;
  hasGuardian: boolean;
}

type Phase = "loading" | "timelock" | "guardian" | "sealed" | "unfolding" | "envelope" | "envelope-opening" | "revealed" | "burned";

/* ── Font map ─────────────────────────────── */
const FONT_MAP: Record<string, string> = {
  Classic: "Georgia, 'Times New Roman', serif",
  Flowing: "'Dancing Script', cursive",
  Elegant: "Georgia, 'Times New Roman', serif",
  Casual:  "'Caveat', cursive",
  Retro:   "'Pacifico', cursive",
};

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

/* ── Voice Note Cassette Player ──────────────── */
function VoiceNotePlayer({ voiceUrl, duration }: { voiceUrl: string; duration?: number }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const audio = new Audio(voiceUrl);
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
        setCurrentTime(Math.floor(audio.currentTime));
      }
    };

    const handleEnded = () => {
      setPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.pause();
    };
  }, [voiceUrl]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setPlaying(true);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        marginTop: 28,
        zIndex: 2,
      }}
    >
      <button
        onClick={togglePlay}
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: '#2c2c2c',
          color: '#f7f1e3',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          fontSize: 14,
          flexShrink: 0,
        }}
      >
        {playing ? '❚❚' : '▶'}
      </button>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 15, color: '#2c2c2c', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
            <span>🎙️</span> Voice Message
          </span>
          <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 13, color: 'rgba(44,44,44,0.6)' }}>
            {formatTime(currentTime)} / {formatTime(duration || 30)}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 18, overflow: 'hidden' }}>
          {Array.from({ length: 26 }).map((_, i) => {
            const barProgress = (i / 26) * 100;
            const isPassed = progress >= barProgress;
            const randomH = ((i * 17 + 7) % 13) + 5;
            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: playing ? `${randomH + (Math.sin(i + currentTime * 8) * 4)}px` : `${randomH}px`,
                  background: isPassed ? '#2c2c2c' : 'rgba(0,0,0,0.12)',
                  borderRadius: 1,
                  transition: 'height 0.1s ease, background 0.2s ease',
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── Web Audio Ambient Soundscapes Player ─────── */
function AmbientSoundscapePlayer({ soundscape }: { soundscape: string }) {
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!soundscape || soundscape === 'none') {
      ambientEngine.stop();
      return;
    }

    ambientEngine.start(soundscape, 0.22);

    return () => {
      ambientEngine.stop();
    };
  }, [soundscape]);

  function toggleMute() {
    if (playing) {
      ambientEngine.stop();
      setPlaying(false);
    } else {
      ambientEngine.start(soundscape, 0.22);
      setPlaying(true);
    }
  }

  const icons: Record<string, string> = {
    rain: '🌧️ Gentle Rain',
    fireplace: '🔥 Crackling Fireplace',
    vinyl: '📻 Warm Vinyl',
    crickets: '🌙 Night Crickets',
    coffeehouse: '☕ Coffeehouse',
  };

  return (
    <button
      onClick={toggleMute}
      title={playing ? "Mute Ambient Soundscape" : "Play Ambient Soundscape"}
      style={{
        position: 'fixed',
        bottom: 74,
        right: 18,
        background: 'rgba(15, 16, 18, 0.85)',
        border: '1px solid rgba(247, 241, 227, 0.15)',
        borderRadius: 20,
        padding: '6px 14px',
        color: playing ? '#f7f1e3' : 'rgba(247,241,227,0.4)',
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontSize: 14,
        cursor: 'pointer',
        backdropFilter: 'blur(10px)',
        zIndex: 99,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
      }}
    >
      <span>{icons[soundscape] || '🌿 Ambient'}</span>
      <span style={{ fontSize: 11 }}>{playing ? '🔊' : '🔇'}</span>
    </button>
  );
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
      background: 'rgba(15, 16, 18, 0.96)',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      zIndex: 100,
    }}>
      <div style={{ height: 2, background: 'rgba(255,255,255,0.06)', position: 'relative' }}>
        <div style={{
          position: 'absolute', left: 0, top: 0, height: '100%',
          width: `${progress}%`,
          background: 'linear-gradient(90deg, #8b2020, #c41e3a)',
          transition: 'width 0.5s linear',
        }} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px' }}>
        {songArtwork ? (
          <img
            src={songArtwork}
            alt=""
            style={{ width: 38, height: 38, borderRadius: 4, objectFit: 'cover', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.5)' }}
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <div style={{ width: 38, height: 38, borderRadius: 4, background: 'rgba(139,32,32,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>♫</div>
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, color: '#f7f1e3', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{song}</p>
          {songArtist && <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 13, color: 'rgba(247,241,227,0.45)', margin: 0 }}>{songArtist}</p>}
        </div>

        {duration > 0 && (
          <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 12, color: 'rgba(247,241,227,0.4)', flexShrink: 0 }}>
            {fmtTime(elapsed)} / {fmtTime(duration)}
          </span>
        )}

        {songPreviewUrl && (
          <button
            onClick={togglePlay}
            title={playing ? 'Pause' : blocked ? 'Tap to play' : 'Play'}
            style={{
              width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
              background: playing ? 'rgba(139,32,32,0.5)' : 'rgba(196,30,58,0.85)',
              border: '1px solid rgba(196,30,58,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#fff', fontSize: 14,
              transition: 'all 0.2s',
            }}
          >
            {playing ? '❚❚' : '▶'}
          </button>
        )}

        {blocked && !playing && (
          <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 12, color: '#f7f1e3', flexShrink: 0 }}>tap ▶ to play</span>
        )}
      </div>
    </div>
  );
}

/* ── Export Keepsake Function (Luxury Artisan Kraft Paper Canvas Renderer) ── */
function downloadKeepsake(letter: LetterData) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Helper: draw rounded rectangle
  const roundRect = (
    c: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    radius: number
  ) => {
    c.beginPath();
    c.moveTo(x + radius, y);
    c.lineTo(x + w - radius, y);
    c.quadraticCurveTo(x + w, y, x + w, y + radius);
    c.lineTo(x + w, y + h - radius);
    c.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    c.lineTo(x + radius, y + h);
    c.quadraticCurveTo(x, y + h, x, y + h - radius);
    c.lineTo(x, y + radius);
    c.quadraticCurveTo(x, y, x + radius, y);
    c.closePath();
  };

  // Helper: wrap text into lines
  const wrapText = (
    c: CanvasRenderingContext2D,
    text: string,
    maxWidth: number
  ): string[] => {
    const words = text.split(/\s+/);
    const lines: string[] = [];
    let currentLine = '';

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = c.measureText(testLine);
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  };

  const renderCanvas = (imgObj?: HTMLImageElement) => {
    const hasPhoto = !!imgObj;

    if (hasPhoto) {
      // ══════════════════════════════════════════════════════════════════════════
      // LAYOUT WITH PHOTO: Luxury Dark Studio Desk + Kraft Sheet + Vintage Polaroid
      // ══════════════════════════════════════════════════════════════════════════
      const rawAspect = imgObj.width / imgObj.height || 1.4;
      const polaroidCardW = 760;
      const polaroidPad = 26;
      const photoInsideW = polaroidCardW - polaroidPad * 2;
      const photoInsideH = Math.min(540, Math.max(380, Math.round(photoInsideW / Math.max(1.15, Math.min(1.8, rawAspect)))));
      const polaroidBottomPad = 80;
      const polaroidCardH = polaroidPad + photoInsideH + polaroidBottomPad;

      const paperX = 110;
      const paperY = 80;
      const paperW = 980;
      const paperH = 1080;

      const polaroidX = (1200 - polaroidCardW) / 2;
      const polaroidY = paperY + paperH + 70;

      canvas.width = 1200;
      canvas.height = polaroidY + polaroidCardH + 110;

      // 1. Dark Espresso Studio Desk Background
      ctx.fillStyle = '#0d0c0a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Subtle ambient vignette gradient
      const deskGrad = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        200,
        canvas.width / 2,
        canvas.height / 2,
        canvas.height * 0.8
      );
      deskGrad.addColorStop(0, 'rgba(28, 24, 20, 0.4)');
      deskGrad.addColorStop(1, 'rgba(0, 0, 0, 0.85)');
      ctx.fillStyle = deskGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // ── 1. THE REAL LUXURY IVORY PAPER SHEET (TOP) ──
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 44;
      ctx.shadowOffsetY = 18;
      roundRect(ctx, paperX, paperY, paperW, paperH, 6);
      ctx.fillStyle = '#fcf8f2'; // Luxury Ivory tone
      ctx.fill();
      ctx.restore();

      // Subtle textured artisan fiber pattern inside paper
      ctx.save();
      roundRect(ctx, paperX, paperY, paperW, paperH, 6);
      ctx.clip();

      ctx.fillStyle = 'rgba(38, 31, 24, 0.035)';
      for (let x = paperX; x <= paperX + paperW; x += 14) {
        for (let y = paperY; y <= paperY + paperH; y += 14) {
          ctx.beginPath();
          ctx.arc(x + ((y % 28 === 0) ? 7 : 0), y, 0.9, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();

      // Dual Archival Stationery Filigree Border
      ctx.strokeStyle = '#c8b8a3';
      ctx.lineWidth = 2;
      ctx.strokeRect(paperX + 22, paperY + 22, paperW - 44, paperH - 44);

      ctx.strokeStyle = 'rgba(166, 149, 124, 0.45)';
      ctx.lineWidth = 1;
      ctx.strokeRect(paperX + 28, paperY + 28, paperW - 56, paperH - 56);

      // Corner Diamond Accents
      const cornerInset = 25;
      const corners = [
        [paperX + cornerInset, paperY + cornerInset],
        [paperX + paperW - cornerInset, paperY + cornerInset],
        [paperX + cornerInset, paperY + paperH - cornerInset],
        [paperX + paperW - cornerInset, paperY + paperH - cornerInset],
      ];
      ctx.fillStyle = '#a6957c';
      corners.forEach(([cx, cy]) => {
        ctx.beginPath();
        ctx.moveTo(cx, cy - 4);
        ctx.lineTo(cx + 4, cy);
        ctx.lineTo(cx, cy + 4);
        ctx.lineTo(cx - 4, cy);
        ctx.closePath();
        ctx.fill();
      });

      // 3D Artisan Wax Seal at Top
      const sealX = paperX + paperW / 2;
      const sealY = paperY + 80;

      // Outer Wax Ripple with shadow
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
      ctx.shadowBlur = 12;
      ctx.shadowOffsetY = 6;
      const outerSealGrad = ctx.createRadialGradient(sealX - 10, sealY - 10, 5, sealX, sealY, 40);
      outerSealGrad.addColorStop(0, '#a8242e');
      outerSealGrad.addColorStop(0.7, '#8b1820');
      outerSealGrad.addColorStop(1, '#560e14');
      ctx.fillStyle = outerSealGrad;
      ctx.beginPath();
      ctx.arc(sealX, sealY, 38, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Inner Seal Crest Bevel
      const innerSealGrad = ctx.createRadialGradient(sealX - 8, sealY - 8, 2, sealX, sealY, 28);
      innerSealGrad.addColorStop(0, '#ba2e38');
      innerSealGrad.addColorStop(1, '#6b1016');
      ctx.fillStyle = innerSealGrad;
      ctx.beginPath();
      ctx.arc(sealX, sealY, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 235, 205, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Envelope Emblem
      ctx.fillStyle = '#fdf8f0';
      ctx.font = '24px serif';
      ctx.textAlign = 'center';
      ctx.fillText('✉', sealX, sealY + 8);

      // Centered Title in Deep Sepia Ink
      ctx.fillStyle = '#2a1e17';
      ctx.font = '700 40px "Playfair Display", serif';
      ctx.textAlign = 'center';
      ctx.fillText((letter.title || 'A Letter For You').toUpperCase(), sealX, paperY + 165);

      // Decorative Filigree Divider below Title
      ctx.strokeStyle = 'rgba(166, 149, 124, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(sealX - 120, paperY + 195);
      ctx.lineTo(sealX - 25, paperY + 195);
      ctx.moveTo(sealX + 25, paperY + 195);
      ctx.lineTo(sealX + 120, paperY + 195);
      ctx.stroke();

      ctx.fillStyle = '#8a7561';
      ctx.font = 'italic 16px "Playfair Display", serif';
      ctx.fillText('№ 01', sealX, paperY + 200);

      // Message Lines in Deep Espresso Ink
      ctx.fillStyle = '#3a2d24';
      ctx.font = '30px "Crimson Pro", "Georgia", serif';
      ctx.textAlign = 'left';

      const maxTextWidth = paperW - 160;
      const textLines = wrapText(ctx, letter.message || '', maxTextWidth);
      const lineHeight = 46;
      let startTextY = paperY + 260;
      const maxTextY = paperY + paperH - 140;

      for (let n = 0; n < textLines.length; n++) {
        if (startTextY > maxTextY) break;
        ctx.fillText(textLines[n], paperX + 80, startTextY);
        startTextY += lineHeight;
      }

      // ── SIGNATURE AT BOTTOM RIGHT ──
      if (letter.signature) {
        ctx.fillStyle = '#8b1820';
        ctx.font = 'italic 32px "Playfair Display", serif';
        ctx.textAlign = 'right';
        ctx.fillText(`— ${letter.signature}`, paperX + paperW - 80, paperY + paperH - 70);
      }

      // ── 2. ATTACHED VINTAGE POLAROID KEEPSAKE (OUTSIDE & BELOW LETTER) ──
      const polaroidCenterCX = polaroidX + polaroidCardW / 2;
      const polaroidCenterCY = polaroidY + polaroidCardH / 2;

      ctx.save();
      // Slight -1.8deg organic tilt
      ctx.translate(polaroidCenterCX, polaroidCenterCY);
      ctx.rotate(-0.026);
      ctx.translate(-polaroidCenterCX, -polaroidCenterCY);

      // Polaroid Paper Shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
      ctx.shadowBlur = 48;
      ctx.shadowOffsetY = 20;

      // Polaroid White/Ivory Card
      roundRect(ctx, polaroidX, polaroidY, polaroidCardW, polaroidCardH, 6);
      ctx.fillStyle = '#fdfbf7';
      ctx.fill();

      // Hairline border
      ctx.shadowColor = 'transparent';
      ctx.strokeStyle = 'rgba(200, 184, 163, 0.65)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Washi Tape Accent at Top Center
      ctx.save();
      ctx.fillStyle = 'rgba(212, 165, 116, 0.55)';
      roundRect(ctx, polaroidCenterCX - 65, polaroidY - 14, 130, 30, 3);
      ctx.fill();
      ctx.restore();

      // Photo inside Polaroid
      const photoInsideX = polaroidX + polaroidPad;
      const photoInsideY = polaroidY + polaroidPad;

      ctx.save();
      roundRect(ctx, photoInsideX, photoInsideY, photoInsideW, photoInsideH, 3);
      ctx.clip();

      const imgAspect = imgObj.width / imgObj.height;
      const boxAspect = photoInsideW / photoInsideH;
      let drawW = photoInsideW;
      let drawH = photoInsideH;
      let drawX = photoInsideX;
      let drawY = photoInsideY;

      if (imgAspect > boxAspect) {
        drawW = photoInsideH * imgAspect;
        drawX = photoInsideX + (photoInsideW - drawW) / 2;
      } else {
        drawH = photoInsideW / imgAspect;
        drawY = photoInsideY + (photoInsideH - drawH) / 2;
      }

      ctx.drawImage(imgObj, drawX, drawY, drawW, drawH);
      ctx.restore();

      // Photo inner border
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.lineWidth = 1;
      roundRect(ctx, photoInsideX, photoInsideY, photoInsideW, photoInsideH, 3);
      ctx.stroke();

      // Handwritten Cursive Caption under Polaroid Photo
      let captionTextToDraw = "A photo that says what words can't";
      if (letter.photo) {
        try {
          if (letter.photo.startsWith('{')) {
            const parsed = JSON.parse(letter.photo);
            if (parsed.caption && parsed.caption.trim()) {
              captionTextToDraw = parsed.caption.trim();
            }
          }
        } catch {
          // fallback
        }
      }

      ctx.fillStyle = '#3a2d24';
      ctx.font = '600 32px "Dancing Script", cursive';
      ctx.textAlign = 'center';
      ctx.fillText(`“${captionTextToDraw}”`, polaroidCenterCX, photoInsideY + photoInsideH + 52);

      ctx.restore();

      // Footer
      ctx.fillStyle = 'rgba(223, 210, 190, 0.45)';
      ctx.font = '14px "Georgia", serif';
      ctx.textAlign = 'center';
      ctx.fillText('SEALED WITH SEND LETTER · EST. 2026', 600, canvas.height - 35);

    } else {
      // ══════════════════════════════════════════════════════════════════════════
      // LAYOUT WITHOUT PHOTO: Elevated Tactile Kraft Stationery Sheet on Desk
      // ══════════════════════════════════════════════════════════════════════════
      canvas.width = 1200;
      canvas.height = 1540;

      // 1. Dark Espresso Studio Desk Background
      ctx.fillStyle = '#0c0b09';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Subtle ambient vignette gradient
      const deskGrad = ctx.createRadialGradient(
        600,
        770,
        250,
        600,
        770,
        1000
      );
      deskGrad.addColorStop(0, 'rgba(32, 28, 22, 0.45)');
      deskGrad.addColorStop(1, 'rgba(0, 0, 0, 0.9)');
      ctx.fillStyle = deskGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const paperX = 90;
      const paperY = 70;
      const paperW = 1020;
      const paperH = 1380;

      // 2. Real Kraft Paper Sheet with High-end Ambient Drop Shadow
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
      ctx.shadowBlur = 48;
      ctx.shadowOffsetY = 20;
      roundRect(ctx, paperX, paperY, paperW, paperH, 6);
      ctx.fillStyle = '#fcf8f2'; // Luxury Ivory paper
      ctx.fill();
      ctx.restore();

      // 3. Subtle artisan texture dots inside paper
      ctx.save();
      roundRect(ctx, paperX, paperY, paperW, paperH, 6);
      ctx.clip();

      ctx.fillStyle = 'rgba(38, 31, 24, 0.035)';
      for (let x = paperX; x <= paperX + paperW; x += 14) {
        for (let y = paperY; y <= paperY + paperH; y += 14) {
          ctx.beginPath();
          ctx.arc(x + ((y % 28 === 0) ? 7 : 0), y, 0.9, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();

      // 4. Dual Archival Stationery Filigree Frame
      ctx.strokeStyle = '#c8b8a3';
      ctx.lineWidth = 2;
      ctx.strokeRect(paperX + 24, paperY + 24, paperW - 48, paperH - 48);

      ctx.strokeStyle = 'rgba(166, 149, 124, 0.45)';
      ctx.lineWidth = 1;
      ctx.strokeRect(paperX + 32, paperY + 32, paperW - 64, paperH - 64);

      // Corner Diamond Accents
      const cornerInset = 28;
      const corners = [
        [paperX + cornerInset, paperY + cornerInset],
        [paperX + paperW - cornerInset, paperY + cornerInset],
        [paperX + cornerInset, paperY + paperH - cornerInset],
        [paperX + paperW - cornerInset, paperY + paperH - cornerInset],
      ];
      ctx.fillStyle = '#a6957c';
      corners.forEach(([cx, cy]) => {
        ctx.beginPath();
        ctx.moveTo(cx, cy - 4.5);
        ctx.lineTo(cx + 4.5, cy);
        ctx.lineTo(cx, cy + 4.5);
        ctx.lineTo(cx - 4.5, cy);
        ctx.closePath();
        ctx.fill();
      });

      // 5. 3D Artisan Wax Seal at Top
      const sealX = paperX + paperW / 2;
      const sealY = paperY + 95;

      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
      ctx.shadowBlur = 14;
      ctx.shadowOffsetY = 6;
      const outerSealGrad = ctx.createRadialGradient(sealX - 12, sealY - 12, 6, sealX, sealY, 44);
      outerSealGrad.addColorStop(0, '#a8242e');
      outerSealGrad.addColorStop(0.7, '#8b1820');
      outerSealGrad.addColorStop(1, '#560e14');
      ctx.fillStyle = outerSealGrad;
      ctx.beginPath();
      ctx.arc(sealX, sealY, 42, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      const innerSealGrad = ctx.createRadialGradient(sealX - 8, sealY - 8, 2, sealX, sealY, 32);
      innerSealGrad.addColorStop(0, '#ba2e38');
      innerSealGrad.addColorStop(1, '#6b1016');
      ctx.fillStyle = innerSealGrad;
      ctx.beginPath();
      ctx.arc(sealX, sealY, 32, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 235, 205, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#fdf8f0';
      ctx.font = '28px serif';
      ctx.textAlign = 'center';
      ctx.fillText('✉', sealX, sealY + 10);

      // 6. Centered Title in Deep Espresso Ink
      ctx.fillStyle = '#2a1e17';
      ctx.font = '700 44px "Playfair Display", serif';
      ctx.textAlign = 'center';
      ctx.fillText((letter.title || 'A Letter For You').toUpperCase(), sealX, paperY + 195);

      // Decorative Filigree Divider below Title
      ctx.strokeStyle = 'rgba(166, 149, 124, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(sealX - 140, paperY + 230);
      ctx.lineTo(sealX - 30, paperY + 230);
      ctx.moveTo(sealX + 30, paperY + 230);
      ctx.lineTo(sealX + 140, paperY + 230);
      ctx.stroke();

      ctx.fillStyle = '#8a7561';
      ctx.font = 'italic 16px "Playfair Display", serif';
      ctx.fillText('№ 01', sealX, paperY + 235);

      // 7. Message Lines — DYNAMIC BALANCED SPACING
      const maxTextWidth = paperW - 180;
      const rawText = letter.message || '';
      
      // Choose appropriate font size based on text length
      const isShort = rawText.length < 280;
      const fontSize = isShort ? 36 : 32;
      const lineHeight = isShort ? 54 : 48;

      ctx.fillStyle = '#3a2d24';
      ctx.font = `${fontSize}px "Crimson Pro", "Georgia", serif`;
      ctx.textAlign = 'left';

      const textLines = wrapText(ctx, rawText, maxTextWidth);
      const totalTextHeight = textLines.length * lineHeight;

      // Available vertical range for text + signature
      const contentTop = paperY + 295;
      const contentBottom = paperY + paperH - 120;
      const availableHeight = contentBottom - contentTop;

      // When text is short, gracefully center it vertically in the available area
      let curY = contentTop;
      if (isShort && totalTextHeight + 90 < availableHeight) {
        const extraSpace = availableHeight - (totalTextHeight + 90);
        curY = contentTop + Math.min(120, Math.floor(extraSpace * 0.35));
      }

      for (let n = 0; n < textLines.length; n++) {
        ctx.fillText(textLines[n], paperX + 90, curY);
        curY += lineHeight;
      }

      // 8. Signature Permanently at Bottom Right in Crimson Red
      if (letter.signature) {
        ctx.fillStyle = '#8b1820';
        ctx.font = 'italic 34px "Playfair Display", serif';
        ctx.textAlign = 'right';
        ctx.fillText(`— ${letter.signature}`, paperX + paperW - 90, paperY + paperH - 75);
      }

      // 9. Archival Monogram Footer
      ctx.fillStyle = 'rgba(58, 45, 36, 0.35)';
      ctx.font = '13px "Crimson Pro", serif';
      ctx.textAlign = 'center';
      ctx.fillText('SEALED WITH SEND LETTER · EST. 2026', 600, paperY + paperH - 36);
    }

    const link = document.createElement('a');
    link.download = `send-letter-${letter.id || 'keepsake'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  if (letter.photo) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => renderCanvas(img);
    img.onerror = () => renderCanvas();
    img.src = letter.photo;
  } else {
    renderCanvas();
  }
}

/* ── Export Standalone Authentic Polaroid Memory Function ── */
function downloadPolaroidOnly(letter: LetterData) {
  if (!letter.photo) return;

  let photoSrc = letter.photo;
  let photoCaptionText = '';
  try {
    if (letter.photo.startsWith('{')) {
      const parsed = JSON.parse(letter.photo);
      photoSrc = parsed.url || letter.photo;
      photoCaptionText = parsed.caption || '';
    }
  } catch {
    photoSrc = letter.photo;
  }

  if (!photoSrc) return;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const roundRect = (
    c: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    radius: number
  ) => {
    c.beginPath();
    c.moveTo(x + radius, y);
    c.lineTo(x + w - radius, y);
    c.quadraticCurveTo(x + w, y, x + w, y + radius);
    c.lineTo(x + w, y + h - radius);
    c.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    c.lineTo(x + radius, y + h);
    c.quadraticCurveTo(x, y + h, x, y + h - radius);
    c.lineTo(x, y + radius);
    c.quadraticCurveTo(x, y, x + radius, y);
    c.closePath();
  };

  const renderPolaroid = (imgObj: HTMLImageElement) => {
    const rawAspect = imgObj.width / imgObj.height || 1.33;
    const polaroidCardW = 900;
    const polaroidPad = 36;
    const photoInsideW = polaroidCardW - polaroidPad * 2;
    const photoInsideH = Math.min(800, Math.max(520, Math.round(photoInsideW / Math.max(0.85, Math.min(1.7, rawAspect)))));
    const polaroidBottomPad = 140;
    const polaroidCardH = polaroidPad + photoInsideH + polaroidBottomPad;

    const padCanvas = 60;
    canvas.width = polaroidCardW + padCanvas * 2;
    canvas.height = polaroidCardH + padCanvas * 2;

    const polaroidX = padCanvas;
    const polaroidY = padCanvas;
    const polaroidCenterCX = polaroidX + polaroidCardW / 2;

    // 1. Transparent canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    // 2. Realistic Polaroid Soft Shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 18;

    // 3. Crisp Off-White Polaroid Card (#fdfbf7)
    roundRect(ctx, polaroidX, polaroidY, polaroidCardW, polaroidCardH, 8);
    ctx.fillStyle = '#fdfbf7';
    ctx.fill();

    // Subtle hairline border
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = 'rgba(200, 184, 163, 0.65)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 4. Washi Tape Accent at Top Center
    ctx.save();
    ctx.fillStyle = 'rgba(212, 165, 116, 0.6)';
    roundRect(ctx, polaroidCenterCX - 75, polaroidY - 14, 150, 32, 4);
    ctx.fill();
    ctx.restore();

    // 5. Photo rendering inside Polaroid
    const photoInsideX = polaroidX + polaroidPad;
    const photoInsideY = polaroidY + polaroidPad;

    ctx.save();
    roundRect(ctx, photoInsideX, photoInsideY, photoInsideW, photoInsideH, 4);
    ctx.clip();

    const imgAspect = imgObj.width / imgObj.height;
    const boxAspect = photoInsideW / photoInsideH;
    let drawW = photoInsideW;
    let drawH = photoInsideH;
    let drawX = photoInsideX;
    let drawY = photoInsideY;

    if (imgAspect > boxAspect) {
      drawW = photoInsideH * imgAspect;
      drawX = photoInsideX + (photoInsideW - drawW) / 2;
    } else {
      drawH = photoInsideW / imgAspect;
      drawY = photoInsideY + (photoInsideH - drawH) / 2;
    }

    ctx.drawImage(imgObj, drawX, drawY, drawW, drawH);
    ctx.restore();

    // Inner photo border
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.lineWidth = 1;
    roundRect(ctx, photoInsideX, photoInsideY, photoInsideW, photoInsideH, 4);
    ctx.stroke();

    // 6. Handwritten Cursive Caption
    const captionToDraw = photoCaptionText.trim() || '“A memory sealed with love”';
    ctx.fillStyle = '#2c221a';
    ctx.font = '600 32px "Dancing Script", "Caveat", cursive';
    ctx.textAlign = 'center';
    ctx.fillText(captionToDraw, polaroidCenterCX, polaroidY + polaroidPad + photoInsideH + 78);

    // 7. Discreet Est hallmark at bottom right
    ctx.fillStyle = 'rgba(120, 100, 80, 0.45)';
    ctx.font = '12px "Crimson Pro", Georgia, serif';
    ctx.textAlign = 'right';
    ctx.fillText('SEALED WITH SEND LETTER', polaroidX + polaroidCardW - 36, polaroidY + polaroidCardH - 24);

    ctx.restore();

    const link = document.createElement('a');
    link.download = `polaroid-memory-${letter.id || 'photo'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => renderPolaroid(img);
  img.src = photoSrc;
}

/* ═════════════════════════════════════════════════════════════════════════════
   MAIN RECIPIENT COMPONENT
═════════════════════════════════════════════════════════════════════════════ */
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
  const [holdStage, setHoldStage] = useState<'sealed' | 'cracking' | 'opening-flap' | 'sliding-paper' | 'dissolving'>('sealed');
  const [reaction, setReaction] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<{ d: number; h: number; m: number; s: number } | null>(null);
  const [envStage, setEnvStage] = useState<'idle' | 'opening-flap' | 'sliding-paper' | 'dissolving'>('idle');

  // Typewriter Typing States matching reference timeline configuration
  const [typedText, setTypedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const letterContainerRef = useRef<HTMLDivElement | null>(null);
  const typingStartedRef = useRef(false);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const userScrolledUpRef = useRef(false);

  const holdInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const holdStart = useRef(0);
  const HOLD_MS = 2500;

  useEffect(() => {
    if (!id) return;

    let devId = 'anonymous';
    let devType = 'Desktop';
    try {
      if (typeof window !== 'undefined') {
        let stored = localStorage.getItem('ow_dev_id');
        if (!stored) {
          stored = 'dev_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
          localStorage.setItem('ow_dev_id', stored);
        }
        devId = stored;

        const ua = navigator.userAgent || '';
        if (/iPad|Tablet/i.test(ua)) devType = 'iPad / Tablet';
        else if (/iPhone/i.test(ua)) devType = 'iPhone';
        else if (/Android/i.test(ua) && /Mobile/i.test(ua)) devType = 'Android Phone';
        else if (/Android/i.test(ua)) devType = 'Android Tablet';
        else if (/Macintosh|Mac OS/i.test(ua)) devType = 'Mac';
        else if (/Windows/i.test(ua)) devType = 'Windows PC';
        else if (/Linux/i.test(ua)) devType = 'Linux';
        else devType = 'Mobile / Device';
      }
    } catch {}

    fetch(`/api/letters/${id}?devId=${encodeURIComponent(devId)}&devType=${encodeURIComponent(devType)}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) { setPhase("burned"); return; }
        setLetter(data);

        // Check if Time Lock is active
        if (data.unlockAt) {
          const unlockTime = new Date(data.unlockAt).getTime();
          if (unlockTime > Date.now()) {
            setPhase("timelock");
            return;
          }
        }

        if (data.hasGuardian && data.guardianType === "question") {
          setPhase("guardian");
        } else if (data.openingStyle === 'envelope-unfold') {
          setPhase("envelope");
        } else {
          setPhase("sealed");
        }
      })
      .catch(() => setPhase("burned"));
  }, [id]);

  // Live Timer for Time-Lock Phase
  useEffect(() => {
    if (phase !== "timelock" || !letter?.unlockAt) return;
    const interval = setInterval(() => {
      const diff = new Date(letter.unlockAt!).getTime() - Date.now();
      if (diff <= 0) {
        setTimeRemaining(null);
        setPhase(letter.hasGuardian && letter.guardianType === "question" ? "guardian" : (letter.openingStyle === 'envelope-unfold' ? "envelope" : "sealed"));
        clearInterval(interval);
      } else {
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / (1000 * 60)) % 60);
        const s = Math.floor((diff / 1000) % 60);
        setTimeRemaining({ d, h, m, s });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, letter]);

  // Typewriter Engine (Smooth Silent Letter Reveal)
  const startTypewriter = useCallback((fullText: string) => {
    if (typingStartedRef.current) return;
    typingStartedRef.current = true;
    setIsTyping(true);

    const baseDelay = 35;
    let currentIndex = 0;

    const typeNextChar = () => {
      if (currentIndex < fullText.length) {
        const char = fullText[currentIndex];
        currentIndex++;
        setTypedText(fullText.substring(0, currentIndex));

        let delay = baseDelay + (Math.random() * 20 - 10);
        if (char === '.' || char === '!' || char === '?') {
          delay += 240;
        } else if (char === ',' || char === ';' || char === '—') {
          delay += 120;
        } else if (char === '\n') {
          delay += 180;
        }

        typingTimerRef.current = setTimeout(typeNextChar, delay);
      } else {
        setIsTyping(false);
      }
    };

    typeNextChar();
  }, []);

  const skipTyping = useCallback(() => {
    if (isTyping && letter?.message) {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
      setTypedText(letter.message);
      setIsTyping(false);
    }
  }, [isTyping, letter?.message]);

  useEffect(() => {
    if (phase === "revealed" && letter?.message && !typingStartedRef.current) {
      startTypewriter(letter.message);
    }
  }, [phase, letter, startTypewriter]);

  // Keep auto-scrolling during typing unless user scrolled up manually
  useEffect(() => {
    if (isTyping && letterContainerRef.current && !userScrolledUpRef.current) {
      letterContainerRef.current.scrollTop = letterContainerRef.current.scrollHeight;
    }
  }, [typedText, isTyping]);

  /* ── HOLD TO UNSEAL LOGIC ────────────────────────────── */
  const startHold = () => {
    if (phase !== "sealed" || holdStage !== "sealed") return;
    setIsHolding(true);
    holdStart.current = Date.now();
    holdInterval.current = setInterval(() => {
      const elapsed = Date.now() - holdStart.current;
      const pct = Math.min(100, (elapsed / HOLD_MS) * 100);
      setHoldProgress(pct);
      if (pct >= 100) {
        clearInterval(holdInterval.current!);
        setIsHolding(false);
        setPhase("unfolding");
        setHoldStage("cracking");
        fetch(`/api/letters/${id}/unseal`, { method: "POST" }).catch(() => {});

        // 1. Wax fractures and top flap swings open (350ms)
        setTimeout(() => {
          setHoldStage("opening-flap");
        }, 350);

        // 2. Letter starts gliding up out of pocket (950ms)
        setTimeout(() => {
          setHoldStage("sliding-paper");
        }, 950);

        // 3. Envelope dissolves and letter expands (1950ms)
        setTimeout(() => {
          setHoldStage("dissolving");
        }, 1950);

        // 4. Reveal full paper letter & begin typing (2600ms)
        setTimeout(() => {
          setPhase("revealed");
          setHoldStage("sealed");
        }, 2600);
      }
    }, 30);
  };

  const endHold = () => {
    if (phase !== "sealed" || holdStage !== "sealed") return;
    setIsHolding(false);
    setHoldProgress(0);
    if (holdInterval.current) clearInterval(holdInterval.current);
  };

  const submitGuardian = async () => {
    if (!guardianAnswer.trim() || guardianLoading) return;
    setGuardianLoading(true);
    setGuardianError(false);
    try {
      const res = await fetch(`/api/letters/${id}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer: guardianAnswer }),
      });
      const { correct } = await res.json();
      if (correct) {
        setPhase(letter?.openingStyle === 'envelope-unfold' ? "envelope" : "sealed");
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

  /* ── LOADING ─────────────────────────────────────────── */
  if (phase === "loading") {
    return (
      <div style={{ minHeight: "100vh", background: "#0f1012", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 32, height: 32, border: "2px solid rgba(247,241,227,0.2)", borderTop: "2px solid #f7f1e3", borderRadius: "50%", animation: "spin 0.9s linear infinite" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  /* ── BURNED / SELF-DESTRUCTED LETTER GATE ─────────────── */
  if (phase === "burned") {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#080204",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        fontFamily: "'Crimson Pro', serif",
        color: "#faf8f5",
        textAlign: "center",
      }}>
        <div style={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          background: "radial-gradient(circle at 35% 30%, #ff4d4f, #8b1820)",
          boxShadow: "0 0 45px rgba(255,77,79,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "32px",
          marginBottom: 24,
        }}>
          🔥
        </div>

        <p style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 12,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: "#d4a574",
          marginBottom: 10,
        }}>
          Letter Vaporized
        </p>

        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "clamp(26px, 5vw, 36px)",
          color: "#faf8f5",
          maxWidth: 480,
          marginBottom: 16,
          lineHeight: 1.3,
        }}>
          This Letter Was Burned to Ashes
        </h1>

        <p style={{
          color: "rgba(250,248,245,0.65)",
          fontSize: 16,
          maxWidth: 400,
          lineHeight: 1.6,
          marginBottom: 32,
        }}>
          The sender chose to destroy this letter before it could be opened. Its words are lost to time.
        </p>

        <Link
          href="/create"
          style={{
            background: "linear-gradient(135deg, #e42038, #8b1820)",
            color: "#faf8f5",
            padding: "12px 28px",
            borderRadius: 10,
            textDecoration: "none",
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: "0.04em",
            boxShadow: "0 8px 24px rgba(228,32,56,0.4)",
          }}
        >
          ✉ Write a Letter
        </Link>
      </div>
    );
  }

  /* ── TIME LOCK COUNTDOWN GATE ────────────────────────── */
  if (phase === "timelock") {
    return (
      <div style={{ minHeight: "100vh", background: "#0f1012", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "radial-gradient(circle at 35% 30%, #f7f1e3, #d4c8b0 60%, #8c7f68)", boxShadow: "0 0 48px rgba(247,241,227,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "30px", marginBottom: 24, animation: "floatSeal 3s ease-in-out infinite" }}>
          ⏳
        </div>

        <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 13, letterSpacing: "0.35em", textTransform: "uppercase", color: "#f7f1e3", marginBottom: 10 }}>
          Time Locked Letter
        </p>

        <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 32, color: "#f7f1e3", textAlign: "center", maxWidth: 440, marginBottom: 28, lineHeight: 1.3 }}>
          This letter is waiting for its moment
        </h1>

        {timeRemaining && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, maxWidth: 380, width: "100%", marginBottom: 32 }}>
            {[
              { val: timeRemaining.d, label: 'Days' },
              { val: timeRemaining.h, label: 'Hours' },
              { val: timeRemaining.m, label: 'Mins' },
              { val: timeRemaining.s, label: 'Secs' },
            ].map((t, idx) => (
              <div key={idx} style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(247, 241, 227, 0.15)', borderRadius: 4, padding: '16px 8px', textAlign: 'center' }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, fontWeight: 700, color: '#f7f1e3' }}>
                  {t.val.toString().padStart(2, '0')}
                </div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 13, color: 'rgba(247, 241, 227, 0.7)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 4 }}>
                  {t.label}
                </div>
              </div>
            ))}
          </div>
        )}

        <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, color: "rgba(247,241,227,0.5)", textAlign: "center", fontStyle: "italic", maxWidth: 360 }}>
          The wax seal will become unsealable the instant the timer reaches zero.
        </p>
      </div>
    );
  }

  /* ── GUARDIAN GATE ───────────────────────────────────── */
  if (phase === "guardian") {
    return (
      <div style={{ minHeight: "100vh", background: "#0f1012", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div style={{ width: 68, height: 68, borderRadius: "50%", background: "radial-gradient(circle at 35% 30%,#c41e3a,#8b2020 55%,#5c1616)", boxShadow: "0 0 48px rgba(139,32,32,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px", marginBottom: 28, animation: "floatSeal 3s ease-in-out infinite" }}>
          ❤️
        </div>
        <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 13, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(247,241,227,0.5)", marginBottom: 10 }}>Guardian Question</p>
        <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, color: "#f7f1e3", textAlign: "center", maxWidth: 380, marginBottom: 32, lineHeight: 1.5 }}>
          {letter?.question || "Only the one who truly knows can open this."}
        </p>
        <div style={{ width: "100%", maxWidth: 340, display: "flex", flexDirection: "column", gap: 10, animation: guardianError ? "shake 0.4s ease" : "none" }}>
          <input type="text" value={guardianAnswer}
            onChange={e => setGuardianAnswer(e.target.value)}
            onKeyDown={e => e.key === "Enter" && submitGuardian()}
            placeholder="Your answer..."
            style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${guardianError ? "rgba(196,30,58,0.7)" : "rgba(247,241,227,0.2)"}`, borderRadius: 4, padding: "14px 18px", fontFamily: "'Cormorant Garamond',serif", fontSize: 19, color: "#f7f1e3", outline: "none", textAlign: "center" }}
          />
          {guardianError && <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, color: "rgba(196,30,58,0.8)", textAlign: "center" }}>That's not quite right.</p>}
          <button onClick={submitGuardian} disabled={guardianLoading}
            style={{ background: "#8b2020", border: "none", borderRadius: 4, padding: "13px 24px", color: "#f7f1e3", fontFamily: "'Cormorant Garamond',serif", fontSize: 17, fontWeight: 600, cursor: "pointer", opacity: guardianLoading ? 0.6 : 1 }}>
            {guardianLoading ? "Checking..." : "Unlock →"}
          </button>
        </div>
        <style>{`@keyframes floatSeal{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}} @keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-7px)}40%{transform:translateX(7px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}`}</style>
      </div>
    );
  }

  /* ── ENVELOPE UNFOLD (CINEMATIC OPENING) ─────────────── */
  if (phase === "envelope" || phase === "envelope-opening") {
    const isOpening = phase === "envelope-opening";

    const handleEnvelopeTap = () => {
      if (isOpening || envStage !== 'idle') return;
      setPhase("envelope-opening");
      setEnvStage("opening-flap");
      fetch(`/api/letters/${id}/unseal`, { method: "POST" }).catch(() => {});

      // 1. Flap flips open (0ms -> 600ms)
      // 2. Letter starts rising from inside the front pocket (600ms -> 1700ms)
      setTimeout(() => {
        setEnvStage("sliding-paper");
      }, 600);

      // 3. Envelope dissolves smoothly into the reading sheet (1700ms -> 2400ms)
      setTimeout(() => {
        setEnvStage("dissolving");
      }, 1700);

      // 4. Reveal full paper letter & begin typing
      setTimeout(() => {
        setPhase("revealed");
        setEnvStage("idle");
      }, 2400);
    };

    const isFlapOpen = envStage !== 'idle';
    const isSliding = envStage === 'sliding-paper' || envStage === 'dissolving';
    const isDissolving = envStage === 'dissolving';

    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0f1012",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          perspective: 1600,
          padding: "2rem",
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
        onClick={handleEnvelopeTap}
      >
        <UnsealParticles active={isOpening} type="mixed" />

        {/* Envelope Wrapper */}
        <div
          style={{
            position: "relative",
            width: "90vw",
            maxWidth: 560,
            height: "56vw",
            maxHeight: 360,
            cursor: isOpening ? "default" : "pointer",
            transformStyle: "preserve-3d",
            transition: "opacity 0.75s cubic-bezier(0.4, 0, 0.2, 1), transform 0.75s cubic-bezier(0.4, 0, 0.2, 1)",
            opacity: isDissolving ? 0 : 1,
            transform: isDissolving
              ? "scale(0.94) translateY(30px)"
              : isOpening
              ? "scale(1.02) translateY(-6px)"
              : "scale(1) translateY(0)",
          }}
          onMouseEnter={e => {
            if (!isOpening) e.currentTarget.style.transform = "translateY(-8px) scale(1.02)";
          }}
          onMouseLeave={e => {
            if (!isOpening) e.currentTarget.style.transform = "translateY(0) scale(1)";
          }}
        >
          {/* Envelope 3D Container */}
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              transformStyle: "preserve-3d",
              boxShadow: "0 24px 64px rgba(0, 0, 0, 0.7), 0 4px 18px rgba(0, 0, 0, 0.45)",
              borderRadius: 4,
            }}
          >
            {/* 1. Back Plate of the Envelope (Layer 1) */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundColor: "#cfbead",
                borderRadius: 4,
                zIndex: 1,
              }}
            />

            {/* 2. Top Flap with Wax Seal attached (Layer 5 when closed, Layer 1 when open) */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                zIndex: isFlapOpen ? 1 : 5,
                pointerEvents: "none",
                transformOrigin: "top center",
                transition: "transform 0.65s cubic-bezier(0.4, 0, 0.2, 1), z-index 0s 0.3s",
                transform: isFlapOpen ? "rotateX(180deg)" : "rotateX(0deg)",
                transformStyle: "preserve-3d",
              }}
            >
              {/* Flap Triangle */}
              <div
                style={{
                  width: 0,
                  height: 0,
                  borderTop: "min(28vw, 180px) solid #f3e2d1",
                  borderLeft: "min(45vw, 280px) solid transparent",
                  borderRight: "min(45vw, 280px) solid transparent",
                  filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.18))",
                  position: "relative",
                }}
              />

              {/* Wax Seal physically attached to the flap tip */}
              <div
                style={{
                  position: "absolute",
                  top: "min(28vw, 180px)",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: 46,
                  height: 46,
                  borderRadius: "50%",
                  background: "radial-gradient(circle at 35% 32%, #ba2e38 0%, #8b1820 65%, #560e14 100%)",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                  fontSize: 19,
                  zIndex: 6,
                }}
              >
                ✉
              </div>
            </div>

            {/* 3. Folded Letter Sheet inside the pocket (Layer 2) */}
            <div
              style={{
                position: "absolute",
                top: "14%",
                left: "6%",
                width: "88%",
                height: "82%",
                backgroundColor: "#fcf8f2",
                backgroundImage: "radial-gradient(rgba(0, 0, 0, 0.035) 1px, transparent 1px)",
                backgroundSize: "12px 12px",
                borderRadius: 4,
                boxShadow: isSliding
                  ? "0 18px 45px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(166, 149, 124, 0.4)"
                  : "0 6px 20px rgba(0, 0, 0, 0.22)",
                zIndex: 2,
                transform: isSliding ? "translateY(-250px) scale(1.04)" : "translateY(0) scale(1)",
                transition: "transform 1.05s cubic-bezier(0.2, 0.85, 0.35, 1)",
                padding: "22px 24px",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                gap: 8,
                overflow: "hidden",
                border: "1px solid #c8b8a3",
              }}
            >
              {/* Emerging Letter Header */}
              <div
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: 15.5,
                  fontWeight: 700,
                  color: "#2a1e17",
                  letterSpacing: "0.06em",
                  borderBottom: "1px solid rgba(166, 149, 124, 0.35)",
                  paddingBottom: 6,
                  marginBottom: 4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  textTransform: "uppercase",
                }}
              >
                <span>{letter?.title || "A Secret Letter"}</span>
                <span style={{ fontSize: 11.5, fontStyle: "italic", color: "#8a7561", textTransform: "none", fontWeight: 400 }}>№ 01</span>
              </div>

              {/* Emerging Letter Body Text */}
              <div
                style={{
                  fontFamily: "'Crimson Pro', Georgia, serif",
                  fontSize: 14,
                  lineHeight: 1.55,
                  color: "#3a2d24",
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitLineClamp: 4,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {letter?.message ? letter.message.slice(0, 220) + "…" : "Write something meaningful…"}
              </div>

              {/* Decorative mini signature preview */}
              {letter?.signature && (
                <div
                  style={{
                    alignSelf: "flex-end",
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontStyle: "italic",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#8b1820",
                    marginTop: "auto",
                  }}
                >
                  — {letter.signature}
                </div>
              )}
            </div>

            {/* 4. Front Triangular Envelope Pocket Flaps (Layer 3) */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                borderLeft: "min(45vw, 280px) solid #e6d3bf",
                borderRight: "min(45vw, 280px) solid #e6d3bf",
                borderBottom: "min(28vw, 180px) solid #ebd9c5",
                borderTop: "min(28vw, 180px) solid transparent",
                zIndex: 3,
                pointerEvents: "none",
                borderRadius: 4,
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>

        {/* TAP TO OPEN hint */}
        {!isOpening && (
          <p
            style={{
              marginTop: 36,
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: 13.5,
              color: "rgba(255, 255, 255, 0.7)",
              letterSpacing: 3,
              textTransform: "uppercase",
              animation: "tapPulse 2s infinite",
              textAlign: "center",
            }}
          >
            ✦ TAP TO OPEN ✦
          </p>
        )}

        <style>{`
          @keyframes tapPulse {
            0%, 100% { opacity: 0.35; transform: translateY(0); }
            50% { opacity: 0.95; transform: translateY(-3px); }
          }
          @keyframes floatSeal { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        `}</style>
      </div>
    );
  }

  /* ── SEALED (HOLD TO UNSEAL ENVELOPE) ──────────────── */
  if (phase === "sealed" || phase === "unfolding") {
    const env = getEnvelopeStyle(letter?.envelope || "Classic Wax");

    const isFlapOpen = holdStage !== 'sealed' && holdStage !== 'cracking';
    const isSliding = holdStage === 'sliding-paper' || holdStage === 'dissolving';
    const isDissolving = holdStage === 'dissolving';
    const isCracking = holdStage === 'cracking';

    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0f1012",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          perspective: 1600,
          padding: "2rem",
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
      >
        <UnsealParticles active={phase === "unfolding"} type="mixed" />

        {/* Envelope Wrapper */}
        <div
          style={{
            position: "relative",
            width: "90vw",
            maxWidth: 560,
            height: "56vw",
            maxHeight: 360,
            transformStyle: "preserve-3d",
            transition: "opacity 0.75s cubic-bezier(0.4, 0, 0.2, 1), transform 0.75s cubic-bezier(0.4, 0, 0.2, 1)",
            opacity: isDissolving ? 0 : 1,
            transform: isDissolving
              ? "scale(0.94) translateY(30px)"
              : isHolding
              ? `scale(${1 + holdProgress * 0.0008}) translateY(-4px)`
              : "scale(1) translateY(0)",
          }}
        >
          {/* Envelope 3D Container */}
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              transformStyle: "preserve-3d",
              boxShadow: isHolding
                ? "0 28px 72px rgba(0, 0, 0, 0.8), 0 0 32px rgba(212, 165, 116, 0.25)"
                : "0 24px 64px rgba(0, 0, 0, 0.7), 0 4px 18px rgba(0, 0, 0, 0.45)",
              borderRadius: 4,
              transition: "box-shadow 0.3s ease",
            }}
          >
            {/* 1. Back Plate of the Envelope (Layer 1) */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundColor: env.bodyBg,
                borderRadius: 4,
                zIndex: 1,
                filter: "brightness(0.92)",
              }}
            />

            {/* 2. Top Flap with Wax Seal attached (Layer 5 when closed, Layer 1 when open) */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                zIndex: isFlapOpen ? 1 : 5,
                pointerEvents: "none",
                transformOrigin: "top center",
                transition: "transform 0.65s cubic-bezier(0.4, 0, 0.2, 1), z-index 0s 0.3s",
                transform: isFlapOpen ? "rotateX(180deg)" : "rotateX(0deg)",
                transformStyle: "preserve-3d",
              }}
            >
              {/* Flap Triangle */}
              <div
                style={{
                  width: 0,
                  height: 0,
                  borderTop: `min(28vw, 180px) solid ${env.bodyBg}`,
                  borderLeft: "min(45vw, 280px) solid transparent",
                  borderRight: "min(45vw, 280px) solid transparent",
                  filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.18)) brightness(1.04)",
                  position: "relative",
                }}
              />

              {/* Silk Ribbon Accent on Flap if applicable */}
              {env.isRibbon && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: "calc(50% - 12px)",
                    width: 24,
                    height: "min(28vw, 180px)",
                    background: "linear-gradient(180deg, #f48fb1, #f06292)",
                    opacity: 0.85,
                    boxShadow: "0 2px 8px rgba(240,98,146,0.3)",
                  }}
                />
              )}
            </div>

            {/* 3. Folded Real Kraft Letter Sheet inside the pocket (Layer 2) */}
            <div
              style={{
                position: "absolute",
                top: "14%",
                left: "6%",
                width: "88%",
                height: "82%",
                backgroundColor: "#dfd2be",
                backgroundImage: "radial-gradient(rgba(0, 0, 0, 0.04) 1px, transparent 1px)",
                backgroundSize: "12px 12px",
                borderRadius: 4,
                boxShadow: "0 6px 20px rgba(0, 0, 0, 0.22)",
                zIndex: 2,
                transform: isSliding ? "translateY(-250px) scale(1.04)" : "translateY(0) scale(1)",
                transition: "transform 1.05s cubic-bezier(0.2, 0.85, 0.35, 1)",
                padding: "24px 28px",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                gap: 12,
                overflow: "hidden",
                border: "1px solid #a6957c",
              }}
            >
              {/* Emerging Letter Header & Preview Lines */}
              <div style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontSize: 16,
                fontWeight: 600,
                color: "#261f18",
                letterSpacing: "0.02em",
                borderBottom: "1px solid rgba(166, 149, 124, 0.4)",
                paddingBottom: 6,
                marginBottom: 2,
              }}>
                {letter?.title || "A Secret Letter For You"}
              </div>

              <div style={{
                fontFamily: "Georgia, serif",
                fontSize: 13,
                lineHeight: 1.6,
                color: "rgba(38, 31, 24, 0.8)",
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 4,
                WebkitBoxOrient: "vertical",
              }}>
                {letter?.message ? letter.message.slice(0, 180) + '…' : 'Write something meaningful…'}
              </div>

              {/* Mini signature preview */}
              {letter?.signature && (
                <div style={{
                  alignSelf: "flex-end",
                  fontFamily: "Georgia, serif",
                  fontStyle: "italic",
                  fontSize: 12,
                  color: "#3a2d20",
                  marginTop: "auto",
                }}>
                  — {letter.signature}
                </div>
              )}
            </div>

            {/* 4. Front Triangular Envelope Pocket Flaps (Layer 3) */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                borderLeft: `min(45vw, 280px) solid ${env.bodyBg}`,
                borderRight: `min(45vw, 280px) solid ${env.bodyBg}`,
                borderBottom: `min(28vw, 180px) solid ${env.bodyBg}`,
                borderTop: "min(28vw, 180px) solid transparent",
                filter: "brightness(0.96)",
                zIndex: 3,
                pointerEvents: "none",
                borderRadius: 4,
                boxSizing: "border-box",
              }}
            />

            {/* Ribbon horizontal bar if applicable */}
            {env.isRibbon && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(50% - 12px)",
                  left: 0,
                  width: "100%",
                  height: 24,
                  background: "linear-gradient(180deg, #f48fb1, #f06292)",
                  opacity: 0.7,
                  boxShadow: "0 2px 8px rgba(240,98,146,0.3)",
                  zIndex: 4,
                  pointerEvents: "none",
                }}
              />
            )}

            {/* Recipient note */}
            <div style={{
              position: "absolute",
              bottom: 20,
              left: 24,
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 13,
              color: "rgba(0,0,0,0.35)",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              zIndex: 4,
              pointerEvents: "none",
            }}>
              For you
            </div>

            {/* 5. Central Wax Seal (Interactive Button + Progress Ring + Crack Glow) */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: isFlapOpen ? "translate(-50%, -180px) scale(0.85)" : "translate(-50%, -50%)",
                transition: "transform 0.65s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s ease",
                opacity: isSliding || isDissolving ? 0 : 1,
                zIndex: isFlapOpen ? 1 : 10,
              }}
            >
              <button
                onMouseDown={startHold}
                onMouseUp={endHold}
                onTouchStart={startHold}
                onTouchEnd={endHold}
                style={{
                  width: 76,
                  height: 76,
                  borderRadius: "50%",
                  background: env.sealBg,
                  border: "none",
                  cursor: isHolding || isCracking ? "default" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 30,
                  userSelect: "none",
                  WebkitUserSelect: "none",
                  touchAction: "manipulation",
                  WebkitTouchCallout: "none",
                  boxShadow: isCracking
                    ? "0 0 60px rgba(255, 215, 0, 0.95), 0 0 30px rgba(224,48,58,0.9), inset 0 0 16px rgba(255,255,255,0.8)"
                    : isHolding
                    ? `0 0 ${24 + holdProgress * 0.3}px rgba(224,48,58,0.85), inset 0 0 12px rgba(0,0,0,0.4)`
                    : "0 6px 24px rgba(0,0,0,0.45)",
                  transform: isCracking
                    ? "scale(1.2)"
                    : isHolding
                    ? `scale(${1 + holdProgress * 0.0018})`
                    : "scale(1)",
                  transition: "transform 0.15s, box-shadow 0.15s",
                  animation: isCracking ? "sealBurst 0.4s ease forwards" : "none",
                }}
              >
                {env.sealIcon}
              </button>

              {/* Progress Ring */}
              {isHolding && (
                <svg
                  style={{
                    position: "absolute",
                    top: -8,
                    left: -8,
                    width: 92,
                    height: 92,
                    transform: "rotate(-90deg)",
                    pointerEvents: "none",
                    filter: "drop-shadow(0 0 6px rgba(255, 215, 0, 0.6))",
                  }}
                >
                  <circle cx="46" cy="46" r="42" fill="none" stroke="rgba(247,241,227,0.25)" strokeWidth="4" />
                  <circle
                    cx="46"
                    cy="46"
                    r="42"
                    fill="none"
                    stroke="#ffd700"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 42}`}
                    strokeDashoffset={`${2 * Math.PI * 42 * (1 - holdProgress / 100)}`}
                    style={{ transition: "stroke-dashoffset 0.05s linear" }}
                  />
                </svg>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Prompt / Status */}
        <p
          style={{
            marginTop: 36,
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 18,
            fontStyle: "italic",
            color: "rgba(247,241,227,0.75)",
            textAlign: "center",
            letterSpacing: "0.02em",
            transition: "opacity 0.2s",
          }}
        >
          {isCracking
            ? "✦ Seal Broken! ✦"
            : isHolding
            ? `Breaking the seal… ${Math.round(holdProgress)}%`
            : "Press and hold the wax seal to open"}
        </p>

        <style>{`
          @keyframes sealBurst {
            0% { transform: scale(1.1); filter: brightness(1); }
            50% { transform: scale(1.25); filter: brightness(1.6); }
            100% { transform: scale(1.2); filter: brightness(1.3); }
          }
        `}</style>
      </div>
    );
  }

  /* ── REVEALED PHASE: REAL KRAFT STATIONERY LETTER ── */
  const bodyFont = FONT_MAP[letter?.font || "Classic"] || FONT_MAP.Classic;

  return (
    <div
      onClick={isTyping ? skipTyping : undefined}
      onTouchStart={isTyping ? skipTyping : undefined}
      style={{
        minHeight: "100vh",
        background: "#0f1012",
        color: "#f1f1f1",
        padding: "40px 16px 120px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 32,
        perspective: 1000,
      }}
    >

      {/* ── LUXURY IVORY PARCHMENT LETTER ── */}
      <div
        id="letter-paper"
        ref={letterContainerRef}
        onScroll={(e) => {
          const target = e.currentTarget;
          const distanceFromBottom = target.scrollHeight - target.scrollTop - target.clientHeight;
          userScrolledUpRef.current = distanceFromBottom > 50;
        }}
        className="unfolded-letter-paper"
        onClick={skipTyping}
        title={isTyping ? "Click to reveal immediately" : undefined}
        style={{
          width: "90vw",
          maxWidth: 660,
          minHeight: "70vh",
          maxHeight: 820,
          backgroundColor: "#fcf8f2",
          color: "#3a2d24",
          boxShadow: "0 24px 64px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.6)",
          borderRadius: 6,
          padding: "44px 44px 40px 44px",
          position: "relative",
          overflowY: "auto",
          backgroundImage: "radial-gradient(rgba(0, 0, 0, 0.035) 1px, transparent 1px)",
          backgroundSize: "12px 12px",
          border: "1px solid #c8b8a3",
          animation: "slideUpFade 1s cubic-bezier(0.16, 1, 0.3, 1) forwards",
          cursor: isTyping ? "pointer" : "default",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          boxSizing: "border-box",
        }}
      >
        {/* Top-Right Note informing the user they can tap anywhere to reveal */}
        {isTyping && (
          <div
            style={{
              position: "absolute",
              top: 14,
              right: 18,
              fontSize: "0.82rem",
              fontFamily: "'Crimson Pro', Georgia, serif",
              fontStyle: "italic",
              color: "rgba(58, 45, 36, 0.5)",
              pointerEvents: "none",
              userSelect: "none",
              animation: "fadeIn 0.3s ease",
              display: "flex",
              alignItems: "center",
              gap: 4,
              zIndex: 10,
            }}
          >
            <span>✦ tap anywhere to skip</span>
          </div>
        )}

        <div>
          {/* Header Bar: Uppercase Serif Title + № 01 + Hairline Divider */}
          <div
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "1.35rem",
              fontWeight: 700,
              color: "#2a1e17",
              letterSpacing: "0.06em",
              borderBottom: "1px solid rgba(166, 149, 124, 0.35)",
              paddingBottom: 10,
              marginBottom: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              textTransform: "uppercase",
              width: "100%",
            }}
          >
            <span>{letter?.title || "A Secret Letter"}</span>
            <span style={{ fontSize: "0.85rem", fontStyle: "italic", color: "#8a7561", textTransform: "none", fontWeight: 400 }}>№ 01</span>
          </div>

          {/* Typewriter Text Content in Crimson Pro */}
          <div
            style={{
              fontFamily: bodyFont,
              fontSize: "1.24rem",
              lineHeight: 1.85,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              letterSpacing: "0.01em",
              color: "#3a2d24",
              display: "inline-block",
              width: "100%",
            }}
          >
            {typedText}
            {isTyping && (
              <span
                style={{
                  display: "inline-block",
                  animation: "blinkCursor 1s step-end infinite",
                  fontWeight: "bold",
                  color: "#8b1820",
                  marginLeft: 2,
                }}
              >
                |
              </span>
            )}
          </div>

          {/* Voice Note Player */}
          {letter?.voiceMessage && (
            <div style={{ marginTop: 20 }}>
              <VoiceNotePlayer voiceUrl={letter.voiceMessage} duration={letter.voiceDuration} />
            </div>
          )}
        </div>

        {/* Signature in Crimson Wax Accent */}
        {letter?.signature && (
          <div
            style={{
              textAlign: "right",
              marginTop: 36,
              opacity: isTyping ? 0.35 : 1,
              transition: "opacity 0.5s ease",
            }}
          >
            <p
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: "1.32rem",
                fontStyle: "italic",
                fontWeight: 600,
                color: "#8b1820",
                margin: 0,
              }}
            >
              — {letter.signature}
            </p>
          </div>
        )}
      </div>

      {/* ── ATTACHED PHOTO (AUTHENTIC VINTAGE POLAROID KEEPSAKE) ── */}
      {(() => {
        if (!letter?.photo) return null;
        let photoSrc = letter.photo;
        let photoCaptionText = "";
        try {
          if (letter.photo.startsWith("{")) {
            const parsed = JSON.parse(letter.photo);
            photoSrc = parsed.url || letter.photo;
            photoCaptionText = parsed.caption || "";
          }
        } catch {
          photoSrc = letter.photo;
        }

        if (!photoSrc) return null;

        return (
          <div
            style={{
              width: "90vw",
              maxWidth: 460,
              margin: "40px auto 20px auto",
              animation: "slideUpFade 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {/* Tilted Vintage Polaroid Frame (Enlarged) */}
            <div
              className="tilted-polaroid-frame"
              style={{
                background: "#fdfbf7",
                padding: "16px 16px 26px",
                borderRadius: 4,
                boxShadow: "0 24px 64px rgba(0,0,0,0.75), 0 3px 12px rgba(0,0,0,0.35)",
                transform: "rotate(-2deg)",
                maxWidth: 440,
                width: "100%",
                border: "1px solid rgba(200, 184, 163, 0.65)",
                position: "relative",
              }}
            >
              {/* Washi tape visual accent at top */}
              <div
                style={{
                  position: "absolute",
                  top: -11,
                  left: "50%",
                  transform: "translateX(-50%) rotate(2deg)",
                  width: 84,
                  height: 22,
                  background: "rgba(212, 165, 116, 0.5)",
                  backdropFilter: "blur(4px)",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.18)",
                }}
              />

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoSrc}
                alt="Attached memory keepsake"
                style={{
                  width: "100%",
                  maxHeight: 380,
                  objectFit: "cover",
                  borderRadius: 2,
                  display: "block",
                }}
              />

              {/* Handwritten cursive caption in double quotes */}
              <div
                style={{
                  fontFamily: "'Dancing Script', cursive",
                  fontSize: "clamp(18px, 4vw, 21px)",
                  color: "#3a2d24",
                  marginTop: 14,
                  textAlign: "center",
                  fontWeight: 600,
                  letterSpacing: "0.02em",
                  lineHeight: 1.35,
                }}
              >
                {photoCaptionText.trim()
                  ? `“${photoCaptionText.trim()}”`
                  : `“A photo that says what words can't”`}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── EMOJI REACTIONS ── */}
      <div style={{ textAlign: "center", marginTop: 4, marginBottom: 2 }}>
        <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 15, color: "rgba(247,241,227,0.45)", marginBottom: 12, letterSpacing: "0.02em" }}>
          how did this make you feel?
        </p>

        <div style={{ display: "flex", gap: 14, justifyContent: "center" }}>
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
                  } catch {}
                  fetch(`/api/letters/${id}/react`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ reaction: emoji }),
                  }).catch(() => {});
                }}
                style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: isSelected ? activeBg : "rgba(255, 255, 255, 0.08)",
                  border: `1px solid ${isSelected ? "rgba(255,255,255,0.3)" : "rgba(247, 241, 227, 0.12)"}`,
                  cursor: "pointer", fontSize: 18,
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

        <div style={{ minHeight: 18, marginTop: 8 }}>
          {reaction && (
            <span style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 14,
              fontStyle: "italic",
              color: "rgba(247, 241, 227, 0.8)",
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

      {/* ── PEN-PAL LINKED THREAD MEMORY CAPSULE ── */}
      {letter?.replyLetterId && (
        <Link
          href={`/r/${letter.replyLetterId}`}
          style={{
            width: "90vw", maxWidth: 650,
            background: "linear-gradient(135deg, rgba(212, 165, 116, 0.18), rgba(139, 32, 32, 0.25))",
            border: "1.5px solid #d4a574",
            borderRadius: 6, padding: "14px 18px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            textDecoration: "none", color: "#f7f1e3",
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            boxShadow: "0 6px 20px rgba(0,0,0,0.5)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>💌</span>
            <div>
              <div style={{ fontSize: 16, fontWeight: 600, color: "#d4a574" }}>A reply has been sealed for this letter!</div>
              <div style={{ fontSize: 13, color: "rgba(247, 241, 227, 0.65)" }}>Click to unseal and read the response</div>
            </div>
          </div>
          <span style={{ color: "#d4a574", fontSize: 18 }}>→</span>
        </Link>
      )}

      {letter?.replyToId && (
        <Link
          href={`/r/${letter.replyToId}`}
          style={{
            width: "90vw", maxWidth: 650,
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(212, 165, 116, 0.35)",
            borderRadius: 6, padding: "12px 18px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            textDecoration: "none", color: "#f7f1e3",
            fontFamily: "'Cormorant Garamond', Georgia, serif",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 18 }}>📜</span>
            <div style={{ fontSize: 14, color: "rgba(247, 241, 227, 0.85)" }}>
              This is a response to an earlier letter. <strong>View original letter</strong>
            </div>
          </div>
          <span style={{ color: "#d4a574", fontSize: 16 }}>→</span>
        </Link>
      )}

      {/* ── STREAMLINED ELEGANT REPLY SECTION ── */}
      <div style={{
        width: "90vw", maxWidth: 650,
        background: "rgba(255, 255, 255, 0.04)",
        border: "1px solid rgba(247, 241, 227, 0.12)",
        borderRadius: 4, padding: "24px 24px 20px",
        textAlign: "center",
        boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
      }}>
        <div style={{
          width: 42, height: 42, borderRadius: "50%",
          background: "radial-gradient(circle at 35% 30%, #e42038 0%, #8b1420 60%, #4a0810 100%)",
          boxShadow: "0 0 20px rgba(228, 32, 56, 0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "18px", color: "#ffffff",
          margin: "0 auto 12px",
        }}>
          ❤
        </div>

        <h3 style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 22, fontWeight: 600, color: "#f7f1e3",
          margin: "0 0 4px",
        }}>
          They'd love to hear back
        </h3>

        <p style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 15, fontStyle: "italic",
          color: "rgba(247, 241, 227, 0.55)",
          margin: "0 0 16px",
        }}>
          Write something back — it will be sealed and linked to this letter
        </p>

        <Link href={`/create?replyTo=${letter?.id || id}`} style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          width: "100%", padding: "13px",
          background: "linear-gradient(180deg, #9e2430 0%, #761822 100%)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          borderRadius: 4,
          fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 17, fontWeight: 600,
          color: "#f7f1e3", textDecoration: "none",
          boxShadow: "0 4px 18px rgba(158, 36, 48, 0.35)",
          transition: "all 0.2s ease",
        }}>
          <span style={{ fontSize: 17 }}>✉</span> Seal a Message Back
        </Link>
      </div>

      {/* ── 2-BUTTON SHARE ROW ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, width: "90vw", maxWidth: 650 }}>
        {/* Share link */}
        <button
          onClick={() => navigator.share?.({ url: window.location.href }) ?? navigator.clipboard.writeText(window.location.href)}
          style={{
            background: "rgba(255, 255, 255, 0.04)",
            border: "1px solid rgba(247, 241, 227, 0.15)",
            borderRadius: 4, padding: "14px 10px",
            cursor: "pointer", fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 15, fontWeight: 500, color: "#f7f1e3",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            transition: "all 0.18s ease",
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(247, 241, 227, 0.4)")}
          onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(247, 241, 227, 0.15)")}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
            background: "rgba(255, 255, 255, 0.04)",
            border: "1px solid rgba(247, 241, 227, 0.15)",
            borderRadius: 4, padding: "14px 10px",
            cursor: "pointer", fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 15, fontWeight: 500, color: "#f7f1e3",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            transition: "all 0.18s ease",
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(247, 241, 227, 0.4)")}
          onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(247, 241, 227, 0.15)")}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
          <span>{copiedLink ? "copied!" : "copy link"}</span>
        </button>
      </div>

      {/* ── KEEPSAKE ACTIONS (PNG & PRINTABLE PDF) ── */}
      {letter && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "90vw", maxWidth: 650 }}>
          {/* Framed Keepsake Card PNG */}
          <button
            onClick={() => downloadKeepsake(letter)}
            style={{
              width: "100%",
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px dashed rgba(247, 241, 227, 0.2)",
              borderRadius: 4, padding: "12px 10px",
              cursor: "pointer", fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 15, color: "rgba(247,241,227,0.75)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              transition: "all 0.2s ease",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = "rgba(247, 241, 227, 0.5)";
              e.currentTarget.style.color = "#f7f1e3";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = "rgba(247, 241, 227, 0.2)";
              e.currentTarget.style.color = "rgba(247,241,227,0.75)";
            }}
          >
            <span>🖼️</span>
            <span>Download Framed Keepsake Card (PNG)</span>
          </button>

          {/* Standalone Authentic Polaroid Memory PNG (Shown when photo is attached) */}
          {letter?.photo && (
            <button
              onClick={() => downloadPolaroidOnly(letter)}
              style={{
                width: "100%",
                background: "rgba(254, 215, 170, 0.05)",
                border: "1px dashed rgba(254, 215, 170, 0.35)",
                borderRadius: 4, padding: "12px 10px",
                cursor: "pointer", fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 15, color: "#fef3c7",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "all 0.2s ease",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(254, 215, 170, 0.12)";
                e.currentTarget.style.borderColor = "#fef3c7";
                e.currentTarget.style.color = "#ffffff";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "rgba(254, 215, 170, 0.05)";
                e.currentTarget.style.borderColor = "rgba(254, 215, 170, 0.35)";
                e.currentTarget.style.color = "#fef3c7";
              }}
            >
              <span>📸</span>
              <span>Download Authentic Polaroid Memory (PNG)</span>
            </button>
          )}

          {/* Printable Foldable Origami PDF */}
          <button
            onClick={() => generateOrigamiPDF(letter)}
            style={{
              width: "100%",
              background: "rgba(212, 165, 116, 0.06)",
              border: "1px solid rgba(212, 165, 116, 0.35)",
              borderRadius: 4, padding: "12px 10px",
              cursor: "pointer", fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 15, color: "#d4a574",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              transition: "all 0.2s ease",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "rgba(212, 165, 116, 0.12)";
              e.currentTarget.style.borderColor = "#d4a574";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "rgba(212, 165, 116, 0.06)";
              e.currentTarget.style.borderColor = "rgba(212, 165, 116, 0.35)";
            }}
          >
            <span>🖨️</span>
            <span>Download Printable Foldable Origami Envelope (A4 PDF)</span>
          </button>
        </div>
      )}

      <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 13, color: "rgba(247,241,227,0.25)", marginTop: 4, letterSpacing: "0.05em" }}>
        made with send letter
      </p>

      {/* Ambient Soundscape Player */}
      {letter?.ambientSoundscape && letter.ambientSoundscape !== 'none' && (
        <AmbientSoundscapePlayer soundscape={letter.ambientSoundscape} />
      )}

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
        @keyframes slideUpFade {
          0% { opacity: 0; transform: translateY(50px) rotateX(-5deg); }
          100% { opacity: 1; transform: translateY(0) rotateX(0); }
        }
        @keyframes blinkCursor {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes floatSeal { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes spin { to{transform:rotate(360deg)} }

        @media (max-width: 640px) {
          .unfolded-letter-paper {
            padding: 28px 18px 24px 18px !important;
            width: 94vw !important;
            min-height: 65vh !important;
          }
          .tilted-polaroid-frame {
            max-width: min(390px, calc(100vw - 28px)) !important;
            padding: 12px 12px 20px 12px !important;
          }
        }
      `}</style>
    </div>
  );
}
