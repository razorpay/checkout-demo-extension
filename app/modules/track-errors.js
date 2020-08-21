import Analytics from 'analytics';

global.addEventListener('rzp_error', event => {
  const error = event.detail;

  Analytics.track('cfu_error', {
    data: {
      error,
    },
    immediately: true,
  });
});

global.addEventListener('rzp_network_error', event => {
  const detail = event.detail;

  if (detail && detail.baseUrl === 'https://lumberjack.razorpay.com/v1/track') {
    return;
  }

  Analytics.track('network_error', {
    data: detail,
    immediately: true,
  });
});
