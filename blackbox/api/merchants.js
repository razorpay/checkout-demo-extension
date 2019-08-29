const methods = require('./methods');
const gpay_omnichannel_prefs = require('./preferences/gpay_omnichannel');

module.exports = [
  {
    key_id: 'm1key',
    preferences: {
      global: true,
      options: {
        theme: {
          color: '#DD3547',
        },
        remember_customer: true,
      },
      methods: {
        upi: true,
        card: true,
        ...methods,
      },
    },
  },

  // Google Pay Omnichannel
  {
    key_id: 'm_gpay_omnichannel_disabled',
    preferences: gpay_omnichannel_prefs.withoutFeature,
  },
  {
    key_id: 'm_gpay_omnichannel_enabled',
    preferences: gpay_omnichannel_prefs.withFeature,
  },
];
