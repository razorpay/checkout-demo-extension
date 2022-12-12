import { filterUnWantedExceptions } from '../helper';

const INPUT = [
  {
    // error happened in checkout-frame file
    type: 'ReferenceError',
    value: '',
    stacktrace: {
      frames: [
        {
          filename: 'https://checkout.razorpay.com/checkout-frame.js',
          colno: 2,
          in_app: false,
          lineno: 2,
          function: 'any',
        },
      ],
    },
  },
  {
    // error happened in checkout-frame-lite file
    type: 'ReferenceError',
    value: '',
    stacktrace: {
      frames: [
        {
          filename: 'https://checkout.razorpay.com/checkout-frame-lite.js',
          colno: 2,
          in_app: false,
          lineno: 2,
          function: 'any',
        },
      ],
    },
  },
  {
    // error happened in checkout-frame-core file
    type: 'ReferenceError',
    value: '',
    stacktrace: {
      frames: [
        {
          filename: 'https://checkout.razorpay.com/checkout-frame-core.js',
          colno: 2,
          in_app: false,
          lineno: 2,
          function: 'any',
        },
      ],
    },
  },
  {
    // error happened in vendor function called by checkout-frame-[lite|core].js
    type: 'ReferenceError',
    value: '',
    stacktrace: {
      frames: [
        {
          filename: 'https://checkout.razorpay.com/835.js',
          colno: 2,
          in_app: false,
          lineno: 2,
          function: 'any',
        },
        {
          filename: 'https://checkout.razorpay.com/checkout-frame-core.js',
          colno: 2,
          in_app: false,
          lineno: 2,
          function: 'any',
        },
      ],
    },
  },
  {
    type: 'UnhandledRejection',
    value: '',
    stacktrace: {
      frames: [],
    },
  },
  {
    type: 'ReferenceError',
    value: '',
    stacktrace: {
      frames: [
        {
          filename: 'https://checkout.razorpay.com/dummy.js',
          colno: 2,
          in_app: false,
          lineno: 2,
          function: 'any',
        },
      ],
    },
  },
];

describe('#filterUnWantedExceptions', () => {
  test('filter checkout-frame & unhandled exception', () => {
    expect(filterUnWantedExceptions(INPUT).length).toBe(5);
  });
});
