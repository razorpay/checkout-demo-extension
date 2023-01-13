import { getPerformanceResourceTiming } from './core';
export function getPerformanceDataForCriticalCheckoutResources() {
  const CRITICAL_RESOURCES = {
    'checkout-frame.js': 'checkout-frame.js',
    'checkout.css': 'checkout.css',
    preferences: '/preferences?',
  };

  return Object.keys(CRITICAL_RESOURCES)
    .map((name) => ({
      [name]: getPerformanceResourceTiming(
        CRITICAL_RESOURCES[name as keyof typeof CRITICAL_RESOURCES]
      ),
    }))
    .reduce((acc, item) => {
      acc = { ...acc, ...item };
      return acc;
    }, {});
}
