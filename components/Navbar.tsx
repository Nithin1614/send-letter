"use client";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <>
      <div className="announcement-bar">
        <span>🎓</span>
        <span>Send-Off Collection — letters for the people you're cheering on</span>
        <Link href="/open-when/graduation" style={{ color: "rgba(180,180,255,0.7)", marginLeft: "4px", textDecoration: "underline", fontSize: "13px" }}>Browse →</Link>
      </div>
      <nav className="navbar">
        <Link href="/" className="navbar-logo">
          <div className="navbar-badge">SL</div>
          <div className="navbar-brand">
            <span className="navbar-brand-name">Send Letter</span>
            <span className="navbar-brand-est">EST. 2026</span>
          </div>
        </Link>

        <ul className="navbar-links">
          <div className="navbar-sep"/>
          <li><Link href="/open-when">Browse Letters</Link></li>
          <div className="navbar-sep"/>
          <li><Link href="/journal">Journal</Link></li>
          <div className="navbar-sep"/>
          <li><Link href="/support">Support</Link></li>
          <div className="navbar-sep"/>
        </ul>

        <Link href="/create" className="navbar-cta">
          ✉ Make a Letter →
        </Link>

        {/* Mobile hamburger */}
        <button onClick={() => setMobileOpen(!mobileOpen)} style={{
          display: "none", background: "none", border: "none",
          color: "var(--cream2)", cursor: "pointer", fontSize: "20px",
        }} className="mobile-menu-btn" aria-label="Menu">☰</button>
      </nav>

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </>
  );
}
