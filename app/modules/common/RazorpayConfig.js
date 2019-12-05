const RazorpayConfig = {
  api: 'https://api.razorpay.com/',
  version: 'v1/',
  frameApi: '/',
  cdn: 'https://cdn.razorpay.com/',
};

try {
  _Obj.extend(RazorpayConfig, global.Razorpay.config);
} catch (e) {}

export default RazorpayConfig;
