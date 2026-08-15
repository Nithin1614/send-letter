"use client";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <nav className="navbar">
        <Link href="/" className="navbar-logo" onClick={() => setMobileOpen(false)}>
          <div className="navbar-badge">SL</div>
          <div className="navbar-brand">
            <span className="navbar-brand-name">Send Letter</span>
            <span className="navbar-brand-est">EST. 2026</span>
          </div>
        </Link>

        {/* Desktop navigation links */}
        <ul className="navbar-links">
          <div className="navbar-sep"/>
          <li><Link href="/open-when">Browse Letters</Link></li>
          <div className="navbar-sep"/>
          <li><Link href="/journal">Journal</Link></li>
          <div className="navbar-sep"/>
          <li><Link href="/support">Support</Link></li>
          <div className="navbar-sep"/>
        </ul>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link href="/create" className="navbar-cta">
            <span className="cta-full-text">✉ Make a Letter →</span>
            <span className="cta-short-text">✉ Write</span>
          </Link>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="mobile-menu-btn"
            aria-label="Toggle navigation menu"
            style={{
              display: "none",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(212, 165, 116, 0.25)",
              borderRadius: 6,
              color: "#faf8f5",
              cursor: "pointer",
              fontSize: 18,
              width: 36,
              height: 36,
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
              transition: "all 0.2s ease",
            }}
          >
            {mobileOpen ? "✕" : "☰"}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Menu (Rendered only on mobile when open) */}
      {mobileOpen && (
        <div
          style={{
            position: "fixed",
            top: 58,
            left: 0,
            right: 0,
            background: "rgba(10, 4, 8, 0.98)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(212, 165, 116, 0.2)",
            boxShadow: "0 24px 48px rgba(0, 0, 0, 0.8)",
            padding: "16px 20px 24px",
            zIndex: 98,
            display: "flex",
            flexDirection: "column",
            gap: 12,
            animation: "slideDownNav 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
          }}
        >
          <Link
            href="/create"
            onClick={() => setMobileOpen(false)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              background: "var(--seal)",
              color: "#ffffff",
              padding: "12px 16px",
              borderRadius: 8,
              fontFamily: "'Crimson Pro', serif",
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              textDecoration: "none",
              boxShadow: "0 4px 14px rgba(196, 30, 58, 0.35)",
            }}
          >
            ✉ Make a Letter →
          </Link>

          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 6 }}>
            <Link
              href="/open-when"
              onClick={() => setMobileOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                color: "#e8ded2",
                padding: "12px 14px",
                borderRadius: 8,
                textDecoration: "none",
                fontFamily: "'Crimson Pro', serif",
                fontSize: 16,
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.06)",
              }}
            >
              <span>📜</span>
              <span>Browse Letters</span>
            </Link>

            <Link
              href="/journal"
              onClick={() => setMobileOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                color: "#e8ded2",
                padding: "12px 14px",
                borderRadius: 8,
                textDecoration: "none",
                fontFamily: "'Crimson Pro', serif",
                fontSize: 16,
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.06)",
              }}
            >
              <span>📖</span>
              <span>Journal</span>
            </Link>

            <Link
              href="/support"
              onClick={() => setMobileOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                color: "#e8ded2",
                padding: "12px 14px",
                borderRadius: 8,
                textDecoration: "none",
                fontFamily: "'Crimson Pro', serif",
                fontSize: 16,
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.06)",
              }}
            >
              <span>💳</span>
              <span>Support Atelier</span>
            </Link>
          </div>
        </div>
      )}

      <style>{`
        .cta-short-text { display: none; }
        .cta-full-text { display: inline; }

        @keyframes slideDownNav {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .mobile-menu-btn { display: flex !important; }
          .cta-short-text { display: inline !important; }
          .cta-full-text { display: none !important; }
          .navbar {
            padding: 0 14px !important;
            height: 58px !important;
          }
          .navbar-cta {
            padding: 7px 12px !important;
            font-size: 11px !important;
            letter-spacing: 0.08em !important;
          }
          .navbar-badge {
            width: 32px !important;
            height: 32px !important;
            font-size: 11px !important;
          }
          .navbar-brand-name {
            font-size: 14.5px !important;
          }
          .navbar-brand-est {
            font-size: 8.5px !important;
          }
        }
      `}</style>
    </>
  );
}
