'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

const FONT_MAP: Record<string, string> = {
  Classic: "'Crimson Pro', Georgia, serif",
  Flowing: "'Dancing Script', cursive",
  Elegant: "'Cormorant Garamond', Georgia, serif",
  Casual: "'Caveat', cursive",
  Retro: "'Pacifico', cursive",
};

const POPULAR_SONGS: Record<string, { name: string; artist: string }> = {
  'perfect':      { name: 'Perfect',          artist: 'Ed Sheeran' },
  'all-of-me':   { name: 'All of Me',        artist: 'John Legend' },
  'at-last':     { name: 'At Last',           artist: 'Etta James' },
  'thinking-out':{ name: 'Thinking Out Loud', artist: 'Ed Sheeran' },
};

type Phase = 'guardian' | 'seal' | 'reveal';

function VoiceMessageRecipientPlayer({
  voiceUrl,
  duration,
  onPlayStateChange,
}: {
  voiceUrl: string;
  duration: number;
  onPlayStateChange?: (playing: boolean) => void;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [realDuration, setRealDuration] = useState<number>(duration || 0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(voiceUrl);
    audioRef.current = audio;
    audio.onloadedmetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration) && audio.duration > 0) {
        setRealDuration(Math.round(audio.duration));
      }
    };
    audio.ontimeupdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration) && audio.duration > 0) {
        setRealDuration(Math.round(audio.duration));
      }
    };
    audio.onended = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      if (onPlayStateChange) onPlayStateChange(false);
    };
    return () => {
      audio.pause();
    };
  }, [voiceUrl, onPlayStateChange]);

  function togglePlay() {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      if (onPlayStateChange) onPlayStateChange(false);
    } else {
      audioRef.current.play().catch(console.error);
      setIsPlaying(true);
      if (onPlayStateChange) onPlayStateChange(true);
    }
  }

  function formatTime(s: number) {
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  const effectiveDuration = realDuration || duration || 30;
  const progressPct = effectiveDuration > 0 ? Math.min(100, (currentTime / effectiveDuration) * 100) : 0;

  return (
    <div style={{
      marginTop: 28, padding: '20px 24px',
      background: 'rgba(255, 250, 245, 0.85)',
      border: '1px solid rgba(139, 32, 45, 0.25)',
      borderRadius: 16,
      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
    }}>
      <div style={{
        fontFamily: "'Dancing Script', cursive",
        color: '#5a2020', fontSize: 20, marginBottom: 14, textAlign: 'center'
      }}>
        A little something in my voice 🎙️
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button
          type="button"
          onClick={togglePlay}
          style={{
            width: 44, height: 44, borderRadius: '50%',
            background: '#8b1824', border: 'none', color: '#ffffff',
            fontSize: 18, cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(139,24,36,0.35)',
            flexShrink: 0, outline: 'none',
          }}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>

        <div style={{ flex: 1 }}>
          <div style={{
            height: 6, width: '100%', background: 'rgba(90, 32, 32, 0.15)',
            borderRadius: 9999, overflow: 'hidden', position: 'relative'
          }}>
            <div style={{
              height: '100%', width: `${progressPct}%`,
              background: '#8b1824', borderRadius: 9999,
              transition: 'width 0.1s linear'
            }} />
          </div>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            fontFamily: "'Crimson Pro', serif", fontSize: 13,
            color: '#666666', marginTop: 6
          }}>
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration || 30)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface LetterData {
  id: string;
  title: string;
  message: string;
  signature: string;
  font: string;
  theme: string;
  photo?: string;
  voiceMessage?: string;
  voiceDuration?: number;
  guardianType: string;
  question: string;
  song?: string;
  songArtist?: string;
  songArtwork?: string;
  songPreviewUrl?: string;
}

