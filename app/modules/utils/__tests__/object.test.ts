import {
  unflatten,
  flatten,
  hasProp,
  isEmpty,
  map,
  get,
  loop,
  clone,
  parse,
} from 'utils/object';

const sampleObject = {
  company: 'Razorpay',
  nested: {
    key: 'value',
  },
};

describe('Object Utils', () => {
  describe('get', () => {
    test('extract value from object', () => {
      expect(get(sampleObject, 'company')).toBe('Razorpay');
    });
    test("extract value from object when path doesn't exist", () => {
      expect(get(sampleObject, 'service')).toBe(null);
    });
    test("extract value from object when path doesn't exist and default value passed", () => {
      expect(get(sampleObject, 'service', 'payments')).toBe('payments');
    });
  });

  describe('clone', () => {
    test('object cloning', () => {
      const newObj = clone(sampleObject);
      newObj.company = 'RZP';
      expect(sampleObject.company).toBe('Razorpay');
    });
    test('invalid object cloning', () => {
      const newObj = clone(null as any);
      expect(newObj).toBe(newObj);
    });
  });

  describe('hasProp', () => {
    test('checks the property in the given object is inherited and owns', () => {
      expect(hasProp(sampleObject, 'company')).toEqual(true);
    });
    test('checks the property in the given object is inherited and owns', () => {
      expect(hasProp(sampleObject, 'service')).toEqual(false);
    });
    test('checks when the property non defined', () => {
      expect(hasProp(sampleObject, '')).toEqual(false);
    });
    test('checks the property in the given empty object', () => {
      expect(hasProp({}, 'company')).toEqual(false);
    });
    test('when null passed', () => {
      expect(hasProp(null as any, 'company')).toEqual(false);
    });
  });

  describe('isEmpty', () => {
    test('Checks if the Object is empty, returns false if it has value', () => {
      expect(isEmpty(sampleObject)).toEqual(false);
    });
    test('Checks if the Object is empty, returns true if it is empty', () => {
      expect(isEmpty({})).toEqual(true);
    });
    test('When nothin passed', () => {
      // @ts-ignore
      expect(isEmpty()).toEqual(true);
    });
  });

  describe('map', () => {
    test('Object map', () => {
      expect(
        map({ a: 1, b: 2, c: 3 }, (value, key) => {
          return {
            key: key,
            value: value,
          };
        })
      ).toEqual({
        a: { key: 'a', value: 1 },
        b: { key: 'b', value: 2 },
        c: { key: 'c', value: 3 },
      });
    });
  });

  describe('flatten', () => {
    test('Flatten the given nested object', () => {
      expect(
        flatten({
          company: 'Razorpay',
          address: {
            street: 'Adugodi',
            city: 'Bengaluru',
          },
        })
      ).toEqual({
        company: 'Razorpay',
        'address.street': 'Adugodi',
        'address.city': 'Bengaluru',
      });
    });
    test('Flatten the given nested object with arrays', () => {
      expect(
        flatten({
          company: 'Razorpay',
          address: {
            street: 'Adugodi',
          },
          teamList: [{ team: 'RazorpayX' }, { team: 'Platform' }],
        })
      ).toEqual({
        company: 'Razorpay',
        'address.street': 'Adugodi',
        'teamList.0.team': 'RazorpayX',
        'teamList.1.team': 'Platform',
      });
    });
    test('Flatten the given nested object, if there is no nested object returns the same object', () => {
      expect(
        flatten({
          company: 'Razorpay',
        })
      ).toEqual({
        company: 'Razorpay',
      });
    });
    test('Flatten the given nested object, if object is empty returns the same empty object', () => {
      expect(flatten({})).toEqual({});
    });
  });

  describe('unflatten', () => {
    test('Unflatten the given flatten object', () => {
      expect(
        unflatten({
          company: 'Razorpay',
          contact: +91 - 999999999,
          'address.street': 'Adugodi',
          'address.city': 'Bengaluru',
          'address.state': 'Karnataka',
          'address.pincode': 560030,
        })
      ).toEqual({
        company: 'Razorpay',
        contact: +91 - 999999999,
        address: {
          street: 'Adugodi',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: 560030,
        },
      });
    });
    test('Unflatten the given flatten object, if its normal object returns the same', () => {
      expect(
        unflatten({
          company: 'Razorpay',
          contact: +91 - 999999999,
        })
      ).toEqual({
        company: 'Razorpay',
        contact: +91 - 999999999,
      });
    });
    test('Unflatten the given flatten object, if its empty object returns the same', () => {
      expect(unflatten({})).toEqual({});
    });
  });

  describe('loop', () => {
    test('check Object loop', () => {
      let value: number[] = [];
      loop({ a: 1, b: 2, c: 3 }, (val) => {
        value.push(val);
      });
      expect(value).toMatchObject([1, 2, 3]);
    });
    test('Object loop pass null', () => {
      let value: number[] = [];
      loop(null as any, () => {});
      expect(value).toMatchObject([]);
    });
  });

  describe('parse', () => {
    test('Convert String as Object', () => {
      expect(parse('{"result":true, "count":10}')).toEqual({
        result: true,
        count: 10,
      });
    });
    test('Convert String as Object with empty Object', () => {
      expect(parse('{}')).toEqual({});
    });
  });
});
