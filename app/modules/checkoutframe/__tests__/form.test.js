import * as form from 'checkoutframe/form';

import { querySelector } from 'utils/doc';

jest.mock('utils/doc', () => ({
  querySelector: jest.fn(() => ({
    querySelector: jest.fn(() => ({ focus: jest.fn() })),
  })),
}));

describe('Module: checkoutframe/form', () => {
  it('should return undefined when the form input is not valid', () => {
    expect(form.validateForm()).toBeUndefined();
  });
  it('should return true when form input is valid', () => {
    let newDiv = document.createElement('div');
    querySelector.mockReturnValue(newDiv);
    expect(form.validateForm()).toEqual(true);
  });

  it('should add shake class to the component', () => {
    let newDiv = document.createElement('div');
    newDiv.setAttribute('id', 'modal-inner');
    document.body.appendChild(newDiv);
    querySelector.mockReturnValue(newDiv);
    form.shake();
    expect(newDiv.classList.contains('shake')).toBe(true);
  });
});
