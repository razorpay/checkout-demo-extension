/**
 * In-memory version of window.localStorage
 */
const BrowserStorage = {
  _storage: {},

  setItem: function (key, value) {
    this._storage[key] = value;
  },

  getItem: function (key) {
    return this._storage[key] || null;
  },

  removeItem: function (key) {
    delete this._storage[key];
  },
};

/**
 * Determines which storage to use:
 * window.localStorage, or BrowserStorage
 *
 * @returns {localStorage|Object}
 */
function determineStorage() {
  // Get current timestamp
  const now = _.now();

  try {
    // Put current timestamp in storage and verify if storage is available
    global.localStorage.setItem('_storage', now);
    const fromStorage = global.localStorage.getItem('_storage');
    global.localStorage.removeItem('_storage');

    // If timestamp from storage doesn't match, use our mocked storage
    if (now !== parseInt(fromStorage)) {
      return BrowserStorage;
    } else {
      return global.localStorage;
    }
  } catch (err) {
    // In case something fails, use our mocked storage.
    return BrowserStorage;
  }
}

export default determineStorage();
