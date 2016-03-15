// separate jQuery and $ (nominal-jquery)
$.noConflict();

// method for simulating click
function sendclick(el){
  var e = document.createEvent("MouseEvents");
  e.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
  el.dispatchEvent(e);
}

function clone(obj){
  return JSON.parse(JSON.stringify(obj));
}

var log = console.log.bind(console);
alert = console.log = console.error = jQuery.noop;

var spyOn = sinon.spy