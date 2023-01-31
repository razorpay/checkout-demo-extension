# Razorpay Checkout Demo Extension

Override pay button on merchant's webpage to open Razorpay checkout.

![Extension on website](https://github.com/razorpay/checkout-demo-extension/blob/master/assets/images/cover-ss.png?raw=true)

### Installation

1. Clone this repo locally or download it as a zip file.
2. Open the Extension Management page by navigating to [`chrome://extensions`](chrome://extensions).
3. The Extension Management page can also be opened by clicking on the Chrome menu, hovering over More Tools then selecting Extensions.
4. Enable Developer Mode by clicking the toggle switch next to Developer mode.
5. Click the Load Unpacked button and select the downloaded/cloned extension directory (`checkout-demo-extension`).
6. After you load it, you should get the below extension in your chrome extension list.
   ![Extension in chrome://extensions](https://github.com/razorpay/checkout-demo-extension/blob/master/assets/images/chrome-extensions-ss.png?raw=true)

### How does it work ?

1. Navigate to any choice of your webpage where the checkout demo has to be injected. Let’s take the example of [this Lazada merchant](https://www.lazada.com.my/products/samsung-galaxy-j7-pro-3gb-ram-32gb-rom-i199455978-s245417314.html).
2. Open the extension, you should get a layout like below.
   ![Extension layout](https://github.com/razorpay/checkout-demo-extension/blob/master/assets/images/layout-ss.png?raw=true)

3. Now you need to identify the element/button on the merchant’s webpage which should open Razorpay checkout on the click.
4. Once you’ve identified the element, click on the “Pick from page” button in the extension. This will close the extension and will give you the control to select the element/button which you have decided in the previous step.
5. Upon clicking on the desired element, you will get a toast message showing "Checkout linked !".
6. Click on your desired button/element again, it should now open the Razorpay checkout ! 🚀.

### Advanced

- To add more personalized experience, you can modify checkout options in the extension. For eg, checkout can blend with the website theme color, have the website name, have the merchant logo, etc.
  To do this, open the extension and select on "Modify Checkout options". Change the values in the fields as per your preference.
  Refer the below screenshot for an example of the Lazada merchant.

![Extension layout](https://github.com/razorpay/checkout-demo-extension/blob/master/assets/images/lazada-ss.png?raw=true)

For more details on checkout options, check the official documentation [here](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/build-integration/#checkout-options).
