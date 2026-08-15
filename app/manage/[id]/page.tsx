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

interface LetterReply {
  id: string;
  title: string;
  signature: string;
  font: string;
  theme: string;
  sealStatus: 'unopened' | 'unsealed';
  createdAt: string;
  openedAt: string | null;
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
  revisitCount?: number;
  attemptCount: number;
  reactions: string[];
  unlockAt?: string | null;
  ambientSoundscape?: string | null;
  senderEmail?: string;
  recipientEmail?: string;
  scheduledFor?: string;
  deliveryStatus?: 'draft' | 'scheduled' | 'delivered';
  replies?: LetterReply[];
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
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h12 = hours % 12 || 12;
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()} at ${h12}:${minutes} ${ampm}`;
}

function eventLabel(type: string, metadata: Record<string, unknown>): { icon: string; label: string; desc: string } {
  switch (type) {
    case 'letter_created':
      return { icon: '✦', label: 'Letter sealed & created', desc: 'Private link generated and ready to share' };
    case 'device_opened':
      if (metadata?.isFirstDevice) {
        return {
          icon: '📱',
          label: `Letter opened on ${metadata?.deviceType || 'Device'}`,
          desc: `Recipient connected from ${metadata?.deviceType || 'device'}`,
        };
      }
      return {
        icon: '🔗',
        label: `Opened on new device (${metadata?.deviceType || 'Device'})`,
        desc: 'Letter opened via shared link on a second device',
      };
    case 'letter_revisited':
      return {
        icon: '🔄',
        label: 'Letter revisited & re-read',
        desc: `Recipient returned to view your message on ${metadata?.deviceType || 'device'}`,
      };
    case 'letter_link_opened':
      return { icon: '👁', label: 'Recipient visited link', desc: 'Encountered the sealed envelope' };
    case 'unlock_failed':
      return { icon: '🔒', label: 'Protection passcode attempt', desc: `Attempt #${metadata?.attempt ?? 1}` };
    case 'letter_unsealed':
      return { icon: '💌', label: 'Letter unsealed & read', desc: 'Wax seal broken and message revealed' };
    case 'reaction_added':
      return { icon: String(metadata?.reaction ?? '💖'), label: `Reaction: ${metadata?.reaction ?? ''}`, desc: 'Recipient reacted to your letter' };
    case 'reply_received':
      return { icon: '📮', label: 'Sealed reply received', desc: metadata?.signature ? `Signed by ${metadata.signature}` : 'Sealed response received' };
    default:
      return { icon: '•', label: type.replace(/_/g, ' '), desc: 'Activity recorded' };
  }
}

