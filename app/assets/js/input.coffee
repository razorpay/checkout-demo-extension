(($)->
	prefix = 'rzp-'
	Smarty = (form, options)->
		@element = form
		@options = options or {}
		@listeners = []
		@common_events()
		@refresh()
		@

	$.fn.smarty = (options)->
		@each ()->
			el = $ @
			data = el.data('smarty') # data = smarty or null

			if typeof options is 'string'
				data[options]() if data
			else if data
				data.refresh()
			else
				# smarty doesnt exist
				options = $.extend $.fn.smarty.defaults, typeof options is 'object' and options
				data = new Smarty el, options
				el.data 'smarty', data
				data

	Smarty:: =
		class: (str)->
			str.split(' ').map((s)->
				prefix + s
			).join(' ')

		selector: (str)->
			str.split(' ').map((s)->
				'.' + prefix + s
			).join(' ')

		parent: (el)->
			el.parentNode.parentNode

		common_events: ()->
			@on 'focus', @focus, true
			@on 'blur', @blur, true
			@on 'input', @input, true
			@on 'change', @input, true
			@on 'keypress', @keypress
			@on 'mouseover', @selector('tooltip'), (e)-> $(e.currentTarget).hide()

		on: ()->
			event = arguments[0]
			lastarg = arguments[arguments.length-1]
			target = if typeof arguments[1] is 'string' then arguments[1] else @selector('input')
			
			if lastarg is true
				handler = arguments[arguments.length - 2]
				proxy = $.proxy (e)->
					if typeof e.target.value is 'string'
						handler.apply @, arguments
				, @
				@element[0].addEventListener event, proxy, true
				@listeners.push [event, proxy, true]
			else
				proxy = $.proxy lastarg, @
				@element.on event, target, proxy
				@listeners.push [event, target, proxy]

		bye: ()->
			@listeners.forEach (l)=>
				if l[2] is true
					@element[0].removeEventListener l[0], l[1], true
				else
					@element.off l[0], l[1], l[2]

		focus: (e)->
			el = e.target
			# placeholder polyfill for IE <= 9
			if el.rzp_placeholder
				el.value = ''
				el.rzp_placeholder = false

			$(@parent(el)).addClass @class 'focused'

		blur: (e)->
			el = e.target
			# placeholder polyfill for IE <= 9
			if !el.value and !el.placeholder and typeof el.getAttribute('placeholder') isnt 'string'
				el.rzp_placeholder = true
				el.value = el.getAttribute('placeholder')

			parent = $ @parent el
			parent.removeClass @class 'focused'

			# helps with :invalid after losing focus once.
			if not parent.hasClass @class 'mature'
				parent.addClass @class 'mature'

		input: (e)->
			el = e.target
			parent = $ @parent el
			value = el.value

			if el.validity
				valid = el.validity.valid
			else
				# IE9,10 and Safari
				# not validating [type=url] and [type=number] min,max,step. better make them [type=text] and add pattern.
				valid = true
				required = typeof el.getAttribute 'required' is 'string'
				pattern = el.getAttribute 'pattern'
				
				if required and not value
					valid = false
				
				if valid and pattern
					valid = new RegExp(pattern).test value

			if valid and not parent.hasClass @class 'mature'
				parent.addClass @class 'mature'

			if valid and parent.hasClass @class 'invalid'
				parent.removeClass @class 'invalid'
			else if not valid
				parent.addClass @class 'invalid'

		keypress: (e)->
			chars = e.target.getAttribute 'data-chars'
			return if not chars
			key = String.fromCharCode(e.which)
			return false if !(new RegExp(chars).test key)


			# return true if name is 'card[expiry]' and key is 191
			# return false if /card[expiry]|card[number]|card[cvv]|contact/.test(name) and (key <= 48 or key >= 57)

		refresh: ()->
			@element.find @selector('input')
				.each (index, el)=>
					parent = $ @parent el
					@update parent, el

		initiate: (parent, el, type)->
			parent.data('smarty', true)
			
			help = @helptext el
			if help
				parent.append('<div class='+@class('tooltip')+'>'+@helptext(el)+'</div>')
			
			if document.activeElement is el
				parent.addClass @class('focused')

		update: (parent, el)->
			type = el.getAttribute 'type'

			if not parent.data('smarty')
				@initiate parent, el, type

			parent.removeClass @class('filled mature invalid')

			if el.value
				parent.addClass @class('filled mature')
			
			# set initial invalid class
			@input {target: el}

		helptext: (el)->
			name = el.name
			return '' if not name
			node = el.nodeName.toLowerCase()
			value = el.value
			
			if node is 'select'
				'Please select an item in the list.'
			else if not value
				'Please fill out this field.'
			else if name is 'contact'
				'Please enter a valid 10-12 digit phone number.'
			else if name is 'email'
				if value.length > 254
					'Entered email is too long.'
				else
					'Please enter a valid email address, like you@example.com'
			else if name is 'card[name]'
				if value.length > 100
					'Entered name is too long.'
				else
					'Please enter a valid name without numbers or special characters.'
			else if name is 'card[number]'
				'Please enter valid card number.'
			else if name is 'card[expiry]'
				'Please enter valid expiry date, like 01/22'
			else if name is 'card[cvv]'
				'Please enter 3 or 4 digit CVV number.'
			else
				'Please enter valid input.'

)(Razorpay::$)