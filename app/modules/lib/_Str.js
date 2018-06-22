// https://vocajs.com/

export const pad = str => ' ' + str + ' ';
export const contains = _.curry2((str, substr) => str.indexOf(substr) !== -1);
export const slice = _Arr.slice;
export const sliceFrom = _Arr.sliceFrom;
