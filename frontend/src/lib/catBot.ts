import { apiPost, hasApiBackend } from './apiClient';
import { env } from '../config/env';

export type CatBotRole = 'user' | 'assistant';

export type CatBotMessage = {
  id: string;
  role: CatBotRole;
  content: string;
};

export type CatBotContext = {
  hasCat: boolean;
  catName?: string | null;
  userName?: string | null;
  favoriteCatBreed?: string | null;
};

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

const BASE_SYSTEM_PROMPT = `You are Cat Bot, a helpful cat expert for all things feline.
Answer only cat-related questions: health, food, behavior, grooming, play, breeds, and daily care.
Keep replies concise (under 100 words). Use a warm, professional tone with light cat wordplay.
Never use em dashes or en dashes. Use commas or periods instead.
For emergencies, always advise seeing a vet immediately.
Politely decline non-cat topics in one short sentence.`;

function sanitizeReply(text: string): string {
  return text.replace(/[—–]/g, ',').replace(/,\s*,/g, ',').trim();
}

export function buildSystemPrompt(context: CatBotContext): string {
  if (context.hasCat) {
    const catName = context.catName?.trim() || 'their cat';
    return `${BASE_SYSTEM_PROMPT}
The user has a cat named ${catName}. You may refer to their cat by name when relevant.`;
  }

  const details: string[] = [
    'The user does not currently have a cat. Do not assume they own a cat or say "your cat" unless they mention one in the conversation.',
  ];

  if (context.userName?.trim()) {
    details.push(`The user's name is ${context.userName.trim()}.`);
  }

  if (context.favoriteCatBreed?.trim()) {
    details.push(`Their favorite cat breed is ${context.favoriteCatBreed.trim()}. You may reference this interest when relevant.`);
  }

  return `${BASE_SYSTEM_PROMPT}
${details.join(' ')}`;
}

export function createWelcomeMessage(context: CatBotContext): CatBotMessage {
  if (context.hasCat) {
    const name = context.catName?.trim() || 'your cat';
    return {
      id: 'welcome',
      role: 'assistant',
      content: `meow, i'm cat bot. ask me anything about ${name}, from food and health to behavior and care. what's on your mind?`,
    };
  }

  const greeting = context.userName?.trim() ? `hey ${context.userName.trim()}, ` : '';

  return {
    id: 'welcome',
    role: 'assistant',
    content: `${greeting}meow, i'm cat bot. ask me anything about cats, from food and health to behavior and breeds. what's on your mind?`,
  };
}

async function askCatBotDirect(history: CatBotMessage[], context: CatBotContext): Promise<string> {
  if (!env.groqApiKey) {
    throw new Error('Groq API key is missing. Add EXPO_PUBLIC_GROQ_API_KEY to your .env file.');
  }

  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.groqApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.6,
      max_tokens: 220,
      messages: [
        { role: 'system', content: buildSystemPrompt(context) },
        ...history.map((message) => ({
          role: message.role,
          content: message.content,
        })),
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Cat Bot request failed (${response.status})`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const reply = payload.choices?.[0]?.message?.content?.trim();

  if (!reply) {
    throw new Error('Cat Bot returned an empty response.');
  }

  return sanitizeReply(reply);
}

export async function askCatBot(history: CatBotMessage[], context: CatBotContext): Promise<string> {
  if (hasApiBackend()) {
    const payload = await apiPost<
      {
        messages: Array<{ role: CatBotRole; content: string }>;
        context: CatBotContext;
      },
      { reply: string }
    >('api/v1/catbot/chat', {
      messages: history.map((message) => ({
        role: message.role,
        content: message.content,
      })),
      context,
    });

    return sanitizeReply(payload.reply);
  }

  return askCatBotDirect(history, context);
}
