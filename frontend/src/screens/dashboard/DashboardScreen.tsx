import { useCallback, useEffect, useRef, useState } from 'react';
import { Image, Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { DashboardSidebar } from '../../components/dashboard/DashboardSidebar';
import { useAppGuide } from '../../contexts/AppGuideContext';
import { useAuth } from '../../contexts/AuthContext';
import { useProfile } from '../../contexts/ProfileContext';
import {
  getDefaultDashboardSection,
  isCatCareSection,
  type DashboardSection,
} from '../../types/dashboard';
import { DashboardHomePanel } from './DashboardHomePanel';
import { DashboardCatFactsPanel } from './DashboardCatFactsPanel';
import { DashboardDiscoverPanel } from './DashboardDiscoverPanel';
import { DashboardFeedingPanel } from './DashboardFeedingPanel';
import { DashboardLitterPanel } from './DashboardLitterPanel';
import { DashboardMedicationPanel } from './DashboardMedicationPanel';
import { DashboardProfilePanel } from './DashboardProfilePanel';
import { DashboardUserProfilePanel } from './DashboardUserProfilePanel';
import { DashboardVaccinationPanel } from './DashboardVaccinationPanel';
import { Story1Screen, type StoryPhase } from '../story/Story1Screen';
import { CatBotScreen } from '../catbot/CatBotScreen';

const hamburgerIcon = require('../../cats/hamburger.png');
const SIDEBAR_WIDTH = 168;
const DRAWER_ANIMATION_MS = 300;
const MENU_HIDE_SCROLL_THRESHOLD = 36;
const MENU_ANIMATION_MS = 220;

const sectionEnter = FadeIn.duration(400).easing(Easing.out(Easing.cubic));
const sectionExit = FadeOut.duration(300).easing(Easing.in(Easing.cubic));

export function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { signOut } = useAuth();
  const { profile, hasCat } = useProfile();
  const { setActiveSection: setGuideSection, resetPeekOnHome } = useAppGuide();
  const [activeSection, setActiveSection] = useState<DashboardSection>('home');
  const hasSetInitialSection = useRef(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [storyPhase, setStoryPhase] = useState<StoryPhase>('loading');

  const scrollRef = useRef<Animated.ScrollView>(null);
  const hasAnimatedSectionChange = useRef(false);
  const sidebarOffset = useSharedValue(-SIDEBAR_WIDTH);
  const backdropOpacity = useSharedValue(0);
  const menuHidden = useSharedValue(0);

  useEffect(() => {
    setGuideSection(activeSection);
  }, [activeSection, setGuideSection]);

  useEffect(() => {
    if (activeSection === 'home') {
      resetPeekOnHome();
    }
  }, [activeSection, resetPeekOnHome]);

  useEffect(() => {
    if (!profile || hasSetInitialSection.current) {
      return;
    }

    hasSetInitialSection.current = true;
    setActiveSection(getDefaultDashboardSection());
  }, [profile]);

  const handleSectionChange = useCallback(
    (section: DashboardSection) => {
      if (section === activeSection) {
        return;
      }

      hasAnimatedSectionChange.current = true;
      setActiveSection(section);
    },
    [activeSection],
  );

  useEffect(() => {
    if (hasCat || !isCatCareSection(activeSection)) {
      return;
    }

    handleSectionChange('profile');
  }, [hasCat, activeSection, handleSectionChange]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      const y = event.contentOffset.y;

      if (y > MENU_HIDE_SCROLL_THRESHOLD) {
        menuHidden.value = withTiming(1, { duration: MENU_ANIMATION_MS });
        return;
      }

      menuHidden.value = withTiming(0, { duration: MENU_ANIMATION_MS });
    },
  });

  const openSidebar = useCallback(() => {
    setIsSidebarOpen(true);
    sidebarOffset.value = withTiming(0, {
      duration: DRAWER_ANIMATION_MS,
      easing: Easing.out(Easing.cubic),
    });
    backdropOpacity.value = withTiming(0.42, {
      duration: DRAWER_ANIMATION_MS,
      easing: Easing.out(Easing.cubic),
    });
  }, [backdropOpacity, sidebarOffset]);

  const closeSidebar = useCallback(() => {
    sidebarOffset.value = withTiming(-SIDEBAR_WIDTH, {
      duration: DRAWER_ANIMATION_MS,
      easing: Easing.in(Easing.cubic),
    });
    backdropOpacity.value = withTiming(0, {
      duration: DRAWER_ANIMATION_MS,
      easing: Easing.in(Easing.cubic),
    });
    setIsSidebarOpen(false);
  }, [backdropOpacity, sidebarOffset]);

  const toggleSidebar = useCallback(() => {
    if (isSidebarOpen) {
      closeSidebar();
      return;
    }

    openSidebar();
  }, [closeSidebar, isSidebarOpen, openSidebar]);

  const isStorySection = activeSection === 'story';
  const isDiscoverSection = activeSection === 'discover' || activeSection === 'catfacts';
  const isFullBleedSection =
    isStorySection || activeSection === 'catbot' || isDiscoverSection;

  useEffect(() => {
    if (isSidebarOpen) {
      menuHidden.value = withTiming(0, { duration: MENU_ANIMATION_MS });
    }
  }, [isSidebarOpen, menuHidden]);

  useEffect(() => {
    menuHidden.value = 0;
  }, [activeSection, menuHidden]);

  useEffect(() => {
    if (!isStorySection) {
      setStoryPhase('loading');
    }
  }, [isStorySection]);

  useEffect(() => {
    if (isStorySection && storyPhase === 'comic' && isSidebarOpen) {
      closeSidebar();
    }
  }, [isStorySection, storyPhase, isSidebarOpen, closeSidebar]);

  useEffect(() => {
    if (!isSidebarOpen || Platform.OS !== 'web' || typeof window === 'undefined') {
      return;
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeSidebar();
      }
    };

    window.addEventListener('keydown', closeOnEscape);

    return () => {
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [closeSidebar, isSidebarOpen]);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
    setIsSigningOut(false);
  };

  const sidebarAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: sidebarOffset.value }],
  }));

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const menuAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(menuHidden.value, [0, 1], [1, 0], Extrapolation.CLAMP),
    transform: [
      {
        translateX: interpolate(menuHidden.value, [0, 1], [0, -32], Extrapolation.CLAMP),
      },
      {
        scale: interpolate(menuHidden.value, [0, 1], [1, 0.92], Extrapolation.CLAMP),
      },
    ],
  }));

  const showMenuButton = activeSection !== 'catbot' && (!isStorySection || storyPhase !== 'comic');

  const renderPanel = () => {
    if (!hasCat && isCatCareSection(activeSection)) {
      return <DashboardUserProfilePanel />;
    }

    switch (activeSection) {
      case 'home':
        return <DashboardHomePanel onNavigate={handleSectionChange} />;
      case 'litter':
        return <DashboardLitterPanel />;
      case 'medication':
        return <DashboardMedicationPanel />;
      case 'vaccination':
        return <DashboardVaccinationPanel />;
      case 'feeding':
        return <DashboardFeedingPanel />;
      case 'discover':
        return <DashboardDiscoverPanel onScroll={scrollHandler} />;
      case 'catfacts':
        return <DashboardCatFactsPanel onScroll={scrollHandler} />;
      case 'story':
        return <Story1Screen onPhaseChange={setStoryPhase} />;
      case 'catbot':
        return <CatBotScreen onOpenSidebar={openSidebar} />;
      case 'profile':
        return hasCat ? <DashboardProfilePanel /> : <DashboardUserProfilePanel />;
      default:
        return hasCat ? <DashboardProfilePanel /> : <DashboardUserProfilePanel />;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <View style={styles.page}>
        <Animated.View
          key={activeSection}
          entering={hasAnimatedSectionChange.current ? sectionEnter : undefined}
          exiting={sectionExit}
          style={styles.sectionShell}
        >
          {isFullBleedSection ? (
            <View style={styles.storyMain}>{renderPanel()}</View>
          ) : (
            <Animated.ScrollView
              ref={scrollRef}
              style={styles.main}
              contentContainerStyle={[styles.mainContent, { paddingTop: insets.top + 88 }]}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              automaticallyAdjustKeyboardInsets
              showsVerticalScrollIndicator={false}
              onScroll={scrollHandler}
              scrollEventThrottle={16}
            >
              {renderPanel()}
            </Animated.ScrollView>
          )}
        </Animated.View>

        {showMenuButton ? (
          <Animated.View
            style={[
              styles.header,
              { paddingTop: insets.top + 8 },
              isStorySection ? null : menuAnimatedStyle,
            ]}
            pointerEvents="box-none"
          >
            <Pressable
              onPress={toggleSidebar}
              style={({ pressed }) => [styles.menuButton, pressed ? styles.menuButtonPressed : null]}
              accessibilityRole="button"
              accessibilityLabel={isSidebarOpen ? 'close navigation menu' : 'open navigation menu'}
            >
              <Image source={hamburgerIcon} style={styles.menuIcon} resizeMode="contain" />
            </Pressable>
          </Animated.View>
        ) : null}
      </View>

      <Animated.View
        pointerEvents={isSidebarOpen ? 'auto' : 'none'}
        style={[styles.backdrop, backdropAnimatedStyle]}
      >
        <Pressable style={styles.backdropPressable} onPress={closeSidebar} />
      </Animated.View>

      <Animated.View style={[styles.sidebar, sidebarAnimatedStyle]}>
        <DashboardSidebar
          activeSection={activeSection}
          hasCat={hasCat}
          onSectionChange={handleSectionChange}
          onSignOut={handleSignOut}
          isSigningOut={isSigningOut}
          onClose={closeSidebar}
        />
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  page: {
    flex: 1,
    overflow: 'hidden',
  },
  sectionShell: {
    ...StyleSheet.absoluteFillObject,
  },
  storyMain: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 20,
    paddingBottom: 8,
    backgroundColor: 'transparent',
  },
  menuButton: {
    width: 96,
    height: 96,
    // alignItems: 'center',
    // justifyContent: 'center',
    borderRadius: 20,
    left: -12,
  },
  menuButtonPressed: {
    opacity: 0.75,
  },
  menuIcon: {
    width: 72,
    height: 72,
  },
  main: {
    flex: 1,
  },
  mainContent: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#2B2521',
    zIndex: 20,
  },
  backdropPressable: {
    flex: 1,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    zIndex: 30,
    shadowColor: '#2B2521',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 12,
  },
});
