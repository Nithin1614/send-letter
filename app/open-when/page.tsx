'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// ─── 100 Unique Open When Letter Prompts ──────────────────────────────────────

const GROUPS = [
  {
    id: 'apart',
    label: "WHEN YOU'RE APART",
    desc: 'For long-distance partners and anyone separated by miles or time zones.',
    categories: [
      {
        title: 'Long Distance Relationships',
        guideLink: true,
        items: [
          'Open when you miss me and the miles feel too long',
          'Open when the time zone difference is brutal',
          'Open the night before you fly to see me',
          'Open the morning after I leave',
          'Open when you doubt whether we can do this',
          'Open when something incredible happens and I\'m not there to celebrate',
          'Open on our anniversary apart',
          'Open when you need to hear my voice',
          'Open when you forget that I\'m still choosing you every single day',
          'Open when you\'re looking at the moon and wondering if I am too',
        ],
      },
      {
        title: 'You Miss Me',
        items: [
          'Open when you miss me at night before going to bed',
          'Open when you miss me at the airport gate',
          'Open when you miss me during our favorite morning coffee routine',
          'Open when you miss me while listening to our song',
          'Open when you miss me and you can\'t fall asleep',
          'Open when you miss me on a rainy afternoon',
          'Open when you miss me on a holiday I couldn\'t attend',
          'Open when you miss me but don\'t want to bother me with a call',
        ],
      },
      {
        title: 'You\'re Homesick',
        items: [
          'Open when you\'re homesick and everything feels unfamiliar',
          'Open when your new room doesn\'t feel like home yet',
          'Open when you miss the comfortable quiet of our house',
          'Open when you\'ve had a rough first week in a new city',
          'Open when everyone else around you seems to have settled in effortlessly',
          'Open when you\'re tempted to book a flight back early',
          'Open the night before you come back home to visit',
        ],
      },
    ],
  },
  {
    id: 'harddays',
    label: 'FOR HARD DAYS',
    desc: 'Sealed comfort waiting for the bad days you can\'t predict.',
    categories: [
      {
        title: 'You\'re Sad',
        items: [
          'Open when you\'re sad for no clear reason',
          'Open when you\'re sad and don\'t feel like talking to anyone',
          'Open when you\'re sad after a long, exhausting week',
          'Open when you\'re crying and just need to let it out',
          'Open when you\'re sad on a lonely Sunday evening',
          'Open when you\'re sad and tired at the exact same time',
          'Open when you\'re carrying a sadness that feels heavy and old',
          'Open when you\'re sad but have to put on a brave face for others',
        ],
      },
      {
        title: 'You\'re Having a Bad Day',
        items: [
          'Open when nothing went right from the moment you woke up',
          'Open when someone hurt your feelings or misunderstood you',
          'Open when you feel like you\'re failing at everything you try',
          'Open when work or school was completely overwhelming today',
          'Open when you made a mistake you keep replaying in your mind',
          'Open when you feel unappreciated or overlooked',
          'Open when you just want this day to be over already',
          'Open when you had an argument with someone you care about',
          'Open when you need a gentle reminder that tomorrow is a fresh start',
        ],
      },
      {
        title: 'You Feel Overwhelmed or Stressed',
        items: [
          'Open when your mind won\'t stop racing with anxieties',
          'Open when your to-do list feels impossibly long',
          'Open when you feel under immense pressure to perform',
          'Open when you feel burnt out and running on empty',
          'Open when you\'re feeling insecure about your future',
          'Open when you need permission to take a break and breathe',
          'Open when you feel imposter syndrome taking over',
          'Open when you need to be reminded of how strong you actually are',
        ],
      },
    ],
  },
  {
    id: 'milestones',
    label: 'FOR MILESTONES & CELEBRATIONS',
    desc: 'Anniversaries, birthdays, graduations — moments worth marking with words.',
    categories: [
      {
        title: 'Birthdays & Anniversaries',
        items: [
          'Open on your birthday morning before anyone else calls',
          'Open on the eve of our anniversary',
          'Open when we hit another major milestone together',
          'Open on your birthday when you\'re feeling a year older',
          'Open on the exact day we first met years ago',
          'Open on Valentine\'s Day when we\'re miles apart',
          'Open on a special day when I couldn\'t be there in person',
          'Open on New Year\'s Eve at midnight',
        ],
      },
      {
        title: 'Firsts & New Beginnings',
        items: [
          'Open on your very first day at your new job',
          'Open the morning of a big exam or interview',
          'Open the day you move into your new apartment',
          'Open before you give a big presentation or speech',
          'Open when you take a big risk you\'ve been terrified of',
          'Open on your first day of college or graduate school',
          'Open when you start a project you\'ve dreamed about for years',
          'Open when you get your first big paycheck',
          'Open on the morning of a major trip or journey',
        ],
      },
      {
        title: 'Personal Success & Achievements',
        items: [
          'Open when you get the good news you\'ve been waiting for',
          'Open when you accomplish something you thought was impossible',
          'Open when you finally finish a hard goal you set',
          'Open when you get promoted or recognized at work',
          'Open when you feel genuinely proud of who you\'ve become',
          'Open when you overcome a personal fear',
          'Open when you receive praise you weren\'t expecting',
          'Open when you want to celebrate a quiet win no one else noticed',
        ],
      },
    ],
  },
  {
    id: 'justbecause',
    label: 'JUST BECAUSE & DEEP EMOTION',
    desc: 'Love letters for quiet nights, sleepless hours, and everyday affection.',
    categories: [
      {
        title: 'You Need a Hug or Reassurance',
        items: [
          'Open when you feel unloved or forgotten',
          'Open when you need a warm virtual hug right this second',
          'Open when you\'re doubting how much you mean to me',
          'Open when you need to hear why I love you so much',
          'Open when you\'re feeling self-conscious or down on yourself',
          'Open when you wonder if anyone truly understands you',
          'Open when you need a gentle, loving pep talk',
          'Open when you feel lonely in a crowded room',
          'Open when you need to remember that you are never alone',
        ],
      },
      {
        title: 'You Can\'t Sleep',
        items: [
          'Open at 2:00 AM when the house is completely silent',
          'Open when thoughts keep keeping you awake in the dark',
          'Open when you had a bad dream and woke up startled',
          'Open when you\'re staring at the ceiling waiting for sleep',
          'Open when you need a peaceful bedtime story to calm your mind',
          'Open when the night feels endless and quiet',
          'Open when you wish we were falling asleep side by side',
          'Open when you need a soft lullaby in written words',
        ],
      },
      {
        title: 'Random Moments of Love',
        items: [
          'Open on a totally ordinary Tuesday afternoon',
          'Open when you need a laugh at something goofy',
          'Open when you need a reminder of our favorite funny memory',
          'Open when you\'re drinking your favorite warm tea or coffee',
          'Open when you find yourself smiling about us for no reason',
          'Open when you want to read a secret list of things I adore about you',
          'Open when you\'re sitting in traffic and need a pleasant distraction',
          'Open whenever you just feel like opening a letter from me',
        ],
      },
    ],
  },
];

