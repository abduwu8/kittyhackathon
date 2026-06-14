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
    borderColor: '#E53935',
    width: 307,
    height: 307,
  },
  {
    id: 2,
    source: require('./2.png'),
    borderColor: '#1E88E5',
    width: 307,
    height: 307,
  },
  {
    id: 3,
    source: require('./3.png'),
    borderColor: '#43A047',
    width: 295,
    height: 307,
  },
  {
    id: 4,
    source: require('./4.png'),
    borderColor: '#FB8C00',
    width: 539,
    height: 307,
  },
  {
    id: 5,
    source: require('./5.png'),
    borderColor: '#8E24AA',
    width: 487,
    height: 551,
  },
  {
    id: 6,
    source: require('./6.png'),
    borderColor: '#6A1B9A',
    width: 278,
    height: 307,
  },
  {
    id: 7,
    source: require('./7.png'),
    borderColor: '#EC407A',
    width: 539,
    height: 307,
  },
  {
    id: 8,
    source: require('./8.png'),
    borderColor: '#D81B60',
    width: 278,
    height: 307,
  },
  {
    id: 9,
    source: require('./9.png'),
    borderColor: '#00897B',
    width: 539,
    height: 307,
  },
  {
    id: 10,
    source: require('./10.png'),
    borderColor: '#3949AB',
    width: 293,
    height: 307,
  },
  {
    id: 11,
    source: require('./11.png'),
    borderColor: '#F4511E',
    width: 312,
    height: 307,
  },
];

export const STORY_ROWS: StoryPanel[][] = [
  STORY_PANELS.slice(0, 3),
  STORY_PANELS.slice(3, 5),
  STORY_PANELS.slice(5, 8),
  STORY_PANELS.slice(8, 10),
  STORY_PANELS.slice(10, 11),
];
