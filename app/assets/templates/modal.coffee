window.Razorpay.templates.modal = '
<div class="rzp-container">
	<div class = "rzp-modal" id = "{{id}}">
		<div class = "rzp-header">
			<div class="rzp-merchant rzp-clear">
				<div class = "rzp-merchant_image">
					<img src = "{{image}}">
				</div>
				<div class = "rzp-merchant_powered"></div>
				<div class = "rzp-merchant_name">
					{{name}}
					<br>
					{{description}}
				</div>
			</div>
			{{#if netbanking}}
			<ul class="rzp-tabs">
				<li data-target="rzp-tabs-cc" class="active">Card</li>
				<li data-target="rzp-tabs-nb">Net Banking</li>
			</ul>
			{{/if}}
		</div>
		<div class="rzp-body">
			<div id="rzp-tabs-cc" class="rzp-tab-content active">
				<form class = "rzp-form" method = "POST">
					<input type = "hidden" name = "amount" value = "${amount}">
					<input type = "hidden" name = "currency" value = "INR">
					{{#each udf}}
					<!-- udf fields provided by merchant -->
					<input type = "hidden" name = "udf[{{$index}}]" value = "{{$value}}">
					{{/each}}

					<input type = "hidden" name = "card[expiry_month]">
					<input type = "hidden" name = "card[expiry_year]">
					
					<div class="rzp-elem rzp-tradius"><div class="rzp-elem-inner">
						<input name = "card[name]" placeholder = "Name" required value = "{{prefill.name}}">
					</div></div>
					<!--<div class="rzp-elem"><div class="rzp-elem-inner">
						<input name = "email" type = "email" placeholder = "Email Address" required value = "{{prefill.email}}">
					</div></div>
					<div class="rzp-elem"><div class="rzp-elem-inner">
						<input name = "contact" type = "tel" placeholder = "Contact Number" required value = "{{prefill.contact}}">
					</div></div>-->
					<div class="rzp-elem"><div class="rzp-elem-inner">
						<input name = "card[number]" class = "card_number" placeholder = "Card Number" required>
						<span class = "rzp-card_image"></span>
					</div></div>
					<div class="rzp-double">
						<div class="rzp-elem rzp-blradius"><div class="rzp-elem-inner">
							<input name = "card[expiry]" size = "2" placeholder = "MM / YY" required>
						</div></div>
						<div class="rzp-elem rzp-brradius"><div class="rzp-elem-inner">
							<input type = "password" name = "card[cvv]" size = "3" placeholder = "CVV" maxlength = "4" required>
						</div></div>
					</div>
					<ul class = "rzp-error"></ul>
				</form>
			</div>
			{{#if netbanking}}
				<div id="rzp-tabs-nb" class="rzp-tab-content rzp-padder-top">
					<form class = "rzp-form" method = "POST">
						<input type = "hidden" name = "amount" value = "{{amount}}">
						<input type = "hidden" name = "currency" value = "INR">
						{{#each udf}}
						<!-- udf fields provided by merchant -->
						<input type = "hidden" name = "udf[{{$index}}]" value = "{{$value}}">
						{{/each}}
						<input type = "hidden" name = "method" value = "net banking">
						<!--
						<input name = "email" type = "email" placeholder = "Email Address" required value = "{{prefill.email}}">
						<input name = "contact" type = "tel" placeholder = "Contact Number" required value = "{{prefill.contact}}">
						-->
						
						<div class="rzp-elem rzp-allradius"><div class="rzp-elem-inner">
							<select name = "bank" required>
								<option value="">Select Bank</option>
								<option value="ALLA">Allahabad Bank</option>
								<option value="CITI">Citi Bank</option>
								<option value="HDFC">HDFC Bank</option>
								<option value="IBKL">IDBI Bank</option>
								<option value="ICIC">ICICI Bank</option>
								<option value="KKBK">Kotak Mahindra Bank</option>
								<option value="PUNB">Punjab National Bank</option>
								<option value="SBIN">State Bank of India</option>
							</select>
						</div></div>
						<ul class = "rzp-error"></ul>
					</form>
				</div>
			{{/if}}
		</div>
		<div class="rzp-footer rzp-clear">
			<button class = "rzp-submit">
				<span class = "rzp-ring"></span>
				<span class = "rzp-text">Pay ₹{{toRupee amount}}</span>
			</button>
		</div>
	</div>
</div>'