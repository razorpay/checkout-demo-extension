((root) ->
	$ = root::$
	timeout = null
	defaults =
		shownClass: 'rzp-shown'
		modalSelector: '.rzp-modal'
		show: true
		escape: true
		animation: true
		stopKeyPropagation: true
		backdropClose: true
		hiddenCallback: null
		parent: null
	
	modal = (element, options) ->
		@options = $.extend defaults, options
		@element = element
		unless @element.attr('tabIndex')
			@element.attr('tabIndex', '0')

		if not @element.parent().length
			@element.appendTo(document.body or @options.parent)
		
		if @options.animation and @transitionProperty
			durationStyle = getComputedStyle(element[0])[@transitionProperty]
			duration = @options.animation and @transitionProperty and parseFloat(durationStyle) or 0
			
			# if animation is in seconds
			duration *= 1000 if duration and typeof durationStyle is 'string' and durationStyle[durationStyle.length - 2] isnt 'm'
			@animationDuration = duration

		if @options.show
			@show()
		@

	modal:: =
		listeners: []
		on: (event, target, callback)->
			handler = $.proxy callback, @
			target.on event, handler
			@listeners.push [target, event, handler]

		# vendor css transition prefix detection
		transitionProperty: do ->
			prop = ''
			['transition', 'WebkitTransition', 'MozTransition', 'OTransition'].some (i) ->
				if typeof document.head.style[i] is 'string'
					prop = i + 'Duration'
					true
			prop

		toggle: ->
			do @[if not @isShown then 'show' else 'hide']

		show: ->
			# return if @isShown
			# gracefully close other modals

			$(document.body).css 'overflow', 'hidden'
			@isShown = true
			@bind_events()
			
			@element.show().get(0).focus()
			@element.children(@options.modalSelector).css('display', 'inline-block')
			
			@element.prop 'offsetWidth'
			@element.children(@options.modalSelector).prop 'offsetWidth'
			
			@element.addClass @options.shownClass
			
			@clearTimeout()
			timeout = setTimeout $.proxy(@shown, @), @animationDuration

		shown: ->
			@clearTimeout()

		hide: ->
			return if not @isShown
			@isShown = false

			@element.removeClass @options.shownClass

			@listeners.forEach (l)->
				l[0].off l[1], l[2]
			@listeners = []
			# parent[0].removeEventListener 'blur', @steal_focus, true

			@clearTimeout()
			timeout = setTimeout ()=>
				@hidden()
			, @animationDuration

		clearTimeout: ->
			if timeout
				clearTimeout timeout
			timeout = null

		hidden: ->
			$(document.body).css 'overflow', ''
			@clearTimeout()
			
			@element.hide()
				.children(@options.modalSelector).hide()

			if typeof @options.hiddenCallback is 'function'
				@options.hiddenCallback()

		steal_focus: (e)->
			return if not e.relatedTarget
			if not $(this).find(e.relatedTarget).length # if tab key is pressed, and something out of modal-container is focused, snatch it back.
				this.focus()

		bind_events: ->
			@element[0].addEventListener 'blur', @steal_focus, true
			if @options.stopKeyPropagation
				@on 'keyup keydown keypress', @element, (e)=>
					e.stopPropagation()
						
			if @options.escape
				@on 'keyup', @element, (e)=>
					@hide() if e.which is 27
			
			if @options.backdropClose
				@on 'click', @element, (e)=>
					@hide() if e.target is @element[0] and @options.backdropClose

	root.modal = modal
)(window.Razorpay)