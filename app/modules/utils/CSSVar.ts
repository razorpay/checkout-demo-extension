class CSSVar {
  cssVars: Map<string, string>;
  constructor() {
    this.cssVars = new Map();
  }

  refresh() {
    let values: string[] = [];
    this.cssVars.forEach(function (value, key) {
      values.push(`--${key}:${value}`);
    });
    document.documentElement.style.cssText = values.join(';');
  }
  set(name: string, value: string) {
    this.cssVars.set(name, value);
    this.refresh();
  }

  del(name: string) {
    this.cssVars.delete(name);
    this.refresh();
  }
}

const CSSVariable = new CSSVar();
export default CSSVariable;
