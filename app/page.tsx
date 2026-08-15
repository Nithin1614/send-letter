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
    title: "Vesane O Nicchena",
    artist: "Kapil Kapilan & Sameera Bharadwaj",
    genre: "Rowdy Boys",
    artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/49/0d/57/490d57b2-6e41-77cd-eddc-f08b834d280e/cover.jpg/600x600bb.jpg",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview126/v4/8e/3c/a5/8e3ca572-6226-9bde-da25-324feaf9a626/mzaf_11537944106324637192.plus.aac.p.m4a",
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
    }
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);

    if (track.previewUrl) {
      const audio = new Audio(track.previewUrl);
      audioRef.current = audio;
      fadeInAudio(audio, 0.50, 1500);
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
  { q: "Will my crush fall in love with me after opening this?", a: "We can't legally guarantee love, but it definitely works better than overthinking a two-word text for four hours." },
  { q: "What if they open it while sitting next to their friends?", a: "Their friends will either be jealous and wish someone wrote them letters, or tease them about it. Either way, you will definitely stand out." },
  { q: "What if I pour my soul out and they reply with just ‘lol’?", a: "That is an unforgivable violation of basic human decency. Our servers will automatically dispatch negative cosmic energy to their IP address." },
  { q: "Do I have to be in a romantic mood to write one?", a: "You can be lying upside down on your bed questioning your life choices. The vintage paper grain and cursive ink will do 90% of the emotional heavy lifting for you." },
  { q: "What if I regret sending it at 3 AM?", a: "Every letter gives you a private Secret Management Link. You can hit 'Self-Destruct' and vaporize the letter, photo, and voice notes from existence before they even wake up." },
  { q: "Can they screenshot my letter?", a: "Yes, but we gave them a 1-tap 'Download Framed Keepsake' button so their screenshot at least looks like a museum piece instead of a low-res mess." },
  { q: "Will they know I spent 45 minutes rewriting a 3-sentence letter?", a: "Your secret is safe with us. To them, it will appear as effortlessly penned poetry written under the moonlight in 30 seconds." },
  { q: "How does Send Letter work?", a: "Send Letter is the digital platform for sealed letters. Write a message for a specific moment — an anniversary, a bad day, a milestone — seal it with a virtual wax stamp, set a guardian question, and share the link. Recipients must answer the question and hold to break the seal. No account needed." },
  { q: "Is Send Letter free to use?", a: "Yes, Send Letter is completely free. No subscription, no hidden fees, no payment required. Create unlimited sealed messages at no cost." },
  { q: "Do I need to create an account?", a: "No account required. Simply visit Send Letter, compose your message, and share the link. No registration, no login, no personal information needed." },
  { q: "What is the wax seal unsealing ritual?", a: "The unsealing ritual requires recipients to hold their finger on the wax seal until it breaks. This creates an intentional, meaningful moment of revelation." },
  { q: "Can recipients read messages without answering the question?", a: "No. Recipients must correctly answer the guardian question before they can access the unsealing ritual. Wrong answers prevent access." },
  { q: "How secure are my messages?", a: "Messages are protected by guardian questions and encryption. Only the holder of the management link or recipient link can access the letter." },
  { q: "Can I send anonymous messages?", a: "Yes. You can choose to sign your message or remain anonymous. The signature field is optional." },
  { q: "How long do messages last?", a: "Messages are persistent and stored securely in our database. You can manage, track, or permanently self-destruct your letter anytime using your private management link." },
  { q: "How do I confess to my crush without being awkward?", a: "We can't legally guarantee love, but it works way better than accidentally liking their 3-year-old photo at 2 AM." },
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

export default function HomePage() {
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

      {/* ── EXCLUSIVE FEATURES: THE MUSE AI & LIVE MULTI-DEVICE TRACKING ── */}
      <section style={{
        maxWidth: 1120,
        margin: "0 auto",
        padding: "60px 20px 80px",
        position: "relative",
        zIndex: 1,
      }}>
        {/* Section Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
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
            <span>✦</span> INTELLIGENT WRITING & LIVE DELIVERY
          </div>
          <h2 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "clamp(26px, 4.5vw, 38px)",
            fontWeight: 600,
            color: "#faf8f5",
            margin: "0 0 14px",
            lineHeight: 1.25,
            letterSpacing: "0.01em",
          }}>
            Crafted with Emotion. Tracked with Precision.
          </h2>
          <p style={{
            fontSize: "clamp(14px, 2.5vw, 16.5px)",
            color: "rgba(250,248,245,0.7)",
            maxWidth: 620,
            margin: "0 auto",
            lineHeight: 1.6,
          }}>
            From meaningful words composed with our AI assistant to real-time unseal receipts and multi-device milestone intelligence.
          </p>
        </div>

        {/* 2-Column Feature Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 28,
          alignItems: "stretch",
        }}>

          {/* ── CARD 1: THE MUSE AI WRITING ASSISTANT ── */}
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
              {/* Badge & Icon */}
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

              {/* Interactive AI Preview Box */}
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

              {/* Feature Points */}
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

          {/* ── CARD 2: LIVE DELIVERY & MULTI-DEVICE TRACKING ── */}
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
              {/* Badge & Icon */}
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
                Live Delivery &amp; Multi-Device Tracking
              </h3>
              <p style={{ fontSize: 14.5, color: "rgba(250,248,245,0.72)", lineHeight: 1.6, margin: "0 0 18px" }}>
                Know the exact second your words are read. Real-time unseal receipts, anti-spam unique device counting, and shared link detection.
              </p>

              {/* Realistic Visual Stats Grid Showcase */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 8,
                marginBottom: 16,
              }}>
                <div style={{
                  background: "rgba(10, 4, 8, 0.75)",
                  border: "1px solid rgba(212,165,116,0.18)",
                  borderRadius: 10,
                  padding: "10px 8px",
                  textAlign: "center",
                }}>
                  <div style={{ fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(212,165,116,0.7)" }}>🔒 SEAL</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#5ae08a", marginTop: 2 }}>Opened</div>
                  <div style={{ fontSize: 10.5, color: "rgba(250,248,245,0.45)", marginTop: 2 }}>Live status</div>
                </div>

                <div style={{
                  background: "rgba(10, 4, 8, 0.75)",
                  border: "1px solid rgba(212,165,116,0.18)",
                  borderRadius: 10,
                  padding: "10px 8px",
                  textAlign: "center",
                }}>
                  <div style={{ fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(212,165,116,0.7)" }}>👁 READERS</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#faf8f5", marginTop: 2 }}>1 Device</div>
                  <div style={{ fontSize: 10.5, color: "rgba(250,248,245,0.45)", marginTop: 2 }}>Re-read 3x</div>
                </div>

                <div style={{
                  background: "rgba(10, 4, 8, 0.75)",
                  border: "1px solid rgba(212,165,116,0.18)",
                  borderRadius: 10,
                  padding: "10px 8px",
                  textAlign: "center",
                }}>
                  <div style={{ fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(212,165,116,0.7)" }}>🛡 ATTEMPTS</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#faf8f5", marginTop: 2 }}>0</div>
                  <div style={{ fontSize: 10.5, color: "rgba(250,248,245,0.45)", marginTop: 2 }}>Guarded</div>
                </div>

                <div style={{
                  background: "rgba(10, 4, 8, 0.75)",
                  border: "1px solid rgba(212,165,116,0.18)",
                  borderRadius: 10,
                  padding: "10px 8px",
                  textAlign: "center",
                }}>
                  <div style={{ fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(212,165,116,0.7)" }}>💖 REACTION</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#ff2b47", marginTop: 2 }}>❤️</div>
                  <div style={{ fontSize: 10.5, color: "rgba(250,248,245,0.45)", marginTop: 2 }}>Loved it</div>
                </div>
              </div>

              {/* Realistic Activity Timeline Mini-Log */}
              <div style={{
                background: "rgba(8, 2, 6, 0.75)",
                border: "1px solid rgba(228,32,56,0.2)",
                borderRadius: 12,
                padding: "12px 14px",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
                  <span style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#d4a574", fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}>
                    <span>📜</span> Letter Activity Timeline
                  </span>
                  <span style={{ fontSize: 10.5, color: "#5ae08a", display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#5ae08a", display: "inline-block" }} />
                    Auto-syncing
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}>
                  <span style={{ color: "#d4a574" }}>✦</span>
                  <span style={{ color: "#faf8f5", fontWeight: 600 }}>Letter sealed &amp; created</span>
                  <span style={{ color: "rgba(250,248,245,0.4)", marginLeft: "auto", fontSize: 11 }}>10:24 PM</span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}>
                  <span style={{ color: "#38bdf8" }}>📱</span>
                  <span style={{ color: "#faf8f5", fontWeight: 600 }}>Letter opened on iPhone</span>
                  <span style={{ color: "rgba(250,248,245,0.4)", marginLeft: "auto", fontSize: 11 }}>10:28 PM</span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}>
                  <span style={{ color: "#5ae08a" }}>💌</span>
                  <span style={{ color: "#5ae08a", fontWeight: 600 }}>Wax seal broken &amp; read</span>
                  <span style={{ color: "rgba(250,248,245,0.4)", marginLeft: "auto", fontSize: 11 }}>10:29 PM</span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}>
                  <span style={{ color: "#f59e0b" }}>🔗</span>
                  <span style={{ color: "#faf8f5", fontWeight: 600 }}>Opened on new device (Mac)</span>
                  <span style={{ color: "rgba(250,248,245,0.4)", marginLeft: "auto", fontSize: 11 }}>10:35 PM</span>
                </div>
              </div>

              {/* Bullet highlights */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
                <div style={{ fontSize: 12.5, color: "rgba(250,248,245,0.7)", display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ color: "#5ae08a" }}>✓</span> <strong>Instant Unseal Receipts:</strong> Email alert the exact second the wax seal is broken (when you provide an email and enable alerts).
                </div>
                <div style={{ fontSize: 12.5, color: "rgba(250,248,245,0.7)", display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ color: "#5ae08a" }}>✓</span> <strong>Device Intelligence:</strong> Detects iPhone, Android, Mac, or Windows PC opens.
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

        {/* ── FLAGSHIP SONG SELECTION & SOUNDTRACK SHOWCASE ── */}
        <LandingMusicShowcase />

        {/* ── REAL-TIME EMAIL INTELLIGENCE & INSTANT ALERTS SHOWCASE ── */}
        <div style={{
          background: "linear-gradient(145deg, rgba(28, 10, 18, 0.92) 0%, rgba(14, 4, 10, 0.96) 100%)",
          border: "1px solid rgba(212, 165, 116, 0.28)",
          borderRadius: 20,
          padding: "36px 30px",
          marginTop: 32,
          boxShadow: "0 16px 44px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Subtle gold / red ambient glow */}
          <div style={{
            position: "absolute", top: -50, right: -50, width: 260, height: 260,
            background: "radial-gradient(circle, rgba(196,30,58,0.15) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />

          {/* Section Header */}
          <div style={{ marginBottom: 30 }}>
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

          {/* 2-Column Showcase: Left Live Inbox Simulation / Right Alert Features Grid */}
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

              {/* Simulated Notification 1: Seal Broken */}
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

              {/* Simulated Notification 2: Reaction Received */}
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

              {/* Simulated Notification 3: Secret Reply Sealed */}
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

              {/* Simulated Notification 4: Shared Link / 2nd Device */}
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

            {/* Right: The 4 Core Email Alert Features */}
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 14 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {/* Feature 1 */}
                <div style={{
                  background: "rgba(10, 3, 7, 0.6)",
                  border: "1px solid rgba(212,165,116,0.18)",
                  borderRadius: 14,
                  padding: "16px 18px",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ color: "#d4a574", fontSize: 14 }}>⚡</span>
                    <h4 style={{ fontSize: 15, fontWeight: 700, color: "#faf8f5", margin: 0 }}>
                      Instant Unseal Receipts
                    </h4>
                  </div>
                  <p style={{ fontSize: 13, color: "rgba(250,248,245,0.7)", margin: 0, lineHeight: 1.45 }}>
                    Sent the exact second the wax seal is broken. Pinpoints whether opened on <strong style={{ color: "#d4a574" }}>iPhone, Android, Mac, or PC</strong>.
                  </p>
                </div>

                {/* Feature 2 */}
                <div style={{
                  background: "rgba(10, 3, 7, 0.6)",
                  border: "1px solid rgba(212,165,116,0.18)",
                  borderRadius: 14,
                  padding: "16px 18px",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ color: "#f472b6", fontSize: 14 }}>💖</span>
                    <h4 style={{ fontSize: 15, fontWeight: 700, color: "#faf8f5", margin: 0 }}>
                      Heartfelt Reaction Alerts
                    </h4>
                  </div>
                  <p style={{ fontSize: 13, color: "rgba(250,248,245,0.7)", margin: 0, lineHeight: 1.45 }}>
                    Discover how they felt in real time when they tap emotional reactions after reading your words.
                  </p>
                </div>

                {/* Feature 3 */}
                <div style={{
                  background: "rgba(10, 3, 7, 0.6)",
                  border: "1px solid rgba(212,165,116,0.18)",
                  borderRadius: 14,
                  padding: "16px 18px",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ color: "#5ae08a", fontSize: 14 }}>📬</span>
                    <h4 style={{ fontSize: 15, fontWeight: 700, color: "#faf8f5", margin: 0 }}>
                      Two-Way Secret Reply Delivery
                    </h4>
                  </div>
                  <p style={{ fontSize: 13, color: "rgba(250,248,245,0.7)", margin: 0, lineHeight: 1.45 }}>
                    When your recipient writes and seals a response, you get an immediate email with a direct unseal link.
                  </p>
                </div>

                {/* Feature 4 */}
                <div style={{
                  background: "rgba(10, 3, 7, 0.6)",
                  border: "1px solid rgba(212,165,116,0.18)",
                  borderRadius: 14,
                  padding: "16px 18px",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ color: "#60a5fa", fontSize: 14 }}>🔗</span>
                    <h4 style={{ fontSize: 15, fontWeight: 700, color: "#faf8f5", margin: 0 }}>
                      Shared Link &amp; Multi-Device Alerts
                    </h4>
                  </div>
                  <p style={{ fontSize: 13, color: "rgba(250,248,245,0.7)", margin: 0, lineHeight: 1.45 }}>
                    Alerts you if the private link is re-opened on a secondary computer, phone, or forwarded to someone else.
                  </p>
                </div>

                {/* Feature 5: Self-Destruct Killswitch */}
                <div style={{
                  background: "rgba(10, 3, 7, 0.6)",
                  border: "1px solid rgba(228,32,56,0.22)",
                  borderRadius: 14,
                  padding: "16px 18px",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ color: "#ff6b7d", fontSize: 14 }}>🔥</span>
                    <h4 style={{ fontSize: 15, fontWeight: 700, color: "#faf8f5", margin: 0 }}>
                      1-Tap Self-Destruct Killswitch
                    </h4>
                  </div>
                  <p style={{ fontSize: 13, color: "rgba(250,248,245,0.7)", margin: 0, lineHeight: 1.45 }}>
                    Changed your mind? Use the private link sent to your email to permanently vaporize your letter, photos, and voice notes anytime.
                  </p>
                </div>
              </div>

              {/* Privacy / Opt-in reassurance footer */}
              <div style={{
                fontSize: 12,
                color: "rgba(250,248,245,0.55)",
                display: "flex",
                alignItems: "center",
                gap: 6,
                paddingTop: 8,
              }}>
                <span style={{ color: "#5ae08a" }}>✓</span> 100% Private · 1-Tap Self-Destruct · Zero spam · No passwords required — simply enter your email in the composer.
              </div>
            </div>

          </div>
        </div>

        {/* ── TANGIBLE KEEPSAKES & PHYSICAL/DIGITAL EXPORTS SHOWCASE ── */}
        <div style={{
          background: "linear-gradient(145deg, rgba(28, 10, 18, 0.92) 0%, rgba(14, 4, 10, 0.96) 100%)",
          border: "1px solid rgba(212, 165, 116, 0.28)",
          borderRadius: 20,
          padding: "36px 30px",
          marginTop: 32,
          boxShadow: "0 16px 44px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Subtle amber ambient glow */}
          <div style={{
            position: "absolute", top: -40, left: -40, width: 260, height: 260,
            background: "radial-gradient(circle, rgba(212,165,116,0.15) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />

          {/* Section Header */}
          <div style={{ marginBottom: 32 }}>
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

          {/* 2-Column Showcase */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))",
            gap: 32,
            alignItems: "center",
          }}>

            {/* Left: Realistic Vintage Polaroid Keepsake (SSR Demo) */}
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
              {/* Top Tag */}
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

              {/* Tilted Vintage Polaroid Frame */}
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
                transition: "transform 0.3s ease",
              }}>
                {/* Washi tape visual accent at top */}
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

                {/* Photo */}
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

                {/* Handwritten cursive caption */}
                <div style={{
                  fontFamily: "'Dancing Script', cursive",
                  fontSize: 18,
                  color: "#3a2d24",
                  marginTop: 12,
                  textAlign: "center",
                  fontWeight: 600,
                  letterSpacing: "0.02em",
                }}>
                  “A photo that says what words can't”
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

              {/* Feature 1: Framed Keepsake Card PNG */}
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

              {/* Feature 2: Printable Foldable Origami Envelope PDF */}
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

              {/* Feature 3: 1-Tap Photo Attachment in Composer */}
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

        {/* ── ARTISAN ENVELOPES & PAPER THEMES SHOWCASE (SOLO CREATOR'S ATELIER) ── */}
        <div style={{
          background: "linear-gradient(145deg, rgba(24, 9, 16, 0.94) 0%, rgba(12, 3, 8, 0.98) 100%)",
          border: "1px solid rgba(212, 165, 116, 0.28)",
          borderRadius: 20,
          padding: "38px 30px",
          marginTop: 32,
          boxShadow: "0 16px 44px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Ambient lighting glow */}
          <div style={{
            position: "absolute", top: -30, right: -30, width: 280, height: 280,
            background: "radial-gradient(circle, rgba(196, 30, 58, 0.15) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />

          {/* Header */}
          <div style={{ marginBottom: 32 }}>
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
              <span>✦</span> SOLO CREATOR&apos;S STUDIO
            </div>
            <h3 style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "clamp(24px, 4vw, 32px)",
              fontWeight: 600,
              color: "#faf8f5",
              margin: "0 0 10px",
              lineHeight: 1.25,
            }}>
              Lost An Unreasonable Amount of Sleep Over These Envelopes.
            </h3>
            <p style={{
              fontSize: 14.5,
              color: "rgba(250,248,245,0.75)",
              maxWidth: 740,
              lineHeight: 1.6,
              margin: 0,
            }}>
              I hand-crafted this entire stationery collection from scratch because an intimate letter shouldn&apos;t look like a boring chat bubble. Every 3D wax drip, linen texture, and ribbon was tuned by hand so opening your letter feels like a slow, unforgettable ritual.
            </p>
          </div>

          {/* 2-Column Grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))",
            gap: 24,
          }}>

            {/* Column 1: 8 Handcrafted Envelope Styles */}
            <div style={{
              background: "rgba(10, 3, 7, 0.7)",
              border: "1px solid rgba(212,165,116,0.2)",
              borderRadius: 16,
              padding: "22px 20px",
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 20 }}>💌</span>
                  <h4 style={{ fontSize: 16, fontWeight: 700, color: "#faf8f5", margin: 0 }}>
                    8 Bespoke Envelope Rituals
                  </h4>
                </div>
                <span style={{
                  fontSize: 11, color: "#d4a574",
                  background: "rgba(212,165,116,0.12)",
                  border: "1px solid rgba(212,165,116,0.25)",
                  padding: "2px 8px", borderRadius: 10, fontWeight: 600,
                }}>
                  Interactive Wax Seals
                </span>
              </div>

              {/* Envelope Showcase Chips Grid (Clean, compact, no clutter) */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 10,
              }}>
                {[
                  { name: "Classic Wax Seal", icon: "🕯️" },
                  { name: "Twine & Botanical", icon: "🌿" },
                  { name: "Gold Wax Drip", icon: "✨" },
                  { name: "Silk Ribbon", icon: "🎀" },
                  { name: "Vintage Crest", icon: "👑" },
                  { name: "Floral Washi", icon: "🌸" },
                  { name: "Lace & Pearl", icon: "🦪" },
                  { name: "Velvet & Tassel", icon: "🧵" },
                ].map((env) => (
                  <div
                    key={env.name}
                    style={{
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid rgba(212, 165, 116, 0.16)",
                      borderRadius: 10,
                      padding: "10px 12px",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <span style={{ fontSize: 15 }}>{env.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#faf8f5" }}>{env.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2: 9 Tactile Paper Canvases & Atmospheric Themes */}
            <div style={{
              background: "rgba(10, 3, 7, 0.7)",
              border: "1px solid rgba(212,165,116,0.2)",
              borderRadius: 16,
              padding: "22px 20px",
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 20 }}>📜</span>
                  <h4 style={{ fontSize: 16, fontWeight: 700, color: "#faf8f5", margin: 0 }}>
                    9 Tactile Stationery Canvases
                  </h4>
                </div>
                <span style={{
                  fontSize: 11, color: "#5ae08a",
                  background: "rgba(40,160,80,0.18)",
                  border: "1px solid rgba(70,210,110,0.3)",
                  padding: "2px 8px", borderRadius: 10, fontWeight: 600,
                }}>
                  Real Paper Grain
                </span>
              </div>

              {/* Themes Breakdown (Clean 3-card layout) */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {/* Paper Textures */}
                <div style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(212, 165, 116, 0.16)",
                  borderRadius: 10,
                  padding: "11px 14px",
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#d4a574", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 3 }}>
                    Archival Paper Textures
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#faf8f5" }}>
                    Soft Handmade Cotton · Crisp French Linen · Aged Parchment
                  </div>
                </div>

                {/* Atmospheric Lighting */}
                <div style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(212, 165, 116, 0.16)",
                  borderRadius: 10,
                  padding: "11px 14px",
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#d4a574", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 3 }}>
                    Velvet Lighting &amp; Gradients
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#faf8f5" }}>
                    Classic Burgundy · Sunset Dusk · Velvet Aurora
                  </div>
                </div>

                {/* Intimate Motifs */}
                <div style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(212, 165, 116, 0.16)",
                  borderRadius: 10,
                  padding: "11px 14px",
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#d4a574", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 3 }}>
                    Intimate Hand-Drawn Motifs
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#faf8f5" }}>
                    Midnight Constellations · Falling Petals · Heirloom Wild Roses
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Playful Solo Creator Badge Footer */}
          <div style={{
            marginTop: 24,
            paddingTop: 16,
            borderTop: "1px solid rgba(212,165,116,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            fontSize: 12.5,
            color: "rgba(212,165,116,0.9)",
            fontStyle: "italic",
          }}>
            ✦ My sleep schedule died so your most meaningful words don&apos;t have to live in a plain text message.
          </div>
        </div>

        {/* ── EXCLUSIVE RITUALS & PRIVACY VAULT (GUARDIAN, TIMELOCK, REPLIES) ── */}
        <div style={{ marginTop: 48 }}>
          {/* Section Sub-Header */}
          <div style={{ textAlign: "center", marginBottom: 36 }}>
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

          {/* 3-Column Luxury Feature Cards */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 24,
            alignItems: "stretch",
          }}>

            {/* ── CARD 1: GUARDIAN QUESTION LOCK ── */}
            <div style={{
              background: "linear-gradient(145deg, rgba(28, 10, 18, 0.88) 0%, rgba(16, 5, 11, 0.95) 100%)",
              border: "1px solid rgba(212, 165, 116, 0.24)",
              borderRadius: 18,
              padding: "26px 22px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxShadow: "0 14px 36px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
            }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: "50%",
                    background: "radial-gradient(circle at 35% 30%, #8b1824 0%, #3e0b12 100%)",
                    border: "1px solid rgba(212,165,116,0.35)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18,
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
                  fontSize: 20, fontWeight: 600, color: "#faf8f5", margin: "0 0 8px",
                }}>
                  Secret Question Protection
                </h4>
                <p style={{ fontSize: 13.5, color: "rgba(250,248,245,0.7)", lineHeight: 1.5, margin: "0 0 16px" }}>
                  A lock only the two of you hold the key to. Guard your envelope behind a private question that only your recipient can solve.
                </p>

                {/* Visual Mockup Box */}
                <div style={{
                  background: "rgba(10, 3, 7, 0.75)",
                  border: "1px solid rgba(212,165,116,0.18)",
                  borderRadius: 12,
                  padding: "14px 14px",
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

              <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.06)", fontSize: 12.5, color: "rgba(250,248,245,0.6)" }}>
                🛡️ Failed attempts are logged live on your status dashboard.
              </div>
            </div>

            {/* ── CARD 2: TIME-LOCK VAULT ── */}
            <div style={{
              background: "linear-gradient(145deg, rgba(28, 10, 18, 0.88) 0%, rgba(16, 5, 11, 0.95) 100%)",
              border: "1px solid rgba(212, 165, 116, 0.24)",
              borderRadius: 18,
              padding: "26px 22px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxShadow: "0 14px 36px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
            }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: "50%",
                    background: "radial-gradient(circle at 35% 30%, #a16207 0%, #451a03 100%)",
                    border: "1px solid rgba(212,165,116,0.35)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18,
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
                  fontSize: 20, fontWeight: 600, color: "#faf8f5", margin: "0 0 8px",
                }}>
                  Scheduled Countdown Release
                </h4>
                <p style={{ fontSize: 13.5, color: "rgba(250,248,245,0.7)", lineHeight: 1.5, margin: "0 0 16px" }}>
                  Write it today. They unlock it on their special day. Lock your letter until a future birthday, anniversary, or milestone moment.
                </p>

                {/* Visual Mockup Box */}
                <div style={{
                  background: "rgba(10, 3, 7, 0.75)",
                  border: "1px solid rgba(212,165,116,0.18)",
                  borderRadius: 12,
                  padding: "14px 14px",
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

              <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.06)", fontSize: 12.5, color: "rgba(250,248,245,0.6)" }}>
                ⏰ Wax seal stays locked until the exact scheduled minute.
              </div>
            </div>

            {/* ── CARD 3: TWO-WAY SEALED REPLIES ── */}
            <div style={{
              background: "linear-gradient(145deg, rgba(28, 10, 18, 0.88) 0%, rgba(16, 5, 11, 0.95) 100%)",
              border: "1px solid rgba(212, 165, 116, 0.24)",
              borderRadius: 18,
              padding: "26px 22px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxShadow: "0 14px 36px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
            }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: "50%",
                    background: "radial-gradient(circle at 35% 30%, #047857 0%, #064e3b 100%)",
                    border: "1px solid rgba(70,210,110,0.35)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18,
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
                  fontSize: 20, fontWeight: 600, color: "#faf8f5", margin: "0 0 8px",
                }}>
                  Sealed Secret Responses
                </h4>
                <p style={{ fontSize: 13.5, color: "rgba(250,248,245,0.7)", lineHeight: 1.5, margin: "0 0 16px" }}>
                  Not a chat thread — an intimate exchange of sealed letters. Your recipient can write and wax-seal a secret reply back to you.
                </p>

                {/* Visual Mockup Box */}
                <div style={{
                  background: "rgba(10, 3, 7, 0.75)",
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

              <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.06)", fontSize: 12.5, color: "rgba(250,248,245,0.6)" }}>
                💌 Instant email notifications whenever a reply is sealed.
              </div>
            </div>

          </div>
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
