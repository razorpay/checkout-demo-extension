$ = Razorpay::$
unless templates
  templates = {}
templates.modal = '
<div id="container" tabIndex="0" style="display: none">
  <div class="backdrop"></div>
  <div class="modal">
    <div class="modal-inner">
      <div class="header">
        <div class="merchant">
          <div id="modal-close">×</div>
          <div class="merchant-image">
            {{if(it.image){}}
              <img src="{{=it.image}}">
            {{}}}
          </div>
          <div class="merchant-name">
            <div class="merchant-title">{{=it.name}}</div>
            <div class="merchant-desc">{{=it.description}}</div>
          </div>
        </div>
      </div>
      <div class="body">
        <form id="form" method="POST" novalidate autocomplete="off" onsubmit="return false">
          <div id="form-common">
            <div id="error-container"><div id="error-message"></div></div>
            <input type="hidden" name="amount" value="{{=it.amount}}">
            <input type="hidden" name="currency" value="{{=it.currency}}">
            <input type="hidden" name="description" value="{{=it.description}}">
            {{for(note in it.notes){}}
              <!-- udf fields provided by merchant -->
              <input type="hidden" name="notes[{{=note}}]" value="{{=it.notes[note]}}">
            {{}}}

            <div class="fieldset">
              <p class="elem elem-email" style="border-radius: 4px 4px 0 0">
                <i>&#xe603;</i>
                <span class="help-text">Please enter a valid email, like you@foo.com</span>
                <input class="input" name="email" type="email" placeholder="Email Address" required value="{{=it.prefill.email}}" pattern="^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(\\.[a-zA-Z0-9-]+)+$">
              </p>
              <p class="elem elem-contact" style="border-radius: 0 0 4px 4px">
                <span class="help-text">Please enter 10-12 digit contact number.</span>
                <i>&#xe607;</i>
                <input id="contact" class="input" name="contact" type="tel" placeholder="Contact Number" required value="{{=it.prefill.contact}}" pattern="[0-9]{10,12}">
              </p>
            </div>
          </div>
          {{ var tabCount = 0; it.method.card && tabCount++; it.method.netbanking && tabCount++; it.method.wallet && tabCount++; }}
          <ul id="tabs"{{if(tabCount){}} class="tabs-{{=tabCount}}"{{}}}>
            {{? it.method.card }}
              <li data-target="tab-card" class="active">Card</li>
            {{?}}
            {{? it.method.netbanking }}
              <li data-target="tab-netbanking"{{? !it.method.card}} class="active"{{?}}>Net Banking</li>
            {{?}}
            {{? it.method.wallet }}
              <li data-target="tab-wallet"{{? !it.method.card && !it.method.netbanking }} class="active"{{?}}>
                <div class="paytm-logo"></div>
              </li>
            {{?}}
          </ul>
          {{? it.method.card }}
            <div class="fieldset tab-content active" id="tab-card">
              <input type="hidden" name="method" value="card">
              <p class="elem elem-name" style="border-radius: 4px 4px 0 0">
                <i>&#xe602;</i>
                <span class="help-text">Please fill out this field.</span>
                <input class="input" type="text" name="card[name]" placeholder="Card Holder\'s Name" required value="{{=it.prefill.name}}">
              </p>
              <p class="elem" id="elem-card">
                <span class="help-text">Please enter valid card number.</span>
                <input class="input" ignore-input type="tel" id="card_number" name="card[number]" placeholder="Card Number" required autocomplete="off">
                <i>&#xe605;</i>
                <span class="nocvv"><input type="checkbox" id="nocvv-check"> My card doesn\'t have expiry/CVV.</span>
              </p>
              <div class="double">
                <p class="elem elem-expiry" style="border-radius: 0 0 0 4px">
                  <i>&#xe606;</i>
                  <span class="help-text">Please enter valid card expiry.</span>
                  <input class="input" type="tel" id="card_expiry" name="card[expiry]" placeholder="MM / YY" required pattern="(0[1-9]|1[0-2]) \/ [0-9]{2}" maxlength="7">
                </p>
                <p class="elem elem-cvv" style="border-radius: 0 0 4px 0">
                  <i>&#xe604;</i>
                  <span class="help-text">Please enter valid cvv number.<br>It is 3 or 4 digit number at back of your card.</span>
                  <input class="input" type="password" id="card_cvv" inputmode="numeric" name="card[cvv]" placeholder="CVV" maxlength="4" required pattern="[0-9]*">
                </p>
                <div class="clear"></div>
              </div>
            </div>
          {{?}}
          {{? it.method.netbanking }}
            <div class="fieldset tab-content{{? !it.method.card }} active{{?}}" id="tab-netbanking">
              <input type="hidden" name="method" value="netbanking">
              {{? it.method.netbanking.error }}
                <div id="nb-na">
                  <div>{{=it.method.netbanking.error.description}}</div>
                </div>
              {{?}}
              <p id="nb-elem" class="elem select" style="border-radius: 4px">
                <i>&#xe601;</i>
                <select name="bank" required class="input" pattern="[\\w]+">
                  <option selected="selected" value="">Select Bank</option>
                  {{for(var i in it.method.netbanking){}}
                    <option value="{{=i}}">{{=it.method.netbanking[i]}}</option>
                  {{}}}
                </select>
              </p>
            </div>
          {{?}}
          {{? it.method.wallet }}
            <div class="fieldset tab-content{{? !it.method.card && !it.method.netbanking }} active{{?}}" id="tab-wallet">
              <input type="hidden" name="method" value="wallet">
              <input type="radio" name="wallet" value="paytm" id="paytm-radio" checked><label for="paytm-radio">Pay using Paytm wallet</label>
            </div>
          {{?}}
          <div class="footer">
            <button id="submitbtn" type="submit">
              <span class="ring"></span>
              <span class="text">
                <i>&#xe609;</i>
                <u>Pay</u>
                {{if(it.display_currency){}}
                  ${{=it.display_amount}}
                {{} else {}}
                   <i>&#xe600;</i>
                   <u>₹</u>
                   {{=it.amount/100}}
                {{}}}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
    <i id="powered-by"><a href="https://razorpay.com" target="_blank">&#xe608;</a></i>
  </div>
</div>'
