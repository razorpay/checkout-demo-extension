const { createHash } = await import('node:crypto');

export const md5 = (data) => createHash('md5').update(data).digest('hex');

export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function promisePair() {
  let resolver;
  const promise = new Promise((resolve) => {
    resolver = resolve;
  });
  return [promise, resolver];
}
