"use client";
import { useState, useRef, useEffect, useCallback } from "react";

interface WaxSealProps {
  size?: number;
  onBroken?: () => void;
  broken?: boolean;
  showHint?: boolean;
}

export default function WaxSeal({ size = 80, onBroken, broken = false, showHint = true }: WaxSealProps) {
  const [progress, setProgress] = useState(0);
  const [pressing, setPressing] = useState(false);
  const [cracking, setCracking] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const circumference = Math.PI * (size - 12);

  const startPress = useCallback(() => {
    if (broken || cracking) return;
    setPressing(true);
    intervalRef.current = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(intervalRef.current!);
          setPressing(false);
          setCracking(true);
          setTimeout(() => { onBroken?.(); }, 900);
          return 100;
        }
        return p + 2;
      });
    }, 40);
  }, [broken, cracking, onBroken]);

  const stopPress = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setPressing(false);
    if (!cracking) setProgress(0);
  }, [cracking]);

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  const strokeOffset = circumference - (progress / 100) * circumference;
  const r = (size - 12) / 2;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", userSelect: "none" }}>
      <div
        style={{ position: "relative", width: size, height: size, cursor: broken ? "default" : "pointer" }}
        onMouseDown={startPress}
        onMouseUp={stopPress}
        onMouseLeave={stopPress}
        onTouchStart={e => { e.preventDefault(); startPress(); }}
        onTouchEnd={stopPress}
      >
        {/* Progress ring */}
        {!broken && (
          <svg
            width={size} height={size}
            style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)", zIndex: 2 }}
          >
            <circle
              cx={size / 2} cy={size / 2} r={r}
              fill="none"
              stroke="rgba(212,165,116,0.15)"
              strokeWidth="3"
            />
            <circle
              cx={size / 2} cy={size / 2} r={r}
              fill="none"
              stroke="#d4a574"
              strokeWidth="3"
              strokeDasharray={circumference}
              strokeDashoffset={strokeOffset}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 0.04s linear", filter: progress > 0 ? "drop-shadow(0 0 4px #d4a574)" : "none" }}
            />
          </svg>
        )}

        {/* Seal body */}
        <div
          style={{
            position: "absolute",
            inset: 6,
            borderRadius: "50%",
            background: cracking || broken
              ? "radial-gradient(circle at 35% 35%, rgba(196,30,58,0.3) 0%, rgba(107,26,26,0.2) 100%)"
              : "radial-gradient(circle at 35% 35%, #c41e3a 0%, #8b2020 40%, #6b1a1a 100%)",
            boxShadow: pressing
              ? "0 2px 8px rgba(139,32,32,0.4), inset 0 1px 3px rgba(255,255,255,0.1)"
              : broken
                ? "none"
                : "0 4px 16px rgba(139,32,32,0.6), inset 0 2px 4px rgba(255,255,255,0.15), inset 0 -2px 4px rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: pressing ? "scale(0.96)" : cracking ? "scale(1.15)" : "scale(1)",
            opacity: broken ? 0.15 : 1,
            transition: "transform 0.1s, box-shadow 0.15s, opacity 0.4s, background 0.3s",
            zIndex: 1,
            filter: cracking ? "brightness(1.8) blur(1px)" : pressing ? "brightness(1.1)" : "none",
          }}
        >
          {/* Ornate monogram */}
          <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 40 40" fill="none">
            {/* Outer ring detail */}
            <circle cx="20" cy="20" r="18" stroke="rgba(245,240,230,0.2)" strokeWidth="0.5" fill="none"/>
            <circle cx="20" cy="20" r="15" stroke="rgba(245,240,230,0.15)" strokeWidth="0.5" fill="none"/>
            {/* OW letters */}
            <text x="20" y="26" textAnchor="middle"
              style={{ fontFamily: "'Playfair Display', serif", fontSize: "13px", fontWeight: 700, fill: "rgba(245,240,230,0.88)", letterSpacing: "0.5px" }}
            >OW</text>
            {/* Decorative stars */}
            <text x="7" y="22" style={{ fontSize: "5px", fill: "rgba(245,240,230,0.4)" }}>✦</text>
            <text x="31" y="22" style={{ fontSize: "5px", fill: "rgba(245,240,230,0.4)" }}>✦</text>
          </svg>
        </div>

        {/* Crack lines when breaking */}
        {(cracking || broken) && (
          <svg style={{ position: "absolute", inset: 0, zIndex: 3 }} width={size} height={size}>
            <line x1={size*0.5} y1={size*0.1} x2={size*0.4} y2={size*0.6} stroke="rgba(212,165,116,0.6)" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1={size*0.5} y1={size*0.1} x2={size*0.65} y2={size*0.55} stroke="rgba(212,165,116,0.5)" strokeWidth="1" strokeLinecap="round"/>
            <line x1={size*0.3} y1={size*0.4} x2={size*0.7} y2={size*0.6} stroke="rgba(212,165,116,0.4)" strokeWidth="0.8" strokeLinecap="round"/>
            <line x1={size*0.2} y1={size*0.6} x2={size*0.55} y2={size*0.8} stroke="rgba(212,165,116,0.35)" strokeWidth="0.8" strokeLinecap="round"/>
          </svg>
        )}
      </div>

      {showHint && !broken && (
        <p style={{
          fontFamily: "'Crimson Pro', serif",
          fontSize: "12px",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          transition: "color 0.2s",
          color: pressing ? "rgba(212,165,116,0.8)" : "rgba(212,165,116,0.45)",
        } as React.CSSProperties}>
          {pressing
            ? progress < 50 ? "Keep holding…" : "Almost there…"
            : "Hold to break the seal"}
        </p>
      )}
    </div>
  );
}
