// separate jQuery and $ (nominal-jquery)
$.noConflict();

// method for simulating click
sendclick = function(el){
  var e = document.createEvent("MouseEvents");
  e.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
  el.dispatchEvent(e);
}