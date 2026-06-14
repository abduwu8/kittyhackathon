import { StyleSheet } from 'react-native';

import { colors } from '../../theme/colors';

export const DISCOVER_ACCENT = '#A8C3A0';
export const DISCOVER_CARD_BORDER = 3;
export const DISCOVER_PANEL_RADIUS = 8;

export const discoverComicStyles = StyleSheet.create({
  wallpaper: {
    ...StyleSheet.absoluteFillObject,
  },
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 14,
    paddingBottom: 32,
    gap: 18,
  },
  comicShadow: {
    shadowColor: colors.ink,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  comicShadowSm: {
    shadowColor: colors.ink,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  comicCard: {
    borderWidth: DISCOVER_CARD_BORDER,
    borderColor: colors.ink,
    borderRadius: 4,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  comicPanel: {
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: DISCOVER_PANEL_RADIUS,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  comicButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: 4,
    backgroundColor: colors.surface,
    shadowColor: colors.ink,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  comicButtonPressed: {
    transform: [{ translateX: 2 }, { translateY: 2 }],
    shadowOffset: { width: 1, height: 1 },
  },
  comicButtonDisabled: {
    opacity: 0.45,
  },
});
