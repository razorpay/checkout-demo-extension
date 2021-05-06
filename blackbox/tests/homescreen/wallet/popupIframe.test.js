const createWalletTest = require('blackbox/create/wallet.js');

/**
 * popupIframe introduce for Paytm Mobile Web Only for now
 */
createWalletTest({
  popupIframe: true,
  emulate: 'Nexus 10',
});