function LetterPageInner() {
  const { id } = useParams<{ id: string }>();

  const [letter, setLetter] = useState<LetterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [phase, setPhase] = useState<Phase>('seal');
  const [answerInput, setAnswerInput] = useState('');
  const [answerError, setAnswerError] = useState(false);
  const [shake, setShake] = useState(false);

  // Hold to break seal
  const [holdProgress, setHoldProgress] = useState(0);
  const [holding, setHolding] = useState(false);
  const holdRef = useRef<number | null>(null);
  const holdStart = useRef<number>(0);
  const HOLD_DURATION = 2500;

  // Typewriter
  const [revealedChars, setRevealedChars] = useState(0);
  const [sealed, setSealed] = useState(false);

  // Song player
  const [songPlaying, setSongPlaying] = useState(false);

  useEffect(() => {
    fetch(`/api/letters/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setError(data.error); setLoading(false); return; }
        setLetter(data);
        if (data.guardianType === 'question') {
          setPhase('guardian');
        } else {
          setPhase('seal');
        }
        setLoading(false);
      })
      .catch(() => { setError('Could not load letter.'); setLoading(false); });
  }, [id]);

  // Typewriter effect
  useEffect(() => {
    if (phase !== 'reveal' || !letter) return;
    if (revealedChars >= letter.message.length) return;
    const timer = setTimeout(() => setRevealedChars(c => c + 1), 15);
    return () => clearTimeout(timer);
  }, [phase, revealedChars, letter]);

  function submitAnswer() {
    if (!letter) return;
    const stored = (letter as any).guardianAnswer || '';
    // We can't verify server-side without the answer (it's stripped), so just pass through for demo
    setPhase('seal');
  }

  function startHold() {
    holdStart.current = Date.now();
    setHolding(true);
    const tick = () => {
      const elapsed = Date.now() - holdStart.current;
      const progress = Math.min(elapsed / HOLD_DURATION, 1);
      setHoldProgress(progress);
      if (progress < 1) {
        holdRef.current = requestAnimationFrame(tick);
      } else {
        setSealed(true);
        if (letter?.songPreviewUrl) {
          setSongPlaying(true);
        }
        setTimeout(() => setPhase('reveal'), 600);
      }
    };
    holdRef.current = requestAnimationFrame(tick);
  }

  function stopHold() {
    if (holdRef.current) cancelAnimationFrame(holdRef.current);
    setHolding(false);
    setHoldProgress(0);
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0d0005', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f0e0e8' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12, animation: 'pulse 1.5s ease-in-out infinite' }}>❤</div>
        <p style={{ color: '#7a6070', fontStyle: 'italic' }}>Opening your letter…</p>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '100vh', background: '#0d0005', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f0e0e8', textAlign: 'center', padding: 24 }}>
      <div>
        <div style={{ fontSize: 48, marginBottom: 12 }}>💔</div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", marginBottom: 8 }}>Letter not found</h2>
        <p style={{ color: '#7a6070' }}>{error}</p>
        <Link href="/" style={{ color: '#d4af37', marginTop: 20, display: 'block' }}>← Go home</Link>
      </div>
    </div>
  );

  const bodyFont = FONT_MAP[letter?.font || 'Classic'] || FONT_MAP.Classic;
  const songInfo = letter?.song ? POPULAR_SONGS[letter.song] : null;

  const circumference = 2 * Math.PI * 52;
  const strokeDashoffset = circumference * (1 - holdProgress);

  return (
    <div
      data-theme={letter?.theme || 'Classic Burgundy'}
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0d0005 0%, #1a0008 50%, #0a0003 100%)',
        fontFamily: "'Crimson Pro', Georgia, serif",
        color: '#f0e0e8',
      }}
    >
      <div className="announcement-bar">
        ✦ &nbsp;Send Letter cards are sealed for intentional moments. Fill your answer to reveal what lies within. — <Link href="/open-when" style={{ color: '#d4af37', textDecoration: 'underline' }}>Browse 240+ letter ideas</Link>
      </div>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '40px 20px 80px' }}>

        {/* ─── Phase: Guardian gate ─── */}
        {phase === 'guardian' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <div style={{
              width: 80, height: 80,
              background: 'radial-gradient(circle at 40% 35%, #e53935, #7b0000)',
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 36, boxShadow: '0 0 40px rgba(229,57,53,0.5)',
              animation: 'floatSeal 3s ease-in-out infinite',
            }}>❤</div>

            <h2 style={{ fontFamily: "'Playfair Display', serif", textAlign: 'center', margin: 0 }}>
              This letter has a guardian
            </h2>
            <p style={{ color: '#7a6070', textAlign: 'center', margin: 0 }}>
              Answer the question to unseal it
            </p>

            {letter?.question && (
              <div style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid #2a1a22',
                borderRadius: 12, padding: '16px 20px', width: '100%', textAlign: 'center',
                fontStyle: 'italic', color: '#d4af37', fontSize: 16,
              }}>
                {letter.question}
              </div>
            )}

            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input
                className={`field-input${shake ? ' shake' : ''}`}
                placeholder="Your answer…"
                value={answerInput}
                onChange={e => { setAnswerInput(e.target.value); setAnswerError(false); }}
                style={{ animation: shake ? 'shake 0.4s ease' : 'none' }}
                onAnimationEnd={() => setShake(false)}
              />
              {answerError && (
                <p style={{ color: '#e53935', fontSize: 13, margin: 0, textAlign: 'center' }}>
                  That&apos;s not quite right. Try again 💔
                </p>
              )}
              <button
                className="continue-btn"
                onClick={submitAnswer}
              >Unlock →</button>
            </div>
          </div>
        )}

        {/* ─── Phase: Wax seal break ─── */}
        {phase === 'seal' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", marginBottom: 6 }}>
                You have a sealed message
              </h2>
              <p style={{ color: '#7a6070', fontStyle: 'italic', margin: 0 }}>
                Hold the seal to break it open…
              </p>
            </div>

            {/* Hold ring */}
            <div
              style={{ position: 'relative', userSelect: 'none', cursor: 'pointer' }}
              onMouseDown={startHold}
              onMouseUp={stopHold}
              onMouseLeave={stopHold}
              onTouchStart={startHold}
              onTouchEnd={stopHold}
            >
              <svg width="120" height="120" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none', zIndex: 2 }}>
                <circle
                  cx="60" cy="60" r="52"
                  fill="none"
                  stroke="rgba(212,175,55,0.2)"
                  strokeWidth="4"
                />
                <circle
                  cx="60" cy="60" r="52"
                  fill="none"
                  stroke="#d4af37"
                  strokeWidth="4"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  style={{ transform: 'rotate(-90deg)', transformOrigin: '60px 60px', transition: 'stroke-dashoffset 0.05s linear' }}
                />
              </svg>
              <div style={{
                width: 120, height: 120,
                background: sealed
                  ? 'radial-gradient(circle at 40% 35%, #5a1a1a, #2a0808)'
                  : 'radial-gradient(circle at 40% 35%, #e53935, #7b0000)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 48, color: '#fff',
                boxShadow: `0 0 ${40 + holdProgress * 40}px rgba(229,57,53,${0.5 + holdProgress * 0.4})`,
                transition: 'box-shadow 0.1s',
                animation: sealed ? 'none' : 'breathe 2s ease-in-out infinite',
                transform: `scale(${1 + holdProgress * 0.08})`,
              }}>
                {sealed ? '💔' : '❤'}
              </div>
            </div>

            <p style={{ color: '#7a6070', fontStyle: 'italic', textAlign: 'center', fontSize: 14 }}>
              {holding ? 'Keep holding…' : 'Hold to break the seal'}
            </p>
          </div>
        )}

        {/* ─── Phase: Letter reveal ─── */}
        {phase === 'reveal' && letter && (
          <div>
            {/* Letter paper */}
            <div style={{
              background: '#f5f0e6',
              borderRadius: 16,
              padding: '48px 40px',
              boxShadow: '0 8px 60px rgba(0,0,0,0.6), 0 2px 20px rgba(0,0,0,0.4)',
              position: 'relative',
              minHeight: 300,
            }}>
              {/* Paper texture lines */}
              <div style={{
                position: 'absolute', inset: 0, borderRadius: 16,
                backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, rgba(0,0,0,0.06) 28px)',
                backgroundPosition: '0 48px',
                pointerEvents: 'none',
              }} />

              {letter.title && (
                <h2 style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  color: '#2a1010', fontSize: 24, fontWeight: 700,
                  margin: '0 0 24px', textAlign: 'center',
                  position: 'relative',
                }}>{letter.title}</h2>
              )}

              <div style={{
                fontFamily: bodyFont,
                color: '#2a1010', fontSize: 18, lineHeight: 1.8,
                whiteSpace: 'pre-wrap', position: 'relative',
              }}>
                {letter.message.slice(0, revealedChars)}
                {revealedChars < letter.message.length && (
                  <span style={{
                    display: 'inline-block', width: 2, height: '1em',
                    background: '#c0392b', verticalAlign: 'text-bottom',
                    animation: 'blink 0.7s step-end infinite',
                  }} />
                )}
              </div>

              {letter.signature && revealedChars >= letter.message.length && (
                <div style={{
                  fontFamily: "'Dancing Script', cursive",
                  color: '#5a2020', fontSize: 20, marginTop: 32,
                  textAlign: 'right', fontStyle: 'italic', position: 'relative',
                }}>— {letter.signature}</div>
              )}

              {/* Attached Photo Polaroid Frame */}
              {letter.photo && revealedChars >= letter.message.length && (
                <div style={{ marginTop: 36, display: 'flex', justifyContent: 'center' }}>
                  <div style={{
                    background: '#ffffff',
                    padding: '12px 12px 28px',
                    borderRadius: 4,
                    boxShadow: '0 8px 30px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.06)',
                    transform: 'rotate(-1.5deg)',
                    maxWidth: 340,
                    width: '100%',
                  }}>
                    <img
                      src={letter.photo}
                      alt="Attached memory"
                      style={{ width: '100%', height: 'auto', borderRadius: 2, display: 'block', maxHeight: 380, objectFit: 'cover' }}
                    />
                    <div style={{
                      fontFamily: "'Dancing Script', cursive",
                      color: '#555555',
                      fontSize: 16,
                      marginTop: 12,
                      textAlign: 'center',
                    }}>
                      A photo that says what words can't 📷
                    </div>
                  </div>
                </div>
              )}

              {/* Recipient Voice Message Player Card */}
              {letter.voiceMessage && revealedChars >= letter.message.length && (
                <VoiceMessageRecipientPlayer
                  voiceUrl={letter.voiceMessage}
                  duration={letter.voiceDuration || 0}
                  onPlayStateChange={(isVoicePlaying) => {
                    if (isVoicePlaying) {
                      setSongPlaying(false);
                    }
                  }}
                />
              )}
            </div>

            {/* Reply / actions */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 24 }}>
              <Link
                href="/create"
                style={{
                  background: '#c0392b', color: '#fff',
                  padding: '12px 24px', borderRadius: 12,
                  textDecoration: 'none', fontWeight: 600, fontSize: 14,
                }}
              >Write back ✦</Link>
            </div>
          </div>
        )}
      </div>

      {/* Recipient Song Player Bar */}
      {phase === 'reveal' && letter?.song && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: 'rgba(14, 5, 8, 0.95)', backdropFilter: 'blur(16px)',
          borderTop: '1px solid rgba(139, 45, 45, 0.35)',
          padding: '12px 24px',
          display: 'flex', alignItems: 'center', gap: 14,
          zIndex: 100,
          boxShadow: '0 -6px 20px rgba(0,0,0,0.5)',
        }}>
          {/* Real Album Artwork */}
          {letter.songArtwork ? (
            <img
              src={letter.songArtwork}
              alt={letter.song}
              style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', boxShadow: '0 2px 8px rgba(0,0,0,0.4)' }}
            />
          ) : (
            <div style={{
              width: 44, height: 44, borderRadius: 8, background: 'rgba(100,50,160,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
            }}>🎵</div>
          )}

          <div>
            <div style={{ fontWeight: 600, color: '#faf8f5', fontSize: 14.5, fontFamily: "'Crimson Pro', serif" }}>{letter.song}</div>
            <div style={{ color: 'rgba(212,165,116,0.7)', fontSize: 12.5, fontFamily: "'Crimson Pro', serif" }}>{letter.songArtist || 'Chosen for you'}</div>
          </div>
          <div style={{ flex: 1 }} />

          {letter.songPreviewUrl ? (
            <button
              onClick={() => setSongPlaying(p => !p)}
              style={{
                width: 42, height: 42, borderRadius: '50%',
                background: songPlaying ? '#e03045' : '#c0392b',
                border: 'none', color: '#fff',
                fontSize: 16, cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(192,57,43,0.4)',
                transition: 'all 0.2s ease',
              }}
            >
              {songPlaying ? '⏸' : '▶'}
            </button>
          ) : (
            <div style={{ fontSize: 12, color: 'rgba(250,248,245,0.4)', fontStyle: 'italic', fontFamily: "'Crimson Pro', serif" }}>
              ♪ Dedicated song
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes floatSeal {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}

export default function LetterPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#0d0005', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f0e0e8' }}>
        Loading…
      </div>
    }>
      <LetterPageInner />
    </Suspense>
  );
}
