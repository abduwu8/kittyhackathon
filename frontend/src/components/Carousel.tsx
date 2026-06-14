import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  Children,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react-native';
import {
  FlatList,
  Pressable,
  StyleSheet,
  View,
  type ListRenderItemInfo,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors } from '../theme/colors';

type CarouselContextValue = {
  itemWidth: number;
  activeIndex: number;
  itemCount: number;
  setActiveIndex: (index: number) => void;
  setItemCount: (count: number) => void;
  setItemWidth: (width: number) => void;
  scrollToIndex: (index: number) => void;
  registerListRef: (ref: FlatList<ReactElement> | null) => void;
  onActiveIndexChange?: (index: number) => void;
  onReachEnd?: () => void;
  isLoadingMore?: boolean;
};

const CarouselContext = createContext<CarouselContextValue | null>(null);

function useCarousel() {
  const context = useContext(CarouselContext);

  if (!context) {
    throw new Error('useCarousel must be used within a <Carousel />');
  }

  return context;
}

type CarouselProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onActiveIndexChange?: (index: number) => void;
  onReachEnd?: () => void;
  isLoadingMore?: boolean;
};

function Carousel({
  children,
  style,
  onActiveIndexChange,
  onReachEnd,
  isLoadingMore = false,
}: CarouselProps) {
  const listRef = useRef<FlatList<ReactElement> | null>(null);
  const [itemWidth, setItemWidth] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [itemCount, setItemCount] = useState(0);

  const registerListRef = useCallback((ref: FlatList<ReactElement> | null) => {
    listRef.current = ref;
  }, []);

  const scrollToIndex = useCallback(
    (index: number) => {
      if (!listRef.current || itemWidth <= 0 || itemCount <= 0) {
        return;
      }

      const nextIndex = Math.max(0, Math.min(index, itemCount - 1));
      listRef.current.scrollToOffset({ offset: nextIndex * itemWidth, animated: true });
      setActiveIndex(nextIndex);
      onActiveIndexChange?.(nextIndex);
    },
    [itemCount, itemWidth, onActiveIndexChange],
  );

  const value = useMemo(
    () => ({
      itemWidth,
      activeIndex,
      itemCount,
      setActiveIndex,
      setItemCount,
      setItemWidth,
      scrollToIndex,
      registerListRef,
      onActiveIndexChange,
      onReachEnd,
      isLoadingMore,
    }),
    [
      activeIndex,
      isLoadingMore,
      itemCount,
      itemWidth,
      onActiveIndexChange,
      onReachEnd,
      registerListRef,
      scrollToIndex,
    ],
  );

  return (
    <CarouselContext.Provider value={value}>
      <View
        style={[styles.root, style]}
        onLayout={(event) => {
          const width = Math.round(event.nativeEvent.layout.width);
          if (width > 0 && width !== itemWidth) {
            setItemWidth(width);
          }
        }}
      >
        {children}
      </View>
    </CarouselContext.Provider>
  );
}

type CarouselContentProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

function CarouselContent({ children, style }: CarouselContentProps) {
  const context = useCarousel();
  const {
    activeIndex,
    itemWidth,
    setActiveIndex,
    setItemCount,
    registerListRef,
  } = context;

  const items = useMemo(
    () =>
      Children.toArray(children).filter(
        (child): child is ReactElement => isValidElement(child),
      ),
    [children],
  );

  useEffect(() => {
    setItemCount(items.length);
    const maxIndex = Math.max(items.length - 1, 0);
    if (activeIndex > maxIndex) {
      setActiveIndex(maxIndex);
      context.onActiveIndexChange?.(maxIndex);
    }
  }, [activeIndex, context, items.length, setActiveIndex, setItemCount]);

  const handleMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (itemWidth <= 0) {
        return;
      }

      const nextIndex = Math.round(event.nativeEvent.contentOffset.x / itemWidth);
      setActiveIndex(nextIndex);
      context.onActiveIndexChange?.(nextIndex);
    },
    [context, itemWidth, setActiveIndex],
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<ReactElement>) => (
      <View style={itemWidth > 0 ? { width: itemWidth } : styles.itemFallback}>
        {item}
      </View>
    ),
    [itemWidth],
  );

  if (itemWidth <= 0) {
    return <View style={[styles.content, style]}>{children}</View>;
  }

  return (
    <View style={[styles.content, style]}>
      <FlatList
        ref={registerListRef}
        data={items}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, index) => String(index)}
        renderItem={renderItem}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        getItemLayout={(_, index) => ({
          length: itemWidth,
          offset: itemWidth * index,
          index,
        })}
      />
    </View>
  );
}

type CarouselItemProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

function CarouselItem({ children, style }: CarouselItemProps) {
  return <View style={[styles.item, style]}>{children}</View>;
}

type CarouselNavButtonProps = {
  style?: StyleProp<ViewStyle>;
};

function CarouselPrevious({ style }: CarouselNavButtonProps) {
  const { activeIndex, scrollToIndex } = useCarousel();
  const canScrollPrev = activeIndex > 0;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Previous slide"
      disabled={!canScrollPrev}
      onPress={() => scrollToIndex(activeIndex - 1)}
      style={({ pressed }) => [
        styles.navButton,
        styles.navButtonPrevious,
        !canScrollPrev ? styles.navButtonDisabled : null,
        pressed && canScrollPrev ? styles.navButtonPressed : null,
        style,
      ]}
    >
      <ArrowLeft size={18} color={colors.ink} strokeWidth={2} />
    </Pressable>
  );
}

function CarouselNext({ style }: CarouselNavButtonProps) {
  const { activeIndex, itemCount, scrollToIndex, onReachEnd, isLoadingMore } = useCarousel();
  const isAtEnd = activeIndex >= itemCount - 1;
  const canLoadMore = Boolean(isAtEnd && onReachEnd);
  const canScrollNext = !isAtEnd || canLoadMore;
  const isDisabled = !canScrollNext || isLoadingMore;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={canLoadMore ? 'Load more slides' : 'Next slide'}
      disabled={isDisabled}
      onPress={() => {
        if (isAtEnd && onReachEnd) {
          onReachEnd();
          return;
        }

        scrollToIndex(activeIndex + 1);
      }}
      style={({ pressed }) => [
        styles.navButton,
        styles.navButtonNext,
        isDisabled ? styles.navButtonDisabled : null,
        pressed && !isDisabled ? styles.navButtonPressed : null,
        style,
      ]}
    >
      <ArrowRight size={18} color={colors.ink} strokeWidth={2} />
    </Pressable>
  );
}

const NAV_BUTTON_SIZE = 36;

const styles = StyleSheet.create({
  root: {
    position: 'relative',
    width: '100%',
    maxWidth: 280,
    alignSelf: 'center',
  },
  content: {
    overflow: 'hidden',
    borderRadius: 4,
  },
  itemFallback: {
    width: '100%',
  },
  item: {
    paddingHorizontal: 4,
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    marginTop: -(NAV_BUTTON_SIZE / 2),
    width: NAV_BUTTON_SIZE,
    height: NAV_BUTTON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.ink,
    backgroundColor: colors.surface,
    shadowColor: colors.ink,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  navButtonPrevious: {
    left: 6,
    zIndex: 2,
  },
  navButtonNext: {
    right: 6,
    zIndex: 2,
  },
  navButtonDisabled: {
    opacity: 0.35,
  },
  navButtonPressed: {
    transform: [{ translateX: 1 }, { translateY: 1 }],
    shadowOffset: { width: 1, height: 1 },
  },
});

const CarouselObject = Object.assign(Carousel, {
  Content: CarouselContent,
  Item: CarouselItem,
  Previous: CarouselPrevious,
  Next: CarouselNext,
});

export { CarouselObject as Carousel };
