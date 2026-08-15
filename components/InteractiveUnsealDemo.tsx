"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import UnsealParticles from "@/components/UnsealParticles";

export default function InteractiveUnsealDemo() {
  const [unsealState, setUnsealState] = useState<"sealed" | "pressing" | "cracking" | "open">("sealed");
  const [pressProgress, setPressProgress] = useState(0);
  const [isPlayingSong, setIsPlayingSong] = useState(false);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  // Procedural Sound Effects using Web Audio API
  const playWaxCrackSound = useCallback(() => {
    try {
      const AudioCtx = typeof window !== "undefined" ? (window.AudioContext || (window as any).webkitAudioContext) : null;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      // 1. Crisp wax snap / crackle (noise burst + filter)
      const bufferSize = ctx.sampleRate * 0.18;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(1400, ctx.currentTime);
      filter.Q.setValueAtTime(3.5, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();

      // 2. Deep parchment slide thump
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.35);

      oscGain.gain.setValueAtTime(0.3, ctx.currentTime);
      oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.38);
    } catch (e) {
      console.warn("Audio synthesis note:", e);
    }
  }, []);

  // Handle Press and Hold
  const startPress = useCallback(() => {
    if (unsealState !== "sealed") return;
    setUnsealState("pressing");

    progressIntervalRef.current = setInterval(() => {
      setPressProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressIntervalRef.current!);
          setUnsealState("cracking");
          playWaxCrackSound();

          // Transition to open after crack animation
          setTimeout(() => {
            setUnsealState("open");
            // Optional preview song
            try {
              if (!audioPreviewRef.current) {
                const audio = new Audio("https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/47/94/8f/47948f21-bb5c-9cb7-7f99-2766e4a2c077/mzaf_11309855581177651817.plus.aac.p.m4a");
                audio.volume = 0.35;
                audioPreviewRef.current = audio;
              }
              audioPreviewRef.current.play().then(() => setIsPlayingSong(true)).catch(() => {});
            } catch {}
          }, 800);

          return 100;
        }
        return prev + 4; // Completes in ~1 second
      });
    }, 40);
  }, [unsealState, playWaxCrackSound]);

  const stopPress = useCallback(() => {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    if (unsealState === "pressing") {
      setUnsealState("sealed");
      setPressProgress(0);
    }
  }, [unsealState]);

  // Clean up
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
      }
    };
  }, []);

  const resetDemo = () => {
    if (audioPreviewRef.current) {
      audioPreviewRef.current.pause();
      audioPreviewRef.current.currentTime = 0;
    }
    setIsPlayingSong(false);
    setUnsealState("sealed");
    setPressProgress(0);
  };

  const isFlapOpen = unsealState === "cracking" || unsealState === "open";
  const isSliding = unsealState === "open";

  return (
    <section
      style={{
        position: "relative",
        maxWidth: 820,
        margin: "10px auto 60px auto",
        padding: "0 20px",
        zIndex: 5,
      }}
    >
      {/* Particle burst upon unsealing */}
      <UnsealParticles active={unsealState === "cracking" || unsealState === "open"} type="mixed" />

      {/* Section Header */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            background: "rgba(212, 165, 116, 0.12)",
            border: "1px solid rgba(212, 165, 116, 0.3)",
            borderRadius: 20,
            padding: "4px 14px",
            marginBottom: 14,
          }}
        >
          <span style={{ fontSize: 13, color: "#d4a574" }}>✦</span>
          <span
            style={{
              fontFamily: "'Crimson Pro', Georgia, serif",
              fontSize: 12.5,
              fontWeight: 700,
              letterSpacing: "0.14em",
              color: "#e8c39e",
              textTransform: "uppercase",
            }}
          >
            Interactive Experience
          </span>
        </div>

        <h2
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "clamp(24px, 4vw, 36px)",
            fontWeight: 600,
            color: "#faf8f5",
            margin: "0 0 10px 0",
            letterSpacing: "-0.01em",
          }}
        >
          Hold to Break the Wax Seal
        </h2>

        <p
          style={{
            fontFamily: "'Crimson Pro', Georgia, serif",
            fontSize: 16.5,
            color: "rgba(250, 248, 245, 0.65)",
            fontStyle: "italic",
            margin: 0,
          }}
        >
          Experience the unsealing ritual your recipient will feel when opening your letter.
        </p>
      </div>

      {/* Interactive Envelope Studio Card */}
      <div
        className="unseal-demo-card"
        style={{
          position: "relative",
          background: "linear-gradient(145deg, rgba(24, 10, 16, 0.85) 0%, rgba(12, 4, 8, 0.95) 100%)",
          border: "1px solid rgba(212, 165, 116, 0.28)",
          borderRadius: 24,
          padding: "30px 24px 32px 24px",
          boxShadow: "0 24px 60px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          minHeight: isSliding ? 490 : 450,
          overflow: "hidden",
          transition: "min-height 0.8s ease",
        }}
      >
        {/* Ambient candle vignette */}
        <div
          style={{
            position: "absolute",
            top: "30%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 420,
            height: 260,
            background: "radial-gradient(ellipse, rgba(196, 30, 58, 0.18) 0%, rgba(212, 165, 116, 0.08) 50%, transparent 70%)",
            pointerEvents: "none",
            filter: "blur(24px)",
          }}
        />

        {/* ── 3D ENVELOPE PREVIEW ── */}
        <div
          className="unseal-demo-envelope"
          style={{
            position: "relative",
            width: "100%",
            maxWidth: 480,
            height: 290,
            userSelect: "none",
            WebkitUserSelect: "none",
            touchAction: "manipulation",
            WebkitTouchCallout: "none",
            marginTop: isSliding ? 155 : 15,
            transition: "margin-top 0.9s cubic-bezier(0.2, 0.85, 0.35, 1)",
          }}
        >
          {/* 1. Back Plate of the Envelope (Layer 1) */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: "#cfbead",
              borderRadius: 6,
              zIndex: 1,
              boxShadow: "0 18px 45px rgba(0, 0, 0, 0.6)",
            }}
          />

          {/* 2. Folded Letter Sheet inside the pocket (Layer 2) */}
          <div
            style={{
              position: "absolute",
              top: "10%",
              left: "6%",
              width: "88%",
              height: "85%",
              backgroundColor: "#fcf8f2",
              backgroundImage: "radial-gradient(rgba(0, 0, 0, 0.035) 1px, transparent 1px)",
              backgroundSize: "12px 12px",
              borderRadius: 4,
              boxShadow: isSliding
                ? "0 18px 45px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(166, 149, 124, 0.4)"
                : "0 4px 12px rgba(0, 0, 0, 0.15)",
              zIndex: 2,
              transform: isSliding ? "translateY(-190px) scale(1.03)" : "translateY(0) scale(1)",
              transition: "transform 1.05s cubic-bezier(0.2, 0.85, 0.35, 1)",
              padding: "22px 24px",
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              border: "1px solid #c8b8a3",
            }}
          >
            {/* Letter Header */}
            <div
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 16,
                fontWeight: 700,
                color: "#2a1e17",
                letterSpacing: "0.06em",
                borderBottom: "1px solid rgba(166, 149, 124, 0.35)",
                paddingBottom: 6,
                marginBottom: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                textTransform: "uppercase",
              }}
            >
              <span>BRAND NEW DAY</span>
              <span style={{ fontSize: 12, fontStyle: "italic", color: "#8a7561", textTransform: "none" }}>№ 01</span>
            </div>

            {/* Letter Message Body */}
            <div
              style={{
                fontFamily: "'Crimson Pro', Georgia, serif",
                fontSize: 14,
                lineHeight: 1.5,
                color: "#3a2d24",
                marginBottom: 8,
                overflowY: isSliding ? "auto" : "hidden",
                maxHeight: isSliding ? 175 : 120,
                paddingRight: 4,
              }}
            >
              <p style={{ margin: "0 0 6px 0" }}>
                Hi, my name is Peter Parker, and you don’t remember me, but I have something to tell you that’s going to sound crazy.
              </p>
              <p style={{ margin: "0 0 6px 0" }}>
                But it’s the truth, and I know you’re going to believe me, because you’re very good at telling when I’m lying.
              </p>
              <p style={{ margin: "0 0 6px 0" }}>
                We used to know each other. We were together.
              </p>
              <p style={{ margin: "0 0 6px 0" }}>
                But something bad was going to happen to the world. And the only way to stop it was to make everyone forget me, including you.
              </p>
              <p style={{ margin: "0 0 6px 0" }}>
                Because I’m not just Peter Parker.
              </p>
              <p style={{ margin: "0 0 2px 0", fontWeight: 600 }}>
                I’m Spider-Man.
              </p>
            </div>

            {/* Signature */}
            <div
              style={{
                marginTop: "auto",
                textAlign: "right",
                fontFamily: "'Playfair Display', Georgia, serif",
                fontStyle: "italic",
                fontSize: 13.5,
                fontWeight: 600,
                color: "#8b1820",
              }}
            >
              — peter parker
            </div>

            {/* Embedded Audio Bar Preview */}
            {isSliding && (
              <div
                style={{
                  marginTop: 8,
                  padding: "5px 12px",
                  background: "rgba(230, 218, 204, 0.65)",
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: 11.5,
                  color: "#4a3c30",
                  fontFamily: "'Crimson Pro', Georgia, serif",
                }}
              >
                <span>🎵 Playing: <em>Sunflower — Post Malone & Swae Lee</em></span>
                <span style={{ color: "#ba2e38", fontWeight: 700 }}>● LIVE AUDIO</span>
              </div>
            )}
          </div>

          {/* 3. Front Triangular Envelope Pocket Flaps (Layer 3 - Fluid SVG Vector) */}
          <svg
            viewBox="0 0 480 290"
            preserveAspectRatio="none"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              zIndex: 3,
              pointerEvents: "none",
              borderRadius: 6,
              overflow: "hidden",
            }}
          >
            {/* Left Flap */}
            <polygon points="0,0 240,145 0,290" fill="#dfcdba" />
            {/* Right Flap */}
            <polygon points="480,0 240,145 480,290" fill="#dfcdba" />
            {/* Bottom Flap */}
            <polygon points="0,290 240,145 480,290" fill="#ebd9c5" />
          </svg>

          {/* 4. Top Flap with Wax Seal attached (Layer 5 when closed, Layer 1 when open) */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              zIndex: isFlapOpen ? 1 : 5,
              pointerEvents: isFlapOpen ? "none" : "auto",
              transformOrigin: "top center",
              transition: "transform 0.65s cubic-bezier(0.4, 0, 0.2, 1), z-index 0s 0.3s",
              transform: isFlapOpen ? "rotateX(180deg)" : "rotateX(0deg)",
              transformStyle: "preserve-3d",
            }}
          >
            {/* Top Flap SVG */}
            <svg
              viewBox="0 0 480 145"
              preserveAspectRatio="none"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "50%",
                filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.18))",
                pointerEvents: "none",
              }}
            >
              <polygon points="0,0 240,145 480,0" fill="#eedecf" />
            </svg>

            {/* Interactive Wax Seal physically attached to flap tip */}
            <div
              onMouseDown={startPress}
              onMouseUp={stopPress}
              onMouseLeave={stopPress}
              onTouchStart={(e) => {
                e.preventDefault();
                startPress();
              }}
              onTouchEnd={stopPress}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: 64,
                height: 64,
                cursor: isFlapOpen ? "default" : "pointer",
                zIndex: 10,
                userSelect: "none",
                WebkitUserSelect: "none",
                touchAction: "manipulation",
                WebkitTouchCallout: "none",
              }}
            >
              {/* Radial Progress Ring */}
              {!isFlapOpen && (
                <svg
                  width={64}
                  height={64}
                  style={{
                    position: "absolute",
                    inset: 0,
                    transform: "rotate(-90deg)",
                    zIndex: 2,
                  }}
                >
                  <circle
                    cx={32}
                    cy={32}
                    r={27}
                    fill="none"
                    stroke="rgba(212, 165, 116, 0.25)"
                    strokeWidth="3.5"
                  />
                  <circle
                    cx={32}
                    cy={32}
                    r={27}
                    fill="none"
                    stroke="#ffd700"
                    strokeWidth="3.5"
                    strokeDasharray={2 * Math.PI * 27}
                    strokeDashoffset={2 * Math.PI * 27 * (1 - pressProgress / 100)}
                    strokeLinecap="round"
                    style={{
                      transition: "stroke-dashoffset 0.04s linear",
                      filter: pressProgress > 0 ? "drop-shadow(0 0 6px #ffd700)" : "none",
                    }}
                  />
                </svg>
              )}

              {/* Red Wax Seal Button */}
              <div
                style={{
                  position: "absolute",
                  inset: 6,
                  borderRadius: "50%",
                  background:
                    unsealState === "cracking"
                      ? "radial-gradient(circle at 35% 35%, rgba(196,30,58,0.4) 0%, rgba(107,26,26,0.2) 100%)"
                      : "radial-gradient(circle at 35% 32%, #c41e3a 0%, #8b1820 50%, #560e14 100%)",
                  boxShadow:
                    unsealState === "pressing"
                      ? "0 2px 6px rgba(139,32,32,0.6), inset 0 1px 3px rgba(255,255,255,0.2)"
                      : "0 6px 18px rgba(0, 0, 0, 0.5), inset 0 2px 4px rgba(255,255,255,0.3), inset 0 -2px 4px rgba(0,0,0,0.5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                  fontSize: 20,
                  transform:
                    unsealState === "pressing"
                      ? "scale(0.94)"
                      : unsealState === "cracking"
                      ? "scale(1.2)"
                      : "scale(1)",
                  transition: "transform 0.15s ease, box-shadow 0.2s ease",
                }}
              >
                ❤
              </div>
            </div>
          </div>
        </div>

        {/* ── INTERACTION HINT & ACTIONS ── */}
        <div style={{ marginTop: 28, textAlign: "center", zIndex: 10 }}>
          {unsealState === "sealed" && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                color: "#e8c39e",
                fontFamily: "'Crimson Pro', Georgia, serif",
                fontSize: 15,
                letterSpacing: "0.02em",
                animation: "pulse 2s infinite ease-in-out",
              }}
            >
              <span>👆</span> <strong>Press and hold the wax seal</strong> to unseal
            </div>
          )}

          {unsealState === "pressing" && (
            <div
              style={{
                color: "#ffd700",
                fontFamily: "'Crimson Pro', Georgia, serif",
                fontSize: 15,
                fontWeight: 600,
                letterSpacing: "0.03em",
              }}
            >
              Breaking wax seal… ({pressProgress}%)
            </div>
          )}

          {unsealState === "open" && (
            <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
              <button
                onClick={resetDemo}
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(212, 165, 116, 0.3)",
                  color: "#faf8f5",
                  padding: "9px 18px",
                  borderRadius: 20,
                  fontFamily: "'Crimson Pro', Georgia, serif",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.14)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)")}
              >
                ↺ Seal Again to Replay
              </button>

              <Link
                href="/create"
                style={{
                  background: "linear-gradient(135deg, #c41e3a 0%, #8b1820 100%)",
                  border: "1px solid rgba(255, 215, 180, 0.4)",
                  color: "#ffffff",
                  padding: "9px 22px",
                  borderRadius: 20,
                  fontFamily: "'Crimson Pro', Georgia, serif",
                  fontSize: 14,
                  fontWeight: 700,
                  textDecoration: "none",
                  boxShadow: "0 4px 16px rgba(196, 30, 58, 0.4)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.04)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                ✉ Compose Your Own Letter →
              </Link>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .unseal-demo-card {
            padding: 20px 14px 28px 14px !important;
            border-radius: 18px !important;
            min-height: 400px !important;
          }
          .unseal-demo-envelope {
            height: auto !important;
            aspect-ratio: 1.6 / 1 !important;
            max-width: 100% !important;
          }
        }
      `}</style>
    </section>
  );
}
