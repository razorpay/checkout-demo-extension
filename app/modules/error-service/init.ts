import { startErrorCapturing } from './error-service';

(() => {
  if (
    ('__S_TRAFFIC_ENV__'.indexOf('TRAFFIC_ENV') === -1 &&
      '__S_TRAFFIC_ENV__') ||
    location.search.indexOf('traffic_env=') > 0
  ) {
    startErrorCapturing();
  }
})();
