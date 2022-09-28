local css = ""
local js = "https://checkout.razorpay.com/v1/sdk-loader.js"

if (ngx.var.arg_build) then
  local base = "https://checkout-static.razorpay.com/build/" .. ngx.var.arg_build:gsub('%W','')
  js = base .. "/checkout-frame.js"
  css = '<link rel="stylesheet" href="' .. base .. '/css/checkout.css">'
end

response = [[
<!DOCTYPE html>
<html dir="ltr">
<head>
  <meta charset="utf-8">
  <title>Razorpay Checkout</title>
  <link rel="icon" href="data:;base64,=">
  <meta name="viewport" content="user-scalable=no,width=device-width,initial-scale=1,maximum-scale=1">
]] .. css .. [[</head>
<body><div style="font-family:'lato';visibility:hidden;position:absolute;">.</div></body>
<style>
@font-face {
  font-family:'lato';font-weight:normal;font-style:normal;
  src: url("https://cdn.razorpay.com/lato.woff2") format('woff2'), url("https://cdn.razorpay.com/lato.woff") format('woff');
}
</style>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" type="text/css" />
<script>
  function _retry() {
    var script = document.createElement('script');
    script.src = ']] .. js .. [[';
    document.body.appendChild(script);
  }
  if (!window.Intl) {
    try {
      document.write('\x3Cscript src="https://cdn.polyfill.io/v2/polyfill.min.js?features=Intl.~locale.en|always">\x3C/script>');
    } catch(e) {}
  }
</script>
<script src="]] .. js .. [[" crossorigin onerror="_retry()"></script>
</html>]]

ngx.say(response)
