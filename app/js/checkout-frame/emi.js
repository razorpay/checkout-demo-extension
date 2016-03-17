
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

function emiView(session){
  var opts = session.emi_options;
  opts.amount = session.get('amount');
  this.opts = opts;
  this.listeners = [];
  this.render();
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