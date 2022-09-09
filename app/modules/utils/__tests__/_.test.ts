import * as _ from '../_';
import * as _El from '../DOM';

const isFunction = (param: any) => expect(typeof param).toBe('function');
const isTrue = (param: any) => expect(param).toBeTruthy();
const isFalse = (param: any) => expect(param).toBeFalsy();
const equal = (param: any, param2: any) => expect(param).toBe(param2);
const deep = (param: any, param2: any) => expect(param).toMatchObject(param2);

describe('_', () => {
  describe('curry2', () => {
    describe('curries a function with two arguments properly', () => {
      const myFunc = (a: any, b: any) => ({ a, b });

      const curriedMyFunc = _.curry2(myFunc);

      it('returns a function', () => {
        isFunction(curriedMyFunc);
      });

      const afterFirstArg = curriedMyFunc('world');

      it('returns a function after first argument is passed', () => {
        isFunction(afterFirstArg);
      });

      const afterSecondArg = afterFirstArg('hello');

      const expected = {
        a: 'hello',
        b: 'world',
      };

      it('returns the return value after invoked again with only the second argument', () => {
        deep(expected, afterSecondArg);
      });

      it('returns the return value if curried function is called directly with both args', () => {
        const returned = curriedMyFunc('hello', 'world');

        deep(returned, expected);
      });
    });
  });

  describe('curry3', () => {
    describe('curries a function with three arguments properly', () => {
      const myFunc = (a: any, b: any, c: any) => ({ a, b, c });

      const curriedMyFunc = _.curry3(myFunc);

      it('returns a function', () => {
        isFunction(curriedMyFunc);
      });

      const afterFirstArg = curriedMyFunc('world', '!');

      it('returns a function after first and second arguments are passed', () => {
        isFunction(afterFirstArg);
      });

      const afterSecondArg = afterFirstArg('hello');
      const expected = {
        a: 'hello',
        b: 'world',
        c: '!',
      };

      it('returns the return value after invoked again with only the third argument', () => {
        deep(expected, afterSecondArg);
      });

      it('returns the return value if curried function is called directly with all three args', () => {
        const returned = curriedMyFunc('hello', 'world', '!');

        deep(returned, expected);
      });
    });
  });

  describe('validateArgs', () => {
    const validators = {
      string: (x: any) => typeof x === 'string',
      object: (x: any) => typeof x === 'object',
    };

    const dummy = () => 'foo';
    const dummyWithValidation = _.validateArgs(
      validators.string,
      validators.object
    )(dummy);

    it('validates without throwing any error', () => {
      equal(dummyWithValidation('bar', {}), 'foo');
    });

    it('returns the first arg when validation fails', () => {
      equal(dummyWithValidation('x', 1), 'x');
    });
  });

  describe('isType', () => {
    it('Check if it returns true on passing a string and "string" in the arguments', () => {
      const str = 'test';
      const expected = 'string';
      isTrue(_.isType(str, expected));
    });

    it('Check if it returns false on passing an object and "string" in the arguments', () => {
      const obj = {};
      const expected = 'string';
      isFalse(_.isType(obj, expected));
    });
  });

  describe('isBoolean', () => {
    it('determines properly argument is a boolean', () => {
      isTrue(_.isBoolean(false));
      isTrue(_.isBoolean(true));
    });

    it('determines that 0 is not a boolean', () => {
      isFalse(_.isBoolean(0));
    });
  });

  describe('isNumber', () => {
    it('determines properly that argument is a number', () => {
      isTrue(_.isNumber(1));
    });

    it('determines that false is not a number', () => {
      isFalse(_.isNumber(false));
    });
  });

  describe('isString', () => {
    it('determines properly that argument is a string', () => {
      isTrue(_.isString('Razorpay'));
    });
  });

  describe('isFunction', () => {
    it('determines properly that argument is a function', () => {
      isTrue(_.isFunction((_: any) => _));
    });
  });

  describe('isObject', () => {
    it('determines that {} is an object', () => {
      isTrue(_.isObject({}));
    });

    it('determines that [] is an object', () => {
      isTrue(_.isObject([]));
    });
  });

  describe('isArray', () => {
    it('determines that [] is an array', () => {
      isTrue(_.isArray([]));
    });

    it('determines that {} is an not an array', () => {
      isFalse(_.isArray({}));
    });
  });

  describe('isUndefined', () => {
    it('determines undefined element correctly', () => {
      isTrue(_.isUndefined(undefined));
    });

    it('determines no-params as undefined', () => {
      isTrue(_.isUndefined());
    });

    it('determines non-undefined properly', () => {
      isFalse(_.isUndefined([]));
    });
  });

  describe('isNull', () => {
    it('determines null element correctly', () => {
      isTrue(_.isNull(null));
    });

    it('determines non-null properly', () => {
      isFalse(_.isNull([]));
    });
  });

  describe('isPrimitive', () => {
    it('determines string as primitive', () => {
      isTrue(_.isPrimitive('razorpay'));
    });

    it('determines number as primitive', () => {
      isTrue(_.isPrimitive(42));
    });

    it('determines boolean as primitive', () => {
      isTrue(_.isPrimitive(true));
    });

    it('determines null as primitive', () => {
      isTrue(_.isPrimitive(null));
    });

    it('determines undefined as primitive', () => {
      isTrue(_.isPrimitive(undefined));
    });

    it('determines function as non-primitive', () => {
      isFalse(_.isPrimitive(() => {}));
    });

    it('determines objects as non-primitive', () => {
      isFalse(_.isPrimitive({}));
    });

    it('determines arrays as non-primitive', () => {
      isFalse(_.isPrimitive([]));
    });
  });

  describe('isElement', () => {
    it('Check if it is return true if element is an element or not', () => {
      const div = _El.create('div');
      isTrue(_.isElement(div));
    });

    it('Check if it is return false, object is not an element or not', () => {
      const obj = { test: 'test' };
      isFalse(_.isElement(obj));
    });

    it('Check if it is return false, null is not an element or not', () => {
      isFalse(_.isElement(null as any));
    });
  });

  describe('isTruthy', () => {
    it('Check if it says empty string is falsy', () => {
      const obj = '';
      isFalse(_.isTruthy(obj));
    });

    it('Check if it says empty object is truthy', () => {
      const obj = {};
      isTrue(_.isTruthy(obj));
    });

    it('Check if it says null is falsy', () => {
      const obj = null;
      isFalse(_.isTruthy(obj));
    });
  });

  describe('isNonNullObject', () => {
    it('Check if it works on null and returns false ', () => {
      const obj = null;
      isFalse(_.isNonNullObject(obj as any));
    });

    it('Check if it works on object and returns true ', () => {
      const obj = {};
      isTrue(_.isNonNullObject(obj));
    });
  });

  describe('isEmptyObject', () => {
    it('Check if it works on empty object and returns true ', () => {
      const obj = {};
      isTrue(_.isEmptyObject(obj));
    });

    it('Check if it works on non object and returns false ', () => {
      const obj = { test: 'test' };
      isFalse(_.isEmptyObject(obj));
    });
  });

  describe('prop', () => {
    it('returns the property of an object', () => {
      const obj = {
        foo: 'bar',
      };
      const returned = _.prop(obj, 'foo');

      equal(returned, obj.foo);
    });
  });

  describe('lengthOf', () => {
    it('gives the length of an array', () => {
      const array = [1, 2, 3];
      const length = _.lengthOf(array);

      equal(length, array.length);
    });

    it('gives the length of the string', () => {
      const str = 'Razorpay';
      const length = _.lengthOf(str);

      equal(length, str.length);
    });
  });

  describe('prototypeOf', () => {
    it('returns the proper prototype', () => {
      const arr: any[] = [];
      const prototype = _.prototypeOf(arr);

      equal(prototype, (arr as any).prototype);
    });
  });

  describe('is', () => {
    it('Check if it works on string and String Class and returns true', () => {
      const obj = new String('test');
      isTrue(_.is(obj, String));
    });

    it('Check if it works on string and Object Class and returns false', () => {
      const obj = 'test';
      isFalse(_.is(obj, Object));
    });
  });

  describe('rawError', () => {
    it('creates the raw error without field', () => {
      const err = _.rawError('Something went wrong');
      const expected = {
        description: 'Something went wrong',
      };

      deep(err, expected);
    });

    it('creates the raw error with field', () => {
      const err = _.rawError('OTP should not be empty', 'otp');
      const expected = {
        description: 'OTP should not be empty',
        field: 'otp',
      };

      deep(err, expected);
    });
  });

  describe('rzpError', () => {
    it('Check if it returns a raw error object with description and field inside an error key', () => {
      const error = _.rzpError('Error Desc', 'Error Field');
      const expected = {
        error: {
          description: 'Error Desc',
          field: 'Error Field',
        },
      };
      deep(error, expected);
    });
  });

  describe('throwMessage', () => {
    it('Check if it throws error as the given message', () => {
      const err = () => {
        _.throwMessage('Error!');
      };
      expect(err).toThrowError('Error!');
    });
  });

  describe('isBase64Image', () => {
    it('Check if it returns true for a base64 image string', () => {
      const image = 'data:image/gif;base64,R0lGODlhAQABAAAAACw=';
      isTrue(_.isBase64Image(image));
    });

    it('Check if it returns false for a non base64 image string', () => {
      const image = 'testing!';
      isFalse(_.isBase64Image(image));
    });
  });

  describe('makeQueryObject', () => {
    it('Check if it returns empty object for null object', () => {
      const obj = null;
      isTrue(_.isEmptyObject(_.makeQueryObject(obj as any)));
    });

    it('Check if it returns query object or a nested object', () => {
      const obj = { a: 1, b: { c: 3 } };
      const query = _.makeQueryObject(obj);
      const expected = { a: 1, 'b[c]': 3 };
      deep(query, expected);
    });

    it('works properly for an array', () => {
      const params = {
        a: [1, 2],
      };
      const expected = {
        'a[0]': 1,
        'a[1]': 2,
      };
      const query = _.makeQueryObject(params);

      deep(expected, query);
    });

    it('works properly for an array nested inside an object', () => {
      const params = {
        foo: 'bar',
        baz: {
          a: [1, 2],
        },
      };
      const expected = {
        foo: 'bar',
        'baz[a][0]': 1,
        'baz[a][1]': 2,
      };
      const query = _.makeQueryObject(params);

      deep(query, expected);
    });

    it('Check if it works correctly for an object and a prefix', () => {
      const obj = { a: 1 };
      const prefix = 'www.google.com';
      const query = _.makeQueryObject(obj, prefix);
      const expected = { 'www.google.com[a]': 1 };
      deep(query, expected);
    });
  });

  describe('obj2query', () => {
    it('Check if it returns empty string for empty object', () => {
      const obj = {};
      isTrue(_.obj2query(obj) === '');
    });

    it('Check if it returns query string for a nested object', () => {
      const obj = { a: 1, b: { c: 3 } };
      const expected = 'a=1&b%5Bc%5D=3';
      const url = _.obj2query(obj as any);
      equal(url, expected);
    });

    it('works properly for an array', () => {
      const params = {
        a: [1, 2],
      };
      const expected = 'a%5B0%5D=1&a%5B1%5D=2';
      const query = _.obj2query(params);

      equal(expected, query);
    });

    it('works properly for an array nested inside an object', () => {
      const params = {
        foo: 'bar',
        baz: {
          a: [1, 2],
        },
      };
      const expected = 'foo=bar&baz%5Ba%5D%5B0%5D=1&baz%5Ba%5D%5B1%5D=2';
      const query = _.obj2query(params);

      equal(query, expected);
    });

    it('Check if it returns query string for a simple object', () => {
      const obj = { a: 1, b: 2 };
      const expected = 'a=1&b=2';
      const url = _.obj2query(obj);
      equal(url, expected);
    });

    it('handles existing ampersands and spaces properly', () => {
      const params = {
        url: 'www.razorpay.com/?foo=bar&bar=baz',
        title: "Razorpay's Title",
      };
      const expected =
        "url=www.razorpay.com%2F%3Ffoo%3Dbar%26bar%3Dbaz&title=Razorpay's%20Title";
      const query = _.obj2query(params);

      equal(expected, query);
    });
  });

  describe('query2obj', () => {
    it('Check if it returns empty object for empty string', () => {
      const obj = '';
      isTrue(_.isEmptyObject(_.query2obj(obj)));
    });

    it('Check if it returns query object for a simple string', () => {
      const expected = { a: '1', b: '2' };
      const url = 'a=1&b=2';
      const obj = _.query2obj(url);
      deep(obj, expected);
    });
  });

  describe('appendParamsToUrl', () => {
    it('Check if it returns same url if blank object is passed', () => {
      const url = 'www.google.com';
      const obj = {};
      const expected = 'www.google.com';
      equal(_.appendParamsToUrl(url, obj), expected);
    });

    it('Check if it appends param to url', () => {
      const url = 'www.google.com';
      const obj = { c: 3, d: 4 };
      const expected = 'www.google.com?c=3&d=4';
      equal(_.appendParamsToUrl(url, obj), expected);
    });

    it('appends parameters properly to a URL with existing params', () => {
      const url = 'www.razorpay.com/?foo=bar';
      const params = {
        bar: 'baz',
      };

      const expected = url + '&bar=baz';
      const appended = _.appendParamsToUrl(url, params);
      equal(appended, expected);
    });
  });

  describe('getQueryParams', () => {
    it('Check if it returns empty object for non string argument', () => {
      const url = null;
      const params = _.getQueryParams(url as any);
      const expected = {};
      deep(params, expected);
    });

    it('Check if it returns empty object for empty string', () => {
      const url = '';
      const params = _.getQueryParams(url);
      const expected = {};
      deep(params, expected);
    });

    it('Check if it returns params object for URL string', () => {
      const url = '?a=1&b=2';
      const params = _.getQueryParams(url);
      const expected = { a: '1', b: '2' };
      deep(params, expected);
    });
  });

  describe('CustomEvent', () => {
    it('Creates a CustomEvent', () => {
      const event = _.CustomEvent('myevent', {
        detail: {
          foo: 'bar',
        },
      });

      equal(event.type, 'myevent');

      deep(event.detail, {
        foo: 'bar',
      });
    });
  });
});
