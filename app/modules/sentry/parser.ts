import type { Exception, StackFrame } from './interfaces';

const FIREFOX_SAFARI_STACK_REGEXP = /(^|@)\S+:\d+/;
const CHROME_IE_STACK_REGEXP = /^\s*at .*(\S+:\d+|\(native\))/m;
const SAFARI_NATIVE_CODE_REGEXP = /^(eval@)?(\[native code])?$/;

/**
 * Takes error object and returns exception object
 * @param {Error} error object
 * @returns {Exception} exception object needed in sentry HTTP API.
 */
export function exceptionFromError(error: Error): Exception {
  return {
    values: [
      {
        type: error.name,
        value: error.message,
        stacktrace: {
          frames: parseStack(error),
        },
      },
    ],
  };
}

/**
 * Given an Error object, extract the most information from it.
 * Parser reference: https://github.com/stacktracejs/error-stack-parser/blob/master/error-stack-parser.js
 * @param {Error} error object
 * @return {Array} of StackFrames
 */
export function parseStack(error: Error): StackFrame[] {
  if ((error as any)['opera#sourceloc']) {
    return parseOpera(error);
  } else if (error.stack && error.stack.match(CHROME_IE_STACK_REGEXP)) {
    return parseV8OrIE(error);
  } else if (error.stack) {
    return parseFFOrSafari(error);
  }
  throw new Error('Cannot parse given Error object');
}

// Separate line and column numbers from a string of the form: (URI:Line:Column)
function extractLocation(urlLike: string) {
  // Fail-fast but return locations like "(native)"
  if (urlLike.indexOf(':') === -1) {
    return [urlLike];
  }

  const regExp = /(.+?)(?::(\d+))?(?::(\d+))?$/;
  const parts = regExp.exec(urlLike.replace(/[()]/g, ''));
  return [parts?.[1], parts?.[2] || undefined, parts?.[3] || undefined];
}

function parseV8OrIE(error: Error): StackFrame[] {
  const filtered = error.stack?.split('\n').filter(function (line) {
    return !!line.match(CHROME_IE_STACK_REGEXP);
  });

  return (
    filtered?.map(function (line) {
      if (line.indexOf('(eval ') > -1) {
        // Throw away eval information until we implement stacktrace.js/stackframe#8
        line = line
          .replace(/eval code/g, 'eval')
          .replace(/(\(eval at [^()]*)|(,.*$)/g, '');
      }
      let sanitizedLine = line
        .replace(/^\s+/, '')
        .replace(/\(eval code/g, '(')
        .replace(/^.*?\s+/, '');

      // capture and preseve the parenthesized location "(/foo/my bar.js:12:87)" in
      // case it has spaces in it, as the string is split on \s+ later on
      const fileLocation = sanitizedLine.match(/ (\(.+\)$)/);

      // remove the parenthesized location from the line, if it was matched
      sanitizedLine = fileLocation
        ? sanitizedLine.replace(fileLocation[0], '')
        : sanitizedLine;

      // if a location was matched, pass it to extractLocation() otherwise pass all sanitizedLine
      // because this line doesn't have function name
      const locationParts = extractLocation(
        fileLocation ? fileLocation[1] : sanitizedLine
      );
      const functionName = (fileLocation && sanitizedLine) || undefined;
      const fileName =
        ['eval', '<anonymous>'].indexOf(locationParts[0] || '') > -1
          ? undefined
          : locationParts[0];

      return {
        function: functionName,
        filename: fileName,
        in_app: true,
        lineno: Number(locationParts[1]),
        colno: Number(locationParts[2]),
      } as StackFrame;
    }) || []
  );
}

function parseFFOrSafari(error: Error): StackFrame[] {
  const filtered = error.stack?.split('\n').filter(function (line) {
    return !line.match(SAFARI_NATIVE_CODE_REGEXP);
  });

  return (
    filtered?.map(function (line) {
      // Throw away eval information until we implement stacktrace.js/stackframe#8
      if (line.indexOf(' > eval') > -1) {
        line = line.replace(
          / line (\d+)(?: > eval line \d+)* > eval:\d+:\d+/g,
          ':$1'
        );
      }

      if (line.indexOf('@') === -1 && line.indexOf(':') === -1) {
        // Safari eval frames only have function names and nothing else
        return { function: line } as StackFrame;
      }
      const functionNameRegex = /((.*".+"[^@]*)?[^@]*)(?:@)/;
      const matches = line.match(functionNameRegex);
      const functionName = matches && matches[1] ? matches[1] : undefined;
      const locationParts = extractLocation(
        line.replace(functionNameRegex, '')
      );

      return {
        function: functionName,
        filename: locationParts[0],
        lineno: Number(locationParts[1]),
        colno: Number(locationParts[2]),
        in_app: true,
      } as StackFrame;
    }) || []
  );
}

function parseOpera(e: Error): StackFrame[] {
  if (e.message.indexOf('\n') > -1) {
    return parseOpera9(e);
  } else if (!e.stack) {
    return parseOpera10(e);
  }
  return parseOpera11(e);
}

function parseOpera9(e: Error): StackFrame[] {
  const lineRE = /Line (\d+).*script (?:in )?(\S+)/i;
  const lines = e.message.split('\n');
  const result = [];

  for (let i = 2, len = lines.length; i < len; i += 2) {
    const match = lineRE.exec(lines[i]);
    if (match) {
      result.push({
        filename: match[2],
        lineno: Number(match[1]),
        colno: Number(lines[i]),
        in_app: true,
      } as StackFrame);
    }
  }

  return result;
}

export function parseOpera10(e: Error): StackFrame[] {
  const lineRE = /Line (\d+).*script (?:in )?(\S+)(?:: In function (\S+))?$/i;
  const lines = (e as any)?.stacktrace?.split('\n') || [];
  const result = [];

  for (let i = 0, len = lines.length; i < len; i += 2) {
    const match = lineRE.exec(lines[i] as string);
    if (match) {
      result.push({
        function: match[3] || undefined,
        filename: match[2],
        lineno: Number(match[1]),
        in_app: true,
      } as StackFrame);
    }
  }

  return result;
}

// Opera 10.65+ Error.stack very similar to FF/Safari
export function parseOpera11(error: Error): StackFrame[] {
  const filtered = error.stack?.split('\n').filter(function (line) {
    return (
      !!line.match(FIREFOX_SAFARI_STACK_REGEXP) &&
      !line.match(/^Error created at/)
    );
  });

  return (
    filtered?.map(function (line) {
      const tokens = line.split('@');
      const locationParts = extractLocation(tokens.pop() || '');
      const functionCall = tokens.shift() || '';
      const functionName =
        functionCall
          .replace(/<anonymous function(: (\w+))?>/, '$2')
          .replace(/\([^)]*\)/g, '') || undefined;

      return {
        function: functionName,
        filename: locationParts[0],
        lineno: Number(locationParts[1]),
        colno: Number(locationParts[2]),
        in_app: true,
      } as StackFrame;
    }) || []
  );
}
