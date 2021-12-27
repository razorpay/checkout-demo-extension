/**
 * Placeholder test to collect coverage for all svelte files
 * Why is it needed and How does it work?
 *
 * works only when __SVELTE_COVERAGE__ is set
 * refer package.json -> scripts -> test:module:coverage
 *
 * Usually this file should not be required, but in current setup, coverage collection fails
 * for some(*) svelte files, because they were not resolved (transformed) by svelte-jester
 *
 * This file forcefully require all svelte files, so that jest can do the transformation on it
 * and capture the coverage information.
 *
 * (*) -> The error doesn't come for all svelte files.
 * 1. If a svelte component (eg A.svelte) has a associated test file (A.test.js),
 *    there will be no error for A.svelte
 *    and for all imported svelte files (B.svelte, C.svelte) from A.svelte
 *
 * 2. If a js|ts file (eg index.js) imports svelte component (A.svelte),
 *    and that js|ts file, is required in a test file (index.test.js),
 *    there will be no error for A.svelte
 *
 * At the end, it all comes down to svelte files being required by node, via their own test file, or via some other file.
 *
 */

describe('Placeholder for coverage', () => {
  it('should just pass', () => {
    expect(true).toBe(true);
  });
});

if (process.env.__SVELTE_COVERAGE__) {
  load();
}

function load() {
  console.log(
    '========= Requiring all svelte files coverage [slow process] ========'
  );

  const glob = require('glob');
  const cwd = require('path').join(process.cwd(), 'app', 'modules');
  const pattern = '*.svelte';

  glob
    .sync(pattern, { cwd, matchBase: true, nosort: true })
    .forEach((file) => require(file));
}
