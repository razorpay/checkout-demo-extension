import * as extend from '../extend';
import { extendParams } from '../__mocks__/customer-params';

describe('Module: personalization', () => {
  it('should return a copy of instruments sent in the params', () => {
    expect(extend.extendInstruments(extendParams)).toEqual(
      extendParams.instruments
    );
  });
});
