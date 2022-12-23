/**
 * test case
 * Email Optional Visible
 * Email optional hidden
 * Email Mandatory
 * + Fee Variant + Success/Failure Payment
 */
const variant = ['fee'];
const baseTestCases = [
  {
    title: 'Email hidden Success Flow',
    prefs: [false, false],
    handler: { success: true },
  },
  {
    title: 'Email hidden Failure Flow with retry False',
    prefs: [false, false],
    handler: { success: false },
    options: { retry: false },
  },
  {
    title: 'Email hidden Failure Flow',
    prefs: [false, false],
    handler: { success: false },
  },
  {
    title: 'Email field shown as optional, skip email input,  Success Flow',
    prefs: [true, true],
    handler: { success: true },
    fillContact: {
      skipEmail: true,
    },
  },
  {
    title: 'Email field shown as optional, skip email input, Failure Flow',
    prefs: [true, true],
    handler: { success: false },
    fillContact: {
      skipEmail: true,
    },
  },
  {
    title: 'Email field shown as optional Success Flow',
    prefs: [true, true],
    handler: { success: true },
    fillContact: {
      skipEmail: false,
    },
  },
  {
    title: 'Email field shown as optional Failure Flow',
    prefs: [true, true],
    handler: { success: false },
    fillContact: {
      skipEmail: false,
    },
  },
  {
    title: 'Email field required Success Flow',
    prefs: [true, false],
    handler: { success: true },
  },
  {
    title: 'Email field required Failure Flow',
    prefs: [true, false],
    handler: { success: false },
  },
];
const testData = variant.reduce((acc, variantName) => {
  const result = [
    ...acc,
    ...baseTestCases.map((singleTest) => ({
      ...singleTest,
      title: `${variantName}, ${singleTest.title}`,
      [variantName]: true,
    })),
  ];
  return result;
}, [] as any);
const testCases = [...baseTestCases, ...testData];

export default testCases;
