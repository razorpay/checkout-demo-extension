req() {
  curl -sI $1
  curl -sIH "Accept-Encoding: br" $1
}

size() {
  printf `basename $1`
  req "$1" | grep "Content-Length" | awk '{print "process.stdout.write(\"\t\"+String(Math.round("$2/102.4")/10))"}' | node
  echo ""
}

size "https://checkout.razorpay.com/v1/razorpay.js"
size "https://checkout.razorpay.com/v1/checkout.js"
size "https://checkout.razorpay.com/v1/checkout-frame.js"
size "https://checkout.razorpay.com/v1/css/checkout.css"
