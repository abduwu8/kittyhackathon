import { useEffect } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { ToasterCatTheme } from '../../lib/catToastAssets';
import { fonts, lowercase } from '../../theme/fonts';

export type CatToastPayload = {
  title: string;
  message: string;
  theme: ToasterCatTheme;
};

type CatToasterProps = {
  toast: CatToastPayload | null;
  onDismiss: () => void;
};

const TOAST_DURATION_MS = 3200;
const CAT_WIDTH = 108;
const CAT_HEIGHT = 132;

export function CatToaster({ toast, onDismiss }: CatToasterProps) {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(-160);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (!toast) {
      return;
    }

    translateY.value = withTiming(0, {
      duration: 380,
      easing: Easing.out(Easing.cubic),
    });
    opacity.value = withTiming(1, { duration: 300 });

    const timer = setTimeout(() => {
      translateY.value = withTiming(-160, {
        duration: 320,
        easing: Easing.in(Easing.cubic),
      });
      opacity.value = withTiming(0, { duration: 280 }, (finished) => {
        if (finished) {
          runOnJS(onDismiss)();
        }
      });
    }, TOAST_DURATION_MS);

    return () => clearTimeout(timer);
  }, [toast, onDismiss, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!toast) {
    return null;
  }

  const { theme } = toast;

  return (
    <View pointerEvents="box-none" style={[styles.host, { top: insets.top + 12 }]}>
      <Animated.View style={[styles.wrapper, animatedStyle]}>
        <Pressable
          onPress={onDismiss}
          style={[
            styles.toast,
            {
              backgroundColor: theme.backgroundColor,
              borderColor: theme.borderColor,
            },
          ]}
        >
          <Image source={theme.image} style={styles.cat} resizeMode="contain" />
          <View style={styles.textBlock}>
            <Text style={[styles.title, { color: theme.titleColor }]}>{toast.title}</Text>
            <Text style={[styles.message, { color: theme.messageColor }]}>{toast.message}</Text>
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 100,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  wrapper: {
    width: '100%',
    maxWidth: 360,
    overflow: 'visible',
  },
  toast: {
    position: 'relative',
    minHeight: 84,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1.5,
    paddingRight: 18,
    paddingVertical: 16,
    paddingLeft: 92,
    shadowColor: '#2B2521',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'visible',
  },
  cat: {
    position: 'absolute',
    left: -10,
    top: -28,
    width: CAT_WIDTH,
    height: CAT_HEIGHT,
  },
  textBlock: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 17,
    letterSpacing: -0.2,
    ...lowercase,
  },
  message: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    lineHeight: 20,
    ...lowercase,
  },
});
