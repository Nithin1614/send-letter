'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// ─── Grounded, Authentic Letter Prompts ──────────────────────────────────────

export interface CuratedLetter {
  id: string;
  category: 'distance' | 'comfort' | 'milestones' | 'love' | 'future';
  categoryLabel: string;
  title: string;
  subtitle: string;
  excerpt: string;
  fullTemplate: string;
  signature: string;
  suggestedSong: {
    title: string;
    artist: string;
  };
  sealIcon: string;
  edition: string;
}

const CURATED_LETTERS: CuratedLetter[] = [
  // ─── DISTANCE & APART ───
  {
    id: 'dist-1',
    category: 'distance',
    categoryLabel: 'Distance',
    edition: '№ 01',
    title: 'For the Miles Between Us',
    subtitle: 'When the room feels a little too quiet without you.',
    excerpt:
      "The hardest part of missing you isn't the miles themselves—it's catching myself laughing at something silly, turning around to tell you, and realizing you're not sitting right there...",
    fullTemplate:
      "The hardest part of missing you isn't the miles themselves—it's catching myself laughing at something silly, turning around to tell you, and realizing you're not sitting right there.\n\nI know the distance gets exhausting, but every quiet night apart is just one day closer to when we don't have to count down airports and train tickets anymore.\n\nDrink some water, take a slow breath, and know you're carrying a huge piece of my heart with you today.",
    signature: 'holding your place next to me',
    suggestedSong: { title: 'Sunflower', artist: 'Post Malone & Swae Lee' },
    sealIcon: '🌙',
  },
  {
    id: 'dist-2',
    category: 'distance',
    categoryLabel: 'Distance',
    edition: '№ 02',
    title: 'The Quiet Morning After Goodbye',
    subtitle: 'For that strange, silent stillness after a visit ends.',
    excerpt:
      "The apartment always feels unnaturally quiet the morning after you leave. I keep looking at the other side of the couch, half-expecting to see your jacket tossed over the chair...",
    fullTemplate:
      "The apartment always feels unnaturally quiet the morning after you leave.\n\nI keep looking at the other side of the couch, half-expecting to see your jacket tossed over the chair. Saying goodbye never gets easier, but having someone this hard to say goodbye to is something I wouldn't trade for anything.\n\nDon't let today feel heavy. The next visit is already being planned. Have a safe journey, and text me when you settle in.",
    signature: 'already counting the hours',
    suggestedSong: { title: 'Until I Found You', artist: 'Stephen Sanchez' },
    sealIcon: '✈',
  },
  {
    id: 'dist-3',
    category: 'distance',
    categoryLabel: 'Distance',
    edition: '№ 03',
    title: "For 2 AM Thoughts That Won't Quiet Down",
    subtitle: 'When late-night overthinking starts getting the better of you.',
    excerpt:
      "If you're reading this in the dark staring at your ceiling, stop rewinding today's replay in your head. Nighttime has an unfair habit of magnifying every small worry...",
    fullTemplate:
      "If you're reading this in the dark staring at your ceiling, stop rewinding today's replay in your head.\n\nNighttime has an unfair habit of magnifying every small worry and making problems feel twice as big as they actually are. You don't have to solve your entire life, career, or tomorrow's schedule at 2 AM.\n\nPut your phone face down, close your eyes, and let yourself rest. Whatever is bothering you will look manageable once the sun comes up.\n\nSleep well. I'm right here in your corner.",
    signature: 'sweet dreams',
    suggestedSong: { title: 'Yellow', artist: 'Coldplay' },
    sealIcon: '✨',
  },

  // ─── HARD DAYS & COMFORT ───
  {
    id: 'comf-1',
    category: 'comfort',
    categoryLabel: 'Hard Days',
    edition: '№ 04',
    title: 'When the Day Demanded Too Much',
    subtitle: "Take off the armor. Tonight, you don't have to be strong.",
    excerpt:
      "Today asked far too much of you. You spent hours holding things together, keeping your composure, and carrying things nobody else even noticed...",
    fullTemplate:
      "Today asked far too much of you. You spent hours holding things together, keeping your composure, and carrying things nobody else even noticed.\n\nYou don't have to be productive tonight. You don't have to reply to non-urgent texts, and you don't have to pretend everything was fine. Change into your softest clothes, eat something that makes you happy, and let the day dissolve.\n\nYou survived today. That is more than enough.",
    signature: 'with you through every rough storm',
    suggestedSong: { title: 'Fix You', artist: 'Coldplay' },
    sealIcon: '🕯',
  },
  {
    id: 'comf-2',
    category: 'comfort',
    categoryLabel: 'Hard Days',
    edition: '№ 05',
    title: 'One Breath at a Time',
    subtitle: 'When your mind feels like a browser with 40 tabs open.',
    excerpt:
      "Stop trying to carry the whole week at once. When your chest feels tight and the to-do list feels endless, your only job is the next five minutes...",
    fullTemplate:
      "Stop trying to carry the whole week at once.\n\nWhen your chest feels tight and the to-do list feels endless, your only job is the next five minutes. Not the next month, not tomorrow afternoon—just this moment right here.\n\nUnclench your jaw, drop your shoulders away from your ears, and take one slow, deep breath. You have tackled overwhelming seasons before, and you made it through every single one of them.\n\nOne step at a time. You've got this.",
    signature: 'take a breath',
    suggestedSong: { title: 'Vienna', artist: 'Billy Joel' },
    sealIcon: '🕊',
  },
  {
    id: 'comf-3',
    category: 'comfort',
    categoryLabel: 'Hard Days',
    edition: '№ 06',
    title: 'A Gentle Reality Check',
    subtitle: 'For when you are being your own harshest critic.',
    excerpt:
      "If your best friend came to you carrying the exact same doubt you're carrying right now, you wouldn't criticize them—you'd remind them of how far they've come...",
    fullTemplate:
      "If your best friend came to you carrying the exact same doubt you're carrying right now, you wouldn't criticize them—you'd remind them of how far they've come and how much resilience they have.\n\nSo why are you being so tough on yourself?\n\nOne off day, one awkward conversation, or one stumble doesn't undo all your growth. You are learning in real time, and you're allowed to be human along the way. Be gentle with your heart today.",
    signature: 'your biggest believer',
    suggestedSong: { title: 'Night Trouble', artist: 'Petit Biscuit' },
    sealIcon: '🛡',
  },

  // ─── MILESTONES & CELEBRATIONS ───
  {
    id: 'mile-1',
    category: 'milestones',
    categoryLabel: 'Milestones',
    edition: '№ 07',
    title: 'Another Year of Being Unapologetically You',
    subtitle: 'A birthday celebration for someone who makes the world brighter.',
    excerpt:
      "Birthdays get so busy, but I wanted to make sure you take a quiet minute today to realize how deeply appreciated you are. You make ordinary days feel lighter...",
    fullTemplate:
      "Happy Birthday!\n\nBirthdays get so busy, but I wanted to make sure you take a quiet minute today to realize how deeply appreciated you are. You make ordinary days feel lighter just by being in the room.\n\nI hope this year brings you fewer compromises, more belly laughs, and every bit of peace you've been working so hard for.\n\nCelebrate tonight. You deserve every ounce of joy coming your way.",
    signature: 'cheering for you always',
    suggestedSong: { title: 'Golden Hour', artist: 'JVKE' },
    sealIcon: '🥂',
  },
  {
    id: 'mile-2',
    category: 'milestones',
    categoryLabel: 'Milestones',
    edition: '№ 08',
    title: 'Before You Walk Through Those Doors',
    subtitle: 'A boost of courage for your first day on the new journey.',
    excerpt:
      "Take a second right now before you walk inside or log on. It is completely natural to feel butterflies in your stomach this morning. But remember: they chose you for a reason...",
    fullTemplate:
      "Take a second right now before you walk inside or log on.\n\nIt is completely natural to feel butterflies in your stomach this morning. But remember: you didn't get this opportunity by accident. They saw your skill, your dedication, and your potential—and they chose you.\n\nYou don't need to know every system or answer on day one. Just show up, listen, smile, and trust your instincts.\n\nYou belong in that room. Go show them what you're made of.",
    signature: 'standing proudly behind you',
    suggestedSong: { title: 'Hall of Fame', artist: 'The Script' },
    sealIcon: '★',
  },
  {
    id: 'mile-3',
    category: 'milestones',
    categoryLabel: 'Milestones',
    edition: '№ 09',
    title: 'Raise a Glass to This Victory',
    subtitle: 'For the moment you finally crossed the finish line.',
    excerpt:
      "People only see the final trophy or the announcement, but I know how much quiet discipline and stress went into this behind the scenes...",
    fullTemplate:
      "You actually did it!\n\nPeople only see the final trophy or the announcement, but I know how much quiet discipline and stress went into this behind the scenes. You pushed through the moments where it felt thankless, and you made it happen on your own terms.\n\nDo not rush onto the next goal today. Pause, look back at where you started, and genuinely celebrate this milestone.\n\nI couldn't be prouder of you.",
    signature: 'celebrating you today',
    suggestedSong: { title: 'Celebration', artist: 'Kool & The Gang' },
    sealIcon: '🏆',
  },

  // ─── LOVE & APPRECIATION ───
  {
    id: 'love-1',
    category: 'love',
    categoryLabel: 'Love',
    edition: '№ 10',
    title: 'A Note for a Random Tuesday',
    subtitle: 'No birthday, no holiday—just a sudden reminder of how much you matter.',
    excerpt:
      "There is no special occasion today. No birthday to mark, no holiday on the calendar—just a regular day where you crossed my mind and made me smile...",
    fullTemplate:
      "There is no special occasion today. No birthday to mark, no holiday on the calendar—just a regular day where you crossed my mind and made me smile.\n\nWe often save our sweetest words for big celebrations, but I think the best time to tell someone they matter is on a random weekday afternoon.\n\nThank you for being the person you are, for the little habits that make you unique, and for making my life so much richer. Have a wonderful rest of your day.",
    signature: 'always loving you',
    suggestedSong: { title: 'Perfect', artist: 'Ed Sheeran' },
    sealIcon: '❤',
  },
  {
    id: 'love-2',
    category: 'love',
    categoryLabel: 'Love',
    edition: '№ 11',
    title: 'A Secret Smile Stashed in Your Pocket',
    subtitle: 'A little beam of sunlight when the afternoon drags on.',
    excerpt:
      "If your afternoon has been slow, draining, or frustrating, consider this letter a small pocket of good energy sent directly to your screen...",
    fullTemplate:
      "If your afternoon has been slow, draining, or frustrating, consider this letter a small pocket of good energy sent directly to your screen.\n\nThink of your favorite inside joke, picture the last time we laughed until our stomachs hurt, and remember that today is just a small chapter in a very good story.\n\nWrap up what you need to do, head home, and treat yourself to something nice tonight. Sending you the biggest hug.",
    signature: 'tucked in your pocket',
    suggestedSong: { title: 'All of Me', artist: 'John Legend' },
    sealIcon: '💌',
  },

  // ─── FUTURE LETTERS ───
  {
    id: 'fut-1',
    category: 'future',
    categoryLabel: 'Future',
    edition: '№ 12',
    title: 'A Time Capsule From Right Now',
    subtitle: 'To the person you will be 365 days from today.',
    excerpt:
      "I am sealing these words into a time capsule today, wondering where life will find you 365 days from now. Right now, there are questions we don't know the answers to...",
    fullTemplate:
      "I am sealing these words into a time capsule today, wondering where life will find you 365 days from now.\n\nRight now, as I write this, there are questions we don't know the answers to, challenges we're figuring out, and hopes we haven't reached yet. I hope that when you unseal this in a year, you look back and smile at how everything fell into place.\n\nWhatever changes and wherever the road takes you, I hope you are happy, healthy, and proud of the person you've become.",
    signature: 'sent from a year ago',
    suggestedSong: { title: 'A Thousand Years', artist: 'Christina Perri' },
    sealIcon: '⏳',
  },
];

