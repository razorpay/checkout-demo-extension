import { retry, isIE10OrLater } from './helpers';

let isPrivate,
  error = null;

function detectPrivateMode(callback) {
  var is_private;

  if (window.webkitRequestFileSystem) {
    window.webkitRequestFileSystem(
      window.TEMPORARY,
      1,
      function() {
        is_private = false;
      },
      function(e) {
        is_private = true;
      }
    );
  } else if (window.indexedDB && /Firefox/.test(window.navigator.userAgent)) {
    var db;
    try {
      db = window.indexedDB.open('test');
    } catch (e) {
      is_private = true;
    }

    if (typeof is_private === 'undefined') {
      retry(
        function isDone() {
          return db.readyState === 'done' ? true : false;
        },
        function next(is_timeout) {
          if (!is_timeout) {
            is_private = db.result ? false : true;
          }
        }
      );
    }
  } else if (isIE10OrLater(window.navigator.userAgent)) {
    is_private = false;
    try {
      if (!window.indexedDB) {
        is_private = true;
      }
    } catch (e) {
      is_private = true;
    }
  } else if (window.localStorage && /Safari/.test(window.navigator.userAgent)) {
    try {
      window.localStorage.setItem('test', 1);
    } catch (e) {
      is_private = true;
    }

    if (typeof is_private === 'undefined') {
      window.localStorage.removeItem('test');

      if (window.openDatabase) {
        try {
          window.openDatabase(null, null, null, null);
          is_private = false;
        } catch (e) {
          is_private = true;
        }
      } else {
        is_private = false;
      }
    }
  }

  retry(
    function isDone() {
      return typeof is_private !== 'undefined' ? true : false;
    },
    function next(is_timeout) {
      callback(is_private);
    }
  );
}

try {
  detectPrivateMode(mode => {
    isPrivate = mode;
  });
} catch (e) {
  error = e;
}

export default () => isPrivate;
