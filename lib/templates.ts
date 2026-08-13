export type FontOption = 'Classic' | 'Flowing' | 'Elegant' | 'Casual' | 'Retro' | 'Poetic' | 'Typewriter' | 'Sacramento' | 'Parisienne';

export interface TemplatePreset {
  slug: string;
  label: string;
  title: string;
  headline: string;
  subtitle: string;
  buttonText: string;
  message: string;
  font: FontOption;
}

export const TEMPLATE_PRESETS: Record<string, TemplatePreset> = {
  'miss-you': {
    slug: 'miss-you',
    label: 'Miss you',
    title: 'Open When You Miss Me',
    headline: 'For When They Miss You Most',
    subtitle: "Seal your words now. They'll open them later — at exactly the moment they need you most.",
    buttonText: 'WRITE A "MISS YOU" LETTER',
    message: "I know that feeling — the one where everything reminds you of us. A song, a smell, a quiet evening.\n\nSo here's what I need you to know: right now, wherever I am, I'm thinking of you too. Always.",
    font: 'Flowing',
  },
  'sad-day': {
    slug: 'sad-day',
    label: 'Sad day',
    title: "Open When You're Having a Bad Day",
    headline: 'For Days That Feel Too Heavy',
    subtitle: 'Write a warm shelter of words they can unseal when everything goes wrong.',
    buttonText: 'WRITE A "SAD DAY" LETTER',
    message: "Hey. I wrote this for exactly this moment — the one where the world feels too heavy and you just need somewhere to rest.\n\nTake a deep breath. You are doing so much better than you think, and this bad day is just a moment, not your story.",
    font: 'Elegant',
  },
  'anniversary': {
    slug: 'anniversary',
    label: 'Anniversary',
    title: 'Open On Our Anniversary',
    headline: 'For Celebrating Your Shared Journey',
    subtitle: 'A sealed keepsake for the milestones that matter most in your love story.',
    buttonText: 'WRITE AN "ANNIVERSARY" LETTER',
    message: "Another year. Another collection of moments I wouldn't trade for anything in this world.\n\nThank you for loving me, for growing with me, and for being my favorite part of every day.",
    font: 'Flowing',
  },
  'long-distance': {
    slug: 'long-distance',
    label: 'Long Distance',
    title: 'Open When The Distance Feels Too Big',
    headline: 'For Long Distance Relationships',
    subtitle: 'Close the gap between miles with words that stay with them wherever they go.',
    buttonText: 'WRITE A LONG DISTANCE LETTER',
    message: "The miles between us might be real, but so is everything we've built together.\n\nWhenever you feel lonely, read this and remember: distance is temporary, but my love for you is constant.",
    font: 'Flowing',
  },
  'homesick': {
    slug: 'homesick',
    label: 'Homesick',
    title: "Open When You're Feeling Homesick",
    headline: 'For When Home Feels Far Away',
    subtitle: 'A comforting piece of home they can unseal whenever they miss familiar places.',
    buttonText: 'WRITE A HOMESICK LETTER',
    message: "Missing home just means you have somewhere worth loving. But wherever you are right now, you carry a piece of home inside you — and I am always in your corner.",
    font: 'Classic',
  },
  'cant-sleep': {
    slug: 'cant-sleep',
    label: "Can't sleep",
    title: "Open When You Can't Sleep",
    headline: 'For Sleepless Midnight Hours',
    subtitle: 'A gentle bedtime letter to quiet their mind when the night is still and silent.',
    buttonText: 'WRITE A BEDTIME LETTER',
    message: "It's late and your mind won't settle down. I get it. Put down your phone, close your eyes, and know that you are safe, loved, and thought of tonight.",
    font: 'Elegant',
  },
};

export const QUICK_PILLS_DATA = [
  { slug: 'miss-you', label: 'Miss you' },
  { slug: 'sad-day', label: 'Sad day' },
  { slug: 'anniversary', label: 'Anniversary' },
];
