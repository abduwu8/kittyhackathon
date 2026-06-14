import { apiGet, hasApiBackend } from './apiClient';
import { env } from '../config/env';
import type { CatApiImage } from '../types/catApi';

const BASE_URL = 'https://api.thecatapi.com/v1';
const DEFAULT_LIMIT = 10;

type BreedSearchResult = {
  id: string;
  name: string;
};

async function catApiFetch<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
  }

  const response = await fetch(url.toString(), {
    headers: {
      'x-api-key': env.catApiKey,
    },
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('cat api rate limit reached. try again in a moment.');
    }

    throw new Error(`cat api request failed (${response.status})`);
  }

  return response.json() as Promise<T>;
}

async function searchCatBreedId(query: string): Promise<string | null> {
  const breeds = await catApiFetch<BreedSearchResult[]>('/breeds/search', { q: query });
  return breeds[0]?.id ?? null;
}

export type FetchCatImagesOptions = {
  limit?: number;
  page?: number;
  breedQuery?: string | null;
};

async function fetchCatImagesDirect(options: FetchCatImagesOptions = {}): Promise<CatApiImage[]> {
  if (!env.catApiKey) {
    throw new Error('cat api key is missing. add EXPO_PUBLIC_CAT_API_KEY to your .env file.');
  }

  const params: Record<string, string> = {
    size: 'med',
    mime_types: 'jpg',
    format: 'json',
    has_breeds: 'true',
    order: 'RANDOM',
    page: String(options.page ?? 0),
    limit: String(options.limit ?? DEFAULT_LIMIT),
  };

  const breedQuery = options.breedQuery?.trim();
  if (breedQuery) {
    const breedId = await searchCatBreedId(breedQuery);
    if (breedId) {
      params.breed_ids = breedId;
    }
  }

  const images = await catApiFetch<CatApiImage[]>('/images/search', params);
  return images.filter((image) => Boolean(image.url));
}

export async function fetchCatImages(options: FetchCatImagesOptions = {}): Promise<CatApiImage[]> {
  if (hasApiBackend()) {
    return apiGet<CatApiImage[]>('api/v1/cats/images', {
      limit: options.limit ?? DEFAULT_LIMIT,
      page: options.page ?? 0,
      breed: options.breedQuery?.trim() || undefined,
    });
  }

  return fetchCatImagesDirect(options);
}

export function getCatImageBreedName(image: CatApiImage | undefined): string | null {
  return image?.breeds?.[0]?.name?.trim() || null;
}

export function shuffleCatImages(images: CatApiImage[]): CatApiImage[] {
  const shuffled = [...images];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

export function mergeCatImages(existing: CatApiImage[], incoming: CatApiImage[]): CatApiImage[] {
  const seen = new Set(existing.map((image) => image.id));
  const merged = [...existing];

  for (const image of incoming) {
    if (!seen.has(image.id)) {
      seen.add(image.id);
      merged.push(image);
    }
  }

  return merged;
}
