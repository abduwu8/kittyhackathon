import type { LucideIcon } from 'lucide-react-native';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import { colors } from '../../theme/colors';
import { fonts, lowercase } from '../../theme/fonts';

type ProfileFieldProps = TextInputProps & {
  icon: LucideIcon;
  label: string;
  error?: string;
};

export function ProfileField({
  icon: Icon,
  label,
  error,
  style,
  multiline,
  ...props
}: ProfileFieldProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputRow, error ? styles.inputRowError : null]}>
        <View style={styles.iconWrap}>
          <Icon size={24} color={colors.coco} strokeWidth={2} />
        </View>
        <TextInput
          style={[styles.input, multiline ? styles.inputMultiline : null, style]}
          placeholderTextColor={colors.stone}
          autoCapitalize="none"
          multiline={multiline}
          {...props}
        />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.stone,
    letterSpacing: 0.2,
    ...lowercase,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.sandBorder,
    borderRadius: 14,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  inputRowError: {
    borderColor: colors.error,
  },
  iconWrap: {
    width: 52,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    borderRightWidth: 1,
    borderRightColor: colors.sandBorder,
  },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.ink,
  },
  inputMultiline: {
    minHeight: 96,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  error: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.error,
    ...lowercase,
  },
});
