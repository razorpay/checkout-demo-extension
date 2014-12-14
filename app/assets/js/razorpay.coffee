do () ->
	RazorPayScript = document.currentScript or do ->
		scripts = document.getElementsByTagName 'script'
		scripts[scripts.length - 1]

	Razorpay = window.Razorpay
	$ = Razorpay::$
	Handlebars = Razorpay::Handlebars

	Razorpay.XDCallback = (message) ->
		rzp = Razorpay.lastXDInstance
		rzp.preHandler()
		if message.data.error and message.data.error.description
			
			#In case of error reopen box and show error
			rzp.open()
			rzp.handleAjaxResponse message.data
		else
			rzp.options.handler message.data

	Razorpay::clearSubmission = ->
		form.find('.rzp-error').html ''
		@modal.options.backdropClose = true

	Razorpay::createlightBox = (template) ->
		if @$el
			return @modal.show()
		@$el = $((Handlebars.compile(template))(@options))
		@$el.smarty()
		@modal = new Razorpay.modal @$el
		
		# jquery payment validation
		@$el.find('.rzp-input[name="card[number]"]').payment('formatCardNumber').on 'blur', ()->
			parent = $(@parentNode.parentNode)
			parent[if $.payment.validateCardNumber(@value) then 'removeClass' else 'addClass']('rzp-invalid')

		@$el.find('.rzp-input[name="card[expiry]"]').payment('formatCardExpiry')
		#	.on 'blur', ()->
		#	 	parent = $(@parentNode.parentNode)
		#	 	parent[if $.payment.validateCardExpiry(@value) then 'removeClass' else 'addClass']('rzp-invalid')

		@$el.find('.rzp-input[name="card[cvv]"]').payment('formatCardCVC').on 'blur', ()->
			parent = $(@parentNode.parentNode)
			parent[if $.payment.validateCardCVC(@value) then 'removeClass' else 'addClass']('rzp-invalid')

		if @options.netbanking
			@$el.find('.rzp-tabs li').click ->
				inner = $(this).closest('.rzp-modal-inner')
				return if not inner.length
				modal = inner.parent()
				modal.height inner.height()
				inner.css 'opacity', 0.5
				inner.find('#' + @getAttribute('data-target')).addClass('active').siblings('.active').removeClass 'active'
				$(this).addClass('active').siblings('.active').removeClass 'active'
				modal.height inner.height()
				setTimeout ->
					inner.css 'opacity', 1
				, 150

		@$el.find('form').on 'submit', (e) =>
			e.preventDefault()
			form = $(e.currentTarget)
			invalid = form.find('.rzp-invalid')
			if invalid.length
				invalid.addClass('rzp-mature').find('.rzp-input')[0].focus()
				return @shake()
			return @submit form
			if submission
				# Disable the input button to prevent double submissions
				@$el.find('.rzp-submit').attr 'disabled', 'disabled'
				# Marks the modal window as busy so it is not closable
				@modal.options.backdropClose = false
			else
				@clearSubmission()

	Razorpay::submit = (form) ->
		data = {}
		# data.key = @options.key
		form.find('[name]').each (index,el)->
			data[el.name] = el.value if el.value

		# Card
		if !form.find('select[name=bank]').length
			# Break expiry date into month and year
			data['card[number]'] = data['card[number]'].replace(/\ /g,'')
			expiry = data['card[expiry]'].replace(/\ /g,'').split('/')
			data['card[expiry_month]'] = expiry[0]
			data['card[expiry_year]'] = expiry[1]
			delete data['card[expiry]']

		$.ajax
			url: @options.protocol + '://' + @options.key + '@' + @options.hostname + '/' + @options.version + @options.jsonpUrl
			dataType: 'jsonp'
			success: @handleAjaxSuccess
			timeout: 35000 # 35 seconds = 30s for gateway + 5s for razorpay
			error: @handleAjaxError
			data: data
			form: form
			Razorpay: @

	Razorpay::handleAjaxError = ->
		@form.find('.rzp-error').html 'There was an error in handling your request'

	Razorpay::handleAjaxSuccess = (response)->
		form = @form
		$el = @Razorpay.$el
		if response.callbackUrl
			# If a proper response with callbackUrl has been received, then an
			# iframe needs to be opened
			iframe = document.createElement 'iframe'
			modal = $el.find('.rzp-modal').html ''
				.append iframe
			template = Handlebars.compile(@Razorpay.templates.autosubmit) response
			iframe.contentWindow.document.write template
			
			# This form should autosubmit
			# Now we need to resize the modal box so as to accomodate 3dsecure.
			modal.addClass 'rzp-frame'
			
			# Make this instance of rzp the instance called by the XDCallback
			Razorpay.lastXDInstance = @Razorpay
		else if response.redirectUrl
			
			# If a proper response with redirectUrl has been received, then an
			# iframe needs to be opened
			@$el.html "<iframe src=" + response.redirectUrl + "></iframe>"
			
			# This form should autosubmit
			# Now we need to resize the modal box so as to accomodate 3dsecure.
			$(@$el).width("1000px").height "500px"
			$(@$el.find("iframe")).width("1000px").height "500px"
			
			# Make this instance of rzp the instance called by the XDCallback
			Razorpay.lastXDInstance = @Razorpay
		else if response.status
			@preHandler()
			@options.handler response
		else
			@$el.find('.rzp-error').html 'There was an error in handling your request'
			@clearSubmission()

	Razorpay::shake = ->
		@$el.find('.rzp-modal').addClass 'rzp-shake'
		setTimeout =>
			@$el.find('.rzp-modal').removeClass 'rzp-shake'
		, 150

	Razorpay::hide = ->
		@clearSubmission()
		@modal.hide()

	Razorpay::options =
		protocol: 'https'
		hostname: 'api.razorpay.com'
		version: 'v1'
		jsonpUrl: '/payments/create/jsonp'
		prefill:
			name: ''
			contact: ''
			email: ''

		# These fields are specified by the merchant
		udf: {}

	# We can specify any default options here
	#
	
	###*
	This function is called just before control is passed on
	to the handler specified in options
	###
	Razorpay::preHandler = ->
		# Hide the modal window when the transaction is complete
		@hide()
	
	###*
	default handler for success
	default handler does not care about error or success messages,
	it just submits everything via the form
	@param	{[type]} data [description]
	@return {[type]}		[description]
	###
	Razorpay::options.handler = (data) ->
		inputs = ""
		for i of data
			
			# For fields like udf, which are an object themselves
			if typeof data[i] is "object"
				for j of data[i]
					inputs += "<input type=\"hidden\" name=\"" + i + "[" + j + "]\" value=\"" + data[i][j] + "\">"
			else
				inputs += "<input type=\"hidden\" name=\"" + i + "\" value=\"" + data[i] + "\">"
		RazorPayForm = RazorPayScript.parentElement
		$(inputs).appendTo RazorPayForm
		$(RazorPayForm).submit()
	
	# Start by creating a new button to press
	Razorpay::addButton = ->
		button = document.createElement("button")
		button.setAttribute "id", "rzp-button"
		self = this
		$(button).click((e) ->
			self.open()
			e.preventDefault()
			return
		).html("Pay with Card").appendTo "body"
		return

	Razorpay::validateOptions = ->
		throw new Error("No amount specified")	if typeof @options.amount is "undefined"
		throw new Error("Invalid amount specified")	if @options.amount < 0
		throw new Error("Invalid Protocol specified")	if [
			"https"
			"http"
		].indexOf(@options.protocol) < 0
		throw new Error("Handler must be a function")	unless $.isFunction(@options.handler)
		throw new Error("No merchant key specified")	if typeof @options.key is "undefined"
		throw new Error("You can only pass at most 13 fields in the udf object")	if Object.keys(@options.udf).length > 15

	Razorpay::open = (options) ->
		@options = $.extend({}, @options, options)
		@createlightBox @templates.modal

	Razorpay::configure = (options) ->
		# The following loop converts property names of the form
		#	x.y = "Value" to proper objects x = {y:"Value"}
		for i of options
			ix = i.indexOf(".")
			if ix > -1
				
				# We have a dot in an option name
				# Break it into 2
				dotPosition = ix
				
				# Get the category
				category = i.substr(0, dotPosition)
				
				# Get the property (after the dot)
				property = i.substr(dotPosition + 1)
				options[category] = options[category] or {}
				options[category][property] = options[i]
				
				# Delete the existing property
				delete (options[i])
		throw new Error("No options specified") if typeof options is "undefined"
		throw new Error("No merchant key specified") if typeof options["key"] is "undefined"
		@options = $.extend({}, @options, options)

	do ->
		key = $(RazorPayScript).data("key")
		if key and key.length > 0

			# If we have a key set, that means we are in auto mode
			# and need to display the button automatically
			rzp = new Razorpay($(RazorPayScript).data())
			
			# We leave this unstyled
			rzp.addButton()
	
	Razorpay::XD.receiveMessage Razorpay.XDCallback