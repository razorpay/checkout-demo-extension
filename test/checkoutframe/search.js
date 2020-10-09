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

test('Module: checkoutframe/search', t => {
  test('Search.search', t => {
    const cache = Search.createCache();

    const codeResults = Search.search('sbin', BANKS, ['code', 'name'], {
      cache,

      algorithm: Search.algorithmWithTypo,
      threshold: 0,
    });

    t.deepEqual(
      codeResults.results[0].ref,
      {
        code: 'SBIN',
        name: 'State Bank of India',
      },
      'searches properly using "sbin"'
    );

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

    t.deepEqual(
      nameResults.results[0].ref,
      {
        code: 'SBIN',
        name: 'State Bank of India',
      },
      'searches properly using "state"'
    );

    t.end();
  });

  t.end();
});
