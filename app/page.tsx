"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LiveDeliveredCounter from "@/components/LiveDeliveredCounter";
import InteractiveUnsealDemo from "@/components/InteractiveUnsealDemo";

const SHOWCASE_TRACKS = [
  {
    title: "Society",
    artist: "Eddie Vedder",
    genre: "Into the Wild",
    artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/7d/20/b8/7d20b80e-a1eb-f983-4a06-9ce62297ee1a/00602567018261.rgb.jpg/600x600bb.jpg",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview126/v4/1a/9d/8f/1a9d8fcd-e978-4fd3-e7fb-71db7d9e8ac4/mzaf_2669373785479159902.plus.aac.p.m4a",
  },
  {
    title: "Hello!",
    artist: "Armaan Malik",
    genre: "Hello! (Original Motion Picture Soundtrack)",
    artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music118/v4/e3/9e/bf/e39ebf5b-578e-ad4e-2306-704d84fa6f12/cover.jpg/600x600bb.jpg",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/b8/f1/27/b8f12759-6778-7101-407d-0f72f6254db5/mzaf_2406318888854172343.plus.aac.p.m4a",
  },
  {
    title: "Nenu Nuvvantu",
    artist: "Harris Jayaraj, Naresh Iyer & Nadeesh",
    genre: "Orange (Original Motion Picture Soundtrack)",
    artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/72/72/a6/7272a66e-c071-641c-1c88-8f2495d18d4e/cover.jpg/600x600bb.jpg",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/18/79/b1/1879b127-5bfa-6a32-f6d1-9c14f42cd306/mzaf_473814996909398735.plus.aac.p.m4a",
  },
  {
    title: "Ain't No Sunshine",
    artist: "Bill Withers",
    genre: "Just As I Am",
    artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/1b/b9/16/1bb9167c-e0eb-5418-960d-e9adb61d0fdd/mzi.kqpazwnw.jpg/600x600bb.jpg",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview126/v4/c1/97/a5/c197a504-bc13-0709-3f6f-904026c782dd/mzaf_11719507637175591282.plus.aac.p.m4a",
  },
  {
    title: "We Don’t Talk Anymore",
    artist: "Charlie Puth (feat. Selena Gomez)",
    genre: "Nine Track Mind",
    artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/7e/05/fd/7e05fd3e-597b-db52-5d87-3ed146d2e2bb/mzm.omtrmqdi.jpg/600x600bb.jpg",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/a9/05/42/a905420d-535d-e9f7-7885-b8e9c9831b70/mzaf_930790171806791983.plus.aac.p.m4a",
  },
];

