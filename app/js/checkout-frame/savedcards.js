
function showCardForm() {
  gel('tab-card').setAttribute('screen', 'add-card');
  makeHidden("#saved-cards");
  makeVisible("#add-card");
}

function savedCards(tokens){
  this.tokens = tokens;
  this.listeners = [];
  this.render();
}

savedCards.prototype = {
  render: function() {
    this.unbind();
    $('#saved-cards').html(templates.savedcards(this.tokens));
    this.bind();
  },

  onchange: function(e){
    this.render();
  },

  on: function(event, sel, listener){
    var $el = $(sel);
    this.listeners.push($el.on(event, listener));
  },

  bind: function(){
    this.on('click', '#new-card-btn', showCardForm);
  },

  unbind: function(){
    invokeEach(this.listeners);
    this.listeners = [];
  }
}