import * as utils from '../utils';
import { parse } from 'utils/object';

const PREFERRED_INSTRUMENTS = 'rzp_preffered_instruments';
describe('Module: personalization', () => {
  it('should return FNV-1a hash of phone number in an integer', () => {
    expect(utils.hashFnv32a('+918708857806')).toEqual('36c8e906');
  });
  it('should return FNV-1a hash of phone number in an integer', () => {
    expect(utils.hashFnv32a('+918708757906', false)).toEqual(3411114562);
  });
  it('should set the sent data in the storage', () => {
    const data = {
      b4j3n434: [
        {
          frequency: 2,
          id: 'KjmhRqjQ3akgU7',
          success: false,
          timestamp: 1669273040119,
          method: 'card',
          token_id: 'token_KGw40fGGndeddR',
          type: 'prepaid',
          issuer: 'STCB',
          network: 'Visa',
        },
      ],
    };
    utils.set(data);
    expect(
      parse((global as any).localStorage.getItem(PREFERRED_INSTRUMENTS))
    ).toEqual(data);
  });
});
