import { StyleSheet, View } from 'react-native';

import { colors } from '../../theme/colors';

export function CareFormDivider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.sandBorder,
    marginVertical: 2,
  },
});
