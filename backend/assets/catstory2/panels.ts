import type { StoryPanel } from '../lib/storyComicLayout';

export type { StoryPanel } from '../lib/storyComicLayout';
export {
  getPanelAspectRatio,
  getPanelSize,
  getRowHeight,
} from '../lib/storyComicLayout';

export const STORY_PANELS: StoryPanel[] = [
  {
    id: 1,
    source: require('./1.png'),
    borderColor: '#e81d25',
    width: 307,
    height: 307,
  },
  {
    id: 2,
    source: require('./2.png'),
    borderColor: '#136ed2',
    width: 295,
    height: 307,
  },
  {
    id: 3,
    source: require('./3.png'),
    borderColor: '#f7931e',
    width: 539,
    height: 307,
  },
  {
    id: 4,
    source: require('./4.png'),
    borderColor: '#423d65',
    width: 487,
    height: 551,
  },
  {
    id: 5,
    source: require('./5.png'),
    borderColor: '#8c52ff',
    width: 278,
    height: 307,
  },
  {
    id: 6,
    source: require('./6.png'),
    borderColor: '#ff66c4',
    width: 539,
    height: 307,
  },
  {
    id: 7,
    source: require('./7.png'),
    borderColor: '#00bf63',
    width: 278,
    height: 307,
  },
  {
    id: 8,
    source: require('./8.png'),
    borderColor: '#e81d25',
    width: 539,
    height: 307,
  },
  {
    id: 9,
    source: require('./9.png'),
    borderColor: '#f7931e',
    width: 293,
    height: 307,
  },
  {
    id: 10,
    source: require('./10.png'),
    borderColor: '#136ed2',
    width: 312,
    height: 307,
  },
  {
    id: 11,
    source: require('./11.png'),
    borderColor: '#423d65',
    width: 487,
    height: 401,
  },
];

export const STORY_ROWS: StoryPanel[][] = [
  STORY_PANELS.slice(0, 3),
  STORY_PANELS.slice(3, 5),
  STORY_PANELS.slice(5, 8),
  STORY_PANELS.slice(8, 10),
  STORY_PANELS.slice(10, 11),
];
