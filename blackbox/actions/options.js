const { randomId, randomRange } = require('../util');

module.exports = {
  makeOptions(overrides) {
    return {
      key: 'rzp_live_' + randomId(),
      amount: 50 * randomRange(2, 100),
      personalization: false,
    };
  },

  computed(options, preferences) {
    const isContactOptional =
      (preferences.optional && preferences.optional.includes('contact')) ||
      false;

    const isEmailOptional =
      (preferences.optional && preferences.optional.includes('email')) || false;

    const isContactEmailOptional = isContactOptional && isEmailOptional;
    return {
      isContactOptional,
      isEmailOptional,
      isContactEmailOptional,

      prefilledContact:
        (!isContactEmailOptional &&
          (preferences.customer && preferences.customer.contact)) ||
        (options.prefill && options.prefill.contact) ||
        '',

      prefilledEmail:
        (!isContactEmailOptional &&
          (preferences.customer && preferences.customer.email)) ||
        (options.prefill && options.prefill.email) ||
        '',
    };
  },
};
