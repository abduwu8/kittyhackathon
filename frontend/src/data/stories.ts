import type { ImageSourcePropType } from 'react-native';

import type { StoryPanel } from '../lib/storyComicLayout';
import { STORY_ROWS as CAT_STORY_2_ROWS } from '../catstory2/panels';
import { STORY_ROWS as STORY_3_ROWS } from '../story3/panels';
import { STORY_ROWS as SPACE_CAT_ROWS } from '../story1/panels';

export const STORY_LABEL_COLOR = '#E8A838';

export type StoryItem = {
  id: string;
  title: string;
  description: string;
  coverImage: ImageSourcePropType;
  labelColor: string;
  rows: StoryPanel[][];
};

export const STORIES: StoryItem[] = [
  {
    id: 'one-brain-cell',
    title: 'one brain cell vs. global disaster',
    description:
      'one cat, one brain cell, and a disaster big enough to need both , barely.',
    coverImage: require('../posters/Poster1.png'),
    labelColor: STORY_LABEL_COLOR,
    rows: SPACE_CAT_ROWS,
  },
  {
    id: 'his-meowjesty',
    title: 'his meowjesty',
    description:
      'royal attitude, imperial naps, and a kingdom ruled one dramatic meow at a time.',
    coverImage: require('../posters/Poster2.png'),
    labelColor: STORY_LABEL_COLOR,
    rows: CAT_STORY_2_ROWS,
  },
  {
    id: 'internets-unexpected-hero',
    title: "the internet's unexpected hero",
    description:
      'when the world goes online, one unlikely cat becomes the hero nobody saw coming.',
    coverImage: require('../posters/Poster3.png'),
    labelColor: STORY_LABEL_COLOR,
    rows: STORY_3_ROWS,
  },
];

export function getStoryById(storyId: string): StoryItem {
  return STORIES.find((story) => story.id === storyId) ?? STORIES[0];
}

export function getStoryPanelCount(story: StoryItem): number {
  return story.rows.flat().length;
}
