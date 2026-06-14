import type { ImageSourcePropType } from 'react-native';

export type StoryPanel = {
  id: number;
  source: ImageSourcePropType;
  borderColor: string;
  width: number;
  height: number;
};

export function getPanelAspectRatio(panel: StoryPanel): number {
  return panel.width / panel.height;
}

export function getRowHeight(
  row: StoryPanel[],
  availableWidth: number,
  gap: number,
): number {
  if (availableWidth <= 0) {
    return 0;
  }

  const widthAtUnitHeight = row.reduce(
    (sum, panel) => sum + getPanelAspectRatio(panel),
    0,
  );
  const totalGap = gap * Math.max(row.length - 1, 0);

  return (availableWidth - totalGap) / widthAtUnitHeight;
}

export function getPanelSize(
  panel: StoryPanel,
  rowHeight: number,
): { width: number; height: number } {
  return {
    width: rowHeight * getPanelAspectRatio(panel),
    height: rowHeight,
  };
}
