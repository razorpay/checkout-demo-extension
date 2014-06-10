/* global describe, it, Razorpay */
describe("A suite", function() {
  "use strict";
  it("Create the rzp instance", function() {
  	var rzp = new Razorpay();
    rzp.addButton();
  });
});