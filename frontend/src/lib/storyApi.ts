import type { ImageSourcePropType } from 'react-native';

import { apiGet, hasApiBackend } from './apiClient';
import { STORIES as BUNDLED_STORIES, getStoryById as getBundledStoryById } from '../data/stories';
import type { StoryPanel } from './storyComicLayout';
import type { StoryItem } from '../data/stories';

type RemoteStorySummary = {
  id: string;
  title: string;
  description: string;
  labelColor: string;
  posterUrl: string;
  panelCount: number;
};

type RemoteStoryPanel = {
  id: number;
  borderColor: string;
  width: number;
  height: number;
  imageUrl: string;
};

type RemoteStoryDetail = {
  id: string;
  title: string;
  description: string;
  labelColor: string;
  posterUrl: string;
  rows: RemoteStoryPanel[][];
};

function mapRemoteStory(detail: RemoteStoryDetail): StoryItem {
  const rows: StoryPanel[][] = detail.rows.map((row) =>
    row.map((panel) => ({
      id: panel.id,
      borderColor: panel.borderColor,
      width: panel.width,
      height: panel.height,
      source: { uri: panel.imageUrl } as ImageSourcePropType,
    })),
  );

  return {
    id: detail.id,
    title: detail.title,
    description: detail.description,
    labelColor: detail.labelColor,
    coverImage: { uri: detail.posterUrl } as ImageSourcePropType,
    rows,
  };
}

export async function fetchStories(): Promise<StoryItem[]> {
  if (!hasApiBackend()) {
    return BUNDLED_STORIES;
  }

  const summaries = await apiGet<RemoteStorySummary[]>('api/v1/stories');
  const stories = await Promise.all(
    summaries.map(async (summary) => {
      const detail = await apiGet<RemoteStoryDetail>(`api/v1/stories/${summary.id}`);
      return mapRemoteStory(detail);
    }),
  );

  return stories;
}

export async function fetchStoryById(storyId: string): Promise<StoryItem> {
  if (!hasApiBackend()) {
    return getBundledStoryById(storyId);
  }

  const detail = await apiGet<RemoteStoryDetail>(`api/v1/stories/${storyId}`);
  return mapRemoteStory(detail);
}

export { BUNDLED_STORIES };
