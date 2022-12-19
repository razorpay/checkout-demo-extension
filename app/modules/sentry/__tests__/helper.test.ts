import { filterUnWantedExceptions } from '../helper';

const INPUT = [
  // error without filename mentioned as it's optional
  // https://sentry.io/organizations/rzp/issues/3718140599/events/82558d06f3104bc681fbff225dbcae41/?project=4503925471707136
  {
    type: 'TypeError',
    value: "Cannot read properties of undefined (reading 'enabledFeatures')",
    stacktrace: {
      frames: [
        {
          function: 'isFeatureBroken',
          lineno: 842,
          colno: 24,
          in_app: true,
        },
        {
          lineno: 1187,
          colno: 16,
          in_app: true,
        },
        {
          function: 'updateFeaturesInner',
          lineno: 1186,
          colno: 24,
          in_app: true,
        },
      ],
    },
  },
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
    // error happened in some injected file, should be ignored
    type: 'ReferenceError',
    value: '',
    stacktrace: {
      frames: [
        {
          filename: '<anonymous>',
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

const Error = [
  {
    type: 'ReferenceError',
    value: 'chrome-extension://',
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
          function: 'moz-extension://',
        },
      ],
    },
  },
  {
    type: 'ReferenceError',
    value:
      "Cannot destructure property 'instruments' of 'config' as it is null.",
    stacktrace: {
      frames: [
        {
          filename: 'https://checkout.razorpay.com/checkout-frame.js',
          colno: 2,
          in_app: false,
          lineno: 2,
          function: 'Session.render',
        },
      ],
    },
  },
  {
    type: 'ReferenceError',
    value:
      "Cannot destructure property 'instruments' of 'config' as it is null.",
    stacktrace: {
      frames: [
        {
          filename: 'moz-extension://',
          colno: 2,
          in_app: false,
          lineno: 2,
          function: 'Session.render',
        },
      ],
    },
  },
];

describe('#filterUnWantedExceptions', () => {
  test('filter checkout-frame & unhandled exception', () => {
    expect(filterUnWantedExceptions(INPUT).length).toBe(4);
  });
  test('filter chrome extension and mozrilla error', () => {
    expect(filterUnWantedExceptions(Error).length).toBe(1);
  });
});
