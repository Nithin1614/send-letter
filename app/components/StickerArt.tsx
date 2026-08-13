'use client';
import React from 'react';

// ─── Individual Animated SVG Sticker Components ───────────────────────────────
// Each sticker is a self-contained SVG with embedded CSS animations

export function SparkleHeartSticker({ size = 80, animate = true }: { size?: number; animate?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="sh-body" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#ff90c0"/>
          <stop offset="50%" stopColor="#ff4488"/>
          <stop offset="100%" stopColor="#c0124a"/>
        </radialGradient>
        <radialGradient id="sh-shine" cx="30%" cy="28%" r="35%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.85)"/>
          <stop offset="100%" stopColor="rgba(255,255,255,0)"/>
        </radialGradient>
        <filter id="sh-glow">
          <feGaussianBlur stdDeviation="2.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        {animate && (
          <style>{`
            @keyframes sh-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
            @keyframes sh-sparkle { 0%,100%{opacity:1;transform:scale(1) rotate(0deg)} 50%{opacity:0.4;transform:scale(0.6) rotate(180deg)} }
            @keyframes sh-shadow { 0%,100%{transform:scaleX(1);opacity:0.3} 50%{transform:scaleX(0.7);opacity:0.15} }
            .sh-body { animation: sh-float 2.4s ease-in-out infinite; transform-origin: 50px 50px; }
            .sh-sp1 { animation: sh-sparkle 1.8s ease-in-out infinite; transform-origin: 20px 20px; }
            .sh-sp2 { animation: sh-sparkle 1.8s ease-in-out infinite 0.4s; transform-origin: 78px 18px; }
            .sh-sp3 { animation: sh-sparkle 1.8s ease-in-out infinite 0.9s; transform-origin: 82px 60px; }
            .sh-shadow { animation: sh-shadow 2.4s ease-in-out infinite; transform-origin: 50px 92px; }
          `}</style>
        )}
      </defs>
      {/* Shadow */}
      <ellipse className="sh-shadow" cx="50" cy="92" rx="22" ry="4" fill="rgba(0,0,0,0.2)"/>
      {/* Heart body */}
      <g className="sh-body">
        <path d="M50 80 C50 80 12 58 12 34 C12 22 22 14 34 14 C40 14 46 18 50 24 C54 18 60 14 66 14 C78 14 88 22 88 34 C88 58 50 80 50 80Z" fill="url(#sh-body)" filter="url(#sh-glow)"/>
        <path d="M50 80 C50 80 12 58 12 34 C12 22 22 14 34 14 C40 14 46 18 50 24 C54 18 60 14 66 14 C78 14 88 22 88 34 C88 58 50 80 50 80Z" fill="url(#sh-shine)"/>
        {/* Gold ribbon bow */}
        <path d="M38 42 Q50 38 62 42" stroke="#f5c842" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <path d="M40 41 C34 36 32 30 38 30 C44 30 50 38 50 38 C50 38 56 30 62 30 C68 30 66 36 60 41" fill="#f5c842"/>
        <ellipse cx="50" cy="41" rx="4" ry="3" fill="#ffd700"/>
        {/* Ribbon tails */}
        <path d="M46 44 C42 50 38 54 34 52" stroke="#f5c842" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d="M54 44 C58 50 62 54 66 52" stroke="#f5c842" strokeWidth="2" fill="none" strokeLinecap="round"/>
        {/* Highlight */}
        <ellipse cx="34" cy="26" rx="7" ry="5" fill="rgba(255,255,255,0.35)" transform="rotate(-20 34 26)"/>
      </g>
      {/* Sparkles */}
      <g className="sh-sp1">
        <path d="M20 20 L21.5 16 L23 20 L27 21.5 L23 23 L21.5 27 L20 23 L16 21.5Z" fill="#fff176"/>
      </g>
      <g className="sh-sp2">
        <path d="M78 18 L79 15 L80 18 L83 19 L80 20 L79 23 L78 20 L75 19Z" fill="#fff9c4"/>
      </g>
      <g className="sh-sp3">
        <path d="M82 60 L83 57 L84 60 L87 61 L84 62 L83 65 L82 62 L79 61Z" fill="#ffe57f"/>
      </g>
    </svg>
  );
}

export function GoldenBowHeartSticker({ size = 80, animate = true }: { size?: number; animate?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="gbh-body" cx="38%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#ff79b2"/>
          <stop offset="45%" stopColor="#e91e6a"/>
          <stop offset="100%" stopColor="#880a3d"/>
        </radialGradient>
        <radialGradient id="gbh-bow" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#ffe066"/>
          <stop offset="100%" stopColor="#e6a800"/>
        </radialGradient>
        {animate && (
          <style>{`
            @keyframes gbh-bounce { 0%,100%{transform:translateY(0) scale(1)} 40%{transform:translateY(-6px) scale(1.04)} 70%{transform:translateY(-2px) scale(0.98)} }
            @keyframes gbh-bow-spin { 0%,100%{transform:scale(1) rotate(-3deg)} 50%{transform:scale(1.1) rotate(3deg)} }
            .gbh-heart { animation: gbh-bounce 2.2s cubic-bezier(.36,.07,.19,.97) infinite; transform-origin:50px 50px; }
            .gbh-bow { animation: gbh-bow-spin 2.2s ease-in-out infinite; transform-origin:50px 40px; }
          `}</style>
        )}
      </defs>
      <g className="gbh-heart">
        <path d="M50 82 C50 82 10 57 10 33 C10 20 20 12 32 12 C40 12 46 17 50 24 C54 17 60 12 68 12 C80 12 90 20 90 33 C90 57 50 82 50 82Z" fill="url(#gbh-body)"/>
        <ellipse cx="32" cy="26" rx="8" ry="6" fill="rgba(255,255,255,0.28)" transform="rotate(-25 32 26)"/>
      </g>
      <g className="gbh-bow">
        {/* Left wing */}
        <path d="M30 36 C22 28 20 22 28 22 C36 22 48 34 50 38" fill="url(#gbh-bow)"/>
        {/* Right wing */}
        <path d="M70 36 C78 28 80 22 72 22 C64 22 52 34 50 38" fill="url(#gbh-bow)"/>
        {/* Center knot */}
        <ellipse cx="50" cy="38" rx="5" ry="4" fill="#ffd740"/>
        <ellipse cx="50" cy="38" rx="2.5" ry="2" fill="#fff176"/>
        {/* Ribbon tails */}
        <path d="M46 42 Q38 52 32 55" stroke="#ffc400" strokeWidth="3" fill="none" strokeLinecap="round"/>
        <path d="M54 42 Q62 52 68 55" stroke="#ffc400" strokeWidth="3" fill="none" strokeLinecap="round"/>
        <path d="M46 42 Q35 54 30 58" stroke="#ffe57f" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <path d="M54 42 Q65 54 70 58" stroke="#ffe57f" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      </g>
    </svg>
  );
}

