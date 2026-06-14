import { useEffect, useState } from 'react';
import { Text, type StyleProp, type TextProps, type TextStyle } from 'react-native';

type TypewriterTextProps = {
  text: string;
  active: boolean;
  speedMs?: number;
  style?: StyleProp<TextStyle>;
  onComplete?: () => void;
} & Pick<TextProps, 'numberOfLines'>;

export function TypewriterText({
  text,
  active,
  speedMs = 18,
  style,
  onComplete,
  numberOfLines,
}: TypewriterTextProps) {
  const [visibleCount, setVisibleCount] = useState(active ? 0 : text.length);

  useEffect(() => {
    if (!active) {
      setVisibleCount(text.length);
      return;
    }

    setVisibleCount(0);
  }, [active, text]);

  useEffect(() => {
    if (!active || visibleCount >= text.length) {
      if (active && visibleCount >= text.length) {
        onComplete?.();
      }
      return;
    }

    const timer = setTimeout(() => {
      setVisibleCount((count) => Math.min(count + 1, text.length));
    }, speedMs);

    return () => clearTimeout(timer);
  }, [active, onComplete, speedMs, text.length, visibleCount]);

  return (
    <Text style={style} numberOfLines={numberOfLines}>
      {text.slice(0, visibleCount)}
    </Text>
  );
}
