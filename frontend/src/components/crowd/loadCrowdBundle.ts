import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import { Image } from 'react-native';

import { buildCrowdHtml, type CatAssetConfig } from './buildCrowdHtml';
import { CAT_ASSETS } from './config';

const gsapBundle = require('../../../assets/crowd/gsap.min.txt');

async function readAssetAsString(moduleId: number): Promise<string> {
  const asset = Asset.fromModule(moduleId);
  await asset.downloadAsync();

  const uri = asset.localUri ?? asset.uri;
  if (!uri) {
    throw new Error('Failed to resolve bundled asset URI.');
  }

  return FileSystem.readAsStringAsync(uri);
}

async function imageToDataUri(moduleId: number): Promise<string> {
  const asset = Asset.fromModule(moduleId);
  await asset.downloadAsync();

  const uri = asset.localUri ?? asset.uri ?? Image.resolveAssetSource(moduleId).uri;
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: 'base64',
  });

  return `data:image/png;base64,${base64}`;
}

async function resolveCatAssets(): Promise<CatAssetConfig[]> {
  return Promise.all(
    CAT_ASSETS.map(async ({ image, facing }) => ({
      src: await imageToDataUri(image),
      facing,
    })),
  );
}

export async function loadCrowdHtml(): Promise<string> {
  const [catAssets, gsapScript] = await Promise.all([
    resolveCatAssets(),
    readAssetAsString(gsapBundle),
  ]);

  return buildCrowdHtml({ catAssets, gsapScript });
}
