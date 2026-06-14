import { useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { loadCrowdHtml } from './crowd/loadCrowdBundle';

export function CrowdComponent() {
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    loadCrowdHtml()
      .then((nextHtml) => {
        if (!cancelled) {
          setHtml(nextHtml);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setHtml(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!html) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        style={styles.webview}
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        androidLayerType="software"
        pointerEvents="none"
        javaScriptEnabled
        domStorageEnabled
        mixedContentMode="always"
        allowFileAccess={Platform.OS === 'android'}
        allowFileAccessFromFileURLs={Platform.OS === 'android'}
        allowUniversalAccessFromFileURLs={Platform.OS === 'android'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
    opacity: 0.99,
  },
});
