/**
 * time gap between batch requests in ms
 */
export const BATCH_TIME_INTERVAL = 1000;

/**
 * size of batch
 * 10 => falls under max limit for the beacon API (64kb) and the max limit set by Rudderstack as well
 * for more info refer here https://www.rudderstack.com/docs/api/http-api/#4-maximum-allowed-request-size
 */
export const BATCH_SIZE = 10;
