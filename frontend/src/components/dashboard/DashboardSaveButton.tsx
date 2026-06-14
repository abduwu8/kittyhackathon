import type { LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, Text } from 'react-native';

import { LoadingCat } from '../loader';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';

type DashboardSaveButtonProps = {
  label: string;
  icon: LucideIcon;
  onPress: () => void;
  isLoading?: boolean;
};

export function DashboardSaveButton({
  label,
  icon: Icon,
  onPress,
  isLoading = false,
}: DashboardSaveButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={isLoading}
      style={({ pressed }) => [
        styles.button,
        isLoading ? styles.buttonDisabled : null,
        pressed && !isLoading ? styles.buttonPressed : null,
      ]}
    >
      {isLoading ? (
        <LoadingCat size={32} />
      ) : (
        <>
          <Icon size={20} color={colors.onPrimary} strokeWidth={2} />
          <Text style={styles.label}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: colors.coco,
    shadowColor: colors.coco,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  buttonDisabled: {
    opacity: 0.75,
  },
  label: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.onPrimary,
    letterSpacing: 0.2,
  },
});
