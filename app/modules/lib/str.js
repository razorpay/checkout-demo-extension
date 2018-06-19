// https://vocajs.com/

export const pad = str => ' ' + str + ' ';
export const contains = _.curry2((str, substr) => str.indexOf(substr) !== -1);
export const slice = arr.slice;
export const sliceFrom = arr.sliceFrom;
