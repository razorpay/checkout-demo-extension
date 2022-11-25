import { isString, isRegExp } from 'utils/_';
import { ERROR_IGNORE_LIST } from './constants';

import type { Error } from 'error-service/types';

export function stringMatchesSomePattern(
  value: string,
  patterns: Array<RegExp | string>,
  requireExactStringMatch = false
): boolean {
  if (!isString(value)) {
    return false;
  }

  return patterns.some((pattern) => {
    if (isRegExp(pattern)) {
      return pattern.test(value);
    }
    if (isString(pattern)) {
      return requireExactStringMatch
        ? value === pattern
        : value.includes(pattern);
    }
  });
}

export function isIgnoredErrors(error: Error | string | undefined): boolean {
  try {
    const stringToMatch = isString(error)
      ? error
      : error?.stack || error?.message || error?.description || '';

    return (
      stringMatchesSomePattern(
        stringToMatch,
        ERROR_IGNORE_LIST.exactMatches,
        true
      ) ||
      stringMatchesSomePattern(
        stringToMatch,
        ERROR_IGNORE_LIST.looseMatches,
        false
      )
    );
  } catch (e) {
    return false;
  }
}
