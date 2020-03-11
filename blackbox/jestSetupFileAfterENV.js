beforeAll(() => {
  jest.retryTimes(3);
  expect.extend({
    async selectorToBeAbsent(selector, context) {
      const el = await context.page.$(selector);
      expect(el).toBe(null);
      if (el === null) {
        return {
          message: () => `expected selector to be missing in the DOM!!`,
          pass: true,
        };
      } else {
        return {
          message: () => `expected selector to be missing in the DOM!!`,
          pass: false,
        };
      }
    },

    async toBeDivisibleByExternalValue(received, expected) {
      const externalValue = expected;
      const pass = received % externalValue == 0;
      if (pass) {
        return {
          message: () =>
            `expected ${received} not to be divisible by ${externalValue}`,
          pass: true,
        };
      } else {
        return {
          message: () =>
            `expected ${received} to be divisible by ${externalValue}`,
          pass: false,
        };
      }
    },
  });
});
