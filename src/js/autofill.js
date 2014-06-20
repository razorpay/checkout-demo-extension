/* global $ */
(function(){
    "use strict";
	(function(){
		window.setTimeout(function(){
			var $form = $('form.rzp-body');
			$form.find('input[name="card[number]"]').val('4012001037141112');//Debit Card with 3dsecure
	        $form.find('input[name="card[expiry]"]').val('05 / 19');
	        $form.find('input[name="card[cvv]"]').val('888');
		},1000);
	})();
})();