import * as _El from './DOM';

export const documentElement = document.documentElement;
export const body = document.body;
export const innerWidth = global.innerWidth;
export const innerHeight = global.innerHeight;
export const pageYOffset = global.pageYOffset;
export const scrollBy = window.scrollBy;
export const scrollTo = window.scrollTo;
export const requestAnimationFrame = window.requestAnimationFrame;
export const querySelector = document.querySelector.bind(document);
export const querySelectorAll = document.querySelectorAll.bind(document);
export const getElementById = document.getElementById.bind(document);
export const getComputedStyle = global.getComputedStyle.bind(global);
export const EventConstructor = window.Event;

let link;

/**
 * Says whether or not the passed argument is an Event
 * @param {*} x
 *
 * @returns {boolean}
 */
export const isEvent = (x: Event) => x instanceof EventConstructor;

/**
 * Resolves given string to an element.
 * @param {string|Element} el
 *
 * @returns {Element}
 */
export const resolveElement = (el: string | HTMLElement) =>
  typeof el === 'string' ? querySelector(el) : el;

/**
 * Resolve relative url to an absolute url.
 * @param {string} relativeUrl
 *
 * @returns {string}
 */
export function resolveUrl(relativeUrl: string) {
  link = _El.create('a') as HTMLAnchorElement;
  link.href = relativeUrl;
  return link.href;
}

/**
 * Redirect page to the target url.
 * @param {Object} data
 */
export function redirectTo(data: {
  target: string;
  url: string;
  content: any;
  method: string;
}) {
  if (!data.target && global !== global.parent) {
    return global.Razorpay.sendMessage({
      event: 'redirect',
      data,
    });
  }
  submitForm(data.url, data.content, data.method, data.target);
}

/**
 * Submit a form to a url using the given method
 * @param {string} action
 * @param {Object} data
 * @param {string} method
 * @param {string} target
 */
export function submitForm(
  action: string,
  data: any,
  method: string,
  target = ''
) {
  if (method && method.toLowerCase() === 'get') {
    action = _.appendParamsToUrl(action, data);
    if (target) {
      global.open(action, target);
    } else {
      global.location = action;
    }
  } else {
    const attr: { action: string; method: string; target?: string } = {
      action,
      method,
    };
    if (target) {
      attr.target = target;
    }
    const form = _El.create('form');
    _El.setAttributes(form, attr);
    _El.setContents(form, obj2formhtml(data));
    _El.appendTo(form, documentElement);
    _El.submit(form);
    _El.detach(form);
  }
}

/**
 * Convert JSON object to HTML input html
 * @param {Object} data
 * @param {string} key
 *
 * @returns {string}
 */
export function obj2formhtml(
  data: string | { [x: string]: any },
  key?: string
) {
  if (_.isNonNullObject(data)) {
    let str = '';
    _Obj.loop(data, function (value: any, name: string) {
      if (key) {
        name = key + '[' + name + ']';
      }
      str += obj2formhtml(value, name);
    });
    return str;
  }
  const input = _El.create('input') as HTMLInputElement;
  input.type = 'hidden';
  input.value = data as string;
  input.name = key as string;
  return input.outerHTML;
}

/**
 * Convert HTML form to JSON Object.
 * @param {Element} form
 *
 * @returns {Object}
 */
export function form2obj(form: HTMLFormElement) {
  const obj: { [x: string]: any } = {};
  form
    ?.querySelectorAll<HTMLInputElement>('[name]')
    .forEach((el: HTMLInputElement) => {
      obj[el.name] = el.value;
    });
  return obj;
}

/**
 * Prevents default event from firing
 * @param {Event} e
 */
export function preventEvent(e: Event) {
  if (isEvent(e)) {
    e.preventDefault();
    e.stopPropagation();
  }
  return false;
}

/**
 * Smoothly scroll to given point
 * @param {number} y
 */
export function smoothScrollTo(y: number) {
  smoothScrollBy(y - pageYOffset);
}

let scrollTimeout: ReturnType<typeof setTimeout>;
const pi = Math.PI;

/**
 * Smoothly scroll by given point
 * @param {number} y
 */
export function smoothScrollBy(y: number) {
  if (!global.requestAnimationFrame) {
    return scrollBy(0, y);
  }
  if (scrollTimeout) {
    clearTimeout(scrollTimeout);
  }
  scrollTimeout = setTimeout(function () {
    const y0 = pageYOffset;
    const target = Math.min(y0 + y, _El.offsetHeight(body) - innerHeight);
    y = target - y0;
    let scrollCount = 0;
    let oldTimestamp = global.performance.now();

    function step(newTimestamp: number) {
      scrollCount += (newTimestamp - oldTimestamp) / 300;
      if (scrollCount >= 1) {
        return scrollTo(0, target);
      }
      const sin = Math.sin((pi * scrollCount) / 2);
      scrollTo(0, y0 + Math.round(y * sin));
      oldTimestamp = newTimestamp;
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }, 100);
}
