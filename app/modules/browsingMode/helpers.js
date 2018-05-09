export const retry = function retry(isDone, next) {
  let current_trial = 0,
    max_retry = 50,
    interval = 10,
    is_timeout = false;

  var id = window.setInterval(() => {
    var done = isDone(),
      maxRetriesDone = current_trial++ > max_retry;

    if (!done && !maxRetriesDone) {
      return;
    }

    window.clearInterval(id);
    is_timeout = maxRetriesDone;
    next(is_timeout);
  }, 10);
};

export const isIE10OrLater = function isIE10OrLater(userAgent) {
  var ua = userAgent.toLowerCase();

  if (ua.indexOf('msie') === 0 && ua.indexOf('trident') === 0) {
    return false;
  }

  var match = /(?:msie|rv:)\s?([\d\.]+)/.exec(ua);

  if (match && window.parseInt(match[1], 10) >= 10) {
    return true;
  }

  // detext if its edge
  return !!/edge/.exec(ua);
};
