export const hasSessionStorage = function hasSessionStorage() {
  try {
    return !!window.sessionStorage;
  } catch (e) {
    return true; // SecurityError when referencing it means it exists
  }
};

export const hasLocalStorage = function hasLocalStorage() {
  try {
    return !!window.localStorage;
  } catch (e) {
    return true; // SecurityError when referencing it means it exists
  }
};

export const hasIndexedDB = function hasIndexedDB() {
  try {
    return !!window.indexedDB;
  } catch (e) {
    return true; // SecurityError when referencing it means it exists
  }
};
