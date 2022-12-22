const RazorpayConfig = {
  api: 'https://api.razorpay.com/',
  version: 'v1/',
  frameApi: '/',
  cdn: 'https://cdn.razorpay.com/',
  merchant_key: null,
};

try {
  Object.assign(RazorpayConfig, global.Razorpay.config);
} catch (e) {}

export default RazorpayConfig;
