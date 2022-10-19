export const HEADLESS = !process.argv.includes('--headed');
export const DEVTOOLS = !HEADLESS && process.argv.includes('--devtools');
export const RECORD_MODE = process.argv.includes('--record');

export const HistoryType = {
  REQUEST: 'request',
  OPTIONS: 'options',
  CLICK: 'click',
  FILL: 'fill',
};
