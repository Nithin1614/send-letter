"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";

interface StatsData {
  totalDelivered: number;
}

/* ── Single Digit Roller Column for Luxury Odometer Effect ── */
function DigitColumn({ digit }: { digit: string }) {
  const isNumber = !isNaN(parseInt(digit, 10));
  if (!isNumber) {
    return <span style={{ display: "inline-block", padding: "0 2px" }}>{digit}</span>;
  }

  const num = parseInt(digit, 10);

  return (
    <span
      style={{
        display: "inline-block",
        height: "1.15em",
        lineHeight: "1.15em",
        overflow: "hidden",
        position: "relative",
        verticalAlign: "bottom",
        fontVariantNumeric: "tabular-nums",
      }}
    >
      <span
        style={{
          display: "flex",
          flexDirection: "column",
          transform: `translateY(-${num * 10}%)`,
          transition: "transform 1.1s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <span
            key={n}
            style={{
              height: "1.15em",
              lineHeight: "1.15em",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {n}
          </span>
        ))}
      </span>
    </span>
  );
}

export default function LiveDeliveredCounter() {
  const [stats, setStats] = useState<StatsData>({ totalDelivered: 35 });
  const [isGlowActive, setIsGlowActive] = useState<boolean>(false);
  const prevDeliveredRef = useRef<number>(35);
  const isInitialMount = useRef<boolean>(true);

  // Fetch latest stats from API
  async function fetchStats() {
    try {
      const res = await fetch("/api/stats", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (typeof data.totalDelivered === "number") {
          if (!isInitialMount.current && data.totalDelivered > prevDeliveredRef.current) {
            setIsGlowActive(true);
            setTimeout(() => setIsGlowActive(false), 2400);
          }
          isInitialMount.current = false;
          prevDeliveredRef.current = data.totalDelivered;
          setStats({
            totalDelivered: data.totalDelivered,
          });
        }
      }
    } catch (e) {
      console.warn("Stats fetch note:", e);
    }
  }

  // Real-time Supabase subscription + polling fallback
  useEffect(() => {
    fetchStats();

    const interval = setInterval(fetchStats, 3500);

    let channel: any;
    try {
      channel = supabase
        .channel("realtime-letter-counter")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "ow_letters" },
          () => {
            fetchStats();
          }
        )
        .subscribe();
    } catch (err) {
      console.warn("Realtime channel subscription note:", err);
    }

    return () => {
      clearInterval(interval);
      if (channel) {
        try {
          supabase.removeChannel(channel);
        } catch {}
      }
    };
  }, []);

  const formattedNumber = stats.totalDelivered.toLocaleString();

  return (
    <>
      <style jsx>{`
        @keyframes specularSheen {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        @keyframes jewelBreath {
          0%, 100% {
            opacity: 0.85;
            box-shadow: 0 0 8px rgba(74, 222, 128, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.6);
          }
          50% {
            opacity: 1;
            box-shadow: 0 0 14px rgba(74, 222, 128, 0.9), inset 0 1px 1px rgba(255, 255, 255, 0.9);
          }
        }

        .luxury-badge {
          position: relative;
          background: linear-gradient(145deg, rgba(22, 8, 14, 0.78) 0%, rgba(10, 3, 6, 0.88) 100%);
          border: 1px solid rgba(212, 165, 116, 0.28);
          border-radius: 9999px;
          padding: 10px 24px;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          box-shadow: 0 16px 40px -10px rgba(0, 0, 0, 0.7),
                      inset 0 1px 0 rgba(255, 255, 255, 0.14),
                      inset 0 -1px 0 rgba(212, 165, 116, 0.12);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          overflow: hidden;
        }

        .luxury-badge::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 225, 180, 0.05) 45%,
            rgba(255, 240, 200, 0.12) 50%,
            rgba(255, 225, 180, 0.05) 55%,
            transparent 100%
          );
          background-size: 200% 100%;
          animation: specularSheen 7s ease-in-out infinite;
          pointer-events: none;
        }

        .luxury-badge:hover {
          border-color: rgba(212, 165, 116, 0.55);
          box-shadow: 0 20px 50px -8px rgba(0, 0, 0, 0.8),
                      0 0 30px rgba(212, 165, 116, 0.22),
                      inset 0 1px 0 rgba(255, 255, 255, 0.25);
          transform: translateY(-2px);
        }

        .wax-seal-mini {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: radial-gradient(circle at 35% 30%, #c41e3a 0%, #800e1b 60%, #4a060e 100%);
          border: 1px solid rgba(255, 215, 180, 0.4);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6),
                      inset 0 1px 1px rgba(255, 255, 255, 0.4),
                      inset 0 -1px 2px rgba(0, 0, 0, 0.6);
          display: flex;
          alignItems: center;
          justifyContent: center;
          color: #ffffff;
          font-size: 14px;
          flex-shrink: 0;
          position: relative;
        }
      `}</style>

      <div
        style={{
          display: "inline-flex",
          flexDirection: "column",
          alignItems: "center",
          margin: "24px auto 30px auto",
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* Luxury Capsule */}
        <div
          className="luxury-badge"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          {/* Real-Time Live Status Pill */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              background: "rgba(0, 0, 0, 0.45)",
              border: "1px solid rgba(74, 222, 128, 0.22)",
              borderRadius: 20,
              padding: "4px 11px",
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#4ade80",
                display: "inline-block",
                animation: "jewelBreath 2.8s ease-in-out infinite",
              }}
            />
            <span
              style={{
                fontFamily: "'Crimson Pro', Georgia, serif",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.12em",
                color: "#86efac",
                textTransform: "uppercase",
              }}
            >
              LIVE
            </span>
          </div>

          {/* Vertical Hairline Separator */}
          <div
            style={{
              width: 1,
              height: 18,
              background: "rgba(212, 165, 116, 0.18)",
            }}
          />

          {/* Wax Seal + Odometer Counter + Label */}
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            {/* Handcrafted Wax Seal Emblem */}
            <div className="wax-seal-mini">
              <span style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.5))" }}>❤</span>
            </div>

            {/* Numeric Roller & Text */}
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: 28,
                  fontWeight: 700,
                  color: "#faf8f5",
                  letterSpacing: "-0.01em",
                  textShadow: isGlowActive
                    ? "0 0 24px #ffd700, 0 0 35px #c41e3a"
                    : "0 2px 12px rgba(212, 165, 116, 0.35)",
                  lineHeight: 1,
                  display: "inline-flex",
                  transition: "text-shadow 0.4s ease",
                }}
              >
                {formattedNumber.split("").map((char, index) => (
                  <DigitColumn key={`${index}-${char}`} digit={char} />
                ))}
              </span>
              <span
                style={{
                  fontFamily: "'Crimson Pro', Georgia, serif",
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#d4a574",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                Letters Delivered
              </span>
            </div>
          </div>
        </div>

        {/* Minimalist Subtitle */}
        <div
          style={{
            marginTop: 9,
            fontFamily: "'Crimson Pro', Georgia, serif",
            fontSize: 14,
            color: "rgba(250, 248, 245, 0.55)",
            fontStyle: "italic",
            letterSpacing: "0.03em",
            textAlign: "center",
          }}
        >
          “Because some words are too precious to send in plain text.”
        </div>
      </div>
    </>
  );
}
