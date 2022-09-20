import type { TrackPayload } from 'analytics-v2/library/common/types';
import fetch from 'utils/fetch';

/**
 * creates a XHR request for the config provided
 * @param {{
 *  method: {string} // post, get, etc
 *  url: {string} // endpoint
 *  data: {unknonw} // payload for request
 * }}
 * @returns {Promise<unknown>}
 */
function createRudderXHRRequest({
  method = 'post',
  url,
  key,
  data = {},
}: {
  method?: string;
  url: string;
  key: string;
  data?: unknown;
}): Promise<unknown> {
  try {
    return new Promise((resolve, reject) => {
      fetch({
        method,
        url,
        data: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${btoa(`${key}:`)}`,
        },
        callback(response) {
          if (response.status_code !== 200) {
            reject(response);
          }
          resolve(response);
        },
      });
    });
  } catch {
    return Promise.reject();
  }
}

/**
 * creates a Beacon request for the config provided
 * @param {{
 *  url: {string} // endpoint
 *  data: {unknonw} // payload for request
 * }}
 * @returns {boolean}
 */
function createRudderBeaconRequest({
  url,
  key,
  data,
}: {
  url: string;
  key: string;
  data: unknown;
}): boolean {
  try {
    const payload = JSON.stringify(data);
    const blob = new Blob([payload], { type: 'text/plain' });
    const isQueuedSuccessfully = navigator.sendBeacon(
      `${url}?writeKey=${key}`,
      blob
    );

    return isQueuedSuccessfully;
  } catch {
    return false;
  }
}

/**
 * fires Rudderstack Batch request with config and payload provided
 * @param {{
 *  url: string;
 *  events: TrackPayload[];
 *  useBeacon: boolean;
 * }}
 * @returns {Promise<unknown>}
 */
export function batchRudderRequest({
  url,
  key,
  events,
  useBeacon,
}: {
  url: string;
  key: string;
  events: TrackPayload[];
  useBeacon: boolean;
}): Promise<unknown> {
  try {
    let isQueuedSuccessfully = false;
    if (useBeacon) {
      isQueuedSuccessfully = createRudderBeaconRequest({
        url: `${url}/beacon/v1/batch`,
        key,
        data: { batch: events },
      });
    }
    if (isQueuedSuccessfully) {
      return Promise.resolve();
    }

    return createRudderXHRRequest({
      url: `${url}/v1/batch`,
      key,
      data: { batch: events },
    });
  } catch {
    return Promise.reject();
  }
}

export function identifyRudderRequest({
  url,
  key,
  payload,
}: {
  url: string;
  key: string;
  payload: unknown;
}) {
  return createRudderXHRRequest({
    url: `${url}/v1/identify`,
    key,
    data: payload,
  });
}
