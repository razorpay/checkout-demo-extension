import { flatten } from 'one_click_checkout/common/utils';

const flattenInput = [
  {
    // default array ( no sub-array )
    input: [1, 2, 3, 4, 5],
    output: [1, 2, 3, 4, 5],
  },
  {
    // 1-level nested array
    input: [[1, 2, 3, 4, 5]],
    output: [1, 2, 3, 4, 5],
  },
  {
    // 2 1-level nested arrays
    input: [
      [1, 2, 3],
      [4, 5],
    ],
    output: [1, 2, 3, 4, 5],
  },
  {
    // n-level nested arrays
    input: [[[1]], [2], [[3, 4, [5]]]],
    output: [1, 2, 3, 4, 5],
  },
  {
    // array of objects
    input: [
      [{ id: 'name' }, { id: 'phone' }],
      [{ id: 'line1' }, { id: 'line2' }],
    ],
    output: [{ id: 'name' }, { id: 'phone' }, { id: 'line1' }, { id: 'line2' }],
  },
];

describe('test flatten array', () => {
  test.each(flattenInput)(
    'given $input, returns $output',
    ({ input, output }) => {
      expect(flatten(input)).toMatchObject(output);
    }
  );
});
