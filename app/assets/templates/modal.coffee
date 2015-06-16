$ = Razorpay::$
unless templates
  templates = {}
templates.modal = '
<div class="container" tabIndex="0" style="display: none">
  <div class="modal">
    <div class="modal-inner">
      <div class="header">
        <div class="merchant">
          <div class="modal-close"></div>
          <div class="merchant-image">
            {{if(it.image){}}
              <img src="{{=it.image}}">
            {{}}}
          </div>
          <div class="merchant-name">
            <div class="merchant-title">{{=it.name}}</div>
            <div class="merchant-desc">{{=it.description}}</div>
          </div>
          <a class="merchant-powered" href="https://razorpay.com" target="_blank"></a>
        </div>
      </div>
      <div class="body">
        <form class="form" method="POST" novalidate autocomplete="off" onsubmit="return false">
          <div class="form-common">
            <div class="error-container">
              <div class="error"></div>
            </div>
            <input type="hidden" name="amount" value="{{=it.amount}}">
            <input type="hidden" name="currency" value="{{=it.currency}}">
            <input type="hidden" name="description" value="{{=it.description}}">
            {{for(note in it.notes){}}
              <!-- udf fields provided by merchant -->
              <input type="hidden" name="notes[{{=note}}]" value="{{=it.notes[note]}}">
            {{}}}

            <input type="hidden" name="card[expiry_month]">
            <input type="hidden" name="card[expiry_year]">

            <div class="fieldset">
              <div class="elem elem-email" style="border-radius: 4px 4px 0 0">
                <div class="elem-inner">
                  <input class="input" name="email" type="email" placeholder="Email Address" required value="{{=it.prefill.email}}" pattern="^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(\\.[a-zA-Z0-9-]+)+$">
                </div>
              </div>
              <div class="elem elem-contact" style="border-radius: 0 0 4px 4px">
                <div class="elem-inner">
                  <input class="input" name="contact" type="tel" placeholder="Contact Number" required value="{{=it.prefill.contact}}" data-chars="[0-9]" pattern="[0-9]{10,12}">
                </div>
              </div>
            </div>
          </div>
          {{if(it.method.netbanking && it.method.card){}}
            <ul class="tabs">
              <li data-target="tab-card" class="active">Card</li>
              <li data-target="tab-netbanking">Net Banking</li>
            </ul>
            <div class="fieldset tab-content" id="tab-netbanking">
          {{} else if(!it.method.card){}}
            <div class="fieldset tab-content active" id="tab-netbanking">
          {{}}}
          {{if(it.method.netbanking){}}
              <input type="hidden" name="method" value="netbanking">
              {{if(it.method.netbanking.error){}}
                <div class="nb-na">
                  <div>{{=it.method.netbanking.error.description}}</div>
                </div>
              {{}}}
              <div class="elem select" style="border-radius: 4px">
                <div class="elem-inner">
                  <select name="bank" required class="input" pattern="[\\w]+">
                    <option selected="selected" value="">Select Bank</option>
                    {{for(var i in it.method.netbanking){}}
                      <option value="{{=i}}">{{=it.method.netbanking[i]}}</option>
                    {{}}}
                  </select>
                </div>
              </div>
            </div>
          {{}}}
          {{if(it.method.card){}}
            <div class="fieldset tab-content active" id="tab-card">
              <input type="hidden" name="method" value="card">
              <div class="elem elem-name" style="border-radius: 4px 4px 0 0">
                <div class="elem-inner">
                  <input class="input" type="text" name="card[name]" placeholder="Card Holder\'s Name" required value="{{=it.prefill.name}}">
                </div>
              </div>
              <div class="elem elem-card">
                <div class="elem-inner">
                  <input class="input" type="tel" name="card[number]" class="card_number" placeholder="Card Number" required autocomplete="off">
                </div>
              </div>
              <div class="double">
                <div class="elem elem-expiry" style="border-radius: 0 0 0 4px">
                  <div class="elem-inner">
                    <input class="input" type="tel" name="card[expiry]" placeholder="MM / YY" required pattern="(0[1-9]|1[0-2]) \/ [0-9]{2}" maxlength="7">
                  </div>
                </div>
                <div class="elem elem-cvv" style="border-radius: 0 0 4px 0">
                  <div class="elem-inner">
                    <input class="input" type="password" inputmode="numeric" name="card[cvv]" placeholder="CVV" maxlength="4" required pattern="[0-9]*">
                  </div>
                </div>
              </div>
            </div>
          {{}}}
          <div class="footer">
            <button class="submit" type="submit">
              <span class="ring"></span>
              <span class="text">
                Pay
                {{if(it.display_currency){}}
                  ${{=it.display_amount}}
                {{} else {}}
                  <span class="rupee-icon"></span>
                  {{=it.amount/100}}
                {{}}}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</div>'
