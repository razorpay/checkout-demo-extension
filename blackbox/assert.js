const path = require('path');
const chalk = require('chalk');
const chai = require('chai');
const { testDir } = require('./const');

// Based on https://github.com/csnover/TraceKit
const lineRegex = /^\s*at (?:((?:\[object object\])?\S+(?: \[as \S+\])?) )?\(?(.*?):(\d+)(?::(\d+))?\)?\s*$/i;

function parseStack(stack) {
  return stack
    .split('\n')
    .map(parseLine)
    .filter(_ => _)
    .join('\n\t');
}

function getRelativeTestPath(testPath) {
  if (testPath && testPath.startsWith(testDir)) {
    return path.relative(testDir, testPath);
  }
}

function parseLine(line) {
  const parts = lineRegex.exec(line);
  if (!parts || !(parts[2] = getRelativeTestPath(parts[2]))) return;

  let locationString = parts.slice(2, 5).join(':');
  if (parts[1]) locationString += ' in ' + parts[1];
  return locationString;
}

function getCallerFile() {
  let originalFunc = Error.prepareStackTrace;
  let callerfile;
  try {
    const err = new Error();
    Error.prepareStackTrace = (err, stack) => stack;
    while (err.stack.length) {
      const filename = err.stack.shift().getFileName();
      callerfile = getRelativeTestPath(filename);
      if (callerfile) break;
    }
  } catch (e) {
    console.error(e);
  }
  Error.prepareStackTrace = originalFunc;
  return callerfile;
}

function assert(message, filename = getCallerFile()) {
  return new Proxy(
    {},
    {
      get: (obj, prop) => {
        return function returnFunc(...args) {
          message = [filename, returnFunc.caller.name, message]
            .filter(_ => _)
            .join(' > ');
          try {
            chai.assert[prop](...args);
            console.log(chalk.green('✔ ' + message));
          } catch (e) {
            console.log(
              chalk.bold.white.bgRed('Error') +
                ' ' +
                chalk.bold.white(message + ' > ' + e.message) +
                '\n\t' +
                chalk.yellow(parseStack(e.stack))
            );
          }
        };
      },
    }
  );
}

function assertFile(file) {
  if (!file) file = getCallerFile();
  return message => assert(message, file);
}

module.exports = require('chai').assert;
