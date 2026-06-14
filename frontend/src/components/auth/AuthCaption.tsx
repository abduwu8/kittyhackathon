import type { ReactNode } from 'react';
import { StyleSheet, Text, type TextStyle } from 'react-native';

import { colors } from '../../theme/colors';
import { fonts, lowercase } from '../../theme/fonts';

type AuthCaptionProps = {
  children: ReactNode;
  align?: 'left' | 'center';
  variant?: 'default' | 'emphasis';
  style?: TextStyle;
};

export function AuthCaption({
  children,
  align = 'left',
  variant = 'default',
  style,
}: AuthCaptionProps) {
  return (
    <Text
      style={[
        styles.text,
        variant === 'emphasis' ? styles.textEmphasis : null,
        align === 'center' ? styles.textCenter : null,
        style,
      ]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.stone,
    lineHeight: 22,
    ...lowercase,
  },
  textEmphasis: {
    fontFamily: fonts.semibold,
    color: colors.coco,
  },
  textCenter: {
    textAlign: 'center',
  },
});
