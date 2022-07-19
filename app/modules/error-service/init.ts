import { startErrorCapturing } from './error-service';
(() => {
  if (
    '__S_TRAFFIC_ENV__'.indexOf('TRAFFIC_ENV') === -1 &&
    '__S_TRAFFIC_ENV__'
  ) {
    startErrorCapturing();
  }
})();
