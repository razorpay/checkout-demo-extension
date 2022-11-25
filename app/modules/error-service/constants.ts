// IMPORTANT: Add tests with exact error payload for every new entry to
//  this list here: app/modules/error-service/__test__/filters.test.ts
export const ERROR_IGNORE_LIST = {
  exactMatches: ['Not implemented on this platform', 'chain is not set up'],
  looseMatches: [
    'Cannot redefine property: ethereum',
    'chrome-extension://',
    'moz-extension://',
    'webkit-masked-url://',
  ],
};
