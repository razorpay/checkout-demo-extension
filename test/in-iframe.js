var discreet = Razorpay.prototype.discreet;

var options = {
  'key': 'key_id',
  'amount': '40000'
}

describe("message listener should", function(){
  it("show checkout form on receiving init options", function(){
    spyOn(window, 'Razorpay').and.callFake(function(argOptions){
      expect(argOptions).toBe(options);
    })
    // window.postMessage({options: options}, '*');
  })
})