export function LoveLetterSticker({ size = 80, animate = true }: { size?: number; animate?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="ll-env" cx="50%" cy="40%" r="70%">
          <stop offset="0%" stopColor="#ffe8f0"/>
          <stop offset="100%" stopColor="#f8bbd0"/>
        </radialGradient>
        {animate && (
          <style>{`
            @keyframes ll-wiggle { 0%,100%{transform:rotate(-4deg)} 50%{transform:rotate(4deg)} }
            @keyframes ll-heart-beat { 0%,100%{transform:scale(1)} 30%{transform:scale(1.2)} 60%{transform:scale(0.95)} }
            @keyframes ll-sparkle2 { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0;transform:scale(0.2)} }
            .ll-env { animation: ll-wiggle 2s ease-in-out infinite; transform-origin: 50px 55px; }
            .ll-heart { animation: ll-heart-beat 1.5s ease-in-out infinite; transform-origin: 50px 50px; }
            .ll-sp { animation: ll-sparkle2 2s ease-in-out infinite; }
            .ll-sp2 { animation: ll-sparkle2 2s ease-in-out infinite 0.7s; }
          `}</style>
        )}
      </defs>
      <g className="ll-env">
        {/* Envelope body */}
        <rect x="12" y="32" width="76" height="52" rx="5" fill="url(#ll-env)" stroke="#e91e8c" strokeWidth="2"/>
        {/* Envelope flap closed look with dotted border */}
        <path d="M12 37 L50 60 L88 37" stroke="#e91e8c" strokeWidth="2" fill="none"/>
        <path d="M12 32 L50 55 L88 32" fill="#fce4ec" stroke="#e91e8c" strokeWidth="1.5"/>
        {/* Bottom fold lines */}
        <path d="M12 84 L38 62" stroke="#e91e8c" strokeWidth="1.5" strokeDasharray="0"/>
        <path d="M88 84 L62 62" stroke="#e91e8c" strokeWidth="1.5"/>
        {/* Pink polka dot pattern on envelope */}
        <circle cx="25" cy="70" r="2" fill="#f48fb1" opacity="0.5"/>
        <circle cx="75" cy="70" r="2" fill="#f48fb1" opacity="0.5"/>
        <circle cx="50" cy="75" r="2" fill="#f48fb1" opacity="0.5"/>
        {/* Wax seal circle */}
        <circle cx="50" cy="60" r="12" fill="#e91e8c" stroke="#fff" strokeWidth="1.5"/>
        {/* Heart on seal */}
        <g className="ll-heart">
          <path d="M50 67 C50 67 41 61 41 56 C41 53 43.5 51 46 51 C47.5 51 49 52 50 53.5 C51 52 52.5 51 54 51 C56.5 51 59 53 59 56 C59 61 50 67 50 67Z" fill="white"/>
        </g>
        {/* Cute eyes on envelope */}
        <circle cx="40" cy="48" r="3" fill="#e91e8c"/>
        <circle cx="60" cy="48" r="3" fill="#e91e8c"/>
        <circle cx="41" cy="47" r="1" fill="white"/>
        <circle cx="61" cy="47" r="1" fill="white"/>
        {/* Blush circles */}
        <ellipse cx="34" cy="53" rx="4" ry="2.5" fill="#f48fb1" opacity="0.6"/>
        <ellipse cx="66" cy="53" rx="4" ry="2.5" fill="#f48fb1" opacity="0.6"/>
      </g>
      {/* Corner sparkles */}
      <g className="ll-sp">
        <path d="M18 22 L19 18 L20 22 L24 23 L20 24 L19 28 L18 24 L14 23Z" fill="#f8bbd0"/>
      </g>
      <g className="ll-sp2">
        <path d="M80 24 L81 21 L82 24 L85 25 L82 26 L81 29 L80 26 L77 25Z" fill="#e91e8c"/>
      </g>
    </svg>
  );
}

export function CupidsArrowSticker({ size = 80, animate = true }: { size?: number; animate?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {animate && (
          <style>{`
            @keyframes ca-shoot { 0%{transform:translate(0,0) rotate(-35deg)} 50%{transform:translate(4px,-4px) rotate(-35deg)} 100%{transform:translate(0,0) rotate(-35deg)} }
            @keyframes ca-trail { 0%,100%{opacity:0.7;stroke-dashoffset:0} 50%{opacity:0.2;stroke-dashoffset:20} }
            @keyframes ca-heart2 { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.15);opacity:0.85} }
            .ca-arrow { animation: ca-shoot 2s ease-in-out infinite; transform-origin:50px 50px; }
            .ca-heart2 { animation: ca-heart2 1.5s ease-in-out infinite; transform-origin:75px 28px; }
          `}</style>
        )}
      </defs>
      <g className="ca-arrow">
        {/* Arrow shaft */}
        <line x1="20" y1="78" x2="78" y2="22" stroke="#8B4513" strokeWidth="3.5" strokeLinecap="round"/>
        {/* Arrowhead */}
        <polygon points="78,22 70,20 72,30" fill="#e53935"/>
        <polygon points="78,22 68,24 72,30" fill="#c62828"/>
        {/* Fletching (feathers) */}
        <path d="M24 74 C16 70 12 62 16 60 C18 58 22 62 24 68 Z" fill="#43a047"/>
        <path d="M24 74 C18 76 14 68 18 66 C20 64 24 68 24 74 Z" fill="#66bb6a"/>
        <path d="M28 70 C22 64 20 56 24 54 C26 52 30 56 30 64 Z" fill="#81c784"/>
        {/* Arrow tip sparkle */}
        <circle cx="78" cy="22" r="3" fill="#ffeb3b" opacity="0.8"/>
      </g>
      {/* Small pink heart near tip */}
      <g className="ca-heart2">
        <path d="M75 28 C75 28 68 22 68 18 C68 15.5 70 14 72 14 C73.3 14 74.5 14.8 75 16 C75.5 14.8 76.7 14 78 14 C80 14 82 15.5 82 18 C82 22 75 28 75 28Z" fill="#e91e8c"/>
        <ellipse cx="71" cy="17" rx="2" ry="1.5" fill="rgba(255,255,255,0.35)" transform="rotate(-20 71 17)"/>
      </g>
    </svg>
  );
}

