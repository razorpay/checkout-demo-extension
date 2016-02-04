
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

function onemicheck(){
  $('#emi-container')
    .css('display', 'block')
    .reflow()
    .addClass('shown');

  $('#fd').addClass('shown');
  $('#fd-in').hide();
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
    $('#emi-container').html(templates.emi(opts));
    $('#emi-close').on('click', toggleErrorMessage);
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
    this.on('click', '#emi-select', selectEmiBank);
    this.on('click', '#view-emi-plans', onemicheck);
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