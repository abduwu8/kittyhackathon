import { apiGet, hasApiBackend } from './apiClient';

export type CatFact = {
  id: string;
  text: string;
  length: number;
};

export type CatBreed = {
  breed: string;
  country: string;
  origin: string;
  coat: string;
  pattern: string;
};

const FACTS_URL = 'https://catfact.ninja/fact';
const BREEDS_URL = 'https://catfact.ninja/breeds';
const DEFAULT_MAX_LENGTH = 140;

type CatFactNinjaResponse = {
  fact: string;
  length: number;
};

function createFactId(text: string): string {
  return `${text.slice(0, 24)}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function toCatFact(raw: CatFactNinjaResponse): CatFact {
  const text = raw.fact.trim();

  return {
    id: createFactId(text),
    text,
    length: raw.length,
  };
}

async function fetchCatFactDirect(maxLength = DEFAULT_MAX_LENGTH): Promise<CatFact> {
  const url = new URL(FACTS_URL);
  url.searchParams.set('max_length', String(maxLength));

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error('could not load a cat fact. try again in a moment.');
  }

  const data = (await response.json()) as CatFactNinjaResponse;

  if (!data.fact?.trim()) {
    throw new Error('could not load a cat fact. try again in a moment.');
  }

  return toCatFact(data);
}

export async function fetchCatFact(maxLength = DEFAULT_MAX_LENGTH): Promise<CatFact> {
  if (hasApiBackend()) {
    return apiGet<CatFact>('api/v1/cats/facts/random', { max_length: maxLength });
  }

  return fetchCatFactDirect(maxLength);
}

export type FetchCatFactsOptions = {
  count?: number;
  maxLength?: number;
};

export async function fetchCatFacts(options: FetchCatFactsOptions = {}): Promise<CatFact[]> {
  const count = options.count ?? 10;
  const maxLength = options.maxLength ?? DEFAULT_MAX_LENGTH;

  if (hasApiBackend()) {
    return apiGet<CatFact[]>('api/v1/cats/facts', {
      count,
      max_length: maxLength,
    });
  }

  const results = await Promise.all(
    Array.from({ length: count }, () => fetchCatFactDirect(maxLength)),
  );

  return dedupeCatFacts(results);
}

export function shuffleCatFacts(facts: CatFact[]): CatFact[] {
  const shuffled = [...facts];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

export function mergeCatFacts(existing: CatFact[], incoming: CatFact[]): CatFact[] {
  return dedupeCatFacts([...existing, ...incoming]);
}

function dedupeCatFacts(facts: CatFact[]): CatFact[] {
  const seen = new Set<string>();
  const unique: CatFact[] = [];

  for (const fact of facts) {
    const key = fact.text.toLowerCase();

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    unique.push(fact);
  }

  return unique;
}

type CatBreedsPageResponse = {
  data: CatBreed[];
  current_page: number;
  last_page: number;
};

function normalizeBreed(raw: CatBreed): CatBreed {
  return {
    breed: raw.breed?.trim() || 'unknown breed',
    country: raw.country?.trim() || '',
    origin: raw.origin?.trim() || '',
    coat: raw.coat?.trim() || '',
    pattern: raw.pattern?.trim() || '',
  };
}

async function fetchAllCatBreedsDirect(): Promise<CatBreed[]> {
  const breeds: CatBreed[] = [];
  let page = 1;
  let lastPage = 1;

  do {
    const url = new URL(BREEDS_URL);
    url.searchParams.set('page', String(page));

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error('could not load cat breeds. try again in a moment.');
    }

    const data = (await response.json()) as CatBreedsPageResponse;

    if (!Array.isArray(data.data) || data.data.length === 0) {
      break;
    }

    breeds.push(...data.data.map(normalizeBreed));
    lastPage = data.last_page ?? page;
    page += 1;
  } while (page <= lastPage);

  return dedupeCatBreeds(breeds);
}

export async function fetchAllCatBreeds(): Promise<CatBreed[]> {
  if (hasApiBackend()) {
    return apiGet<CatBreed[]>('api/v1/cats/breeds');
  }

  return fetchAllCatBreedsDirect();
}

export function shuffleCatBreeds(breeds: CatBreed[]): CatBreed[] {
  const shuffled = [...breeds];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

function dedupeCatBreeds(breeds: CatBreed[]): CatBreed[] {
  const seen = new Set<string>();
  const unique: CatBreed[] = [];

  for (const breed of breeds) {
    const key = breed.breed.toLowerCase();

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    unique.push(breed);
  }

  return unique;
}
