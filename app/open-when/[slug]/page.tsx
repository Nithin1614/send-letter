'use client';

import { use } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { TEMPLATE_PRESETS } from '@/lib/templates';

export default function OpenWhenSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const preset = TEMPLATE_PRESETS[slug] || {
    slug,
    label: slug.replace(/-/g, ' '),
    title: `Open When ${slug.replace(/-/g, ' ')}`,
    headline: `For When You Need Words of Comfort`,
    subtitle: `Seal your words now. They'll open them later — at exactly the moment they need you most.`,
    buttonText: `WRITE A LETTER`,
    message: `Write a meaningful message for your recipient to open when they need it most.`,
    font: 'Classic',
  };

  return (
    <>
      <Navbar />
      <div className="ow-page" style={{ textAlign: 'center', paddingTop: 60, paddingBottom: 100 }}>

        {/* Main Headline */}
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(2.4rem, 6vw, 4rem)',
          fontWeight: 500,
          color: '#faf8f5',
          marginBottom: 16,
          lineHeight: 1.15,
        }}>
          {preset.headline}
        </h1>

        {/* Decorative flourish */}
        <div style={{ color: 'rgba(212,165,116,0.4)', fontSize: 14, margin: '16px 0 24px' }}>
          ✦ &nbsp; ✦ &nbsp; ✦
        </div>

        {/* Subtitle */}
        <p style={{
          fontFamily: "'Crimson Pro', serif",
          fontSize: 20,
          color: 'rgba(250,248,245,0.65)',
          maxWidth: 640,
          margin: '0 auto 40px auto',
          lineHeight: 1.6,
        }}>
          {preset.subtitle}
        </p>

        {/* Main Big CTA Button matching Screenshot 2 */}
        <div style={{ marginBottom: 20 }}>
          <Link
            href={`/create?template=${preset.slug}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              background: 'linear-gradient(135deg, #c41e3a 0%, #8b1824 100%)',
              color: '#ffffff',
              padding: '16px 36px',
              borderRadius: 8,
              textDecoration: 'none',
              fontFamily: "'Crimson Pro', serif",
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              boxShadow: '0 6px 24px rgba(196, 30, 58, 0.45), inset 0 1px 0 rgba(255,255,255,0.2)',
              transition: 'all 0.2s ease',
            }}
          >
            ✉ {preset.buttonText}
          </Link>
        </div>

        {/* Sub-caption matching Screenshot 2 */}
        <div style={{
          fontFamily: "'Crimson Pro', serif",
          fontSize: 11,
          letterSpacing: '0.24em',
          textTransform: 'uppercase',
          color: 'rgba(212,165,116,0.4)',
          marginBottom: 60,
        }}>
          FOR THE MOMENTS YOU CAN'T BE THERE.
        </div>

        {/* Paragraph prose explanation matching Screenshot 2 */}
        <div style={{
          background: 'rgba(20, 8, 14, 0.60)',
          border: '1px solid rgba(255, 215, 180, 0.10)',
          borderRadius: 16,
          padding: '36px 32px',
          maxWidth: 720,
          margin: '0 auto 60px auto',
          textAlign: 'center',
          boxShadow: '0 12px 36px rgba(0,0,0,0.4)',
        }}>
          <p style={{
            fontFamily: "'Crimson Pro', serif",
            fontSize: 18,
            color: 'rgba(250,248,245,0.7)',
            lineHeight: 1.7,
            margin: 0,
          }}>
            Sometimes the people we love need to hear from us at moments we can't be there. An "Open When..." letter gives them your presence when you are far away.
          </p>
        </div>

      </div>
      <Footer />
    </>
  );
}
