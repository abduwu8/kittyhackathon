import { MotiView } from 'moti';
import type { ReactNode } from 'react';

type AuthAnimatedSectionProps = {
  children: ReactNode;
  delay?: number;
};

export function AuthAnimatedSection({
  children,
  delay = 0,
}: AuthAnimatedSectionProps) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 18 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{
        type: 'timing',
        duration: 500,
        delay,
      }}
    >
      {children}
    </MotiView>
  );
}
