import { formatTemplateWithLocale } from './index';

/**
 * Returns a stringified version of the list with oxford commas
 * @param {Array<string>} list
 * @param {string} locale
 *
 * @returns {string}
 */
function oxfordComma(list, locale = 'en') {
  const length = list.length;

  switch (length) {
    case 0:
      return '';

    case 1:
      return list[0];

    // We do not use an oxford comma for two items
    case 2:
      return formatTemplateWithLocale(
        'misc.list_two_combined',
        { one: list[0], two: list[1] },
        locale
      );

    default:
      return formatTemplateWithLocale(
        'misc.list_multiple_combined',
        { init: list.slice(0, length - 1).join(', '), last: list[length - 1] },
        locale
      );
  }
}

/**
 * Returns the text with commas or "and" as the separator.
 * Example: list: ['a', 'b', 'c', 'd'], max: 2 - returns "a, b & More"
 * Example: list: ['a', 'b'], max: 2 - returns "a and b"
 * Example: list: ['a', 'b', 'c'], max: 3 - returns "a, b, and c"
 * @param {Array} list
 * @param {string} locale
 * @param {number} max
 *
 * @return {string}
 */
export function generateTextFromList(list, locale, max = Infinity) {
  if (list.length > max) {
    return formatTemplateWithLocale(
      'misc.and_more',
      { text: list.slice(0, max - 1).join(', ') },
      locale
    );
  }
  return oxfordComma(list, locale);
}

export function toLowerCaseSafe(str) {
  if (!str) {
    return;
  }

  return str.toLowerCase();
}
