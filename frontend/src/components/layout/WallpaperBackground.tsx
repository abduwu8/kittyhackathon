import type { ReactNode } from 'react';
import { ImageBackground, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

const wallpaper = require('../../cats/wallpaper.jpg');

type WallpaperBackgroundProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function WallpaperBackground({ children, style }: WallpaperBackgroundProps) {
  return (
    <ImageBackground source={wallpaper} style={[styles.background, style]} resizeMode="cover">
      {children}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
