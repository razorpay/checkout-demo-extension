export function mergeObjOnKey(obj1, obj2, key) {
  return {
    ...obj1[key],
    ...obj2[key],
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
  if (str && typeof str === 'string')
    return str.trim().replace(/(^,)|(,$)/g, '');

  return '';
}