export function BirthdayCakeSticker({ size = 80, animate = true }: { size?: number; animate?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bc-top" cx="50%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#f8bbd0"/>
          <stop offset="100%" stopColor="#ec407a"/>
        </radialGradient>
        {animate && (
          <style>{`
            @keyframes bc-flame { 0%,100%{transform:scaleX(1) scaleY(1)} 33%{transform:scaleX(0.8) scaleY(1.2)} 66%{transform:scaleX(1.1) scaleY(0.9)} }
            @keyframes bc-float3 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
            @keyframes bc-sparkle3 { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.2;transform:scale(0.4) rotate(90deg)} }
            .bc-main { animation: bc-float3 2.5s ease-in-out infinite; transform-origin:50px 65px; }
            .bc-f1 { animation: bc-flame 0.8s ease-in-out infinite; transform-origin:32px 30px; }
            .bc-f2 { animation: bc-flame 0.8s ease-in-out infinite 0.15s; transform-origin:50px 30px; }
            .bc-f3 { animation: bc-flame 0.8s ease-in-out infinite 0.3s; transform-origin:68px 30px; }
            .bc-sp { animation: bc-sparkle3 1.8s ease-in-out infinite; }
            .bc-sp2 { animation: bc-sparkle3 1.8s ease-in-out infinite 0.5s; }
          `}</style>
        )}
      </defs>
      <g className="bc-main">
        {/* Cake base layers */}
        <rect x="18" y="62" width="64" height="22" rx="5" fill="#f06292"/>
        <rect x="18" y="62" width="64" height="22" rx="5" fill="url(#bc-top)" opacity="0.6"/>
        <rect x="22" y="50" width="56" height="16" rx="4" fill="#f8bbd0"/>
        {/* Frosting drips on top layer */}
        <path d="M22 50 C28 44 36 52 44 48 C52 44 60 52 68 48 C72 46 76 48 78 50" fill="#fff9c4" stroke="none"/>
        {/* Decorative dots on cake */}
        <circle cx="32" cy="72" r="3" fill="#fff9c4"/>
        <circle cx="50" cy="72" r="3" fill="#fff9c4"/>
        <circle cx="68" cy="72" r="3" fill="#fff9c4"/>
        <circle cx="41" cy="62" r="3" fill="#f8bbd0"/>
        <circle cx="59" cy="62" r="3" fill="#f8bbd0"/>
        {/* Candle sticks */}
        <rect x="29" y="38" width="6" height="14" rx="3" fill="#f9a825"/>
        <rect x="47" y="36" width="6" height="16" rx="3" fill="#7c4dff"/>
        <rect x="65" y="38" width="6" height="14" rx="3" fill="#e53935"/>
        {/* Candle stripes */}
        <rect x="29" y="41" width="6" height="2" fill="#fff9c4" opacity="0.5"/>
        <rect x="47" y="39" width="6" height="2" fill="#fff9c4" opacity="0.5"/>
        <rect x="65" y="41" width="6" height="2" fill="#fff9c4" opacity="0.5"/>
      </g>
      {/* Flames */}
      <g className="bc-f1">
        <ellipse cx="32" cy="34" rx="3.5" ry="5" fill="#ffca28"/>
        <ellipse cx="32" cy="35" rx="2" ry="3" fill="#ff7043"/>
        <ellipse cx="32" cy="36" rx="1" ry="1.5" fill="#fff"/>
      </g>
      <g className="bc-f2">
        <ellipse cx="50" cy="32" rx="3.5" ry="5" fill="#ffca28"/>
        <ellipse cx="50" cy="33" rx="2" ry="3" fill="#ff7043"/>
        <ellipse cx="50" cy="34" rx="1" ry="1.5" fill="#fff"/>
      </g>
      <g className="bc-f3">
        <ellipse cx="68" cy="34" rx="3.5" ry="5" fill="#ffca28"/>
        <ellipse cx="68" cy="35" rx="2" ry="3" fill="#ff7043"/>
        <ellipse cx="68" cy="36" rx="1" ry="1.5" fill="#fff"/>
      </g>
      {/* Sparkles */}
      <g className="bc-sp">
        <path d="M14 38 L15 34 L16 38 L20 39 L16 40 L15 44 L14 40 L10 39Z" fill="#fff176" opacity="0.9"/>
      </g>
      <g className="bc-sp2">
        <path d="M82 42 L83 39 L84 42 L87 43 L84 44 L83 47 L82 44 L79 43Z" fill="#ffe57f" opacity="0.9"/>
      </g>
    </svg>
  );
}

export function TeddyHugSticker({ size = 80, animate = true }: { size?: number; animate?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {animate && (
          <style>{`
            @keyframes th-bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
            @keyframes th-arm-l { 0%,100%{transform:rotate(-5deg)} 50%{transform:rotate(10deg)} }
            @keyframes th-arm-r { 0%,100%{transform:rotate(5deg)} 50%{transform:rotate(-10deg)} }
            @keyframes th-ear { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
            .th-body { animation: th-bounce 2s ease-in-out infinite; transform-origin:50px 60px; }
            .th-arm-l { animation: th-arm-l 2s ease-in-out infinite; transform-origin:28px 60px; }
            .th-arm-r { animation: th-arm-r 2s ease-in-out infinite; transform-origin:72px 60px; }
          `}</style>
        )}
      </defs>
      {/* Body */}
      <g className="th-body">
        {/* Ears */}
        <circle cx="32" cy="28" r="12" fill="#c8a876"/>
        <circle cx="68" cy="28" r="12" fill="#c8a876"/>
        <circle cx="32" cy="28" r="7" fill="#e8c99a"/>
        <circle cx="68" cy="28" r="7" fill="#e8c99a"/>
        {/* Head */}
        <circle cx="50" cy="40" r="24" fill="#c8a876"/>
        {/* Face */}
        <ellipse cx="50" cy="44" rx="14" ry="10" fill="#e8c99a"/>
        {/* Eyes */}
        <circle cx="42" cy="37" r="4" fill="#3e2723"/>
        <circle cx="58" cy="37" r="4" fill="#3e2723"/>
        <circle cx="43.5" cy="35.5" r="1.5" fill="white"/>
        <circle cx="59.5" cy="35.5" r="1.5" fill="white"/>
        {/* Nose */}
        <ellipse cx="50" cy="43" rx="3.5" ry="2.5" fill="#5d4037"/>
        {/* Smile */}
        <path d="M45 47 Q50 52 55 47" stroke="#5d4037" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
        {/* Blush */}
        <ellipse cx="38" cy="42" rx="5" ry="3" fill="#ef9a9a" opacity="0.7"/>
        <ellipse cx="62" cy="42" rx="5" ry="3" fill="#ef9a9a" opacity="0.7"/>
        {/* Body torso */}
        <ellipse cx="50" cy="72" rx="18" ry="16" fill="#c8a876"/>
        {/* Belly */}
        <ellipse cx="50" cy="74" rx="11" ry="9" fill="#e8c99a"/>
        {/* Bow tie */}
        <path d="M42 64 C38 60 38 56 42 58 C46 60 50 64 50 64 C50 64 54 60 58 58 C62 56 62 60 58 64" fill="#ef5350"/>
        <ellipse cx="50" cy="64" rx="3" ry="2.5" fill="#e53935"/>
        {/* Legs */}
        <ellipse cx="38" cy="86" rx="9" ry="6" fill="#c8a876"/>
        <ellipse cx="62" cy="86" rx="9" ry="6" fill="#c8a876"/>
        {/* Paw pads */}
        <circle cx="38" cy="89" r="3" fill="#e8c99a"/>
        <circle cx="62" cy="89" r="3" fill="#e8c99a"/>
      </g>
      {/* Arms (animated separately) */}
      <g className="th-arm-l">
        <ellipse cx="26" cy="62" rx="9" ry="7" fill="#c8a876" transform="rotate(-25 26 62)"/>
      </g>
      <g className="th-arm-r">
        <ellipse cx="74" cy="62" rx="9" ry="7" fill="#c8a876" transform="rotate(25 74 62)"/>
      </g>
      {/* Sparkles on teddy */}
      <g style={{ animation: animate ? 'sh-sparkle 2s ease-in-out infinite' : 'none', transformOrigin:'14px 55px' }}>
        <path d="M14 55 L15 52 L16 55 L19 56 L16 57 L15 60 L14 57 L11 56Z" fill="#fff9c4" opacity="0.85"/>
      </g>
      <g style={{ animation: animate ? 'sh-sparkle 2s ease-in-out infinite 0.6s' : 'none', transformOrigin:'86px 50px' }}>
        <path d="M86 50 L87 47 L88 50 L91 51 L88 52 L87 55 L86 52 L83 51Z" fill="#ffe57f" opacity="0.85"/>
      </g>
    </svg>
  );
}

