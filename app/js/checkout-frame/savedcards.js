
function showCardForm() {
  getSession().cardScreen = 'add-card';
  makeHidden("#saved-cards");
  makeVisible("#add-card");
}

function savedCards(tokens){
  this.tokens = tokens;
  this.listeners = [];
  this.render();
}

function deleteCard(e) {
  var target = $(e.target);
  if (!target.hasClass('delete')) {
    return;
  }
  var parent = target.parent().parent();
  var user = window.getSession().user;
  if(confirm("Press OK to delete card.")){
    user.deleteCard(
      parent.find('[type=radio]')[0].value,
      function(){
        parent.remove();
    });
  }
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
    this.on('click', '.cards', deleteCard);
  },

  unbind: function(){
    invokeEach(this.listeners);
    this.listeners = [];
  }
}