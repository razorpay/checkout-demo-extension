export const document = global.document;
export const documentElement = document.documentElement;
export const body = document.body;

export const EventConstructor = global.Event;
export const ElementConstructor = global.Element;

export const isElement = x => _.is(x, ElementConstructor);
export const isEvent = x => _.is(x, EventConstructor);

export const innerWidth = global.innerWidth;
export const innerHeight = global.innerHeight;
export const pageYOffset = global.pageYOffset;
export const scrollBy = global.scrollBy;
export const scrollTo = global.scrollTo;
export const requestAnimationFrame = global.requestAnimationFrame;
export const performance = global.performance;

export const querySelector = func.bind('querySelector', document);
export const querySelectorAll = func.bind('querySelectorAll', document);
export const getElementById = func.bind('getElementById', document);
export const getComputedStyle = func.bind('getComputedStyle', global);

export const elementSelectionStart = _.getter('selectionStart');
export const elementSelectionEnd = _.getter('selectionEnd');
export const elementParent = _.getter('parentNode');
export const submitElement = el => el.submit();

export function createElement(tagName) {
  return document.createElement(tagName || 'div');
}

export function createTextNode(string) {
  return document.createTextNode(string);
}

export function replaceNode(prevChild, nextChild) {
  return elementParent(prevChild).replaceChild(nextChild, prevChild);
}

// returns child
export function appendNode(child, parent) {
  return parent.appendChild(child);
}

export function removeNode(child) {
  var parentNode = elementParent(child);
  if (parentNode) {
    parentNode.removeNode(child);
  }
  return child;
}

export function injectCss(css) {
  var style = createElement('style');
  style.type = 'text/css';
  appendNode(createTextNode(css), style);
  appendNode(style, documentElement);
}

export const elementHasClass = (el, className) =>
  el && str.contains(str.pad(el.className), str.pad(className));

export function elementAddClass(el, className) {
  if (className && el) {
    if (!el.className) {
      el.className = className;
    } else if (!elementHasClass(el, className)) {
      el.className += ' ' + className;
    }
  }
  return el;
}

export function elementRemoveClass(el, className) {
  if (el) {
    className = (' ' + el.className + ' ')
      .replace(' ' + className + ' ', ' ')
      .replace(/^ | $/g, '');

    if (el.className !== className) {
      el.className = className;
    }
  }
  return el;
}

export const getElementAttribute = (el, attr) => el && el.getAttribute(attr);
export const getEventTargetAttribute = (e, attr) =>
  getElementAttribute(e.currentTarget, attr);

const multiSetter = func => (subject, objOrKey, value) => {
  if (_.isNonNullObject(objOrKey)) {
    obj.loop(objOrKey, (value, attrKey) => {
      func(subject, attrKey, value);
    });
  } else if (subject) {
    return multiSetter(subject, objOrKey, value);
  }
  return subject;
};

export const setElementAttribute = multiSetter(
  (el, attr, val) => _.isString(val) && el.setAttribute(attr, val)
);
export const setElementStyle = multiSetter(
  (el, cssKey, value) => (el.style[cssKey] = value)
);
export const setElementHtml = (el, html) => {
  if (_.isString(html)) {
    el.innerHTML = html;
  }
  return el;
};

export const setElementDisplay = (el, value) =>
  setElementStyle(el, 'display', value);
export const hideElement = el => setElementDisplay(el, 'none');
export const showElement = el => setElementDisplay(el, 'block');
export const elementWidth = _.getter('offsetWidth');
export const elementHeight = _.getter('offsetHeight');
export const elementBBox = el => el && el.getBoundingClientRect();

var link;
export function resolveUrl(relativeUrl) {
  link = createElement('a');
  link.src = relativeUrl;
  return link.src;
}

export function moveCaret(el, position) {
  el.selectionStart = el.selectionEnd = position;
  return el;
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

  createElement('form')
    |> (f => setElementAttribute(f, { action, target }))
    |> (f => setElementHtml(f, obj2formhtml(data)))
    |> (f => appendNode(f, documentElement))
    |> submitElement
    |> removeNode;
}

export function obj2formhtml(data, key) {
  if (_.isNonNullObject(data)) {
    var str = '';
    obj.loop(data, function(value, name) {
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
    var oldTimestamp = performance.now();

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

/* https://developer.mozilla.org/en/docs/Web/API/Element/matches */
var elementProto = _.prototypeOf(ElementConstructor);
var matchesSelector =
  elementProto.matches ||
  elementProto.matchesSelector ||
  elementProto.webkitMatchesSelector ||
  elementProto.mozMatchesSelector ||
  elementProto.msMatchesSelector ||
  elementProto.oMatchesSelector ||
  function(selector) {
    var queryMatches = querySelectorAll(selector);
    var i = queryMatches.length;
    while (--i >= 0 && queryMatches[i] !== this) {}
    return i >= 0;
  };

export function elementMatches(el, selector) {
  return matchesSelector.call(el, selector);
}

export function resolveElement(el) {
  if (_.isString(el)) {
    return querySelector(el);
  }
  return el;
}

export function addListener(event, callback, el, delegate, useCapture) {
  var attachedCallback = callback;
  if (_.isString(delegate)) {
    attachedCallback = function(e) {
      var target = e.target;
      while (!elementMatches(target, delegate) && target !== el) {
        target = elementParent(target);
      }
      if (target !== el) {
        e.delegateTarget = target;
        callback(e);
      }
    };
  } else {
    useCapture = delegate;
  }

  // cast to boolean
  useCapture = !!useCapture;
  el.addEventListener(event, attachedCallback, useCapture);
  return _ => el.removeEventListener(event, attachedCallback, useCapture);
}
