Razorpay.templates.modal = '
<div class="rzp-container" tabIndex="0">
  <div class="rzp-modal">
    <div class="rzp-tooltip"></div>
    <div class="rzp-modal-inner">
      <div class="rzp-header">
        <div class="rzp-merchant rzp-clear">
          <div class="rzp-merchant_image">
            <img src="{{=it.image}}">
          </div>
          <div class="rzp-merchant_powered"></div>
          <div class="rzp-merchant_name">
            {{=it.name}}
            <br>
            {{=it.description}}
          </div>
        </div>
        {{if(it.netbanking){}}
          <ul class="rzp-tabs">
            <li data-target="rzp-tabs-cc" class="active">Card</li>
            <li data-target="rzp-tabs-nb">Net Banking</li>
          </ul>
        {{}}}
      </div>
      <div class="rzp-body">
        <div id="rzp-tabs-cc" class="rzp-tab-content active">
          <form class="rzp-form" method="POST" novalidate>
            <input class="rzp-input" type="hidden" name="amount" value="{{=it.amount}}">
            <input class="rzp-input" type="hidden" name="currency" value="{{=it.currency}}">
            {{for(udfkey in it.udf){}}
              <!-- udf fields provided by merchant -->
              <input class="rzp-input" type="hidden" name="udf[{{=udfkey}}]" value="{{=it.udf[udfkey]}}">
            {{}}}

            <input class="rzp-input" type="hidden" name="card[expiry_month]">
            <input class="rzp-input" type="hidden" name="card[expiry_year]">

            <div class="rzp-fieldset">
              <div class="rzp-elem rzp-elem-name" style="border-radius: 4px 4px 0 0"><div class="rzp-elem-inner">
                <input class="rzp-input" name="card[name]" placeholder="Name" required value="{{=it.prefill.name}}" pattern=".{1,100}">
              </div></div>
              <div class="rzp-elem rzp-elem-email"><div class="rzp-elem-inner">
                <input class="rzp-input" name="email" type="email" placeholder="Email Address" required value="{{=it.prefill.email}}" pattern="^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$">
              </div></div>
              <div class="rzp-elem rzp-elem-contact" style="border-radius: 0 0 4px 4px"><div class="rzp-elem-inner">
                <input class="rzp-input" name="contact" type="tel" placeholder="Contact Number" required value="{{=it.prefill.contact}}" data-chars="[0-9]" pattern="[0-9]{10,12}">
              </div></div>
            </div>
            <div class="rzp-fieldset">
              <div class="rzp-elem rzp-elem-card" style="border-radius: 4px 4px 0 0"><div class="rzp-elem-inner">
                <input class="rzp-input" name="card[number]" class="card_number" placeholder="Card Number" required autocomplete="off">
              </div></div>
              <div class="rzp-double">
                <div class="rzp-elem rzp-elem-expiry" style="border-radius: 0 0 0 4px"><div class="rzp-elem-inner">
                  <input class="rzp-input" name="card[expiry]" placeholder="MM / YY" required pattern="(0[1-9]|1[0-2]) \/ [0-9]{2}" maxlength="7">
                </div></div>
                <div class="rzp-elem rzp-elem-cvv" style="border-radius: 0 0 4px 0"><div class="rzp-elem-inner">
                  <input class="rzp-input" type="password" name="card[cvv]" placeholder="CVV" maxlength="4" required>
                </div></div>
              </div>
            </div>
            <div class="rzp-error"></div>
            <div class="rzp-footer rzp-clear">
              <button class="rzp-submit" type="submit">
                <span class="rzp-ring"></span>
                <span class="rzp-text">Pay ₹{{=it.amount/100}}</span>
              </button>
            </div>
          </form>
        </div>
        {{if(it.netbanking){}}
          <div id="rzp-tabs-nb" class="rzp-tab-content rzp-padder-top">
            <form class="rzp-form" method="POST" novalidate>
              <input class="rzp-input" type="hidden" name="amount" value="{{=it.amount}}">
              <input class="rzp-input" type="hidden" name="currency" value="{{=it.currency}}">
              {{for(udfkey in it.udf){}}
                <!-- udf fields provided by merchant -->
                <input class="rzp-input" type="hidden" name="udf[{{=udfkey}}]" value="{{=it.udf[udfkey]}}">
              {{}}}
              <input class="rzp-input" type="hidden" name="method" value="net banking">

              <div class="rzp-fieldset">
                <div class="rzp-elem rzp-elem-name" style="border-radius: 4px 4px 0 0"><div class="rzp-elem-inner">
                  <input class="rzp-input" name="email" type="email" placeholder="Email Address" required value="{{=it.prefill.email}}" pattern="^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$">
                </div></div>
                <div class="rzp-elem rzp-elem-contact" style="border-radius: 0 0 4px 4px"><div class="rzp-elem-inner">
                  <input class="rzp-input" name="contact" type="tel" placeholder="Contact Number" required value="{{=it.prefill.contact}}" data-chars="[0-9]" pattern="[0-9]{10,12}">
                </div></div>
              </div>
              <div class="rzp-fieldset">
                <div class="rzp-elem" style="border-radius: 4px"><div class="rzp-elem-inner">
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
              <div class="rzp-error"></div>
              <div class="rzp-footer rzp-clear">
                <button class="rzp-submit" type="submit">
                  <span class="rzp-ring"></span>
                  <span class="rzp-text">Pay ₹{{=it.amount/100}}</span>
                </button>
              </div>
            </form>
          </div>
        {{}}}
      </div>
    </div>
  </div>
</div>'
