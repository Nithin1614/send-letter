import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Privacy Policy — Send Letter',
  description: 'Words are sacred. Learn how Send Letter protects your letters, media, and complete privacy.',
};

export default function PrivacyPage() {
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
            <span>✦</span> SEND LETTER / PRIVACY POLICY
          </div>

          <h1 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 'clamp(32px, 5vw, 44px)',
            fontWeight: 700,
            color: '#faf8f5',
            margin: '0 0 12px',
            lineHeight: 1.2,
          }}>
            Privacy Policy
          </h1>

          <p style={{
            fontFamily: "'Crimson Pro', Georgia, serif",
            fontSize: 18,
            color: 'rgba(250,248,245,0.55)',
            marginBottom: 36,
            lineHeight: 1.65,
          }}>
            Last updated: August 2026. Words are sacred — here is how we protect your letters and privacy.
          </p>

          {/* Key Privacy Highlights Card */}
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
              <span>🛡️</span> Our Core Privacy Commitments
            </h3>
            <ul style={{
              margin: 0,
              paddingLeft: 20,
              fontSize: 14.5,
              color: 'rgba(250,248,245,0.78)',
              lineHeight: 1.75,
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}>
              <li><strong>Zero Accounts Required:</strong> You never need to sign up, create a password, or provide sensitive personal credentials.</li>
              <li><strong>Zero Advertising Trackers:</strong> We do not sell your personal data, profile your habits, or run third-party advertising networks.</li>
              <li><strong>Permanent Self-Destruct:</strong> Senders have total ownership and can vaporize their letter and all attachments into digital ashes at any moment.</li>
            </ul>
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
              1. Information We Collect
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(250,248,245,0.7)', lineHeight: 1.75, margin: '0 0 14px' }}>
              When you compose and seal a letter on Send Letter, we process and store the content you choose to provide:
            </p>
            <ul style={{ fontSize: 14.5, color: 'rgba(250,248,245,0.7)', lineHeight: 1.75, paddingLeft: 22, margin: '0 0 14px' }}>
              <li><strong>Letter Content:</strong> The text of your message, optional title, optional sender signature, and selected aesthetic styling (wax seal color, paper canvas, background song).</li>
              <li><strong>Attached Media:</strong> Any optional Polaroid photo memories or voice notes you choose to attach to your letter.</li>
              <li><strong>Optional Email Address:</strong> If you opt-in to receive unseal receipts and emotional reaction notifications, your email is stored solely to dispatch those automated alerts.</li>
              <li><strong>Letter Activity Logs:</strong> Timestamps of creation, anonymous unseal events, visitor counts, and emoji reactions tapped by recipients.</li>
            </ul>
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
              2. Guardian Passcodes &amp; Access Controls
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(250,248,245,0.7)', lineHeight: 1.75, margin: 0 }}>
              Letters protected with a Guardian Question are locked behind a cryptographic gate. Recipients cannot view the letter content or trigger the unsealing ritual without correctly answering the question you set. Each letter also generates a unique, unguessable 32-character secret management token for the sender.
            </p>
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
              3. Permanent Self-Destruction (Burn to Ashes)
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(250,248,245,0.7)', lineHeight: 1.75, margin: 0 }}>
              Senders retain complete dominion over their letters. Through your private Secret Management Dashboard, you can trigger <strong>🔥 Burn / Self-Destruct</strong> at any time. This action permanently deletes the letter text, attached photos, audio recordings, recipient responses, and activity records from our servers.
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
              4. Cookies &amp; Local Storage
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(250,248,245,0.7)', lineHeight: 1.75, margin: 0 }}>
              We use minimal local browser storage solely to remember your authored letters and audio mute preferences across sessions. We do not use third-party tracking cookies or behavioral marketing pixels.
            </p>
          </section>

          {/* Section 5 */}
          <section style={{ marginBottom: 48 }}>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 22,
              fontWeight: 600,
              color: '#faf8f5',
              margin: '0 0 12px',
            }}>
              5. Questions &amp; Support
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(250,248,245,0.7)', lineHeight: 1.75, margin: '0 0 16px' }}>
              If you have any questions regarding how your data is handled or wish to inquire about security practices, feel free to visit our support center.
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
              Visit Help &amp; Support Center →
            </Link>
          </section>

          {/* Bottom Call to Action */}
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
              ✦ Compose a Sealed Letter
            </Link>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
