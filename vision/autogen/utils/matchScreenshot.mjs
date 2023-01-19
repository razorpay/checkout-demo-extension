import fs from 'fs/promises';
import { compare } from 'odiff-bin';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

async function readImage(path) {
  const buffer = await fs.readFile(path);
  return readImageBuffer(buffer);
}

async function readImageBuffer(buffer) {
  const png = new PNG();
  return new Promise((resolve, reject) =>
    png.parse(buffer, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    })
  );
}

export function matchScreenshot(firstImagePath, buffer, diffPath) {
  return doPixelMatch(firstImagePath, buffer, diffPath);
}

async function doPixelMatch(firstImagePath, buffer, diffPath) {
  const [firstImage, secondImage] = await Promise.all([
    readImage(firstImagePath),
    readImageBuffer(buffer),
  ]);

  if (
    firstImage.width !== secondImage.width ||
    firstImage.height !== secondImage.height
  ) {
    console.log(`dimension mismatch`);
    return false;
  }
  const { width, height } = firstImage;
  const diff = new PNG({ width, height });
  const mismatchedPixels = pixelmatch(
    firstImage.data,
    secondImage.data,
    diff.data,
    width,
    height
  );
  if (mismatchedPixels) {
    const handle = await fs.open(diffPath, 'w+');
    diff.pack().pipe(handle.createWriteStream());
    return false;
  }
  return true;
}
