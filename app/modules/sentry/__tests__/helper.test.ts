import { filterUnWantedExceptions } from '../helper';

const INPUT = [
  {
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
    expect(filterUnWantedExceptions(INPUT).length).toBe(2);
  });
});
