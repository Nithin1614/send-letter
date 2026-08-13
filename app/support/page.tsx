'use client';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const FAQS = [
  { q: 'Is Send Letter really free?', a: 'Yes — 100% free. No account needed, no credit card, no catch. Just write, seal, and share.' },
  { q: 'How do I share my letter?', a: 'After sealing your letter, you\'ll get an "enchanted link." Share it however you like — text, email, WhatsApp, anywhere.' },
  { q: 'Can the recipient open it immediately?', a: 'That depends on what you choose in the Guard step. You can let it open right away, lock it behind a secret question, or set a time lock.' },
  { q: 'How does the hold-to-unseal animation work?', a: 'The recipient sees a sealed envelope. They press and hold the wax seal for a moment — it slowly breaks open to reveal your letter.' },
  { q: 'Can I send multiple letters?', a: 'Absolutely. Create as many sealed letters as you like — one for every moment.' },
  { q: 'What happens if I lose the link?', a: 'The manage link is shown after you create a letter — we recommend saving it. Each letter also has a separate share link for the recipient.' },
  { q: 'Are letters stored forever?', a: 'Letters are stored securely in our database and accessible whenever you use your management link.' },
  { q: 'Can I add a photo or voice message?', a: 'The option is in the composer — you can attach a photo, a gift file, or record a short voice message to accompany your letter.' },
];

export default function SupportPage() {
  return (
    <>
      <Navbar />
      <div style={{
        minHeight: '100vh', background: 'var(--bg)',
        padding: '0 1rem 80px',
      }}>
        <div style={{ maxWidth: 720, margin: '0 auto', paddingTop: 56 }}>
          <p style={{ fontFamily: "'Crimson Pro',serif", fontSize: 11, letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(212,165,116,0.35)', marginBottom: 10 }}>
            SEND LETTER / SUPPORT
          </p>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 38, fontWeight: 700, color: 'rgba(250,248,245,0.9)', marginBottom: 12 }}>
            Help & Support
          </h1>
          <p style={{ fontFamily: "'Crimson Pro',serif", fontSize: 17, color: 'rgba(250,248,245,0.38)', marginBottom: 48, lineHeight: 1.7 }}>
            Common questions about writing and sharing letters.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {FAQS.map((faq, i) => (
              <div key={i} style={{
                background: 'rgba(18,8,8,0.85)',
                border: '1px solid rgba(212,165,116,0.09)',
                borderRadius: 10, padding: '20px 22px',
              }}>
                <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, color: 'rgba(250,248,245,0.85)', margin: '0 0 10px' }}>
                  {faq.q}
                </h3>
                <p style={{ fontFamily: "'Crimson Pro',serif", fontSize: 16, color: 'rgba(250,248,245,0.4)', margin: 0, lineHeight: 1.75 }}>
                  {faq.a}
                </p>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 56, textAlign: 'center' }}>
            <Link href="/create" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#8b2020', color: 'rgba(245,240,230,0.92)',
              padding: '14px 32px', borderRadius: 10,
              fontFamily: "'Crimson Pro',serif", fontSize: 16, fontWeight: 600,
              textDecoration: 'none',
            }}>
              ✦ Write a Letter
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
