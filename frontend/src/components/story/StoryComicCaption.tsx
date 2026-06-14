import { MotiView } from 'moti';
import { StyleSheet, Text, View } from 'react-native';

import { STORY_LABEL_COLOR } from '../../data/stories';
import { colors } from '../../theme/colors';
import { fonts, lowercase } from '../../theme/fonts';

type StoryComicCaptionProps = {
  caption: string | null;
  panelKey: number;
  accentColor?: string;
};

export function StoryComicCaption({
  caption,
  panelKey,
  accentColor = STORY_LABEL_COLOR,
}: StoryComicCaptionProps) {
  if (!caption) {
    return null;
  }

  return (
    <MotiView
      key={panelKey}
      from={{ opacity: 0, translateY: 6 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 320 }}
      style={styles.wrap}
    >
      <View style={styles.shadow}>
        <View style={styles.box}>
          <View style={[styles.topAccent, { backgroundColor: accentColor }]} />
          <View style={styles.textWrap}>
            <Text style={styles.text} maxFontSizeMultiplier={1.35}>
              {caption}
            </Text>
          </View>
        </View>
      </View>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
  },
  shadow: {
    shadowColor: colors.ink,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  box: {
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  topAccent: {
    height: 5,
    width: '100%',
  },
  textWrap: {
    paddingHorizontal: 16,
    paddingTop: 13,
    paddingBottom: 15,
  },
  text: {
    fontFamily: fonts.medium,
    fontSize: 15,
    lineHeight: 23,
    letterSpacing: 0.15,
    color: colors.ink,
    ...lowercase,
  },
});
