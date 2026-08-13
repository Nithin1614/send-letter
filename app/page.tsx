"use client";
import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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
  { q: "How does Send Letter work?", a: "Send Letter is the digital platform for sealed letters. Write a message for a specific moment — an anniversary, a bad day, a milestone — seal it with a virtual wax stamp, set a guardian question, and share the link. Recipients must answer the question and hold to break the seal. No account needed." },
  { q: "Is Send Letter free to use?", a: "Yes, Send Letter is completely free. No subscription, no hidden fees, no payment required. Create unlimited sealed messages at no cost." },
  { q: "Do I need to create an account?", a: "No account required. Simply visit Send Letter, compose your message, and share the link. No registration, no login, no personal information needed." },
  { q: "How secure are my messages?", a: "Messages are protected by guardian questions and encryption. Only the holder of the management link or recipient link can access the letter." },
  { q: "Can I send anonymous messages?", a: "Yes. You can choose to sign your message or remain anonymous. The signature field is optional." },
  { q: "What is the wax seal unsealing ritual?", a: "The unsealing ritual requires recipients to hold their finger on the wax seal until it breaks. This creates an intentional, meaningful moment of revelation." },
  { q: "Can recipients read messages without answering the question?", a: "No. Recipients must correctly answer the guardian question before they can access the unsealing ritual. Wrong answers prevent access." },
  { q: "How long do messages last?", a: "Messages are persistent and stored securely in our database. You can manage and track your letter status anytime using your private management link." },
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
      <section className="hero-section">
        {/* Ambient glow */}
        <div style={{ position: "absolute", top: "25%", left: "50%", transform: "translateX(-50%)", width: 600, height: 300, background: "radial-gradient(ellipse, rgba(139,32,32,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div className="hero-seal">❤</div>

        <p className="hero-est">— EST. 2026 —</p>

        <div className="ornament" style={{ marginBottom: "20px" }}>
          <span className="ornament-icon">🔏</span>
        </div>

        <h1 className="hero-title">
          Seal Your Words
          <span className="hero-title-italic">in Timeless Elegance</span>
        </h1>

        <div className="ornament" style={{ maxWidth: 180, marginTop: "18px" }}>
          <span className="ornament-icon">🔏</span>
        </div>

        <p className="hero-subtitle">
          Create secret messages sealed with a wax stamp, revealed only when the moment is right. For the moments that matter most.
        </p>

        <Link href="/create" className="hero-compose-btn">
          ✉ Compose Your Letter
        </Link>
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
