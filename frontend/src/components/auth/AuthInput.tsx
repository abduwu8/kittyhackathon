import { useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ImageSourcePropType,
  type TextInputProps,
} from 'react-native';

import { fonts, lowercase } from '../../theme/fonts';
import { authIcons } from './authIcons';

type AuthInputProps = TextInputProps & {
  label: string;
  error?: string;
  leftIcon?: ImageSourcePropType;
  enablePasswordToggle?: boolean;
};

const ICON_SIZE = 34;
const ICON_SLOT_SIZE = 56;

export function AuthInput({
  label,
  error,
  style,
  secureTextEntry,
  leftIcon,
  enablePasswordToggle = false,
  ...props
}: AuthInputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isSecure = enablePasswordToggle ? !isPasswordVisible : secureTextEntry;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputRow, error ? styles.inputRowError : null]}>
        {leftIcon ? (
          <View style={styles.leftIconWrap}>
            <Image source={leftIcon} style={styles.leftIcon} resizeMode="contain" />
          </View>
        ) : null}

        <TextInput
          style={[
            styles.input,
            leftIcon ? styles.inputWithLeftIcon : null,
            enablePasswordToggle ? styles.inputWithToggle : null,
            style,
          ]}
          secureTextEntry={isSecure}
          placeholderTextColor="#6E655D"
          autoCapitalize="none"
          {...props}
        />

        {enablePasswordToggle ? (
          <Pressable
            onPress={() => setIsPasswordVisible((current) => !current)}
            style={({ pressed }) => [
              styles.toggleButton,
              pressed ? styles.toggleButtonPressed : null,
            ]}
            accessibilityRole="button"
            accessibilityLabel={isPasswordVisible ? 'hide password' : 'show password'}
          >
            <Image
              source={authIcons.passwordToggle}
              style={styles.toggleIcon}
              resizeMode="contain"
            />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  label: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: '#2B2521',
    ...lowercase,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D9CCBA',
    borderRadius: 10,
    backgroundColor: '#E8DCCB',
    overflow: 'hidden',
  },
  inputRowError: {
    borderColor: '#EF4444',
  },
  leftIconWrap: {
    width: ICON_SLOT_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    borderRightWidth: 1,
    borderRightColor: '#D9CCBA',
    backgroundColor: 'rgba(139, 94, 60, 0.06)',
  },
  leftIcon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
  },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontFamily: fonts.regular,
    fontSize: 16,
    color: '#2B2521',
    backgroundColor: 'transparent',
  },
  inputWithLeftIcon: {
    paddingLeft: 12,
  },
  inputWithToggle: {
    paddingRight: 8,
  },
  toggleButton: {
    width: ICON_SLOT_SIZE,
    height: ICON_SLOT_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleButtonPressed: {
    opacity: 0.7,
  },
  toggleIcon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
  },
  error: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: '#EF4444',
    ...lowercase,
  },
});
