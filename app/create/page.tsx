'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { StickerRenderer } from '@/app/components/StickerArt';
import { TEMPLATE_PRESETS, QUICK_PILLS_DATA } from '@/lib/templates';

// ─── Types ────────────────────────────────────────────────────────────────────
type FontOption = 'Classic' | 'Flowing' | 'Elegant' | 'Casual' | 'Retro' | 'Poetic' | 'Typewriter' | 'Sacramento' | 'Parisienne';
type GuardianType = 'none' | 'time' | 'question';
type Difficulty = 'easy' | 'wait';

const FONT_MAP: Record<FontOption, string> = {
  Classic: "'Crimson Pro', Georgia, serif",
  Flowing: "'Dancing Script', cursive",
  Elegant: "'Cormorant Garamond', Georgia, serif",
  Casual: "'Caveat', cursive",
  Retro: "'Pacifico', cursive",
  Poetic: "'Great Vibes', cursive",
  Typewriter: "'Special Elite', monospace",
  Sacramento: "'Sacramento', cursive",
  Parisienne: "'Parisienne', cursive",
};

// ─── Theme thumbnails ─────────────────────────────────────────────────────────
const THEMES = [
  { id: 'gradient', label: 'GRADIENTS', items: [
    { name: 'Classic Burgundy', bg: 'radial-gradient(ellipse at 50% 30%, #1a080b 0%, #100406 55%, #080203 100%)' },
    { name: 'Sunset',           bg: 'linear-gradient(180deg, #3d122e 0%, #7e2438 35%, #ca4830 65%, #f59638 100%)' },
    { name: 'Aurora',           bg: 'radial-gradient(circle at 30% 30%, #7b2cbf 0%, #3a0ca3 45%, #10002b 100%)' },
  ]},
  { id: 'paper', label: 'PAPER', items: [
    { name: 'Soft Paper',         bg: 'radial-gradient(ellipse at 50% 40%, #4a3e2e 0%, #32281c 55%, #1c150e 100%)' },
    { name: 'Linen',              bg: 'radial-gradient(ellipse at 50% 35%, #3c2d1e 0%, #261a10 50%, #140d07 100%)' },
    { name: 'Vintage Parchment',  bg: 'radial-gradient(ellipse at 45% 35%, #4c3214 0%, #34200a 45%, #1e1004 80%, #0d0601 100%)' },
  ]},
  { id: 'pattern', label: 'PATTERNS', items: [
    { name: 'Midnight Stars', bg: 'linear-gradient(180deg, #0d0d26 0%, #16163e 60%, #07071a 100%)' },
    { name: 'Falling Hearts', bg: 'linear-gradient(135deg, #3a0e24 0%, #4a1028 48%, #280616 100%)' },
    { name: 'Vines & Roses',  bg: 'linear-gradient(135deg, #320a1e 0%, #480c28 50%, #18040e 100%)' },
  ]},
];

// Full-page background that changes when user picks a theme
const THEME_PAGE_BG: Record<string, string> = {
  'Classic Burgundy':   'radial-gradient(ellipse at 50% 20%, #301624 0%, #1c0b15 55%, #10050c 100%)',
  'Sunset':             'linear-gradient(180deg, #24081c 0%, #4a1028 30%, #8c2034 60%, #ca4830 85%, #e87830 100%)',
  'Aurora':             'radial-gradient(ellipse at 50% 25%, #2a0b38 0%, #160624 50%, #080210 100%)',
  'Soft Paper':         'radial-gradient(ellipse at 50% 40%, #2e2418 0%, #1e160e 55%, #120d08 100%)',
  'Linen':              'radial-gradient(ellipse at 50% 35%, #2a1e12 0%, #1b120a 50%, #100a04 100%)',
  'Vintage Parchment':  'radial-gradient(ellipse at 45% 35%, #3c220c 0%, #281406 45%, #160a02 80%, #0b0401 100%)',
  'Midnight Stars':     'linear-gradient(180deg, #09091e 0%, #121232 50%, #060614 100%)',
  'Falling Hearts':     'linear-gradient(135deg, #2a0b18 0%, #460f26 48%, #1c0510 100%)',
  'Vines & Roses':      'linear-gradient(135deg, #260818 0%, #400a22 50%, #14030c 100%)',
};

// Star positions for Midnight Stars pattern overlay
const STARS = [
  {x:'7%',y:'18%',r:1.8},{x:'23%',y:'8%',r:1.2},{x:'38%',y:'22%',r:1.5},{x:'55%',y:'10%',r:1},{x:'68%',y:'28%',r:1.8},{x:'82%',y:'12%',r:1.2},
  {x:'12%',y:'48%',r:1},{x:'30%',y:'60%',r:1.5},{x:'45%',y:'38%',r:1.2},{x:'60%',y:'55%',r:1.8},{x:'75%',y:'40%',r:1},{x:'90%',y:'60%',r:1.5},
  {x:'18%',y:'80%',r:1.2},{x:'40%',y:'75%',r:1},{x:'58%',y:'82%',r:1.8},{x:'78%',y:'72%',r:1.2},{x:'92%',y:'85%',r:1},{x:'5%',y:'90%',r:1.5},
];

// ─── Envelope styles ──────────────────────────────────────────────────────────
const ENVELOPES = [
  { name: 'Classic Wax',        bg: '#f5f0e0', accent: '#c0392b' },
  { name: 'Silk Ribbon',        bg: '#f8d7e3', accent: '#e91e8c' },
  { name: 'Twine & Botanical',  bg: '#c8a87a', accent: '#6b4c2a' },
  { name: 'Vintage Crest',      bg: '#d4af37', accent: '#8b6914' },
  { name: 'Floral Washi',       bg: '#f9c8d4', accent: '#e9768a' },
  { name: 'Lace & Pearl',       bg: '#f5e8ee', accent: '#d4a8b8' },
  { name: 'Gold Wax Drip',      bg: '#d4af37', accent: '#a07820' },
  { name: 'Velvet & Tassel',    bg: '#3d0c22', accent: '#8b1c42' },
  { name: 'Midnight Onyx',      bg: '#1c1c1c', accent: '#d4a574' },
  { name: 'Royal Obsidian',     bg: '#0d1b2a', accent: '#415a77' },
  { name: 'Gothic Rose',        bg: '#2b0612', accent: '#a82040' },
  { name: 'Emerald Mystic',     bg: '#092615', accent: '#2a9d8f' },
];

const ENVELOPE_STYLES: Record<string, { bodyColor: string; sealColor: string; sealIcon: string }> = {
  'Classic Wax':       { bodyColor: 'linear-gradient(135deg, #f5f2eb 0%, #e6e0d2 100%)', sealColor: 'radial-gradient(circle at 38% 32%, #e0303a, #8b2020)', sealIcon: '❤️' },
  'Silk Ribbon':       { bodyColor: 'linear-gradient(135deg, #fce8f0 0%, #f4d0e0 100%)', sealColor: 'transparent', sealIcon: '🎀' },
  'Twine & Botanical': { bodyColor: 'linear-gradient(135deg, #c8a87a 0%, #a8885a 100%)', sealColor: 'radial-gradient(circle at 38% 32%, #3a7550, #0d2a18)', sealIcon: '🌿' },
  'Vintage Crest':     { bodyColor: 'linear-gradient(135deg, #e6ca94 0%, #c9a66b 100%)', sealColor: 'radial-gradient(circle at 38% 32%, #fcd34d, #78350f)', sealIcon: '👑' },
  'Floral Washi':      { bodyColor: 'linear-gradient(135deg, #f8f4ec 0%, #ede6d8 100%)', sealColor: 'radial-gradient(circle at 38% 32%, #e060a0, #a83070)', sealIcon: '🌸' },
  'Lace & Pearl':      { bodyColor: 'linear-gradient(135deg, #fdf4f7 0%, #f4e0e8 100%)', sealColor: 'radial-gradient(circle at 38% 32%, #ffffff, #b09eb0)', sealIcon: '🤍' },
  'Gold Wax Drip':     { bodyColor: 'linear-gradient(135deg, #f7f2e8 0%, #e8dec8 100%)', sealColor: 'radial-gradient(circle at 38% 32%, #fcd34d, #78350f)', sealIcon: '✦' },
  'Velvet & Tassel':   { bodyColor: 'linear-gradient(135deg, #4a0d24 0%, #2a0414 100%)', sealColor: 'radial-gradient(circle at 38% 32%, #fcd34d, #78350f)', sealIcon: '🎗️' },
  'Midnight Onyx':     { bodyColor: 'linear-gradient(135deg, #1c1c24 0%, #0a0a10 100%)', sealColor: 'radial-gradient(circle at 38% 32%, #e0e0e0, #707070)', sealIcon: '🌙' },
  'Royal Obsidian':    { bodyColor: 'linear-gradient(135deg, #0d1b2a 0%, #040814 100%)', sealColor: 'radial-gradient(circle at 38% 32%, #778da9, #1b263b)', sealIcon: '⚔️' },
  'Gothic Rose':       { bodyColor: 'linear-gradient(135deg, #2b0612 0%, #120207 100%)', sealColor: 'radial-gradient(circle at 38% 32%, #800a20, #30020a)', sealIcon: '🥀' },
  'Emerald Mystic':    { bodyColor: 'linear-gradient(135deg, #092615 0%, #031208 100%)', sealColor: 'radial-gradient(circle at 38% 32%, #fcd34d, #78350f)', sealIcon: '✨' },
};

// ─── Songs ────────────────────────────────────────────────────────────────────
const POPULAR_SONGS = [
  { id: 'perfect',       art: '💿', name: 'Perfect',          artist: 'Ed Sheeran' },
  { id: 'all-of-me',    art: '❤️', name: 'All of Me',        artist: 'John Legend' },
  { id: 'at-last',      art: '🎵', name: 'At Last',           artist: 'Etta James' },
  { id: 'thinking-out', art: '🎶', name: 'Thinking Out Loud', artist: 'Ed Sheeran' },
];

// ─── Quick pill presets ───────────────────────────────────────────────────────
const QUICK_PILLS: { label: string; title: string }[] = [
  { label: 'Miss you',     title: 'Open when you miss me' },
  { label: 'Sad day',     title: "Open when you're having a bad day" },
  { label: 'Anniversary', title: 'Open on our anniversary' },
];

interface StickerItem {
  id: string;
  name: string;
  isFree: boolean;
  price?: string;
  emoji: string;
  animType: 'wiggle' | 'pulse' | 'float';
}

const STICKERS_SUITE: { free: StickerItem[]; premium: StickerItem[] } = {
  free: [
    { id: 'sparkle-heart',   name: 'Sparkle Heart',  isFree: true, emoji: '💖', animType: 'pulse' },
    { id: 'golden-bow-heart',name: 'Golden Heart',   isFree: true, emoji: '💝', animType: 'pulse' },
    { id: 'love-letter',     name: 'Love Letter',    isFree: true, emoji: '💌', animType: 'wiggle' },
    { id: 'cupids-arrow',    name: "Cupid's Arrow",  isFree: true, emoji: '🏹', animType: 'float' },
    { id: 'birthday-cake',   name: 'Birthday Cake',  isFree: true, emoji: '🎂', animType: 'pulse' },
    { id: 'teddy-hug',       name: 'Teddy Hug',      isFree: true, emoji: '🧸', animType: 'wiggle' },
  ],
  premium: [
    { id: 'balloon-bear',   name: 'Balloon Bear',   isFree: false, price: '$0.99', emoji: '🎈🧸', animType: 'float' },
    { id: 'cute-kitten',    name: 'Cute Kitten',    isFree: false, price: '$0.99', emoji: '🐱💖', animType: 'wiggle' },
    { id: 'crimson-rose',   name: 'Crimson Rose',   isFree: false, price: '$0.99', emoji: '🌹',   animType: 'pulse' },
    { id: 'ribbon-heart',   name: 'Ribbon Heart',   isFree: false, price: '$0.99', emoji: '💝',   animType: 'pulse' },
    { id: 'playful-pug',    name: 'Playful Pug',    isFree: false, price: '$0.99', emoji: '🐶😍', animType: 'wiggle' },
    { id: 'love-potion',    name: 'Love Potion',    isFree: false, price: '$0.99', emoji: '🧪💕', animType: 'float' },
    { id: 'champagne-toast',name: 'Champagne Toast',isFree: false, price: '$0.99', emoji: '🥂✨', animType: 'pulse' },
    { id: 'bear-heart',     name: 'Bear Heart',     isFree: false, price: '$0.99', emoji: '🧸❤️', animType: 'wiggle' },
  ],
};

