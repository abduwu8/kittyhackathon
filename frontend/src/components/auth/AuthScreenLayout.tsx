import type { ReactNode } from 'react';
import { Image, StyleSheet, View, useWindowDimensions } from 'react-native';

import { CrowdComponent } from '../CrowdComponent';
import { CROWD_LAYOUT } from '../crowd/config';
import { KeyboardAwareScrollView } from '../layout/KeyboardAwareScrollView';

const catAppBackground = require('../../cats/Cat_App_BG.png');
const BOTTOM_GRADIENT_OPACITY = 0.68;

type AuthScreenLayoutProps = {
  children: ReactNode;
  showBottomGradient?: boolean;
};

export function AuthScreenLayout({
  children,
  showBottomGradient = false,
}: AuthScreenLayoutProps) {
  const { height } = useWindowDimensions();
  const crowdHeight = height * CROWD_LAYOUT.heightRatio;
  const crowdBottomOffset = height * CROWD_LAYOUT.bottomOffsetRatio;

  return (
    <View style={styles.container}>
      <View
        pointerEvents="none"
        style={[styles.crowdLayer, { height: crowdHeight, bottom: crowdBottomOffset }]}
      >
        <CrowdComponent />
      </View>

      {showBottomGradient ? (
        <View
          pointerEvents="none"
          style={[styles.gradientOverlay, { height: crowdHeight }]}
        >
          <Image
            source={catAppBackground}
            style={styles.gradientImage}
            resizeMode="stretch"
          />
        </View>
      ) : null}

      <KeyboardAwareScrollView
        style={styles.contentLayer}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: crowdHeight * CROWD_LAYOUT.contentPaddingRatio + crowdBottomOffset },
        ]}
      >
        {children}
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  crowdLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  gradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    zIndex: 1,
  },
  gradientImage: {
    width: '100%',
    height: '100%',
    opacity: BOTTOM_GRADIENT_OPACITY,
  },
  contentLayer: {
    flex: 1,
    zIndex: 2,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 48,
    gap: 32,
  },
});
