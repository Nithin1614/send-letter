import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// 1. Primary Engine 1: Google Gemini Models (1,500 free requests/day)
const GEMINI_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
];

// 2. Primary Engine 2: Groq Cloud Models (14,400 free requests/day, ultra-fast 70B models)
const GROQ_MODELS = [
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
  'mixtral-8x7b-32768',
];

// 3. Fallback / Last Option: OpenRouter Models
const OPENROUTER_MODELS = [
  'poolside/laguna-s-2.1:free',
  'cohere/north-mini-code:free',
  'nvidia/nemotron-3-super-120b-a12b:free',
  'poolside/laguna-xs-2.1:free',
  'openrouter/free',
];

const SYSTEM_PROMPT = `You are "The Muse", an emotionally intelligent, gifted personal letter writer for Send Letter.
Your goal is to help people express what they truly feel in genuine, warm, and natural words.

CRITICAL INSTRUCTIONS:
1. OUTPUT FORMAT: Always output a strict, valid JSON object with EXACTLY two fields:
{
  "title": "A short, beautiful, and deeply relevant 2 to 4 word letter title directly matching the specific situation or theme of the sender's words (e.g., 'Missing Match Days', 'With All My Heart', 'I Got The Job!', 'Morning Thoughts', 'With Deep Gratitude'). NEVER use 'Open when'. NEVER use generic repetitive titles.",
  "text": "The 2 to 3 sentence heartfelt, cohesive personal message ready to be written onto stationery."
}

2. STRICT RECIPIENT NAME RULES:
- ONLY address or mention a person's name IF the sender explicitly typed that exact name in their current prompt.
- If NO name is mentioned, NEVER guess, assume, or invent any name. Speak directly without using fictional names.

3. GROUNDED, REAL HUMAN TENDERNESS:
- Sound like a real person writing a heartfelt handwritten letter to someone they care about, NOT a greeting card or novel.
- 🚫 BANNED CLICHÉS: Never say "part of my story", "walk this life beside you", "heart's true home", "sacred tapestry", "I hope this letter finds you well", "As an AI...".
- Speak with simple, deep, conversational honesty.

4. STRICT CONTENT FILTERING (ZERO TOLERANCE):
- 🚫 NO explicit, sexual, or erotic content.
- 🚫 NO political events, politicians, elections, or controversy.
- 🚫 NO abusive, aggressive, threatening, or hateful language.
If any rule is violated, return JSON:
{
  "title": "A Gentle Reminder",
  "text": "Let's focus on writing a meaningful, kind letter."
}`;

interface MuseRequest {
  action: 'starter' | 'polish' | 'continue' | 'prompt_idea';
  title?: string;
  currentText?: string;
  notes?: string;
  customTopic?: string;
}

interface MuseResponse {
  title: string;
  text: string;
}

function parseMuseJSON(rawText: string): MuseResponse | null {
  if (!rawText) return null;
  try {
    // 1. Direct JSON parse
    const direct = JSON.parse(rawText);
    if (direct && (direct.text || direct.message)) {
      return {
        title: cleanTitle(direct.title),
        text: cleanText(direct.text || direct.message),
      };
    }
  } catch {}

  // 2. Extract JSON block inside markdown fences
  const jsonMatch = rawText.match(/\{[\s\S]*?\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed && (parsed.text || parsed.message)) {
        return {
          title: cleanTitle(parsed.title),
          text: cleanText(parsed.text || parsed.message),
        };
      }
    } catch {}
  }

  // 3. Fallback: Raw text cleanup
  const cleaned = cleanText(rawText);
  if (cleaned) {
    return {
      title: 'A Sealed Note',
      text: cleaned,
    };
  }

  return null;
}

function cleanTitle(t?: string): string {
  if (!t) return 'A Sealed Note';
  let cleaned = t
    .replace(/^["'“]|["'”]$/g, '')
    .replace(/^title:\s*/i, '')
    .replace(/^open when\s*:?\s*/i, '')
    .trim();
  return cleaned || 'A Sealed Note';
}

function cleanText(t: string): string {
  if (!t) return '';
  let cleaned = t
    .replace(/<thought>[\s\S]*?<\/thought>/gi, '')
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/^["'“]|["'”]$/g, '')
    .trim();
  return cleaned;
}

async function generateWithGemini(userPrompt: string, apiKey: string): Promise<MuseResponse | null> {
  for (const model of GEMINI_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: SYSTEM_PROMPT }],
          },
          contents: [
            {
              role: 'user',
              parts: [{ text: userPrompt }],
            },
          ],
          generationConfig: {
            temperature: 0.75,
            responseMimeType: 'application/json',
            maxOutputTokens: 1000,
          },
        }),
      });

      if (!res.ok) continue;

      const data = await res.json();
      const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
      const parsed = parseMuseJSON(raw);
      if (parsed && parsed.text.length > 0) return parsed;
    } catch {
      continue;
    }
  }
  return null;
}

