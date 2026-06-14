import { useEffect, useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { LoadingCat } from './LoadingCat';

const DASHBOARD_INTRO_MS = 3000;

type DashboardIntroGateProps = {
  children: ReactNode;
};

export function DashboardIntroGate({ children }: DashboardIntroGateProps) {
  const [isIntroComplete, setIsIntroComplete] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsIntroComplete(true);
    }, DASHBOARD_INTRO_MS);

    return () => clearTimeout(timer);
  }, []);

  if (!isIntroComplete) {
    return (
      <View style={styles.loading}>
        <LoadingCat />
      </View>
    );
  }

  return children;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