// ─── PREMIUM Stickers ─────────────────────────────────────────────────────────

export function BalloonBearSticker({ size = 80, animate = true }: { size?: number; animate?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {animate && (
          <style>{`
            @keyframes bb-sway { 0%,100%{transform:rotate(-4deg)} 50%{transform:rotate(4deg)} }
            @keyframes bb-balloon { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
            .bb-bear { animation: bb-sway 2.5s ease-in-out infinite; transform-origin:50px 70px; }
            .bb-balloon { animation: bb-balloon 2s ease-in-out infinite; transform-origin:62px 18px; }
          `}</style>
        )}
      </defs>
      <g className="bb-balloon">
        {/* Balloon */}
        <ellipse cx="62" cy="18" rx="16" ry="20" fill="#ef5350"/>
        <ellipse cx="62" cy="18" rx="16" ry="20" fill="url(#bb-shine)" opacity="0.5"/>
        <ellipse cx="56" cy="10" rx="6" ry="4" fill="rgba(255,255,255,0.4)" transform="rotate(-30 56 10)"/>
        <path d="M58 36 L60 42 L64 42 L62 36Z" fill="#e53935"/>
        {/* String */}
        <path d="M62 42 Q58 52 52 58" stroke="#9e9e9e" strokeWidth="1.5" fill="none"/>
      </g>
      <g className="bb-bear">
        {/* Bear ears */}
        <circle cx="33" cy="52" r="8" fill="#a1887f"/>
        <circle cx="60" cy="52" r="8" fill="#a1887f"/>
        <circle cx="33" cy="52" r="4.5" fill="#d7b899"/>
        <circle cx="60" cy="52" r="4.5" fill="#d7b899"/>
        {/* Bear head */}
        <circle cx="46" cy="62" r="18" fill="#a1887f"/>
        {/* Snout */}
        <ellipse cx="46" cy="68" rx="10" ry="7" fill="#d7b899"/>
        {/* Eyes */}
        <circle cx="39" cy="60" r="3.5" fill="#4e342e"/>
        <circle cx="53" cy="60" r="3.5" fill="#4e342e"/>
        <circle cx="40" cy="58.5" r="1.3" fill="white"/>
        <circle cx="54" cy="58.5" r="1.3" fill="white"/>
        {/* Nose */}
        <ellipse cx="46" cy="66" rx="3" ry="2" fill="#4e342e"/>
        {/* Smile */}
        <path d="M41 70 Q46 75 51 70" stroke="#4e342e" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        {/* Blush */}
        <ellipse cx="36" cy="65" rx="4.5" ry="2.8" fill="#ef9a9a" opacity="0.65"/>
        <ellipse cx="56" cy="65" rx="4.5" ry="2.8" fill="#ef9a9a" opacity="0.65"/>
        {/* Arm holding string */}
        <ellipse cx="56" cy="58" rx="7" ry="5" fill="#a1887f" transform="rotate(-40 56 58)"/>
        {/* Heart on cheek */}
        <path d="M36 57 C36 57 33 54 33 52.5 C33 51.5 34 51 35 51 C35.5 51 36 51.3 36 52 C36 51.3 36.5 51 37 51 C38 51 39 51.5 39 52.5 C39 54 36 57 36 57Z" fill="#e91e8c"/>
      </g>
    </svg>
  );
}

