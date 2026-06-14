import { Plus } from 'lucide-react-native';
import { Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';

type CareAddButtonProps = {
  label: string;
  onPress: () => void;
};

export function CareAddButton({ label, onPress }: CareAddButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed ? styles.buttonPressed : null]}
    >
      <Plus size={18} color={colors.coco} strokeWidth={2.25} />
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.sandBorder,
    backgroundColor: 'rgba(255, 248, 241, 0.6)',
  },
  buttonPressed: {
    backgroundColor: colors.sand,
  },
  label: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.coco,
    letterSpacing: 0.1,
  },
});
