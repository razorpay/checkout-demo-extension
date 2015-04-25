/**
 * Checkinf if all modules have been loaded properly
 */

describe("Available modules", function(){
  it("should include Razorpay", function(){
    expect(Razorpay).toBeDefined();
  });

  it("should include Rzp jQuery", function(){
    expect(Razorpay.prototype.$).toBeDefined();
  });
});
