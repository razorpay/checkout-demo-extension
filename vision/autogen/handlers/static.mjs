import { readFileSync } from 'fs';

const cache = new Map();

export class File {
  constructor(path) {
    const extension = path.split('.').pop();
    this.body = readFileSync(path);
    this.contentType = contentTypes[extension];
  }
}

export function* servePublicPage() {
  yield serveFile('vision/mock/publicPage.html');
}

export function* serveCheckout({ params }) {
  yield serveFile(`app/dist/v1/${params.any.join('/')}`);
}

export function* serveQR() {
  yield serveFile(`vision/mock/qr.png`);
}

export function* serveCdn({ params }) {
  const path = params.any.join('/');
  if (path === 'lato.woff2') {
    yield serveFile(`app/fonts/${path}`);
  } else if (path === 'static/assets/trustedbadge/rtb-live.svg') {
    // remove trustedbadge inline animation
    yield serveFile('vision/mock/assets/rtb-live.svg');
  } else {
    yield serveFile(`cdn/${path}`);
  }
}

export function serveFile(path) {
  if (cache.has(path)) {
    return cache.get(path);
  }
  try {
    return new File(path);
  } catch (e) {}
}

const contentTypes = {
  png: 'image/png',
  svg: 'image/svg+xml',
  jpg: 'image/jpeg',
  css: 'text/css',
  html: 'text/html',
  js: 'application/javascript',
};
