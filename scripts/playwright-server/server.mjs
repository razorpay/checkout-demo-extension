import { chromium, webkit } from 'playwright-core';

const [
  chromiumServer,
  webkitServer,
  // firefoxServer,
] = await Promise.all([
  chromium.launchServer({
    port: 8001,
    wsPath: 'ws',
  }),
  webkit.launchServer({
    port: 8002,
    wsPath: 'ws',
  }),
]);
