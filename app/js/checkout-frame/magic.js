function magicView(session) {
  this.session = session;
  this.opts = {
    session: session
  };
  this.render();
  this.screenMap = {
    'magic-choice': 'select_choice',
    'magic-otp': 'submit_otp'
  };
}

magicView.prototype = {
  render: function() {
    this.unbind();
    gel('magic-wrapper').innerHTML = templates.magic(this.opts);
    this.bind();
  },

  onchange: function(e) {
    this.opts.selected = e.target.value;
    this.render();
  },

  on: function(event, sel, listener) {
    var $el = $(sel);
    this.listeners.push($el.on(event, listener));
  },

  bind: function() {},

  unbind: function() {
    invokeEach(this.listeners);
    this.listeners = [];
  },

  openPaymentPage: function() {
    CheckoutBridge.openPopup();
  },

  showOtpView: function(e) {
    this.session.setScreen('magic-otp');
    hideOverlayMessage();
  },

  showChoiceView: function(e) {
    this.session.setScreen('magic-choice');
    hideOverlayMessage();
  },

  submit: function(screen, data) {
    var relayData = {
      action: this.screenMap[screen],
      data: data
    };

    if (CheckoutBridge && CheckoutBridge.relay) {
      CheckoutBridge.relay(relayData);
    }
  }
};
