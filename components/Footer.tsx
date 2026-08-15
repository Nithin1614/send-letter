"use client";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="ornament" style={{ maxWidth: 1100, margin: "0 auto 48px" }}>
        <span className="ornament-icon">🔏</span>
      </div>
      <div className="footer-inner">
        {/* Brand col */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div className="navbar-badge" style={{ width: 32, height: 32, fontSize: "11px" }}>SL</div>
            <span className="footer-brand-name">Send Letter</span>
          </div>
          <p className="footer-tagline">
            Sealed letters for the moments worth marking. Written today, opened when it matters.
          </p>
          <p className="footer-est">— EST. 2026 —</p>
        </div>

        {/* The Letters */}
        <div>
          <p className="footer-col-title">The Letters</p>
          <Link href="/create" scroll={true} onClick={() => window.scrollTo(0, 0)} className="footer-link">Make a Letter</Link>
          <Link href="/open-when" scroll={true} onClick={() => window.scrollTo(0, 0)} className="footer-link">Browse Letters</Link>
          <Link href="/how-it-works" scroll={true} onClick={() => window.scrollTo(0, 0)} className="footer-link">How It Works</Link>
        </div>

        {/* Inspiration & Support */}
        <div>
          <p className="footer-col-title">Inspiration &amp; Help</p>
          <Link href="/journal" scroll={true} onClick={() => window.scrollTo(0, 0)} className="footer-link">The Journal</Link>
          <Link href="/open-when" scroll={true} onClick={() => window.scrollTo(0, 0)} className="footer-link">Letter Library</Link>
          <Link href="/support" scroll={true} onClick={() => window.scrollTo(0, 0)} className="footer-link">Help &amp; Support</Link>
        </div>

        {/* The Fine Print */}
        <div>
          <p className="footer-col-title">The Fine Print</p>
          <Link href="/privacy" scroll={true} onClick={() => window.scrollTo(0, 0)} className="footer-link">Privacy Policy</Link>
          <Link href="/terms" scroll={true} onClick={() => window.scrollTo(0, 0)} className="footer-link">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
