import { submitForm } from 'common/form';
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
  submitForm({
    url: data.url,
    params: data.content,
    method: data.method,
    target: data.target,
  });
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

/**
 * Insert css from given url into head tag
 * @param {string} url
 */
export function loadCSS(url: string) {
  return new Promise((resolve, reject) => {
    const link = _El.create('link') as HTMLLinkElement;
    link.rel = 'stylesheet';
    link.href = url;
    link.onload = resolve;
    link.onerror = reject;
    document.head.appendChild(link);
  });
}

/**
 * Insert js from given url into head tag
 * @param {string} url
 */
export function loadJS(url: string) {
  return new Promise((resolve, reject) => {
    const script = _El.create('script') as HTMLScriptElement;
    script.src = url;
    script.onerror = reject;
    script.onload = resolve;
    document.head.appendChild(script);
  });
}
