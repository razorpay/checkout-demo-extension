import { getProcessingFeeForEmi } from 'emiV2/helper/plans';

describe('Validate: getProcessingFeeForEmi', () => {
  let bank = 'RATN';
  test('Emi processing fee for certain banks should be 199', () => {
    expect(getProcessingFeeForEmi(bank)).toBe('199');

    bank = 'HDFC';

    expect(getProcessingFeeForEmi(bank)).toBe('99');
  });
});