function LandingMusicShowcase() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [customTrack, setCustomTrack] = useState<(typeof SHOWCASE_TRACKS)[0] | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<(typeof SHOWCASE_TRACKS)[0][]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const activeTrack = customTrack || SHOWCASE_TRACKS[activeIdx];

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Debounced iTunes live search for any song worldwide
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://itunes.apple.com/search?term=${encodeURIComponent(searchQuery.trim())}&media=music&entity=song&limit=5`
        );
        const data = await res.json();
        if (data.results && Array.isArray(data.results)) {
          const mapped = data.results
            .filter((item: { previewUrl?: string }) => Boolean(item.previewUrl))
            .map((item: { trackName: string; artistName: string; collectionName?: string; artworkUrl100?: string; previewUrl: string }) => ({
              title: item.trackName,
              artist: item.artistName,
              genre: item.collectionName || "Single",
              artwork: item.artworkUrl100 ? item.artworkUrl100.replace("100x100bb", "600x600bb") : "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80",
              previewUrl: item.previewUrl,
            }));
          setSearchResults(mapped);
        }
      } catch (err) {
        console.error("iTunes search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fadeInAudio = (audio: HTMLAudioElement, targetVol = 0.50, durationMs = 1500) => {
    audio.volume = 0.05;
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const p = Math.min(elapsed / durationMs, 1);
      if (audio) {
        audio.volume = Math.min(0.05 + (targetVol - 0.05) * p, targetVol);
      }
      if (p >= 1) {
        clearInterval(interval);
      }
    }, 50);
  };

  const playTrackAudio = (track: (typeof SHOWCASE_TRACKS)[0]) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);

    if (track.previewUrl) {
      const audio = new Audio();
      audio.crossOrigin = "anonymous";
      audio.src = track.previewUrl;
      audio.volume = 0.48;
      audioRef.current = audio;

      // Web Audio Gain Node to enforce 50% cap on mobile hardware
      try {
        const AudioCtx = typeof window !== "undefined" ? (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext) : null;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          if (ctx.state === "suspended") {
            ctx.resume();
          }
          const source = ctx.createMediaElementSource(audio);
          const gain = ctx.createGain();
          gain.gain.setValueAtTime(0.05, ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0.48, ctx.currentTime + 1.2);
          source.connect(gain);
          gain.connect(ctx.destination);
        }
      } catch {
        fadeInAudio(audio, 0.48, 1500);
      }

      audio.ontimeupdate = () => {
        if (audio.duration) {
          setProgress((audio.currentTime / audio.duration) * 100);
          setCurrentTime(audio.currentTime);
        }
      };
      audio.onended = () => {
        setIsPlaying(false);
        setProgress(0);
        setCurrentTime(0);
      };
      audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

  const handleSelectTrack = (index: number) => {
    setCustomTrack(null);
    setActiveIdx(index);
    playTrackAudio(SHOWCASE_TRACKS[index]);
  };

  const handleSelectSearchedTrack = (track: (typeof SHOWCASE_TRACKS)[0]) => {
    setCustomTrack(track);
    playTrackAudio(track);
  };

  const togglePlay = () => {
    if (!audioRef.current) {
      if (activeTrack.previewUrl) {
        playTrackAudio(activeTrack);
      }
      return;
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

  const formatTime = (secs: number) => {
    const s = Math.floor(secs % 60);
    return `0:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div style={{
      background: "linear-gradient(145deg, rgba(28, 10, 18, 0.92) 0%, rgba(16, 5, 11, 0.96) 100%)",
      border: "1px solid rgba(212, 165, 116, 0.28)",
      borderRadius: 20,
      padding: "32px 28px",
      marginTop: 28,
      boxShadow: "0 16px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Subtle gold ambient glow */}
      <div style={{
        position: "absolute", top: 0, right: 0, width: 220, height: 220,
        background: "radial-gradient(circle at 100% 0%, rgba(212,165,116,0.12) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: 32,
        alignItems: "center",
      }}>
        {/* Left: Clean Vinyl Cover & Dedicated Audio Player Controls Below */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          background: "rgba(10, 3, 7, 0.75)",
          border: "1px solid rgba(212,165,116,0.22)",
          borderRadius: 20,
          padding: "20px 20px 22px",
          boxShadow: "0 12px 32px rgba(0,0,0,0.55)",
        }}>
          {/* 100% Clean Full Album Cover (No Text or Badges on Image) */}
          <div style={{
            width: "100%",
            aspectRatio: "1 / 1",
            borderRadius: 16,
            overflow: "hidden",
            position: "relative",
            boxShadow: "0 14px 36px rgba(0,0,0,0.65), 0 0 20px rgba(212,165,116,0.15)",
            border: "1.5px solid rgba(212,165,116,0.35)",
            background: "#0a0307",
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeTrack.artwork}
              alt={activeTrack.title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
                transform: isPlaying ? "scale(1.02)" : "scale(1)",
                transition: "transform 0.8s ease",
              }}
            />
          </div>

          {/* Player Information & Controls (Placed Outside the Cover Photo) */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Header Badge & Tap Hint */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
              flexWrap: "wrap",
            }}>
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                fontSize: 10.5,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#d4a574",
                fontWeight: 700,
                background: "rgba(212,165,116,0.1)",
                border: "1px solid rgba(212,165,116,0.25)",
                padding: "4px 10px",
                borderRadius: 14,
              }}>
                <span>✦</span> FEATURED SOUNDTRACK
              </div>

              {/* Tap to live preview badge */}
              <button
                type="button"
                onClick={togglePlay}
                style={{
                  fontSize: 11,
                  color: isPlaying ? "#5ae08a" : "#faf8f5",
                  background: isPlaying ? "rgba(40,160,80,0.2)" : "rgba(255,255,255,0.06)",
                  border: `1px solid ${isPlaying ? "rgba(70,210,110,0.4)" : "rgba(212,165,116,0.3)"}`,
                  padding: "4px 11px",
                  borderRadius: 14,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {isPlaying ? (
                  <>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#5ae08a", display: "inline-block" }} />
                    Playing Preview
                  </>
                ) : (
                  <>
                    <span>🎧</span> Tap ▶ to live preview
                  </>
                )}
              </button>
            </div>

            {/* Song Title & Artist */}
            <div>
              <div style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: "clamp(18px, 3.5vw, 22px)",
                fontWeight: 700,
                color: "#faf8f5",
                lineHeight: 1.2,
                marginBottom: 2,
              }}>
                {activeTrack.title}
              </div>
              <div style={{ fontSize: 13, color: "rgba(250,248,245,0.75)" }}>
                {activeTrack.artist} · <span style={{ color: "#d4a574", fontStyle: "italic" }}>{activeTrack.genre}</span>
              </div>
            </div>

            {/* Play Button, Waveform & Timer */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "rgba(0,0,0,0.35)",
              border: "1px solid rgba(255,255,255,0.06)",
              padding: "8px 12px",
              borderRadius: 14,
            }}>
              <button
                onClick={togglePlay}
                type="button"
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  background: isPlaying ? "linear-gradient(135deg, #ff2b47 0%, #b81428 100%)" : "linear-gradient(135deg, #d4a574 0%, #a87948 100%)",
                  border: "none",
                  color: "#ffffff",
                  fontSize: 14,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  flexShrink: 0,
                  boxShadow: isPlaying ? "0 4px 14px rgba(255,43,71,0.45)" : "0 4px 14px rgba(212,165,116,0.35)",
                  transition: "transform 0.15s ease",
                }}
                title={isPlaying ? "Pause Preview" : "Tap to Play Live Preview"}
              >
                {isPlaying ? "❚❚" : "▶"}
              </button>

              {/* Live Waveform Bars */}
              <div style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                gap: 2.5,
                height: 22,
                overflow: "hidden",
              }}>
                {Array.from({ length: 28 }).map((_, i) => {
                  const barProgress = (i / 28) * 100;
                  const isPassed = progress >= barProgress;
                  const randomH = ((i * 19 + 5) % 14) + 5;
                  return (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        height: isPlaying ? `${randomH + (Math.sin(i + currentTime * 6) * 6)}px` : `${randomH}px`,
                        background: isPassed ? "#d4a574" : "rgba(255, 255, 255, 0.15)",
                        borderRadius: 2,
                        transition: "height 0.1s ease, background 0.2s ease",
                      }}
                    />
                  );
                })}
              </div>

              {/* Timer */}
              <span style={{
                fontSize: 11.5,
                color: "rgba(250,248,245,0.7)",
                fontFamily: "monospace",
                flexShrink: 0,
              }}>
                {formatTime(currentTime)} / 0:30
              </span>
            </div>

            {/* Popular Picks Track Selector Chips */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              flexWrap: "wrap",
              paddingTop: 8,
              borderTop: "1px solid rgba(255,255,255,0.08)",
            }}>
              <span style={{ fontSize: 10.5, color: "rgba(212,165,116,0.8)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Popular:
              </span>
              {SHOWCASE_TRACKS.map((t, idx) => {
                const isSelected = !customTrack && activeIdx === idx;
                const shortLabel = t.title.length > 18 ? t.title.substring(0, 16) + '…' : t.title;
                return (
                  <button
                    key={t.title}
                    type="button"
                    onClick={() => handleSelectTrack(idx)}
                    style={{
                      padding: "4px 9px",
                      borderRadius: 12,
                      fontSize: 11,
                      fontWeight: isSelected ? 700 : 500,
                      background: isSelected ? "rgba(212,165,116,0.28)" : "rgba(255,255,255,0.06)",
                      border: `1px solid ${isSelected ? "#d4a574" : "rgba(255,255,255,0.12)"}`,
                      color: isSelected ? "#d4a574" : "rgba(250,248,245,0.8)",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {shortLabel}
                  </button>
                );
              })}
            </div>

            {/* Live Global Song Search */}
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              paddingTop: 8,
              borderTop: "1px solid rgba(255,255,255,0.06)",
            }}>
              <div style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
              }}>
                <span style={{
                  position: "absolute",
                  left: 10,
                  color: "#d4a574",
                  fontSize: 12,
                  pointerEvents: "none",
                }}>
                  🔍
                </span>
                <input
                  type="text"
                  placeholder="Search any song in the world (English, Telugu, Hindi...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: "100%",
                    background: "rgba(0,0,0,0.45)",
                    border: "1px solid rgba(212,165,116,0.22)",
                    borderRadius: 10,
                    padding: "7px 28px 7px 28px",
                    color: "#faf8f5",
                    fontSize: 12,
                    fontFamily: "'Crimson Pro', serif",
                    outline: "none",
                    boxSizing: "border-box",
                    transition: "border-color 0.2s ease",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#d4a574")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(212,165,116,0.22)")}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setSearchResults([]);
                    }}
                    style={{
                      position: "absolute",
                      right: 8,
                      background: "none",
                      border: "none",
                      color: "rgba(250,248,245,0.5)",
                      fontSize: 11,
                      cursor: "pointer",
                      padding: "2px 4px",
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Searching Indicator */}
              {isSearching && (
                <div style={{ fontSize: 11, color: "#d4a574", fontStyle: "italic", paddingLeft: 4 }}>
                  Searching millions of songs...
                </div>
              )}

              {/* Search Results Dropdown List */}
              {searchResults.length > 0 && (
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  maxHeight: 180,
                  overflowY: "auto",
                  background: "rgba(10,3,7,0.85)",
                  border: "1px solid rgba(212,165,116,0.25)",
                  borderRadius: 10,
                  padding: "4px",
                }}>
                  {searchResults.map((song, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSelectSearchedTrack(song)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "6px 8px",
                        background: customTrack?.title === song.title ? "rgba(212,165,116,0.22)" : "transparent",
                        border: "none",
                        borderRadius: 6,
                        color: "#faf8f5",
                        textAlign: "left",
                        cursor: "pointer",
                        width: "100%",
                        transition: "background 0.15s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(212,165,116,0.18)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = customTrack?.title === song.title ? "rgba(212,165,116,0.22)" : "transparent")}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={song.artwork}
                        alt={song.title}
                        style={{ width: 28, height: 28, borderRadius: 4, objectFit: "cover", flexShrink: 0 }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#faf8f5", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {song.title}
                        </div>
                        <div style={{ fontSize: 10.5, color: "rgba(250,248,245,0.65)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {song.artist}
                        </div>
                      </div>
                      <span style={{ fontSize: 11, color: "#d4a574", flexShrink: 0, fontWeight: 700 }}>
                        ▶ Play
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Feature Highlights & Description */}
        <div>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 11.5,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#d4a574",
            marginBottom: 10,
            background: "rgba(212,165,116,0.1)",
            padding: "4px 12px",
            borderRadius: 14,
          }}>
            <span>🎵</span> SOUNDTRACK &amp; VOICE MEMOS
          </div>

          <h3 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "clamp(22px, 3.5vw, 28px)",
            fontWeight: 600,
            color: "#faf8f5",
            margin: "0 0 12px",
            lineHeight: 1.3,
          }}>
            Select Any Song From 100 Million.
          </h3>
          <p style={{
            fontSize: 14.5,
            color: "rgba(250,248,245,0.75)",
            lineHeight: 1.6,
            margin: "0 0 20px",
          }}>
            Attach the song that defines your memory or record a real voice message. When your recipient breaks the wax seal, the soundtrack starts playing softly as they read your words.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              {
                icon: "🔍",
                title: "Search Over 100M Songs",
                desc: "Type any song title or artist right in the letter composer with real-time 30s audio previews.",
              },
              {
                icon: "💌",
                title: "Auto-Plays on Unsealing",
                desc: "The chosen soundtrack begins playing smoothly the exact moment the wax seal is broken.",
              },
              {
                icon: "🎙️",
                title: "Attach Real Voice Memos",
                desc: "Record personal voice notes with an interactive waveform player embedded directly on your stationery.",
              },
            ].map(item => (
              <div key={item.title} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "rgba(212,165,116,0.12)",
                  border: "1px solid rgba(212,165,116,0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 15,
                  flexShrink: 0,
                  marginTop: 2,
                }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#faf8f5" }}>{item.title}</div>
                  <div style={{ fontSize: 12.5, color: "rgba(250,248,245,0.58)", lineHeight: 1.4 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <Link href="/create" style={{
              color: "#d4a574",
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}>
              Choose A Soundtrack in Composer →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const TEMPLATES = [
  { slug: "open-when-you-miss-me", title: "Open When You Miss Me", preview: "I know that feeling — the one where everything reminds you of us. A song, a smell, a quiet evening alone…", sig: "Yours across the distance", song: "A Thousand Years", font: "Flowing" },
  { slug: "open-when-youre-sad", title: "Open When You're Sad", preview: "Hey. I wrote this for exactly this moment — the one where the world feels too heavy and you just need somewhere to rest…", sig: "Your safe place", song: "Fix You", font: "Elegant" },
  { slug: "open-on-our-anniversary", title: "Open On Our Anniversary", preview: "Another year. Another collection of moments I wouldn't trade for anything in this world…", sig: "Forever yours", song: "Perfect", font: "Flowing" },
  { slug: "open-when-you-need-a-laugh", title: "Open When You Need a Laugh", preview: "Local person is too wonderful to be having a bad day. This is an official notice. Please smile immediately…", sig: "Your #1 fan", song: "My Girl", font: "Casual" },
  { slug: "open-on-your-first-day", title: "Open On Your First Day", preview: "You're allowed to be nervous today. Everyone in that room is, they're just wearing it differently…", sig: "Cheering from here", song: "Hall of Fame", font: "Classic" },
  { slug: "open-when-youre-homesick", title: "Open When You're Homesick", preview: "Missing home doesn't mean you made the wrong choice. It means you had something worth missing — and it will still be here…", sig: "Always here", song: "Home", font: "Elegant" },
  { slug: "open-when-you-cant-sleep", title: "Open When You Can't Sleep", preview: "It's late. Your mind won't quiet down. I get it. I want you to know — wherever I am — I'm thinking of you too…", sig: "Goodnight, love", song: "Can't Help Falling In Love", font: "Elegant" },
  { slug: "open-when-you-need-courage", title: "Open When You Need Courage", preview: "Whatever you're about to face — the interview, the conversation, the leap you're afraid to take — I want you to read this…", sig: "Your biggest believer", song: "Flowing font", font: "Flowing" },
];

const BROWSE_CATS = [
  { title: "Open When Letters for Long Distance Relationships", body: "Create sealed letters your partner can open at exactly the right moment — when they miss you, need comfort, or…", href: "/open-when/long-distance" },
  { title: "Open When You're Sad Letters", body: "Write a letter now that becomes a lifeline later — for the bad days you can't predict….", href: "/open-when/sad" },
  { title: "Open When You Miss Me Letters", body: "Seal your words now. They'll open them later — at exactly the moment they need you most….", href: "/open-when/miss-me" },
  { title: "Open When Letters for Your Anniversary", body: "A sealed letter they open on your anniversary — more personal than a card, more meaningful than a gift….", href: "/open-when/anniversary" },
  { title: "Open When Birthday Letters", body: "Not a card. Not a text. A sealed letter they break open on their birthday — because some words deserve a ritual…", href: "/open-when/birthday" },
  { title: "Open When You're Having a Bad Day", body: "Write it now, while things are calm. They open it on the day nothing goes right — and you're already there….", href: "/open-when/bad-day" },
  { title: "Open When Letters for Your Husband", body: "The words you've been meaning to say, sealed for the moments he'll need them most….", href: "/open-when/husband" },
  { title: "Open When Letters for Your Wife", body: "Write your wife a set of sealed letters — one for missing you, one for hard days, one for the anniversary. She…", href: "/open-when/wife" },
  { title: "Open When Letters for Your Girlfriend", body: "Write the things you don't always say out loud. She unseals each letter only on the night she actually needs it…", href: "/open-when/girlfriend" },
  { title: "Open When Letters for Your Boyfriend", body: "Write sealed digital letters for your boyfriend — one for when he misses you, one for the rough days, one for…", href: "/open-when/boyfriend" },
  { title: "Open When Letters for Your Mom", body: "Write your mom the sealed letters you've never quite managed to say in person. She opens each one exactly when…", href: "/open-when/mom" },
  { title: "Open When Letters for Your Best Friend", body: "Seal a set of letters for every moment — bad days, birthdays, or just because they're your person….", href: "/open-when/best-friend" },
];

const TAG_PILLS = [
  "You Graduate", "Going to College", "You're Stressed or Overwhelmed", "You Need a Laugh",
  "You Can't Sleep", "You're Angry With Me", "You're Homesick", "Deployment",
  "You're Sick", "Your Sister", "Friendship Day", "Your Brother",
  "Grandma and Grandpa", "Thank You Letters for a Teacher", "the New Year",
  "Raksha Bandhan", "Diwali",
];

const REVIEWS = [
  { text: "It's super creative. Like when my bestie is far away all i have to do was just send her the message and boom", author: "Verified Sender · May 2026" },
  { text: "This is such a cute and thoughtful website, thank you!", author: "Verified Sender · July 2026" },
  { text: "I love the interface of this website, so pretty! And it's simple to navigate as well.", author: "Verified Sender · July 2026" },
];

const FEATURES = [
  { title: "The Unsealing Ritual", body: "A wax-sealed envelope that yields only to patient, intentional touch. Hold to break the seal." },
  { title: "Guardian Questions", body: "Protect your words with riddles only your beloved can solve." },
  { title: "Ephemeral Privacy", body: "No accounts, no traces. Your words exist only between sender and receiver." },
  { title: "Instant Enchantment", body: "Create in moments, share in seconds. Magic should not require waiting." },
  { title: "A Gift Inside", body: "Seal a gift card, e-ticket, or voucher inside the letter. They read your words, then unwrap the gift." },
  { title: "A Song for the Moment", body: "Their favourite song begins the instant the seal breaks — a soundtrack for your words." },
];

const FAQS = [
  {
    q: "How does Send Letter work?",
    a: "You write your letter, choose your stationery theme and background music, then seal it. You get a private link to share with your recipient. When they open the link, they hold the wax seal to break it and reveal your letter.",
  },
  {
    q: "Is Send Letter completely free?",
    a: "Yes, Send Letter is 100% free to write, customize, and share. There are no subscriptions, account fees, or hidden charges.",
  },
  {
    q: "Do I or the recipient need an account?",
    a: "No account or login is needed. You can compose and share letters instantly, and your recipient can open them without signing up.",
  },
  {
    q: "Can I add music, photos, or voice notes to my letter?",
    a: "Yes! You can attach any background song with live audio preview, upload a photo keepsake, or record a personal voice note directly in the composer.",
  },
  {
    q: "How does the secret question and time-lock work?",
    a: "You can protect your letter with a secret question that only your recipient can answer, or lock it with a countdown timer so it opens only on a specific birthday, anniversary, or date.",
  },
  {
    q: "How will I know when my letter is opened?",
    a: "Every letter comes with a private management link where you can track live unseals, see reader reactions, and receive instant email notifications the moment your letter is opened.",
  },
];

function TemplateSeal({ slug }: { slug: string }) {
  const seals: Record<string, { bg: string; border: string; color: string; icon: string }> = {
    'open-when-you-miss-me': {
      bg: 'radial-gradient(circle at 35% 30%, #c41e3a 0%, #6b0e1a 100%)',
      border: 'rgba(255, 180, 180, 0.35)',
      color: '#ffffff',
      icon: '❤',
    },
    'open-when-youre-sad': {
      bg: 'radial-gradient(circle at 35% 30%, #3b1d2e 0%, #1a0a14 100%)',
      border: 'rgba(212, 165, 116, 0.25)',
      color: '#d4a574',
      icon: '🌧',
    },
    'open-on-our-anniversary': {
      bg: 'radial-gradient(circle at 35% 30%, #d4a574 0%, #784e18 100%)',
      border: 'rgba(255, 235, 200, 0.4)',
      color: '#201005',
      icon: '✉',
    },
    'open-when-you-need-a-laugh': {
      bg: 'radial-gradient(circle at 35% 30%, #d97706 0%, #78350f 100%)',
      border: 'rgba(253, 230, 138, 0.35)',
      color: '#fffbeb',
      icon: '✦',
    },
    'open-on-your-first-day': {
      bg: 'radial-gradient(circle at 35% 30%, #2563eb 0%, #1e3a8a 100%)',
      border: 'rgba(191, 219, 254, 0.3)',
      color: '#ffffff',
      icon: '✦',
    },
    'open-when-youre-homesick': {
      bg: 'radial-gradient(circle at 35% 30%, #92400e 0%, #451a03 100%)',
      border: 'rgba(254, 215, 170, 0.3)',
      color: '#fef3c7',
      icon: '🌿',
    },
    'open-when-you-cant-sleep': {
      bg: 'radial-gradient(circle at 35% 30%, #312e81 0%, #1e1b4b 100%)',
      border: 'rgba(199, 210, 254, 0.3)',
      color: '#e0e7ff',
      icon: '🌙',
    },
    'open-when-you-need-courage': {
      bg: 'radial-gradient(circle at 35% 30%, #9f1239 0%, #4c0519 100%)',
      border: 'rgba(254, 205, 211, 0.3)',
      color: '#ffffff',
      icon: '✦',
    },
  };

  const s = seals[slug] || {
    bg: 'radial-gradient(circle at 35% 30%, #8b1824 0%, #40080e 100%)',
    border: 'rgba(212,165,116,0.3)',
    color: '#d4a574',
    icon: '✦',
  };

  return (
    <div style={{
      width: 44,
      height: 44,
      borderRadius: '50%',
      background: s.bg,
      border: `1px solid ${s.border}`,
      boxShadow: '0 4px 14px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255,255,255,0.25)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '6px auto 16px auto',
      fontSize: 18,
      color: s.color,
      flexShrink: 0,
    }}>
      {s.icon}
    </div>
  );
}

function FaqAccordion({ faqs }: { faqs: { q: string; a: string }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="faq-list">
      {faqs.map((f, i) => {
        const isOpen = openIndex === i;
        return (
          <div
            key={f.q}
            className="faq-item"
            style={{
              cursor: "pointer",
              transition: "border-color 0.2s ease, background 0.2s ease",
              borderColor: isOpen ? "rgba(212,165,116,0.3)" : undefined,
            }}
            onClick={() => setOpenIndex(isOpen ? null : i)}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <p className="faq-q" style={{ margin: 0 }}>
                {f.q}
              </p>
              <span
                style={{
                  fontSize: 12,
                  color: isOpen ? "var(--gold)" : "rgba(250,248,245,0.3)",
                  transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.25s ease, color 0.2s ease",
                  flexShrink: 0,
                }}
              >
                ▼
              </span>
            </div>
            {isOpen && (
              <p
                className="faq-a"
                style={{
                  marginTop: 12,
                  marginBottom: 0,
                  animation: "fadeIn 0.25s ease",
                }}
              >
                {f.a}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

const CAROUSEL_SLIDES = [
  { id: "soundtracks", label: "Music & Audio", icon: "🎵", subtitle: "Live Search · 30s Preview" },
  { id: "keepsakes", label: "Polaroid & Prints", icon: "📸", subtitle: "Framed PNG & Origami A4" },
  { id: "vault", label: "Intimate Vault", icon: "🔒", subtitle: "Timelocks & Riddles" },
  { id: "alerts", label: "Delivery & Alerts", icon: "⚡", subtitle: "Live Receipts & Killswitch" },
  { id: "muse", label: "The Muse AI", icon: "✨", subtitle: "Writing Companion" },
] as const;

export default function HomePage() {
  const [activeSlide, setActiveSlide] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollToSlide = (idx: number) => {
    if (!carouselRef.current) return;
    const container = carouselRef.current;
    const item = container.children[idx] as HTMLElement;
    if (item) {
      container.scrollTo({
        left: item.offsetLeft,
        behavior: "smooth",
      });
      setActiveSlide(idx);
    }
  };

  const prevSlide = () => {
    const nextIdx = Math.max(0, activeSlide - 1);
    scrollToSlide(nextIdx);
  };

  const nextSlide = () => {
    const nextIdx = Math.min(CAROUSEL_SLIDES.length - 1, activeSlide + 1);
    scrollToSlide(nextIdx);
  };

  const handleCarouselScroll = () => {
    if (!carouselRef.current) return;
    const container = carouselRef.current;
    const scrollLeft = container.scrollLeft;
    const children = Array.from(container.children) as HTMLElement[];
    if (!children.length) return;

    let closestIdx = 0;
    let minDiff = Infinity;
    children.forEach((child, idx) => {
      const diff = Math.abs(child.offsetLeft - scrollLeft);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = idx;
      }
    });

    if (closestIdx !== activeSlide) {
      setActiveSlide(closestIdx);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="hero-section" style={{ position: "relative" }}>
        {/* Top-Right Explore Prompt */}
        <a
          href="#interactive-demo"
          onClick={(e) => {
            e.preventDefault();
            const el = document.getElementById("interactive-demo");
            if (el) {
              el.scrollIntoView({ behavior: "smooth" });
            } else {
              window.scrollBy({ top: 680, behavior: "smooth" });
            }
          }}
          className="hero-explore-pill"
          style={{
            position: "absolute",
            top: 20,
            right: 24,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: "12.5px",
            fontFamily: "'Crimson Pro', Georgia, serif",
            color: "rgba(212, 165, 116, 0.9)",
            background: "rgba(25, 10, 18, 0.8)",
            border: "1px solid rgba(212, 165, 116, 0.28)",
            borderRadius: 24,
            padding: "7px 15px",
            textDecoration: "none",
            boxShadow: "0 6px 18px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.08)",
            backdropFilter: "blur(10px)",
            transition: "all 0.25s ease",
            zIndex: 10,
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "rgba(212, 165, 116, 0.65)";
            e.currentTarget.style.color = "#faf8f5";
            e.currentTarget.style.transform = "translateY(2px)";
            e.currentTarget.style.background = "rgba(42, 16, 28, 0.95)";
            e.currentTarget.style.boxShadow = "0 8px 24px rgba(196,30,58,0.25)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(212, 165, 116, 0.28)";
            e.currentTarget.style.color = "rgba(212, 165, 116, 0.9)";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.background = "rgba(25, 10, 18, 0.8)";
            e.currentTarget.style.boxShadow = "0 6px 18px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.08)";
          }}
        >
          <span>✦</span> Explore this page to see how Send Letter works ↓
        </a>

        {/* Ambient glow */}
        <div style={{ position: "absolute", top: "25%", left: "50%", transform: "translateX(-50%)", width: 600, height: 300, background: "radial-gradient(ellipse, rgba(139,32,32,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div className="hero-seal">❤</div>

        <p className="hero-est">— EST. 2026 —</p>

        <h1 className="hero-title">
          Not every message
          <span className="hero-title-italic">belongs in a chat window.</span>
        </h1>

        <div className="ornament" style={{ maxWidth: 180, marginTop: "18px" }}>
          <span className="ornament-icon">🔏</span>
        </div>

        {/* Real-time letters delivered live counter */}
        <LiveDeliveredCounter />

        <Link
          href="/create"
          className="hero-compose-btn"
          style={{
            marginTop: 38,
          }}
        >
          ✉ Write Your Letter
        </Link>
      </section>

      {/* ── INTERACTIVE UNSEAL MINI-DEMO ──────────────────── */}
      <div id="interactive-demo">
        <InteractiveUnsealDemo />
      </div>

      {/* ── HORIZONTAL NATIVE SWIPE KEEPSAKE CAROUSEL (OPTION B) ── */}
      <section style={{
        maxWidth: 1140,
        margin: "0 auto",
        padding: "60px 20px 80px",
        position: "relative",
        zIndex: 1,
      }}>
        {/* Section Header */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#d4a574",
            marginBottom: 12,
            background: "rgba(212,165,116,0.08)",
            border: "1px solid rgba(212,165,116,0.22)",
            padding: "5px 16px",
            borderRadius: 20,
          }}>
            <span>✦</span> CRAFT &amp; INNOVATION CAROUSEL
          </div>
          <h2 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "clamp(26px, 4.5vw, 38px)",
            fontWeight: 600,
            color: "#faf8f5",
            margin: "0 0 12px",
            lineHeight: 1.25,
            letterSpacing: "0.01em",
          }}>
            Swipe to explore the app features
          </h2>
          <p style={{
            fontSize: "clamp(14px, 2.5vw, 16.5px)",
            color: "rgba(250,248,245,0.7)",
            maxWidth: 640,
            margin: "0 auto",
            lineHeight: 1.6,
          }}>
            Swipe horizontally on your phone or use the arrow controls below to explore each handcrafted detail.
          </p>
        </div>

        {/* Carousel Control Bar (Arrows + Progress Pill) */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 16,
          padding: "0 4px",
          flexWrap: "wrap",
        }}>
          {/* Active Card Pill */}
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(25, 10, 18, 0.8)",
            border: "1px solid rgba(212, 165, 116, 0.3)",
            padding: "6px 14px",
            borderRadius: 16,
            fontSize: 13,
            fontWeight: 600,
            color: "#faf8f5",
          }}>
            <span style={{ fontSize: 16 }}>{CAROUSEL_SLIDES[activeSlide].icon}</span>
            <span>{CAROUSEL_SLIDES[activeSlide].label}</span>
            <span style={{ color: "#d4a574", fontSize: 11, background: "rgba(212,165,116,0.15)", padding: "1px 6px", borderRadius: 8 }}>
              {activeSlide + 1} / {CAROUSEL_SLIDES.length}
            </span>
          </div>

          {/* Nav Arrows */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              type="button"
              onClick={prevSlide}
              disabled={activeSlide === 0}
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: activeSlide === 0 ? "rgba(255,255,255,0.04)" : "rgba(25, 10, 18, 0.9)",
                border: `1.5px solid ${activeSlide === 0 ? "rgba(255,255,255,0.1)" : "rgba(212,165,116,0.5)"}`,
                color: activeSlide === 0 ? "rgba(255,255,255,0.2)" : "#d4a574",
                fontSize: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: activeSlide === 0 ? "not-allowed" : "pointer",
                transition: "all 0.2s ease",
              }}
              title="Previous Feature"
            >
              ←
            </button>

            <button
              type="button"
              onClick={nextSlide}
              disabled={activeSlide === CAROUSEL_SLIDES.length - 1}
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: activeSlide === CAROUSEL_SLIDES.length - 1 ? "rgba(255,255,255,0.04)" : "rgba(25, 10, 18, 0.9)",
                border: `1.5px solid ${activeSlide === CAROUSEL_SLIDES.length - 1 ? "rgba(255,255,255,0.1)" : "rgba(212,165,116,0.5)"}`,
                color: activeSlide === CAROUSEL_SLIDES.length - 1 ? "rgba(255,255,255,0.2)" : "#d4a574",
                fontSize: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: activeSlide === CAROUSEL_SLIDES.length - 1 ? "not-allowed" : "pointer",
                transition: "all 0.2s ease",
              }}
              title="Next Feature"
            >
              →
            </button>
          </div>
        </div>

        {/* Horizontal Native Swipe Rail */}
        <div
          ref={carouselRef}
          onScroll={handleCarouselScroll}
          style={{
            display: "flex",
            gap: 20,
            overflowX: "auto",
            scrollSnapType: "x mandatory",
            scrollBehavior: "smooth",
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
            padding: "8px 2px 20px",
          }}
        >
          {/* ── SLIDE 1: SOUNDTRACK SHOWCASE & LIVE SONG SEARCH ── */}
          <div style={{
            flex: "0 0 100%",
            minWidth: "100%",
            scrollSnapAlign: "start",
            boxSizing: "border-box",
          }}>
            <LandingMusicShowcase />
          </div>

          {/* ── SLIDE 3: TANGIBLE KEEPSAKES & EXPORTS ── */}
          <div style={{
            flex: "0 0 100%",
            minWidth: "100%",
            scrollSnapAlign: "start",
            boxSizing: "border-box",
            background: "linear-gradient(145deg, rgba(28, 10, 18, 0.92) 0%, rgba(14, 4, 10, 0.96) 100%)",
            border: "1px solid rgba(212, 165, 116, 0.28)",
            borderRadius: 20,
            padding: "36px 28px",
            boxShadow: "0 16px 44px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)",
            position: "relative",
            overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", top: -40, left: -40, width: 260, height: 260,
              background: "radial-gradient(circle, rgba(212,165,116,0.15) 0%, transparent 70%)",
              pointerEvents: "none",
            }} />

            <div style={{ marginBottom: 28 }}>
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 11.5,
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#d4a574",
                marginBottom: 10,
                background: "rgba(212,165,116,0.08)",
                border: "1px solid rgba(212,165,116,0.22)",
                padding: "4px 14px",
                borderRadius: 20,
              }}>
                <span>✦</span> TANGIBLE KEEPSAKES &amp; MEMORIES
              </div>
              <h3 style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: "clamp(24px, 4vw, 32px)",
                fontWeight: 600,
                color: "#faf8f5",
                margin: "0 0 8px",
                lineHeight: 1.25,
              }}>
                Carry It Digitally. Hold It Physically.
              </h3>
              <p style={{
                fontSize: 14.5,
                color: "rgba(250,248,245,0.72)",
                maxWidth: 700,
                lineHeight: 1.55,
                margin: 0,
              }}>
                Attach photographic memories to your stationery, download framed keepsake cards, or print foldable origami envelopes to hold in real life.
              </p>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))",
              gap: 32,
              alignItems: "center",
            }}>
              {/* Left: Realistic Vintage Polaroid Keepsake */}
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                background: "rgba(10, 3, 7, 0.75)",
                border: "1px solid rgba(212,165,116,0.22)",
                borderRadius: 20,
                padding: "30px 20px 24px",
                boxShadow: "0 14px 36px rgba(0,0,0,0.6)",
                position: "relative",
              }}>
                <div style={{
                  fontSize: 11,
                  color: "#d4a574",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  background: "rgba(212,165,116,0.12)",
                  border: "1px solid rgba(212,165,116,0.25)",
                  padding: "3px 12px",
                  borderRadius: 14,
                  marginBottom: 20,
                }}>
                  📸 Attached Photo Keepsake
                </div>

                <div style={{
                  background: "#fdfbf7",
                  padding: "14px 14px 22px",
                  borderRadius: 4,
                  boxShadow: "0 18px 45px rgba(0,0,0,0.65), 0 2px 8px rgba(0,0,0,0.3)",
                  transform: "rotate(-2deg)",
                  maxWidth: 290,
                  width: "100%",
                  border: "1px solid rgba(200, 184, 163, 0.6)",
                  position: "relative",
                }}>
                  <div style={{
                    position: "absolute",
                    top: -10,
                    left: "50%",
                    transform: "translateX(-50%) rotate(2deg)",
                    width: 70,
                    height: 20,
                    background: "rgba(212, 165, 116, 0.45)",
                    backdropFilter: "blur(4px)",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                  }} />

                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/ssr-memory.jpg"
                    alt="Sushant Singh Rajput memory keepsake"
                    style={{
                      width: "100%",
                      height: 240,
                      objectFit: "cover",
                      borderRadius: 2,
                      display: "block",
                      filter: "contrast(1.03) saturate(1.05)",
                    }}
                  />

                  <div style={{
                    fontFamily: "'Dancing Script', cursive",
                    fontSize: 18,
                    color: "#3a2d24",
                    marginTop: 12,
                    textAlign: "center",
                    fontWeight: 600,
                    letterSpacing: "0.02em",
                  }}>
                    &ldquo;A photo that says what words can&apos;t&rdquo;
                  </div>
                </div>

                <div style={{
                  marginTop: 22,
                  fontSize: 12,
                  color: "rgba(250,248,245,0.65)",
                  textAlign: "center",
                  fontStyle: "italic",
                }}>
                  Renders below your handwritten letter when the wax seal is broken.
                </div>
              </div>

              {/* Right: Keepsake Download Features */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{
                  background: "rgba(10, 3, 7, 0.6)",
                  border: "1px solid rgba(212,165,116,0.22)",
                  borderRadius: 16,
                  padding: "20px 22px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 20 }}>🖼️</span>
                      <h4 style={{ fontSize: 16, fontWeight: 700, color: "#faf8f5", margin: 0 }}>
                        Download Framed Keepsake Card (PNG)
                      </h4>
                    </div>
                    <span style={{
                      fontSize: 10.5, color: "#d4a574",
                      background: "rgba(212,165,116,0.12)",
                      border: "1px solid rgba(212,165,116,0.25)",
                      padding: "2px 8px", borderRadius: 10, fontWeight: 600,
                    }}>
                      Digital HD
                    </span>
                  </div>
                  <p style={{ fontSize: 13.5, color: "rgba(250,248,245,0.72)", margin: 0, lineHeight: 1.5 }}>
                    Export your entire unsealed letter, handwriting, signature, wax seal, and attached photo keepsake as an ultra-high-resolution framed image. Perfect for saving to your camera roll or setting as wallpaper.
                  </p>
                </div>

                <div style={{
                  background: "rgba(10, 3, 7, 0.6)",
                  border: "1px solid rgba(212,165,116,0.22)",
                  borderRadius: 16,
                  padding: "20px 22px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 20 }}>🖨️</span>
                      <h4 style={{ fontSize: 16, fontWeight: 700, color: "#faf8f5", margin: 0 }}>
                        Download Printable Foldable Origami Envelope (A4 PDF)
                      </h4>
                    </div>
                    <span style={{
                      fontSize: 10.5, color: "#5ae08a",
                      background: "rgba(40,160,80,0.18)",
                      border: "1px solid rgba(70,210,110,0.3)",
                      padding: "2px 8px", borderRadius: 10, fontWeight: 600,
                    }}>
                      Physical Print
                    </span>
                  </div>
                  <p style={{ fontSize: 13.5, color: "rgba(250,248,245,0.72)", margin: 0, lineHeight: 1.5 }}>
                    Turn your digital letter into a physical tangible memory. Generates a ready-to-print A4 PDF template with fold lines so you or your recipient can fold a real origami envelope at home.
                  </p>
                </div>

                <div style={{
                  background: "rgba(10, 3, 7, 0.6)",
                  border: "1px solid rgba(212,165,116,0.22)",
                  borderRadius: 16,
                  padding: "16px 22px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}>
                  <span style={{ fontSize: 18 }}>📸</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#faf8f5" }}>
                      Attach Any Photo In 1-Tap
                    </div>
                    <div style={{ fontSize: 12.5, color: "rgba(250,248,245,0.65)", lineHeight: 1.4 }}>
                      Upload any photo directly in the composer. Photos render as authentic Polaroids with gentle tilt and handwritten captions.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── SLIDE 4: INTIMATE RITUALS & VAULT SECURITY ── */}
          <div style={{
            flex: "0 0 100%",
            minWidth: "100%",
            scrollSnapAlign: "start",
            boxSizing: "border-box",
            background: "linear-gradient(145deg, rgba(28, 10, 18, 0.92) 0%, rgba(14, 4, 10, 0.96) 100%)",
            border: "1px solid rgba(212, 165, 116, 0.28)",
            borderRadius: 20,
            padding: "36px 28px",
            boxShadow: "0 16px 44px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)",
            position: "relative",
            overflow: "hidden",
          }}>
            <div style={{ marginBottom: 28, textAlign: "center" }}>
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 11.5,
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#d4a574",
                marginBottom: 10,
                background: "rgba(212,165,116,0.08)",
                border: "1px solid rgba(212,165,116,0.2)",
                padding: "4px 14px",
                borderRadius: 20,
              }}>
                <span>✦</span> INTIMATE RITUALS &amp; VAULT SECURITY
              </div>
              <h3 style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: "clamp(24px, 4vw, 32px)",
                fontWeight: 600,
                color: "#faf8f5",
                margin: "0 0 10px",
                lineHeight: 1.25,
              }}>
                More Than Just Words. A Sacred Experience.
              </h3>
              <p style={{
                fontSize: 14.5,
                color: "rgba(250,248,245,0.7)",
                maxWidth: 560,
                margin: "0 auto",
                lineHeight: 1.55,
              }}>
                From private memory riddles and timed countdown vaults to intimate handwritten replies sealed in return.
              </p>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: 24,
              alignItems: "stretch",
            }}>
              {/* CARD 1: GUARDIAN QUESTION LOCK */}
              <div style={{
                background: "rgba(10, 3, 7, 0.75)",
                border: "1px solid rgba(212, 165, 116, 0.22)",
                borderRadius: 18,
                padding: "24px 20px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: "50%",
                      background: "radial-gradient(circle at 35% 30%, #8b1824 0%, #3e0b12 100%)",
                      border: "1px solid rgba(212,165,116,0.35)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 17,
                    }}>
                      🔒
                    </div>
                    <span style={{
                      fontSize: 11, color: "#d4a574",
                      background: "rgba(212,165,116,0.12)",
                      border: "1px solid rgba(212,165,116,0.22)",
                      padding: "3px 10px", borderRadius: 16, fontWeight: 700,
                    }}>
                      GUARDIAN LOCK
                    </span>
                  </div>

                  <h4 style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: 19, fontWeight: 600, color: "#faf8f5", margin: "0 0 8px",
                  }}>
                    Secret Question Protection
                  </h4>
                  <p style={{ fontSize: 13.5, color: "rgba(250,248,245,0.7)", lineHeight: 1.5, margin: "0 0 16px" }}>
                    A lock only the two of you hold the key to. Guard your envelope behind a private question that only your recipient can solve.
                  </p>

                  <div style={{
                    background: "rgba(8, 2, 5, 0.85)",
                    border: "1px solid rgba(212,165,116,0.18)",
                    borderRadius: 12,
                    padding: "12px 14px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}>
                    <div style={{ fontSize: 10.5, color: "#d4a574", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      ✦ Guardian Riddle
                    </div>
                    <div style={{ fontSize: 13, color: "#faf8f5", fontStyle: "italic", fontFamily: "Georgia, serif" }}>
                      &ldquo;Where did we get caught in the heavy rain in 2023?&rdquo;
                    </div>
                    <div style={{
                      display: "flex", alignItems: "center", gap: 6,
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: 8, padding: "6px 10px", marginTop: 4,
                    }}>
                      <span style={{ fontSize: 11, color: "rgba(250,248,245,0.4)" }}>Enter secret answer...</span>
                      <span style={{ marginLeft: "auto", fontSize: 11, color: "#5ae08a", fontWeight: 600 }}>Unlock 🔓</span>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.06)", fontSize: 12, color: "rgba(250,248,245,0.6)" }}>
                  🛡️ Failed attempts are logged live on your status dashboard.
                </div>
              </div>

              {/* CARD 2: TIME-LOCK VAULT */}
              <div style={{
                background: "rgba(10, 3, 7, 0.75)",
                border: "1px solid rgba(212, 165, 116, 0.22)",
                borderRadius: 18,
                padding: "24px 20px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: "50%",
                      background: "radial-gradient(circle at 35% 30%, #a16207 0%, #451a03 100%)",
                      border: "1px solid rgba(212,165,116,0.35)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 17,
                    }}>
                      ⏳
                    </div>
                    <span style={{
                      fontSize: 11, color: "#f59e0b",
                      background: "rgba(245,158,11,0.12)",
                      border: "1px solid rgba(245,158,11,0.25)",
                      padding: "3px 10px", borderRadius: 16, fontWeight: 700,
                    }}>
                      TIME-LOCK VAULT
                    </span>
                  </div>

                  <h4 style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: 19, fontWeight: 600, color: "#faf8f5", margin: "0 0 8px",
                  }}>
                    Scheduled Countdown Release
                  </h4>
                  <p style={{ fontSize: 13.5, color: "rgba(250,248,245,0.7)", lineHeight: 1.5, margin: "0 0 16px" }}>
                    Write it today. They unlock it on their special day. Lock your letter until a future birthday, anniversary, or milestone moment.
                  </p>

                  <div style={{
                    background: "rgba(8, 2, 5, 0.85)",
                    border: "1px solid rgba(212,165,116,0.18)",
                    borderRadius: 12,
                    padding: "12px 14px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 10.5, color: "#f59e0b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        🗓 Birthday Morning
                      </span>
                      <span style={{ fontSize: 11, color: "rgba(250,248,245,0.45)" }}>Aug 15 · 10:00 AM</span>
                    </div>
                    <div style={{
                      display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4, textAlign: "center", marginTop: 4,
                    }}>
                      {[
                        { val: "14", label: "Days" },
                        { val: "06", label: "Hours" },
                        { val: "22", label: "Mins" },
                        { val: "45", label: "Secs" },
                      ].map(b => (
                        <div key={b.label} style={{
                          background: "rgba(245,158,11,0.1)",
                          border: "1px solid rgba(245,158,11,0.22)",
                          borderRadius: 6, padding: "5px 2px",
                        }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: "#faf8f5", fontFamily: "monospace" }}>{b.val}</div>
                          <div style={{ fontSize: 9.5, color: "#f59e0b" }}>{b.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.06)", fontSize: 12, color: "rgba(250,248,245,0.6)" }}>
                  ⏰ Wax seal stays locked until the exact scheduled minute.
                </div>
              </div>

              {/* CARD 3: TWO-WAY SEALED REPLIES */}
              <div style={{
                background: "rgba(10, 3, 7, 0.75)",
                border: "1px solid rgba(212, 165, 116, 0.22)",
                borderRadius: 18,
                padding: "24px 20px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: "50%",
                      background: "radial-gradient(circle at 35% 30%, #047857 0%, #064e3b 100%)",
                      border: "1px solid rgba(70,210,110,0.35)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 17,
                    }}>
                      📬
                    </div>
                    <span style={{
                      fontSize: 11, color: "#5ae08a",
                      background: "rgba(40,160,80,0.15)",
                      border: "1px solid rgba(70,210,110,0.3)",
                      padding: "3px 10px", borderRadius: 16, fontWeight: 700,
                    }}>
                      TWO-WAY REPLIES
                    </span>
                  </div>

                  <h4 style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: 19, fontWeight: 600, color: "#faf8f5", margin: "0 0 8px",
                  }}>
                    Sealed Secret Responses
                  </h4>
                  <p style={{ fontSize: 13.5, color: "rgba(250,248,245,0.7)", lineHeight: 1.5, margin: "0 0 16px" }}>
                    Not a chat thread — an intimate exchange of sealed letters. Your recipient can write and wax-seal a secret reply back to you.
                  </p>

                  <div style={{
                    background: "rgba(8, 2, 5, 0.85)",
                    border: "1px solid rgba(212,165,116,0.18)",
                    borderRadius: 12,
                    padding: "12px 14px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: "#faf8f5", fontFamily: "'Playfair Display', serif" }}>
                        ✉ Sealed Response
                      </span>
                      <span style={{ fontSize: 10, color: "#5ae08a", background: "rgba(40,160,80,0.18)", padding: "2px 6px", borderRadius: 8, fontWeight: 600 }}>
                        New Reply
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: "rgba(250,248,245,0.65)", fontStyle: "italic" }}>
                      &ldquo;I read this tonight. My eyes filled with tears...&rdquo;
                    </div>
                    <div style={{
                      background: "linear-gradient(135deg, #c41e3a 0%, #8b1824 100%)",
                      color: "#ffffff", padding: "5px 10px", borderRadius: 6, fontSize: 11.5, fontWeight: 600, textAlign: "center", marginTop: 2,
                    }}>
                      Unseal Response →
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.06)", fontSize: 12, color: "rgba(250,248,245,0.6)" }}>
                  💌 Instant email notifications whenever a reply is sealed.
                </div>
              </div>
            </div>
          </div>

          {/* ── SLIDE 5: REAL-TIME EMAIL INTELLIGENCE & ALERTS ── */}
          <div style={{
            flex: "0 0 100%",
            minWidth: "100%",
            scrollSnapAlign: "start",
            boxSizing: "border-box",
            background: "linear-gradient(145deg, rgba(28, 10, 18, 0.92) 0%, rgba(14, 4, 10, 0.96) 100%)",
            border: "1px solid rgba(212, 165, 116, 0.28)",
            borderRadius: 20,
            padding: "36px 28px",
            boxShadow: "0 16px 44px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)",
            position: "relative",
            overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", top: -50, right: -50, width: 260, height: 260,
              background: "radial-gradient(circle, rgba(196,30,58,0.15) 0%, transparent 70%)",
              pointerEvents: "none",
            }} />

            <div style={{ marginBottom: 28 }}>
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 11.5,
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#d4a574",
                marginBottom: 10,
                background: "rgba(212,165,116,0.08)",
                border: "1px solid rgba(212,165,116,0.22)",
                padding: "4px 14px",
                borderRadius: 20,
              }}>
                <span>✦</span> REAL-TIME EMAIL INTELLIGENCE
              </div>
              <h3 style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: "clamp(24px, 4vw, 32px)",
                fontWeight: 600,
                color: "#faf8f5",
                margin: "0 0 8px",
                lineHeight: 1.25,
              }}>
                Never Wonder If They Opened It. Instant Email Receipts.
              </h3>
              <p style={{
                fontSize: 14.5,
                color: "rgba(250,248,245,0.72)",
                maxWidth: 680,
                lineHeight: 1.55,
                margin: 0,
              }}>
                Provide your email in the composer to receive discreet, beautifully formatted alerts the exact second your words touch their hands.
              </p>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))",
              gap: 28,
              alignItems: "stretch",
            }}>
              {/* Left: Simulated Inbox Notifications Stream */}
              <div style={{
                background: "rgba(10, 3, 7, 0.8)",
                border: "1px solid rgba(212,165,116,0.22)",
                borderRadius: 16,
                padding: "20px 18px",
                display: "flex",
                flexDirection: "column",
                gap: 12,
                boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingBottom: 10,
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 16 }}>📫</span>
                    <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#faf8f5" }}>
                      Your Inbox · Live Alerts
                    </span>
                  </div>
                  <span style={{
                    fontSize: 10.5, color: "#5ae08a",
                    background: "rgba(40,160,80,0.18)",
                    border: "1px solid rgba(70,210,110,0.3)",
                    padding: "2px 8px", borderRadius: 10, fontWeight: 600,
                    display: "flex", alignItems: "center", gap: 4,
                  }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#5ae08a" }} />
                    Active
                  </span>
                </div>

                <div style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(212,165,116,0.25)",
                  borderRadius: 12,
                  padding: "12px 14px",
                  display: "flex",
                  gap: 12,
                  alignItems: "flex-start",
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: "radial-gradient(circle at 35% 30%, #c41e3a 0%, #6b101b 100%)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, flexShrink: 0,
                    boxShadow: "0 2px 8px rgba(196,30,58,0.4)",
                  }}>
                    💌
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 2 }}>
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: "#faf8f5" }}>Letter Unsealed &amp; Read</span>
                      <span style={{ fontSize: 10, color: "rgba(250,248,245,0.4)" }}>Just now</span>
                    </div>
                    <div style={{ fontSize: 11.5, color: "rgba(250,248,245,0.7)", lineHeight: 1.4 }}>
                      Your recipient broke the wax seal on <strong style={{ color: "#d4a574" }}>iPhone</strong>. Audio started playing.
                    </div>
                  </div>
                </div>

                <div style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 12,
                  padding: "12px 14px",
                  display: "flex",
                  gap: 12,
                  alignItems: "flex-start",
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: "radial-gradient(circle at 35% 30%, #ec4899 0%, #831843 100%)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, flexShrink: 0,
                  }}>
                    💖
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 2 }}>
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: "#faf8f5" }}>New Emotional Reaction</span>
                      <span style={{ fontSize: 10, color: "rgba(250,248,245,0.4)" }}>2m ago</span>
                    </div>
                    <div style={{ fontSize: 11.5, color: "rgba(250,248,245,0.7)", lineHeight: 1.4 }}>
                      Recipient reacted: <strong style={{ color: "#f472b6" }}>&ldquo;Loved it ❤️&rdquo;</strong>
                    </div>
                  </div>
                </div>

                <div style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(70,210,110,0.22)",
                  borderRadius: 12,
                  padding: "12px 14px",
                  display: "flex",
                  gap: 12,
                  alignItems: "flex-start",
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: "radial-gradient(circle at 35% 30%, #059669 0%, #064e3b 100%)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, flexShrink: 0,
                  }}>
                    📬
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 2 }}>
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: "#faf8f5" }}>Sealed Response Received</span>
                      <span style={{ fontSize: 10, color: "rgba(250,248,245,0.4)" }}>5m ago</span>
                    </div>
                    <div style={{ fontSize: 11.5, color: "rgba(250,248,245,0.7)", lineHeight: 1.4 }}>
                      They wrote back and sealed a private reply. Click to unseal.
                    </div>
                  </div>
                </div>

                <div style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 12,
                  padding: "12px 14px",
                  display: "flex",
                  gap: 12,
                  alignItems: "flex-start",
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: "radial-gradient(circle at 35% 30%, #3b82f6 0%, #1e3a8a 100%)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, flexShrink: 0,
                  }}>
                    🔗
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 2 }}>
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: "#faf8f5" }}>Shared Link Opened</span>
                      <span style={{ fontSize: 10, color: "rgba(250,248,245,0.4)" }}>12m ago</span>
                    </div>
                    <div style={{ fontSize: 11.5, color: "rgba(250,248,245,0.7)", lineHeight: 1.4 }}>
                      Letter was opened on a new device (<strong style={{ color: "#60a5fa" }}>Mac</strong>).
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: The 5 Core Email Alert Features */}
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 12 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{
                    background: "rgba(10, 3, 7, 0.6)",
                    border: "1px solid rgba(212,165,116,0.18)",
                    borderRadius: 14,
                    padding: "14px 16px",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                      <span style={{ color: "#d4a574", fontSize: 14 }}>⚡</span>
                      <h4 style={{ fontSize: 14.5, fontWeight: 700, color: "#faf8f5", margin: 0 }}>
                        Instant Unseal Receipts
                      </h4>
                    </div>
                    <p style={{ fontSize: 12.5, color: "rgba(250,248,245,0.7)", margin: 0, lineHeight: 1.4 }}>
                      Sent the exact second the wax seal is broken. Pinpoints whether opened on <strong style={{ color: "#d4a574" }}>iPhone, Android, Mac, or PC</strong>.
                    </p>
                  </div>

                  <div style={{
                    background: "rgba(10, 3, 7, 0.6)",
                    border: "1px solid rgba(212,165,116,0.18)",
                    borderRadius: 14,
                    padding: "14px 16px",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                      <span style={{ color: "#f472b6", fontSize: 14 }}>💖</span>
                      <h4 style={{ fontSize: 14.5, fontWeight: 700, color: "#faf8f5", margin: 0 }}>
                        Heartfelt Reaction Alerts
                      </h4>
                    </div>
                    <p style={{ fontSize: 12.5, color: "rgba(250,248,245,0.7)", margin: 0, lineHeight: 1.4 }}>
                      Discover how they felt in real time when they tap emotional reactions after reading your words.
                    </p>
                  </div>

                  <div style={{
                    background: "rgba(10, 3, 7, 0.6)",
                    border: "1px solid rgba(212,165,116,0.18)",
                    borderRadius: 14,
                    padding: "14px 16px",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                      <span style={{ color: "#5ae08a", fontSize: 14 }}>📬</span>
                      <h4 style={{ fontSize: 14.5, fontWeight: 700, color: "#faf8f5", margin: 0 }}>
                        Two-Way Secret Reply Delivery
                      </h4>
                    </div>
                    <p style={{ fontSize: 12.5, color: "rgba(250,248,245,0.7)", margin: 0, lineHeight: 1.4 }}>
                      When your recipient writes and seals a response, you get an immediate email with a direct unseal link.
                    </p>
                  </div>

                  <div style={{
                    background: "rgba(10, 3, 7, 0.6)",
                    border: "1px solid rgba(228,32,56,0.22)",
                    borderRadius: 14,
                    padding: "14px 16px",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                      <span style={{ color: "#ff6b7d", fontSize: 14 }}>🔥</span>
                      <h4 style={{ fontSize: 14.5, fontWeight: 700, color: "#faf8f5", margin: 0 }}>
                        1-Tap Self-Destruct Killswitch
                      </h4>
                    </div>
                    <p style={{ fontSize: 12.5, color: "rgba(250,248,245,0.7)", margin: 0, lineHeight: 1.4 }}>
                      Changed your mind? Use the private link sent to your email to permanently vaporize your letter, photos, and voice notes anytime.
                    </p>
                  </div>
                </div>

                <div style={{
                  fontSize: 12,
                  color: "rgba(250,248,245,0.55)",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  paddingTop: 6,
                }}>
                  <span style={{ color: "#5ae08a" }}>✓</span> 100% Private · Zero spam · Enter your email in the composer.
                </div>
              </div>
            </div>
          </div>

          {/* ── SLIDE 6: THE MUSE AI ASSISTANT & TRACKING ── */}
          <div style={{
            flex: "0 0 100%",
            minWidth: "100%",
            scrollSnapAlign: "start",
            boxSizing: "border-box",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 28,
            alignItems: "stretch",
          }}>
            {/* CARD 1: THE MUSE AI WRITING ASSISTANT */}
            <div style={{
              background: "linear-gradient(145deg, rgba(28, 10, 18, 0.88) 0%, rgba(16, 5, 11, 0.95) 100%)",
              border: "1px solid rgba(212, 165, 116, 0.25)",
              borderRadius: 20,
              padding: "32px 28px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxShadow: "0 16px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
            }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: "50%",
                    background: "radial-gradient(circle at 35% 30%, #8b1824 0%, #4a0d14 100%)",
                    border: "1px solid rgba(212,165,116,0.4)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 22,
                  }}>
                    ✨
                  </div>
                  <span style={{
                    fontSize: 11.5, color: "#d4a574",
                    background: "rgba(212,165,116,0.12)",
                    border: "1px solid rgba(212,165,116,0.25)",
                    padding: "4px 12px", borderRadius: 20, fontWeight: 700, letterSpacing: "0.05em",
                  }}>
                    AI WRITING COMPANION
                  </span>
                </div>

                <h3 style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: 24, fontWeight: 600, color: "#faf8f5", margin: "0 0 10px",
                }}>
                  The Muse (AI Assistant)
                </h3>
                <p style={{ fontSize: 14.5, color: "rgba(250,248,245,0.72)", lineHeight: 1.6, margin: "0 0 22px" }}>
                  Find the right words when emotion runs deep. 1-tap heartfelt starters, text polishing, and dynamic title generation that sounds genuinely human.
                </p>

                <div style={{
                  background: "rgba(8, 2, 6, 0.75)",
                  border: "1px solid rgba(212,165,116,0.2)",
                  borderRadius: 14,
                  padding: "16px 18px",
                  marginBottom: 20,
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#d4a574", fontWeight: 700 }}>
                      ✦ Live Generation Example
                    </span>
                    <span style={{ fontSize: 11.5, color: "rgba(250,248,245,0.45)" }}>Prompt: &quot;miss our cricket matches&quot;</span>
                  </div>
                  <div style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 15,
                    fontWeight: 600,
                    color: "#d4a574",
                    marginBottom: 6,
                  }}>
                    Title: &ldquo;Missing Match Days&rdquo;
                  </div>
                  <p style={{
                    fontSize: 13.5,
                    color: "rgba(250,248,245,0.85)",
                    fontFamily: "Georgia, serif",
                    fontStyle: "italic",
                    lineHeight: 1.55,
                    margin: 0,
                  }}>
                    &ldquo;I often think about the fun times we had watching cricket together, and it&apos;s just not the same without you. I really miss our discussions and the laughter we shared.&rdquo;
                  </p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    { icon: "💡", title: "Emotionally Intelligent Starters", text: "Turns raw notes into heartfelt handwriting without clichés." },
                    { icon: "🏷️", title: "Context-Aware Titles", text: "Synthesizes creative, matching letter titles for your exact memories." },
                    { icon: "✍️", title: "Polish & Finish Thoughts", text: "Refines messy drafts while preserving your authentic voice." },
                  ].map(item => (
                    <div key={item.title} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <span style={{ fontSize: 15, lineHeight: 1.3 }}>{item.icon}</span>
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 600, color: "#faf8f5" }}>{item.title}</div>
                        <div style={{ fontSize: 12.5, color: "rgba(250,248,245,0.55)", lineHeight: 1.4 }}>{item.text}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 24, paddingTop: 18, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <Link href="/create" style={{
                  color: "#d4a574", fontSize: 13.5, fontWeight: 600, textDecoration: "none",
                  display: "inline-flex", alignItems: "center", gap: 6,
                }}>
                  Try The Muse in Composer →
                </Link>
              </div>
            </div>

            {/* CARD 2: LIVE DELIVERY & MULTI-DEVICE TRACKING */}
            <div style={{
              background: "linear-gradient(145deg, rgba(28, 10, 18, 0.88) 0%, rgba(16, 5, 11, 0.95) 100%)",
              border: "1px solid rgba(228, 32, 56, 0.28)",
              borderRadius: 20,
              padding: "32px 28px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxShadow: "0 16px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
            }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: "50%",
                    background: "radial-gradient(circle at 35% 30%, #ff2b47 0%, #8b1824 100%)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 22,
                  }}>
                    📱
                  </div>
                  <span style={{
                    fontSize: 11.5, color: "#5ae08a",
                    background: "rgba(40,160,80,0.15)",
                    border: "1px solid rgba(70,210,110,0.35)",
                    padding: "4px 12px", borderRadius: 20, fontWeight: 700, letterSpacing: "0.05em",
                  }}>
                    LIVE DASHBOARD
                  </span>
                </div>

                <h3 style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: 24, fontWeight: 600, color: "#faf8f5", margin: "0 0 10px",
                }}>
                  Real-Time Multi-Device Tracking
                </h3>
                <p style={{ fontSize: 14.5, color: "rgba(250,248,245,0.72)", lineHeight: 1.6, margin: "0 0 22px" }}>
                  Every letter gets a private management dashboard. Know the exact moment they broke the wax seal and how many times they returned to re-read.
                </p>

                <div style={{
                  background: "rgba(8, 2, 6, 0.75)",
                  border: "1px solid rgba(228, 32, 56, 0.25)",
                  borderRadius: 14,
                  padding: "16px 18px",
                  marginBottom: 20,
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#faf8f5" }}>Live Milestone Status</span>
                    <span style={{ fontSize: 11, color: "#5ae08a", background: "rgba(40,160,80,0.2)", padding: "2px 8px", borderRadius: 10, fontWeight: 600 }}>
                      ● Unsealed &amp; Read
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                    <div style={{ background: "rgba(255,255,255,0.03)", padding: "10px 12px", borderRadius: 8 }}>
                      <div style={{ fontSize: 11, color: "rgba(250,248,245,0.5)" }}>Total Unseals</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: "#faf8f5", fontFamily: "monospace" }}>3 times</div>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.03)", padding: "10px 12px", borderRadius: 8 }}>
                      <div style={{ fontSize: 11, color: "rgba(250,248,245,0.5)" }}>Device</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: "#faf8f5" }}>iPhone 15</div>
                    </div>
                  </div>

                  <div style={{ fontSize: 11.5, color: "rgba(250,248,245,0.45)", fontStyle: "italic" }}>
                    First unsealed 2 hours ago · Re-opened 14 mins ago
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ fontSize: 12.5, color: "rgba(250,248,245,0.7)", display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ color: "#5ae08a" }}>✓</span> <strong>Device Detection:</strong> Tells you if opened on mobile, tablet, or laptop.
                  </div>
                  <div style={{ fontSize: 12.5, color: "rgba(250,248,245,0.7)", display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ color: "#5ae08a" }}>✓</span> <strong>Anti-Spam Unique Readers:</strong> Counts genuine readers without page reload inflation.
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 24, paddingTop: 18, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <Link href="/create" style={{
                  color: "#ff2b47", fontSize: 13.5, fontWeight: 600, textDecoration: "none",
                  display: "inline-flex", alignItems: "center", gap: 6,
                }}>
                  Compose &amp; Track Your First Letter →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Fast-Jump Dots Indicator */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          marginTop: 18,
        }}>
          {CAROUSEL_SLIDES.map((slide, idx) => {
            const isActive = activeSlide === idx;
            return (
              <button
                key={slide.id}
                type="button"
                onClick={() => scrollToSlide(idx)}
                style={{
                  width: isActive ? 28 : 8,
                  height: 8,
                  borderRadius: 4,
                  background: isActive ? "#d4a574" : "rgba(255, 255, 255, 0.2)",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                  boxShadow: isActive ? "0 0 10px rgba(212,165,116,0.6)" : "none",
                }}
                title={slide.label}
              />
            );
          })}
        </div>

        {/* Global CTA button below carousel */}
        <div style={{ textAlign: "center", marginTop: 36 }}>
          <Link
            href="/create"
            className="hero-compose-btn"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "13px 32px",
              fontSize: 16,
              fontWeight: 600,
            }}
          >
            Begin Your Letter Now →
          </Link>
        </div>
      </section>

      {/* ── FAQ ACCORDION ────────────────────────────────── */}
      <section className="faq-section">
        <h2 className="faq-title">Frequently Asked Questions</h2>
        <div className="ornament" style={{ maxWidth: 200, margin: "12px auto 0" }}>
          <span className="ornament-icon">🔏</span>
        </div>
        <FaqAccordion faqs={FAQS} />
      </section>

      {/* ── FINAL CTA ───────────────────────────────────── */}
      <section className="final-cta">
        <div className="ornament" style={{ maxWidth: 180, margin: "0 auto 32px" }}>
          <span className="ornament-icon">♥</span>
        </div>
        <h2 className="final-cta-title">The Hour Grows Late</h2>
        <p className="final-cta-subtitle">
          Some words are too important to leave unsaid. Will you let another moment pass in silence?
        </p>
        <Link href="/create" className="hero-compose-btn">
          Begin Your Letter
        </Link>
        <p className="final-cta-fine">Every Moment Deserves Words</p>
        <div className="ornament" style={{ maxWidth: 180, margin: "40px auto 0" }}>
          <span className="ornament-icon">🔏</span>
        </div>
      </section>

      <Footer />
    </div>
  );
}