const CATEGORY_PILLS = [
  { key: 'all', label: 'All Letters' },
  { key: 'distance', label: 'Distance' },
  { key: 'comfort', label: 'Hard Days' },
  { key: 'milestones', label: 'Milestones' },
  { key: 'love', label: 'Love' },
  { key: 'future', label: 'Future' },
];

export default function BrowseLettersPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [previewLetter, setPreviewLetter] = useState<CuratedLetter | null>(null);

  // Filtered Letters
  const filteredLetters = useMemo(() => {
    return CURATED_LETTERS.filter((letter) => {
      const matchCat = selectedCategory === 'all' || letter.category === selectedCategory;
      const matchQuery =
        !searchQuery.trim() ||
        letter.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        letter.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        letter.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [selectedCategory, searchQuery]);

  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);

  // Dynamic AI Random Prompt with Curated Fallback
  async function handleSurpriseMe() {
    setIsGeneratingPrompt(true);
    try {
      const res = await fetch('/api/ai/muse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'prompt_idea',
          customTopic: searchQuery.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (data.success && data.idea && data.idea.title && data.idea.message) {
        setPreviewLetter({
          id: 'ai-prompt-' + Date.now(),
          category: 'love',
          categoryLabel: 'Custom Idea',
          edition: '✦ New',
          title: data.idea.title,
          subtitle: 'Generated for your moment.',
          excerpt: data.idea.message.slice(0, 140) + '…',
          fullTemplate: data.idea.message,
          signature: data.idea.signature || 'with love',
          suggestedSong: { title: 'Sunflower', artist: 'Post Malone & Swae Lee' },
          sealIcon: '✨',
        });
        return;
      }
    } catch {}
    finally {
      setIsGeneratingPrompt(false);
    }

    // Curated Fallback
    const randomIndex = Math.floor(Math.random() * CURATED_LETTERS.length);
    setPreviewLetter(CURATED_LETTERS[randomIndex]);
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0606', color: '#faf8f5', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1, padding: '48px 24px 100px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        
        {/* ── HEADER & HERO ── */}
        <section style={{ textAlign: 'center', marginBottom: 44 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 14px',
              borderRadius: 20,
              background: 'rgba(212, 165, 116, 0.08)',
              border: '1px solid rgba(212, 165, 116, 0.2)',
              color: '#d4a574',
              fontSize: '0.78rem',
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginBottom: 16,
            }}
          >
            Letter Prompts & Ideas
          </div>

          <h1
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 'clamp(2.1rem, 4.5vw, 3.1rem)',
              fontWeight: 700,
              lineHeight: 1.2,
              color: '#faf8f5',
              maxWidth: 780,
              margin: '0 auto 14px',
            }}
          >
            Find the right words for the moments that matter.
          </h1>

          <p
            style={{
              fontFamily: "'Crimson Pro', Georgia, serif",
              fontSize: '1.2rem',
              color: 'rgba(250, 248, 245, 0.65)',
              maxWidth: 600,
              margin: '0 auto 28px',
              lineHeight: 1.55,
            }}
          >
            Ideas and templates for letters you can write, seal, and send. Pick any prompt to get started.
          </p>

          {/* Quick Actions */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 36 }}>
            <Link
              href="/create"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'linear-gradient(135deg, #c41e3a 0%, #8b1824 100%)',
                color: '#fff',
                padding: '12px 24px',
                borderRadius: 8,
                fontWeight: 600,
                fontSize: '0.92rem',
                textDecoration: 'none',
                boxShadow: '0 4px 16px rgba(196, 30, 58, 0.35)',
              }}
            >
              <span>✉</span> Write a Letter
            </Link>

            <button
              onClick={handleSurpriseMe}
              disabled={isGeneratingPrompt}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(212, 165, 116, 0.08)',
                border: '1px solid rgba(212, 165, 116, 0.25)',
                color: '#d4a574',
                padding: '12px 20px',
                borderRadius: 8,
                fontWeight: 600,
                fontSize: '0.92rem',
                cursor: isGeneratingPrompt ? 'not-allowed' : 'pointer',
                opacity: isGeneratingPrompt ? 0.7 : 1,
              }}
            >
              <span>✨</span> {isGeneratingPrompt ? 'Finding an idea...' : 'Random Prompt'}
            </button>
          </div>

          {/* Search */}
          <div style={{ maxWidth: 620, margin: '0 auto 24px', position: 'relative' }}>
            <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'rgba(250,248,245,0.4)', fontSize: 15 }}>
              🔍
            </span>
            <input
              type="text"
              placeholder="Search prompts (e.g. miss you, bad day, birthday, 2 AM)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '13px 18px 13px 44px',
                background: 'rgba(22, 10, 16, 0.7)',
                border: '1px solid rgba(212, 165, 116, 0.2)',
                borderRadius: 10,
                color: '#faf8f5',
                fontSize: '0.98rem',
                fontFamily: "'Crimson Pro', serif",
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Category Tabs */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
            {CATEGORY_PILLS.map((pill) => {
              const active = selectedCategory === pill.key;
              return (
                <button
                  key={pill.key}
                  onClick={() => setSelectedCategory(pill.key)}
                  style={{
                    padding: '7px 16px',
                    borderRadius: 20,
                    background: active ? 'rgba(212, 165, 116, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                    border: active ? '1px solid #d4a574' : '1px solid rgba(255, 255, 255, 0.08)',
                    color: active ? '#faf8f5' : 'rgba(250, 248, 245, 0.65)',
                    fontFamily: "'Crimson Pro', serif",
                    fontSize: '0.92rem',
                    fontWeight: active ? 600 : 400,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* ── LETTER CARDS GRID ── */}
        <section>
          {filteredLetters.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px 20px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 12, border: '1px dashed rgba(212, 165, 116, 0.2)' }}>
              <p style={{ color: 'rgba(250, 248, 245, 0.6)', fontFamily: "'Crimson Pro', serif", fontSize: '1.1rem', margin: 0 }}>
                No letters found. Try another search.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))',
                gap: 24,
              }}
            >
              {filteredLetters.map((letter) => (
                <div
                  key={letter.id}
                  style={{
                    background: '#fcf8f2',
                    borderRadius: 6,
                    border: '1px solid #c8b8a3',
                    boxShadow: '0 14px 36px rgba(0, 0, 0, 0.45)',
                    backgroundImage: 'radial-gradient(rgba(0, 0, 0, 0.035) 1px, transparent 1px)',
                    backgroundSize: '12px 12px',
                    padding: '26px 24px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxSizing: 'border-box',
                  }}
                >
                  {/* Top */}
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: '1px solid rgba(166, 149, 124, 0.35)',
                        paddingBottom: 8,
                        marginBottom: 14,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "'Playfair Display', Georgia, serif",
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: '#8a7561',
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                        }}
                      >
                        {letter.categoryLabel}
                      </span>
                      <span
                        style={{
                          fontFamily: "'Playfair Display', Georgia, serif",
                          fontSize: '0.8rem',
                          fontStyle: 'italic',
                          color: '#8a7561',
                        }}
                      >
                        {letter.edition}
                      </span>
                    </div>

                    {/* Title */}
                    <h2
                      style={{
                        fontFamily: "'Playfair Display', Georgia, serif",
                        fontSize: '1.22rem',
                        fontWeight: 700,
                        color: '#2a1e17',
                        lineHeight: 1.35,
                        marginBottom: 8,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {letter.title}
                    </h2>

                    {/* Subtitle / Excerpt */}
                    <p
                      style={{
                        fontFamily: "'Crimson Pro', Georgia, serif",
                        fontSize: '1.02rem',
                        lineHeight: 1.6,
                        color: '#3a2d24',
                        marginBottom: 16,
                      }}
                    >
                      “{letter.excerpt}”
                    </p>

                    {/* Music pairing */}
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        background: 'rgba(230, 218, 204, 0.65)',
                        padding: '4px 10px',
                        borderRadius: 12,
                        fontSize: '0.8rem',
                        color: '#4a3c30',
                        fontFamily: "'Crimson Pro', serif",
                        marginBottom: 14,
                      }}
                    >
                      <span>🎵</span>
                      <span>
                        {letter.suggestedSong.title} — {letter.suggestedSong.artist}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ borderTop: '1px solid rgba(166, 149, 124, 0.25)', paddingTop: 14, marginTop: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                      <button
                        onClick={() => setPreviewLetter(letter)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#8a7561',
                          fontFamily: "'Crimson Pro', serif",
                          fontSize: '0.9rem',
                          fontStyle: 'italic',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          padding: 0,
                        }}
                      >
                        Preview 👁
                      </button>

                      <Link
                        href={`/create?title=${encodeURIComponent(letter.title)}&message=${encodeURIComponent(letter.fullTemplate)}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          background: 'linear-gradient(135deg, #c41e3a 0%, #8b1824 100%)',
                          color: '#ffffff',
                          padding: '7px 16px',
                          borderRadius: 6,
                          fontSize: '0.86rem',
                          fontWeight: 600,
                          textDecoration: 'none',
                          boxShadow: '0 3px 10px rgba(196, 30, 58, 0.25)',
                        }}
                      >
                        Write Letter →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── LETTER PREVIEW MODAL ── */}
        {previewLetter && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(8px)',
              zIndex: 999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 16,
            }}
            onClick={() => setPreviewLetter(null)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: 560,
                maxHeight: '88vh',
                overflowY: 'auto',
                background: '#fcf8f2',
                borderRadius: 6,
                border: '1px solid #c8b8a3',
                boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8)',
                backgroundImage: 'radial-gradient(rgba(0, 0, 0, 0.035) 1px, transparent 1px)',
                backgroundSize: '12px 12px',
                padding: '32px 30px 26px',
                position: 'relative',
                boxSizing: 'border-box',
              }}
            >
              {/* Close Button */}
              <button
                onClick={() => setPreviewLetter(null)}
                style={{
                  position: 'absolute',
                  top: 14,
                  right: 16,
                  background: 'transparent',
                  border: 'none',
                  fontSize: '1.3rem',
                  color: '#8a7561',
                  cursor: 'pointer',
                  padding: 4,
                  lineHeight: 1,
                }}
              >
                ✕
              </button>

              {/* Header */}
              <div
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  color: '#2a1e17',
                  letterSpacing: '0.06em',
                  borderBottom: '1px solid rgba(166, 149, 124, 0.35)',
                  paddingBottom: 8,
                  marginBottom: 18,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  textTransform: 'uppercase',
                }}
              >
                <span>{previewLetter.title}</span>
                <span style={{ fontSize: '0.82rem', fontStyle: 'italic', color: '#8a7561', textTransform: 'none', fontWeight: 400 }}>
                  {previewLetter.edition}
                </span>
              </div>

              {/* Body Text */}
              <div
                style={{
                  fontFamily: "'Crimson Pro', Georgia, serif",
                  fontSize: '1.14rem',
                  lineHeight: 1.75,
                  color: '#3a2d24',
                  whiteSpace: 'pre-wrap',
                  marginBottom: 24,
                }}
              >
                {previewLetter.fullTemplate}
              </div>

              {/* Signature */}
              <div style={{ textAlign: 'right', marginBottom: 20 }}>
                <span
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: '1.18rem',
                    fontStyle: 'italic',
                    fontWeight: 600,
                    color: '#8b1820',
                  }}
                >
                  — {previewLetter.signature}
                </span>
              </div>

              {/* Music pairing */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'rgba(230, 218, 204, 0.65)',
                  padding: '7px 12px',
                  borderRadius: 12,
                  fontSize: '0.85rem',
                  color: '#4a3c30',
                  fontFamily: "'Crimson Pro', serif",
                  marginBottom: 20,
                }}
              >
                <span>🎵</span>
                <span>
                  Music: <strong>{previewLetter.suggestedSong.title}</strong> — {previewLetter.suggestedSong.artist}
                </span>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', borderTop: '1px solid rgba(166, 149, 124, 0.25)', paddingTop: 16 }}>
                <button
                  onClick={() => setPreviewLetter(null)}
                  style={{
                    background: 'transparent',
                    border: '1px solid #c8b8a3',
                    color: '#3a2d24',
                    padding: '8px 16px',
                    borderRadius: 6,
                    fontFamily: "'Crimson Pro', serif",
                    fontSize: '0.92rem',
                    cursor: 'pointer',
                  }}
                >
                  Close
                </button>

                <Link
                  href={`/create?title=${encodeURIComponent(previewLetter.title)}&message=${encodeURIComponent(previewLetter.fullTemplate)}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'linear-gradient(135deg, #c41e3a 0%, #8b1824 100%)',
                    color: '#fff',
                    padding: '8px 20px',
                    borderRadius: 6,
                    fontWeight: 600,
                    fontSize: '0.92rem',
                    textDecoration: 'none',
                    boxShadow: '0 3px 12px rgba(196, 30, 58, 0.35)',
                  }}
                >
                  Use This Letter →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ── SIMPLE FAQ ── */}
        <section style={{ marginTop: 70, maxWidth: 720, margin: '70px auto 0' }}>
          <h2
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '1.6rem',
              color: '#faf8f5',
              textAlign: 'center',
              marginBottom: 24,
            }}
          >
            Frequently Asked Questions
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              {
                q: 'What is an Open When letter?',
                a: 'It is a sealed letter written for a specific moment (like when someone misses you, has a bad day, or celebrates a birthday). The recipient breaks the wax seal when the moment arrives.',
              },
              {
                q: 'Can I change the text in these templates?',
                a: 'Yes, every word can be edited. You can also attach songs, voice messages, and photos.',
              },
              {
                q: 'Is it free to use?',
                a: 'Yes, Send Letter is 100% free with no account needed.',
              },
            ].map((faq) => (
              <div
                key={faq.q}
                style={{
                  background: 'rgba(20, 8, 14, 0.60)',
                  border: '1px solid rgba(212, 165, 116, 0.12)',
                  borderRadius: 8,
                  padding: '16px 20px',
                }}
              >
                <h3
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: '#d4a574',
                    marginBottom: 4,
                  }}
                >
                  {faq.q}
                </h3>
                <p
                  style={{
                    fontFamily: "'Crimson Pro', serif",
                    fontSize: '0.98rem',
                    color: 'rgba(250, 248, 245, 0.65)',
                    lineHeight: 1.55,
                    margin: 0,
                  }}
                >
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
