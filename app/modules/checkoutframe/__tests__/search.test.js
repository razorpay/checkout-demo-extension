import * as Search from 'checkoutframe/search';

const BANKS = [
  {
    code: 'HDFC',
    name: 'HDFC Bank',
  },
  {
    code: 'ICIC',
    name: 'ICICI Bank',
  },
  {
    code: 'KKBK',
    name: 'Kotak Mahindra Bank',
  },
  {
    code: 'SBIN',
    name: 'State Bank of India',
  },
];

describe('Module: checkoutframe/search', () => {
  test('Search.search', () => {
    const cache = Search.createCache();

    const codeResults = Search.search('sbin', BANKS, ['code', 'name'], {
      cache,

      algorithm: Search.algorithmWithTypo,
      threshold: 0,
    });

    expect(codeResults.results[0].ref).toEqual({
      code: 'SBIN',
      name: 'State Bank of India',
    });

    const nameResults = Search.search(
      'state bank of india',
      BANKS,
      ['code', 'name'],
      {
        cache,

        algorithm: Search.algorithmWithTypo,
        threshold: 0,
      }
    );

    expect(nameResults.results[0].ref).toEqual({
      code: 'SBIN',
      name: 'State Bank of India',
    });
  });
});
