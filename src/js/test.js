/* global $ */
(function(){
    "use strict";
	(function(){
		window.setTimeout(function(){
			var $form = $('form.body');
			$form.find('input[name="card[number]"]').val('4012001038443335');
	        $form.find('input[name="card[expiry]"]').val('05 / 19');
	        $form.find('input[name="card[cvv]"]').val('888');
	        $form.find('input[name="card[name]"]').val('Abhay Rana');
	        $form.find('input[name="udf[contact]"]').val('9458113956');
	        $form.find('input[name="udf[email]"]').val('nemo@razorpay.com');
		},1000);
	})();
})();