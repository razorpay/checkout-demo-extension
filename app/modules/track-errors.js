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

  Analytics.track('network_error', {
    data: detail,
    immediately: true,
  });
});
