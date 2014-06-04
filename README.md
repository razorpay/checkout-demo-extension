Setup instructions

1. Copy layout.html to index.html
2. Replace value in line 9 of index.html with provided merchant key
3. Optionally replace api.razorpay.com with your local rzp.api.dev URL in case you want to test it locally (`checkout.js:61`).
4. Copy config.sample.php to config.php and replace the variables.
5. Open index.html in your browser over http(s), not file://
6. You should get a successfull capture response