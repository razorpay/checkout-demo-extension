const VALID_URL_PATTERN =
  '^(https?:\\/\\/)?' + // protocol
  '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
  '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
  '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
  '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
  '(\\#[-a-z\\d_]*)?$';
export const VALID_URL_REGEX = new RegExp(VALID_URL_PATTERN, 'i');

export function mergeObjOnKey(obj1, obj2, key) {
  return {
    ...(obj1 ? obj1[key] : {}),
    ...(obj2 ? obj2[key] : {}),
  };
}

export function isNumericalString(str) {
  return /^\d+$/.test(str);
}

export function attachEvent(target, ...args) {
  target.addEventListener(...args);
  return {
    remove: () => target.removeEventListener(...args),
  };
}

/*-- the regex deletes any leading or trailing commas --*/
export function removeTrailingCommas(str) {
  if (str && typeof str === 'string') {
    return str.trim().replace(/(^,)|(,$)/g, '');
  }

  return '';
}

/**
 *
 * @param {Array} arr
 * @returns flat array
 */
export const flatten = function (arr) {
  let flatArray = [];
  for (let index = 0; index < arr.length; index++) {
    const element = arr[index];
    if (Array.isArray(element)) {
      flatArray = flatArray.concat(flatten(element));
    } else {
      flatArray.push(element);
    }
  }
  return flatArray;
};
