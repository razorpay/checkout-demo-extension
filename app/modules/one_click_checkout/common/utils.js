export function mergeObjOnKey(obj1, obj2, key) {
  return {
    ...obj1[key],
    ...obj2[key],
  };
}

export function isNumericalString(str) {
  return /^\d+$/.test(str);
}