// ─── Accordion section ────────────────────────────────────────────────────────
function Section({
  icon,
  iconClass,
  title,
  subtitle,
  defaultOpen = false,
  children,
}: {
  icon: React.ReactNode;
  iconClass?: string;
  title: string;
  subtitle: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="composer-section">
      <button
        type="button"
        className="composer-section-header"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <div className="composer-section-left">
          <span className={`composer-section-icon ${iconClass || ''}`}>{icon}</span>
          <div>
            <div className="composer-section-title">{title}</div>
            <div className="composer-section-subtitle">{subtitle}</div>
          </div>
        </div>
        <span
          className="composer-section-chevron"
          style={{
            transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            opacity: 0.6,
            fontSize: 13,
            display: 'inline-block',
          }}
        >
          ∨
        </span>
      </button>

      <div
        style={{
          display: 'grid',
          gridTemplateRows: open ? '1fr' : '0fr',
          transition: 'grid-template-rows 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div style={{ overflow: 'hidden' }}>
          <div className="composer-section-body">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Full-page theme overlay ──────────────────────────────────────────────────
function FullPageThemeOverlay({ theme }: { theme: string }) {
  const [scrollY, setScrollY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    function handleScroll() {
      setScrollY(window.scrollY || 0);
    }
    function handleMouseMove(e: MouseEvent) {
      const x = (e.clientX / (window.innerWidth || 1) - 0.5) * 20;
      const y = (e.clientY / (window.innerHeight || 1) - 0.5) * 20;
      setMousePos({ x, y });
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  if (theme === 'Falling Hearts') {
    const HEARTS = [
      { left: '5%', top: '15%', size: 24, delay: '0s' },
      { left: '90%', top: '22%', size: 20, delay: '1.8s' },
      { left: '8%', top: '55%', size: 26, delay: '3.2s' },
      { left: '92%', top: '68%', size: 22, delay: '1.2s' },
      { left: '4%', top: '82%', size: 18, delay: '4.2s' },
      { left: '88%', top: '86%', size: 24, delay: '2.5s' },
    ];
    return (
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden',
        transform: `translate3d(${mousePos.x * 0.15}px, ${-scrollY * 0.05 + mousePos.y * 0.15}px, 0)`,
        transition: 'transform 0.15s ease-out',
      }}>
        {HEARTS.map((h, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: h.left,
              top: h.top,
              fontSize: h.size,
              color: '#f48fb1',
              opacity: 0.5,
              animation: `heartCirculate 8s ease-in-out ${h.delay} infinite`,
            }}
          >
            ♥
          </div>
        ))}
      </div>
    );
  }

  if (theme === 'Midnight Stars') {
    const STARS_FULL = [
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
      { left: '18%', top: '40%', size: 2, delay: '1.1s' },
      { left: '38%', top: '65%', size: 3, delay: '2.4s' },
      { left: '58%', top: '48%', size: 2, delay: '0.9s' },
      { left: '78%', top: '38%', size: 3, delay: '1.7s' },
      { left: '95%', top: '42%', size: 2, delay: '2.3s' },
      { left: '2%', top: '60%', size: 4, delay: '0.4s' },
      { left: '84%', top: '92%', size: 3, delay: '1.6s' },
    ];
    return (
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        {STARS_FULL.map((s, i) => {
          const pY = -scrollY * (0.05 + (i % 3) * 0.03);
          const mX = mousePos.x * 0.3;
          const mY = mousePos.y * 0.3;
          return (
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
                boxShadow: '0 0 12px #ffffff, 0 0 4px #70a0ff',
                transform: `translate3d(${mX}px, ${pY + mY}px, 0)`,
                transition: 'transform 0.12s ease-out',
                animation: `starTwinkle 3s ease-in-out ${s.delay} infinite alternate`,
              }}
            />
          );
        })}
      </div>
    );
  }

  if (theme === 'Enchanted Sparkles') {
    return (
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden', opacity: 0.35,
        transform: `translate3d(${mousePos.x * 0.15}px, ${-scrollY * 0.06 + mousePos.y * 0.15}px, 0)`,
        transition: 'transform 0.12s ease-out',
      }}>
        <svg width="100%" height="100%" opacity="0.4" style={{ position: 'absolute', inset: 0 }}>
          <pattern id="sparklesWallpaper" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M20 12 Q20 20 28 20 Q20 20 20 28 Q20 20 12 20 Q20 20 20 12 Z" fill="#d4a574"/>
            <path d="M60 52 Q60 60 68 60 Q60 60 60 68 Q60 60 52 60 Q60 60 60 52 Z" fill="#d4a574"/>
            <circle cx="60" cy="18" r="1.5" fill="#f5d0a0"/>
            <circle cx="20" cy="58" r="1.5" fill="#f5d0a0"/>
          </pattern>
          <rect width="100%" height="100%" fill="url(#sparklesWallpaper)"/>
        </svg>
      </div>
    );
  }

  if (theme === 'Soft Paper') {
    return (
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden',
        transform: `translate3d(0, ${-scrollY * 0.04}px, 0)`,
      }}>
        <svg width="100%" height="100%" opacity="0.08" style={{ position: 'absolute', inset: 0 }}>
          <filter id="paperNoiseFull">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
          </filter>
          <rect width="100%" height="100%" filter="url(#paperNoiseFull)"/>
        </svg>
      </div>
    );
  }

  if (theme === 'Linen') {
    return (
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden',
        transform: `translate3d(0, ${-scrollY * 0.04}px, 0)`,
      }}>
        <svg width="100%" height="100%" opacity="0.06" style={{ position: 'absolute', inset: 0 }}>
          <pattern id="linenWeaveFull" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 0,10 L 20,10 M 10,0 L 10,20" stroke="#ffffff" strokeWidth="0.8"/>
          </pattern>
          <rect width="100%" height="100%" fill="url(#linenWeaveFull)"/>
        </svg>
      </div>
    );
  }

  if (theme === 'Vintage Parchment') {
    return (
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 50% 30%, rgba(212,165,116,0.18) 0%, transparent 70%)',
          transform: `translate3d(${mousePos.x * 0.3}px, ${-scrollY * 0.05 + mousePos.y * 0.3}px, 0)`,
          transition: 'transform 0.15s ease-out',
        }} />
      </div>
    );
  }

  if (theme === 'Aurora') {
    return (
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: '-15%', left: '5%', width: '90%', height: '70%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(160,40,200,0.22) 0%, rgba(60,20,140,0.28) 50%, transparent 75%)',
          filter: 'blur(70px)',
          transform: `translate3d(${mousePos.x * 0.8}px, ${scrollY * 0.12 + mousePos.y * 0.8}px, 0)`,
          transition: 'transform 0.15s ease-out',
          animation: 'auroraPulse 8s ease-in-out infinite alternate',
        }} />
      </div>
    );
  }

  if (theme === 'Vines & Roses') {
    return (
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden', opacity: 0.3,
        transform: `translate3d(${mousePos.x * 0.15}px, ${-scrollY * 0.05 + mousePos.y * 0.15}px, 0)`,
        transition: 'transform 0.15s ease-out',
      }}>
        <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
          <g stroke="#f48fb1" strokeWidth="1.2" fill="none" opacity="0.45">
            <path d="M 30, 80 Q 50, 220 35, 360 Q 20, 500 45, 650" />
            <circle cx="45" cy="650" r="5" fill="#f48fb1"/>
            <path d="M 940, 120 Q 920, 260 935, 400 Q 950, 550 930, 700" />
            <circle cx="930" cy="700" r="5" fill="#f48fb1"/>
          </g>
        </svg>
      </div>
    );
  }

  if (theme === 'Sunset') {
    return (
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', bottom: '-10%', left: '0', right: '0', height: '60%',
          background: 'radial-gradient(ellipse at 50% 100%, rgba(244,136,56,0.2) 0%, rgba(212,72,48,0.15) 50%, transparent 80%)',
          transform: `translate3d(${mousePos.x * 0.5}px, ${-scrollY * 0.08}px, 0)`,
          transition: 'transform 0.15s ease-out',
        }} />
      </div>
    );
  }

  return null;
}

