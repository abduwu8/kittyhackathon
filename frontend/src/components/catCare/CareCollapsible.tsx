import { ChevronDown } from 'lucide-react-native';
import { MotiView } from 'moti';
import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import { fonts, lowercase } from '../../theme/fonts';

type CareCollapsibleProps = {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
};

export function CareCollapsible({ title, children, defaultOpen = false }: CareCollapsibleProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => setOpen((current) => !current)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        style={({ pressed }) => [styles.trigger, pressed ? styles.triggerPressed : null]}
      >
        <Text style={styles.title}>{title}</Text>
        <MotiView
          animate={{ rotate: open ? '180deg' : '0deg' }}
          transition={{ type: 'timing', duration: 200 }}
        >
          <ChevronDown size={18} color={colors.stone} strokeWidth={2.25} />
        </MotiView>
      </Pressable>

      {open ? <View style={styles.content}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
    paddingTop: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.sandBorder,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 2,
  },
  triggerPressed: {
    opacity: 0.75,
  },
  title: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.stone,
    ...lowercase,
  },
  content: {
    gap: 16,
  },
});
