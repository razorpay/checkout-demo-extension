module.exports = {
  delay: ms => new Promise(resolve => setTimeout(resolve, ms)),
  loadCheckoutFrame: async page => {
    await page.addScriptTag({
      url: 'file://' + __dirname + '/../app/dist/v1/checkout-frame.js'
    });
    await page.addStyleTag({
      url: 'file://' + __dirname + '/../app/dist/v1/css/checkout.css'
    });
  },
  loadRazorpayJs: async page => {
    await page.addScriptTag({
      url: 'file://' + __dirname + '/../app/dist/v1/razorpay.js'
    });
  }
};
