((root) ->
	$ = root::$
	cardhelper = (el)->
		
		
	luhnCheck = (num)->
		odd = true
		sum = 0
		digits = (num + "").split("").reverse()
		for digit in digits
			digit = parseInt(digit, 10)
			digit *= 2  if odd = not odd
			digit -= 9  if digit > 9
			sum += digit
		sum % 10 === 0;

	root.cardhelper = cardhelper
)(window.Razorpay)