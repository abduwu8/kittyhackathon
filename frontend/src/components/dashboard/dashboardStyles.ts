import { StyleSheet } from 'react-native';

import { colors } from '../../theme/colors';
import { fonts, lowercase } from '../../theme/fonts';

export const dashboardStyles = StyleSheet.create({
  panel: {
    gap: 20,
    paddingBottom: 8,
  },
  pageHeader: {
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  pageTitle: {
    fontFamily: fonts.bold,
    fontSize: 26,
    color: colors.ink,
    letterSpacing: -0.5,
    ...lowercase,
  },
  pageSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.stone,
    lineHeight: 20,
    ...lowercase,
  },
  section: {
    gap: 10,
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 2,
  },
  sectionIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(139, 94, 60, 0.1)',
  },
  sectionTitleWrap: {
    flex: 1,
    gap: 2,
  },
  sectionTitle: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.ink,
    letterSpacing: -0.2,
    ...lowercase,
  },
  sectionTitleAccent: {
    display: 'none',
  },
  sectionCard: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.sandBorder,
    gap: 16,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  form: {
    gap: 16,
  },
});
