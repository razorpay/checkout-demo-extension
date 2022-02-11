const EXTENDERS = {
  default: (instrument) => instrument,

  upi: (instrument, { customer }) => {
    const tokens = _Obj.getSafely(customer, 'tokens.items', []);
    const { vpa } = instrument;

    // We'll modify only if there's a VPA present.
    if (!vpa) {
      return instrument;
    }

    // Find a token with the same VPA as the handle
    const tokenWithSameVpa = _Arr.find(tokens, (token) => {
      if (token.method !== 'upi') {
        return false;
      }

      const tokenVpa = `${token.vpa.username}@${token.vpa.handle}`;

      return vpa === tokenVpa;
    });

    // If there exists a token, copy stuff
    if (tokenWithSameVpa) {
      instrument.token_id = tokenWithSameVpa.id;
    }

    return instrument;
  },
};

/**
 * Extends the instruments if required.
 * @param {Object} params
 *  @prop {Array} instruments
 *  @prop {Customer} customer
 *
 * @returns {Array} filtered instruments
 */
export function extendInstruments(params) {
  const { instruments } = params;

  return instruments.map((instrument) => {
    const { method } = instrument;

    const extender = EXTENDERS[method] || EXTENDERS.default;

    return extender(instrument, params);
  });
}
