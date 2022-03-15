/**
 * This is equivalent [...new Set(array)]
 * Supported in legacy browsers & IE
 * @param {Array<any>} array
 * @param {Function} [func]
 * @returns Returns the array with unique elements.
 */
type FunctionCallback = (data: any) => any;

export function getUniqueValues(array: any[], func?: FunctionCallback) {
  if (!Array.isArray(array)) {
    return array;
  }
  return array
    .reduce((result, data) => {
      const _stringifiedData = JSON.stringify(func ? func(data) : data);
      if (!result.includes(_stringifiedData)) {
        result.push(_stringifiedData);
      }
      return result;
    }, [])
    .map(JSON.parse);
}
