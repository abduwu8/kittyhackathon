import { Platform, Share } from 'react-native';

import type { CatApiImage } from '../types/catApi';

function getDownloadFilename(image: CatApiImage): string {
  return `cat-${image.id}.jpg`;
}

async function downloadCatImageWeb(image: CatApiImage): Promise<void> {
  const response = await fetch(image.url);

  if (!response.ok) {
    throw new Error('could not download this cat photo.');
  }

  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = blobUrl;
  anchor.download = getDownloadFilename(image);
  anchor.click();
  URL.revokeObjectURL(blobUrl);
}

async function downloadCatImageNative(image: CatApiImage): Promise<void> {
  const filename = getDownloadFilename(image);
  const sharePayload =
    Platform.OS === 'ios'
      ? { url: image.url, title: filename }
      : { message: image.url, title: filename };

  const result = await Share.share(sharePayload);

  if (result.action === Share.dismissedAction) {
    throw new Error('download cancelled.');
  }
}

export async function downloadCatImage(image: CatApiImage): Promise<void> {
  if (!image.url) {
    throw new Error('this cat photo is missing a download url.');
  }

  if (Platform.OS === 'web') {
    await downloadCatImageWeb(image);
    return;
  }

  await downloadCatImageNative(image);
}