export function CuteKittenSticker({ size = 80, animate = true }: { size?: number; animate?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {animate && (
          <style>{`
            @keyframes ck-tail { 0%,100%{transform:rotate(-10deg)} 50%{transform:rotate(20deg)} }
            @keyframes ck-blink { 0%,85%,100%{transform:scaleY(1)} 90%{transform:scaleY(0.1)} }
            @keyframes ck-bob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
            .ck-body { animation: ck-bob 2s ease-in-out infinite; transform-origin:50px 60px; }
            .ck-eye-l { animation: ck-blink 3s ease-in-out infinite; transform-origin:40px 52px; }
            .ck-eye-r { animation: ck-blink 3s ease-in-out infinite 0.1s; transform-origin:60px 52px; }
            .ck-tail { animation: ck-tail 2s ease-in-out infinite; transform-origin:30px 82px; }
          `}</style>
        )}
      </defs>
      <g className="ck-tail">
        <path d="M30 82 Q15 70 20 58 Q25 48 35 50" stroke="#ffcc80" strokeWidth="7" fill="none" strokeLinecap="round"/>
        <path d="M30 82 Q15 70 20 58 Q25 48 35 50" stroke="#ffe0b2" strokeWidth="4" fill="none" strokeLinecap="round"/>
      </g>
      <g className="ck-body">
        {/* Pointed ears */}
        <polygon points="30,35 22,18 40,28" fill="#ffcc80"/>
        <polygon points="70,35 78,18 60,28" fill="#ffcc80"/>
        <polygon points="32,34 26,22 40,30" fill="#ffab40"/>
        <polygon points="68,34 74,22 60,30" fill="#ffab40"/>
        {/* Head */}
        <circle cx="50" cy="48" r="26" fill="#ffcc80"/>
        {/* Face patch */}
        <ellipse cx="50" cy="54" rx="14" ry="10" fill="#ffe0b2"/>
        {/* Big sparkle eyes */}
        <g className="ck-eye-l">
          <circle cx="40" cy="52" r="7" fill="#1565c0"/>
          <circle cx="40" cy="52" r="5" fill="#1976d2"/>
          <circle cx="40" cy="52" r="3.5" fill="#0d47a1"/>
          <circle cx="38" cy="49" r="2.5" fill="white"/>
          <circle cx="42" cy="53" r="1" fill="white" opacity="0.6"/>
        </g>
        <g className="ck-eye-r">
          <circle cx="60" cy="52" r="7" fill="#7b1fa2"/>
          <circle cx="60" cy="52" r="5" fill="#8e24aa"/>
          <circle cx="60" cy="52" r="3.5" fill="#6a1b9a"/>
          <circle cx="58" cy="49" r="2.5" fill="white"/>
          <circle cx="62" cy="53" r="1" fill="white" opacity="0.6"/>
        </g>
        {/* Nose */}
        <path d="M47 57 L50 60 L53 57 Q50 55 47 57Z" fill="#e91e8c"/>
        {/* Whiskers */}
        <line x1="20" y1="57" x2="40" y2="56" stroke="#9e9e9e" strokeWidth="1" opacity="0.8"/>
        <line x1="20" y1="60" x2="40" y2="60" stroke="#9e9e9e" strokeWidth="1" opacity="0.8"/>
        <line x1="60" y1="56" x2="80" y2="57" stroke="#9e9e9e" strokeWidth="1" opacity="0.8"/>
        <line x1="60" y1="60" x2="80" y2="60" stroke="#9e9e9e" strokeWidth="1" opacity="0.8"/>
        {/* Blush */}
        <ellipse cx="32" cy="58" rx="5" ry="3" fill="#f48fb1" opacity="0.7"/>
        <ellipse cx="68" cy="58" rx="5" ry="3" fill="#f48fb1" opacity="0.7"/>
        {/* Mouth */}
        <path d="M46 61 Q50 65 54 61" stroke="#e91e8c" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        {/* Body */}
        <ellipse cx="50" cy="78" rx="16" ry="12" fill="#ffcc80"/>
        <ellipse cx="50" cy="80" rx="9" ry="7" fill="#ffe0b2"/>
        {/* Paws */}
        <ellipse cx="36" cy="86" rx="7" ry="4" fill="#ffcc80"/>
        <ellipse cx="64" cy="86" rx="7" ry="4" fill="#ffcc80"/>
        {/* Collar with heart */}
        <rect x="38" y="69" width="24" height="5" rx="2.5" fill="#e91e8c"/>
        <path d="M50 70 C50 70 47 68 47 66.5 C47 65.5 48 65 49 65 C49.5 65 50 65.3 50 65.8 C50 65.3 50.5 65 51 65 C52 65 53 65.5 53 66.5 C53 68 50 70 50 70Z" fill="#fff9c4"/>
      </g>
    </svg>
  );
}

export function CrimsonRoseSticker({ size = 80, animate = true }: { size?: number; animate?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {animate && (
          <style>{`
            @keyframes cr-sway2 { 0%,100%{transform:rotate(-3deg)} 50%{transform:rotate(3deg)} }
            @keyframes cr-glow { 0%,100%{opacity:0.3} 50%{opacity:0.8} }
            .cr-rose { animation: cr-sway2 3s ease-in-out infinite; transform-origin:50px 80px; }
            .cr-glow { animation: cr-glow 2s ease-in-out infinite; }
            .cr-sp { animation: cr-glow 1.5s ease-in-out infinite; }
            .cr-sp2 { animation: cr-glow 1.5s ease-in-out infinite 0.5s; }
            .cr-sp3 { animation: cr-glow 1.5s ease-in-out infinite 1s; }
          `}</style>
        )}
      </defs>
      <g className="cr-rose">
        {/* Stem */}
        <path d="M50 70 Q46 80 44 88" stroke="#388e3c" strokeWidth="3" strokeLinecap="round"/>
        {/* Leaves */}
        <path d="M48 76 Q38 72 36 65 Q42 68 48 76Z" fill="#43a047"/>
        <path d="M48 80 Q60 75 62 68 Q56 71 48 80Z" fill="#388e3c"/>
        {/* Rose petals - outer */}
        <path d="M50 16 C44 20 34 30 36 42 C38 52 46 56 50 58 C54 56 62 52 64 42 C66 30 56 20 50 16Z" fill="#b71c1c"/>
        <path d="M28 28 C26 38 30 52 40 56 C42 50 42 40 38 32 C36 28 32 26 28 28Z" fill="#c62828"/>
        <path d="M72 28 C74 38 70 52 60 56 C58 50 58 40 62 32 C64 28 68 26 72 28Z" fill="#c62828"/>
        <path d="M22 46 C22 58 30 66 42 68 C42 62 36 54 28 50 C25 48 22 46 22 46Z" fill="#d32f2f"/>
        <path d="M78 46 C78 58 70 66 58 68 C58 62 64 54 72 50 C75 48 78 46 78 46Z" fill="#d32f2f"/>
        {/* Middle petals */}
        <path d="M50 24 C46 28 40 36 42 46 C44 52 48 56 50 58 C52 56 56 52 58 46 C60 36 54 28 50 24Z" fill="#e53935"/>
        <path d="M38 34 C34 42 36 54 44 58 C44 52 42 44 40 38 C39 35 38 34 38 34Z" fill="#e53935"/>
        <path d="M62 34 C66 42 64 54 56 58 C56 52 58 44 60 38 C61 35 62 34 62 34Z" fill="#e53935"/>
        {/* Center bloom */}
        <circle cx="50" cy="44" r="10" fill="#ef5350"/>
        <path d="M50 34 C47 38 44 44 46 50 C48 54 50 56 50 56 C50 56 52 54 54 50 C56 44 53 38 50 34Z" fill="#e53935"/>
        <circle cx="50" cy="46" r="6" fill="#c62828"/>
        <circle cx="50" cy="46" r="3" fill="#b71c1c"/>
        {/* Highlights */}
        <ellipse cx="44" cy="32" rx="4" ry="3" fill="rgba(255,255,255,0.2)" transform="rotate(-20 44 32)"/>
      </g>
      {/* Sparkles */}
      <g className="cr-sp">
        <path d="M16 35 L17 32 L18 35 L21 36 L18 37 L17 40 L16 37 L13 36Z" fill="#ffe57f"/>
      </g>
      <g className="cr-sp2">
        <path d="M82 30 L83 27 L84 30 L87 31 L84 32 L83 35 L82 32 L79 31Z" fill="#fff9c4"/>
      </g>
      <g className="cr-sp3">
        <path d="M76 60 L77 58 L78 60 L80 61 L78 62 L77 64 L76 62 L74 61Z" fill="#ffe57f"/>
      </g>
    </svg>
  );
}

