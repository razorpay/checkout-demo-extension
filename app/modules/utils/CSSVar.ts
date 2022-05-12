import cssVars from 'css-vars-ponyfill';

export function setRootCSSVariable(obj: { [x: string]: any }) {
  const values: string[] = [];
  for (const key in obj) {
    values.push(`--${key}:${String(obj[key])}`);
  }
  document.documentElement.style.cssText = values.join(';');
  // FOR IE polyfill
  cssVars({
    include: 'link',
    variables: obj,
  });
}
