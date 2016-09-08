var getOptions;

function getOptions() {
  return {
    key: 'key',
    amount: 100
  }
}

describe('base_configure should', function() {

  describe('not throw if', function() {
    it('invalid option of different type', function() {
      var arg = getOptions();
      arg.currency = null;
      expect(base_configure).withArgs(arg).to.not.throw();
    })
  })

  describe('throw if', function() {
    it('no options', function() {
      expect(base_configure).to.throw();
    })

    describe('invalid options', function() {
      var arg;

      beforeEach(function() {
        arg = getOptions();
      })

      afterEach(function() {
        expect(base_configure).withArgs(arg).to.throw();
      })

      it('primitive', function() {
        arg = 2;
      })

      it('primitive string', function() {
        arg = 'hello';
      })

      it('NaN amount', function() {
        arg.amount = NaN;
      })

      it('amount < 100', function() {
        arg.amount = 99;
      })

      it('dot containing amount', function() {
        arg.amount = 100.5;
      })

      it('NaN string amount', function() {
        arg.amount = 'asdf';
      })

      it('notes having > 15 fields', function() {
        var i, note, results;
        arg.notes = {};
        results = [];
        for (note = i = 1; i <= 16; note = ++i) {
          results.push(arg.notes[note] = note);
        }
        results;
      })

      it('invalid currency', function() {
        arg.currency = 'USD';
      })
    })
  })

  describe('return options object based on overrides:', function() {
    var opts;

    beforeEach(function() {
      opts = getOptions();
    })
 
    it('basic options', function() {
      var optsObj;
      optsObj = base_configure(opts);
      expect(optsObj.get('key')).to.eql(opts.key);
      expect(optsObj.get('amount')).to.eql(opts.amount);
      expect(optsObj.get()).to.eql(opts);
      expect(optsObj.get()).to.not.be(opts);
    })

    it('redirect', function() {
      opts.redirect = true;
      expect(base_configure(opts).get('redirect')).to.be(true);
      opts.redirect = false;
      expect(base_configure(opts).get('redirect')).to.be(false);
    })
  })
})

describe('discreet', function() {
  describe('support check', function() {
    var stub;
    var origUa = window.ua;

    beforeEach(function() {
      stub = sinon.stub(window, 'alert');
    })

    afterEach(function() {
      window.ua = origUa;
      stub.restore();
    })

    it('shouldnt alert supported browser', function() {
      discreet.supported(true);
      expect(stub.callCount).to.be(0);
    })

    it('should alert unsupported browser', function() {
      window.ua = 'Opera Mini/';
      expect(discreet.supported(true)).to.be(false);
      expect(stub.callCount).to.be(1);
    })

    it('shouldnt alert unsupported browser if no showAlert flag', function() {
      window.ua = 'Opera Mini/';
      expect(discreet.supported()).to.be(false);
      expect(stub.callCount).to.be(0);
    })
  })

  describe('defaultError', function() {
    it('should provide minimal error object', function() {
      var errorObj;
      errorObj = discreet.error();
      expect(errorObj).to.only.have.key('error');
      expect(errorObj.error).to.only.have.key('description');
      expect(errorObj.error.description).to.be.a('string');
    })
  })

  describe('isBase64Image', function() {
    var image, result;

    afterEach(function() {
      expect(discreet.isBase64Image(image)).to.be(result);
    })

    it('should determine base64 png', function() {
      image = 'data:image/png;base64,R0lGOD';
      result = true;
    })

    it('should determine base64 jpg', function() {
      image = 'data:image/jpeg;base64,R0lGOD';
      result = true;
    })

    it('should determine base64 gif', function() {
      image = 'data:image/gif;base64,R0lGOD';
      result = true;
    })

    it('should determine image path', function() {
      image = 'http://image';
      result = false;
    })

    it('should determine relative path', function() {
      image = 'asdnk';
      result = false;
    })
  })

  describe('nextRequestRedirect', function() {
    var msgSpy, submitSpy;
    var request = {
      url: 'url',
      content: 'content',
      method: 'method'
    }

    beforeEach(function() {
      submitSpy = sinon.stub(window, 'submitForm');
      if (!('sendMessage' in Razorpay)) {
        Razorpay.sendMessage = jQuery.noop;
      }
      msgSpy = sinon.stub(Razorpay, 'sendMessage');
    })

    afterEach(function() {
      submitSpy.restore();
      msgSpy.restore();
    })

    it('should send redirection message if in iframe', function() {
      window.parent = null;
      discreet.redirect(request);
      expect(submitSpy.callCount).to.be(0);
      expect(msgSpy.callCount).to.be(1);
      expect(msgSpy.args[0][0]).to.eql({
        event: 'redirect',
        data: request
      });
      window.parent = window;
    });

    it('should submitForm if in parent', function() {
      discreet.redirect(request);
      expect(submitSpy.callCount).to.be(1);
      expect(msgSpy.callCount).to.be(0);
      expect(submitSpy.args[0]).to.eql([request.url, request.content, request.method]);
    })
  })
})

describe('makeUrl', function() {
  var origVal;

  before(function() {
    origVal = window.RazorpayConfig;
    window.RazorpayConfig = {
      api: 'foo/',
      frameApi: 'bar/',
      frame: 'baz',
      version: 'v1/',
      js: 'boogie'
    };
  })

  after(function() {
    window.RazorpayConfig = origVal;
  })

  it('should work when path not provided', function() {
    expect(makeUrl()).to.be('foo/v1/');
  })

  it('should work when path is provided', function() {
    expect(makeUrl('path/')).to.be('foo/v1/path/');
  })
})

describe('makeAuthUrl', function() {
  var stub;
  var session = {
    get: function() {
      return 'xyz';
    }
  }

  before(function() {
    stub = sinon.stub(window, 'makeUrl');
    stub.withArgs('abc/').returns('foo/abc/');
  })

  after(function() {
    stub.restore();
  })

  it('should be able to make auth url if key is passed', function() {
    expect(makeAuthUrl('xyz', 'abc/')).to.be('foo/abc/?key_id=xyz');
  })

  it('should be able to make auth url if session object is passed', function() {
    expect(makeAuthUrl(session, 'abc/')).to.be('foo/abc/?key_id=xyz');
  })
})

describe('setNotes', function() {
  it('should strip invalid types', function() {
    var opts = Options({
      notes: {
        foo: 'bar',
        baz: 2,
        hello: true,
        world: {},
        abc: jQuery.noop
      }
    })
    setNotes(opts);
    expect(opts.get('notes')).to.eql({
      foo: 'bar',
      baz: 2,
      hello: true
    })
  })
})

describe('new Razorpay', function() {
  it('should call base_configure', function() {
    var options, rzp, spy;
    spy = sinon.spy(window, 'base_configure');
    options = getOptions();
    rzp = Razorpay(options);
    expect(spy.callCount).to.be(1);
    expect(spy.calledWith(options)).to.be(true);
    expect(spy.returnValues[0]).to.be.an(Options);
    spy.restore();
  })
  it('should throw if invalid options', function() {
    var options = {};
    var stub = sinon.stub(window, 'base_configure').throws();
    expect(Razorpay).withArgs(options).to["throw"]();
    stub.restore();
  })
})

describe('Razorpay.configure', function() {
  it('should set Razorpay.defaults', function() {
    var options, origDefaults;
    origDefaults = Razorpay.defaults;
    options = getOptions();
    Razorpay.configure(options);
    expect(Razorpay.defaults.key).to.be(options.key);
    Razorpay.defaults = origDefaults;
  })
})
