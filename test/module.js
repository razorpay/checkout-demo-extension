/**
 * Checkinf if all modules have been loaded properly
 */

describe("Available modules", function(){
  it("should include RazorpayLibs", function(){
    expect(RazorpayLibs).toBeDefined();
  });

  it("should include Rzp jQuery", function(){
    expect(RazorpayLibs.$).toBeDefined();
  });

  it("should include XDM", function(){
    expect(RazorpayLibs.XD).toBeDefined();
  });

  it("should include Handlebars", function(){
    expect(RazorpayLibs.Handlebars).toBeDefined();
  });

  it("should include Razorpay", function(){
    expect(Razorpay).toBeDefined();
  });

  it("should include Checkout", function(){
    expect(Checkout).toBeDefined();
  });
});
