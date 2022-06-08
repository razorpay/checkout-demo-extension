import * as formUtil from '../form';

const flattenInput = [
  {
    input: {
      a: 1,
      b: 2,
      c: 'hello',
    },
    output: {
      a: 1,
      b: 2,
      c: 'hello',
    },
  },
  {
    input: {
      a: 1,
      b: 2,
      c: {
        d: 'hello',
      },
    },
    output: {
      a: 1,
      b: 2,
      'c[d]': 'hello',
    },
  },
  {
    input: 1,
    output: {},
  },
  {
    input: 'hello',
    output: {},
  },
  {
    input: true,
    output: {},
  },
  {
    input: null,
    output: {},
  },
];
describe('test #flatten', () => {
  test.each(flattenInput)('.flatten($input)', ({ input, output }) => {
    expect(formUtil.flatten(input as any)).toMatchObject(output);
  });
});

const serializeInput = [
  {
    input: { a: 1, b: 'hello', c: "world's" },
    output: "a=1&b=hello&c=world's",
  },
  {
    input: {},
    output: '',
  },
  {
    input: 23,
    output: '',
  },
  {
    input: true,
    output: '',
  },
  {
    input: 'hello',
    output: '',
  },
];
describe('test #serialize', () => {
  test.each(serializeInput)('.serialize($input)', ({ input, output }) => {
    expect(formUtil.serialize(input as any)).toBe(output);
  });
});

const appendParamsToUrlInput = [
  {
    input: ['https://razorpay.com', { a: 1, b: 2 }],
    output: 'https://razorpay.com?a=1&b=2',
  },
  {
    input: ['https://razorpay.com', {}],
    output: 'https://razorpay.com',
  },
  {
    input: ['https://razorpay.com'],
    output: 'https://razorpay.com',
  },
  {
    input: ['http://razorpay.com', 'hello'],
    output: 'http://razorpay.com?hello',
  },
  {
    input: ['http://razorpay.com', 22],
    output: 'http://razorpay.com?22',
  },
  {
    input: ['http://razorpay.com', true],
    output: 'http://razorpay.com?true',
  },
];

describe('test #appendParamsToUrl', () => {
  test.each(appendParamsToUrlInput)(
    '.appendParamsToUrl($input)',
    ({ input, output }) => {
      expect(formUtil.appendParamsToUrl.apply(this, input as any)).toBe(output);
    }
  );
});

const appendFormInput = [
  {
    inputParam: {
      hello: 'world',
    },
  },
  {
    inputParam: {
      key: 'value',
      anotherKey: 'anotherValue',
    },
  },
  {
    inputParam: 23,
  },
  {
    inputParam: 'hello',
  },
  {
    inputParam: true,
  },
];

let form: HTMLFormElement;
describe('test #appendFormInput', () => {
  beforeEach(() => {
    form = document.createElement('form');
  });
  test.each(appendFormInput)(
    '.appendFormInput($inputParam)',
    ({ inputParam }) => {
      formUtil.appendFormInput({
        form,
        data: inputParam as any,
        doc: document,
      });
      if (typeof inputParam === 'object') {
        const formData = new FormData(form);
        for (let key in inputParam) {
          expect(formData.get(key)).toBe((inputParam as any)[key]);
        }
      } else {
        expect(form.childElementCount).toBe(0);
      }
    }
  );
});

describe('test #submitForm', () => {
  beforeEach(() => {
    window.location.href = 'http://localhost';
  });
  test('.submitForm get request with null param', () => {
    formUtil.submitForm({
      doc: document,
      method: 'get',
      params: null as any,
      url: '#razorpay',
    });
    expect(document.location.href).toBe('http://localhost/#razorpay');
  });

  test('.submitForm get request with valid param', () => {
    formUtil.submitForm({
      doc: document,
      method: 'get',
      params: { hello: 'world' },
      url: '#razorpay',
    });
    expect(document.location.href).toBe(
      'http://localhost/#razorpay?hello=world'
    );
  });

  test('.submitForm post request with null param', () => {
    HTMLFormElement.prototype.submit = jest.fn();
    formUtil.submitForm({
      doc: document,
      method: 'post',
      url: '#razorpay',
    });
    const form = (HTMLFormElement.prototype.submit as any).mock
      .contexts[0] as HTMLFormElement;
    expect(form.childElementCount).toBe(0);
    expect(form.action).toBe('http://localhost/#razorpay');
    expect(HTMLFormElement.prototype.submit).toHaveBeenCalledTimes(1);
  });

  test('.submitForm post request with valid param', () => {
    HTMLFormElement.prototype.submit = jest.fn();
    formUtil.submitForm({
      doc: document,
      method: 'post',
      params: { hello: 'world' },
      url: '#razorpay',
    });
    const form = (HTMLFormElement.prototype.submit as any).mock
      .contexts[0] as HTMLFormElement;
    expect(form.childElementCount).toBe(1);
    expect(form.action).toBe('http://localhost/#razorpay');
    const formData = new FormData(form);
    expect(formData.get('hello')).toBe('world');
    expect(HTMLFormElement.prototype.submit).toHaveBeenCalledTimes(1);
  });
});
