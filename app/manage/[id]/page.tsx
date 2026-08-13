'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
// @ts-ignore
import confetti from 'canvas-confetti';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface LetterEvent {
  id: string;
  type: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

interface LetterStatus {
  id: string;
  title: string;
  font: string;
  theme: string;
  envelope: string;
  song: string;
  songArtist: string;
  songArtwork: string;
  voiceMessage: string;
  voiceDuration: number;
  photo: string;
  sealStatus: 'unopened' | 'unsealed';
  viewCount: number;
  attemptCount: number;
  reactions: string[];
  createdAt: string;
  openedAt: string | null;
  lastViewedAt: string | null;
  guardianType: string;
  events: LetterEvent[];
}

// ─── Helper functions ──────────────────────────────────────────────────────────

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return '—';
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 5) return 'Just now';
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function formatTimestamp(dateStr: string): string {
  const d = new Date(dateStr);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[d.getMonth()];
  const day = d.getDate();
  const hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h12 = hours % 12 || 12;
  return `${month} ${day} · ${h12}:${minutes} ${ampm}`;
}

function formatCreatedAt(dateStr: string): string {
  const d = new Date(dateStr);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()} · ${formatTimestamp(dateStr).split(' · ')[1]}`;
}

function eventLabel(type: string, metadata: Record<string, unknown>): { icon: string; label: string } {
  switch (type) {
    case 'letter_created':
      return { icon: '✦', label: 'Letter created' };
    case 'letter_link_opened':
      return { icon: '👁', label: 'Letter link opened' };
    case 'unlock_failed':
      return { icon: '🔒', label: `Unlock attempt failed (attempt ${metadata?.attempt ?? ''})` };
    case 'letter_unsealed':
      return { icon: '💌', label: 'Letter unsealed' };
    case 'reaction_added':
      return { icon: String(metadata?.reaction ?? '💖'), label: `Reaction received: ${metadata?.reaction ?? ''}` };
    default:
      return { icon: '•', label: type.replace(/_/g, ' ') };
  }
}

// ─── Main component ────────────────────────────────────────────────────────────

function ManagePageInner() {
  const params = useParams();
  const id = params?.id as string;
  const searchParams = useSearchParams();
  const token = searchParams?.get('token') || '';

  const [status, setStatus] = useState<LetterStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);
  const [manageCopied, setManageCopied] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const shareUrl = `${origin}/r/${id}`;
  const manageUrl = `${origin}/manage/${id}?token=${token}`;

  const fetchStatus = useCallback(async () => {
    if (!id || !token) return;
    try {
      const res = await fetch(`/api/letters/${id}/manage?token=${encodeURIComponent(token)}`);
      if (res.status === 401 || res.status === 403) {
        setAuthError(true);
        setLoading(false);
        return;
      }
      if (res.status === 404) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      if (!res.ok) {
        setLoading(false);
        return;
      }
      const data = await res.json();
      setStatus(data);
      setLastRefreshed(new Date());
    } catch (e) {
      console.error('Failed to fetch letter status:', e);
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Fire confetti only once when first loaded with a valid token
  const [confettiFired, setConfettiFired] = useState(false);
  useEffect(() => {
    if (status && !confettiFired) {
      try {
        confetti({
          particleCount: 60,
          spread: 55,
          origin: { y: 0.3 },
          colors: ['#c41e3a', '#d4a574', '#8b1824', '#f5f0e6'],
        });
        setConfettiFired(true);
      } catch {
        // ignore
      }
    }
  }, [status, confettiFired]);

  function copyShare() {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  }

  function copyManage() {
    navigator.clipboard.writeText(manageUrl).then(() => {
      setManageCopied(true);
      setTimeout(() => setManageCopied(false), 2200);
    });
  }

  // ── No token provided ──────────────────────────────────────────────────────
  if (!token) {
    return (
      <div style={{ minHeight: '100vh', background: '#080204', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: "'Crimson Pro', serif", color: '#faf8f5' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'radial-gradient(circle at 35% 30%, #e42038, #8b1820)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, marginBottom: 24, boxShadow: '0 0 32px rgba(228,32,56,0.5)' }}>🔒</div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, marginBottom: 10, textAlign: 'center' }}>Management access required</h1>
        <p style={{ color: 'rgba(250,248,245,0.45)', fontSize: 15, textAlign: 'center', maxWidth: 340, lineHeight: 1.6 }}>
          This page requires your private management token. Use the link that was provided when you created your letter.
        </p>
        <Link href="/create" style={{ marginTop: 28, color: '#d4a574', textDecoration: 'none', fontSize: 14 }}>← Create a new letter</Link>
      </div>
    );
  }

  // ── Auth error ─────────────────────────────────────────────────────────────
  if (authError) {
    return (
      <div style={{ minHeight: '100vh', background: '#080204', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: "'Crimson Pro', serif", color: '#faf8f5' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'radial-gradient(circle at 35% 30%, #e42038, #8b1820)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, marginBottom: 24, boxShadow: '0 0 32px rgba(228,32,56,0.5)' }}>🚫</div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, marginBottom: 10, textAlign: 'center' }}>Invalid management link</h1>
        <p style={{ color: 'rgba(250,248,245,0.45)', fontSize: 15, textAlign: 'center', maxWidth: 340, lineHeight: 1.6 }}>
          The management token in this URL is not valid for this letter. Please use the exact link that was provided when the letter was created.
        </p>
        <Link href="/create" style={{ marginTop: 28, color: '#d4a574', textDecoration: 'none', fontSize: 14 }}>← Create a new letter</Link>
      </div>
    );
  }

  // ── Not found ──────────────────────────────────────────────────────────────
  if (notFound) {
    return (
      <div style={{ minHeight: '100vh', background: '#080204', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: "'Crimson Pro', serif", color: '#faf8f5' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'radial-gradient(circle at 35% 30%, #e42038, #8b1820)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, marginBottom: 24 }}>✉</div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, marginBottom: 10, textAlign: 'center' }}>Letter not found</h1>
        <p style={{ color: 'rgba(250,248,245,0.45)', fontSize: 15, textAlign: 'center', maxWidth: 340, lineHeight: 1.6 }}>
          This letter may have expired or been removed.
        </p>
        <Link href="/create" style={{ marginTop: 28, color: '#d4a574', textDecoration: 'none', fontSize: 14 }}>← Create a new letter</Link>
      </div>
    );
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at 50% 15%, #2a0b12 0%, #120408 55%, #080204 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, fontFamily: "'Crimson Pro', serif", color: 'rgba(212,165,116,0.7)' }}>
        <div style={{ width: 24, height: 24, border: '2px solid rgba(139,32,32,0.3)', borderTop: '2px solid #8b2020', borderRadius: '50%', animation: 'spin 0.9s linear infinite' }} />
        <span style={{ fontSize: 15, letterSpacing: '0.04em' }}>Loading status…</span>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  // ── Dashboard ──────────────────────────────────────────────────────────────
  const isSealed = status?.sealStatus !== 'unsealed';
  const hasReactions = status && status.reactions.length > 0;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 50% 15%, #2a0b12 0%, #120408 55%, #080204 100%)',
      fontFamily: "'Crimson Pro', Georgia, serif",
      color: '#faf8f5',
    }}>
      {/* Announcement Bar */}
      <div className="announcement-bar">
        <span>🎓</span>
        <span>Send-Off Collection — letters for the people you're cheering on</span>
        <Link href="/open-when/graduation" style={{ color: 'rgba(180,180,255,0.7)', marginLeft: '4px', textDecoration: 'underline', fontSize: '13px' }}>Browse →</Link>
      </div>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 20px 60px' }}>

        {/* Return */}
        <div style={{ marginBottom: 20 }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'rgba(212,165,116,0.65)', fontSize: 14, textDecoration: 'none' }}>
            ← Home
          </Link>
        </div>

        {/* Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 28 }}>
          <div style={{
            width: 68, height: 68, borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 30%, #e42038 0%, #8b1820 60%, #4a0a10 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, boxShadow: '0 0 40px rgba(228,32,56,0.55), 0 8px 24px rgba(0,0,0,0.6)',
            border: '1px solid rgba(255,255,255,0.18)',
            animation: 'sealFloat 3.5s ease-in-out infinite',
            marginBottom: 16,
          }}>❤</div>
          <p style={{ fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(212,165,116,0.5)', margin: 0 }}>Message Status</p>
        </div>

        {/* ── Title & Status Card ──────────────────────────────────────────── */}
        <div style={{
          background: 'rgba(20,8,14,0.75)', backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,215,180,0.10)', borderRadius: 14,
          padding: '20px 22px', marginBottom: 14,
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <h1 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(18px, 4vw, 24px)',
                fontWeight: 600, color: '#faf8f5', margin: '0 0 8px', lineHeight: 1.3,
              }}>
                {status?.title || 'Untitled Letter'}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                {/* Status badge */}
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  background: isSealed ? 'rgba(212,165,116,0.12)' : 'rgba(40,160,80,0.18)',
                  border: `1px solid ${isSealed ? 'rgba(212,165,116,0.28)' : 'rgba(60,200,100,0.35)'}`,
                  borderRadius: 20, padding: '3px 12px',
                  fontSize: 12, fontWeight: 600, letterSpacing: '0.06em',
                  color: isSealed ? '#d4a574' : '#5ae08a',
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: isSealed ? '#d4a574' : '#5ae08a', display: 'inline-block' }} />
                  {isSealed ? 'Active' : 'Opened'}
                </span>
                <span style={{ fontSize: 13, color: 'rgba(250,248,245,0.35)' }}>
                  Created {status ? timeAgo(status.createdAt) : '—'}
                </span>
              </div>
            </div>
          </div>

          {status && (
            <p style={{ fontSize: 12, color: 'rgba(250,248,245,0.25)', margin: '12px 0 0', fontFamily: "'Crimson Pro', serif" }}>
              {formatCreatedAt(status.createdAt)}
            </p>
          )}
        </div>

        {/* ── Recipient Link Card ──────────────────────────────────────────── */}
        <div style={{
          background: 'rgba(20,8,14,0.72)', backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,215,180,0.10)', borderRadius: 14,
          padding: '20px 22px', marginBottom: 14,
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        }}>
          <div style={{ fontSize: 12, letterSpacing: '0.1em', color: 'rgba(212,165,116,0.6)', marginBottom: 10, textTransform: 'uppercase' }}>
            Letter link — share with them
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1, fontSize: 14, color: '#faf8f5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', opacity: 0.85 }}>
              {shareUrl}
            </div>
            <button
              onClick={copyShare}
              style={{
                background: copied ? 'rgba(46,125,50,0.35)' : 'rgba(196,30,58,0.2)',
                border: copied ? '1px solid rgba(76,175,80,0.5)' : '1px solid rgba(196,30,58,0.4)',
                borderRadius: 8, padding: '9px 16px',
                color: copied ? '#81c784' : '#e05060',
                fontFamily: "'Crimson Pro', serif", fontSize: 13.5, fontWeight: 600,
                cursor: 'pointer', whiteSpace: 'nowrap',
                display: 'flex', alignItems: 'center', gap: 6,
                transition: 'all 0.2s ease', flexShrink: 0,
              }}
            >
              {copied ? '✓ Copied!' : '📋 Copy letter link'}
            </button>
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
            <Link href={`/r/${id}`} target="_blank" rel="noopener noreferrer"
              style={{ color: 'rgba(212,165,116,0.6)', fontSize: 13, textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#d4a574')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(212,165,116,0.6)')}>
              ↗ Preview sealed letter
            </Link>
          </div>
        </div>

        {/* ── Statistics Grid ──────────────────────────────────────────────── */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: 10, marginBottom: 14,
        }}>
          {/* Seal */}
          <div style={{
            background: 'rgba(20,8,14,0.72)', border: '1px solid rgba(255,215,180,0.08)',
            borderRadius: 12, padding: '18px 18px',
          }}>
            <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(212,165,116,0.5)', marginBottom: 8 }}>
              🔒 Seal
            </div>
            <div style={{
              fontSize: 20, fontWeight: 700, fontFamily: "'Playfair Display', serif",
              color: isSealed ? 'rgba(250,248,245,0.8)' : '#5ae08a', marginBottom: 4,
            }}>
              {isSealed ? 'Unopened' : 'Opened'}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(250,248,245,0.3)' }}>
              {isSealed
                ? (status?.viewCount ?? 0) > 0 ? `Last seen ${timeAgo(status!.lastViewedAt)}` : 'Not viewed yet'
                : `Opened ${timeAgo(status!.openedAt)}`
              }
            </div>
          </div>

          {/* Views */}
          <div style={{
            background: 'rgba(20,8,14,0.72)', border: '1px solid rgba(255,215,180,0.08)',
            borderRadius: 12, padding: '18px 18px',
          }}>
            <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(212,165,116,0.5)', marginBottom: 8 }}>
              👁 Views
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "'Playfair Display', serif", color: 'rgba(250,248,245,0.85)', marginBottom: 4 }}>
              {status?.viewCount ?? 0}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(250,248,245,0.3)' }}>
              {status?.lastViewedAt ? `Last ${timeAgo(status.lastViewedAt)}` : 'Not viewed yet'}
            </div>
          </div>

          {/* Attempts */}
          <div style={{
            background: 'rgba(20,8,14,0.72)', border: '1px solid rgba(255,215,180,0.08)',
            borderRadius: 12, padding: '18px 18px',
          }}>
            <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(212,165,116,0.5)', marginBottom: 8 }}>
              ⏱ Attempts
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "'Playfair Display', serif", color: 'rgba(250,248,245,0.85)', marginBottom: 4 }}>
              {status?.attemptCount ?? 0}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(250,248,245,0.3)' }}>
              Unlock attempts
            </div>
          </div>

          {/* Reactions */}
          <div style={{
            background: 'rgba(20,8,14,0.72)', border: '1px solid rgba(255,215,180,0.08)',
            borderRadius: 12, padding: '18px 18px',
          }}>
            <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(212,165,116,0.5)', marginBottom: 8 }}>
              💖 Reaction
            </div>
            <div style={{ fontSize: hasReactions ? 24 : 20, fontWeight: 700, fontFamily: "'Playfair Display', serif", color: 'rgba(250,248,245,0.85)', marginBottom: 4, letterSpacing: hasReactions ? '0.1em' : 0 }}>
              {hasReactions ? status!.reactions.join(' ') : '—'}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(250,248,245,0.3)' }}>
              {hasReactions ? `${status!.reactions.length} received` : 'No reaction yet'}
            </div>
          </div>
        </div>

        {/* ── Attached Media ────────────────────────────────────────────────── */}
        {status && (status.song || status.voiceMessage || status.photo) && (
          <div style={{
            background: 'rgba(20,8,14,0.72)', border: '1px solid rgba(255,215,180,0.08)',
            borderRadius: 14, padding: '18px 20px', marginBottom: 14,
          }}>
            <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(212,165,116,0.5)', marginBottom: 12 }}>
              Attached
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {status.song && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {status.songArtwork && (
                    <img src={status.songArtwork} alt="" style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  )}
                  {!status.songArtwork && (
                    <div style={{ width: 36, height: 36, borderRadius: 6, background: 'rgba(139,32,32,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>♫</div>
                  )}
                  <div>
                    <div style={{ fontSize: 14, color: 'rgba(250,248,245,0.85)', fontWeight: 600 }}>{status.song}</div>
                    {status.songArtist && <div style={{ fontSize: 12, color: 'rgba(250,248,245,0.4)' }}>{status.songArtist}</div>}
                  </div>
                </div>
              )}
              {status.voiceMessage && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 6, background: 'rgba(139,32,32,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🎙</div>
                  <div>
                    <div style={{ fontSize: 14, color: 'rgba(250,248,245,0.85)', fontWeight: 600 }}>Voice message</div>
                    {status.voiceDuration > 0 && <div style={{ fontSize: 12, color: 'rgba(250,248,245,0.4)' }}>{Math.round(status.voiceDuration)}s recording</div>}
                  </div>
                </div>
              )}
              {status.photo && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 6, background: 'rgba(139,32,32,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>📷</div>
                  <div style={{ fontSize: 14, color: 'rgba(250,248,245,0.85)', fontWeight: 600 }}>Photo attached</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Activity Timeline ─────────────────────────────────────────────── */}
        <div style={{
          background: 'rgba(20,8,14,0.72)', border: '1px solid rgba(255,215,180,0.08)',
          borderRadius: 14, padding: '18px 20px', marginBottom: 14,
        }}>
          <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(212,165,116,0.5)', marginBottom: 14 }}>
            Letter Activity
          </div>

          {(!status?.events || status.events.length === 0) ? (
            <p style={{ color: 'rgba(250,248,245,0.3)', fontSize: 14, fontStyle: 'italic', margin: 0 }}>
              Your letter hasn't been opened yet.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {status.events.map((event, index) => {
                const { icon, label } = eventLabel(event.type, event.metadata);
                const isLast = index === status.events.length - 1;
                return (
                  <div key={event.id} style={{ display: 'flex', gap: 14, position: 'relative' }}>
                    {/* Timeline connector */}
                    {!isLast && (
                      <div style={{
                        position: 'absolute', left: 18, top: 32, bottom: 0, width: 1,
                        background: 'rgba(212,165,116,0.12)',
                        zIndex: 0,
                      }} />
                    )}
                    {/* Dot */}
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                      background: 'rgba(30,12,20,0.9)',
                      border: '1px solid rgba(212,165,116,0.18)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 14, zIndex: 1, position: 'relative',
                    }}>
                      {icon}
                    </div>
                    {/* Content */}
                    <div style={{ paddingBottom: isLast ? 0 : 18, paddingTop: 6, flex: 1 }}>
                      <div style={{ fontSize: 14, color: 'rgba(250,248,245,0.8)', fontWeight: 500, marginBottom: 2 }}>
                        {label}
                      </div>
                      <div style={{ fontSize: 12, color: 'rgba(250,248,245,0.3)' }}>
                        {formatTimestamp(event.createdAt)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Refresh button */}
          <div style={{ marginTop: 16, borderTop: '1px solid rgba(212,165,116,0.08)', paddingTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: 'rgba(250,248,245,0.25)' }}>
              Updated {timeAgo(lastRefreshed.toISOString())}
            </span>
            <button
              onClick={fetchStatus}
              style={{
                background: 'none', border: '1px solid rgba(212,165,116,0.18)',
                borderRadius: 8, padding: '6px 14px', cursor: 'pointer',
                color: 'rgba(212,165,116,0.65)', fontFamily: "'Crimson Pro', serif",
                fontSize: 13, transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(212,165,116,0.4)'; e.currentTarget.style.color = '#d4a574'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(212,165,116,0.18)'; e.currentTarget.style.color = 'rgba(212,165,116,0.65)'; }}
            >
              ↻ Refresh
            </button>
          </div>
        </div>

        {/* ── Private Management Link Card ──────────────────────────────────── */}
        <div style={{
          background: 'rgba(24,11,15,0.75)', backdropFilter: 'blur(16px)',
          border: '1px solid rgba(212,165,116,0.20)',
          borderRadius: 14, padding: '20px 22px', marginBottom: 14,
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        }}>
          <div style={{ color: '#d4a574', fontWeight: 600, fontSize: 15, marginBottom: 4 }}>
            Save this private link
          </div>
          <p style={{ color: 'rgba(250,248,245,0.45)', fontSize: 13, lineHeight: 1.55, margin: '0 0 14px' }}>
            This is the only way to return to this status dashboard. Keep it safe.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input
              readOnly
              value={manageUrl}
              style={{
                flex: 1, background: 'rgba(10,4,7,0.65)',
                border: '1px solid rgba(212,165,116,0.15)', borderRadius: 8,
                padding: '10px 14px', color: 'rgba(250,248,245,0.8)',
                fontFamily: "'Crimson Pro', serif", fontSize: 13,
                outline: 'none', overflow: 'hidden', textOverflow: 'ellipsis',
              }}
            />
            <button
              onClick={copyManage}
              style={{
                background: manageCopied ? 'rgba(46,125,50,0.35)' : 'rgba(212,165,116,0.1)',
                border: manageCopied ? '1px solid rgba(76,175,80,0.5)' : '1px solid rgba(212,165,116,0.28)',
                borderRadius: 8, padding: '10px 14px',
                color: manageCopied ? '#81c784' : '#d4a574',
                fontFamily: "'Crimson Pro', serif", fontSize: 13, fontWeight: 600,
                cursor: 'pointer', whiteSpace: 'nowrap',
                display: 'flex', alignItems: 'center', gap: 6,
                transition: 'all 0.2s ease',
              }}
            >
              {manageCopied ? '✓ Copied' : '📋 Copy'}
            </button>
          </div>
        </div>

        {/* ── Footer note ───────────────────────────────────────────────────── */}
        <div style={{ textAlign: 'center', paddingTop: 8 }}>
          <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: 13, color: 'rgba(250,248,245,0.2)', letterSpacing: '0.04em' }}>
            made with send letter
          </p>
        </div>
      </div>

      <style>{`
        @keyframes sealFloat {
          0%, 100% { transform: translateY(0px); box-shadow: 0 0 40px rgba(228,32,56,0.55), 0 8px 24px rgba(0,0,0,0.6); }
          50% { transform: translateY(-8px); box-shadow: 0 0 55px rgba(228,32,56,0.75), 0 16px 32px rgba(0,0,0,0.7); }
        }
      `}</style>
    </div>
  );
}

export default function ManagePage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#d4a574', background: '#080204', fontFamily: "'Crimson Pro', serif",
      }}>
        Loading…
      </div>
    }>
      <ManagePageInner />
    </Suspense>
  );
}
