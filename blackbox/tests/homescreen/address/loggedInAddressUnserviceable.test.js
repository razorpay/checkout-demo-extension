const createAddressTest = require('../../../create/one-click-checkout/address');
const addresses = require('../../../data/one-click-checkout/addresses.json');

createAddressTest({
  amount: 200 * 100,
  loggedIn: true,
  anon: false,
  /* default address serviceability */
  serviceable: true,
  addresses: [
    addresses[0],
    {
      id: 'ISXW2w9b7WcgMB',
      entity_id: 'IPmBz5KJ03rXr4',
      entity_type: 'customer',
      line1: 'Gandhi nagar',
      line2: 'MG Road',
      city: 'Bengaluru',
      zipcode: '560002',
      state: 'Karnataka',
      country: 'in',
      type: 'shipping_address',
      primary: true,
      deleted_at: null,
      created_at: 1638432514,
      updated_at: 1638432514,
      tag: '',
      landmark: 'test land',
      name: 'Razorpay',
      contact: '+919952398433',
    },
  ],
  manageAddress: true,
  selectUnserviceable: true,
});
