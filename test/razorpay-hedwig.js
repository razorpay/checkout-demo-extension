describe("on popup close,", function(){
  var request = {
    error: jQuery.noop,
    payment_id: 'qwer',
    options: {
      'key': 'key_id',
      'amount': '40000',
      'name': 'Merchant Name',
      'hostname': 'api.razorpay.dev'
    }
  };

  var spy;

  beforeEach(function(){
    spy = jasmine.createSpy();
  })

  afterEach(function(){
    getPopupClose(request)();
    expect(spy).toHaveBeenCalled();
  })

  it("xdm listener should be removed", function(){
    spyOn($, 'removeMessageListener').and.callFake(spy);
  })

  it("call back specified error handler", function(){
    spyOn(request, 'error').and.callFake(function(data){
      expect('error' in data);
      spy();
    });
  })

  it("xdm listener should be removed", function(){
    spyOn($, 'ajax').and.callFake(function(ajaxOptions){
      expect(ajaxOptions.data.key_id).toBe(request.options.key)
      spy();
    });
  })
})