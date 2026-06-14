import { X } from 'lucide-react-native';
import { MotiView } from 'moti';
import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { StoryPanel } from '../../lib/storyComicLayout';
import { colors } from '../../theme/colors';

type ComicPanelZoomProps = {
  panel: StoryPanel | null;
  onClose: () => void;
};

function getZoomSize(panel: StoryPanel, maxWidth: number, maxHeight: number) {
  const aspect = panel.width / panel.height;
  let width = maxWidth;
  let height = width / aspect;

  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspect;
  }

  return { width, height };
}

export function ComicPanelZoom({ panel, onClose }: ComicPanelZoomProps) {
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  if (!panel) {
    return null;
  }

  const maxWidth = screenWidth - 32;
  const maxHeight = screenHeight - insets.top - insets.bottom - 48;
  const zoomSize = getZoomSize(panel, maxWidth, maxHeight);

  return (
    <Modal
      visible
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.root}>
        <Pressable
          style={styles.backdrop}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="close zoomed panel"
        />

        <View style={styles.stage} pointerEvents="box-none">
          <MotiView
            from={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 20, stiffness: 280, mass: 0.8 }}
            style={[
              styles.panelFrame,
              {
                width: zoomSize.width,
                height: zoomSize.height,
                borderColor: panel.borderColor,
              },
            ]}
          >
            <Image
              source={panel.source}
              style={styles.panelImage}
              resizeMode="contain"
              accessibilityLabel="zoomed comic panel"
            />
          </MotiView>

          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="close zoomed panel"
            style={({ pressed }) => [
              styles.closeButton,
              { top: insets.top + 12 },
              pressed ? styles.closeButtonPressed : null,
            ]}
          >
            <X size={20} color={colors.onPrimary} strokeWidth={2.5} />
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(43, 37, 33, 0.82)',
  },
  stage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  panelFrame: {
    borderWidth: 3,
    borderRadius: 10,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 10,
  },
  panelImage: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(43, 37, 33, 0.72)',
  },
  closeButtonPressed: {
    opacity: 0.75,
  },
});