export function RibbonHeartSticker({ size = 80, animate = true }: { size?: number; animate?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="rh-heart" cx="38%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#ff8a80"/>
          <stop offset="50%" stopColor="#e53935"/>
          <stop offset="100%" stopColor="#b71c1c"/>
        </radialGradient>
        {animate && (
          <style>{`
            @keyframes rh-pulse { 0%,100%{transform:scale(1)} 40%{transform:scale(1.07)} 70%{transform:scale(0.97)} }
            @keyframes rh-bow2 { 0%,100%{transform:scale(1) rotate(-4deg)} 50%{transform:scale(1.12) rotate(4deg)} }
            @keyframes rh-glow2 { 0%,100%{opacity:0.2} 50%{opacity:0.6} }
            .rh-heart { animation: rh-pulse 1.6s cubic-bezier(0.4,0,0.2,1) infinite; transform-origin:50px 48px; }
            .rh-bow { animation: rh-bow2 2s ease-in-out infinite; transform-origin:50px 30px; }
            .rh-glow { animation: rh-glow2 1.6s ease-in-out infinite; }
          `}</style>
        )}
      </defs>
      {/* Outer glow */}
      <g className="rh-glow">
        <path d="M50 85 C50 85 8 60 8 32 C8 18 18 10 30 10 C38 10 45 14 50 22 C55 14 62 10 70 10 C82 10 92 18 92 32 C92 60 50 85 50 85Z" fill="#ff8a80" opacity="0.2"/>
      </g>
      <g className="rh-heart">
        {/* Heart */}
        <path d="M50 82 C50 82 10 58 10 34 C10 20 20 12 32 12 C40 12 46 17 50 24 C54 17 60 12 68 12 C80 12 90 20 90 34 C90 58 50 82 50 82Z" fill="url(#rh-heart)"/>
        {/* Heart highlights */}
        <ellipse cx="30" cy="26" rx="9" ry="6" fill="rgba(255,255,255,0.25)" transform="rotate(-30 30 26)"/>
        <ellipse cx="70" cy="24" rx="6" ry="4" fill="rgba(255,255,255,0.15)" transform="rotate(20 70 24)"/>
      </g>
      <g className="rh-bow">
        {/* Bow left wing */}
        <path d="M28 32 C20 24 18 16 26 16 C34 16 46 28 50 33" fill="#ffd54f"/>
        {/* Bow right wing */}
        <path d="M72 32 C80 24 82 16 74 16 C66 16 54 28 50 33" fill="#ffca28"/>
        {/* Center knot */}
        <ellipse cx="50" cy="33" rx="6" ry="5" fill="#ffc107"/>
        <ellipse cx="50" cy="33" rx="3" ry="2.5" fill="#fff9c4"/>
        {/* Ribbon tails */}
        <path d="M45 37 Q38 48 32 52" stroke="#ffca28" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
        <path d="M55 37 Q62 48 68 52" stroke="#ffca28" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
        <path d="M44 37 Q36 50 30 55" stroke="#fff9c4" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <path d="M56 37 Q64 50 70 55" stroke="#fff9c4" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      </g>
    </svg>
  );
}

export function PlayfulPugSticker({ size = 80, animate = true }: { size?: number; animate?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {animate && (
          <style>{`
            @keyframes pp-head { 0%,100%{transform:rotate(-5deg)} 50%{transform:rotate(5deg)} }
            @keyframes pp-tongue { 0%,100%{transform:translateY(0) rotate(-3deg)} 50%{transform:translateY(3px) rotate(3deg)} }
            @keyframes pp-heart3 { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.3);opacity:0.7} }
            .pp-head { animation: pp-head 2s ease-in-out infinite; transform-origin:50px 50px; }
            .pp-tongue { animation: pp-tongue 1.5s ease-in-out infinite; transform-origin:50px 72px; }
            .pp-heart { animation: pp-heart3 1.5s ease-in-out infinite; }
          `}</style>
        )}
      </defs>
      <g className="pp-head">
        {/* Body */}
        <ellipse cx="50" cy="78" rx="20" ry="14" fill="#bcaaa4"/>
        {/* Head */}
        <circle cx="50" cy="48" r="28" fill="#d7ccc8"/>
        {/* Head wrinkles */}
        <path d="M36 40 Q50 36 64 40" stroke="#bcaaa4" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d="M38 34 Q50 30 62 34" stroke="#bcaaa4" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        {/* Dark muzzle */}
        <ellipse cx="50" cy="56" rx="16" ry="12" fill="#8d6e63"/>
        {/* Flat nose */}
        <ellipse cx="50" cy="52" rx="8" ry="5" fill="#5d4037"/>
        <ellipse cx="47" cy="51" rx="2.5" ry="2" fill="#795548"/>
        <ellipse cx="53" cy="51" rx="2.5" ry="2" fill="#795548"/>
        {/* Big sparkle eyes */}
        <circle cx="38" cy="46" r="7" fill="#ffc107"/>
        <circle cx="62" cy="46" r="7" fill="#ffc107"/>
        <circle cx="38" cy="46" r="5" fill="#ff8f00"/>
        <circle cx="62" cy="46" r="5" fill="#ff8f00"/>
        <circle cx="38" cy="46" r="3.5" fill="#4e342e"/>
        <circle cx="62" cy="46" r="3.5" fill="#4e342e"/>
        <circle cx="36.5" cy="43.5" r="2" fill="white"/>
        <circle cx="60.5" cy="43.5" r="2" fill="white"/>
        {/* Wrinkles around eyes */}
        <path d="M30 42 Q34 38 38 40" stroke="#bcaaa4" strokeWidth="1.5" fill="none"/>
        <path d="M70 42 Q66 38 62 40" stroke="#bcaaa4" strokeWidth="1.5" fill="none"/>
        {/* Blush hearts instead of plain circles */}
        <g className="pp-heart">
          <path d="M32 55 C32 55 28 51 28 48.5 C28 47 29 46 30.5 46 C31.3 46 32 46.5 32 47.5 C32 46.5 32.7 46 33.5 46 C35 46 36 47 36 48.5 C36 51 32 55 32 55Z" fill="#e91e8c" opacity="0.8"/>
        </g>
        <g className="pp-heart" style={{ animationDelay: '0.3s' }}>
          <path d="M68 55 C68 55 64 51 64 48.5 C64 47 65 46 66.5 46 C67.3 46 68 46.5 68 47.5 C68 46.5 68.7 46 69.5 46 C71 46 72 47 72 48.5 C72 51 68 55 68 55Z" fill="#e91e8c" opacity="0.8"/>
        </g>
        {/* Ears */}
        <ellipse cx="26" cy="36" rx="10" ry="12" fill="#8d6e63" transform="rotate(-10 26 36)"/>
        <ellipse cx="74" cy="36" rx="10" ry="12" fill="#8d6e63" transform="rotate(10 74 36)"/>
        <ellipse cx="26" cy="36" rx="6" ry="8" fill="#6d4c41" transform="rotate(-10 26 36)"/>
        <ellipse cx="74" cy="36" rx="6" ry="8" fill="#6d4c41" transform="rotate(10 74 36)"/>
      </g>
      {/* Tongue */}
      <g className="pp-tongue">
        <ellipse cx="50" cy="72" rx="7" ry="9" fill="#f48fb1"/>
        <path d="M43 72 Q50 80 57 72" fill="#f06292"/>
        <path d="M50 64 L50 72" stroke="#e91e8c" strokeWidth="1.5"/>
      </g>
    </svg>
  );
}

