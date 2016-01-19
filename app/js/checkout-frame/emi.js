
function emiView(opts){
  this.listeners = [];
  if(opts.key === 'rzp_test_s9cT6UE4Mit7zL'){
    this.render(opts);
  }

  if( opts.key === 'rzp_live_kfAFSfgtztVo28' || opts.key === 'rzp_test_s9cT6UE4Mit7zL' ) {
    $('#powered-link').css('visibility', 'hidden').css('pointerEvents', 'none');
  }
}

emiView.prototype = {
  render: function(opts) {
    $('#emi-wrap').html(templates.emi());
    $('#emi-close').on('click', frontDrop);
    this.bind($('#elem-emi'));
    $('#methods-specific-fields').css('minHeight', '263px');
  },

  on: function($el, event, listener){
    this.listeners.push([
      $el,
      event,
      $el.on(event, listener)
    ])
  },

  bind: function(elem_emi){
    this.on(
      elem_emi.addClass('shown'),
      'mouseup',
      function(){
        var shouldCheck = $(this).hasClass('check');
        if(!gel('emi').checked || !shouldCheck){

          $('#emi-container')
            .css('display', 'block')
            .reflow()
            .addClass('shown')[shouldCheck ? 'addClass' : 'removeClass']('active');

          $('#fd').addClass('shown');
          $('#fd-in').hide();
        }
      }
    )

    this.on(
      $('#card_number'),
      'input keypress',
      function(){
        elem_emi[this.value.length > 6 ? 'addClass' : 'removeClass']('check');
      }
    )
    each(
      $$('#emi-container > .emi-option'),
      function(i, el){
        this.on(
          $(el),
          'click', function(){
            $('#emi-container > .emi-active').removeClass('emi-active');
            $(this).addClass('emi-active').find('input')[0].checked = true;
            frontDrop();
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