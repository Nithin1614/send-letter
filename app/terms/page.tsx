import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Terms of Service — Send Letter',
  description: 'Terms of service and guidelines for using Send Letter.',
};

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main style={{
        minHeight: '100vh',
        background: 'var(--bg, #080305)',
        padding: '0 1.25rem 90px',
        color: '#faf8f5',
      }}>
        <div style={{ maxWidth: 760, margin: '0 auto', paddingTop: 60 }}>
          
          {/* Breadcrumb / Tag */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: '#d4a574',
            marginBottom: 14,
            background: 'rgba(212,165,116,0.08)',
            border: '1px solid rgba(212,165,116,0.22)',
            padding: '4px 14px',
            borderRadius: 20,
          }}>
            <span>✦</span> SEND LETTER / TERMS OF SERVICE
          </div>

          <h1 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 'clamp(32px, 5vw, 44px)',
            fontWeight: 700,
            color: '#faf8f5',
            margin: '0 0 12px',
            lineHeight: 1.2,
          }}>
            Terms of Service
          </h1>

          <p style={{
            fontFamily: "'Crimson Pro', Georgia, serif",
            fontSize: 18,
            color: 'rgba(250,248,245,0.55)',
            marginBottom: 36,
            lineHeight: 1.65,
          }}>
            Last updated: August 2026. Please read these terms carefully before using Send Letter.
          </p>

          {/* Key Summary Box */}
          <div style={{
            background: 'linear-gradient(145deg, rgba(35, 14, 22, 0.6) 0%, rgba(18, 6, 12, 0.7) 100%)',
            border: '1px solid rgba(212, 165, 116, 0.28)',
            borderRadius: 16,
            padding: '24px 26px',
            marginBottom: 44,
            boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
          }}>
            <h3 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 18,
              fontWeight: 600,
              color: '#d4a574',
              margin: '0 0 12px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <span>📜</span> Summary of Guidelines
            </h3>
            <p style={{
              margin: 0,
              fontSize: 14.5,
              color: 'rgba(250,248,245,0.78)',
              lineHeight: 1.75,
            }}>
              Send Letter provides an intentional, private digital stationery platform for sending meaningful letters sealed with virtual wax. We ask that all users treat others with kindness, respect privacy, and refrain from abusive or unlawful activities.
            </p>
          </div>

          {/* Section 1 */}
          <section style={{ marginBottom: 36 }}>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 22,
              fontWeight: 600,
              color: '#faf8f5',
              margin: '0 0 12px',
            }}>
              1. Acceptance of Terms
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(250,248,245,0.7)', lineHeight: 1.75, margin: 0 }}>
              By accessing, writing, sealing, or reading letters on Send Letter, you acknowledge that you have read, understood, and agreed to be bound by these Terms of Service. If you do not agree with any part of these terms, please do not use the platform.
            </p>
          </section>

          {/* Section 2 */}
          <section style={{ marginBottom: 36 }}>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 22,
              fontWeight: 600,
              color: '#faf8f5',
              margin: '0 0 12px',
            }}>
              2. Acceptable Use &amp; Prohibited Conduct
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(250,248,245,0.7)', lineHeight: 1.75, margin: '0 0 12px' }}>
              Send Letter is built for personal expression, milestones, and heartfelt correspondence. You agree not to use the service for:
            </p>
            <ul style={{ fontSize: 14.5, color: 'rgba(250,248,245,0.7)', lineHeight: 1.75, paddingLeft: 22, margin: 0 }}>
              <li>Harassment, stalking, intimidation, extortion, or defamatory communication.</li>
              <li>Transmitting unlawful, obscene, fraudulent, or harmful materials.</li>
              <li>Spam, automated message delivery, phishing campaigns, or malicious URL distribution.</li>
              <li>Attempting to bypass access controls, tamper with timestamps, or reverse-engineer the unsealing protocols.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section style={{ marginBottom: 36 }}>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 22,
              fontWeight: 600,
              color: '#faf8f5',
              margin: '0 0 12px',
            }}>
              3. User Content &amp; Ownership
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(250,248,245,0.7)', lineHeight: 1.75, margin: 0 }}>
              You retain all ownership rights to the letters, words, photos, and voice notes you compose. Send Letter does not claim ownership of user-generated content. We provide the digital medium, envelope rendering, and unsealing rituals to present your words to your designated recipient.
            </p>
          </section>

          {/* Section 4 */}
          <section style={{ marginBottom: 36 }}>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 22,
              fontWeight: 600,
              color: '#faf8f5',
              margin: '0 0 12px',
            }}>
              4. Self-Destruct &amp; Data Deletion
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(250,248,245,0.7)', lineHeight: 1.75, margin: 0 }}>
              When a sender invokes the <strong>🔥 Burn / Self-Destruct</strong> feature via their Secret Management Link, the deletion is permanent and cannot be undone. We hold no liability for letters intentionally or accidentally vaporized by the sender.
            </p>
          </section>

          {/* Section 5 */}
          <section style={{ marginBottom: 36 }}>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 22,
              fontWeight: 600,
              color: '#faf8f5',
              margin: '0 0 12px',
            }}>
              5. Service Availability &amp; Disclaimers
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(250,248,245,0.7)', lineHeight: 1.75, margin: 0 }}>
              Send Letter is provided &ldquo;as is&rdquo; without warranties of any kind, whether express or implied. While we take pride in maintaining reliable uptime and secure infrastructure, we cannot guarantee that the platform will always be uninterrupted or error-free.
            </p>
          </section>

          {/* Section 6 */}
          <section style={{ marginBottom: 48 }}>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 22,
              fontWeight: 600,
              color: '#faf8f5',
              margin: '0 0 12px',
            }}>
              6. Contact
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(250,248,245,0.7)', lineHeight: 1.75, margin: '0 0 16px' }}>
              For inquiries regarding these terms or community standards, please contact our support team.
            </p>
            <Link href="/support" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              color: '#d4a574',
              fontSize: 14.5,
              fontWeight: 600,
              textDecoration: 'none',
              borderBottom: '1px dotted rgba(212,165,116,0.5)',
              paddingBottom: 2,
            }}>
              Contact Support →
            </Link>
          </section>

          {/* Bottom CTA */}
          <div style={{
            textAlign: 'center',
            paddingTop: 30,
            borderTop: '1px solid rgba(255,255,255,0.08)',
          }}>
            <Link href="/create" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'linear-gradient(135deg, #c41e3a 0%, #8b1820 100%)',
              color: '#ffffff',
              padding: '12px 28px',
              borderRadius: 10,
              fontFamily: "'Playfair Display', serif",
              fontSize: 15,
              fontWeight: 600,
              textDecoration: 'none',
              boxShadow: '0 6px 20px rgba(196,30,58,0.35)',
            }}>
              ✦ Write a Letter
            </Link>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
