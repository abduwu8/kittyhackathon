import { useMemo } from 'react';
import { Image, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { pickRandomLoaderSource } from '../../lib/loaderAssets';
import { colors } from '../../theme/colors';
import { fonts, lowercase } from '../../theme/fonts';

type LoadingCatProps = {
  size?: number;
  showLabel?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function LoadingCat({ size = 120, showLabel, style }: LoadingCatProps) {
  const source = useMemo(() => pickRandomLoaderSource(), []);
  const shouldShowLabel = showLabel ?? size >= 64;

  return (
    <View style={[styles.container, style]}>
      <Image source={source} style={{ width: size, height: size }} resizeMode="contain" />
      {shouldShowLabel ? <Text style={styles.label}>Purr-cessing...</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.coco,
    letterSpacing: 0.2,
    ...lowercase,
  },
});
