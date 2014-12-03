Razorpay::templates.modal = '
<div class="rzp-container" tabIndex="0">
	<div class="rzp-modal" id="{{id}}">
		<div class="rzp-header">
			<div class="rzp-merchant rzp-clear">
				<div class="rzp-merchant_image">
					<img src="{{image}}">
				</div>
				<div class="rzp-merchant_powered"></div>
				<div class="rzp-merchant_name">
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
				<form class="rzp-form" method="POST" novalidate>
					<input class="rzp-input" type="hidden" name="amount" value="${amount}">
					<input class="rzp-input" type="hidden" name="currency" value="INR">
					{{#each udf}}
					<!-- udf fields provided by merchant -->
					<input class="rzp-input" type="hidden" name="udf[{{$index}}]" value="{{$value}}">
					{{/each}}

					<input class="rzp-input" type="hidden" name="card[expiry_month]">
					<input class="rzp-input" type="hidden" name="card[expiry_year]">
					
					<div class="rzp-fieldset">
						<div class="rzp-elem" style="border-radius: 2px 2px 0 0"><div class="rzp-elem-inner">
							<input class="rzp-input" name="card[name]" placeholder="Name" required value="{{prefill.name}}" pattern=".{1,100}">
						</div></div>
						<div class="rzp-elem"><div class="rzp-elem-inner">
							<input class="rzp-input" name="email" type="email" placeholder="Email Address" required value="{{prefill.email}}" pattern="[a-zA-Z0-9!#$%&\'*+/=?^_{|}~-]+(?:.[a-zA-Z0-9!#$%&\'*+/=?^_{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?">
						</div></div>
						<div class="rzp-elem" style="border-radius: 0 0 2px 2px"><div class="rzp-elem-inner">
							<input class="rzp-input" name="contact" type="tel" placeholder="Contact Number" required value="{{prefill.contact}}" data-chars="[0-9]" pattern="[0-9]{10,12}">
						</div></div>
					</div>
					<div class="rzp-fieldset">
						<div class="rzp-elem" style="border-radius: 2px 2px 0 0"><div class="rzp-elem-inner">
							<input class="rzp-input" name="card[number]" class="card_number" placeholder="Card Number" required data-chars="[0-9]">
							<span class="rzp-card_image"></span>
						</div></div>
						<div class="rzp-double">
							<div class="rzp-elem" style="border-radius: 0 0 0 2px"><div class="rzp-elem-inner">
								<input class="rzp-input" name="card[expiry]" placeholder="MM/YY" required pattern="(0[1-9]|1[0-2])\/[0-9]{2}" maxlength="5" data-chars="([0-9]|\/)">
							</div></div>
							<div class="rzp-elem" style="border-radius: 0 0 2px 0"><div class="rzp-elem-inner">
								<input class="rzp-input" type="password" name="card[cvv]" placeholder="CVV" maxlength="4" required>
							</div></div>
						</div>
					</div>
					<ul class="rzp-error"></ul>
				</form>
			</div>
			{{#if netbanking}}
				<div id="rzp-tabs-nb" class="rzp-tab-content rzp-padder-top">
					<form class="rzp-form" method="POST" novalidate>
						<input class="rzp-input" type="hidden" name="amount" value="{{amount}}">
						<input class="rzp-input" type="hidden" name="currency" value="INR">
						{{#each udf}}
						<!-- udf fields provided by merchant -->
						<input class="rzp-input" type="hidden" name="udf[{{$index}}]" value="{{$value}}">
						{{/each}}
						<input class="rzp-input" type="hidden" name="method" value="net banking">
						
						<div class="rzp-fieldset">
							<div class="rzp-elem" style="border-radius: 2px 2px 0 0"><div class="rzp-elem-inner">
								<input class="rzp-input" name="email" type="email" placeholder="Email Address" required value="{{prefill.email}}" pattern="[a-zA-Z0-9!#$%&\'*+/=?^_{|}~-]+(?:.[a-zA-Z0-9!#$%&\'*+/=?^_{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?">
							</div></div>
							<div class="rzp-elem" style="border-radius: 0 0 2px 2px"><div class="rzp-elem-inner">
								<input class="rzp-input" name="contact" type="tel" placeholder="Contact Number" required value="{{prefill.contact}}" data-chars="[0-9]" pattern="[0-9]{10,12}">
							</div></div>
						</div>
						<div class="rzp-fieldset">
							<div class="rzp-elem" style="border-radius: 2px"><div class="rzp-elem-inner">
								<select name="bank" required>
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
						</div>
						<ul class="rzp-error"></ul>
					</form>
				</div>
			{{/if}}
		</div>
		<div class="rzp-footer rzp-clear">
			<button class="rzp-submit">
				<span class="rzp-ring"></span>
				<span class="rzp-text">Pay ₹{{toRupee amount}}</span>
			</button>
		</div>
	</div>
</div>'