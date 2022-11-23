import * as Doc from '../doc';
import * as _El from '../DOM';

const isTrue = (param: any) => expect(param).toBeTruthy();
const isFalse = (param: any) => expect(param).toBeFalsy();
const deep = (param: any, param2: any) => expect(param).toMatchObject(param2);

describe('Doc', () => {
  describe('isEvent', () => {
    it('detects Event properly', () => {
      const event = new Event('MyEvent');
      const is = Doc.isEvent(event);
      isTrue(is);
    });

    it('detects CustomEvent properly', () => {
      const event = new CustomEvent('MyCustomEvent');
      const is = Doc.isEvent(event);
      isTrue(is);
    });

    it('detects that Array is not an Event', () => {
      const array: any[] = new Array();
      const is = Doc.isEvent(array as any);
      isFalse(is);
    });
  });

  describe('resolveElement', () => {
    const div = _El.create('div');
    div.setAttribute('class', 'red');
    document.body.appendChild(div);

    it('Resolve an element from string', function () {
      const el = Doc.resolveElement('div');
      isTrue(el === div);
    });

    it('Resolve an element from element', function () {
      const el = Doc.resolveElement(div);
      isTrue(el === div);
    });
  });

  describe('form2obj', () => {
    const input = _El.create('input');
    const form = _El.create('form') as HTMLFormElement;
    it('Check if it converts form to object', function () {
      input.setAttribute('name', 'test');
      input.setAttribute('value', 'test-value');
      form.appendChild(input);
      const obj = Doc.form2obj(form);
      deep(obj, { test: 'test-value' });
    });
  });

  describe('preventEvent', () => {
    it('Check if it prevents default event from firing', function (done) {
      const anchor = _El.create('a');
      anchor.setAttribute('href', '#link');
      anchor.addEventListener('click', (e) => {
        Doc.preventEvent(e);
        isTrue(e.defaultPrevented);
        done();
      });
      anchor.click();
    });
  });

  describe('loadCSS', () => {
    it('loads checkout.css', () => {
      let url = 'https://checkout.razorpay.com/v1/css/checkout.css';
      const obj = _El.create('link') as HTMLLinkElement;
      jest.spyOn(_El, 'create').mockReturnValueOnce(obj);
      const appendChild = jest.spyOn(document.head, 'appendChild');
      Doc.loadCSS(url);
      expect(obj.href).toBe(url);
      expect(obj.rel).toBe('stylesheet');
      expect(appendChild).toBeCalled();
    }, 5000);
  });

  describe('loadJS', () => {
    it('loads checkout.js', () => {
      let url = 'https://checkout.razorpay.com/v1/checkout.js';
      const scriptObj = _El.create('script') as HTMLScriptElement;
      jest.spyOn(_El, 'create').mockReturnValueOnce(scriptObj);
      const appendChild = jest.spyOn(document.head, 'appendChild');
      Doc.loadJS(url);
      expect(scriptObj.src).toBe(url);
      expect(appendChild).toBeCalled();
    }, 5000);
  });

  describe('resolveUrl', () => {
    it('resolveUrl checkout.js', () => {
      let url = '/v1/checkout.js';
      expect(Doc.resolveUrl(url)).toBe('http://localhost/v1/checkout.js');
    }, 5000);
  });
});
