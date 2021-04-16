const createWalletTest = require('blackbox/create/wallet.js');

/**
 * popupIframe should not work in desktop mode
 */
 createWalletTest({
    popupIframe: true,
  });
  