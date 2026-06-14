import { ArrowUp, X } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppGuide } from '../../contexts/AppGuideContext';
import { useProfile } from '../../contexts/ProfileContext';
import {
  askAppGuide,
  createWelcomeMessage,
  getQuickPrompts,
  type AppGuideContext,
  type AppGuideMessage,
} from '../../lib/appGuide';
import { colors } from '../../theme/colors';
import { fonts, lowercase } from '../../theme/fonts';

const guideAvatar = require('../../sidebaricons/guide.png');

function createMessageId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

type GuideExchange = {
  id: string;
  question?: string;
  answer: string;
};

function buildExchanges(messages: AppGuideMessage[]): GuideExchange[] {
  const exchanges: GuideExchange[] = [];
  let pendingQuestion: string | undefined;

  for (const message of messages) {
    if (message.id === 'welcome') {
      exchanges.push({ id: message.id, answer: message.content });
      continue;
    }

    if (message.role === 'user') {
      pendingQuestion = message.content;
      continue;
    }

    exchanges.push({
      id: message.id,
      question: pendingQuestion,
      answer: message.content,
    });
    pendingQuestion = undefined;
  }

  return exchanges;
}

export function AppGuideSheet() {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const panelMaxHeight = windowHeight * 0.82;
  const { isOpen, closeGuide, activeSection, disablePeekPermanently, peekDisabled } = useAppGuide();
  const { profile, hasCat } = useProfile();
  const scrollRef = useRef<ScrollView>(null);
  const wasOpenRef = useRef(false);

  const guideContext = useMemo<AppGuideContext>(
    () => ({
      hasCat,
      catName: profile?.cat_name,
      userName: profile?.user_name,
      favoriteCatBreed: profile?.favorite_cat_breed,
      activeSection,
    }),
    [activeSection, hasCat, profile?.cat_name, profile?.favorite_cat_breed, profile?.user_name],
  );

  const quickPrompts = useMemo(() => getQuickPrompts(guideContext), [guideContext]);

  const [messages, setMessages] = useState<AppGuideMessage[]>(() => [
    createWelcomeMessage(guideContext),
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      setMessages([createWelcomeMessage(guideContext)]);
      setInput('');
    }

    wasOpenRef.current = isOpen;
  }, [guideContext, isOpen]);

  const exchanges = useMemo(() => buildExchanges(messages), [messages]);
  const showPrompts = exchanges.length <= 1 && !isSending;

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [exchanges, isOpen, isSending, scrollToBottom]);

  const submitQuestion = async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed || isSending) {
      return;
    }

    const userMessage: AppGuideMessage = {
      id: createMessageId(),
      role: 'user',
      content: trimmed,
    };

    const nextHistory = [...messages, userMessage];

    setMessages(nextHistory);
    setInput('');
    setIsSending(true);

    try {
      const reply = await askAppGuide(nextHistory, guideContext);

      setMessages((current) => [
        ...current,
        {
          id: createMessageId(),
          role: 'assistant',
          content: reply || 'Open the menu on the top left and pick the section you need.',
        },
      ]);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message.toLowerCase()
          : 'something went wrong. please try again.';

      setMessages((current) => [
        ...current,
        {
          id: createMessageId(),
          role: 'assistant',
          content: `Sorry, I couldn't reach the guide right now. ${message}`,
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      transparent
      onRequestClose={closeGuide}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={closeGuide} accessibilityLabel="close guide" />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
          keyboardVerticalOffset={insets.top}
          pointerEvents="box-none"
        >
          <View
            style={[
              styles.panel,
              { paddingBottom: Math.max(insets.bottom, 12), maxHeight: panelMaxHeight },
            ]}
          >
            <View style={styles.header}>
              <Image source={guideAvatar} style={styles.headerAvatar} resizeMode="cover" />
              <View style={styles.headerTextBlock}>
                <Text style={styles.headerTitle}>app guide</Text>
                <Text style={styles.headerSubtitle}>how to use codingkitty</Text>
              </View>
              <Pressable
                onPress={closeGuide}
                style={({ pressed }) => [styles.closeButton, pressed ? styles.closeButtonPressed : null]}
                accessibilityRole="button"
                accessibilityLabel="close guide"
              >
                <X size={16} color={colors.ink} strokeWidth={2.4} />
              </Pressable>
            </View>

            <View style={styles.contentArea}>
              <ScrollView
                ref={scrollRef}
                style={styles.contentScroll}
                contentContainerStyle={styles.contentScrollInner}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
              {showPrompts ? (
                <View style={styles.promptSection}>
                  <Text style={styles.promptLabel}>popular topics</Text>
                  <View style={styles.promptWrap}>
                    {quickPrompts.map((prompt) => (
                      <Pressable
                        key={prompt}
                        onPress={() => submitQuestion(prompt)}
                        style={({ pressed }) => [
                          styles.promptChip,
                          pressed ? styles.promptChipPressed : null,
                        ]}
                      >
                        <Text style={styles.promptChipText}>{prompt.toLowerCase()}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              ) : null}

              {exchanges.map((exchange, index) => (
                <View key={exchange.id} style={styles.exchangeBlock}>
                  {exchange.question ? (
                    <Text style={styles.questionLabel}>{exchange.question.toLowerCase()}</Text>
                  ) : null}

                  <View style={[styles.answerCard, index === 0 ? styles.welcomeCard : null]}>
                    <Text style={styles.answerText}>{exchange.answer.toLowerCase()}</Text>
                  </View>
                </View>
              ))}

              {isSending ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color={colors.coco} />
                  <Text style={styles.loadingText}>looking that up...</Text>
                </View>
              ) : null}
              </ScrollView>
            </View>

            <View style={styles.footer}>
              <View style={styles.searchRow}>
                <TextInput
                  value={input}
                  onChangeText={setInput}
                  placeholder="ask how to do something..."
                  placeholderTextColor={colors.stone}
                  style={styles.searchInput}
                  maxLength={400}
                  editable={!isSending}
                  returnKeyType="send"
                  onSubmitEditing={() => {
                    if (input.trim() && !isSending) {
                      submitQuestion(input);
                    }
                  }}
                  blurOnSubmit={false}
                />
                <Pressable
                  onPress={() => submitQuestion(input)}
                  disabled={!input.trim() || isSending}
                  style={({ pressed }) => [
                    styles.sendButton,
                    !input.trim() || isSending ? styles.sendButtonDisabled : null,
                    pressed ? styles.sendButtonPressed : null,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="ask guide"
                >
                  <ArrowUp size={16} color={colors.onPrimary} strokeWidth={2.4} />
                </Pressable>
              </View>

              {!peekDisabled ? (
                <Pressable
                  onPress={disablePeekPermanently}
                  style={({ pressed }) => [styles.peekLink, pressed ? styles.peekLinkPressed : null]}
                >
                  <Text style={styles.peekLinkText}>hide peeking cat on this device</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(43, 37, 33, 0.45)',
  },
  keyboardAvoid: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  panel: {
    minHeight: 320,
    width: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 2,
    borderBottomWidth: 0,
    borderColor: colors.ink,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    flexShrink: 1,
  },
  contentArea: {
    flexGrow: 1,
    flexShrink: 1,
    minHeight: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.sandBorder,
    backgroundColor: colors.background,
  },
  headerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: colors.sandBorder,
    backgroundColor: colors.sand,
  },
  headerTextBlock: {
    flex: 1,
    gap: 1,
  },
  headerTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.ink,
    ...lowercase,
  },
  headerSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.stone,
    ...lowercase,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: colors.sandBorder,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonPressed: {
    opacity: 0.75,
  },
  contentScroll: {
    flex: 1,
  },
  contentScrollInner: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    gap: 12,
  },
  promptSection: {
    gap: 8,
  },
  promptLabel: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: colors.stone,
    ...lowercase,
  },
  promptWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  promptChip: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.sandBorder,
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  promptChipPressed: {
    backgroundColor: colors.sand,
  },
  promptChipText: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: colors.ink,
    ...lowercase,
  },
  exchangeBlock: {
    gap: 6,
  },
  questionLabel: {
    alignSelf: 'flex-end',
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: colors.stone,
    ...lowercase,
  },
  answerCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.sandBorder,
    backgroundColor: colors.background,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderLeftWidth: 3,
    borderLeftColor: colors.coco,
  },
  welcomeCard: {
    backgroundColor: colors.surface,
  },
  answerText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.ink,
    ...lowercase,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  loadingText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.stone,
    ...lowercase,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.sandBorder,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    gap: 8,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.sandBorder,
    backgroundColor: colors.background,
    paddingHorizontal: 14,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.ink,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.coco,
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
  sendButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }],
  },
  peekLink: {
    alignSelf: 'center',
  },
  peekLinkPressed: {
    opacity: 0.7,
  },
  peekLinkText: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: colors.stone,
    ...lowercase,
  },
});
