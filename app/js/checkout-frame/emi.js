function selectEmiBank(e) {
  var $target = $(e.target);
  if ($target.hasClass('option')) {
    var duration = $target.attr('value');
    var parent = $('#emi-check-label').toggleClass('checked', duration);
    $(parent.find('.active')[0]).removeClass('active');
    $target.addClass('active');
    invoke('blur', parent, null, 100);
  }
}

function emiView(session) {
  this.amount = session.get('amount');
  this.listeners = [];

  var availBanks = [];
  each(emi_banks, function(code, bank) {
    if (bank.plans) {
      availBanks.push(bank.short);
    }
  });
  var lastBank = availBanks.pop();
  availBanks = availBanks.length ? availBanks.join(', ') + ' & ' : '';
  $('#elem-emi .help').html(
    'EMI is available on ' +
      availBanks +
      lastBank +
      ' Credit Cards. Enter your credit card to avail.'
  );

  this.render();
}

function hideEmiDropdown() {
  if ($('#body').hasClass('emi-focus')) {
    $('#body').removeClass('emi-focus');
    $('#emi-check-label').removeClass('focus');
  }
}

function showEmiDropdown() {
  $('#body').addClass('emi-focus');
  $('#emi-check-label').addClass('focus');
}

emiView.prototype = {
  render: function() {
    this.unbind();
    $('#emi-wrap').html(templates.emi(this));
    this.bind();
  },

  onchange: function(e) {
    emi_banks.selected = e.target.value;
    this.render();
  },

  on: function(event, sel, listener) {
    var $el = $(sel);
    this.listeners.push($el.on(event, listener));
  },

  bind: function() {
    this.on(
      'click',
      '#emi-check-label',
      function(e) {
        showEmiDropdown();
        return e.stopPropagation();
      },
      true
    );
    this.on(
      'click',
      '#container',
      function(e) {
        if (e.target.id !== 'emi-check-label') {
          hideEmiDropdown();
        }
      },
      true
    );
    this.on('click', '#emi-select', function(e) {
      hideEmiDropdown();
      return e.stopPropagation();
    });
    this.on('mousedown', '#emi-select', selectEmiBank);
    this.on('click', '#view-emi-plans', function() {
      showOverlay($('#emi-wrap'));
    });
    this.on('click', '#emi-close', hideEmi);
    this.on('change', '#emi-bank-select', bind(this.onchange, this));
  },

  unbind: function() {
    invokeEach(this.listeners);
    this.listeners = [];
  }
};
