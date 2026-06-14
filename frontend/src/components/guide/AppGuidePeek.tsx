import { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppGuide } from '../../contexts/AppGuideContext';

const catPeek = require('../../cats/catpeek.png');

const PEEK_SIZE = 96;
const CLIP_WIDTH = 64;
const HIDDEN_SLIDE = 60;
const EDGE_NUDGE = 16;
const MIN_INTERVAL_MS = 45_000;
const MAX_INTERVAL_MS = 95_000;
const INITIAL_DELAY_MS = 28_000;
const HOME_RESET_DELAY_MS = 14_000;
const PEEK_VISIBLE_MS = 9_000;

type PeekSide = 'left' | 'right';

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function pickSide(): PeekSide {
  return Math.random() < 0.5 ? 'left' : 'right';
}

function pickVerticalOffset(insetsTop: number, insetsBottom: number) {
  const { height } = Dimensions.get('window');
  const minY = insetsTop + 96;
  const maxY = height - insetsBottom - PEEK_SIZE - 24;

  if (maxY <= minY) {
    return minY;
  }

  return randomBetween(minY, maxY);
}

export function AppGuidePeek() {
  const insets = useSafeAreaInsets();
  const { isOpen, peekDisabled, isPeekVisible, openGuide, setPeekVisible, peekResetKey } =
    useAppGuide();

  const [side, setSide] = useState<PeekSide>('left');
  const [topOffset, setTopOffset] = useState(0);
  const slideOffset = useSharedValue(HIDDEN_SLIDE);
  const peekSide = useSharedValue(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  const hidePeek = useCallback(() => {
    slideOffset.value = withTiming(HIDDEN_SLIDE, {
      duration: 420,
      easing: Easing.in(Easing.cubic),
    });

    setTimeout(() => {
      setPeekVisible(false);
    }, 420);
  }, [setPeekVisible, slideOffset]);

  const scheduleNextPeek = useCallback(() => {
    if (peekDisabled || isOpen) {
      return;
    }

    clearTimers();

    const delay = randomBetween(MIN_INTERVAL_MS, MAX_INTERVAL_MS);

    timeoutRef.current = setTimeout(() => {
      if (peekDisabled || isOpen) {
        return;
      }

      const nextSide = pickSide();
      setSide(nextSide);
      peekSide.value = nextSide === 'left' ? 0 : 1;
      setTopOffset(pickVerticalOffset(insets.top, insets.bottom));
      setPeekVisible(true);

      slideOffset.value = HIDDEN_SLIDE;
      slideOffset.value = withSequence(
        withTiming(0, { duration: 520, easing: Easing.out(Easing.cubic) }),
        withTiming(-3, { duration: 280, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 280, easing: Easing.inOut(Easing.quad) }),
      );

      hideTimeoutRef.current = setTimeout(() => {
        hidePeek();
        scheduleNextPeek();
      }, PEEK_VISIBLE_MS);
    }, delay);
  }, [
    clearTimers,
    hidePeek,
    insets.bottom,
    insets.top,
    isOpen,
    peekDisabled,
    peekSide,
    setPeekVisible,
    slideOffset,
  ]);

  useEffect(() => {
    if (peekDisabled) {
      clearTimers();
      setPeekVisible(false);
      return;
    }

    if (isOpen) {
      clearTimers();
      setPeekVisible(false);
      return;
    }

    clearTimers();
    const delay = peekResetKey > 0 ? HOME_RESET_DELAY_MS : INITIAL_DELAY_MS;

    timeoutRef.current = setTimeout(() => {
      scheduleNextPeek();
    }, delay);

    return clearTimers;
  }, [clearTimers, isOpen, peekDisabled, peekResetKey, scheduleNextPeek, setPeekVisible]);

  const slideStyle = useAnimatedStyle(() => {
    const isLeft = peekSide.value === 0;
    const translateX = isLeft ? -slideOffset.value : slideOffset.value;

    return {
      transform: [{ translateX }],
    };
  });

  const imageStyle = side === 'left' ? styles.peekImageLeft : styles.peekImageRight;
  const slideWrapperStyle = side === 'left' ? styles.slideWrapperLeft : styles.slideWrapperRight;

  if (peekDisabled || !isPeekVisible || isOpen) {
    return null;
  }

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.clip,
        side === 'left' ? styles.clipLeft : styles.clipRight,
        { top: topOffset },
      ]}
    >
      <Pressable
        onPress={() => {
          clearTimers();
          openGuide();
        }}
        accessibilityRole="button"
        accessibilityLabel="open app guide"
        style={({ pressed }) => [styles.pressable, pressed ? styles.pressablePressed : null]}
      >
        <Animated.View style={[styles.slideWrapper, slideWrapperStyle, slideStyle]}>
          <Animated.Image source={catPeek} style={[styles.peekImage, imageStyle]} resizeMode="cover" />
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  clip: {
    position: 'absolute',
    zIndex: 45,
    width: CLIP_WIDTH,
    height: PEEK_SIZE,
    overflow: 'hidden',
  },
  clipLeft: {
    left: 0,
  },
  clipRight: {
    right: 0,
  },
  pressable: {
    width: PEEK_SIZE,
    height: PEEK_SIZE,
  },
  pressablePressed: {
    opacity: 0.85,
  },
  slideWrapper: {
    width: PEEK_SIZE,
    height: PEEK_SIZE,
  },
  slideWrapperLeft: {
    marginLeft: 0,
  },
  slideWrapperRight: {
    marginLeft: CLIP_WIDTH - PEEK_SIZE,
  },
  peekImage: {
    width: PEEK_SIZE,
    height: PEEK_SIZE,
  },
  peekImageLeft: {
    transform: [{ rotate: '90deg' }, { translateX: -EDGE_NUDGE }, { translateY: 4 }],
  },
  peekImageRight: {
    transform: [{ rotate: '-90deg' }, { translateX: EDGE_NUDGE }, { translateY: 4 }],
  },
});
