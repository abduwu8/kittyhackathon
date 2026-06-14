import { ImageIcon } from 'lucide-react-native';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import {
  CAT_AVATAR_OPTIONS,
  type CatAvatarId,
} from '../../lib/catAvatars';
import { colors } from '../../theme/colors';
import { fonts, lowercase } from '../../theme/fonts';

type CatAvatarPickerProps = {
  value: CatAvatarId;
  onChange: (value: CatAvatarId) => void;
  error?: string;
  helperText?: string;
};

const AVATAR_SIZE = 52;
const DEFAULT_HELPER_TEXT = 'tap an avatar to update your profile photo';

export function CatAvatarPicker({ value, onChange, error, helperText }: CatAvatarPickerProps) {
  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {CAT_AVATAR_OPTIONS.map((avatar) => {
          const isSelected = value === avatar.id;

          return (
            <Pressable
              key={avatar.id}
              onPress={() => onChange(avatar.id)}
              style={[styles.avatarButton, isSelected ? styles.avatarButtonSelected : null]}
            >
              <Image source={avatar.image} style={styles.avatarImage} resizeMode="cover" />
              {isSelected ? <View style={styles.selectedRing} /> : null}
            </Pressable>
          );
        })}
      </View>

      <View style={styles.hintRow}>
        <ImageIcon size={14} color={colors.stone} strokeWidth={1.75} />
        <Text style={styles.helper}>{helperText ?? DEFAULT_HELPER_TEXT}</Text>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  avatarButton: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    overflow: 'hidden',
    backgroundColor: colors.sand,
  },
  avatarButtonSelected: {
    transform: [{ scale: 1.06 }],
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  selectedRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 2.5,
    borderColor: colors.coco,
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  helper: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.stone,
    ...lowercase,
  },
  error: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.error,
    textAlign: 'center',
    ...lowercase,
  },
});
