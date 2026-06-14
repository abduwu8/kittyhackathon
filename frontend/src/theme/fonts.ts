export const fonts = {
  regular: 'Inter_500Medium',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

/** project copy is always lowercase — use on Text labels only, never on TextInput */
export const lowercase = { textTransform: 'lowercase' } as const;
