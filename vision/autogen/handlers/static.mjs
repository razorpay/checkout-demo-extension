import { readFileSync } from 'fs';
import { md5 } from '#vision/autogen/utils/index.mjs';

export function* servePublicPage() {
  yield serveFile('vision/mock/publicPage.html');
}

export function* serveCheckout({ params }) {
  yield serveFile(`app/dist/v1/${params.assetPath.join('/')}`);
}

export function* serveQR() {
  yield serveFile(`vision/mock/qr.png`);
}

export function* serveCdn({ params }) {
  const path = params.assetPath.join('/');
  if (path === 'lato.woff2') {
    yield serveFile(`app/fonts/${path}`);
  } else {
    yield serveFile(`cdn/${path}`);
  }
}

export function serveFile(path) {
  try {
    return readFileSync(path);
  } catch (e) {
  }
}
