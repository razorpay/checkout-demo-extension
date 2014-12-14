(($)->
	prefix = 'rzp-'
	Smarty = (form, options)->
		@element = form
		@ttel = $(form[0].querySelector @selector 'tooltip')
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
			arr = str.split(' ')
			for a, i in arr
				arr[i] = prefix + a
			arr.join(' ')

		selector: (str)->
			arr = str.split(' ')
			for a, i in arr
				arr[i] = '.' + prefix + a
			arr.join(' ')

		parent: (el)->
			el.parentNode.parentNode

		common_events: ()->
			@on 'focus', @focus, true
			@on 'blur', @blur, true
			@on 'input', @input, true
			@on 'change', @input, true
			@on 'click', '.rzp-elem', @intercept_click
			@on 'mousedown', @selector('tooltip'), (e)=>
				$(e.currentTarget).hide()

			@element.find('input[name=contact]').on 'keypress', @keypress

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
				if window.addEventListener
					@element[0].addEventListener event, proxy, true
				else
					@element.find(target).on event, proxy
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

		intercept_click: (e)->
			if !e.target.value
				$(e.target).find(@selector 'input')[0].focus()

		focus: (e)->
			el = e.target
			return if not (/(INPUT|SELECT)/.test el.nodeName)
			# placeholder polyfill for IE <= 9
			if el.rzp_placeholder
				el.value = ''
				el.rzp_placeholder = false

			$(@parent(el)).addClass @class 'focused'
			
			# tooltip placement
			@tooltip el

		tooltip: (el)->
			positioned = @ttel.data 'pos'
			parent = @parent(el)

			state = @parent(el).className
			show = /mature/.test(state) and /invalid/.test(state)
			classname = @class 'shown'
			shown = @ttel.hasClass classname

			if show
				@ttel.html @helptext el
				if not positioned
					if @ttel.is(':hidden')
						@ttel.show()
					parent_rect = parent.getBoundingClientRect()
					modal_rect = @element.children(@selector('modal'))[0].getBoundingClientRect()
					tt_top = parent_rect.bottom - modal_rect.top - 5
					tt_left = parent_rect.left - modal_rect.left + 10
				
					@ttel.css
						top: tt_top
						left: tt_left
					.data 'pos', true

			if show and not shown
				@ttel.addClass classname
			else if not show
				@ttel.removeClass classname

		blur: (e)->
			el = e.target
			return if not (/(INPUT|SELECT)/.test el.nodeName)
			# placeholder polyfill for IE <= 9
			if !el.value and !el.placeholder and typeof el.getAttribute('placeholder') isnt 'string'
				el.rzp_placeholder = true
				el.value = el.getAttribute('placeholder')

			parent = $ @parent el
			parent.removeClass @class 'focused'

			# helps with :invalid after losing focus once.
			if not parent.hasClass @class 'mature'
				parent.addClass @class 'mature'

			@ttel.removeClass @class 'shown'
				.data 'pos', false

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

			isMature = parent.hasClass @class 'mature'
			if valid and not isMature
				parent.addClass @class 'mature'
				isMature = true

			if valid and parent.hasClass @class 'invalid'
				parent.removeClass @class 'invalid'
			else if not valid
				parent.addClass @class 'invalid'

			@tooltip el

		keypress: (e)->
			return if e.metaKey or e.altKey or e.ctrlKey
			return if not e.which or e.which is 8 # backspace fires keypress in some browsers
			key = String.fromCharCode(e.which)
			return false if !(new RegExp('[0-9]').test key)

		refresh: ()->
			@element.find @selector('input')
				.each (index, el)=>
					parent = $ @parent el
					@update parent, el

		initiate: (parent, el, type)->
			parent.data('smarty', true)
			
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
				'Please enter valid expiry date, like 01 / 22'
			else if name is 'card[cvv]'
				'Please enter 3 or 4 digit CVV number.'
			else
				'Please enter valid input.'

)(Razorpay::$)