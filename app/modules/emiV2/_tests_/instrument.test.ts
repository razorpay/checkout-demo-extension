import {
  errorTypes,
  isInstrumentValidForEMI,
} from 'configurability/validate/emi';

describe('Validate: isInstrumentValidForEMI', () => {
  test('Selected Card is eligible for EMI', async () => {
    let features = {
      issuer: 'HDFC',
      type: 'credit',
      flows: {
        emi: true,
      },
    };

    let emiPayload = {
      tab: 'credit',
      bank: {
        code: 'HDFC',
        name: 'HDFC',
      },
    };

    await expect(isInstrumentValidForEMI(features, emiPayload)).resolves.toBe(
      ''
    );
  });
  test('Card enetered does not belong to the selected bank', async () => {
    let features = {
      issuer: 'ICIC',
      type: 'credit',
      flows: {
        emi: true,
      },
    };

    let emiPayload = {
      tab: 'credit',
      bank: {
        code: 'HDFC',
        name: 'HDFC',
      },
    };

    await expect(isInstrumentValidForEMI(features, emiPayload)).resolves.toBe(
      errorTypes.BANK_INVALID
    );
  });
  test('Card enetered does not have emi enabled', async () => {
    let features = {
      issuer: 'HDFC',
      type: 'credit',
      flows: {
        emi: false,
      },
    };

    let emiPayload = {
      tab: 'credit',
      bank: {
        code: 'HDFC',
        name: 'HDFC',
      },
    };

    await expect(isInstrumentValidForEMI(features, emiPayload)).resolves.toBe(
      errorTypes.EMI_NOT_SUPPORTED
    );
  });
});
