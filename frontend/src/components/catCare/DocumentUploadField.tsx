import * as DocumentPicker from 'expo-document-picker';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import { fonts, lowercase } from '../../theme/fonts';
import { FormHelperText } from './FormHelperText';

type DocumentUploadFieldProps = {
  label: string;
  fileName: string;
  onPick: (fileName: string, fileUri: string) => void;
  onClear: () => void;
  error?: string;
  helperText?: string;
};

export function DocumentUploadField({
  label,
  fileName,
  onPick,
  onClear,
  error,
  helperText,
}: DocumentUploadFieldProps) {
  const handlePick = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      multiple: false,
      type: ['application/pdf', 'image/*'],
    });

    if (result.canceled || !result.assets?.[0]) {
      return;
    }

    const asset = result.assets[0];
    onPick(asset.name, asset.uri);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      {helperText ? <FormHelperText text={helperText} /> : null}

      <Pressable onPress={handlePick} style={[styles.uploadBox, error ? styles.uploadBoxError : null]}>
        <Text style={styles.uploadTitle}>
          {fileName ? fileName : 'tap to upload certificate or proof'}
        </Text>
        <Text style={styles.uploadHint}>pdf or image files supported</Text>
      </Pressable>

      {fileName ? (
        <Pressable onPress={onClear}>
          <Text style={styles.clearText}>remove document</Text>
        </Pressable>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.ink,
    ...lowercase,
  },
  uploadBox: {
    borderWidth: 1,
    borderColor: colors.sandBorder,
    borderStyle: 'dashed',
    borderRadius: 10,
    backgroundColor: colors.sand,
    paddingHorizontal: 14,
    paddingVertical: 16,
    gap: 4,
  },
  uploadBoxError: {
    borderColor: colors.error,
  },
  uploadTitle: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.ink,
    ...lowercase,
  },
  uploadHint: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.stone,
    ...lowercase,
  },
  clearText: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.error,
    ...lowercase,
  },
  error: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.error,
    ...lowercase,
  },
});
