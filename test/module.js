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

  it("should include XDM", function(){
    expect(Razorpay.XD).toBeDefined();
  });

  it("should include dot", function(){
    expect(Razorpay.doT).toBeDefined();
  });

  it("should include modal", function(){
    expect(Razorpay.modal).toBeDefined();
  });

  it("should include jquery.payment", function(){
    expect(Razorpay.$.fn.payment).toBeDefined();
  });
});
