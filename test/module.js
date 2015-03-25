/**
 * Checkinf if all modules have been loaded properly
 */

describe("Available modules", function(){
  it("should include Razorpay", function(){
    expect(Razorpay).toBeDefined();
  });

  it("should include Rzp jQuery", function(){
    expect(Razorpay.$).toBeDefined();
  });

  it("should include dot", function(){
    expect(Razorpay.doT).toBeDefined();
  });

  it("should include modal", function(){
    expect(Razorpay.Modal).toBeDefined();
  });

  it("should include jquery.payment", function(){
    expect(Razorpay.$.fn.payment).toBeDefined();
  });
});
