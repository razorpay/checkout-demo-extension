/**
 * Get the perfromance data (like load time, transfersize etc) of a resource
 */
export function getPerformanceResourceTiming(resourceNameQueryString: string) {
  try {
    const resourceListEntries = performance.getEntriesByType('resource');
    const performanceData = resourceListEntries.find((resource) =>
      resource.name.includes(resourceNameQueryString)
    ) as PerformanceResourceTiming;

    if (!performanceData) {
      return {};
    }

    // refer: https://developer.mozilla.org/en-US/docs/Web/API/PerformanceResourceTiming
    return {
      startTime: performanceData.startTime,
      duration: performanceData.duration,
      responseEnd: performanceData.responseEnd,
      transferSize: performanceData.transferSize,
      encodedBodySize: performanceData.encodedBodySize,
      decodedBodySize: performanceData.decodedBodySize,
    };
  } catch (error) {
    return {};
  }
}
