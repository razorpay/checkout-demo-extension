
function selectEmiBank(e){
  var $target = $(e.target);
  if($target.hasClass('option')){
    var duration = $target.attr('value');
    var parent = $('#emi-check-label').toggleClass('checked', duration);
    $(parent.find('.active')[0]).removeClass('active');
    $target.addClass('active');
    invoke('blur', parent, null, 100);
  }
}

function emiView(session) {
  var opts = session.emi_options;
  var amount = opts.amount = session.get('amount');
  if (amount >= 5000*100) {
    opts.banks.AMEX = {
      patt: /37(693|9397|98(6[1-3,7-9]|7[0-2,6-8]))/,
      name: 'American Express',
      plans: {
        3: 15,
        6: 15,
        9: 15,
        12: 15
      }
    }
    var $help = $('#elem-emi .help');
    $help.html($help.html().replace(' &amp; Axis Bank', ', Axis & AMEX'));
  } else {
    delete opts.banks.AMEX;
  }
  this.opts = opts;
  this.listeners = [];
  this.render();
}


function hideEmiDropdown () {
  if ($('#body').hasClass('emi-focus')) {
    $('#body').removeClass('emi-focus');
    $('#emi-check-label').removeClass('focus');
  }
}

function showEmiDropdown () {
  $('#body').addClass('emi-focus');
  $('#emi-check-label').addClass('focus');
}

emiView.prototype = {
  render: function() {
    this.unbind();
    $('#emi-wrap').html(templates.emi(this.opts));
    this.bind();
  },

  onchange: function(e){
    this.opts.selected = e.target.value;
    this.render();
  },

  on: function(event, sel, listener){
    var $el = $(sel);
    this.listeners.push($el.on(event, listener));
  },

  bind: function(){
    this.on('click', '#emi-check-label', function(e) {
      showEmiDropdown();
      return e.stopPropagation();
    }, true)
    this.on('click', '#container', function(e) {
      if(e.target.id !== 'emi-check-label') {
        hideEmiDropdown();
      }
    }, true)
    this.on('click', '#emi-select', function(e){
      hideEmiDropdown();
      return e.stopPropagation();
    });
    this.on('mousedown', '#emi-select', selectEmiBank);
    this.on('click', '#view-emi-plans', function(){showOverlay($('#emi-wrap'))});
    this.on('click', '#emi-close', hideEmi);
    this.on('change', '#emi-bank-select', bind(this.onchange, this));
  },

  unbind: function(){
    invokeEach(this.listeners);
    this.listeners = [];
  }
}