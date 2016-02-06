
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

function emiView(message){
  var opts = message.emiopts;
  opts.amount = message.options.amount;
  this.listeners = [];
  this.render(opts);
}

emiView.prototype = {
  render: function(opts) {
    this.unbind();
    $('#emi-wrap').html(templates.emi(opts));
    this.bind();
  },

  on: function(event, sel, listener){
    var $el = $(sel);
    this.listeners.push([
      $el,
      event,
      $el.on(event, listener)
    ])
  },

  bind: function(){
    this.on('mousedown', '#emi-select', selectEmiBank);
    this.on('click', '#view-emi-plans', function(){showOverlay($('#emi-wrap'))});
    this.on('click', '#emi-close', hideEmi);
  },

  unbind: function(){
    each(
      this.listeners,
      function(i, listenerMap){
        listenerMap[0].off(listenerMap[1], listenerMap[2]);
      }
    )
    this.listeners = [];
  }
}