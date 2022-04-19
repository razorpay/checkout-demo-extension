import cssVars from 'css-vars-ponyfill';

export function setRootCSSVariable(obj: { [x: string]: any }) {
  let values: string[] = [];
  for (let key in obj) {
    values.push(`--${key}:${obj[key]}`);
  }
  document.documentElement.style.cssText = values.join(';');
  // FOR IE polyfill
  cssVars({
    include: 'link',
    variables: obj,
  });
}
