import { PanelLeftOpen, PawPrint } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  Keyboard,
  type KeyboardEvent,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChatMessage } from '../../components/catbot/ChatMessage';
import { useProfile } from '../../contexts/ProfileContext';
import {
  askCatBot,
  createWelcomeMessage,
  type CatBotContext,
  type CatBotMessage,
} from '../../lib/catBot';
import { getCatAvatarSource } from '../../lib/catAvatars';
import { colors } from '../../theme/colors';
import { fonts, lowercase } from '../../theme/fonts';

const storyWallpaper = require('../../cats/wallpaper4.jpg');
const catBotAvatar = require('../../cats/catbot.png');
const DEFAULT_INPUT_BAR_HEIGHT = 64;

function createMessageId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getKeyboardHeight(event: KeyboardEvent) {
  const { height: windowHeight } = Dimensions.get('window');
  const keyboardTop = event.endCoordinates.screenY;
  const measuredHeight = windowHeight - keyboardTop;

  if (measuredHeight > 0) {
    return measuredHeight;
  }

  return event.endCoordinates.height;
}

type CatBotScreenProps = {
  onOpenSidebar: () => void;
};

export function CatBotScreen({ onOpenSidebar }: CatBotScreenProps) {
  const insets = useSafeAreaInsets();
  const { profile, hasCat } = useProfile();
  const listRef = useRef<FlatList<CatBotMessage>>(null);

  const botContext = useMemo<CatBotContext>(
    () => ({
      hasCat,
      catName: profile?.cat_name,
      userName: profile?.user_name,
      favoriteCatBreed: profile?.favorite_cat_breed,
    }),
    [hasCat, profile?.cat_name, profile?.favorite_cat_breed, profile?.user_name],
  );

  const userAvatar = getCatAvatarSource(profile?.cat_avatar);

  const [messages, setMessages] = useState<CatBotMessage[]>(() => [createWelcomeMessage(botContext)]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [inputBarHeight, setInputBarHeight] = useState(DEFAULT_INPUT_BAR_HEIGHT);

  useEffect(() => {
    setMessages([createWelcomeMessage(botContext)]);
    setTypingMessageId(null);
  }, [botContext]);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });
  }, []);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const handleKeyboardShow = (event: KeyboardEvent) => {
      setKeyboardHeight(getKeyboardHeight(event));
      setTimeout(scrollToBottom, 50);
    };

    const handleKeyboardHide = () => {
      setKeyboardHeight(0);
    };

    const showSubscription = Keyboard.addListener(showEvent, handleKeyboardShow);
    const hideSubscription = Keyboard.addListener(hideEvent, handleKeyboardHide);

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [scrollToBottom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending, keyboardHeight, scrollToBottom]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isSending) {
      return;
    }

    const userMessage: CatBotMessage = {
      id: createMessageId(),
      role: 'user',
      content: trimmed,
    };

    const nextHistory = [...messages, userMessage];

    setMessages(nextHistory);
    setInput('');
    setIsSending(true);
    setTypingMessageId(null);

    try {
      const reply = await askCatBot(nextHistory, botContext);
      const assistantMessage: CatBotMessage = {
        id: createMessageId(),
        role: 'assistant',
        content: reply,
      };

      setMessages((current) => [...current, assistantMessage]);
      setTypingMessageId(assistantMessage.id);
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
          content: `paws for a moment, ${message}`,
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const renderMessage = ({ item }: { item: CatBotMessage }) => (
    <ChatMessage
      role={item.role}
      content={item.content}
      avatar={item.role === 'user' ? userAvatar : catBotAvatar}
      animate={item.role === 'assistant' && item.id === typingMessageId}
      onTypeComplete={() => {
        if (item.id === typingMessageId) {
          setTypingMessageId(null);
        }
      }}
    />
  );

  const keyboardOpen = keyboardHeight > 0;
  const inputBottom = keyboardOpen ? keyboardHeight : insets.bottom;
  const listBottomInset = inputBarHeight + inputBottom + 8;

  return (
    <View style={styles.root}>
      <ImageBackground source={storyWallpaper} style={styles.wallpaper} resizeMode="cover" />

      <View style={styles.screen}>
        <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
          <Pressable
            onPress={onOpenSidebar}
            accessibilityRole="button"
            accessibilityLabel="open menu"
            style={({ pressed }) => [styles.menuButton, pressed ? styles.menuButtonPressed : null]}
          >
            <PanelLeftOpen size={18} color={colors.ink} strokeWidth={2.4} />
          </Pressable>

          <Image source={catBotAvatar} style={styles.headerAvatar} resizeMode="cover" />
          <Text style={styles.headerTitle}>cat bot</Text>
        </View>

        <View style={styles.chatArea}>
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            style={styles.messageList}
            contentContainerStyle={[styles.messageListContent, { paddingBottom: listBottomInset }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
            onContentSizeChange={scrollToBottom}
          />

          {isSending ? (
            <View style={[styles.typingRow, { bottom: inputBottom + inputBarHeight + 6 }]}>
              <Image source={catBotAvatar} style={styles.typingAvatar} resizeMode="cover" />
              <View style={styles.typingBubble}>
                <ActivityIndicator size="small" color={colors.coco} />
                <Text style={styles.typingText}>cat bot is typing...</Text>
              </View>
            </View>
          ) : null}

          <View
            onLayout={(event) => {
              const nextHeight = event.nativeEvent.layout.height;
              if (nextHeight > 0 && nextHeight !== inputBarHeight) {
                setInputBarHeight(nextHeight);
              }
            }}
            style={[styles.inputRow, { bottom: inputBottom }]}
          >
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="ask cat bot anything about cats..."
              placeholderTextColor={colors.stone}
              style={styles.input}
              multiline
              maxLength={500}
              editable={!isSending}
              returnKeyType="send"
              onSubmitEditing={handleSend}
              blurOnSubmit={false}
              onFocus={scrollToBottom}
            />
            <Pressable
              onPress={handleSend}
              disabled={!input.trim() || isSending}
              style={({ pressed }) => [
                styles.sendButton,
                !input.trim() || isSending ? styles.sendButtonDisabled : null,
                pressed ? styles.sendButtonPressed : null,
              ]}
              accessibilityRole="button"
              accessibilityLabel="send message"
            >
              <PawPrint size={18} color={colors.onPrimary} strokeWidth={2.2} fill={colors.onPrimary} />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  wallpaper: {
    ...StyleSheet.absoluteFillObject,
  },
  screen: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingBottom: 10,
    backgroundColor: colors.surface,
    borderBottomWidth: 3,
    borderBottomColor: colors.ink,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 0,
    elevation: 2,
  },
  menuButton: {
    width: 36,
    height: 36,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.ink,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.ink,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  menuButtonPressed: {
    transform: [{ translateX: 1 }, { translateY: 1 }],
    shadowOffset: { width: 0, height: 0 },
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colors.sandBorder,
    backgroundColor: colors.sand,
  },
  headerTitle: {
    flex: 1,
    fontFamily: fonts.bold,
    fontSize: 17,
    color: colors.ink,
    ...lowercase,
  },
  chatArea: {
    flex: 1,
    backgroundColor: 'rgba(255, 248, 241, 0.9)',
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    paddingHorizontal: 14,
    paddingTop: 14,
    flexGrow: 1,
  },
  typingRow: {
    position: 'absolute',
    left: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typingAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.sand,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.sandBorder,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  typingText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.stone,
    ...lowercase,
  },
  inputRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    borderTopWidth: 3,
    borderTopColor: colors.ink,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    minHeight: 42,
    maxHeight: 110,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.ink,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'web' ? 10 : 8,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.ink,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.coco,
    shadowColor: colors.ink,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  sendButtonDisabled: {
    opacity: 0.45,
  },
  sendButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }],
  },
});
