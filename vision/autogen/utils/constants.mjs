export const REMOTE_RUN = process.argv.includes('remote');
export const HEADLESS = !process.argv.includes('headed');
export const DEVTOOLS = !HEADLESS && process.argv.includes('devtools');
export const RECORD_MODE = process.argv.includes('record');
export const CI = process.argv.includes('ci');

export const TEST_DIR = 'vision/autogen/screenshots/test';
export const BASE_DIR = 'vision/autogen/screenshots/base';

export const HistoryType = {
  REQUEST: 'request',
  OPTIONS: 'options',
  CLICK: 'click',
  FILL: 'fill',
};
