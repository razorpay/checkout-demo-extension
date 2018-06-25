export const documentElement = document.documentElement;
export const body = document.body;
export const innerWidth = global.innerWidth;
export const innerHeight = global.innerHeight;
export const pageYOffset = global.pageYOffset;
export const scrollBy = global.scrollBy;
export const scrollTo = global.scrollTo;
export const requestAnimationFrame = global.requestAnimationFrame;
export const querySelector = _Func.bind('querySelector', document);
export const querySelectorAll = _Func.bind('querySelectorAll', document);
export const getElementById = _Func.bind('getElementById', document);
export const getComputedStyle = _Func.bind('getComputedStyle', global);
export const EventConstructor = global.Event;
export const isEvent = x => _.is(x, EventConstructor);

var link;
export function resolveUrl(relativeUrl) {
  link = _El.create('a');
  link.src = relativeUrl;
  return link.src;
}

export function submitForm(action, data, method, target) {
  if (!action) {
    return;
  }

  /* set target to _self in case of redirect mode */
  target = target || '_self';

  if (method === 'get') {
    action = _.appendParamsToUrl(action, data);
    return global.open(`javascript:global.location.href='${action}'`, target);
  }

  _El.create('form')
    |> _El.setAttributes({ target, action, method })
    |> _El.setContents(data |> obj2formhtml)
    |> _El.appendTo(documentElement)
    |> _El.submit
    |> _El.detach;
}

export function obj2formhtml(data, key) {
  if (_.isNonNullObject(data)) {
    var str = '';
    _Obj.loop(data, function(value, name) {
      if (key) {
        name = key + '[' + name + ']';
      }
      str += obj2formhtml(value, name);
    });
    return str;
  }
  return '<input type="hidden" name="' + key + '" value="' + data + '">';
}

export function preventEvent(e) {
  if (isEvent(e)) {
    e.preventDefault();
    e.stopPropagation();
  }
  return false;
}

export function smoothScrollTo(y) {
  smoothScrollBy(y - pageYOffset);
}

var scrollTimeout;
const π = Math.PI;
export function smoothScrollBy(y) {
  if (!global.requestAnimationFrame) {
    return scrollBy(0, y);
  }
  if (scrollTimeout) {
    clearTimeout(scrollTimeout);
  }
  scrollTimeout = setTimeout(function() {
    var y0 = pageYOffset;
    var target = Math.min(y0 + y, elementHeight(body) - innerHeight);
    y = target - y0;
    var scrollCount = 0;
    var oldTimestamp = global.performance.now();

    function step(newTimestamp) {
      scrollCount += (newTimestamp - oldTimestamp) / 300;
      if (scrollCount >= 1) {
        return scrollTo(0, target);
      }
      var sin = Math.sin((π * scrollCount) / 2);
      scrollTo(0, y0 + Math.round(y * sin));
      oldTimestamp = newTimestamp;
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }, 100);
}