export function LovePotionSticker({ size = 80, animate = true }: { size?: number; animate?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="lp-liquid" cx="50%" cy="60%" r="50%">
          <stop offset="0%" stopColor="#e040fb"/>
          <stop offset="100%" stopColor="#7b1fa2"/>
        </radialGradient>
        {animate && (
          <style>{`
            @keyframes lp-float2 { 0%,100%{transform:translateY(0) rotate(-2deg)} 50%{transform:translateY(-5px) rotate(2deg)} }
            @keyframes lp-bubble { 0%{transform:translateY(0) scale(1);opacity:0.8} 100%{transform:translateY(-15px) scale(0.3);opacity:0} }
            @keyframes lp-heart4 { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.25);opacity:0.8} }
            .lp-bottle { animation: lp-float2 2.5s ease-in-out infinite; transform-origin:50px 60px; }
            .lp-b1 { animation: lp-bubble 2s ease-out infinite; }
            .lp-b2 { animation: lp-bubble 2s ease-out infinite 0.6s; }
            .lp-b3 { animation: lp-bubble 2s ease-out infinite 1.2s; }
            .lp-heart4 { animation: lp-heart4 1.5s ease-in-out infinite; }
          `}</style>
        )}
      </defs>
      <g className="lp-bottle">
        {/* Bottle neck */}
        <rect x="42" y="22" width="16" height="20" rx="4" fill="#ce93d8"/>
        {/* Cork */}
        <rect x="40" y="16" width="20" height="10" rx="5" fill="#a1887f"/>
        <rect x="43" y="12" width="14" height="6" rx="3" fill="#8d6e63"/>
        {/* Bottle body */}
        <path d="M30 40 Q28 50 28 62 Q28 80 50 84 Q72 80 72 62 Q72 50 70 40Z" fill="#ba68c8"/>
        <path d="M30 40 Q28 50 28 62 Q28 80 50 84 Q72 80 72 62 Q72 50 70 40Z" fill="url(#lp-liquid)" opacity="0.85"/>
        {/* Liquid level line */}
        <path d="M30 55 Q50 50 70 55" stroke="rgba(255,255,255,0.25)" strokeWidth="2" fill="none"/>
        {/* Bottle highlight */}
        <path d="M34 44 Q33 55 34 65" stroke="rgba(255,255,255,0.4)" strokeWidth="3" strokeLinecap="round"/>
        {/* Star on bottle */}
        <path d="M50 58 L52 64 L58 64 L53 68 L55 74 L50 70 L45 74 L47 68 L42 64 L48 64Z" fill="rgba(255,255,255,0.3)"/>
      </g>
      {/* Floating hearts and bubbles */}
      <g className="lp-b1">
        <path d="M60 40 C60 40 56 36 56 33 C56 31.5 57 30 58.5 30 C59.3 30 60 30.5 60 31.5 C60 30.5 60.7 30 61.5 30 C63 30 64 31.5 64 33 C64 36 60 40 60 40Z" fill="#ce93d8"/>
      </g>
      <g className="lp-b2">
        <path d="M50 32 C50 32 47 28 47 25.5 C47 24 48 23 49.5 23 C50.3 23 51 23.5 51 24.5 C51 23.5 51.7 23 52.5 23 C54 23 55 24 55 25.5 C55 28 51 32 51 32Z" fill="#f48fb1"/>
      </g>
      <g className="lp-b3">
        <path d="M40 38 C40 38 37 35 37 33 C37 31.8 38 31 39 31 C39.5 31 40 31.3 40 32 C40 31.3 40.5 31 41 31 C42 31 43 31.8 43 33 C43 35 40 38 40 38Z" fill="#e040fb"/>
      </g>
    </svg>
  );
}

export function ChampagneToastSticker({ size = 80, animate = true }: { size?: number; animate?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {animate && (
          <style>{`
            @keyframes ct-clink { 0%,100%{transform:rotate(0deg)} 10%{transform:rotate(-8deg)} 20%{transform:rotate(8deg)} 30%{transform:rotate(-4deg)} 40%{transform:rotate(4deg)} 50%,100%{transform:rotate(0deg)} }
            @keyframes ct-bubble2 { 0%{transform:translateY(0);opacity:0.9} 100%{transform:translateY(-12px);opacity:0} }
            @keyframes ct-star { 0%,100%{opacity:1;transform:scale(1) rotate(0deg)} 50%{opacity:0.2;transform:scale(0.4) rotate(180deg)} }
            .ct-left { animation: ct-clink 3s ease-in-out infinite; transform-origin:36px 75px; }
            .ct-right { animation: ct-clink 3s ease-in-out infinite 0.1s reverse; transform-origin:64px 75px; }
            .ct-b1 { animation: ct-bubble2 1.5s ease-out infinite; }
            .ct-b2 { animation: ct-bubble2 1.5s ease-out infinite 0.5s; }
            .ct-b3 { animation: ct-bubble2 1.5s ease-out infinite 1s; }
            .ct-star { animation: ct-star 1.5s ease-in-out infinite; }
            .ct-star2 { animation: ct-star 1.5s ease-in-out infinite 0.5s; }
          `}</style>
        )}
      </defs>
      {/* Left glass */}
      <g className="ct-left">
        <path d="M22 22 L34 52 L32 56 L40 56 L38 52 L50 22Z" fill="rgba(255,255,255,0.25)" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"/>
        {/* Champagne liquid */}
        <path d="M26 36 L34 52 L38 52 L46 36Z" fill="#ffe57f" opacity="0.7"/>
        <path d="M26 36 L38 36" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1"/>
        {/* Stem */}
        <line x1="36" y1="56" x2="36" y2="72" stroke="rgba(255,255,255,0.6)" strokeWidth="2"/>
        <ellipse cx="36" cy="73" rx="8" ry="2.5" fill="rgba(255,255,255,0.4)"/>
      </g>
      {/* Right glass */}
      <g className="ct-right">
        <path d="M50 22 L62 52 L60 56 L68 56 L66 52 L78 22Z" fill="rgba(255,255,255,0.25)" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"/>
        {/* Liquid */}
        <path d="M54 36 L62 52 L66 52 L74 36Z" fill="#ffe57f" opacity="0.7"/>
        <path d="M54 36 L74 36" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1"/>
        {/* Stem */}
        <line x1="64" y1="56" x2="64" y2="72" stroke="rgba(255,255,255,0.6)" strokeWidth="2"/>
        <ellipse cx="64" cy="73" rx="8" ry="2.5" fill="rgba(255,255,255,0.4)"/>
      </g>
      {/* Bubbles */}
      <circle className="ct-b1" cx="30" cy="44" r="2" fill="rgba(255,255,255,0.6)"/>
      <circle className="ct-b2" cx="34" cy="40" r="1.5" fill="rgba(255,255,255,0.6)"/>
      <circle className="ct-b3" cx="28" cy="38" r="1" fill="rgba(255,255,255,0.6)"/>
      {/* Star burst at clink point */}
      <g className="ct-star">
        <path d="M50 22 L51.5 17 L53 22 L58 23.5 L53 25 L51.5 30 L50 25 L45 23.5Z" fill="#ffe57f"/>
      </g>
      <g className="ct-star2">
        <path d="M16 28 L17 24 L18 28 L22 29 L18 30 L17 34 L16 30 L12 29Z" fill="#fff9c4" opacity="0.8"/>
      </g>
      <g className="ct-star2" style={{ animationDelay: '0.3s' }}>
        <path d="M80 28 L81 24 L82 28 L86 29 L82 30 L81 34 L80 30 L76 29Z" fill="#fff9c4" opacity="0.8"/>
      </g>
    </svg>
  );
}

