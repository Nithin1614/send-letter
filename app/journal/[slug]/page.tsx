'use client';

import { use } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { JOURNAL_ARTICLES } from '@/lib/journalData';

function OrnamentDivider() {
  return (
    <div style={{ textAlign: 'center', margin: '32px 0', color: 'rgba(212,165,116,0.35)', fontSize: 13 }}>
      ✦ &nbsp; ✦ &nbsp; ✦
    </div>
  );
}

export default function JournalArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const article = JOURNAL_ARTICLES.find(a => a.slug === slug) || JOURNAL_ARTICLES[0];
  const relatedArticles = JOURNAL_ARTICLES.filter(a => a.slug !== article.slug).slice(0, 3);

  return (
    <>
      <Navbar />
      <div className="ow-page" style={{ minHeight: '100vh', background: 'var(--bg)', paddingTop: 40, paddingBottom: 100 }}>
        
        {/* Article Container (Narrower for optimal reading typography) */}
        <article style={{ maxWidth: 760, margin: '0 auto' }}>
          
          {/* Breadcrumb */}
          <div className="ow-breadcrumb" style={{ marginBottom: 20 }}>
            SEND LETTER / <Link href="/journal" style={{ color: 'rgba(212,165,116,0.6)', textDecoration: 'none' }}>JOURNAL</Link> / {article.category.toUpperCase()}
          </div>

          {/* Title */}
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(2.2rem, 5vw, 3.4rem)',
            fontWeight: 600,
            color: '#faf8f5',
            lineHeight: 1.2,
            marginBottom: 16,
          }}>
            {article.title}
          </h1>

          {/* Subtitle */}
          <p style={{
            fontFamily: "'Crimson Pro', serif",
            fontSize: 20,
            color: 'rgba(250,248,245,0.70)',
            lineHeight: 1.6,
            marginBottom: 24,
            fontStyle: 'italic',
          }}>
            {article.subtitle}
          </p>

          {/* Metadata Row */}
          <div style={{
            fontFamily: "'Crimson Pro', serif",
            fontSize: 13,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#d4a574',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 36,
            paddingBottom: 16,
            borderBottom: '1px solid rgba(255, 215, 180, 0.10)',
          }}>
            <span>By Send Letter Editorial</span>
            <span>✦</span>
            <span>{article.date}</span>
            <span>✦</span>
            <span>{article.readTime}</span>
          </div>

          {/* Hero Image */}
          <div style={{
            borderRadius: 16,
            overflow: 'hidden',
            marginBottom: 40,
            border: '1px solid rgba(255, 215, 180, 0.12)',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.5)',
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={article.heroImage}
              alt={article.heroAlt}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?auto=format&fit=crop&w=1200&q=80';
              }}
              style={{
                width: '100%',
                maxHeight: 480,
                objectFit: 'cover',
                display: 'block',
              }}
            />
          </div>

          {/* Introduction */}
          <div style={{
            fontFamily: "'Crimson Pro', serif",
            fontSize: 19,
            color: 'rgba(250,248,245,0.85)',
            lineHeight: 1.8,
            marginBottom: 40,
            whiteSpace: 'pre-line',
          }}>
            {article.intro}
          </div>

          <OrnamentDivider />

          {/* Article Sections */}
          {article.sections.map((sec, idx) => (
            <section key={idx} style={{ marginBottom: 44 }}>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 26,
                fontWeight: 600,
                color: '#faf8f5',
                marginBottom: 18,
                marginTop: 32,
              }}>
                {sec.heading}
              </h2>

              {sec.content.map((p, pIdx) => (
                <p key={pIdx} style={{
                  fontFamily: "'Crimson Pro', serif",
                  fontSize: 18,
                  color: 'rgba(250,248,245,0.75)',
                  lineHeight: 1.8,
                  marginBottom: 20,
                }}>
                  {p}
                </p>
              ))}

              {/* Callouts (Quote, Prompts, Insight) */}
              {sec.callout && (
                <div style={{
                  background: sec.callout.type === 'quote'
                    ? 'rgba(196, 30, 58, 0.12)'
                    : 'rgba(20, 8, 14, 0.75)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  borderLeft: '3px solid #d4a574',
                  borderTop: '1px solid rgba(255,215,180,0.10)',
                  borderRight: '1px solid rgba(255,215,180,0.10)',
                  borderBottom: '1px solid rgba(255,215,180,0.10)',
                  borderRadius: '0 12px 12px 0',
                  padding: '24px 28px',
                  margin: '28px 0 32px 0',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                }}>
                  {sec.callout.title && (
                    <div style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: 18,
                      fontWeight: 600,
                      color: '#d4a574',
                      marginBottom: 12,
                    }}>
                      ✦ {sec.callout.title}
                    </div>
                  )}

                  {sec.callout.text && (
                    <p style={{
                      fontFamily: "'Crimson Pro', serif",
                      fontSize: 18,
                      fontStyle: sec.callout.type === 'quote' ? 'italic' : 'normal',
                      color: '#faf8f5',
                      lineHeight: 1.7,
                      margin: 0,
                      whiteSpace: 'pre-line',
                    }}>
                      "{sec.callout.text}"
                    </p>
                  )}

                  {sec.callout.items && (
                    <ul style={{ margin: 0, paddingLeft: 20, listStyle: 'none' }}>
                      {sec.callout.items.map((item, itemIdx) => (
                        <li key={itemIdx} style={{
                          fontFamily: "'Crimson Pro', serif",
                          fontSize: 17,
                          color: 'rgba(250,248,245,0.85)',
                          lineHeight: 1.7,
                          marginBottom: 10,
                          position: 'relative',
                        }}>
                          <span style={{ color: '#d4a574', marginRight: 8 }}>◆</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </section>
          ))}

          {/* Conclusion */}
          <div style={{
            background: 'rgba(20, 8, 14, 0.60)',
            border: '1px solid rgba(255, 215, 180, 0.12)',
            borderRadius: 16,
            padding: '32px 28px',
            marginBottom: 52,
            boxShadow: '0 12px 36px rgba(0,0,0,0.4)',
          }}>
            <h3 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 22,
              color: '#d4a574',
              marginBottom: 12,
            }}>
              Final Thoughts
            </h3>
            <p style={{
              fontFamily: "'Crimson Pro', serif",
              fontSize: 18,
              color: 'rgba(250,248,245,0.80)',
              lineHeight: 1.8,
              margin: 0,
            }}>
              {article.conclusion}
            </p>
          </div>

          {/* Academic Sources & References */}
          {article.references && article.references.length > 0 && (
            <div style={{
              borderTop: '1px solid rgba(255, 215, 180, 0.12)',
              paddingTop: 32,
              marginBottom: 60,
            }}>
              <h3 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 20,
                color: '#faf8f5',
                marginBottom: 16,
              }}>
                Sources & Research References
              </h3>
              <ul style={{ paddingLeft: 0, listStyle: 'none' }}>
                {article.references.map((ref, refIdx) => (
                  <li key={refIdx} style={{
                    fontFamily: "'Crimson Pro', serif",
                    fontSize: 14.5,
                    color: 'rgba(250,248,245,0.55)',
                    lineHeight: 1.65,
                    marginBottom: 12,
                  }}>
                    <strong style={{ color: 'rgba(250,248,245,0.85)' }}>{ref.authors}</strong> ({ref.year}).{' '}
                    <em>{ref.title}</em>. {ref.publication}.{' '}
                    {ref.doiOrUrl && (
                      <a
                        href={ref.doiOrUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#d4a574', textDecoration: 'none', marginLeft: 4 }}
                      >
                        [DOI/Source]
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Bottom Call to Action */}
          <div style={{
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(196,30,58,0.2), rgba(20,8,14,0.8))',
            border: '1px solid rgba(255, 215, 180, 0.15)',
            borderRadius: 16,
            padding: '40px 24px',
            marginBottom: 72,
            boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
          }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>💌</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, marginBottom: 8, color: '#faf8f5' }}>
              Write Something Worth Keeping
            </h2>
            <p style={{ color: 'rgba(250,248,245,0.60)', fontSize: 16, margin: '0 auto 24px auto', maxWidth: 480 }}>
              Put your thoughts into a sealed letter today. Your recipient can open it whenever they need it most.
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
              Start Writing a Letter ✦
            </Link>
          </div>

          {/* Related Articles Section */}
          <div style={{ marginTop: 60 }}>
            <h3 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 22,
              color: '#faf8f5',
              marginBottom: 24,
            }}>
              Related Journal Entries
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: 20,
            }}>
              {relatedArticles.map(rel => (
                <Link
                  key={rel.slug}
                  href={`/journal/${rel.slug}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div style={{
                    background: 'rgba(20, 8, 14, 0.50)',
                    border: '1px solid rgba(255, 215, 180, 0.08)',
                    borderRadius: 12,
                    overflow: 'hidden',
                    transition: 'all 0.2s ease',
                  }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={rel.heroImage}
                      alt={rel.heroAlt}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?auto=format&fit=crop&w=1200&q=80';
                      }}
                      style={{ width: '100%', height: 120, objectFit: 'cover' }}
                    />
                    <div style={{ padding: 14 }}>
                      <div style={{ fontSize: 9.5, color: '#d4a574', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4 }}>
                        {rel.category}
                      </div>
                      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 14.5, color: '#faf8f5', fontWeight: 600, lineHeight: 1.3 }}>
                        {rel.title}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

        </article>
      </div>
      <Footer />
    </>
  );
}
