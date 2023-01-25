import {
  fincNoCostEmiPlan,
  isNoCostAVailableForToken,
  isNoCostPlan,
} from 'emiV2/helper/label';
import {
  getProcessingFeeForEmi,
  handlePlanDescription,
  isCustomProcessingFeePresent,
  isProcessingFeeAvailableForPlan,
} from 'emiV2/helper/plans';
import { isNoCostAvailable } from 'emiV2/store';
import type { EmiPlan, EmiPlanObject, EmiPlans } from 'emiV2/types';

describe('Validate: getProcessingFeeForEmi', () => {
  let bank = 'RATN';
  test('Emi processing fee for certain banks should be 199', () => {
    expect(getProcessingFeeForEmi(bank)).toBe('199');

    bank = 'HDFC';

    expect(getProcessingFeeForEmi(bank)).toBe('199');

    bank = 'SBIN';
    expect(getProcessingFeeForEmi(bank)).toBe('99');

    bank = 'SBIN';
    expect(getProcessingFeeForEmi(bank, 3)).not.toBe('199');

    bank = 'SBIN';
    expect(getProcessingFeeForEmi(bank, 18)).not.toBe('99');

    bank = 'SBIN';
    expect(getProcessingFeeForEmi(bank, 24)).not.toBe('99');

    bank = 'SBIN';
    expect(getProcessingFeeForEmi(bank, 24)).toBe('199');
  });
});

describe('Validate: isNoCostPlan', () => {
  let plan: EmiPlan = {
    duration: 3,
    interest: 10,
    subvention: 'merchant',
    min_amount: 10000,
  };

  expect(isNoCostPlan(plan)).toBe(true);

  plan.subvention = 'customer';

  expect(isNoCostPlan(plan)).toBe(false);
});

describe('Validate: isNoCostAvailable', () => {
  const plans: EmiPlans = [
    {
      duration: 3,
      interest: 10,
      subvention: 'merchant',
      min_amount: 10000,
    },
    {
      duration: 3,
      interest: 10,
      subvention: 'customer',
      min_amount: 10000,
    },
  ];

  expect(isNoCostAvailable(plans)).toBe(true);
  plans[0].subvention = 'customer';
  expect(isNoCostAvailable(plans)).toBe(false);
});

describe('Validate: isNoCostAVailableForToken', () => {
  const plans: EmiPlans = [
    {
      duration: 3,
      interest: 10,
      subvention: 'merchant',
      min_amount: 10000,
    },
    {
      duration: 3,
      interest: 10,
      subvention: 'customer',
      min_amount: 10000,
    },
  ];

  expect(isNoCostAVailableForToken(plans)).toBe(true);
  plans[0].subvention = 'customer';
  expect(isNoCostAVailableForToken(plans)).toBe(false);
});

describe('Validate: fincNoCostEmiPlan', () => {
  const planObject: EmiPlanObject = {
    '3': {
      duration: 3,
      interest: 0,
      subvention: 'merchant',
      offer_id: 'offeer_1234acdf',
      min_amount: 100000,
    },
    '6': {
      duration: 6,
      interest: 10,
      subvention: 'customer',
      offer_id: 'offeer_1234acdf',
      min_amount: 100000,
    },
  };

  expect(fincNoCostEmiPlan(planObject)).toBe(true);

  planObject['3'].subvention = 'customer';
  expect(fincNoCostEmiPlan(planObject)).toBe(false);
});

describe('Validate: isCustomProcessingFeePresent', () => {
  expect(isCustomProcessingFeePresent('SBIN', 18)).toBe(true);
  expect(isCustomProcessingFeePresent('SBIN', 12)).toBe(false);
  expect(isCustomProcessingFeePresent('HDFC', 12)).toBe(false);
});

describe('Validate: isProcessingFeeAvailableForPlan', () => {
  expect(isProcessingFeeAvailableForPlan('SBIN', 3)).toBe(false);
  expect(isProcessingFeeAvailableForPlan('SBIN', 6)).toBe(true);
  expect(isProcessingFeeAvailableForPlan('HDFC', 6)).toBe(false);
});

describe('Validate: handlePlanDescription', () => {
  let bank = 'SBIN';
  let duration = 3;
  const amount = '1000000';
  const amountPerMonth = '10000';
  let descriptionText = handlePlanDescription(
    bank,
    amount,
    amountPerMonth,
    'en',
    duration
  );
  expect(descriptionText.length).toBe(1);

  duration = 6;
  descriptionText = handlePlanDescription(
    bank,
    amount,
    amountPerMonth,
    'en',
    duration
  );
  expect(descriptionText.length).toBe(2);

  bank = 'HDFC';
  descriptionText = handlePlanDescription(
    bank,
    amount,
    amountPerMonth,
    'en',
    duration
  );
  expect(descriptionText.length).toBe(2);

  bank = 'YESB';
  descriptionText = handlePlanDescription(
    bank,
    amount,
    amountPerMonth,
    'en',
    duration
  );
  expect(descriptionText.length).toBe(2);

  bank = 'CITI';
  descriptionText = handlePlanDescription(
    bank,
    amount,
    amountPerMonth,
    'en',
    duration
  );
  expect(descriptionText.length).toBe(1);
});
