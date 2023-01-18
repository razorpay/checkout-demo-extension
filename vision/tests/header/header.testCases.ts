import CheckoutTestVariantGenerator from '../../helpers/CheckoutTestVariantGenerator';

/**
 * Header test cases
 * with timeout + permutation of fee,offers, forced offers
 * + Fee Variant
 */
const variant = [
  'fee',
  'offers',
  'forcedOffer',
  'tpv',
  'partialPayment',
] as const;
const baseTestCases = [
  {
    title: 'Basic Tests',
  },
  {
    title: 'Tests with timeout',
    options: { timeout: 1000 },
  },
];

const testData = CheckoutTestVariantGenerator.setTestFeatures(variant)
  .setExemptedTestCombinations([
    ['fee', 'offers'],
    ['fee', 'forcedOffer'],
    ['tpv', 'partialPayment'],
    ['offers', 'partialPayment'],
    ['forcedOffer', 'partialPayment'],
  ])
  .get(baseTestCases) as Array<
  { title: string; options: Record<string, any> } & {
    [variantKey in typeof variant[number]]?: boolean;
  }
>;

export default testData;
