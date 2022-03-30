export function getCdnUrl() {
  if (window.location.hostname === 'api.razorpay.com') {
    return 'https://cdn.razorpay.com';
  }
  return 'https://betacdn.np.razorpay.in';
}
