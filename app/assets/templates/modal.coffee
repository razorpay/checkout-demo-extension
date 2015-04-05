Razorpay.templates.modal = '
<div class="rzp-container" tabIndex="0" style="display: none">
  <div class="rzp-modal">
    <div class="rzp-modal-inner">
      <div class="rzp-tooltip"></div>
      <div class="rzp-header">
        <div class="rzp-merchant">
          <div class="rzp-modal-close"></div>
          <div class="rzp-merchant-image">
            {{if(it.image){}}
              <img src="{{=it.image}}">
            {{}}}
          </div>
          <div class="rzp-merchant-name">
            <div class="rzp-merchant-title">{{=it.name}}</div>
            <div class="rzp-merchant-desc">{{=it.description}}</div>
          </div>
          <a class="rzp-merchant-powered" href="https://razorpay.com" target="_blank"></a>
        </div>
      </div>
      <div class="rzp-body">
        <form class="rzp-form" method="POST" novalidate onsubmit="return false">
          <div class="rzp-form-common">
            <input class="rzp-input" type="hidden" name="amount" value="{{=it.amount}}">
            <input class="rzp-input" type="hidden" name="currency" value="{{=it.currency}}">
            <input class="rzp-input" type="hidden" name="description" value="{{=it.description}}">
            {{for(note in it.notes){}}
              <!-- udf fields provided by merchant -->
              <input class="rzp-input" type="hidden" name="notes[{{=note}}]" value="{{=it.notes[note]}}">
            {{}}}

            <input class="rzp-input" type="hidden" name="card[expiry_month]">
            <input class="rzp-input" type="hidden" name="card[expiry_year]">

            <div class="rzp-fieldset">
              <div class="rzp-elem rzp-elem-email" style="border-radius: 4px 4px 0 0">
                <div class="rzp-elem-inner">
                  <input class="rzp-input" name="email" type="email" placeholder="Email Address" required value="{{=it.prefill.email}}" pattern="^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$">
                </div>
              </div>
              <div class="rzp-elem rzp-elem-contact" style="border-radius: 0 0 4px 4px">
                <div class="rzp-elem-inner">
                  <input class="rzp-input" name="contact" type="tel" placeholder="Contact Number" required value="{{=it.prefill.contact}}" data-chars="[0-9]" pattern="[0-9]{10,12}">
                </div>
              </div>
            </div>
          </div>
          {{if(it.netbanking){}}
            <ul class="rzp-tabs">
              <li data-target="rzp-tab-cc" class="rzp-active">Card</li>
              <li data-target="rzp-tab-nb">Net Banking</li>
            </ul>
            <div class="rzp-fieldset rzp-tab-content" id="rzp-tab-nb">
              <div class="rzp-elem rzp-select" style="border-radius: 4px">
                <div class="rzp-elem-inner">
                  <select name="bank" required class="rzp-input" pattern="[\\w]+">
                    <option selected="selected" value="">Select Bank</option>
                    <option value="CITI">Citi Bank</option>
                    <option value="HDFC">HDFC Bank</option>
                    <option value="IBKL">IDBI Bank</option>
                    <option value="ICIC">ICICI Bank</option>
                    <option value="KKBK">Kotak Mahindra Bank</option>
                    <option value="SBIN">State Bank of India</option>
                  </select>
                </div>
              </div>
            </div>
          {{}}}
          <div class="rzp-fieldset rzp-tab-content rzp-active" id="rzp-tab-cc">
            <div class="rzp-elem rzp-elem-name" style="border-radius: 4px 4px 0 0">
              <div class="rzp-elem-inner">
                <input class="rzp-input" name="card[name]" placeholder="Card Holder\'s Name" required value="{{=it.prefill.name}}" pattern=".{1,100}">
              </div>
            </div>
            <div class="rzp-elem rzp-elem-card">
              <div class="rzp-elem-inner">
                <input class="rzp-input" type="tel" name="card[number]" class="card_number" placeholder="Card Number" required autocomplete="off">
              </div>
            </div>
            <div class="rzp-double">
              <div class="rzp-elem rzp-elem-expiry" style="border-radius: 0 0 0 4px">
                <div class="rzp-elem-inner">
                  <input class="rzp-input" type="tel" name="card[expiry]" placeholder="MM / YY" required pattern="(0[1-9]|1[0-2]) \/ [0-9]{2}" maxlength="7">
                </div>
              </div>
              <div class="rzp-elem rzp-elem-cvv" style="border-radius: 0 0 4px 0">
                <div class="rzp-elem-inner">
                  <input class="rzp-input" type="password" inputmode="numeric" name="card[cvv]" placeholder="CVV" maxlength="4" required pattern="[0-9]*">
                </div>
              </div>
            </div>
          </div>
          <div class="rzp-error"></div>
          <div class="rzp-footer rzp-clear">
            <button class="rzp-submit" type="submit">
              <span class="rzp-ring"></span>
              <span class="rzp-text">Pay <span class="rzp-rupee-icon"></span>{{=it.amount/100}}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</div>'