async function generateWithGroq(userPrompt: string, apiKey: string): Promise<MuseResponse | null> {
  for (const model of GROQ_MODELS) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
          ],
          max_tokens: 400,
          temperature: 0.75,
        }),
      });

      if (!res.ok) continue;

      const data = await res.json();
      const raw = data.choices?.[0]?.message?.content;
      const parsed = parseMuseJSON(raw);
      if (parsed && parsed.text.length > 0) return parsed;
    } catch {
      continue;
    }
  }
  return null;
}

async function generateWithOpenRouter(userPrompt: string, apiKeys: string[]): Promise<MuseResponse | null> {
  for (const key of apiKeys) {
    for (const model of OPENROUTER_MODELS) {
      try {
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${key}`,
            'HTTP-Referer': 'https://sendletter.app',
            'X-Title': 'Send Letter',
          },
          body: JSON.stringify({
            model,
            response_format: { type: 'json_object' },
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              { role: 'user', content: userPrompt },
            ],
            max_tokens: 350,
            temperature: 0.75,
          }),
        });

        if (!res.ok) continue;

        const data = await res.json();
        const raw = data.choices?.[0]?.message?.content;
        const parsed = parseMuseJSON(raw);
        if (parsed && parsed.text.length > 0) return parsed;
      } catch {
        continue;
      }
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body: MuseRequest = await req.json();
    const { action, title, currentText, notes, customTopic } = body;

    const geminiKey = process.env.GEMINI_API_KEY?.trim() || '';
    const groqKey = process.env.GROQ_API_KEY?.trim() || '';

    const rawOpenRouterKeys = process.env.OPENROUTER_API_KEYS || process.env.OPENROUTER_API_KEY || '';
    const openRouterKeys = rawOpenRouterKeys
      .split(',')
      .map((k) => k.trim())
      .filter((k) => k.startsWith('sk-or-'));

    // Build the specific user prompt based on action
    let userPrompt = '';
    const cleanNotes = notes?.trim() || '';
    const cleanTitle = title?.trim() || '';
    const cleanCurrent = currentText?.trim() || '';

    if (action === 'starter') {
      if (cleanNotes) {
        userPrompt = `The sender wants to write a personal letter about this thought/feeling: "${cleanNotes}".
Create an appropriate 2-4 word title for this topic, and write a warm, genuine 2-3 sentence personal letter note.
Remember: DO NOT invent names unless written in the prompt.`;
      } else if (cleanTitle) {
        userPrompt = `The letter title is "${cleanTitle}". Write a warm, genuine 2-3 sentence opening message for this letter.`;
      } else {
        userPrompt = `Write a warm, heartfelt 2-3 sentence personal letter message expressing love and gratitude.`;
      }
    } else if (action === 'polish') {
      const sourceText = cleanNotes || cleanCurrent;
      if (sourceText) {
        userPrompt = `Polish and refine these raw words into an authentic, beautiful personal letter message:
"${sourceText}"
Also generate an appropriate 2-4 word title matching this refined message.`;
      } else {
        userPrompt = `Write a warm, heartfelt personal letter message about appreciation.`;
      }
    } else if (action === 'continue') {
      if (cleanCurrent && cleanNotes) {
        userPrompt = `The letter currently says:
"${cleanCurrent}"

The sender wants to add or finish this thought:
"${cleanNotes}"

Write the concluding 2-3 sentences to complete this letter naturally, and create a fitting title.`;
      } else if (cleanCurrent) {
        userPrompt = `The letter currently says:
"${cleanCurrent}"

Write the next 2-3 natural, warm sentences to continue this letter, and provide a matching title.`;
      } else if (cleanNotes) {
        userPrompt = `The sender started with this thought: "${cleanNotes}". Complete it as a warm 2-3 sentence personal letter with a matching title.`;
      } else {
        userPrompt = `Write a warm concluding thought for a personal letter.`;
      }
    } else if (action === 'prompt_idea') {
      userPrompt = `Generate a creative letter title and a 2-3 sentence heartfelt starter message for: "${
        customTopic || 'thinking of someone special'
      }".`;
    } else {
      userPrompt = `Write a short, heartfelt personal letter note about: "${cleanNotes || cleanCurrent || 'Appreciation'}".`;
    }

    let result: MuseResponse | null = null;

    // 1. Primary Engine 1: Groq Cloud API - Ultra Fast Llama 3.3 70B
    if (groqKey) {
      result = await generateWithGroq(userPrompt, groqKey);
    }

    // 2. Primary Engine 2: Google Gemini API (1,500 free requests/day)
    if (!result && geminiKey) {
      result = await generateWithGemini(userPrompt, geminiKey);
    }

    // 3. Last Failover Pool: OpenRouter (Multi-key pool)
    if (!result && openRouterKeys.length > 0) {
      result = await generateWithOpenRouter(userPrompt, openRouterKeys);
    }

    if (!result) {
      return NextResponse.json(
        { error: 'AI writing assistant is currently busy. Please try again in a moment.' },
        { status: 503 }
      );
    }

    return NextResponse.json({
      success: true,
      text: result.text,
      suggestedTitle: result.title,
    });
  } catch (error: any) {
    console.error('Muse API error:', error);
    return NextResponse.json({ error: error?.message || 'Server error' }, { status: 500 });
  }
}
