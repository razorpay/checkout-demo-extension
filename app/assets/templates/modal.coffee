$ = Razorpay::$
unless templates
  templates = {}
templates.modal = '
<div id="container" tabIndex="0">
  <div class="backdrop"></div>
  <div class="modal">
    <i id="powered-by"><a id="powered-link" href="https://razorpay.com" target="_blank">&#xe608;</a></i>
    <div class="modal-inner">
      <div class="modal-content">
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
                <li id="paytm-wrapper" data-target="tab-wallet"{{? !it.method.card && !it.method.netbanking }} class="active"{{?}}>
                  <img class="paytm-logo" width="40px" height="12px" onerror="this.parentNode.innerHTML=\'Paytm\'" src="data:image/gif;base64,R0lGODlhUAAYAJEDAOHh4cPDw5SUlP///yH5BAEAAAMALAAAAABQABgAAAL/nI+py80AnZy02gFCALf7n2QaBx7QiZJhGiHQiGjbKo4RauC5Pgj+DxSoDEGgKmA0IH+qmkz2gj5tU1KxOLwylcleFzOthsdhjhYYQJx9xG6wSR7F55v1T702u7/OMj0OYMdm8oTltXXoA0cW9VcWxAXUsLT11obo8kTSx1EGBgWJEZqjIUBZuYdJCEXK+gnzWicpOjtwetWZqqjgtDnVKgMse2cbGmiXi2YYoins69orKHCZl3g25CycFrsdLUh9TVvNDN0c+zwiuB20cbyVgcxr3qftbDdjbdUFH04O25vt3Bp8+cANaWTJHz563OzVWsBO3K4dJ25hOxcQoMCHQwqK3BKSI55CdBrqbSTGQNomkZnKufynadSCj8vcXdk20iRDbygX2NSyUgvBljBfLozJ0SeSpaZMwfE4lOjCGiSrFgAAOw=="/>
                  <img class="paytm-logo colored" width="40px" height="12px" src="data:image/gif;base64,R0lGODlhUAAYANUgAD/L9UJik+/y9oGWtzJVihM6dw++8+/7/mJ8pV/U9+Dl7dDY5M/y/S/H9JGjwCNHgZ/l+r/u/B/C9K/p+9/2/bC90lJvnKGwyW/Y+HGJrsLu/I/h+cDL23/c+AC68gQub////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAACAALAAAAABQABgAAAb/QJBwSCwaj8gkEiJhKJ/QqHQKgng8Hap2yy1ar9nuUMEpm8uLI/nMSRMFg7hb6JAXGZPE9ZqIHEAUERFOIBEdHRFDBxAdEH9CBR+Sk5MPHEWRlJIPFUMWkwUKQgigokITe6lXDRoGewkSqRITGK57YZq5BXMguZSdIAGUl73DQx2qqnrJzKpZvpoIRNCSBELCk8SaxCDIzR7L398U1JVEBOUCIA/GxdnH4uHizBvlk29xcZnv20L9QgcaNEvgbZ4Bgak6aKKzEMmAfv/+ESmIRQhFDxRAxNpjwAmAhA05NBTCAUGAk7kuoXvnThI3eLcspgIgcw/NbiApkRxJqtwl7WySgEmECabmlZsUkea8B6In0wv2PvykVCDASpYTExr1oNTmVoVRhVylNtXey69bux79GtVaS7IgHEQ9izNm3bV3ubK1l8EfJQsCFPQTMNYXXYphkqbdS42Aurfa2gkAatgI4sV51WKhVgDBY8h+sYJYUCHOp3ZZ7SrOzFiSEk0ORktcU0YuaqIVWetGPPJIrgD7XApREDylZa27Z7b+oISd2Z3pjqtWnvxWbyMPn4MQSU2a9KLV8fLWmYSwvcfcfTk+cjm83rwdrhaAcuGk/fsXhpjXFMDB5zu2NPBIQHtgIAQDthgwgRAUBHhAEAA7"/>
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
                  <input class="input" ignore-input type="tel" id="card_number" name="card[number]" placeholder="Card Number" required autocomplete="off" maxlength="19" value="{{=it.prefill.card.number}}">
                  <i>&#xe605;</i>
                  <label class="nocvv" for="nocvv-check"><input type="checkbox" id="nocvv-check"> My card doesn\'t have expiry or CVV</label>
                </p>
                <div class="double">
                  <p class="elem elem-expiry" style="border-radius: 0 0 0 4px">
                    <i>&#xe606;</i>
                    <span class="help-text">Please enter valid card expiry<br>in MM / YY format.</span>
                    <input class="input" type="tel" id="card_expiry" name="card[expiry]" placeholder="MM / YY" required pattern="(0[1-9]|1[0-2]) ?\/ ?[0-9]{2}" maxlength="7" value="{{if(it.prefill.card.expiry_month){}}{{=it.prefill.card.expiry_month}} / {{=it.prefill.card.expiry_year}}{{}}}">
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
                <div id="netb-banks">
                  <div class="netb-bank" data-value="HDFC"><div class="netb-inner">
                    <img src="data:image/gif;base64,R0lGODlhKAAoAKIAAL/S4+4xN/WDh+/0+PJaXwBMj////+0jKiH5BAAAAAAALAAAAAAoACgAAAOqeLrca9C4SauL0uqtMP+VB46MSJLmCaZqh71wHBGcbNv0du9vrvFAg88S5A1DxduRklTWYIWodBoFwJaTGHVbsPaeLy7Vi8FeoGIpeXbmpdXN27sat827ddl9jSP4/1pzfAYCf39ZaG+DZg2BildgGHuQOjAAl5iZlwOUP3lflZ9soaJCkaKMJaUQqQ+rphuGsn5ls4YBLaoQuSsRvB8sv0y+wp67xUTEIwkAOw=="/>
                    HDFC Bank
                  </div></div>
                  <div class="netb-bank" data-value="ICIC"><div class="netb-inner">
                    <img src="data:image/gif;base64,R0lGODlhKAAoAOZGAP/58evKy/ry8vzOk/qpQsRfZMJHLvqvUP7t1uGvsbUxL79SV9iVmPmjNbpFSueAKbU3PctVLfCPKPvCeP7z5PDX2PzIhvSWKNVkLOa8vsltcfu2Xc56frk4L850cNeUl/Xk5f3myd5yKtOHi+uHKfzUoMdOLf3arr5MSf/58r5ALv3gu9+EU9yipLo/PPXe1/rs5eCjlvTYytybl+qxle/FsMRZVvu8a+J5Kuq9sNlrK/7nyeOAN+Wee/3gvNyWifWcNeGopOuONvmdJ////7AqMP///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAAEYALAAAAAAoACgAAAf/gEaCg4SFhoICCR4oRY1FLh45h5OUgwEejpmZNi+VnoIBBZqjjhAVn5MwmJkQDAJEAgujKACohTUumgsVRL1EGaQztoIAPQqaECC+vcCjDsMALKQJy70cpEWnnwg8pBDVRCDYRUHbQsejBdWx4x+eCEDoowvLILLtlQANBuNFDAEBGEDoV8TdJAAHMBBcmMngoQkS+hVoESCDBoYxJpUYwo+UgwDVLhKUcYhCgwfYRryqxoCggVqGNnB0BhIckWv9WBw6MQSlpgIrwQkg2MGCIX1DTGjiYNNXAoIiEBgaMOSCJmpNe4nE1oHA0QZDRGQakbXX0H4PThjaOCRCpgAC+xg4KEKvWot+JhrAJERgyJAO/XgtE8X1wgBDCPwOIVjTbD8SXg1Z8EuCYLWn2EQMWXGob0/Ly7ZqwjBkQ0nFPrGpWzZwVIQhDSgcCqE44jimvgKQer15ElXF8kZh7dVSkw6/Eyj99qsUmzJfhBspwOH3QKXlnz1Wy6SCRPW9h7DPHEXWVwXppP0SAB9esd8LKkZlWKY7ggTFBKR6Yuv+gltHDlRDw32KHcDeJIm5VxsGBhjwQzXYbXAgJZ4p6B4F1figmFHDGMGThYrdYNMEE4TQ4SAHgOjXDlmdOAgFFbpnQVMuFgKATO4dkAI4NU4SwgQHEDDAjsv0OEggADs="/>
                    ICICI Bank
                  </div></div>
                  <div class="netb-bank" data-value="UTIB"><div class="netb-inner">
                    <img src="data:image/gif;base64,R0lGODlhKAAoAMQQAOvJ1vry9bM1Z7hDcfXk68JehtaTrvDX4eGuwsdrkNKGpMx5mr1Qe+a8zNuhuK4oXf///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAABAALAAAAAAoACgAAAXdICSOZGmeaKqubIsGgSunyjLf5PE8B44Xu4Jv1tjtEMNWYGB8DGJJlaG5M0RTBAF1R7ieEttdwlsChI0A8ohx3g3UEEfb2PMGtPMxWTHnknV9VmRAcwJQVwh9D0h2THNvZFN9aV4EikJkYH1dXmZ9CmqObQJ4bZArknMOqW0OK3d9kKJnhioLipRFnymeeSSEc3UmwG2cIpZ9mCWJgSZ8fYwjsI+H0qVnTySsZ9HLioIQyHPKJ2yFnMRnwie9bWO6czYrt5OzYbUrWX0MAP3+//3WqTgAsCAlOAivhAAAOw=="/>
                    Axis Bank
                  </div></div>
                  <div class="netb-bank" data-value="BARB_R"><div class="netb-inner">
                    <img src="data:image/gif;base64,R0lGODlhKAAoAMQQAPrBrvvWyfislPaYevzg1/eih/WObP718vm3ofvLvP3q5PNvRPR5UfJkNvWDX/FaKf///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAABAALAAAAAAoACgAAAX/ICSOZGmeaKqubOu+p+HMdG3PA0LAovL8wKBwuAgQBICAYgUYOp8/gELQeDQGyxh0G2wcIAoGEHGq/sxD9BMgIgQTpUDXueA+BCPxb1ESBOtCgFx4Ig5BJXoPhoFqUAEjiz8kB0EGQ4lCDGgNJIIPJE0/Do2RQg1qhBByQAwkA0CvQaNOpQ+tkEFsI4AzXbWimV8iCEG3bUAFQsmmsUAGwhChZzsjxA8LzQ8GjQ2WQAtwIgfLPwzUuA8IaAy17N+6IgCeBdAjZ9IN5OXesgEFm1hOJPghIBGVSvyGJInFgN6JZA1WPRiAyUA2J3AIAGoAL8+DArEW6CuAydSeNmjC4/X4QcCMtHQloVDzswdakwGhEOhpoJOOpx+PIFACAs+SgjoOaDZIENOdk6AQ0AwY0cCBnKV7AJDa5ogqEAfHArxKUIdBADUOCvw0NWKoKBEFKRVIZnadgF9DUr0sIIIBAJ1yBrTcI+DikwXQPFHjUxfnHgQ0fZ6ycs7aWxIECgBosuAvNwMGGGBqcE4iUIGdyX4zIABkI0XQzgYhc+IAAUPYACQoeLhj5B98UwQAQADAgNfOOgYY3fFEmGI1BAgIAO0AgJIBeRwIwL27dAGhAxXIwuL2jfM1WBPnwb69+/fwX4QAADs="/>
                    Bank of Baroda
                  </div></div>
                </div>
                <p id="nb-elem" class="elem select" style="border-radius: 4px">
                  <i>&#xe601;</i>
                  <select id="bank-select" name="bank" required class="input" pattern="[\\w]+">
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
    </div>
  </div>
</div>'
