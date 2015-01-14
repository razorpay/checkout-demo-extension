/* global $ */
(function(){
  "use strict";
  (function(){
    window.setTimeout(function(){
      var $form = $('.rzp-body');
      $form.find('input[name="card[number]"]').sendkeys('4012001037141112');//Debit Card with 3dsecure
      $form.find('input[name="card[expiry]"]').sendkeys('05 / 19');
      $form.find('input[name="card[cvv]"]').sendkeys('888');
    },1000);
  })();
})();