export function BearHeartSticker({ size = 80, animate = true }: { size?: number; animate?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bh2-heart" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#ff8a80"/>
          <stop offset="60%" stopColor="#e53935"/>
          <stop offset="100%" stopColor="#b71c1c"/>
        </radialGradient>
        {animate && (
          <style>{`
            @keyframes bh2-bear { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
            @keyframes bh2-heart5 { 0%,100%{transform:scale(1)} 30%{transform:scale(1.08)} 60%{transform:scale(0.97)} }
            @keyframes bh2-sparkle5 { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.2;transform:scale(0.4) rotate(90deg)} }
            .bh2-bear { animation: bh2-bear 2.2s ease-in-out infinite; transform-origin:50px 55px; }
            .bh2-heart { animation: bh2-heart5 1.5s ease-in-out infinite; transform-origin:50px 70px; }
            .bh2-sp { animation: bh2-sparkle5 2s ease-in-out infinite; }
            .bh2-sp2 { animation: bh2-sparkle5 2s ease-in-out infinite 0.7s; }
          `}</style>
        )}
      </defs>
      <g className="bh2-bear">
        {/* Ears */}
        <circle cx="32" cy="28" r="11" fill="#8d6e63"/>
        <circle cx="68" cy="28" r="11" fill="#8d6e63"/>
        <circle cx="32" cy="28" r="6" fill="#d7b899"/>
        <circle cx="68" cy="28" r="6" fill="#d7b899"/>
        {/* Head */}
        <circle cx="50" cy="42" r="22" fill="#a1887f"/>
        {/* Face */}
        <ellipse cx="50" cy="46" rx="13" ry="9" fill="#d7b899"/>
        {/* Eyes */}
        <circle cx="42" cy="38" r="4" fill="#4e342e"/>
        <circle cx="58" cy="38" r="4" fill="#4e342e"/>
        <circle cx="43" cy="36.5" r="1.5" fill="white"/>
        <circle cx="59" cy="36.5" r="1.5" fill="white"/>
        {/* Nose */}
        <ellipse cx="50" cy="44" rx="3" ry="2" fill="#5d4037"/>
        {/* Blush */}
        <ellipse cx="39" cy="43" rx="4.5" ry="2.8" fill="#ef9a9a" opacity="0.7"/>
        <ellipse cx="61" cy="43" rx="4.5" ry="2.8" fill="#ef9a9a" opacity="0.7"/>
        {/* Bear body (behind heart) */}
        <ellipse cx="50" cy="68" rx="15" ry="10" fill="#a1887f"/>
        {/* Arms around heart */}
        <path d="M32 60 Q28 70 34 76" stroke="#a1887f" strokeWidth="9" strokeLinecap="round" fill="none"/>
        <path d="M68 60 Q72 70 66 76" stroke="#a1887f" strokeWidth="9" strokeLinecap="round" fill="none"/>
      </g>
      {/* Big heart the bear is hugging */}
      <g className="bh2-heart">
        <path d="M50 86 C50 86 24 70 24 54 C24 44 30 38 38 38 C43 38 47.5 41 50 46 C52.5 41 57 38 62 38 C70 38 76 44 76 54 C76 70 50 86 50 86Z" fill="url(#bh2-heart)"/>
        <ellipse cx="36" cy="48" rx="7" ry="5" fill="rgba(255,255,255,0.25)" transform="rotate(-25 36 48)"/>
      </g>
      {/* Sparkles */}
      <g className="bh2-sp">
        <path d="M14 46 L15 42 L16 46 L20 47 L16 48 L15 52 L14 48 L10 47Z" fill="#fff9c4" opacity="0.9"/>
      </g>
      <g className="bh2-sp2">
        <path d="M82 44 L83 41 L84 44 L87 45 L84 46 L83 49 L82 46 L79 45Z" fill="#ffe57f" opacity="0.9"/>
      </g>
    </svg>
  );
}

// ─── Sticker Renderer (central lookup) ───────────────────────────────────────
const STICKER_COMPONENTS: Record<string, React.FC<{ size?: number; animate?: boolean }>> = {
  'sparkle-heart': SparkleHeartSticker,
  'golden-bow-heart': GoldenBowHeartSticker,
  'love-letter': LoveLetterSticker,
  'cupids-arrow': CupidsArrowSticker,
  'birthday-cake': BirthdayCakeSticker,
  'teddy-hug': TeddyHugSticker,
  'balloon-bear': BalloonBearSticker,
  'cute-kitten': CuteKittenSticker,
  'crimson-rose': CrimsonRoseSticker,
  'ribbon-heart': RibbonHeartSticker,
  'playful-pug': PlayfulPugSticker,
  'love-potion': LovePotionSticker,
  'champagne-toast': ChampagneToastSticker,
  'bear-heart': BearHeartSticker,
};

export function StickerRenderer({ id, size = 80, animate = true }: { id: string; size?: number; animate?: boolean }) {
  const Component = STICKER_COMPONENTS[id];
  if (!Component) return <span style={{ fontSize: size * 0.5 }}>✨</span>;
  return <Component size={size} animate={animate} />;
}
