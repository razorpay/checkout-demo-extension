import { exceptionFromError, parseStack } from 'sentry/parser';
import { CapturedExceptions } from './fixtures/stacktrace';

describe('exceptionFromError method: Takes error object and returns exception object', () => {
  it('should create exception object', () => {
    const error = new Error('Something went wrong');
    const exception = exceptionFromError(error);

    expect(exception).toBeTruthy();
    expect(exception.values.length).toBe(1);
    expect(exception.values[0].type).toBeTruthy();
    expect(exception.values[0].value).toBeTruthy();
    expect(exception.values[0].stacktrace.frames).toBeTruthy();
  });
});

describe('parseStack method: parses error object and converts to stack', () => {
  it('should not parse IE9 Error', () => {
    expect(function () {
      parseStack(CapturedExceptions.IE_9);
    }).toThrow(new Error('Cannot parse given Error object'));
  });

  it('should parse Safari 6 Error.stack', function () {
    const stackFrames = parseStack(CapturedExceptions.SAFARI_6);
    const parsedStackFrames = [
      {
        function: undefined,
        filename: 'http://path/to/file.js',
        lineno: 48,
        colno: NaN,
        in_app: true,
      },
      {
        function: 'dumpException3',
        filename: 'http://path/to/file.js',
        lineno: 52,
        colno: NaN,
        in_app: true,
      },
      {
        function: 'onclick',
        filename: 'http://path/to/file.js',
        lineno: 82,
        colno: NaN,
        in_app: true,
      },
    ];

    expect(stackFrames).toBeTruthy();
    expect(stackFrames.length).toBe(3);
    expect(stackFrames).toEqual(parsedStackFrames);
  });

  it('should parse Safari 7 Error.stack', function () {
    const stackFrames = parseStack(CapturedExceptions.SAFARI_7);
    const parsedStackFrames = [
      {
        colno: 22,
        filename: 'http://path/to/file.js',
        function: undefined,
        in_app: true,
        lineno: 48,
      },
      {
        colno: 15,
        filename: 'http://path/to/file.js',
        function: 'dumpException3',
        function: 'foo',
        in_app: true,
        lineno: 52,
      },
      {
        colno: 107,
        filename: 'http://path/to/file.js',
        function: 'bar',
        in_app: true,
        lineno: 108,
      },
    ];
    expect(stackFrames).toBeTruthy();
    expect(stackFrames.length).toBe(3);
    expect(stackFrames).toEqual(parsedStackFrames);
  });

  it('should parse Safari 8 Error.stack', function () {
    const stackFrames = parseStack(CapturedExceptions.SAFARI_8);
    const parsedStackFrames = [
      {
        function: undefined,
        filename: 'http://path/to/file.js',
        lineno: 47,
        colno: 22,
        in_app: true,
      },
      {
        function: 'foo',
        filename: 'http://path/to/file.js',
        lineno: 52,
        colno: 15,
        in_app: true,
      },
      {
        function: 'bar',
        filename: 'http://path/to/file.js',
        lineno: 108,
        colno: 23,
        in_app: true,
      },
    ];
    expect(stackFrames).toBeTruthy();
    expect(stackFrames.length).toBe(3);
    expect(stackFrames).toEqual(parsedStackFrames);
  });

  it('should parse nested eval() from Safari 9', function () {
    const stackFrames = parseStack(CapturedExceptions.SAFARI_9_NESTED_EVAL);
    const parsedStackFrames = [
      { function: 'baz' },
      { function: 'foo' },
      { function: 'eval code' },
      {
        function: 'speak',
        filename: 'http://localhost:8080/file.js',
        lineno: 26,
        colno: 21,
        in_app: true,
      },
      {
        function: 'global code',
        filename: 'http://localhost:8080/file.js',
        lineno: 33,
        colno: 18,
        in_app: true,
      },
    ];

    expect(stackFrames).toBeTruthy();
    expect(stackFrames.length).toBe(5);
    expect(stackFrames).toEqual(parsedStackFrames);
  });

  it('should parse Firefox 31 Error.stack', function () {
    const stackFrames = parseStack(CapturedExceptions.FIREFOX_31);
    const parsedStackFrames = [
      {
        function: 'foo',
        filename: 'http://path/to/file.js',
        lineno: 41,
        colno: 13,
        in_app: true,
      },
      {
        function: 'bar',
        filename: 'http://path/to/file.js',
        lineno: 1,
        colno: 1,
        in_app: true,
      },
    ];

    expect(stackFrames).toBeTruthy();
    expect(stackFrames.length).toBe(2);
    expect(stackFrames).toEqual(parsedStackFrames);
  });

  it('should parse nested eval() from Firefox 43', function () {
    const stackFrames = parseStack(CapturedExceptions.FIREFOX_43_NESTED_EVAL);
    const parsedStackFrames = [
      {
        function: 'baz',
        filename: 'http://localhost:8080/file.js',
        lineno: 26,
        colno: NaN,
        in_app: true,
      },
      {
        function: 'foo',
        filename: 'http://localhost:8080/file.js',
        lineno: 26,
        colno: NaN,
        in_app: true,
      },
      {
        function: undefined,
        filename: 'http://localhost:8080/file.js',
        lineno: 26,
        colno: NaN,
        in_app: true,
      },
      {
        function: 'speak',
        filename: 'http://localhost:8080/file.js',
        lineno: 26,
        colno: 17,
        in_app: true,
      },
      {
        function: undefined,
        filename: 'http://localhost:8080/file.js',
        lineno: 33,
        colno: 9,
        in_app: true,
      },
    ];

    expect(stackFrames).toBeTruthy();
    expect(stackFrames.length).toBe(5);
    expect(stackFrames).toEqual(parsedStackFrames);
  });

  it('should parse function names containing @ in Firefox 43 Error.stack', function () {
    const stackFrames = parseStack(
      CapturedExceptions.FIREFOX_43_FUNCTION_NAME_WITH_AT_SIGN
    );
    const parsedStackFrames = [
      {
        function: 'obj["@fn"]',
        filename: 'Scratchpad/1',
        lineno: 10,
        colno: 29,
        in_app: true,
      },
      {
        function: undefined,
        filename: 'Scratchpad/1',
        lineno: 11,
        colno: 1,
        in_app: true,
      },
    ];

    expect(stackFrames).toBeTruthy();
    expect(stackFrames.length).toBe(2);
    expect(stackFrames).toEqual(parsedStackFrames);
  });

  it('should parse stack traces with @ in the URL', function () {
    const stackFrames = parseStack(
      CapturedExceptions.FIREFOX_60_URL_WITH_AT_SIGN
    );
    const parsedStackFrames = [
      {
        function: 'who',
        filename: 'http://localhost:5000/misc/stuff/foo.js',
        lineno: 3,
        colno: 9,
        in_app: true,
      },
      {
        function: 'what',
        filename: 'http://localhost:5000/misc/stuff/foo.js',
        lineno: 6,
        colno: 3,
        in_app: true,
      },
      {
        function: 'where',
        filename: 'http://localhost:5000/misc/stuff/foo.js',
        lineno: 9,
        colno: 3,
        in_app: true,
      },
      {
        function: 'why',
        filename: 'http://localhost:5000/misc/stuff/foo.js',
        lineno: 12,
        colno: 3,
        in_app: true,
      },
      {
        function: undefined,
        filename: 'http://localhost:5000/misc/stuff/foo.js',
        lineno: 15,
        colno: 1,
        in_app: true,
      },
    ];

    expect(stackFrames).toBeTruthy();
    expect(stackFrames.length).toBe(5);
    expect(stackFrames).toEqual(parsedStackFrames);
  });

  it('should parse stack traces with @ in the URL and the method', function () {
    const stackFrames = parseStack(
      CapturedExceptions.FIREFOX_60_URL_AND_FUNCTION_NAME_WITH_AT_SIGN
    );
    const parsedStackFrames = [
      {
        function: 'obj["@who"]',
        filename: 'http://localhost:5000/misc/stuff/foo.js',
        lineno: 4,
        colno: 9,
        in_app: true,
      },
      {
        function: 'what',
        filename: 'http://localhost:5000/misc/stuff/foo.js',
        lineno: 8,
        colno: 3,
        in_app: true,
      },
      {
        function: 'where',
        filename: 'http://localhost:5000/misc/stuff/foo.js',
        lineno: 11,
        colno: 3,
        in_app: true,
      },
      {
        function: 'why',
        filename: 'http://localhost:5000/misc/stuff/foo.js',
        lineno: 14,
        colno: 3,
        in_app: true,
      },
      {
        function: undefined,
        filename: 'http://localhost:5000/misc/stuff/foo.js',
        lineno: 17,
        colno: 1,
        in_app: true,
      },
    ];

    expect(stackFrames).toBeTruthy();
    expect(stackFrames.length).toBe(5);
    expect(stackFrames).toEqual(parsedStackFrames);
  });

  it('should parse V8 Error.stack', function () {
    const stackFrames = parseStack(CapturedExceptions.CHROME_15);
    const parsedStackFrames = [
      {
        function: 'bar',
        filename: 'http://path/to/file.js',
        in_app: true,
        lineno: 13,
        colno: 17,
      },
      {
        function: 'bar',
        filename: 'http://path/to/file.js',
        in_app: true,
        lineno: 16,
        colno: 5,
      },
      {
        function: 'foo',
        filename: 'http://path/to/file.js',
        in_app: true,
        lineno: 20,
        colno: 5,
      },
      {
        function: undefined,
        filename: 'http://path/to/file.js',
        in_app: true,
        lineno: 24,
        colno: 4,
      },
    ];

    expect(stackFrames).toBeTruthy();
    expect(stackFrames.length).toBe(4);
    expect(stackFrames).toEqual(parsedStackFrames);
  });

  it('should parse V8 entries with no location', function () {
    const stackFrames = parseStack({
      stack: 'Error\n at Array.forEach (native)',
    });
    const parsedStackFrames = [
      {
        function: 'Array.forEach',
        filename: '(native)',
        in_app: true,
        lineno: NaN,
        colno: NaN,
      },
    ];

    expect(stackFrames.length).toEqual(1);
    expect(stackFrames).toEqual(parsedStackFrames);
  });

  it('should parse V8 Error.stack entries with port numbers', function () {
    const stackFrames = parseStack(CapturedExceptions.CHROME_36);
    const parsedStackFrames = [
      {
        function: 'dumpExceptionError',
        filename: 'http://localhost:8080/file.js',
        in_app: true,
        lineno: 41,
        colno: 27,
      },
      {
        function: 'HTMLButtonElement.onclick',
        filename: 'http://localhost:8080/file.js',
        in_app: true,
        lineno: 107,
        colno: 146,
      },
    ];

    expect(stackFrames).toBeTruthy();
    expect(stackFrames.length).toBe(2);
    expect(stackFrames).toEqual(parsedStackFrames);
  });

  it('should parse error stacks with Constructors', function () {
    const stackFrames = parseStack(CapturedExceptions.CHROME_46);
    const parsedStackFrames = [
      {
        function: 'new CustomError',
        filename: 'http://localhost:8080/file.js',
        in_app: true,
        lineno: 41,
        colno: 27,
      },
      {
        function: 'HTMLButtonElement.onclick',
        filename: 'http://localhost:8080/file.js',
        in_app: true,
        lineno: 107,
        colno: 146,
      },
    ];

    expect(stackFrames).toBeTruthy();
    expect(stackFrames.length).toBe(2);
    expect(stackFrames).toEqual(parsedStackFrames);
  });

  it('should parse nested eval() from V8', function () {
    const stackFrames = parseStack(CapturedExceptions.CHROME_48_NESTED_EVAL);
    const parsedStackFrames = [
      {
        function: 'baz',
        filename: 'http://localhost:8080/file.js',
        in_app: true,
        lineno: 21,
        colno: 17,
      },
      {
        function: 'foo',
        filename: 'http://localhost:8080/file.js',
        in_app: true,
        lineno: 21,
        colno: 17,
      },
      {
        function: 'eval',
        filename: 'http://localhost:8080/file.js',
        in_app: true,
        lineno: 21,
        colno: 17,
      },
      {
        function: 'Object.speak',
        filename: 'http://localhost:8080/file.js',
        in_app: true,
        lineno: 21,
        colno: 17,
      },
      {
        function: undefined,
        filename: 'http://localhost:8080/file.js',
        in_app: true,
        lineno: 31,
        colno: 13,
      },
    ];

    expect(stackFrames).toBeTruthy();
    expect(stackFrames.length).toBe(5);
    expect(stackFrames).toEqual(parsedStackFrames);
  });

  it('should parse IE 10 Error stacks', function () {
    const stackFrames = parseStack(CapturedExceptions.IE_10);

    expect(stackFrames).toBeTruthy();
    expect(stackFrames.length).toBe(3);
    expect(stackFrames).toEqual([
      {
        function: 'Anonymous function',
        filename: 'http://path/to/file.js',
        in_app: true,
        lineno: 48,
        colno: 13,
      },
      {
        function: 'foo',
        filename: 'http://path/to/file.js',
        in_app: true,
        lineno: 46,
        colno: 9,
      },
      {
        function: 'bar',
        filename: 'http://path/to/file.js',
        in_app: true,
        lineno: 82,
        colno: 1,
      },
    ]);
  });

  it('should parse IE 11 Error stacks', function () {
    const stackFrames = parseStack(CapturedExceptions.IE_11);
    const parsedStackFrames = [
      {
        function: 'Anonymous function',
        filename: 'http://path/to/file.js',
        in_app: true,
        lineno: 47,
        colno: 21,
      },
      {
        function: 'foo',
        filename: 'http://path/to/file.js',
        in_app: true,
        lineno: 45,
        colno: 13,
      },
      {
        function: 'bar',
        filename: 'http://path/to/file.js',
        in_app: true,
        lineno: 108,
        colno: 1,
      },
    ];

    expect(stackFrames).toBeTruthy();
    expect(stackFrames.length).toBe(3);
    expect(stackFrames).toEqual(parsedStackFrames);
  });

  it('should parse nested eval() from Edge', function () {
    const stackFrames = parseStack(CapturedExceptions.EDGE_20_NESTED_EVAL);
    const parsedStackFrames = [
      {
        function: 'baz',
        filename: undefined,
        in_app: true,
        lineno: 1,
        colno: 18,
      },
      {
        function: 'foo',
        filename: undefined,
        in_app: true,
        lineno: 2,
        colno: 90,
      },
      {
        function: 'eval',
        filename: undefined,
        in_app: true,
        lineno: 4,
        colno: 18,
      },
      {
        function: 'speak',
        filename: 'http://localhost:8080/file.js',
        in_app: true,
        lineno: 25,
        colno: 17,
      },
      {
        function: 'Global code',
        filename: 'http://localhost:8080/file.js',
        in_app: true,
        lineno: 32,
        colno: 9,
      },
    ];

    expect(stackFrames).toBeTruthy();
    expect(stackFrames.length).toBe(5);
    expect(stackFrames).toEqual(parsedStackFrames);
  });

  it('should parse Opera 9.27 Error messages', function () {
    const stackFrames = parseStack(CapturedExceptions.OPERA_927);
    const parsedStackFrames = [
      {
        filename: 'http://path/to/file.js',
        lineno: 43,
        colno: NaN,
        in_app: true,
      },
      {
        filename: 'http://path/to/file.js',
        lineno: 31,
        colno: NaN,
        in_app: true,
      },
      {
        filename: 'http://path/to/file.js',
        lineno: 18,
        colno: NaN,
        in_app: true,
      },
    ];

    expect(stackFrames).toBeTruthy();
    expect(stackFrames.length).toBe(3);
    expect(stackFrames).toEqual(parsedStackFrames);
  });

  it('should parse Opera 10 Error messages', function () {
    const stackFrames = parseStack(CapturedExceptions.OPERA_10);
    const parsedStackFrames = [
      {
        function: undefined,
        filename: 'http://path/to/file.js',
        lineno: 42,
        in_app: true,
      },
      {
        function: undefined,
        filename: 'http://path/to/file.js',
        lineno: 27,
        in_app: true,
      },
      {
        function: 'printStackTrace',
        filename: 'http://path/to/file.js',
        lineno: 18,
        in_app: true,
      },
      {
        function: 'bar',
        filename: 'http://path/to/file.js',
        lineno: 4,
        in_app: true,
      },
      {
        function: 'bar',
        filename: 'http://path/to/file.js',
        lineno: 7,
        in_app: true,
      },
      {
        function: 'foo',
        filename: 'http://path/to/file.js',
        lineno: 11,
        in_app: true,
      },
      {
        function: undefined,
        filename: 'http://path/to/file.js',
        lineno: 15,
        in_app: true,
      },
    ];

    expect(stackFrames).toBeTruthy();
    expect(stackFrames.length).toBe(7);
    expect(stackFrames).toEqual(parsedStackFrames);
  });

  it('should parse Opera 11 Error messages', function () {
    const stackFrames = parseStack(CapturedExceptions.OPERA_11);
    const parsedStackFrames = [
      {
        function: '<anonymous function: run>([arguments not available])',
        filename: 'http://path/to/file.js',
        lineno: 27,
        colno: NaN,
        in_app: true,
      },
      {
        function: 'bar([arguments not available])',
        filename: 'http://domain.com:1234/path/to/file.js',
        lineno: 18,
        colno: NaN,
        in_app: true,
      },
      {
        function: 'foo([arguments not available])',
        filename: 'http://domain.com:1234/path/to/file.js',
        lineno: 11,
        colno: NaN,
        in_app: true,
      },
      {
        function: '<anonymous function>',
        filename: 'http://path/to/file.js',
        lineno: 15,
        colno: NaN,
        in_app: true,
      },
      {
        function: 'Error created at <anonymous function>',
        filename: 'http://path/to/file.js',
        lineno: 15,
        colno: NaN,
        in_app: true,
      },
    ];

    expect(stackFrames).toBeTruthy();
    expect(stackFrames.length).toBe(5);
    expect(stackFrames).toEqual(parsedStackFrames);
  });

  it('should parse Opera 25 Error stacks', function () {
    const stackFrames = parseStack(CapturedExceptions.OPERA_25);
    const parsedStackFrames = [
      {
        function: undefined,
        filename: 'http://path/to/file.js',
        in_app: true,
        lineno: 47,
        colno: 22,
      },
      {
        function: 'foo',
        filename: 'http://path/to/file.js',
        in_app: true,
        lineno: 52,
        colno: 15,
      },
      {
        function: 'bar',
        filename: 'http://path/to/file.js',
        in_app: true,
        lineno: 108,
        colno: 168,
      },
    ];

    expect(stackFrames).toBeTruthy();
    expect(stackFrames.length).toBe(3);
    expect(stackFrames).toEqual(parsedStackFrames);
  });

  it('should handle newlines in Error stack messages', function () {
    const stackFrames = parseStack({
      stack:
        'Error: Problem at this\nlocation. Error code:1234\n' +
        '    at http://path/to/file.js:47:22\n' +
        '    at foo (http://path/to/file.js:52:15)',
    });
    const parsedStackFrames = [
      {
        function: undefined,
        filename: 'http://path/to/file.js',
        in_app: true,
        lineno: 47,
        colno: 22,
      },
      {
        function: 'foo',
        filename: 'http://path/to/file.js',
        in_app: true,
        lineno: 52,
        colno: 15,
      },
    ];

    expect(stackFrames.length).toBe(2);
    expect(stackFrames).toEqual(parsedStackFrames);
  });

  it('should handle webpack eval stacks', function () {
    const stackframes = parseStack({
      stack:
        'ReferenceError: chilxdren is not defined\n ' +
        'at Layout (eval at proxyClass (webpack:///../react-hot-loader/~/react-proxy/modules/createClassProxy.js?), <anonymous>:4:17)',
    });
    const parsedStackFrames = [
      {
        function: 'Layout',
        filename:
          'webpack:///../react-hot-loader/~/react-proxy/modules/createClassProxy.js?',
        in_app: true,
        lineno: NaN,
        colno: NaN,
      },
    ];

    expect(stackframes.length).toBe(1);
    expect(stackframes).toEqual(parsedStackFrames);
  });
});
