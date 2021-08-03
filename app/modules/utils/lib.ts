import type { BaseFunction } from 'types';

/**
 * Returns the curried version of a function.
 * @param {function} fns
 * @returns {function}
 */
export const pipe =
  (...fns: BaseFunction[]): any =>
  (x: any) =>
    fns.reduce((v: any, f: BaseFunction) => f(v), x);

/**
 * Checks if the given argument is Base64 Image string or not
 * @param {string} src
 *
 * @returns {boolean}
 */
export const isBase64Image = (src: string): boolean =>
  /data:image\/[^;]+;base64/.test(src);

/* global _Obj */
/**
 * Un-flattens the object by turning delimiters into nested object structure
 * @param {Object} o
 *
 * @returns {Object}
 */
export const unFlattenObject = _Obj.unflatten;
