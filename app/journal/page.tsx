'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { JOURNAL_ARTICLES } from '@/lib/journalData';

function OrnamentDivider() {
  return (
    <div style={{ textAlign: 'center', margin: '20px 0', color: 'rgba(212,165,116,0.35)', fontSize: 13 }}>
      ✦ &nbsp; ✦ &nbsp; ✦
    </div>
  );
}

export default function JournalPage() {
  const featuredArticle = JOURNAL_ARTICLES.find(a => a.featured) || JOURNAL_ARTICLES[0];
  const gridArticles = JOURNAL_ARTICLES.filter(a => a.slug !== featuredArticle.slug);

  return (
    <>
      <Navbar />
      <div className="ow-page" style={{ minHeight: '100vh', background: 'var(--bg)' }}>

        {/* Header Breadcrumb & Title */}
        <div style={{ marginBottom: 32 }}>
          <div className="ow-breadcrumb">SEND LETTER / THE JOURNAL</div>
          <h1 className="ow-h1">The Journal</h1>
          <p className="ow-desc" style={{ marginTop: 8 }}>
            Reflections, research, and guided prompts on letter writing, memory, distance, and the words that stay with us.
          </p>
        </div>

        {/* ═══════════════════ FEATURED HERO CARD (Matching Screenshot 1) ═══════════════════ */}
        <Link
          href={`/journal/${featuredArticle.slug}`}
          style={{ textDecoration: 'none', display: 'block', marginBottom: 48 }}
        >
          <div style={{
            background: 'rgba(20, 8, 14, 0.65)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 215, 180, 0.12)',
            borderRadius: 16,
            overflow: 'hidden',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.5)',
            transition: 'transform 0.25s ease, border-color 0.25s ease',
          }}
          className="featured-journal-card"
          >
            {/* Left Column: Hero Image */}
            <div style={{ position: 'relative', minHeight: 320, width: '100%' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={featuredArticle.heroImage}
                alt={featuredArticle.heroAlt}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?auto=format&fit=crop&w=1200&q=80';
                }}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </div>

            {/* Right Column: Featured Content */}
            <div style={{
              padding: '40px 36px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}>
              <div style={{
                fontFamily: "'Crimson Pro', serif",
                fontSize: 11,
                letterSpacing: '0.24em',
                textTransform: 'uppercase',
                color: '#d4a574',
                marginBottom: 14,
                fontWeight: 600,
              }}>
                LATEST · {featuredArticle.category.toUpperCase()}
              </div>

              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(1.6rem, 3.2vw, 2.3rem)',
                fontWeight: 600,
                color: '#faf8f5',
                lineHeight: 1.25,
                marginBottom: 16,
              }}>
                {featuredArticle.title}
              </h2>

              <p style={{
                fontFamily: "'Crimson Pro', serif",
                fontSize: 16,
                color: 'rgba(250,248,245,0.60)',
                lineHeight: 1.65,
                marginBottom: 28,
              }}>
                {featuredArticle.subtitle}
              </p>

              <div style={{
                fontFamily: "'Crimson Pro', serif",
                fontSize: 14,
                fontWeight: 600,
                color: '#d4a574',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}>
                READ THE ENTRY &rarr;
              </div>
            </div>
          </div>
        </Link>

        <OrnamentDivider />

        {/* ═══════════════════ 3-COLUMN ARTICLE GRID (Matching Screenshot 2) ═══════════════════ */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 28,
          marginBottom: 64,
        }}>
          {gridArticles.map(article => (
            <Link
              key={article.slug}
              href={`/journal/${article.slug}`}
              style={{ textDecoration: 'none', display: 'flex' }}
            >
              <div style={{
                background: 'rgba(20, 8, 14, 0.60)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 215, 180, 0.10)',
                borderRadius: 14,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
                transition: 'all 0.2s ease',
              }}>
                {/* Top Image with Gradient Overlay */}
                <div style={{ position: 'relative', height: 180, width: '100%', overflow: 'hidden' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={article.heroImage}
                    alt={article.heroAlt}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?auto=format&fit=crop&w=1200&q=80';
                    }}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 60,
                    background: 'linear-gradient(to top, rgba(20, 8, 14, 0.95), transparent)',
                  }} />
                </div>

                {/* Card Content Body */}
                <div style={{ padding: '20px 22px 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{
                    fontFamily: "'Crimson Pro', serif",
                    fontSize: 10.5,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'rgba(212,165,116,0.6)',
                    marginBottom: 8,
                    fontWeight: 600,
                  }}>
                    {article.category}
                  </div>

                  <h3 style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 18.5,
                    fontWeight: 600,
                    color: '#faf8f5',
                    lineHeight: 1.35,
                    marginBottom: 10,
                  }}>
                    {article.title}
                  </h3>

                  <p style={{
                    fontFamily: "'Crimson Pro', serif",
                    fontSize: 14.5,
                    color: 'rgba(250,248,245,0.50)',
                    lineHeight: 1.6,
                    marginBottom: 20,
                    flex: 1,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {article.subtitle}
                  </p>

                  <div style={{
                    fontFamily: "'Crimson Pro', serif",
                    fontSize: 11.5,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: '#d4a574',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    borderTop: '1px solid rgba(255,215,180,0.08)',
                    paddingTop: 12,
                  }}>
                    <span>{article.date}</span>
                    <span>✦</span>
                    <span>{article.readTime}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom CTA Banner */}
        <div style={{
          textAlign: 'center',
          background: 'rgba(30, 10, 18, 0.45)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 215, 180, 0.12)',
          borderRadius: 16,
          padding: '40px 24px',
          marginBottom: 60,
          boxShadow: '0 12px 36px rgba(0,0,0,0.4)',
        }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🖋️</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, marginBottom: 8, color: '#faf8f5' }}>
            Some things are worth putting into words.
          </h2>
          <p style={{ color: 'rgba(250,248,245,0.55)', fontSize: 15, margin: '0 auto 24px auto', maxWidth: 500 }}>
            Notifications vanish, but a sealed letter preserves your feelings for the moments that matter most.
          </p>
          <Link
            href="/create"
            style={{
              background: 'linear-gradient(135deg, #c41e3a 0%, #8b1824 100%)',
              color: '#fff',
              padding: '14px 32px',
              borderRadius: 10,
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: 15,
              display: 'inline-block',
              boxShadow: '0 4px 16px rgba(196,30,58,0.4)',
            }}
          >
            Write a Sealed Letter ✦
          </Link>
        </div>

      </div>
      <Footer />
    </>
  );
}
