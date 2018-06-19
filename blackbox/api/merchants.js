const methods = require('./methods');

module.exports = [
  {
    key_id: 'm1key',
    preferences: {
      global: true,
      options: {
        theme: {
          color: '#DD3547'
        },
        remember_customer: true
      },
      methods: {
        upi: true,
        card: true,
        ...methods
      }
    }
  }
];