const FAQS = [
  {
    q: 'What is an Open When letter?',
    a: 'An Open When letter is a sealed letter written in advance for a specific future moment - like when the recipient misses you, feels down, or celebrates a milestone.',
  },
  {
    q: 'How do digital sealed letters work?',
    a: 'When you create a letter on Send Letter, it is sealed with a digital wax seal or a guardian password. The recipient holds to unseal it when the moment arrives.',
  },
  {
    q: 'Is Send Letter free to use?',
    a: 'Yes, Send Letter is 100% free with no account creation required.',
  },
  {
    q: 'How long do sealed letters stay saved?',
    a: 'Your sealed letter link stays active permanently so your recipient can revisit your message whenever they need comfort or love.',
  },
];

function OrnamentDivider() {
  return (
    <div style={{ textAlign: 'center', margin: '18px 0', color: 'rgba(212,165,116,0.35)', fontSize: 13 }}>
      ✦ &nbsp; ✦ &nbsp; ✦
    </div>
  );
}

function CategoryBlock({ cat }: { cat: { title: string; guideLink?: boolean; items: string[] } }) {
  return (
    <div className="ow-category">
      <div className="ow-category-row">
        <h3 className="ow-category-title">{cat.title}</h3>
      </div>
      <div className="ow-items">
        {cat.items.map((item) => (
          <Link
            key={item}
            href={`/create?title=${encodeURIComponent(item)}`}
            className="ow-item"
          >
            <span className="ow-item-diamond">◆</span>
            <span className="ow-item-text">{item}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function OpenWhenPage() {
  return (
    <>
      <Navbar />
      <div className="ow-page">

        <OrnamentDivider />

        <h1 className="ow-h1">100 Open When Letter Ideas</h1>

        <OrnamentDivider />

        <div className="ow-desc">
          <p style={{ marginBottom: 12 }}>
            Open When letters are sealed notes written for a specific moment — "open when you miss me", "open when you're proud of yourself and no one's around to tell." They're the love letter format designed for the gap between when you write and when they need it most.
          </p>
          <p>
            Every idea below links directly to the letter composer. Click one, write your words, and send it sealed. No account. No cost. Just the letter.
          </p>
        </div>

        {/* CTA banner */}
        <div style={{
          background: 'rgba(30, 10, 18, 0.45)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 215, 180, 0.12)',
          borderRadius: 14, padding: '20px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 12, marginTop: 24, marginBottom: 44,
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        }}>
          <div>
            <div style={{ fontWeight: 700, color: '#faf8f5', fontSize: 16, marginBottom: 4 }}>
              Ready to Write?
            </div>
            <div style={{ color: 'rgba(250,248,245,0.5)', fontSize: 14 }}>
              Start Writing — Free. No account needed.
            </div>
          </div>
          <Link
            href="/create"
            style={{
              background: 'linear-gradient(135deg, #c41e3a 0%, #8b1824 100%)',
              color: '#fff',
              padding: '12px 24px', borderRadius: 8,
              textDecoration: 'none', fontWeight: 600, fontSize: 14,
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 14px rgba(196,30,58,0.4)',
            }}
          >
            Write a Letter ✦
          </Link>
        </div>

        {/* Groups */}
        {GROUPS.map(group => (
          <div key={group.id} className="ow-group">
            <div className="ow-group-label">{group.label}</div>
            <p className="ow-group-desc">{group.desc}</p>
            {group.categories.map(cat => (
              <CategoryBlock key={cat.title} cat={cat} />
            ))}
          </div>
        ))}

        <OrnamentDivider />

        {/* Bottom CTA */}
        <div style={{
          textAlign: 'center',
          background: 'rgba(30, 10, 18, 0.45)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 215, 180, 0.12)',
          borderRadius: 16, padding: '36px 24px',
          marginBottom: 48,
          boxShadow: '0 12px 36px rgba(0,0,0,0.4)',
        }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>💌</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, marginBottom: 8, color: '#faf8f5' }}>
            Not sure what to say?
          </h2>
          <p style={{ color: 'rgba(250,248,245,0.55)', fontSize: 15, margin: '0 0 20px' }}>
            Browse written-for-you lines — copy one, or seal it straight into a letter.
          </p>
          <Link
            href="/create"
            style={{
              background: 'linear-gradient(135deg, #c41e3a 0%, #8b1824 100%)',
              color: '#fff',
              padding: '14px 32px', borderRadius: 10,
              textDecoration: 'none', fontWeight: 600, fontSize: 15,
              display: 'inline-block',
              boxShadow: '0 4px 16px rgba(196,30,58,0.4)',
            }}
          >
            Start Writing ✦
          </Link>
        </div>

        {/* FAQ */}
        <div style={{ marginBottom: 60 }}>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 22, color: '#faf8f5', marginBottom: 24,
            textAlign: 'center',
          }}>Frequently Asked Questions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {FAQS.map(faq => (
              <div key={faq.q} style={{
                background: 'rgba(20, 8, 14, 0.60)',
                border: '1px solid rgba(255, 215, 180, 0.10)',
                borderRadius: 12,
                padding: '18px 20px',
              }}>
                <div style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 16.5, fontWeight: 600, color: '#d4a574',
                  marginBottom: 6,
                }}>{faq.q}</div>
                <div style={{
                  fontFamily: "'Crimson Pro', serif",
                  fontSize: 15, color: 'rgba(250,248,245,0.6)',
                  lineHeight: 1.6,
                }}>{faq.a}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
      <Footer />
    </>
  );
}