// Helper component to render exact envelope decoration graphics
function RenderEnvelopeDecor({ envelope, isMini = false }: { envelope: string; isMini?: boolean }) {
  if (envelope === 'Silk Ribbon') {
    return (
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
        {/* Ribbon horizontal band */}
        <div style={{
          position: 'absolute', width: '100%', height: isMini ? 7 : 14,
          background: 'linear-gradient(180deg, #b8305c 0%, #8c1e40 100%)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.25)',
        }} />

        {/* Tied Silk Ribbon Bow */}
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg viewBox="0 0 100 48" width={isMini ? 38 : 74} height={isMini ? 20 : 36}>
            <path d="M48 24 C 30 8, 10 12, 24 24 C 10 36, 30 40, 48 24 Z" fill="url(#ribbonGrad)" stroke="#68122c" strokeWidth="1.5" />
            <path d="M52 24 C 70 8, 90 12, 76 24 C 90 36, 70 40, 52 24 Z" fill="url(#ribbonGrad)" stroke="#68122c" strokeWidth="1.5" />
            <path d="M44 26 L32 44 L40 44 L48 28 Z" fill="#8c1e40" />
            <path d="M56 26 L68 44 L60 44 L52 28 Z" fill="#8c1e40" />
            <ellipse cx="50" cy="24" rx="7" ry="8" fill="#68122c" stroke="#b8305c" strokeWidth="1" />
            <defs>
              <linearGradient id="ribbonGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#d44070" />
                <stop offset="100%" stopColor="#9e2048" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    );
  }

  if (envelope === 'Floral Washi') {
    return (
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
        {/* Horizontal washi tape strip matching Screenshot 5 */}
        <div style={{
          position: 'absolute', width: '92%', height: isMini ? 14 : 26,
          background: '#fde8f0',
          borderTop: '1.5px dashed #f48fb1',
          borderBottom: '1.5px dashed #f48fb1',
          boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-evenly',
          padding: '0 8px',
        }}>
          {/* Floral stems & heart motif */}
          <span style={{ fontSize: isMini ? 9 : 14, color: '#4a7c59' }}>📍</span>
          <span style={{ fontSize: isMini ? 8 : 13, color: '#e91e63' }}>🌸</span>
          <span style={{ fontSize: isMini ? 9 : 15, color: '#c2185b' }}>♥</span>
          <span style={{ fontSize: isMini ? 8 : 13, color: '#e91e63' }}>🌸</span>
          <span style={{ fontSize: isMini ? 9 : 14, color: '#4a7c59' }}>📍</span>
        </div>
      </div>
    );
  }

  if (envelope === 'Twine & Botanical') {
    return (
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
        {/* Twine thread crossed */}
        <div style={{
          position: 'absolute', width: '100%', height: isMini ? 2 : 4,
          background: '#8c643c', boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
        }} />
        {/* Dark green botanical wax seal button */}
        <div style={{
          width: isMini ? 22 : 44, height: isMini ? 22 : 44,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 30%, #3a7550 0%, #1e4d30 60%, #0d2a18 100%)',
          boxShadow: '0 3px 10px rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: isMini ? 10 : 18, zIndex: 2,
        }}>
          🌱
        </div>
      </div>
    );
  }

  if (envelope === 'Vintage Crest') {
    return (
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
        <div style={{
          width: isMini ? 22 : 46, height: isMini ? 22 : 46,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 32%, #fcd34d 0%, #d97706 60%, #78350f 100%)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: isMini ? 10 : 20, zIndex: 2,
        }}>
          👑
        </div>
      </div>
    );
  }

  if (envelope === 'Lace & Pearl') {
    return (
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
        {/* Scalloped lace strip */}
        <div style={{
          position: 'absolute', width: '100%', height: isMini ? 12 : 24,
          background: 'rgba(255, 255, 255, 0.45)',
          borderTop: '1px dashed rgba(240, 200, 220, 0.9)',
          borderBottom: '1px dashed rgba(240, 200, 220, 0.9)',
        }} />
        {/* Glossy 3D pearl bead */}
        <div style={{
          width: isMini ? 12 : 24, height: isMini ? 12 : 24,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 30%, #ffffff 0%, #e2d8e0 70%, #b09eb0 100%)',
          boxShadow: '0 3px 8px rgba(0,0,0,0.35), inset -1px -1px 3px rgba(0,0,0,0.2)',
          zIndex: 2,
        }} />
      </div>
    );
  }

  if (envelope === 'Gold Wax Drip') {
    return (
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
        <div style={{
          width: isMini ? 22 : 44, height: isMini ? 22 : 44,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 32%, #fcd34d 0%, #d97706 60%, #78350f 100%)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: isMini ? 10 : 18, color: '#451a03', fontWeight: 'bold',
          zIndex: 2,
        }}>
          ✦
        </div>
      </div>
    );
  }

  if (envelope === 'Velvet & Tassel') {
    return (
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
        {/* Gold string */}
        <div style={{
          position: 'absolute', width: '100%', height: isMini ? 2 : 3,
          background: 'linear-gradient(90deg, #d4a574, #fcd34d, #d4a574)',
        }} />
        <div style={{ position: 'relative', zIndex: 2, fontSize: isMini ? 12 : 22 }}>
          🎗️
        </div>
      </div>
    );
  }

  if (envelope === 'Midnight Onyx') {
    return (
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', width: '100%', height: isMini ? 2 : 4,
          background: 'linear-gradient(90deg, #505060, #a0a0c0, #505060)',
        }} />
        <div style={{
          width: isMini ? 22 : 44, height: isMini ? 22 : 44,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 30%, #ffffff 0%, #a0a0c0 60%, #404060 100%)',
          boxShadow: '0 4px 12px rgba(255,255,255,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: isMini ? 10 : 18, zIndex: 2,
        }}>
          🌙
        </div>
      </div>
    );
  }

  if (envelope === 'Royal Obsidian') {
    return (
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', width: '100%', height: isMini ? 2 : 3,
          background: 'linear-gradient(90deg, #415a77, #778da9, #415a77)',
        }} />
        <div style={{
          width: isMini ? 22 : 44, height: isMini ? 22 : 44,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 30%, #e0e1dd 0%, #778da9 60%, #1b263b 100%)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: isMini ? 10 : 18, zIndex: 2,
        }}>
          ⚔️
        </div>
      </div>
    );
  }

  if (envelope === 'Gothic Rose') {
    return (
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
        <div style={{
          width: isMini ? 22 : 44, height: isMini ? 22 : 44,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 30%, #800a20 0%, #40020d 60%, #1a0005 100%)',
          boxShadow: '0 4px 14px rgba(128,10,32,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: isMini ? 10 : 18, zIndex: 2,
        }}>
          🥀
        </div>
      </div>
    );
  }

  if (envelope === 'Emerald Mystic') {
    return (
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', width: '100%', height: isMini ? 2 : 3,
          background: 'linear-gradient(90deg, #d4a574, #fcd34d, #d4a574)',
        }} />
        <div style={{
          width: isMini ? 22 : 44, height: isMini ? 22 : 44,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 32%, #fcd34d 0%, #d97706 60%, #78350f 100%)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: isMini ? 10 : 18, zIndex: 2,
        }}>
          ✨
        </div>
      </div>
    );
  }

  // Classic Wax default
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
      <div style={{
        width: isMini ? 22 : 48, height: isMini ? 22 : 48,
        borderRadius: '50%',
        background: 'radial-gradient(circle at 35% 32%, #dc2626 0%, #991b1b 50%, #450a0a 100%)',
        boxShadow: '0 4px 14px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.35)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: isMini ? 10 : 20, zIndex: 2,
      }}>
        {isMini ? '♥' : (
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#260404" strokeWidth="2.2">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        )}
      </div>
    </div>
  );
}

