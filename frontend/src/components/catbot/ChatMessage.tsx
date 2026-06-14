import { Image, StyleSheet, Text, View } from 'react-native';
import type { ImageSourcePropType } from 'react-native';

import { colors } from '../../theme/colors';
import { fonts, lowercase } from '../../theme/fonts';
import type { CatBotRole } from '../../lib/catBot';
import { TypewriterText } from './TypewriterText';

type ChatMessageProps = {
  role: CatBotRole;
  content: string;
  avatar: ImageSourcePropType;
  animate?: boolean;
  onTypeComplete?: () => void;
};

export function ChatMessage({
  role,
  content,
  avatar,
  animate = false,
  onTypeComplete,
}: ChatMessageProps) {
  const isUser = role === 'user';

  return (
    <View style={[styles.row, isUser ? styles.rowUser : styles.rowBot]}>
      {!isUser ? <Image source={avatar} style={styles.avatar} resizeMode="cover" /> : null}

      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleBot]}>
        {isUser ? (
          <Text style={[styles.text, styles.textUser]}>{content}</Text>
        ) : (
          <TypewriterText
            text={content}
            active={animate}
            style={[styles.text, styles.textBot]}
            onComplete={onTypeComplete}
          />
        )}
      </View>

      {isUser ? <Image source={avatar} style={styles.avatar} resizeMode="cover" /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: 12,
  },
  rowUser: {
    justifyContent: 'flex-end',
  },
  rowBot: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.sand,
    borderWidth: 1.5,
    borderColor: colors.sandBorder,
  },
  bubble: {
    maxWidth: '76%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  bubbleUser: {
    backgroundColor: colors.coco,
    borderBottomRightRadius: 4,
  },
  bubbleBot: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.sandBorder,
  },
  text: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    ...lowercase,
  },
  textUser: {
    color: colors.onPrimary,
  },
  textBot: {
    color: colors.ink,
  },
});
