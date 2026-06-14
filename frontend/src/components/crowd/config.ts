export type CatFacing = 'left' | 'right';

export const CAT_ASSETS: ReadonlyArray<{
  image: number;
  facing: CatFacing;
}> = [
  { image: require('../../cats/1.png'), facing: 'left' },
  { image: require('../../cats/2.png'), facing: 'right' },
  { image: require('../../cats/3.png'), facing: 'left' },
  { image: require('../../cats/4.png'), facing: 'right' },
  { image: require('../../cats/5.png'), facing: 'left' },
  { image: require('../../cats/6.png'), facing: 'right' },
  { image: require('../../cats/7.png'), facing: 'right' },
  { image: require('../../cats/8.png'), facing: 'right' },
  { image: require('../../cats/9.png'), facing: 'right' },
  { image: require('../../cats/10.png'), facing: 'right' },
];

export const CROWD_LAYOUT = {
  heightRatio: 0.90,
  contentPaddingRatio: 0.25,
  bottomOffsetRatio: 0.03,
} as const;

export const CROWD_ANIMATION = {
  peepScale: 0.2,
  maxActivePeeps: 25,
  depthSpreadRatio: 0.2,
  walkBounce: 15,
} as const;