// ─── Voice Message Recorder Component (Matching Screenshot) ───────────────────
function VoiceMessageSection({
  onSaveVoice,
  voiceDataUrl,
  voiceDuration,
}: {
  onSaveVoice: (url: string, duration: number) => void;
  voiceDataUrl: string;
  voiceDuration: number;
}) {
  const [voiceState, setVoiceState] = useState<'idle' | 'recording' | 'preview' | 'denied'>('idle');
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [recordedDataUrl, setRecordedDataUrl] = useState<string>(voiceDataUrl || '');
  const [recordedDuration, setRecordedDuration] = useState<number>(voiceDuration || 0);

  // Audio preview playback states
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [previewCurrentTime, setPreviewCurrentTime] = useState(0);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  // MediaRecorder refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);
  const actualRecordedDurationRef = useRef<number>(voiceDuration || 0);

  // Accordion hint state
  const [showPremiumHint, setShowPremiumHint] = useState(false);

  // Sync prop changes
  useEffect(() => {
    if (voiceDataUrl) {
      setRecordedDataUrl(voiceDataUrl);
      setRecordedDuration(voiceDuration);
      actualRecordedDurationRef.current = voiceDuration;
      setVoiceState('preview');
    }
  }, [voiceDataUrl, voiceDuration]);

  // Handle Recording Start
  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      // Detect supported MIME type
      let mimeType = 'audio/webm;codecs=opus';
      if (typeof MediaRecorder !== 'undefined') {
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          if (MediaRecorder.isTypeSupported('audio/webm')) mimeType = 'audio/webm';
          else if (MediaRecorder.isTypeSupported('audio/mp4')) mimeType = 'audio/mp4';
          else if (MediaRecorder.isTypeSupported('audio/ogg')) mimeType = 'audio/ogg';
          else mimeType = '';
        }
      }

      const options = mimeType ? { mimeType } : undefined;
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      const startTime = Date.now();
      actualRecordedDurationRef.current = 0;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const elapsedSecs = Math.max(1, Math.round((Date.now() - startTime) / 1000));
        const finalDuration = elapsedSecs;
        actualRecordedDurationRef.current = finalDuration;
        setRecordedDuration(finalDuration);

        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType || 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = (reader.result as string) || '';
          setRecordedDataUrl(result);
          onSaveVoice(result, finalDuration);
        };
        reader.readAsDataURL(audioBlob);

        // Stop all audio tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(100);
      setVoiceState('recording');
      setRecordingTime(0);

      // Start 30s max timer
      timerIntervalRef.current = setInterval(() => {
        const elapsed = Math.max(1, Math.floor((Date.now() - startTime) / 1000));
        actualRecordedDurationRef.current = elapsed;
        setRecordingTime(elapsed);
        if (elapsed >= 30) {
          stopRecording();
        }
      }, 100);

    } catch (err) {
      console.error('Microphone access denied or failed', err);
      setVoiceState('denied');
    }
  }

  // Handle Recording Stop
  function stopRecording() {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setVoiceState('preview');
  }

  // Preview Playback
  function togglePreviewPlayback() {
    if (!recordedDataUrl) return;
    if (isPlayingPreview) {
      if (previewAudioRef.current) previewAudioRef.current.pause();
      setIsPlayingPreview(false);
    } else {
      if (previewAudioRef.current) previewAudioRef.current.pause();
      const audio = new Audio(recordedDataUrl);
      previewAudioRef.current = audio;

      audio.onloadedmetadata = () => {
        if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration) && audio.duration > 0) {
          const exactDur = Math.round(audio.duration);
          actualRecordedDurationRef.current = exactDur;
          setRecordedDuration(exactDur);
          onSaveVoice(recordedDataUrl, exactDur);
        }
      };

      audio.ontimeupdate = () => {
        setPreviewCurrentTime(audio.currentTime);
        if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration) && audio.duration > 0) {
          const realDur = Math.round(audio.duration);
          if (realDur !== recordedDuration) {
            setRecordedDuration(realDur);
            actualRecordedDurationRef.current = realDur;
          }
        }
      };

      audio.onended = () => {
        setIsPlayingPreview(false);
        setPreviewCurrentTime(0);
      };

      audio.play().catch(console.error);
      setIsPlayingPreview(true);
    }
  }

  // Seek preview audio on click
  function handleSeek(e: React.MouseEvent<HTMLDivElement>) {
    const effectiveDur = recordedDuration || actualRecordedDurationRef.current || 30;
    if (!previewAudioRef.current || !effectiveDur) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickPos = (e.clientX - rect.left) / rect.width;
    const seekTime = clickPos * effectiveDur;
    previewAudioRef.current.currentTime = seekTime;
    setPreviewCurrentTime(seekTime);
  }

  // Delete Recording
  function handleDeleteRecording() {
    if (previewAudioRef.current) previewAudioRef.current.pause();
    setRecordedDataUrl('');
    setRecordedDuration(0);
    actualRecordedDurationRef.current = 0;
    setVoiceState('idle');
    setIsPlayingPreview(false);
    onSaveVoice('', 0);
  }

  function formatSeconds(s: number) {
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  const effectiveDuration = recordedDuration || actualRecordedDurationRef.current || 30;
  const previewPct = effectiveDuration > 0 ? Math.min(100, (previewCurrentTime / effectiveDuration) * 100) : 0;

  return (
    <Section
      icon={
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: 'radial-gradient(circle at 35% 30%, #8b1824 0%, #500a12 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1px solid rgba(228,32,56,0.3)', color: '#fff', fontSize: 18,
        }}>
          🎙️
        </div>
      }
      iconClass=""
      title="Add a Voice Message ✨"
      subtitle={recordedDataUrl ? `Voice recording saved (${formatSeconds(recordedDuration)})` : 'Say it in your own voice'}
    >
      {/* Top Toggle Button */}
      <button
        onClick={handleDeleteRecording}
        style={{
          width: '100%', padding: '12px 0',
          background: !recordedDataUrl ? 'rgba(212, 165, 116, 0.10)' : 'rgba(255, 255, 255, 0.04)',
          border: !recordedDataUrl ? '1px solid rgba(212, 165, 116, 0.35)' : '1px solid rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(8px)',
          borderRadius: 10, color: !recordedDataUrl ? '#d4a574' : 'rgba(250,248,245,0.6)',
          fontFamily: "'Crimson Pro', serif", fontSize: 14.5,
          cursor: 'pointer', outline: 'none', marginBottom: 16,
          transition: 'all 0.2s ease',
        }}
      >
        No voice message
      </button>

      {/* IDLE STATE: Dashed Upload / Record Zone */}
      {voiceState === 'idle' && (
        <div
          onClick={startRecording}
          style={{
            border: '1px dashed rgba(212,165,116,0.25)',
            borderRadius: 12, padding: '28px 20px',
            textAlign: 'center', cursor: 'pointer',
            background: 'rgba(14, 5, 8, 0.45)',
            transition: 'border-color 0.2s ease, background 0.2s ease',
            marginBottom: 14,
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(212,165,116,0.5)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(212,165,116,0.25)'}
        >
          {/* Centered Microphone Circle */}
          <div style={{
            width: 52, height: 52, borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 30%, #8b1824 0%, #500a12 100%)',
            border: '1px solid rgba(228,32,56,0.35)',
            boxShadow: '0 4px 16px rgba(139,24,36,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, color: '#ffffff', margin: '0 auto 12px auto',
          }}>
            🎙️
          </div>
          <div style={{ fontFamily: "'Crimson Pro', serif", fontSize: 16, fontWeight: 600, color: '#faf8f5', marginBottom: 4 }}>
            Tap to record
          </div>
          <div style={{ fontFamily: "'Crimson Pro', serif", fontSize: 13, color: 'rgba(250,248,245,0.45)' }}>
            Up to 30 seconds
          </div>
        </div>
      )}

      {/* RECORDING STATE: Live Timer & Pulse Ring */}
      {voiceState === 'recording' && (
        <div style={{
          border: '1.5px solid rgba(228,32,56,0.5)',
          borderRadius: 12, padding: '28px 20px',
          textAlign: 'center', background: 'rgba(28, 8, 12, 0.75)',
          marginBottom: 14,
          boxShadow: '0 0 20px rgba(228,32,56,0.25)',
        }}>
          {/* Pulsing Recording Mic Circle */}
          <div
            className="recording-pulse-ring"
            style={{
              width: 56, height: 56, borderRadius: '50%',
              background: '#e03045',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, color: '#ffffff', margin: '0 auto 14px auto',
              boxShadow: '0 0 24px rgba(224,48,69,0.7)',
            }}
          >
            🎙️
          </div>

          <div style={{ fontSize: 11, letterSpacing: '0.12em', color: '#e03045', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>
            RECORDING IN PROGRESS
          </div>

          {/* Live Timer Readout */}
          <div style={{ fontFamily: "'Crimson Pro', serif", fontSize: 24, fontWeight: 700, color: '#faf8f5', marginBottom: 12 }}>
            {formatSeconds(recordingTime)} / 00:30
          </div>

          {/* Progress Bar */}
          <div style={{ width: '80%', height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 9999, margin: '0 auto 18px auto', overflow: 'hidden' }}>
            <div style={{ width: `${(recordingTime / 30) * 100}%`, height: '100%', background: '#e03045', transition: 'width 0.25s linear' }} />
          </div>

          <button
            type="button"
            onClick={stopRecording}
            style={{
              background: '#e03045', border: 'none', color: '#ffffff',
              padding: '10px 22px', borderRadius: 8,
              fontFamily: "'Crimson Pro', serif", fontSize: 14.5, fontWeight: 600,
              cursor: 'pointer', outline: 'none',
              boxShadow: '0 4px 14px rgba(224,48,69,0.4)',
            }}
          >
            ⏹ Stop Recording
          </button>
        </div>
      )}

      {/* PREVIEW STATE: Luxurious Player Card with Waveform & Working Progress Bar */}
      {(voiceState === 'preview' || recordedDataUrl) && (
        <div style={{
          border: '1px solid rgba(255, 215, 180, 0.16)',
          borderRadius: 14, padding: '22px 24px',
          background: 'rgba(30, 10, 18, 0.45)',
          backdropFilter: 'blur(20px) saturate(130%)',
          WebkitBackdropFilter: 'blur(20px) saturate(130%)',
          marginBottom: 16,
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 240, 220, 0.12)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontSize: 11, letterSpacing: '0.12em', color: '#d4a574', fontWeight: 700, textTransform: 'uppercase' }}>
              VOICE MESSAGE PREVIEW
            </span>
            <span style={{ fontSize: 11.5, color: 'rgba(250,248,245,0.45)', fontFamily: "'Crimson Pro', serif", fontStyle: 'italic' }}>
              Length: {formatSeconds(recordedDuration)}
            </span>
          </div>

          {/* Animated Audio Waveform Graphic */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
            height: 28, marginBottom: 16, padding: '0 10px'
          }}>
            {[40, 70, 30, 90, 50, 80, 100, 60, 30, 75, 95, 40, 65, 85, 45, 70, 90, 35].map((h, i) => (
              <div
                key={i}
                style={{
                  width: 3,
                  height: isPlayingPreview ? `${Math.max(20, (h * (0.4 + Math.sin(Date.now() / 150 + i) * 0.6)))}%` : `${h * 0.35}%`,
                  background: isPlayingPreview ? '#d4a574' : 'rgba(212,165,116,0.3)',
                  borderRadius: 9999,
                  transition: 'height 0.15s ease, background 0.2s ease',
                }}
              />
            ))}
          </div>

          {/* Controls & Progress Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
            <button
              type="button"
              onClick={togglePreviewPlayback}
              style={{
                width: 48, height: 48, borderRadius: '50%',
                background: 'radial-gradient(circle at 35% 30%, #e03045 0%, #8b1824 100%)',
                border: '1px solid rgba(228,32,56,0.4)', color: '#ffffff',
                fontSize: 18, cursor: 'pointer', outline: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 18px rgba(224,48,69,0.5)',
                transition: 'all 0.2s ease',
              }}
            >
              {isPlayingPreview ? '⏸' : '▶'}
            </button>

            <div style={{ flex: 1 }}>
              {/* Clickable Seekable Track */}
              <div
                onClick={handleSeek}
                style={{
                  height: 8, background: 'rgba(255,255,255,0.12)',
                  borderRadius: 9999, overflow: 'hidden', cursor: 'pointer',
                  position: 'relative', marginBottom: 6,
                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.5)',
                }}
              >
                <div style={{
                  width: `${previewPct}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #d4a574 0%, #f59e0b 100%)',
                  borderRadius: 9999,
                  boxShadow: '0 0 10px rgba(245,158,11,0.6)',
                  transition: 'width 0.1s linear',
                }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'Crimson Pro', serif", fontSize: 13, color: '#d4a574', fontWeight: 500 }}>
                <span>{formatSeconds(previewCurrentTime)}</span>
                <span>{formatSeconds(recordedDuration)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons: Re-record & Delete */}
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              type="button"
              onClick={startRecording}
              style={{
                flex: 1, padding: '10px 14px',
                background: 'rgba(212,165,116,0.12)',
                border: '1px solid rgba(212,165,116,0.3)',
                borderRadius: 10, color: '#d4a574',
                fontFamily: "'Crimson Pro', serif", fontSize: 14, fontWeight: 500,
                cursor: 'pointer', outline: 'none', transition: 'all 0.2s ease',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              🔄 Re-record
            </button>
            <button
              type="button"
              onClick={handleDeleteRecording}
              style={{
                flex: 1, padding: '10px 14px',
                background: 'rgba(139,24,36,0.25)',
                border: '1px solid rgba(228,32,56,0.3)',
                borderRadius: 10, color: '#f090a8',
                fontFamily: "'Crimson Pro', serif", fontSize: 14, fontWeight: 500,
                cursor: 'pointer', outline: 'none', transition: 'all 0.2s ease',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              🗑️ Delete
            </button>
          </div>
        </div>
      )}

      {/* PERMISSION DENIED ERROR STATE */}
      {voiceState === 'denied' && (
        <div style={{
          border: '1px solid rgba(228,32,56,0.4)',
          borderRadius: 12, padding: '18px 20px',
          background: 'rgba(28, 8, 12, 0.8)', color: '#f090a8',
          fontFamily: "'Crimson Pro', serif", fontSize: 14,
          marginBottom: 14, textAlign: 'center'
        }}>
          <div>Microphone access is needed to record a voice message.</div>
          <div style={{ fontSize: 12.5, color: 'rgba(250,248,245,0.5)', marginTop: 4, marginBottom: 12 }}>
            You can enable microphone access in your browser settings and try again.
          </div>
          <button
            type="button"
            onClick={startRecording}
            style={{
              padding: '6px 16px', background: '#8b1824', border: 'none',
              borderRadius: 6, color: '#fff', fontSize: 13, cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </div>
      )}

      {/* Bottom Accordion Hint Row (Matching Screenshot) */}
      <div
        onClick={() => setShowPremiumHint(h => !h)}
        style={{
          background: 'rgba(14, 5, 8, 0.45)',
          border: '1px solid rgba(85, 28, 35, 0.3)',
          borderRadius: 8, padding: '10px 14px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          cursor: 'pointer', transition: 'background 0.15s ease',
        }}
      >
        <span style={{ fontFamily: "'Crimson Pro', serif", fontSize: 13.5, color: 'rgba(250,248,245,0.7)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 12, color: '#d4a574' }}>♡</span> How do voice messages work?
        </span>
        <span style={{ fontSize: 12, color: 'rgba(212,165,116,0.5)', transform: showPremiumHint ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
          ∨
        </span>
      </div>

      {showPremiumHint && (
        <div style={{
          marginTop: 8, padding: '12px 14px',
          background: 'rgba(10, 4, 6, 0.5)',
          border: '1px solid rgba(212,165,116,0.15)',
          borderRadius: 8, fontFamily: "'Crimson Pro', serif",
          fontSize: 13, color: 'rgba(250,248,245,0.55)', lineHeight: 1.6
        }}>
          Voice recordings carry intimate emotion and warm personality that words alone cannot express. They are preserved in high-fidelity audio format with full end-to-end privacy for your recipient.
        </div>
      )}
    </Section>
  );
}

interface iTunesSong {
  trackId: number;
  trackName: string;
  artistName: string;
  collectionName?: string;
  artworkUrl100: string;
  previewUrl?: string;
}

// ─── Inner (uses useSearchParams) ─────────────────────────────────────────────
function CreatePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTitle = searchParams.get('title') || '';

  // Step state
  const [step, setStep] = useState<1 | 2>(1);

  // Letter fields
  const [title, setTitle] = useState(initialTitle);
  const [message, setMessage] = useState('');
  const [signature, setSignature] = useState('');
  const [font, setFont] = useState<FontOption>('Classic');
  const [theme, setTheme] = useState('Classic Burgundy');
  const [envelope, setEnvelope] = useState('Classic Wax');
  const [selectedSticker, setSelectedSticker] = useState<StickerItem | null>(null);
  const [animateSticker, setAnimateSticker] = useState<boolean>(true);
  
  // iTunes Music Picker States
  const [selectedSong, setSelectedSong] = useState<iTunesSong | null>(null);
  const [popularPicks, setPopularPicks] = useState<iTunesSong[]>([]);
  const [songSearch, setSongSearch] = useState('');
  const [searchResults, setSearchResults] = useState<iTunesSong[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [playingTrackId, setPlayingTrackId] = useState<number | null>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  const [photoEnabled, setPhotoEnabled] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Voice Recording States
  const [voiceDataUrl, setVoiceDataUrl] = useState<string>('');
  const [voiceDuration, setVoiceDuration] = useState<number>(0);

  // Fetch real iTunes popular picks on mount
  useEffect(() => {
    async function loadPopularPicks() {
      try {
        const res = await fetch('https://itunes.apple.com/search?term=Ed+Sheeran+John+Legend+Adele+Taylor+Swift&media=music&entity=song&limit=5');
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          setPopularPicks(data.results.map((item: any) => ({
            trackId: item.trackId,
            trackName: item.trackName,
            artistName: item.artistName,
            collectionName: item.collectionName,
            artworkUrl100: item.artworkUrl100,
            previewUrl: item.previewUrl,
          })));
        }
      } catch (e) {
        console.error('Failed to fetch iTunes popular picks', e);
      }
    }
    loadPopularPicks();
  }, []);

  // Debounced iTunes Search Effect
  useEffect(() => {
    if (!songSearch.trim()) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(songSearch.trim())}&media=music&entity=song&limit=12`);
        const data = await res.json();
        if (data.results) {
          setSearchResults(data.results.map((item: any) => ({
            trackId: item.trackId,
            trackName: item.trackName,
            artistName: item.artistName,
            collectionName: item.collectionName,
            artworkUrl100: item.artworkUrl100,
            previewUrl: item.previewUrl,
          })));
        }
      } catch (e) {
        console.error('iTunes search error', e);
      } finally {
        setSearchLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [songSearch]);

  // Handle Audio Preview Play/Pause
  function handleTogglePreview(song: iTunesSong, e: React.MouseEvent) {
    e.stopPropagation();
    if (!song.previewUrl) return;

    if (playingTrackId === song.trackId) {
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
      }
      setPlayingTrackId(null);
    } else {
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
      }
      audioPreviewRef.current = new Audio(song.previewUrl);
      audioPreviewRef.current.play().catch(console.error);
      audioPreviewRef.current.onended = () => setPlayingTrackId(null);
      setPlayingTrackId(song.trackId);
    }
  }

  // Step 2 fields
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [guardianType, setGuardianType] = useState<GuardianType>('none');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [lockDate, setLockDate] = useState('');

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const t = searchParams.get('title');
    const templateKey = searchParams.get('template');
    if (templateKey && TEMPLATE_PRESETS[templateKey]) {
      const preset = TEMPLATE_PRESETS[templateKey];
      setTitle(preset.title);
      setMessage(preset.message);
      if (preset.font) setFont(preset.font as FontOption);
    } else if (t) {
      setTitle(t);
    }
  }, [searchParams]);

  async function handleSeal() {
    setSubmitting(true);
    try {
      let photoDataUrl = '';
      if (photoEnabled && photoFile) {
        photoDataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve((reader.result as string) || '');
          reader.readAsDataURL(photoFile);
        });
      }

      const res = await fetch('/api/letters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title, message, signature, font, theme, envelope,
          song: selectedSong ? selectedSong.trackName : '',
          songArtist: selectedSong ? selectedSong.artistName : '',
          songArtwork: selectedSong ? selectedSong.artworkUrl100 : '',
          songPreviewUrl: selectedSong ? selectedSong.previewUrl : '',
          sticker: selectedSticker ? selectedSticker.name : '',
          photo: photoDataUrl,
          voiceMessage: voiceDataUrl,
          voiceDuration: voiceDuration,
          guardianType, question, answer, difficulty,
        }),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      router.push(`/manage/${data.id}?token=${data.token}`);
    } catch (e) {
      console.error(e);
      setSubmitting(false);
    }
  }

  const isProSelected = ['Sunset', 'Velvet Night', 'Vintage Parchment', 'Falling Hearts', 'Enchanted Sparkles'].includes(theme);

  return (
    <div
      className="create-page"
      data-theme={theme}
      style={{
        background: THEME_PAGE_BG[theme] || THEME_PAGE_BG['Classic Burgundy'],
        transition: 'background 0.7s ease',
        position: 'relative',
      }}
    >
      <FullPageThemeOverlay theme={theme} />

      <div className="create-inner" style={{ position: 'relative', zIndex: 1 }}>

        {/* Return link (left-aligned matching reference screenshot) */}
        <div style={{ textAlign: 'left', marginBottom: 12 }}>
          <Link href="/" className="create-return">← Return</Link>
        </div>

        {/* Step dots */}
        <div className="step-dots">
          <span className={`step-dot ${step >= 1 ? 'active' : ''} ${step > 1 ? 'done' : ''}`} />
          <span className="step-line" />
          <span className={`step-dot ${step >= 2 ? 'active' : ''}`} />
        </div>

        {/* Header: heart seal + Send Letter text */}
        <div className="create-header">
          <div className="create-header-seal">❤</div>
          <span className="create-header-brand">Send Letter</span>
        </div>
        {/* Subtitle below */}
        <div className="create-header-sub">
          {step === 1 ? 'Write your letter' : 'Guard your words'}
        </div>

        {/* ═══════════════════ STEP 1 ═══════════════════ */}
        {step === 1 && (
          <>

            {/* Template hint (Hidden when title is typed) */}
            {!title.trim() && (
              <Link href="/open-when" className="create-template-hint">
                <span className="create-template-hint-left">
                  <span className="create-template-hint-sparkle">✦</span>
                  <span>Not sure where to start? Browse letter templates</span>
                </span>
                <span className="create-template-hint-arrow">→</span>
              </Link>
            )}

            {/* Quick pills (Hidden when title is typed) */}
            {!title.trim() && (
              <div className="create-quick-pills">
                {QUICK_PILLS_DATA.map(p => (
                  <Link
                    key={p.label}
                    href={`/open-when/${p.slug}`}
                    className="create-quick-pill"
                  >
                    {p.label}
                  </Link>
                ))}
              </div>
            )}

            {/* ── Your Message ── */}
            <Section
              icon="📄"
              iconClass="red"
              title="Your Message"
              subtitle="Write something meaningful"
              defaultOpen
            >
              <label className="field-label">Title (optional)</label>
              <input
                className="field-input"
                placeholder="Open When..."
                value={title}
                onChange={e => setTitle(e.target.value)}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 16 }}>
                <label className="field-label" style={{ margin: 0 }}>Message</label>
                <span style={{ fontSize: 12, color: 'rgba(250,248,245,0.3)', fontFamily: "'Crimson Pro', serif" }}>
                  {message.length}/8000
                </span>
              </div>
              <div style={{ position: 'relative', marginTop: 6 }}>
                <textarea
                  className="field-input textarea"
                  placeholder="Write your secret message here..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  maxLength={8000}
                  rows={7}
                  style={{ fontFamily: FONT_MAP[font], fontSize: ['Flowing','Casual','Retro','Poetic','Sacramento','Parisienne'].includes(font) ? 20 : 17, lineHeight: 1.75 }}
                />
              </div>

              {/* Font pills container (single-line horizontal scroll strip) */}
              <div className="font-pills-container">
                {(['Classic','Flowing','Elegant','Casual','Retro','Poetic','Typewriter','Sacramento','Parisienne'] as FontOption[]).map(f => {
                  const isPaid = f !== 'Classic';
                  return (
                    <button
                      key={f}
                      className={`font-pill ${font === f ? 'active' : ''}`}
                      style={{ fontFamily: FONT_MAP[f] }}
                      onClick={() => setFont(f)}
                    >
                      {f}{isPaid && <span style={{ fontSize: 12, marginLeft: 5 }}>✨</span>}
                    </button>
                  );
                })}
              </div>

              <label className="field-label" style={{ marginTop: 16 }}>Signature (optional)</label>
              <input
                className="field-input"
                placeholder="With love"
                value={signature}
                onChange={e => setSignature(e.target.value)}
              />
            </Section>

            {/* ── Background theme ── */}
            <Section
              icon="🎨"
              iconClass="palette"
              title="Background theme"
              subtitle={theme + (theme === 'Classic Burgundy' ? ' (Default)' : '')}
            >
              {THEMES.map(group => (
                <div key={group.id} style={{ marginBottom: 20 }}>
                  <div className="theme-section-label" style={{
                    fontSize: 11,
                    letterSpacing: '0.12em',
                    color: 'rgba(212,165,116,0.45)',
                    fontFamily: "'Crimson Pro', serif",
                    fontWeight: 600,
                    marginBottom: 10,
                    textTransform: 'uppercase',
                  }}>{group.label}</div>
                  <div className="theme-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 12,
                  }}>
                    {group.items.map(t => {
                      const isActive = theme === t.name;
                      const isDefault = t.name === 'Classic Burgundy';
                      const isPro = ['Sunset', 'Velvet Night', 'Vintage Parchment', 'Falling Hearts', 'Enchanted Sparkles'].includes(t.name);
                      const isStars = t.name === 'Midnight Stars';
                      const isHearts = t.name === 'Falling Hearts';
                      const isSparkles = t.name === 'Enchanted Sparkles';
                      return (
                        <button
                          key={t.name}
                          className={`theme-thumb ${isActive ? 'active' : ''}`}
                          onClick={() => setTheme(t.name)}
                          title={t.name}
                          style={{ padding: 0, background: 'none', border: 'none', cursor: 'pointer', outline: 'none' }}
                        >
                          {/* Thumbnail Box */}
                          <div style={{
                            width: '100%', height: 118,
                            borderRadius: 12, overflow: 'hidden',
                            background: t.bg, position: 'relative',
                            border: isActive ? '2px solid #d4a574' : '1px solid rgba(255,255,255,0.1)',
                            boxShadow: isActive ? '0 0 16px rgba(212,165,116,0.35)' : '0 4px 12px rgba(0,0,0,0.4)',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          }}>
                            {/* Midnight Stars pattern */}
                            {isStars && STARS.map((s, i) => (
                              <div key={i} style={{
                                position: 'absolute', left: s.x, top: s.y,
                                width: s.r, height: s.r, borderRadius: '50%',
                                background: '#ffffff', opacity: 0.8,
                                pointerEvents: 'none'
                              }} />
                            ))}

                            {/* Falling Hearts pattern */}
                            {isHearts && [
                              {l:'10%',t:'15%',s:12,o:0.6},{l:'32%',t:'50%',s:10,o:0.5},{l:'52%',t:'18%',s:13,o:0.55},{l:'68%',t:'42%',s:11,o:0.45},
                              {l:'82%',t:'20%',s:12,o:0.5},{l:'22%',t:'70%',s:10,o:0.4},{l:'48%',t:'65%',s:12,o:0.45},{l:'88%',t:'65%',s:10,o:0.35},
                            ].map((h, i) => (
                              <div key={i} style={{
                                position: 'absolute', left: h.l, top: h.t,
                                fontSize: h.s, opacity: h.o, color: '#f090a8',
                                pointerEvents: 'none', lineHeight: 1
                              }}>♥</div>
                            ))}

                            {/* Enchanted Sparkles pattern */}
                            {isSparkles && (
                              <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.4, pointerEvents: 'none' }} viewBox="0 0 180 118">
                                <path d="M30 30 Q30 40 40 40 Q30 40 30 50 Q30 40 20 40 Q30 40 30 30 Z" fill="#d4a574"/>
                                <path d="M120 50 Q120 60 130 60 Q120 60 120 70 Q120 60 110 60 Q120 60 120 50 Z" fill="#d4a574"/>
                                <circle cx="140" cy="25" r="2" fill="#f5d0a0"/>
                                <circle cx="50" cy="80" r="2" fill="#f5d0a0"/>
                              </svg>
                            )}

                            {/* Bottom Label Strip */}
                            <div style={{
                              position: 'absolute', bottom: 0, left: 0, right: 0,
                              padding: '24px 12px 10px',
                              background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)',
                              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            }}>
                              <span style={{
                                fontSize: 13,
                                fontFamily: "'Crimson Pro', serif",
                                color: isActive ? '#d4a574' : 'rgba(250,248,245,0.9)',
                                fontWeight: isActive ? 600 : 400,
                                lineHeight: 1,
                              }}>
                                {t.name}
                              </span>

                              {/* Badges */}
                              {isDefault && (
                                <span style={{
                                  fontSize: 9.5,
                                  fontFamily: "'Crimson Pro', serif",
                                  background: 'rgba(255,255,255,0.12)',
                                  color: 'rgba(250,248,245,0.7)',
                                  padding: '2px 6px',
                                  borderRadius: 4,
                                  lineHeight: 1,
                                }}>
                                  Default
                                </span>
                              )}


                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </Section>

            {/* ── Envelope ── */}
            <Section
              icon={
                <div style={{
                  width: 22, height: 15, borderRadius: 2, background: '#f0ece4',
                  position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 7, background: 'rgba(0,0,0,0.1)', clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }} />
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#c02626', zIndex: 2 }} />
                </div>
              }
              iconClass="envelope"
              title="Envelope"
              subtitle={envelope + (envelope === 'Classic Wax' ? ' (Default)' : '')}
            >
              {/* PREVIEW Label */}
              <div style={{
                fontSize: 10,
                letterSpacing: '0.14em',
                color: 'rgba(212,165,116,0.45)',
                fontFamily: "'Crimson Pro', serif",
                fontWeight: 600,
                marginBottom: 8,
                textTransform: 'uppercase',
              }}>
                PREVIEW
              </div>

              {/* Large Envelope Preview Box matching screenshot */}
              {(() => {
                const s = ENVELOPE_STYLES[envelope] || ENVELOPE_STYLES['Classic Wax'];
                return (
                  <div style={{
                    width: '100%', height: 260,
                    background: 'rgba(10, 4, 6, 0.75)',
                    border: '1px solid rgba(80, 25, 28, 0.35)',
                    borderRadius: 14,
                    position: 'relative',
                    display: 'flex', flexDirection: 'column',
                    padding: '18px 22px',
                    marginBottom: 22,
                  }}>
                    {/* PREVIEW Label */}
                    <div style={{
                      fontSize: 11,
                      letterSpacing: '0.12em',
                      color: 'rgba(212,165,116,0.45)',
                      fontFamily: "'Crimson Pro', serif",
                      fontWeight: 600,
                      textTransform: 'uppercase',
                    }}>
                      PREVIEW
                    </div>

                    {/* Centered Large Floating Envelope Graphic */}
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div
                        className="envelope-preview-floating"
                        style={{
                          width: 295, height: 188,
                          background: s.bodyColor,
                          borderRadius: 12, position: 'relative', overflow: 'hidden',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          boxShadow: '0 14px 40px rgba(0,0,0,0.7), 0 0 24px rgba(0,0,0,0.45)',
                        }}
                      >
                        {/* Top flap crease */}
                        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 92, pointerEvents: 'none' }} viewBox="0 0 295 92">
                          <polygon points="0,0 295,0 147.5,90" fill="rgba(0,0,0,0.06)"/>
                          <polyline points="0,0 147.5,90 295,0" fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="1"/>
                        </svg>
                        {/* Bottom flap crease */}
                        <svg style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: 98, pointerEvents: 'none' }} viewBox="0 0 295 98">
                          <polygon points="0,98 295,98 147.5,12" fill="rgba(0,0,0,0.03)"/>
                          <polyline points="0,98 147.5,12 295,98" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="1"/>
                        </svg>

                        {/* Render exact envelope decoration graphic */}
                        <RenderEnvelopeDecor envelope={envelope} isMini={false} />
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* 3-Column Envelope Grid matching Screenshot */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                {ENVELOPES.map(e => {
                  const isActive = envelope === e.name;
                  const isDefault = e.name === 'Classic Wax';
                  const s = ENVELOPE_STYLES[e.name] || ENVELOPE_STYLES['Classic Wax'];
                  return (
                    <button
                      key={e.name}
                      className="envelope-thumb-card"
                      onClick={() => setEnvelope(e.name)}
                      style={{
                        background: 'rgba(16, 6, 9, 0.65)',
                        border: isActive ? '1.5px solid #d4a574' : '1px solid rgba(75, 22, 28, 0.35)',
                        borderRadius: 14,
                        padding: '16px 14px 12px 14px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        outline: 'none',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: isActive ? '0 0 16px rgba(212,165,116,0.25)' : 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        minHeight: 124,
                      }}
                    >
                      {/* Floating Mini Envelope Graphic */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flex: 1,
                        padding: '4px 0 12px',
                      }}>
                        <div style={{
                          width: 92, height: 58,
                          borderRadius: 6,
                          background: s.bodyColor,
                          position: 'relative',
                          overflow: 'hidden',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          boxShadow: '0 4px 14px rgba(0,0,0,0.5)',
                          transform: isActive ? 'scale(1.05)' : 'scale(1)',
                          transition: 'transform 0.2s ease',
                        }}>
                          {/* Mini top flap crease */}
                          <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 30, pointerEvents: 'none' }} viewBox="0 0 92 30">
                            <polygon points="0,0 92,0 46,28" fill="rgba(0,0,0,0.06)"/>
                            <polyline points="0,0 46,28 92,0" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="1"/>
                          </svg>

                          {/* Render exact envelope decor thumbnail */}
                          <RenderEnvelopeDecor envelope={e.name} isMini={true} />
                        </div>
                      </div>

                      {/* Label Strip & Badge at bottom */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <span style={{
                          fontSize: 12.5,
                          fontFamily: "'Crimson Pro', serif",
                          color: isActive ? '#d4a574' : 'rgba(250,248,245,0.85)',
                          fontWeight: isActive ? 600 : 400,
                          lineHeight: 1,
                        }}>
                          {e.name}
                        </span>

                        {isActive ? (
                          <span style={{ color: '#d4a574', fontSize: 13, fontWeight: 'bold' }}>✓</span>
                        ) : isDefault ? (
                          <span style={{
                            fontSize: 9.5,
                            fontFamily: "'Crimson Pro', serif",
                            background: 'rgba(255,255,255,0.1)',
                            color: 'rgba(250,248,245,0.65)',
                            padding: '2px 6px',
                            borderRadius: 4,
                            lineHeight: 1,
                          }}>
                            Default
                          </span>
                        ) : (
                          <span style={{
                            fontSize: 9,
                            fontFamily: "'Crimson Pro', serif",
                            background: 'rgba(35, 20, 5, 0.7)',
                            border: '1px solid rgba(212,165,116,0.35)',
                            color: '#d4a574',
                            padding: '2px 6px',
                            borderRadius: 6,
                            lineHeight: 1,
                          }}>
                            🔒 PRO
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </Section>

            {/* ── Add a Sticker Section ── */}
            <Section
              icon={
                selectedSticker ? (
                  <div style={{
                    width: 38, height: 38, borderRadius: 10, background: '#ffffff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)', overflow: 'hidden',
                  }}>
                    <StickerRenderer id={selectedSticker.id} size={34} animate={false} />
                  </div>
                ) : "✨"
              }
              iconClass={selectedSticker ? "" : "yellow"}
              title="Sticker"
              subtitle={selectedSticker ? `${selectedSticker.name} selected` : 'A little character for your letter (optional)'}
            >
              {/* If a sticker is selected, show Animate Sticker toggle & Live Preview (Screenshot 10) */}
              {selectedSticker && (
                <div style={{
                  background: 'rgba(12, 4, 8, 0.65)',
                  border: '1px solid rgba(85, 28, 35, 0.4)',
                  borderRadius: 12, padding: '16px 20px',
                  marginBottom: 16,
                }}>
                  {/* Animate Sticker Toggle Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <span style={{
                      fontFamily: "'Crimson Pro', serif", fontSize: 14.5, color: 'rgba(250,248,245,0.85)',
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}>
                      <span style={{ fontSize: 12, color: '#d4a574' }}>▶</span> Animate sticker
                    </span>
                    <button
                      onClick={() => setAnimateSticker(a => !a)}
                      style={{
                        width: 44, height: 24, borderRadius: 9999,
                        background: animateSticker ? '#f59e0b' : 'rgba(255,255,255,0.15)',
                        border: 'none', cursor: 'pointer', position: 'relative',
                        transition: 'background 0.2s ease', outline: 'none',
                      }}
                    >
                      <div style={{
                        width: 18, height: 18, borderRadius: '50%', background: '#ffffff',
                        position: 'absolute', top: 3,
                        left: animateSticker ? 23 : 3,
                        transition: 'left 0.2s ease',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                      }} />
                    </button>
                  </div>

                  {/* Centered Sticker Preview Box */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 120, height: 120, borderRadius: 20,
                      background: '#0a0108',
                      boxShadow: '0 8px 28px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.06)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <StickerRenderer id={selectedSticker.id} size={88} animate={animateSticker} />
                    </div>
                    <span style={{ fontSize: 11.5, color: 'rgba(250,248,245,0.4)', fontFamily: "'Crimson Pro', serif", fontStyle: 'italic' }}>
                      Preview — how recipient will see it
                    </span>
                  </div>
                </div>
              )}

              {/* Promo Banner: Create Our Sticker */}
              <div style={{
                background: 'rgba(28, 12, 16, 0.5)',
                border: '1px solid rgba(135, 45, 55, 0.35)',
                borderRadius: 10, padding: '12px 16px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 14,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 18, color: '#d4a574' }}>✦</span>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontFamily: "'Crimson Pro', serif", fontSize: 14, color: '#faf8f5', fontWeight: 600 }}>Create Our Sticker</span>
                      <span style={{ fontSize: 9, background: 'rgba(212,165,116,0.2)', border: '1px solid rgba(212,165,116,0.4)', color: '#d4a574', padding: '1px 5px', borderRadius: 4 }}>NEW</span>
                    </div>
                    <div style={{ fontFamily: "'Crimson Pro', serif", fontSize: 12, color: 'rgba(250,248,245,0.45)' }}>
                      Turn your photo into a whimsical sticker
                    </div>
                  </div>
                </div>
                <span style={{ fontSize: 16, color: 'rgba(250,248,245,0.3)', cursor: 'pointer' }}>♡</span>
              </div>

              {/* No Sticker Button */}
              <button
                onClick={() => setSelectedSticker(null)}
                style={{
                  width: '100%', padding: '10px 0',
                  background: 'rgba(14, 5, 8, 0.65)',
                  border: !selectedSticker ? '1.5px solid #d4a574' : '1px solid rgba(85, 28, 35, 0.35)',
                  borderRadius: 10, color: !selectedSticker ? '#d4a574' : 'rgba(250,248,245,0.6)',
                  fontFamily: "'Crimson Pro', serif", fontSize: 13.5,
                  cursor: 'pointer', outline: 'none', marginBottom: 16,
                  transition: 'all 0.2s ease',
                }}
              >
                No sticker
              </button>

              {/* FREE Category Grid (Screenshot 9) */}
              <div style={{ fontSize: 11, letterSpacing: '0.12em', color: '#d4a574', fontFamily: "'Crimson Pro', serif", fontWeight: 700, marginBottom: 10, textTransform: 'uppercase' }}>
                FREE
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
                {STICKERS_SUITE.free.map(s => {
                  const isSel = selectedSticker?.id === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSelectedSticker(isSel ? null : s)}
                      style={{
                        height: 100, borderRadius: 14,
                        background: isSel ? 'rgba(80, 20, 30, 0.7)' : 'rgba(18, 6, 10, 0.7)',
                        border: isSel ? '2px solid #e03045' : '1px solid rgba(85, 28, 35, 0.35)',
                        cursor: 'pointer', outline: 'none',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.2s ease',
                        boxShadow: isSel ? '0 0 18px rgba(224,48,69,0.45)' : 'none',
                        padding: 4,
                      }}
                    >
                      <StickerRenderer id={s.id} size={72} animate={isSel && animateSticker} />
                    </button>
                  );
                })}
              </div>

              {/* PREMIUM Category Grid (Screenshot 9) */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 11, letterSpacing: '0.12em', color: '#d4a574', fontFamily: "'Crimson Pro', serif", fontWeight: 700, textTransform: 'uppercase' }}>
                  PREMIUM
                </span>
                <span style={{ fontSize: 10.5, background: 'rgba(35, 20, 5, 0.7)', border: '1px solid rgba(212,165,116,0.35)', color: '#d4a574', padding: '3px 8px', borderRadius: 9999, fontFamily: "'Crimson Pro', serif" }}>
                  All 18 for $2.99
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                {STICKERS_SUITE.premium.map(s => {
                  const isSel = selectedSticker?.id === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSelectedSticker(isSel ? null : s)}
                      style={{
                        height: 106, borderRadius: 14,
                        background: isSel ? 'rgba(80, 20, 30, 0.7)' : 'rgba(18, 6, 10, 0.7)',
                        border: isSel ? '2px solid #e03045' : '1px solid rgba(85, 28, 35, 0.35)',
                        cursor: 'pointer', outline: 'none',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        gap: 4, position: 'relative', transition: 'all 0.2s ease',
                        boxShadow: isSel ? '0 0 18px rgba(224,48,69,0.45)' : 'none',
                        padding: 4,
                      }}
                    >
                      <StickerRenderer id={s.id} size={72} animate={isSel && animateSticker} />
                      <span style={{ fontSize: 9.5, background: 'rgba(0,0,0,0.55)', color: '#d4a574', padding: '1px 7px', borderRadius: 6, fontFamily: "'Crimson Pro', serif", marginTop: -2 }}>
                        {s.price}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Section>

            {/* ── Attach a Photo ── */}
            <Section
              icon="📷"
              iconClass="red"
              title="Attach a Photo"
              subtitle={photoEnabled ? 'Photo attached' : 'Add a photo that says what words can\'t (optional)'}
            >
              <div className="toggle-pill" style={{ marginBottom: 14 }}>
                <button
                  className={`toggle-option ${!photoEnabled ? 'selected' : ''}`}
                  onClick={() => { setPhotoEnabled(false); setPhotoFile(null); }}
                >
                  No photo
                </button>
                <button
                  className={`toggle-option ${photoEnabled ? 'selected' : ''}`}
                  onClick={() => { setPhotoEnabled(true); photoInputRef.current?.click(); }}
                >
                  Attach photo
                </button>
              </div>

              {photoEnabled && (
                <div
                  className="upload-zone"
                  onClick={() => photoInputRef.current?.click()}
                  style={{ cursor: 'pointer' }}
                >
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={e => {
                      if (e.target.files?.[0]) {
                        setPhotoFile(e.target.files[0]);
                      }
                    }}
                  />
                  <div className="upload-zone-icon">📷</div>
                  <div className="upload-zone-title">
                    {photoFile ? photoFile.name : 'Choose a photo'}
                  </div>
                  <div className="upload-zone-hint">JPEG, PNG, or WebP. Max 2MB.</div>
                </div>
              )}
            </Section>

            {/* ── Add a Voice Message Section ── */}
            <VoiceMessageSection
              onSaveVoice={(url, dur) => {
                setVoiceDataUrl(url);
                setVoiceDuration(dur);
              }}
              voiceDataUrl={voiceDataUrl}
              voiceDuration={voiceDuration}
            />

            {/* ── Add a Song Section matching Screenshot ── */}
            <Section
              icon="🎵"
              iconClass="purple"
              title="Add a Song"
              subtitle={selectedSong ? `${selectedSong.trackName} — ${selectedSong.artistName}` : 'Play their favorite song as they read your words'}
            >
              {/* No song full-width button (Screenshot style) */}
              <button
                onClick={() => {
                  setSelectedSong(null);
                  if (audioPreviewRef.current) audioPreviewRef.current.pause();
                  setPlayingTrackId(null);
                }}
                style={{
                  width: '100%', padding: '12px 0',
                  background: !selectedSong ? 'rgba(212, 165, 116, 0.10)' : 'rgba(255, 255, 255, 0.04)',
                  border: !selectedSong ? '1px solid rgba(212, 165, 116, 0.35)' : '1px solid rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: 10, color: !selectedSong ? '#d4a574' : 'rgba(250,248,245,0.6)',
                  fontFamily: "'Crimson Pro', serif", fontSize: 14.5,
                  cursor: 'pointer', outline: 'none', marginBottom: 20,
                  transition: 'all 0.2s ease',
                }}
              >
                No song
              </button>

              {/* POPULAR PICKS */}
              <div style={{
                fontSize: 11, letterSpacing: '0.12em', color: '#d4a574',
                fontFamily: "'Crimson Pro', serif", fontWeight: 700, marginBottom: 12, textTransform: 'uppercase'
              }}>
                POPULAR PICKS
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                {popularPicks.map(s => {
                  const isSelected = selectedSong?.trackId === s.trackId;
                  const isPlaying = playingTrackId === s.trackId;
                  return (
                    <div
                      key={s.trackId}
                      onClick={() => setSelectedSong(isSelected ? null : s)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '10px 14px', borderRadius: 12,
                        background: isSelected ? 'rgba(224, 32, 56, 0.16)' : 'transparent',
                        border: isSelected ? '1px solid rgba(212, 165, 116, 0.45)' : '1px solid transparent',
                        cursor: 'pointer', transition: 'all 0.2s ease',
                        boxShadow: isSelected ? 'inset 3px 0 0 #d4a574, 0 4px 16px rgba(0,0,0,0.3)' : 'none',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <img
                          src={s.artworkUrl100}
                          alt={s.trackName}
                          style={{ width: 46, height: 46, borderRadius: 8, objectFit: 'cover', boxShadow: '0 2px 8px rgba(0,0,0,0.4)' }}
                        />
                        <div>
                          <div style={{ fontFamily: "'Crimson Pro', serif", fontSize: 15.5, fontWeight: 600, color: isSelected ? '#ffffff' : '#faf8f5' }}>
                            {s.trackName}
                          </div>
                          <div style={{ fontFamily: "'Crimson Pro', serif", fontSize: 13, color: 'rgba(212,165,116,0.7)' }}>
                            {s.artistName}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {s.previewUrl ? (
                          <button
                            type="button"
                            onClick={(e) => handleTogglePreview(s, e)}
                            title={isPlaying ? "Pause Preview" : "Play 30s Preview"}
                            style={{
                              width: 34, height: 34, borderRadius: '50%',
                              background: isPlaying ? '#e03045' : 'rgba(212,165,116,0.18)',
                              border: '1px solid rgba(212,165,116,0.4)',
                              color: '#ffffff', cursor: 'pointer', outline: 'none',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 13, transition: 'all 0.2s ease',
                            }}
                          >
                            {isPlaying ? '⏸' : '▶'}
                          </button>
                        ) : (
                          <span style={{ fontSize: 11, color: 'rgba(250,248,245,0.3)', fontStyle: 'italic' }}>No preview</span>
                        )}

                        {isSelected && (
                          <span style={{ color: '#d4a574', fontSize: 14, fontWeight: 'bold' }}>✓</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* SEARCH ANY SONG */}
              <div style={{
                fontSize: 11, letterSpacing: '0.12em', color: '#d4a574',
                fontFamily: "'Crimson Pro', serif", fontWeight: 700, marginBottom: 10, textTransform: 'uppercase',
                display: 'flex', alignItems: 'center', gap: 6
              }}>
                <span>✦</span> SEARCH ANY SONG
              </div>

              <div style={{ position: 'relative', marginBottom: 16 }}>
                <input
                  className="field-input"
                  placeholder="Search songs..."
                  value={songSearch}
                  onChange={e => setSongSearch(e.target.value)}
                  style={{ paddingLeft: 42 }}
                />
                <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 16, color: 'rgba(212,165,116,0.5)' }}>
                  🔍
                </span>
                {searchLoading && (
                  <span style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: '#d4a574' }}>
                    Loading…
                  </span>
                )}
              </div>

              {/* Search Results */}
              {songSearch.trim().length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {searchResults.length > 0 ? (
                    searchResults.map(s => {
                      const isSelected = selectedSong?.trackId === s.trackId;
                      const isPlaying = playingTrackId === s.trackId;
                      return (
                        <div
                          key={s.trackId}
                          onClick={() => setSelectedSong(isSelected ? null : s)}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '10px 14px', borderRadius: 12,
                            background: isSelected ? 'rgba(224, 32, 56, 0.16)' : 'transparent',
                            border: isSelected ? '1px solid rgba(212, 165, 116, 0.45)' : '1px solid transparent',
                            cursor: 'pointer', transition: 'all 0.2s ease',
                            boxShadow: isSelected ? 'inset 3px 0 0 #d4a574, 0 4px 16px rgba(0,0,0,0.3)' : 'none',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                            <img
                              src={s.artworkUrl100}
                              alt={s.trackName}
                              style={{ width: 46, height: 46, borderRadius: 8, objectFit: 'cover' }}
                            />
                            <div>
                              <div style={{ fontFamily: "'Crimson Pro', serif", fontSize: 15.5, fontWeight: 600, color: isSelected ? '#ffffff' : '#faf8f5' }}>
                                {s.trackName}
                              </div>
                              <div style={{ fontFamily: "'Crimson Pro', serif", fontSize: 13, color: 'rgba(212,165,116,0.7)' }}>
                                {s.artistName}
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {s.previewUrl ? (
                              <button
                                type="button"
                                onClick={(e) => handleTogglePreview(s, e)}
                                style={{
                                  width: 34, height: 34, borderRadius: '50%',
                                  background: isPlaying ? '#e03045' : 'rgba(212,165,116,0.18)',
                                  border: '1px solid rgba(212,165,116,0.4)',
                                  color: '#ffffff', cursor: 'pointer', outline: 'none',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontSize: 13,
                                }}
                              >
                                {isPlaying ? '⏸' : '▶'}
                              </button>
                            ) : (
                              <span style={{ fontSize: 11, color: 'rgba(250,248,245,0.3)', fontStyle: 'italic' }}>No preview</span>
                            )}

                            {isSelected && (
                              <span style={{ color: '#d4a574', fontSize: 14, fontWeight: 'bold' }}>✓</span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    !searchLoading && (
                      <div style={{
                        padding: '18px', textAlign: 'center',
                        color: 'rgba(250,248,245,0.4)', fontFamily: "'Crimson Pro', serif", fontSize: 14
                      }}>
                        No songs found for "{songSearch}"
                      </div>
                    )
                  )}
                </div>
              )}
            </Section>

            {/* Continue button */}
            <button
              className="continue-btn"
              onClick={() => setStep(2)}
            >
              Continue →
            </button>
          </>
        )}

        {/* ═══════════════════ STEP 2 (Matching Reference Screenshot) ═══════════════════ */}
        {step === 2 && (
          <div style={{
            animation: 'fadeInSlide 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          }}>
            {/* Difficulty Question Label */}
            <div style={{
              fontFamily: "'Crimson Pro', serif",
              fontSize: 14.5,
              color: 'rgba(212, 165, 116, 0.55)',
              marginBottom: 12,
              textAlign: 'left',
            }}>
              how hard should it be to open?
            </div>

            {/* 2 Side-by-Side Difficulty Options Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 14,
              marginBottom: 24,
            }}>
              {/* Option 1: Easy */}
              <button
                type="button"
                onClick={() => setDifficulty('easy')}
                style={{
                  background: difficulty === 'easy' ? 'rgba(28, 12, 18, 0.75)' : 'rgba(14, 6, 10, 0.55)',
                  border: difficulty === 'easy' ? '1px solid rgba(212, 165, 116, 0.38)' : '1px solid rgba(255, 255, 255, 0.07)',
                  borderRadius: 14,
                  padding: '22px 18px 20px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  outline: 'none',
                  boxShadow: difficulty === 'easy'
                    ? '0 6px 20px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 220, 180, 0.1)'
                    : '0 2px 10px rgba(0, 0, 0, 0.3)',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: difficulty === 'easy' ? 'translateY(-1px)' : 'none',
                }}
                onMouseEnter={e => {
                  if (difficulty !== 'easy') {
                    e.currentTarget.style.borderColor = 'rgba(212, 165, 116, 0.25)';
                    e.currentTarget.style.background = 'rgba(20, 8, 14, 0.65)';
                  }
                }}
                onMouseLeave={e => {
                  if (difficulty !== 'easy') {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.07)';
                    e.currentTarget.style.background = 'rgba(14, 6, 10, 0.55)';
                  }
                }}
              >
                <div style={{
                  fontSize: 22,
                  marginBottom: 6,
                  color: difficulty === 'easy' ? '#d4a574' : 'rgba(212, 165, 116, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  filter: difficulty === 'easy' ? 'drop-shadow(0 0 8px rgba(212, 165, 116, 0.4))' : 'none',
                  transition: 'all 0.2s ease',
                }}>
                  ✦
                </div>
                <div style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 16.5,
                  color: '#faf8f5',
                  fontWeight: 600,
                  marginBottom: 3,
                }}>
                  easy
                </div>
                <div style={{
                  fontFamily: "'Crimson Pro', serif",
                  fontSize: 13,
                  color: 'rgba(250, 248, 245, 0.45)',
                }}>
                  opens right away
                </div>
              </button>

              {/* Option 2: Make Them Wait */}
              <button
                type="button"
                onClick={() => setDifficulty('wait')}
                style={{
                  background: difficulty === 'wait' ? 'rgba(28, 12, 18, 0.75)' : 'rgba(14, 6, 10, 0.55)',
                  border: difficulty === 'wait' ? '1px solid rgba(212, 165, 116, 0.38)' : '1px solid rgba(255, 255, 255, 0.07)',
                  borderRadius: 14,
                  padding: '22px 18px 20px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  outline: 'none',
                  boxShadow: difficulty === 'wait'
                    ? '0 6px 20px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 220, 180, 0.1)'
                    : '0 2px 10px rgba(0, 0, 0, 0.3)',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: difficulty === 'wait' ? 'translateY(-1px)' : 'none',
                }}
                onMouseEnter={e => {
                  if (difficulty !== 'wait') {
                    e.currentTarget.style.borderColor = 'rgba(212, 165, 116, 0.25)';
                    e.currentTarget.style.background = 'rgba(20, 8, 14, 0.65)';
                  }
                }}
                onMouseLeave={e => {
                  if (difficulty !== 'wait') {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.07)';
                    e.currentTarget.style.background = 'rgba(14, 6, 10, 0.55)';
                  }
                }}
              >
                <div style={{
                  fontSize: 22,
                  marginBottom: 6,
                  color: difficulty === 'wait' ? '#d4a574' : 'rgba(212, 165, 116, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  filter: difficulty === 'wait' ? 'drop-shadow(0 0 8px rgba(212, 165, 116, 0.4))' : 'none',
                  transition: 'all 0.2s ease',
                }}>
                  🔥
                </div>
                <div style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 16.5,
                  color: '#faf8f5',
                  fontWeight: 600,
                  marginBottom: 3,
                }}>
                  make them wait
                </div>
                <div style={{
                  fontFamily: "'Crimson Pro', serif",
                  fontSize: 13,
                  color: 'rgba(250, 248, 245, 0.45)',
                }}>
                  teases before revealing
                </div>
              </button>
            </div>

            {/* Guardian Card */}
            <div style={{
              background: 'rgba(18, 8, 12, 0.78)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(220, 170, 130, 0.10)',
              borderRadius: 16,
              padding: '24px',
              boxShadow: '0 16px 40px rgba(0, 0, 0, 0.60)',
              marginBottom: 24,
            }}>
              {/* Guardian Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                marginBottom: 20,
              }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle at 35% 30%, #c41e3a 0%, #6b0e1a 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 14px rgba(196, 30, 58, 0.35)',
                  border: '1px solid rgba(228, 32, 56, 0.35)',
                  color: '#ffffff',
                  fontSize: 18,
                  flexShrink: 0,
                }}>
                  🛡️
                </div>
                <div>
                  <div style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 20,
                    fontWeight: 600,
                    color: '#faf8f5',
                    lineHeight: 1.2,
                  }}>
                    Guardian
                  </div>
                  <div style={{
                    fontFamily: "'Crimson Pro', serif",
                    fontSize: 14,
                    color: 'rgba(250, 248, 245, 0.45)',
                    marginTop: 2,
                  }}>
                    Protect your letter
                  </div>
                </div>
              </div>

              {/* 3 Guardian Tab Options (Matching Screenshot) */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: 10,
              }}>
                {/* Tab 1: No Protection */}
                <button
                  type="button"
                  onClick={() => setGuardianType('none')}
                  style={{
                    background: guardianType === 'none' ? 'rgba(120, 20, 30, 0.45)' : 'rgba(12, 5, 8, 0.65)',
                    border: guardianType === 'none' ? '1px solid rgba(224, 32, 56, 0.45)' : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 10,
                    padding: '13px 8px',
                    fontFamily: "'Crimson Pro', serif",
                    fontSize: 14.5,
                    fontWeight: 500,
                    color: guardianType === 'none' ? '#faf8f5' : 'rgba(250, 248, 245, 0.6)',
                    cursor: 'pointer',
                    outline: 'none',
                    boxShadow: guardianType === 'none' ? '0 2px 10px rgba(196, 30, 58, 0.3)' : 'none',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                  onMouseEnter={e => {
                    if (guardianType !== 'none') {
                      e.currentTarget.style.color = '#faf8f5';
                      e.currentTarget.style.borderColor = 'rgba(212, 165, 116, 0.25)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (guardianType !== 'none') {
                      e.currentTarget.style.color = 'rgba(250, 248, 245, 0.6)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    }
                  }}
                >
                  No Protection
                </button>

                {/* Tab 2: Time Lock */}
                <button
                  type="button"
                  onClick={() => setGuardianType('time')}
                  style={{
                    background: guardianType === 'time' ? 'rgba(120, 20, 30, 0.45)' : 'rgba(12, 5, 8, 0.65)',
                    border: guardianType === 'time' ? '1px solid rgba(224, 32, 56, 0.45)' : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 10,
                    padding: '13px 8px',
                    fontFamily: "'Crimson Pro', serif",
                    fontSize: 14.5,
                    fontWeight: 500,
                    color: guardianType === 'time' ? '#faf8f5' : 'rgba(250, 248, 245, 0.6)',
                    cursor: 'pointer',
                    outline: 'none',
                    boxShadow: guardianType === 'time' ? '0 2px 10px rgba(196, 30, 58, 0.3)' : 'none',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                  onMouseEnter={e => {
                    if (guardianType !== 'time') {
                      e.currentTarget.style.color = '#faf8f5';
                      e.currentTarget.style.borderColor = 'rgba(212, 165, 116, 0.25)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (guardianType !== 'time') {
                      e.currentTarget.style.color = 'rgba(250, 248, 245, 0.6)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    }
                  }}
                >
                  <span>⏱</span> Time Lock
                </button>

                {/* Tab 3: Question */}
                <button
                  type="button"
                  onClick={() => setGuardianType('question')}
                  style={{
                    background: guardianType === 'question' ? 'rgba(120, 20, 30, 0.45)' : 'rgba(12, 5, 8, 0.65)',
                    border: guardianType === 'question' ? '1px solid rgba(224, 32, 56, 0.45)' : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 10,
                    padding: '13px 8px',
                    fontFamily: "'Crimson Pro', serif",
                    fontSize: 14.5,
                    fontWeight: 500,
                    color: guardianType === 'question' ? '#faf8f5' : 'rgba(250, 248, 245, 0.6)',
                    cursor: 'pointer',
                    outline: 'none',
                    boxShadow: guardianType === 'question' ? '0 2px 10px rgba(196, 30, 58, 0.3)' : 'none',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                  onMouseEnter={e => {
                    if (guardianType !== 'question') {
                      e.currentTarget.style.color = '#faf8f5';
                      e.currentTarget.style.borderColor = 'rgba(212, 165, 116, 0.25)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (guardianType !== 'question') {
                      e.currentTarget.style.color = 'rgba(250, 248, 245, 0.6)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    }
                  }}
                >
                  <span>🔒</span> Question
                </button>
              </div>

              {/* Secret Question inputs with animation */}
              {guardianType === 'question' && (
                <div style={{
                  marginTop: 20,
                  paddingTop: 16,
                  borderTop: '1px solid rgba(255, 215, 180, 0.08)',
                  animation: 'fadeInSlide 0.25s ease',
                }}>
                  <label className="field-label">Secret Question</label>
                  <input
                    className="field-input"
                    placeholder="e.g. What is the name of our favorite cafe?"
                    value={question}
                    onChange={e => setQuestion(e.target.value)}
                  />
                  <label className="field-label" style={{ marginTop: 14 }}>Answer</label>
                  <input
                    className="field-input"
                    placeholder="e.g. Blue Bottle"
                    value={answer}
                    onChange={e => setAnswer(e.target.value)}
                  />
                </div>
              )}

              {/* Time Lock datetime input with animation */}
              {guardianType === 'time' && (
                <div style={{
                  marginTop: 20,
                  paddingTop: 16,
                  borderTop: '1px solid rgba(255, 215, 180, 0.08)',
                  animation: 'fadeInSlide 0.25s ease',
                }}>
                  <label className="field-label">Unlock Date & Time</label>
                  <input
                    type="datetime-local"
                    className="field-input"
                    value={lockDate}
                    onChange={e => setLockDate(e.target.value)}
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
              )}
            </div>

            {/* Bottom Action Row (Matching Screenshot) */}
            <div style={{
              display: 'flex',
              gap: 14,
              marginTop: 28,
              alignItems: 'stretch',
            }}>
              {/* Back Button */}
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{
                  flex: 1,
                  height: 52,
                  background: 'rgba(20, 8, 12, 0.65)',
                  border: '1px solid rgba(212, 165, 116, 0.20)',
                  borderRadius: 12,
                  color: 'rgba(250, 248, 245, 0.85)',
                  fontFamily: "'Crimson Pro', serif",
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: 'pointer',
                  outline: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(32, 14, 20, 0.85)';
                  e.currentTarget.style.borderColor = 'rgba(212, 165, 116, 0.4)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(20, 8, 12, 0.65)';
                  e.currentTarget.style.borderColor = 'rgba(212, 165, 116, 0.20)';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                ← Back
              </button>

              {/* Seal Message Button with luminous border and pulse */}
              <button
                type="button"
                onClick={handleSeal}
                disabled={submitting}
                style={{
                  flex: 1.8,
                  height: 52,
                  background: 'linear-gradient(135deg, #c41e3a 0%, #8b1824 100%)',
                  border: '1.5px solid rgba(255, 255, 255, 0.7)',
                  borderRadius: 12,
                  color: '#ffffff',
                  fontFamily: "'Crimson Pro', serif",
                  fontSize: 16,
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  cursor: submitting ? 'default' : 'pointer',
                  outline: 'none',
                  boxShadow: '0 6px 24px rgba(196, 30, 58, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  opacity: submitting ? 0.7 : 1,
                }}
                onMouseEnter={e => {
                  if (!submitting) {
                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.01)';
                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(196, 30, 58, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.5)';
                  }
                }}
                onMouseLeave={e => {
                  if (!submitting) {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '0 6px 24px rgba(196, 30, 58, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.35)';
                  }
                }}
              >
                <span>✦</span>
                <span>{submitting ? 'Sealing Message...' : 'Seal Message'}</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function CreatePage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#0a0606', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d4a574', fontFamily: "'Crimson Pro', serif" }}>
        Loading letter creator...
      </div>
    }>
      <CreatePageInner />
    </Suspense>
  );
}
