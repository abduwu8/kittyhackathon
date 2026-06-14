import { StyleSheet, Text } from 'react-native';

import { fonts, lowercase } from '../../theme/fonts';
import { colors } from '../../theme/colors';

type FormHelperTextProps = {
  text: string;
};

export function FormHelperText({ text }: FormHelperTextProps) {
  return <Text style={styles.helper}>{text}</Text>;
}

const styles = StyleSheet.create({
  helper: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.stone,
    marginTop: -2,
    ...lowercase,
  },
});