// ─── Main Component ────────────────────────────────────────────────────────────

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
  const [showBurnModal, setShowBurnModal] = useState(false);
  const [burning, setBurning] = useState(false);
  const [burned, setBurned] = useState(false);

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const shareUrl = `${origin}/r/${id}`;
  const manageUrl = `${origin}/manage/${id}?token=${token}`;

  const handleBurnLetter = async () => {
    if (!id || !token || burning) return;
    setBurning(true);
    try {
      const res = await fetch(`/api/letters/${id}/manage?token=${encodeURIComponent(token)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setBurned(true);
        setShowBurnModal(false);
      } else {
        alert("Failed to burn letter. Please try again.");
      }
    } catch (e) {
      console.error("Failed to burn letter:", e);
      alert("Error burning letter.");
    } finally {
      setBurning(false);
    }
  };

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
          particleCount: 50,
          spread: 60,
          origin: { y: 0.28 },
          colors: ['#e42038', '#d4a574', '#9b1824', '#faf8f5'],
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

  async function handleNativeShare() {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: status?.title ? `Sealed Letter: ${status.title}` : 'Sealed Letter For You',
          text: `I wrote you a sealed letter on Send Letter. Break the wax seal to open it:`,
          url: shareUrl,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          copyShare();
        }
      }
    } else {
      copyShare();
    }
  }

  function copyManage() {
    navigator.clipboard.writeText(manageUrl).then(() => {
      setManageCopied(true);
      setTimeout(() => setManageCopied(false), 2200);
    });
  }

  // ── Letter Burned / Vaporized Confirmation Screen ──────────────────────────
  if (burned) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#080204',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        fontFamily: "'Crimson Pro', serif",
        color: '#faf8f5',
        textAlign: 'center',
      }}>
        <div style={{
          width: 76,
          height: 76,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 30%, #ff4d4f, #8b1820)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 36,
          marginBottom: 24,
          boxShadow: '0 0 50px rgba(255,77,79,0.6)',
          animation: 'sealPulse 2s infinite ease-in-out',
        }}>
          🔥
        </div>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "clamp(26px, 5vw, 36px)",
          marginBottom: 12,
          color: '#faf8f5',
        }}>
          Letter Burned to Ashes
        </h1>
        <p style={{
          color: 'rgba(250,248,245,0.7)',
          fontSize: 16,
          maxWidth: 440,
          lineHeight: 1.6,
          marginBottom: 32,
        }}>
          Your letter, attached photos, and voice notes have been permanently erased from our servers. Anyone who visits the link will see that it has been destroyed.
        </p>
        <Link
          href="/create"
          style={{
            background: 'linear-gradient(135deg, #e42038, #8b1820)',
            color: '#faf8f5',
            padding: '12px 28px',
            borderRadius: 10,
            textDecoration: 'none',
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: '0.04em',
            boxShadow: '0 8px 24px rgba(228,32,56,0.4)',
          }}
        >
          ✉ Write a New Letter
        </Link>
      </div>
    );
  }

  // ── No token provided ──────────────────────────────────────────────────────
  if (!token) {
    return (
      <div style={{ minHeight: '100vh', background: '#080204', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: "'Crimson Pro', serif", color: '#faf8f5' }}>
        <div style={{ width: 68, height: 68, borderRadius: '50%', background: 'radial-gradient(circle at 35% 30%, #e42038, #8b1820)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, marginBottom: 24, boxShadow: '0 0 40px rgba(228,32,56,0.5)' }}>🔒</div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, marginBottom: 10, textAlign: 'center', color: '#faf8f5' }}>Management Access Required</h1>
        <p style={{ color: 'rgba(250,248,245,0.6)', fontSize: 16, textAlign: 'center', maxWidth: 360, lineHeight: 1.6 }}>
          This page requires your private management token. Please use the exact link provided when you created your letter.
        </p>
        <Link href="/create" style={{ marginTop: 28, color: '#d4a574', textDecoration: 'none', fontSize: 15, fontWeight: 600 }}>← Create a new letter</Link>
      </div>
    );
  }

  // ── Auth error ─────────────────────────────────────────────────────────────
  if (authError) {
    return (
      <div style={{ minHeight: '100vh', background: '#080204', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: "'Crimson Pro', serif", color: '#faf8f5' }}>
        <div style={{ width: 68, height: 68, borderRadius: '50%', background: 'radial-gradient(circle at 35% 30%, #e42038, #8b1820)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, marginBottom: 24, boxShadow: '0 0 40px rgba(228,32,56,0.5)' }}>🚫</div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, marginBottom: 10, textAlign: 'center', color: '#faf8f5' }}>Invalid Management Link</h1>
        <p style={{ color: 'rgba(250,248,245,0.6)', fontSize: 16, textAlign: 'center', maxWidth: 360, lineHeight: 1.6 }}>
          The management token in this URL is not valid for this letter. Please use the original link saved upon creation.
        </p>
        <Link href="/create" style={{ marginTop: 28, color: '#d4a574', textDecoration: 'none', fontSize: 15, fontWeight: 600 }}>← Create a new letter</Link>
      </div>
    );
  }

  // ── Not found ──────────────────────────────────────────────────────────────
  if (notFound) {
    return (
      <div style={{ minHeight: '100vh', background: '#080204', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: "'Crimson Pro', serif", color: '#faf8f5' }}>
        <div style={{ width: 68, height: 68, borderRadius: '50%', background: 'radial-gradient(circle at 35% 30%, #e42038, #8b1820)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, marginBottom: 24 }}>✉</div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, marginBottom: 10, textAlign: 'center', color: '#faf8f5' }}>Letter Not Found</h1>
        <p style={{ color: 'rgba(250,248,245,0.6)', fontSize: 16, textAlign: 'center', maxWidth: 360, lineHeight: 1.6 }}>
          This letter may have expired or been removed.
        </p>
        <Link href="/create" style={{ marginTop: 28, color: '#d4a574', textDecoration: 'none', fontSize: 15, fontWeight: 600 }}>← Create a new letter</Link>
      </div>
    );
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at 50% 15%, #340e16 0%, #16050b 50%, #080204 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, fontFamily: "'Crimson Pro', serif", color: '#d4a574' }}>
        <div style={{ width: 28, height: 28, border: '2px solid rgba(212,165,116,0.25)', borderTop: '2px solid #e42038', borderRadius: '50%', animation: 'manageSpin 0.8s linear infinite' }} />
        <span style={{ fontSize: 17, letterSpacing: '0.04em', fontStyle: 'italic' }}>Retrieving sealed letter status…</span>
        <style>{`@keyframes manageSpin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  // ── Dashboard ──────────────────────────────────────────────────────────────
  const isSealed = status?.sealStatus !== 'unsealed';
  const hasReactions = status && status.reactions.length > 0;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 50% 8%, #380d19 0%, #1a050d 45%, #0a0205 100%)',
      fontFamily: "'Crimson Pro', Georgia, serif",
      color: '#faf8f5',
      position: 'relative',
      overflowX: 'hidden',
    }}>
      {/* Background Atmosphere Glows */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: 800,
        height: 400,
        background: 'radial-gradient(ellipse at 50% 0%, rgba(228, 32, 56, 0.18) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      <div style={{ maxWidth: 660, margin: '0 auto', padding: '28px 20px 80px', position: 'relative', zIndex: 1 }}>

        {/* Navigation Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 26 }}>
          <Link href="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            color: 'rgba(212,165,116,0.85)', fontSize: 14, textDecoration: 'none',
            padding: '6px 12px', borderRadius: 20, background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(212,165,116,0.2)', transition: 'all 0.2s ease',
          }}>
            ← Home
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#5ae08a', display: 'inline-block', boxShadow: '0 0 8px #5ae08a' }} />
            <span style={{ fontSize: 12.5, color: 'rgba(250,248,245,0.6)', letterSpacing: '0.04em' }}>Live Status</span>
          </div>
        </div>

        {/* ── Luxury Header Hero ──────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 30, textAlign: 'center' }}>
          <div style={{
            width: 76, height: 76, borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 25%, #ff2b47 0%, #b81428 55%, #590912 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, boxShadow: '0 0 45px rgba(228,32,56,0.55), 0 10px 25px rgba(0,0,0,0.6)',
            border: '2px solid rgba(255,230,200,0.3)',
            animation: 'sealPulse 3.5s ease-in-out infinite',
            marginBottom: 14,
            color: '#fff',
          }}>
            {isSealed ? '💌' : '❤️'}
          </div>
          <h2 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: '0.02em',
            margin: '0 0 4px',
            color: '#faf8f5',
          }}>
            Letter Delivery Dashboard
          </h2>
          <p style={{ fontSize: 13.5, color: 'rgba(212,165,116,0.75)', margin: 0, fontStyle: 'italic' }}>
            Track opens, reactions, and private activity in real time
          </p>
        </div>

        {/* ── Title & Status Hero Card ────────────────────────────────────── */}
        <div style={{
          background: 'linear-gradient(145deg, rgba(32, 12, 20, 0.85) 0%, rgba(18, 6, 12, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(212, 165, 116, 0.22)',
          borderRadius: 16,
          padding: '24px 26px',
          marginBottom: 16,
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255,255,255,0.06)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Subtle gold ribbon accent */}
          <div style={{
            position: 'absolute', top: 0, right: 0, width: 90, height: 90,
            background: 'radial-gradient(circle at 100% 0%, rgba(212,165,116,0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 260 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                {/* Status Badge */}
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: isSealed ? 'rgba(212,165,116,0.15)' : 'rgba(40,160,80,0.22)',
                  border: `1px solid ${isSealed ? 'rgba(212,165,116,0.35)' : 'rgba(70,210,110,0.45)'}`,
                  borderRadius: 20, padding: '4px 14px',
                  fontSize: 12.5, fontWeight: 700, letterSpacing: '0.06em',
                  color: isSealed ? '#e8be92' : '#5ae08a',
                  boxShadow: isSealed ? '0 2px 8px rgba(212,165,116,0.15)' : '0 2px 10px rgba(90,224,138,0.2)',
                }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: isSealed ? '#e8be92' : '#5ae08a', display: 'inline-block', boxShadow: isSealed ? '0 0 6px #e8be92' : '0 0 8px #5ae08a' }} />
                  {isSealed ? 'Sealed & Active' : 'Unsealed & Read'}
                </span>
                <span style={{ fontSize: 13, color: 'rgba(250,248,245,0.4)', fontStyle: 'italic' }}>
                  Created {status ? timeAgo(status.createdAt) : '—'}
                </span>
              </div>

              <h1 style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 'clamp(22px, 4.5vw, 28px)',
                fontWeight: 700, color: '#faf8f5', margin: '0 0 8px', lineHeight: 1.25,
                letterSpacing: '0.01em',
              }}>
                {status?.title || 'Thinking of You'}
              </h1>

              {status && (
                <div style={{ fontSize: 13, color: 'rgba(212,165,116,0.65)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>🗓</span> {formatCreatedAt(status.createdAt)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Recipient Link Card (Golden Hero Share) ─────────────────────── */}
        <div style={{
          background: 'linear-gradient(145deg, rgba(28, 10, 18, 0.9) 0%, rgba(16, 5, 10, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(228, 32, 56, 0.28)',
          borderRadius: 16,
          padding: '22px 24px',
          marginBottom: 16,
          boxShadow: '0 10px 30px rgba(0,0,0,0.5), 0 0 20px rgba(228, 32, 56, 0.08)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontSize: 12, letterSpacing: '0.12em', color: '#d4a574', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>✦</span> Shareable Letter Link
            </div>
            <span style={{ fontSize: 12, color: 'rgba(250,248,245,0.45)', fontStyle: 'italic' }}>
              Send this link to your recipient
            </span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'rgba(8, 2, 5, 0.8)',
            border: '1px solid rgba(212,165,116,0.2)',
            borderRadius: 10,
            padding: '6px 6px 6px 14px',
          }}>
            <div style={{
              flex: 1, fontSize: 13.5, color: '#faf8f5',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              fontFamily: "'Courier New', monospace", opacity: 0.9,
            }}>
              {shareUrl}
            </div>
            <button
              onClick={copyShare}
              style={{
                background: copied ? 'linear-gradient(135deg, #2e7d32, #1b5e20)' : 'linear-gradient(135deg, #c41e3a 0%, #8b1824 100%)',
                border: 'none',
                borderRadius: 8,
                padding: '10px 18px',
                color: '#fff',
                fontFamily: "'Crimson Pro', serif",
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.2s ease',
                flexShrink: 0,
                boxShadow: copied ? '0 2px 10px rgba(46,125,50,0.4)' : '0 3px 14px rgba(196,30,58,0.35)',
              }}
            >
              {copied ? '✓ Copied Link!' : '📋 Copy Letter Link'}
            </button>
          </div>

          {/* Share Letter Link Directly to Other Apps */}
          <div style={{ marginTop: 10 }}>
            <button
              onClick={handleNativeShare}
              style={{
                width: '100%',
                padding: '11px 16px',
                borderRadius: 9,
                background: 'linear-gradient(135deg, rgba(212, 165, 116, 0.16) 0%, rgba(196, 30, 58, 0.12) 100%)',
                border: '1.5px solid rgba(212, 165, 116, 0.35)',
                color: '#faf8f5',
                fontFamily: "'Crimson Pro', serif",
                fontSize: 14.5,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 4px 14px rgba(0,0,0,0.35)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(212, 165, 116, 0.25) 0%, rgba(196, 30, 58, 0.2) 100%)';
                e.currentTarget.style.borderColor = '#d4a574';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(212, 165, 116, 0.16) 0%, rgba(196, 30, 58, 0.12) 100%)';
                e.currentTarget.style.borderColor = 'rgba(212, 165, 116, 0.35)';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <span>📲</span> Share Letter Link
            </button>
          </div>

          {/* Quick Action Links */}
          <div style={{ marginTop: 14, display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <Link href={`/r/${id}`} target="_blank" rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  color: '#d4a574', fontSize: 13.5, textDecoration: 'none', fontWeight: 600,
                }}>
                ↗ Preview sealed envelope
              </Link>

              {status?.unlockAt && new Date(status.unlockAt).getTime() > Date.now() && (
                <span style={{ fontSize: 12.5, color: '#f59e0b', background: 'rgba(245,158,11,0.12)', padding: '3px 10px', borderRadius: 12, border: '1px solid rgba(245,158,11,0.3)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  ⏳ Time locked until {new Date(status.unlockAt).toLocaleDateString()}
                </span>
              )}
              {status?.scheduledFor && (
                <span style={{ fontSize: 12.5, color: '#38bdf8', background: 'rgba(56,189,248,0.12)', padding: '3px 10px', borderRadius: 12, border: '1px solid rgba(56,189,248,0.3)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  📅 Scheduled: {new Date(status.scheduledFor).toLocaleString()} {status.recipientEmail ? `to ${status.recipientEmail}` : ''}
                </span>
              )}
              {status?.senderEmail && (
                <span style={{ fontSize: 12.5, color: 'rgba(250,248,245,0.5)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  🔔 Email alerts: {status.senderEmail}
                </span>
              )}
            </div>

            <button
              onClick={() => setShowBurnModal(true)}
              style={{
                background: 'rgba(228,32,56,0.12)',
                border: '1px solid rgba(228,32,56,0.35)',
                borderRadius: 8,
                padding: '6px 14px',
                color: '#ff6b7d',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #e42038, #8b1820)';
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.borderColor = '#e42038';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(228,32,56,0.12)';
                e.currentTarget.style.color = '#ff6b7d';
                e.currentTarget.style.borderColor = 'rgba(228,32,56,0.35)';
              }}
            >
              🔥 Burn / Self-Destruct
            </button>
          </div>

          {/* Sender Reassurance Micro-Tip */}
          <div style={{
            marginTop: 14,
            padding: '9px 12px',
            borderRadius: 8,
            background: 'rgba(228, 32, 56, 0.07)',
            border: '1px dashed rgba(228, 32, 56, 0.28)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 12.5,
            color: 'rgba(250, 248, 245, 0.72)',
            lineHeight: 1.4,
          }}>
            <span style={{ fontSize: 14 }}>💡</span>
            <span>
              <strong style={{ color: '#faf8f5' }}>Changed your mind?</strong> You can hit <strong style={{ color: '#ff6b7d' }}>🔥 Burn / Self-Destruct</strong> anytime to permanently vaporize this letter and its photos from existence.
            </span>
          </div>
        </div>

        {/* ── Statistics Grid ──────────────────────────────────────────────── */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))',
          gap: 12, marginBottom: 16,
        }}>
          {/* Seal Status */}
          <div style={{
            background: 'linear-gradient(145deg, rgba(26,10,16,0.85), rgba(16,6,11,0.9))',
            border: '1px solid rgba(212,165,116,0.18)',
            borderRadius: 14, padding: '18px 18px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            transition: 'transform 0.2s ease',
          }}>
            <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(212,165,116,0.7)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
              <span>🔒</span> SEAL
            </div>
            <div style={{
              fontSize: 22, fontWeight: 700, fontFamily: "'Playfair Display', serif",
              color: isSealed ? '#faf8f5' : '#5ae08a', marginBottom: 4,
            }}>
              {isSealed ? 'Unopened' : 'Opened'}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(250,248,245,0.45)' }}>
              {isSealed
                ? (status?.viewCount ?? 0) > 0 ? `Last visited ${timeAgo(status!.lastViewedAt)}` : 'Not opened yet'
                : `Opened ${timeAgo(status!.openedAt)}`
              }
            </div>
          </div>

            {/* Views */}
          <div style={{
            background: 'linear-gradient(145deg, rgba(26,10,16,0.85), rgba(16,6,11,0.9))',
            border: '1px solid rgba(212,165,116,0.18)',
            borderRadius: 14, padding: '18px 18px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          }}>
            <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(212,165,116,0.7)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
              <span>👁</span> READERS
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "'Playfair Display', serif", color: '#faf8f5', marginBottom: 4 }}>
              {status?.viewCount ?? 0}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(250,248,245,0.45)' }}>
              {(status?.viewCount ?? 0) === 0
                ? 'No page views yet'
                : (status?.viewCount ?? 0) === 1
                  ? `1 unique device${(status?.revisitCount ?? 0) > 0 ? ` · Re-read ${status!.revisitCount}x` : ''}`
                  : `${status?.viewCount} unique devices${(status?.revisitCount ?? 0) > 0 ? ` · Re-read ${status!.revisitCount}x` : ''}`
              }
            </div>
          </div>

          {/* Protection Attempts */}
          <div style={{
            background: 'linear-gradient(145deg, rgba(26,10,16,0.85), rgba(16,6,11,0.9))',
            border: '1px solid rgba(212,165,116,0.18)',
            borderRadius: 14, padding: '18px 18px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          }}>
            <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(212,165,116,0.7)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
              <span>🛡</span> ATTEMPTS
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "'Playfair Display', serif", color: '#faf8f5', marginBottom: 4 }}>
              {status?.attemptCount ?? 0}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(250,248,245,0.45)' }}>
              Unlock attempts
            </div>
          </div>

          {/* Reactions */}
          <div style={{
            background: 'linear-gradient(145deg, rgba(26,10,16,0.85), rgba(16,6,11,0.9))',
            border: '1px solid rgba(212,165,116,0.18)',
            borderRadius: 14, padding: '18px 18px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          }}>
            <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(212,165,116,0.7)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
              <span>💖</span> REACTION
            </div>
            <div style={{ fontSize: hasReactions ? 26 : 22, fontWeight: 700, fontFamily: "'Playfair Display', serif", color: '#faf8f5', marginBottom: 4, letterSpacing: hasReactions ? '0.08em' : 0 }}>
              {hasReactions ? status!.reactions.join(' ') : '—'}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(250,248,245,0.45)' }}>
              {hasReactions ? `${status!.reactions.length} reaction${status!.reactions.length > 1 ? 's' : ''}` : 'No reaction yet'}
            </div>
          </div>
        </div>

        {/* ── Attached Media ────────────────────────────────────────────────── */}
        {status && (status.song || status.voiceMessage || status.photo || (status.ambientSoundscape && status.ambientSoundscape !== 'none')) && (
          <div style={{
            background: 'linear-gradient(145deg, rgba(26,10,16,0.85), rgba(16,6,11,0.9))',
            border: '1px solid rgba(212,165,116,0.18)',
            borderRadius: 16, padding: '20px 22px', marginBottom: 16,
            boxShadow: '0 8px 28px rgba(0,0,0,0.4)',
          }}>
            <div style={{ fontSize: 11.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#d4a574', marginBottom: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>📎</span> Attached Letter Keepsakes
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              {status.song && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(8,2,5,0.5)', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
                  {status.songArtwork ? (
                    <img src={status.songArtwork} alt="" style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  ) : (
                    <div style={{ width: 40, height: 40, borderRadius: 6, background: 'rgba(196,30,58,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0, color: '#e05060' }}>♫</div>
                  )}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, color: '#faf8f5', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{status.song}</div>
                    {status.songArtist && <div style={{ fontSize: 12, color: 'rgba(250,248,245,0.45)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{status.songArtist}</div>}
                  </div>
                </div>
              )}
              {status.voiceMessage && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(8,2,5,0.5)', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 6, background: 'rgba(196,30,58,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0, color: '#e05060' }}>🎙</div>
                  <div>
                    <div style={{ fontSize: 13.5, color: '#faf8f5', fontWeight: 600 }}>Voice Recording</div>
                    {status.voiceDuration > 0 && <div style={{ fontSize: 12, color: 'rgba(250,248,245,0.45)' }}>{Math.round(status.voiceDuration)}s message</div>}
                  </div>
                </div>
              )}
              {status.photo && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(8,2,5,0.5)', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 6, background: 'rgba(196,30,58,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0, color: '#e05060' }}>📷</div>
                  <div>
                    <div style={{ fontSize: 13.5, color: '#faf8f5', fontWeight: 600 }}>Photo Keepsake</div>
                    <div style={{ fontSize: 12, color: 'rgba(250,248,245,0.45)' }}>Included inside envelope</div>
                  </div>
                </div>
              )}
              {status.ambientSoundscape && status.ambientSoundscape !== 'none' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(8,2,5,0.5)', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 6, background: 'rgba(196,30,58,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0, color: '#e05060' }}>🌿</div>
                  <div>
                    <div style={{ fontSize: 13.5, color: '#faf8f5', fontWeight: 600, textTransform: 'capitalize' }}>{status.ambientSoundscape} Audio</div>
                    <div style={{ fontSize: 12, color: 'rgba(250,248,245,0.45)' }}>Ambient soundscape</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Replies Received (Two-Way Sealed Letters) ──────────────────────── */}
        {status?.replies && status.replies.length > 0 && (
          <div style={{
            background: 'linear-gradient(145deg, rgba(35, 12, 22, 0.92) 0%, rgba(18, 6, 12, 0.95) 100%)',
            border: '1px solid rgba(212,165,116,0.3)',
            borderRadius: 16, padding: '20px 22px', marginBottom: 16,
            boxShadow: '0 10px 32px rgba(0,0,0,0.55)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#d4a574', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>💌</span> Replies Received ({status.replies.length})
              </div>
              <span style={{ fontSize: 11.5, color: '#81c784', background: 'rgba(76,175,80,0.18)', padding: '3px 10px', borderRadius: 12, border: '1px solid rgba(76,175,80,0.35)', fontWeight: 600 }}>
                Sealed Reply
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {status.replies.map(rep => (
                <div
                  key={rep.id}
                  style={{
                    background: 'rgba(8,3,5,0.65)',
                    border: '1px solid rgba(212,165,116,0.15)',
                    borderRadius: 12, padding: '14px 16px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#faf8f5', fontFamily: "'Playfair Display', serif" }}>
                      {rep.title || 'Sealed Response'}
                    </div>
                    <div style={{ fontSize: 12.5, color: 'rgba(212,165,116,0.75)', marginTop: 2 }}>
                      {rep.signature ? `From: ${rep.signature}` : 'From recipient'} · {timeAgo(rep.createdAt)}
                    </div>
                  </div>
                  <Link
                    href={`/r/${rep.id}`}
                    target="_blank"
                    style={{
                      background: 'linear-gradient(135deg, #c41e3a 0%, #8b1824 100%)',
                      color: '#faf8f5',
                      padding: '8px 16px',
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 600,
                      textDecoration: 'none',
                      fontFamily: "'Crimson Pro', serif",
                      boxShadow: '0 3px 12px rgba(196,30,58,0.35)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Unseal Reply →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Activity Timeline ─────────────────────────────────────────────── */}
        <div style={{
          background: 'linear-gradient(145deg, rgba(26,10,16,0.85), rgba(16,6,11,0.9))',
          border: '1px solid rgba(212,165,116,0.18)',
          borderRadius: 16, padding: '22px 24px', marginBottom: 16,
          boxShadow: '0 8px 28px rgba(0,0,0,0.4)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#d4a574', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>📜</span> Letter Activity Log
            </div>
            <span style={{ fontSize: 12, color: 'rgba(250,248,245,0.4)' }}>
              Updated {timeAgo(lastRefreshed.toISOString())}
            </span>
          </div>

          {(!status?.events || status.events.length === 0) ? (
            <p style={{ color: 'rgba(250,248,245,0.35)', fontSize: 14.5, fontStyle: 'italic', margin: 0, textAlign: 'center', padding: '16px 0' }}>
              Your letter has been sealed and is waiting to be opened.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {status.events.map((event, index) => {
                const { icon, label, desc } = eventLabel(event.type, event.metadata);
                const isLast = index === status.events.length - 1;
                return (
                  <div key={event.id} style={{ display: 'flex', gap: 14, position: 'relative' }}>
                    {/* Timeline connector line */}
                    {!isLast && (
                      <div style={{
                        position: 'absolute', left: 19, top: 38, bottom: 0, width: 2,
                        background: 'linear-gradient(to bottom, rgba(212,165,116,0.3), rgba(212,165,116,0.05))',
                        zIndex: 0,
                      }} />
                    )}
                    {/* Event Icon Bubble */}
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                      background: 'radial-gradient(circle at 35% 30%, #2f101c 0%, #17060e 100%)',
                      border: '1px solid rgba(212,165,116,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16, zIndex: 1, position: 'relative',
                      boxShadow: '0 3px 10px rgba(0,0,0,0.5)',
                    }}>
                      {icon}
                    </div>
                    {/* Content */}
                    <div style={{ paddingBottom: isLast ? 0 : 20, paddingTop: 4, flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 2 }}>
                        <div style={{ fontSize: 14.5, color: '#faf8f5', fontWeight: 600 }}>
                          {label}
                        </div>
                        <div style={{ fontSize: 12, color: 'rgba(212,165,116,0.65)', fontFamily: "'Courier New', monospace" }}>
                          {formatTimestamp(event.createdAt)}
                        </div>
                      </div>
                      <div style={{ fontSize: 12.5, color: 'rgba(250,248,245,0.45)' }}>
                        {desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Refresh Action Bar */}
          <div style={{ marginTop: 18, borderTop: '1px solid rgba(212,165,116,0.1)', paddingTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12.5, color: 'rgba(250,248,245,0.35)', fontStyle: 'italic' }}>
              Auto-syncs on new visits & reactions
            </span>
            <button
              onClick={fetchStatus}
              style={{
                background: 'rgba(212,165,116,0.08)',
                border: '1px solid rgba(212,165,116,0.25)',
                borderRadius: 8, padding: '7px 16px', cursor: 'pointer',
                color: '#d4a574', fontFamily: "'Crimson Pro', serif",
                fontSize: 13.5, fontWeight: 600, transition: 'all 0.2s ease',
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#d4a574'; e.currentTarget.style.background = 'rgba(212,165,116,0.16)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(212,165,116,0.25)'; e.currentTarget.style.background = 'rgba(212,165,116,0.08)'; }}
            >
              ↻ Refresh Activity
            </button>
          </div>
        </div>

        {/* ── Danger Zone: Self-Destruct / Burn Letter Card ─────────────────── */}
        <div style={{
          background: 'linear-gradient(145deg, rgba(38, 10, 16, 0.95) 0%, rgba(20, 5, 10, 0.98) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(228, 32, 56, 0.35)',
          borderRadius: 16, padding: '22px 24px', marginBottom: 20,
          boxShadow: '0 10px 32px rgba(228,32,56,0.15)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ff6b7d', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
                <span>🔥</span> Self-Destruct · Burn to Ashes
              </div>
              <p style={{ color: 'rgba(250,248,245,0.65)', fontSize: 13.5, lineHeight: 1.5, margin: 0, maxWidth: 540 }}>
                Regret sending this or sent it to the wrong person? Permanently vaporize this letter, attached photos, and voice notes from our database.
              </p>
            </div>

            <button
              onClick={() => setShowBurnModal(true)}
              style={{
                background: 'linear-gradient(135deg, rgba(228,32,56,0.2) 0%, rgba(139,24,32,0.35) 100%)',
                border: '1px solid rgba(228, 32, 56, 0.5)',
                borderRadius: 8, padding: '10px 18px',
                color: '#ff6b7d',
                fontFamily: "'Crimson Pro', serif", fontSize: 14, fontWeight: 700,
                cursor: 'pointer', whiteSpace: 'nowrap',
                display: 'flex', alignItems: 'center', gap: 6,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #e42038, #8b1820)';
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(228,32,56,0.5)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(228,32,56,0.2) 0%, rgba(139,24,32,0.35) 100%)';
                e.currentTarget.style.color = '#ff6b7d';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              🔥 Burn This Letter
            </button>
          </div>
        </div>

        {/* ── Private Management Link Card (Safety Vault) ──────────────────── */}
        <div style={{
          background: 'linear-gradient(145deg, rgba(28, 12, 18, 0.95) 0%, rgba(14, 5, 9, 0.98) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(212,165,116,0.28)',
          borderRadius: 16, padding: '22px 24px', marginBottom: 20,
          boxShadow: '0 10px 32px rgba(0,0,0,0.5)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#d4a574', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
            <span>🔑</span> Save This Private Management Link
          </div>
          <p style={{ color: 'rgba(250,248,245,0.6)', fontSize: 13.5, lineHeight: 1.55, margin: '0 0 14px' }}>
            This secret link is the only way to return to this status dashboard to monitor views and read reactions. Keep it safe.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input
              readOnly
              value={manageUrl}
              style={{
                flex: 1, background: 'rgba(8,2,5,0.8)',
                border: '1px solid rgba(212,165,116,0.2)', borderRadius: 8,
                padding: '10px 14px', color: '#faf8f5',
                fontFamily: "'Courier New', monospace", fontSize: 12.5,
                outline: 'none', overflow: 'hidden', textOverflow: 'ellipsis',
              }}
            />
            <button
              onClick={copyManage}
              style={{
                background: manageCopied ? 'linear-gradient(135deg, #2e7d32, #1b5e20)' : 'rgba(212,165,116,0.12)',
                border: manageCopied ? '1px solid rgba(76,175,80,0.6)' : '1px solid rgba(212,165,116,0.35)',
                borderRadius: 8, padding: '10px 16px',
                color: manageCopied ? '#81c784' : '#d4a574',
                fontFamily: "'Crimson Pro', serif", fontSize: 13.5, fontWeight: 600,
                cursor: 'pointer', whiteSpace: 'nowrap',
                display: 'flex', alignItems: 'center', gap: 6,
                transition: 'all 0.2s ease',
              }}
            >
              {manageCopied ? '✓ Copied' : '📋 Copy Link'}
            </button>
          </div>
        </div>

        {/* ── Confirmation Modal ────────────────────────────────────────────── */}
        {showBurnModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1.5rem',
          }}>
            <div style={{
              background: 'linear-gradient(145deg, #1f070e 0%, #100307 100%)',
              border: '1px solid rgba(228,32,56,0.4)',
              borderRadius: 18,
              padding: '28px 24px',
              maxWidth: 440,
              width: '100%',
              textAlign: 'center',
              boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 40px rgba(228,32,56,0.3)',
            }}>
              <div style={{
                width: 60, height: 60, borderRadius: '50%',
                background: 'radial-gradient(circle at 35% 30%, #e42038, #8b1820)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28, margin: '0 auto 16px',
                boxShadow: '0 0 30px rgba(228,32,56,0.5)',
              }}>
                🔥
              </div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: '#faf8f5', margin: '0 0 10px' }}>
                Burn Letter to Ashes?
              </h3>
              <p style={{ color: 'rgba(250,248,245,0.7)', fontSize: 14, lineHeight: 1.6, margin: '0 0 24px' }}>
                This action is <strong>permanent and irreversible</strong>. The letter, all photos, voice recordings, and replies will be permanently erased from our database.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={() => setShowBurnModal(false)}
                  disabled={burning}
                  style={{
                    flex: 1,
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: 8,
                    padding: '11px',
                    color: 'rgba(250,248,245,0.8)',
                    fontFamily: "'Crimson Pro', serif",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleBurnLetter}
                  disabled={burning}
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #e42038, #8b1820)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: 8,
                    padding: '11px',
                    color: '#ffffff',
                    fontFamily: "'Crimson Pro', serif",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: burning ? 'wait' : 'pointer',
                    boxShadow: '0 4px 16px rgba(228,32,56,0.4)',
                  }}
                >
                  {burning ? 'Burning…' : '🔥 Yes, Burn Letter'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Footer ────────────────────────────────────────────────────────── */}
        <div style={{ textAlign: 'center', paddingTop: 12 }}>
          <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: 13.5, color: 'rgba(250,248,245,0.25)', letterSpacing: '0.04em' }}>
            made with send letter 💌
          </p>
        </div>
      </div>

      <style>{`
        @keyframes sealPulse {
          0%, 100% {
            transform: translateY(0px) scale(1);
            box-shadow: 0 0 45px rgba(228,32,56,0.55), 0 10px 25px rgba(0,0,0,0.6);
          }
          50% {
            transform: translateY(-6px) scale(1.03);
            box-shadow: 0 0 60px rgba(228,32,56,0.75), 0 16px 35px rgba(0,0,0,0.7);
          }
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
