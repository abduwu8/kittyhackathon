import { gsap } from 'gsap';
import { useEffect, useRef } from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { CAT_ASSETS, CROWD_ANIMATION } from './crowd/config';
import type { CatFacing } from './crowd/config';

type Cat = {
  image: HTMLImageElement;
  facing: CatFacing;
  width: number;
  height: number;
  x: number;
  y: number;
  anchorY: number;
  scaleX: number;
  walk: gsap.core.Timeline | null;
  render: (ctx: CanvasRenderingContext2D) => void;
};

type LoadedCatAsset = {
  image: HTMLImageElement;
  facing: CatFacing;
};

const catAssets = CAT_ASSETS.map(({ image, facing }) => ({
  src: Image.resolveAssetSource(image).uri,
  facing,
}));

const getScaledSize = (cat: Cat) => ({
  width: cat.width * CROWD_ANIMATION.peepScale,
  height: cat.height * CROWD_ANIMATION.peepScale,
});

export function CrowdComponent() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    const config = {
      ...CROWD_ANIMATION,
    };

    const randomRange = (min: number, max: number) =>
      min + Math.random() * (max - min);
    const randomIndex = (array: unknown[]) => randomRange(0, array.length) | 0;
    const removeFromArray = <T,>(array: T[], i: number) => array.splice(i, 1)[0];
    const removeItemFromArray = <T,>(array: T[], item: T) =>
      removeFromArray(array, array.indexOf(item));
    const removeRandomFromArray = <T,>(array: T[]) =>
      removeFromArray(array, randomIndex(array));
    const getRandomFromArray = <T,>(array: T[]) => array[randomIndex(array)];

    const resetCat = ({
      stage,
      cat,
    }: {
      stage: { width: number; height: number };
      cat: Cat;
    }) => {
      const { width: scaledWidth, height: scaledHeight } = getScaledSize(cat);
      const depthSpread = stage.height * config.depthSpreadRatio;
      const offsetY = -depthSpread * gsap.parseEase('power2.in')(Math.random());
      const startY = Math.max(0, stage.height - scaledHeight + offsetY);
      let startX: number;
      let endX: number;

      if (cat.facing === 'right') {
        startX = -scaledWidth;
        endX = stage.width;
      } else {
        startX = stage.width + scaledWidth;
        endX = -scaledWidth;
      }

      cat.scaleX = 1;

      cat.x = startX;
      cat.y = startY;
      cat.anchorY = startY;

      return { startX, startY, endX };
    };

    const normalWalk = ({
      cat,
      props,
    }: {
      cat: Cat;
      props: ReturnType<typeof resetCat>;
    }) => {
      const { startY, endX } = props;
      const xDuration = 10;
      const yDuration = 0.25;
      const tl = gsap.timeline();

      tl.timeScale(randomRange(0.5, 1.5));
      tl.to(cat, { duration: xDuration, x: endX, ease: 'none' }, 0);
      tl.to(
        cat,
        {
          duration: yDuration,
          repeat: xDuration / yDuration,
          yoyo: true,
          y: Math.max(0, startY - config.walkBounce),
        },
        0,
      );

      return tl;
    };

    const walks = [normalWalk];
    const stage = { width: 0, height: 0 };
    const allCats: Cat[] = [];
    const availableCats: Cat[] = [];
    const crowd: Cat[] = [];
    let loadedAssets: LoadedCatAsset[] = [];

    const createCat = (image: HTMLImageElement, facing: CatFacing): Cat => {
      const cat: Cat = {
        image,
        facing,
        width: image.naturalWidth,
        height: image.naturalHeight,
        x: 0,
        y: 0,
        anchorY: 0,
        scaleX: 1,
        walk: null,
        render: (context: CanvasRenderingContext2D) => {
          const scale = config.peepScale;
          context.save();
          context.translate(cat.x, cat.y);
          context.scale(cat.scaleX * scale, scale);
          context.drawImage(cat.image, 0, 0, cat.width, cat.height);
          context.restore();
        },
      };

      return cat;
    };

    const createCats = () => {
      for (let i = 0; i < config.maxActivePeeps; i++) {
        const asset = loadedAssets[i % loadedAssets.length];
        allCats.push(createCat(asset.image, asset.facing));
      }
    };

    const removeCatFromCrowd = (cat: Cat) => {
      removeItemFromArray(crowd, cat);
      availableCats.push(cat);
    };

    const addCatToCrowd = () => {
      if (!availableCats.length || crowd.length >= config.maxActivePeeps) {
        return null;
      }

      const cat = removeRandomFromArray(availableCats);
      const walk = getRandomFromArray(walks)({
        cat,
        props: resetCat({ cat, stage }),
      }).eventCallback('onComplete', () => {
        removeCatFromCrowd(cat);
        addCatToCrowd();
      });

      cat.walk = walk;
      crowd.push(cat);
      crowd.sort((a, b) => a.anchorY - b.anchorY);

      return cat;
    };

    const initCrowd = () => {
      const count = Math.min(config.maxActivePeeps, availableCats.length);

      for (let i = 0; i < count; i++) {
        const cat = addCatToCrowd();
        cat?.walk?.progress(Math.random());
      }
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(devicePixelRatio, devicePixelRatio);
      crowd.forEach((cat) => cat.render(ctx));
      ctx.restore();
    };

    const resize = () => {
      stage.width = canvas.clientWidth;
      stage.height = canvas.clientHeight;
      canvas.width = stage.width * devicePixelRatio;
      canvas.height = stage.height * devicePixelRatio;

      crowd.forEach((cat) => {
        cat.walk?.kill();
      });

      crowd.length = 0;
      availableCats.length = 0;
      availableCats.push(...allCats);
      initCrowd();
    };

    const init = () => {
      createCats();
      resize();
      gsap.ticker.add(render);
    };

    const handleResize = () => resize();

    let loadedCount = 0;
    const assets: LoadedCatAsset[] = new Array(catAssets.length);

    catAssets.forEach(({ src, facing }, index) => {
      const img = document.createElement('img');
      img.onload = () => {
        assets[index] = { image: img, facing };
        loadedCount += 1;

        if (loadedCount === catAssets.length) {
          loadedAssets = assets;
          init();
        }
      };
      img.src = src;
    });

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      gsap.ticker.remove(render);
      crowd.forEach((cat) => {
        cat.walk?.kill();
      });
    };
  }, []);

  return (
    <View style={styles.container}>
      <canvas ref={canvasRef} style={styles.canvas} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  canvas: {
    width: '100%',
    height: '100%',
  },
});
