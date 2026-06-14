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
    borderColor: '#E8A838',
    width: 307,
    height: 307,
  },
  {
    id: 2,
    source: require('./2.png'),
    borderColor: '#D35400',
    width: 295,
    height: 307,
  },
  {
    id: 3,
    source: require('./3.png'),
    borderColor: '#C0392B',
    width: 539,
    height: 307,
  },
  {
    id: 4,
    source: require('./4.png'),
    borderColor: '#8E44AD',
    width: 487,
    height: 551,
  },
  {
    id: 5,
    source: require('./5.png'),
    borderColor: '#16A085',
    width: 278,
    height: 307,
  },
  {
    id: 6,
    source: require('./6.png'),
    borderColor: '#2980B9',
    width: 539,
    height: 307,
  },
  {
    id: 7,
    source: require('./7.png'),
    borderColor: '#27AE60',
    width: 278,
    height: 307,
  },
  {
    id: 8,
    source: require('./8.png'),
    borderColor: '#E67E22',
    width: 539,
    height: 307,
  },
  {
    id: 9,
    source: require('./9.png'),
    borderColor: '#9B59B6',
    width: 293,
    height: 307,
  },
  {
    id: 10,
    source: require('./10.png'),
    borderColor: '#2C3E50',
    width: 312,
    height: 307,
  },
  {
    id: 11,
    source: require('./11.png'),
    borderColor: '#F39C12',
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
