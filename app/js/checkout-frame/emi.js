
function emiView(message){
  var opts = this.opts = message.emiopts;
  opts.amount = message.options.amount;
  this.listeners = [];
  // if(opts.key === 'rzp_test_s9cT6UE4Mit7zL'){
    this.render();
  // }

  if( opts.key === 'rzp_live_kfAFSfgtztVo28' || opts.key === 'rzp_test_s9cT6UE4Mit7zL' ) {
    $('#powered-link').css('visibility', 'hidden').css('pointerEvents', 'none');
  }
}

emiView.prototype = {
  render: function() {
    this.unbind();
    $('#emi-container').html(templates.emi(this.opts));
    $('#emi-close').on('click', toggleErrorMessage);
    this.bind();
    this.oncardnumber();
  },

  on: function($el, event, listener){
    this.listeners.push([
      $el,
      event,
      $el.on(event, listener)
    ])
  },

  oncardnumber: function(){
    $('#elem-emi')[gel('card_number').value.length > 6 ? 'addClass' : 'removeClass']('check');
  },

  onchange: function(e){
    this.opts.selected = e.target.value;
    this.render();
  },

  onemicheck: function(){
    $('#emi-container')
      .css('display', 'block')
      .reflow()
      .addClass('shown');

    $('#fd').addClass('shown');
    $('#fd-in').hide();
  },

  bind: function(){
    this.on(
      $('#emi_select'),
      'change',
      bind(this.onchange, this)
    );
    this.on(
      $('#view-emi-plans'),
      'click',
      this.onemicheck
    )

    this.on(
      $('#card_number'),
      'input keypress',
      this.oncardnumber
    )

    each(
      $$('#emi-container > .emi-option'),
      function(i, el){
        this.on(
          $(el),
          'click', function(){
            $('#emi-container > .emi-active').removeClass('emi-active');
            $(this).addClass('emi-active').find('input')[0].checked = true;
            toggleErrorMessage();
          }
        )
      },
      this
    )
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