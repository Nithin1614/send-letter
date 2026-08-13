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
          <Link href="/open-when" className="footer-link">Browse Letters</Link>
          <Link href="/open-when" className="footer-link">What to Write</Link>
          <Link href="/journal" className="footer-link">Journal</Link>
          <Link href="/college-sendoff" className="footer-link">College Send-Off</Link>
          <Link href="/future-self" className="footer-link">Letter to Your Future Self</Link>
          <Link href="/why" className="footer-link">Why Send Letter</Link>
          <Link href="/create" className="footer-link">Make a Letter</Link>
        </div>

        {/* Companions */}
        <div>
          <p className="footer-col-title">Companions</p>
          <Link href="/about" className="footer-link">A Letter From Us</Link>
          <Link href="/support" className="footer-link">Support</Link>
          <Link href="/feedback" className="footer-link">Send Feedback</Link>
        </div>

        {/* Fine Print */}
        <div>
          <p className="footer-col-title">The Fine Print</p>
          <Link href="/privacy" className="footer-link">Privacy</Link>
          <Link href="/terms" className="footer-link">Terms</Link>
          <Link href="/for-ai-agents" className="footer-link">For AI Agents</Link>
        </div>
      </div>
    </footer>
  );
}
