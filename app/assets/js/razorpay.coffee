do () ->
	RazorPayScript = document.currentScript or do ->
		scripts = document.getElementsByTagName 'script'
		scripts[scripts.length - 1]

	Razorpay = window.Razorpay
	$ = Razorpay::$
	Handlebars = Razorpay::Handlebars
		
	###*
	This function is passed an rzp instance and
	it is saved in Razorpay
	###
	Razorpay::setXDInstance = ->
		Razorpay.lastXDInstance = this

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
		@$el.find(".rzp-submit").removeAttr "disabled"
		@$el.data "busy", false
		return

	Razorpay::createlightBox = (template) ->
		$("#" + @options.id).parent().remove() if @options.id
		@options.id = (Math.random()).toString(36).replace(/[^a-z]+/g, "")
		html = $((Handlebars.compile(template))(@options))
		html.smarty()
		document.body.style.overflow = 'hidden'
		html.appendTo(document.body).show()[0].offsetWidth
		html.addClass('shown').click (e) ->
			if this is e.target
				$(this).remove()
				document.body.style.overflow = ''

		if @options.netbanking
			$('.rzp-tabs li').click ->
				$('#' + @getAttribute("data-target")).addClass("active").siblings(".active").removeClass "active"
				$(this).addClass("active").siblings(".active").removeClass "active"

		@$el = $('#' + @options.id)
		self = this
		@$el.find("form.rzp-body").submit (e) ->
			
			#
			# Handles the form submission
			#
			submission = self.formsubmit(this)
			
			#
			# submission stores whether we are submitting the form or not
			#
			if submission
				
				#
				# Disable the input button to prevent double submissions
				#
				self.$el.find(".rzp-submit").attr "disabled", "disabled"
				
				#
				# Marks the modal window as busy so it is not closable
				#
				self.$el.data "busy", true
			else
				self.clearSubmission()
			
			#
			# So that form is not submitted by the browser,
			# but by us over ajax
			#
			e.preventDefault()
			return

		return

	Razorpay::breakExpiry = (expiry) ->
		
		#
		# Returns month, year as a tuple inside an object
		#
		month: expiry.substr(0, 2)
		
		#
		# Strip all spaces and backslashes,
		# and then cut off first two digits (month);
		#
		year: expiry.replace(/[ \/]/g, "").substr(2)

	Razorpay::formsubmit = (form) ->
		merchantKey = @options.key
		$form = $(form)
		if $form.find(@fieldNames.bank).length is 0
			
			# CC/DC Submission
			#
			# Break expiry date into month and year
			#
			expiry = @breakExpiry($form.find(@fieldNames.expiry).val())
			$form.find(@fieldNames.expiryMonth).val expiry.month
			$form.find(@fieldNames.expiryYear).val expiry.year
			
			#
			# Prevent 'expiry' field from being submitted
			# since expiry month and year are being submitted individually
			#
			$form.find(@fieldNames.expiry).prop "disabled", true
			data = $form.serialize()
			
			#
			# Renable after getting required data
			#
			$(@fieldNames.expiry).prop "disabled", false
		else
			data = $form.serialize()
			errors = @postValidateNB($form)
		self = this
		
		#
		# If we have more than one errors
		#
		if errors.length > 0
			
			#
			# Shake the modal window
			#
			@shake()
			template = "{{#each err}}\t\t\t\t\t<li>{{$value}}<li>\t\t\t\t{{/each}}"
			div = document.createElement("div")
			$((Handlebars(template))(err: errors)).appendTo div
			@$el.find(".rzp-error_box").html div.innerHTML
			return false
		else
			
			#
			# Cleanup errors created by any previous attempts
			#
			@$el.find(".rzp-error_box").html ""
		$.ajax
			url: @options.protocol + "://" + merchantKey + "@" + @options.hostname + "/" + @options.version + @options.jsonpUrl
			dataType: "jsonp"
			context: this
			success: @handleAjaxResponse
			timeout: 35000 # 35 seconds = 30s for gateway + 5s for razorpay
			error: @handleAjaxError
			data: data

		true

	Razorpay::handleAjaxError = ->
		@$el.find(".rzp-error_box").html "<li>There was an error in handling your request</li>"
		@clearSubmission()
		return

	Razorpay::handleAjaxResponse = (response) ->
		if response.http_status_code isnt 200 and response.error
			@shake()
			@$el.find("input[name=\"" + response.error.field + "\"]").addClass "rzp-invalid"	if @$el.find("input[name=\"" + response.error.field + "\"]").length	if response.error.field
			defaultMessage = "There was an error in handling your request"
			message = response.error.description or defaultMessage
			@$el.find(".rzp-error_box").html "<li>" + message + "</li>"
			@clearSubmission()
		else if response.callbackUrl
			
			#
			# If a proper response with callbackUrl has been received, then an
			# iframe needs to be opened
			#
			@$el.html "<iframe></iframe>"
			autosubmitformTemplate = @templates.autosubmit
			div = document.createElement("div")
			$((Handlebars.compile(autosubmitformTemplate))(response)).appendTo div
			@$el.find("iframe").get(0).contentWindow.document.write div.innerHTML
			
			#
			# This form should autosubmit
			# Now we need to resize the modal box so as to accomodate 3dsecure.
			#
			$(@$el).width("1000px").height "500px"
			$(@$el.find("iframe")).width("1000px").height "500px"
			
			#
			# Make this instance of rzp the instance called by the XDCallback
			#
			@setXDInstance()
		else if response.redirectUrl
			
			#
			# If a proper response with redirectUrl has been received, then an
			# iframe needs to be opened
			#
			@$el.html "<iframe src=" + response.redirectUrl + "></iframe>"
			
			#
			# This form should autosubmit
			# Now we need to resize the modal box so as to accomodate 3dsecure.
			#
			$(@$el).width("1000px").height "500px"
			$(@$el.find("iframe")).width("1000px").height "500px"
			
			#
			# Make this instance of rzp the instance called by the XDCallback
			#
			@setXDInstance()
		else if response.status
			@preHandler()
			@options.handler response
		else
			@$el.find(".rzp-error_box").html "<li>There was an error in handling your request</li>"
			@clearSubmission()
		return

	Razorpay::shake = ->
		@$el.addClass 'rzp-shake'
		setTimeout =>
			@$el.removeClass 'rzp-shake'
		, 150

	Razorpay::hide = ->
		@clearSubmission()
		return

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

	
	#
	# We can specify any default options here
	#
	
	###*
	This function is called just before control is passed on
	to the handler specified in options
	###
	Razorpay::preHandler = ->
		
		#
		# Hide the modal window when the transaction is complete
		#
		@hide()
		
		# Prepare the lightBox for re-opening
		@createlightBox @templates.modal

	
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
		return

	Razorpay::setEndpoint = (protocol, hostname) ->
		@options.protocol = protocol
		@options.hostname = hostname
		return

	
	###*
	Now everything is defined
	###
	
	#
	# Start by creating a new button to press
	#
	
	###*
	Creates a new button to press
	###
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
		
		#
		# The following loop converts property names of the form
		#	x.y = "Value" to proper objects x = {y:"Value"}
		#
		for i of options
			ix = i.indexOf(".")
			if ix > -1
				
				#
				# We have a dot in an option name
				# Break it into 2
				#
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
			
			#
			# If we have a key set, that means we are in auto mode
			# and need to display the button automatically
			#
			rzp = new Razorpay($(RazorPayScript).data())
			
			# We leave this unstyled
			rzp.addButton()
	
	Razorpay::XD.receiveMessage Razorpay.XDCallback