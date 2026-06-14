import { CROWD_ANIMATION } from './config';
import type { CatFacing } from './config';

export type CatAssetConfig = {
  src: string;
  facing: CatFacing;
};

export type CrowdHtmlOptions = {
  catAssets: CatAssetConfig[];
  gsapScript: string;
};

export function buildCrowdHtml({ catAssets, gsapScript }: CrowdHtmlOptions) {
  const config = JSON.stringify({
    catAssets,
    ...CROWD_ANIMATION,
  });

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
    <script>${gsapScript}</script>
    <style>
      html, body { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: transparent; }
      canvas { display: block; width: 100%; height: 100%; }
    </style>
  </head>
  <body>
    <canvas id="crowd-canvas"></canvas>
    <script>
      (function () {
        const config = ${config};
        const canvas = document.getElementById('crowd-canvas');
        const ctx = canvas.getContext('2d');
        if (!canvas || !ctx) return;

        const randomRange = (min, max) => min + Math.random() * (max - min);
        const randomIndex = (array) => (randomRange(0, array.length) | 0);
        const removeFromArray = (array, i) => array.splice(i, 1)[0];
        const removeItemFromArray = (array, item) => removeFromArray(array, array.indexOf(item));
        const removeRandomFromArray = (array) => removeFromArray(array, randomIndex(array));
        const getRandomFromArray = (array) => array[randomIndex(array) | 0];

        const getScaledSize = (cat) => ({
          width: cat.width * config.peepScale,
          height: cat.height * config.peepScale,
        });

        const resetCat = ({ stage, cat }) => {
          const { width: scaledWidth, height: scaledHeight } = getScaledSize(cat);
          const depthSpread = stage.height * config.depthSpreadRatio;
          const offsetY = -depthSpread * gsap.parseEase('power2.in')(Math.random());
          const startY = Math.max(0, stage.height - scaledHeight + offsetY);
          let startX;
          let endX;

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

          return { startX, startY, endX, scaledHeight };
        };

        const normalWalk = ({ cat, props }) => {
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
            0
          );
          return tl;
        };

        const walks = [normalWalk];
        const stage = { width: 0, height: 0 };
        const allCats = [];
        const availableCats = [];
        const crowd = [];
        let loadedAssets = [];

        const createCat = (image, facing) => {
          const cat = {
            image,
            facing,
            width: image.naturalWidth,
            height: image.naturalHeight,
            x: 0,
            y: 0,
            anchorY: 0,
            scaleX: 1,
            walk: null,
            render: (context) => {
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

        const removeCatFromCrowd = (cat) => {
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
            if (cat) {
              cat.walk.progress(Math.random());
            }
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

          crowd.forEach((cat) => cat.walk.kill());
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

        let loadedCount = 0;
        const assets = new Array(config.catAssets.length);

        config.catAssets.forEach(({ src, facing }, index) => {
          const img = document.createElement('img');
          img.onload = () => {
            assets[index] = { image: img, facing };
            loadedCount += 1;

            if (loadedCount === config.catAssets.length) {
              loadedAssets = assets;
              init();
            }
          };
          img.src = src;
        });

        window.addEventListener('resize', resize);
      })();
    </script>
  </body>
</html>`;
}
