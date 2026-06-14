import type { ReactNode, Ref } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  type ScrollViewProps,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type KeyboardAwareScrollViewProps = ScrollViewProps & {
  children: ReactNode;
  scrollRef?: Ref<ScrollView>;
  keyboardVerticalOffset?: number;
  containerStyle?: ScrollViewProps['style'];
};

export function KeyboardAwareScrollView({
  children,
  contentContainerStyle,
  scrollRef,
  keyboardVerticalOffset,
  containerStyle,
  style,
  ...scrollProps
}: KeyboardAwareScrollViewProps) {
  const insets = useSafeAreaInsets();
  const offset = keyboardVerticalOffset ?? insets.top;

  return (
    <KeyboardAvoidingView
      style={[styles.flex, containerStyle, style]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={offset}
    >
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[styles.content, contentContainerStyle]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets
        showsVerticalScrollIndicator={false}
        {...scrollProps}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
});
