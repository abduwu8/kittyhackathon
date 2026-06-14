import {
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { LoadingCat } from '../loader';
import { fonts, lowercase } from '../../theme/fonts';

type AuthButtonProps = Omit<PressableProps, 'style'> & {
  title: string;
  isLoading?: boolean;
  variant?: 'primary' | 'secondary';
  style?: StyleProp<ViewStyle>;
};

export function AuthButton({
  title,
  isLoading = false,
  variant = 'primary',
  disabled,
  style,
  ...props
}: AuthButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        variant === 'secondary' ? styles.secondary : styles.primary,
        pressed && !isDisabled ? styles.pressed : null,
        isDisabled ? styles.disabled : null,
        style,
      ]}
      disabled={isDisabled}
      {...props}
    >
      {isLoading ? (
        <LoadingCat size={36} />
      ) : (
        <Text
          style={[
            styles.text,
            variant === 'secondary' ? styles.secondaryText : styles.primaryText,
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  primary: {
    backgroundColor: '#8B5E3C',
  },
  secondary: {
    backgroundColor: '#E8DCCB',
    borderWidth: 1,
    borderColor: '#D9CCBA',
  },
  pressed: {
    opacity: 0.9,
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    ...lowercase,
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#8B5E3C',
  },
});
