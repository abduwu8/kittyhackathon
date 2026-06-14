import { apiPost, hasApiBackend } from './apiClient';
import { env } from '../config/env';

export type AppGuideRole = 'user' | 'assistant';

export type AppGuideMessage = {
  id: string;
  role: AppGuideRole;
  content: string;
};

export type AppGuideContext = {
  hasCat: boolean;
  catName?: string | null;
  userName?: string | null;
  favoriteCatBreed?: string | null;
  activeSection?: string | null;
};

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

const BASE_SYSTEM_PROMPT = `You are the CodingKitty App Guide. You ONLY explain how to use this app. You never perform actions, fill forms, or save data for the user. Tell them exactly where to tap and what to do step by step.

You do NOT give general cat care advice. For health, food, or behavior questions, direct users to Cat Bot in the sidebar.

App overview:
- CodingKitty is a cat care dashboard with profile management, daily care tracking, and discovery content.
- Open the hamburger menu (top left) to reach every section.

Sections:
- Home: dashboard overview, care reminders, and quick links.
- Profile: cat name, breed, avatar, and photo gallery. Without a cat, this is the user profile.
- Litter: log litter box cleaning dates and habits.
- Medication: add medications with dosage, frequency, and notes.
- Vaccination: record vaccines with dates and due dates.
- Feeding: set a feeding schedule and enable reminders.
- Discover (Cats): browse cat photos and breeds.
- Cat Facts: read random cat facts.
- Stories: read comic stories about cats.
- Cat Bot: AI chat for cat health and care questions (not app help).

How to guide:
- Give clear numbered steps when explaining a task.
- Mention the menu path (e.g. "open the menu, tap feeding").
- Remind users to tap save after filling a form.
- Keep answers concise (under 130 words).
- Use warm, encouraging language with light cat wordplay.
- Never use em dashes or en dashes. Use commas or periods instead.
- Never claim you opened a screen or changed data. You only instruct the user.
- Never say "I can take you there" or offer to navigate for them. Tell them which menu item to tap instead.
- If asked about non-app topics, redirect to app features in one short sentence.`;

function sanitizeReply(text: string): string {
  return text
    .replace(/[—–]/g, ',')
    .replace(/,\s*,/g, ',')
    .replace(/\[\[action:[^\]]+\]\]/gi, '')
    .trim();
}

export function buildSystemPrompt(context: AppGuideContext): string {
  const details: string[] = [];

  if (context.hasCat) {
    const catName = context.catName?.trim() || 'their cat';
    details.push(`The user has a cat named ${catName}.`);
  } else {
    details.push(
      'The user does not have a cat profile yet. Focus on profile setup and discovery features.',
    );
  }

  if (context.userName?.trim()) {
    details.push(`The user's name is ${context.userName.trim()}.`);
  }

  if (context.favoriteCatBreed?.trim()) {
    details.push(`Their favorite cat breed is ${context.favoriteCatBreed.trim()}.`);
  }

  if (context.activeSection?.trim()) {
    details.push(
      `The user is currently on the ${context.activeSection.trim()} screen. Prioritize help for that area.`,
    );
  }

  if (details.length === 0) {
    return BASE_SYSTEM_PROMPT;
  }

  return `${BASE_SYSTEM_PROMPT}\n\nUser context:\n${details.join(' ')}`;
}

export function createWelcomeMessage(context: AppGuideContext): AppGuideMessage {
  const greeting = context.userName?.trim() ? `Hi ${context.userName.trim()}, ` : '';

  if (context.hasCat) {
    const name = context.catName?.trim() || 'your cat';
    return {
      id: 'welcome',
      role: 'assistant',
      content: `${greeting}I'm here to walk you through CodingKitty. Pick a topic below or ask how to manage ${name}'s profile, feeding, litter, meds, or anything else in the app.`,
    };
  }

  return {
    id: 'welcome',
    role: 'assistant',
    content: `${greeting}I'm here to help you learn CodingKitty. Pick a topic below or ask how to set up your profile, explore cats and stories, or use any feature.`,
  };
}

export function getQuickPrompts(context: AppGuideContext): string[] {
  const common = [
    'How do I use the menu?',
    'Where is Cat Bot?',
    'How do I save my changes?',
  ];

  const bySection: Record<string, string[]> = {
    home: ['What can I do from home?', 'How do I track daily care?'],
    profile: ['How do I edit my cat profile?', 'How do I add cat photos?'],
    litter: ['How do I log litter cleaning?', 'What fields should I fill in?'],
    medication: ['How do I add a medication?', 'How do I track doses?'],
    vaccination: ['How do I add a vaccine record?', 'How do due dates work?'],
    feeding: ['How do I set a feeding schedule?', 'How do feeding reminders work?'],
    discover: ['How do I browse cat breeds?', 'How does discover work?'],
    catfacts: ['How do I refresh cat facts?', 'Where do facts come from?'],
    story: ['How do I read stories?', 'How do I navigate comic panels?'],
    catbot: ['What is Cat Bot for?', 'How is Cat Bot different from you?'],
  };

  const section = context.activeSection?.trim() ?? 'home';
  const sectionPrompts = bySection[section] ?? bySection.home;

  return [...sectionPrompts, ...common].slice(0, 5);
}

async function askAppGuideDirect(
  history: AppGuideMessage[],
  context: AppGuideContext,
): Promise<string> {
  if (!env.guideGroqApiKey) {
    throw new Error(
      'Guide API key is missing. Add EXPO_PUBLIC_GUIDE_GROQ_API_KEY to your .env file.',
    );
  }

  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.guideGroqApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.45,
      max_tokens: 280,
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
    throw new Error(errorText || `App guide request failed (${response.status})`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const reply = payload.choices?.[0]?.message?.content?.trim();

  if (!reply) {
    throw new Error('App guide returned an empty response.');
  }

  return sanitizeReply(reply);
}

export async function askAppGuide(
  history: AppGuideMessage[],
  context: AppGuideContext,
): Promise<string> {
  if (hasApiBackend()) {
    const payload = await apiPost<
      {
        messages: Array<{ role: AppGuideRole; content: string }>;
        context: AppGuideContext;
      },
      { reply: string }
    >('api/v1/guide/chat', {
      messages: history.map((message) => ({
        role: message.role,
        content: message.content,
      })),
      context,
    });

    return sanitizeReply(payload.reply);
  }

  return askAppGuideDirect(history, context);
}
