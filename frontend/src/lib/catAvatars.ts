export const CAT_AVATAR_OPTIONS = [
  { id: 'cat1', image: require('../profiles/cat1.png') },
  { id: 'cat2', image: require('../profiles/cat2.png') },
  { id: 'cat3', image: require('../profiles/cat3.png') },
  { id: 'cat4', image: require('../profiles/cat4.png') },
  { id: 'cat5', image: require('../profiles/cat5.png') },
  { id: 'cat6', image: require('../profiles/cat6.png') },
  { id: 'cat7', image: require('../profiles/cat7.png') },
  { id: 'cat8', image: require('../profiles/cat8.png') },
  { id: 'cat9', image: require('../profiles/cat9.png') },
  { id: 'cat10', image: require('../profiles/cat10.png') },
] as const;

export type CatAvatarId = (typeof CAT_AVATAR_OPTIONS)[number]['id'];

export const DEFAULT_CAT_AVATAR_ID: CatAvatarId = 'cat1';

export function isCatAvatarId(value: string | null | undefined): value is CatAvatarId {
  return CAT_AVATAR_OPTIONS.some((avatar) => avatar.id === value);
}

export function getCatAvatarSource(avatarId: string | null | undefined) {
  const match = CAT_AVATAR_OPTIONS.find((avatar) => avatar.id === avatarId);

  return match?.image ?? CAT_AVATAR_OPTIONS[0].image;
}
