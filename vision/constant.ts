import path from 'path';

export const checkoutPublic = 'https://api.razorpay.com/v1/checkout/public';
export const rootProject = path.join(__dirname, '../');
export const appPath = path.join(rootProject, 'app');
export const localCDNPath = path.join(rootProject, 'cdn');
export const mockAssetsPath = path.join(rootProject, 'vision/mock/assets');
export const mocksharpPage = '/v1/gateway/mocksharp/payment';
export const fontPath = 'https://font.razorpay.com';
export const cdnBuildPath = 'https://checkout.com/v1';
export const cdnImagePath = 'https://cdn.razorpay.com/';
export const googleChartAPI = 'https://chart.googleapis.com/chart';
export const skipPath = [
  'https://browser.sentry-cdn.com/7.2.0/bundle.min.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600;700;800&display=swap',
];

export const MERCHANT_TEST_KEY = 'rzp_test_1DP5mmOlF5G5ag';
