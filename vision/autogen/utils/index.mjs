import fs from 'fs/promises';

export const HEADLESS = !process.argv.includes('--headed');
export const DEVTOOLS = !HEADLESS && process.argv.includes('--devtools');
export const RECORD_MODE = process.argv.includes('--record');

export const JsonResponse = (o) => ({
  status: 200,
  body: JSON.stringify(o),
  headers: {
    'content-type': 'application/json',
  },
});

export const JsonpResponse = (o) => ({
  status: 200,
  body: o,
  headers: {
    'content-type': 'text/javascript',
  },
});

export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function promisePair() {
  let resolver;
  const promise = new Promise(resolve => {
    resolver = resolve;
  });
  return [ promise, resolver ];
}
