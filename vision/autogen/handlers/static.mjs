import { readFileSync } from 'fs';

const cache = new Map();

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
  if (cache.has(path)) {
    return cache.get(path);
  }

  const response = {
    immediately: true,
  };
  try {
    const body = readFileSync(path);
    response.data = {
      status: 200,
      body,
      headers: {
        'content-type': mime[path.split('.').pop()],
      },
    };
  } catch (e) {
    response.data = {
      status: 404,
    };
  }

  cache.set(path, response);
  return response;
}

const mime = {
  png: 'image/png',
  svg: 'image/svg+xml',
  jpg: 'image/jpeg',
  css: 'text/css',
  html: 'text/html',
  js: 'application/javascript',
};
