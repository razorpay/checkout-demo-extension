// separate jQuery and $ (nominal-jquery)
$.noConflict();

// method for simulating click
function sendclick(el){
  var e = document.createEvent("MouseEvents");
  e.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
  el.dispatchEvent(e);
}

function sendkey(el, key){
  if(key.length > 1){
    for(var i=0; i<key.length; i++)
      sendkey(el, key[i]);
    return;
  }
  var e = document.createEvent("KeyboardEvent");
  (e.initKeyEvent || e.initKeyboardEvent)("keypress", true, true, window, 0, 0, 0, 0, 0, character.charCodeAt(0));
  el.dispatchEvent(evt);
}