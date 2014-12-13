((root) ->
	$ = root::$
	cardhelper = (el)->
		origClass = el.className
		el.oninput = ()->
			className = cardVendor @value
			className = if className then ' ' + className.type  else ''
			className = origClass + className
			if className isnt @className
				@className = className

	luhnCheck = (num) ->
		odd = true
		sum = num.split('').reduceRight (total, digit) ->
			digit = parseInt(digit)
			digit *= 2 if (odd = !odd)
			digit -= 9 if digit > 9
			total + digit
		, 0
		sum % 10 == 0

	cardVendor = (num) ->
		num = (num + '').replace(/\D/g, '')
		return card for card in cards when card.pattern.test(num)

	cards = [
	# Debit cards must come first, since they have more
	# specific patterns than their credit-card equivalents.
		{
			type: 'visaelectron'
			pattern: /^4(026|17500|405|508|844|91[37])/
		}
		{
			type: 'maestro'
			pattern: /^(5(018|0[23]|[68])|6(39|7))/
			length: [12..19]
		}
	# Credit cards
		{
			type: 'visa'
			pattern: /^4/
			length: [13, 16]
		}
		{
			type: 'mastercard'
			pattern: /^5[0-5]/
		}
		{
			type: 'amex'
			pattern: /^3[47]/
			format: [4,6,5]
			length: [15]
			cvcLength: [3..4]
		}
		{
			type: 'dinersclub'
			pattern: /^3[0689]/
			length: [14]
		}
		{
			type: 'discover'
			pattern: /^6([045]|22)/
			luhn: true
		}
		{
			type: 'unionpay'
			pattern: /^(62|88)/
			length: [16..19]
			luhn: false
		}
		{
			type: 'jcb'
			pattern: /^35/
		}
	]
	root.cardhelper = cardhelper
)(window.Razorpay)