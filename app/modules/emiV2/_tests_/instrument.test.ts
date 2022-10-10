import {
  errorTypes,
  isEmiProviderInValid,
  isInstrumentValidForEMI,
  validateCoBrandingPartner,
} from 'emiV2/helper/card';
import type { Card, CardFeatures, EMIPayload } from 'emiV2/types';

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

    await expect(isInstrumentValidForEMI(features, emiPayload)).toBe('');
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

    await expect(isInstrumentValidForEMI(features, emiPayload)).toBe(
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

    await expect(isInstrumentValidForEMI(features, emiPayload)).toBe(
      errorTypes.EMI_NOT_SUPPORTED
    );
  });
  test('Validate card against co-branding partner', () => {
    let features: CardFeatures = {
      issuer: 'BARB',
      flows: {
        emi: true,
      },
      type: 'credit',
    };

    let emiPayload = {
      tab: 'credit',
      bank: {
        code: 'onecard',
        name: 'onecard',
      },
    };

    expect(isInstrumentValidForEMI(features, emiPayload)).toBe(
      errorTypes.BANK_INVALID
    );

    features.cobranding_partner = 'onecard';

    expect(isInstrumentValidForEMI(features, emiPayload)).toBe('');
  });
});

describe('Validate: validateCoBrandingPartner', () => {
  let features: CardFeatures = {
    issuer: 'BARB',
    flows: {
      emi: true,
    },
    type: 'credit',
  };

  let selectedEmiProvider: string = 'onecard';

  expect(validateCoBrandingPartner(features, selectedEmiProvider)).toBeFalsy();

  features.cobranding_partner = 'onecard';
  expect(validateCoBrandingPartner(features, selectedEmiProvider)).toBeTruthy();

  selectedEmiProvider = 'HDFC';
  expect(validateCoBrandingPartner(features, selectedEmiProvider)).toBeFalsy();
});

describe('Validate: isBankValidForEmi', () => {
  test('Selected card is valid for EMI', () => {
    let features: CardFeatures = {
      issuer: 'HDFC',
      type: 'credit',
      flows: {
        emi: true,
      },
    };
    let emiPayload: EMIPayload = {
      tab: 'credit',
      bank: {
        code: 'HDFC',
        name: 'HDFC Bank',
      },
    };
    expect(isEmiProviderInValid(features, emiPayload)).toBe(false);

    features.cobranding_partner = 'onecard';
    emiPayload.bank.code = 'onecard';

    expect(isEmiProviderInValid(features, emiPayload)).toBe(false);

    features.cobranding_partner = null;
    emiPayload.bank.code = 'onecard';
    expect(isEmiProviderInValid(features, emiPayload)).toBe(true);

    features.cobranding_partner = 'onecard';
    emiPayload.bank.code = 'HDFC';
    expect(isEmiProviderInValid(features, emiPayload)).toBe(true);
  });
});
