import Analytics from 'analytics';
import type { NetworkError, RzpError } from 'analytics/types';

global.addEventListener('rzp_error', (event) => {
  const error = (event as unknown as RzpError).detail;

  Analytics.track('cfu_error', {
    data: {
      error,
    },
    immediately: true,
  });
});

global.addEventListener('rzp_network_error', (event) => {
  const detail = (event as unknown as NetworkError).detail;

  if (detail && detail.baseUrl === 'https://lumberjack.razorpay.com/v1/track') {
    return;
  }

  Analytics.track('network_error', {
    data: detail,
    immediately: true,
  });
});
