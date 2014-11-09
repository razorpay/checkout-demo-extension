window.templates['modal'] = '<div class="rzp-container"> <div class = "rzp-modal ow-closed" id = "{{id}}"> <div class = "rzp-header"> <div class = "rzp-merchant_image"> <img src = "{{image}}"> </div> <div class = "rzp-merchant_powered"></div> <div class = "rzp-merchant_name"> {{name}} <br> {{description}} </div> <div class = "rzp-clear"></div> </div> <div class="rzp-tabs-container"> {{#if netbanking}} <ul class="rzp-tabs"> <li><a href="#rzp-tabs-cc">Card</a></li> <li><a href="#rzp-tabs-nb">Net Banking</a></li> </ul> {{/if}} <div id="rzp-tabs-cc"> <form class = "rzp-body" method = "POST"> <input type = "hidden" name = "amount" value = "${amount}"> <input type = "hidden" name = "currency" value = "INR"> {{#each udf}} <!-- udf fields provided by merchant --> <input type = "hidden" name = "udf[{{$index}}]" value = "{{$value}}"> {{/each}} <input type = "hidden" name = "card[expiry_month]"> <input type = "hidden" name = "card[expiry_year]"> <input name = "card[name]" placeholder = "Name" required value = "{{prefill.name}}"> <input name = "email" type = "email" placeholder = "Email Address" required value = "{{prefill.email}}"> <input name = "contact" type = "tel" placeholder = "Contact Number" required value = "{{prefill.contact}}"> <div class = "rzp-card"> <input name = "card[number]" class = "card_number" placeholder = "Card Number" required> <span class = "rzp-card_image"></span> <input name = "card[expiry]" size = "2" placeholder = "MM / YY" required> <input type = "password" name = "card[cvv]" size = "3" placeholder = "CVV" maxlength = "4" required> </div> <button class = "rzp-submit"> <span class = "rzp-ring"></span> <span class = "rzp-text">Pay ₹{{toRupee amount}}</span> </button> <ul class = "rzp-error_box"></ul> </form> </div> {{#if netbanking}} <div id="rzp-tabs-nb" class="rzp-padder-top"> <form class = "rzp-body" method = "POST"> <input type = "hidden" name = "amount" value = "{{amount}}"> <input type = "hidden" name = "currency" value = "INR"> {{#each udf}} <!-- udf fields provided by merchant --> <input type = "hidden" name = "udf[{{$index}}]" value = "{{$value}}"> {{/each}} <input type = "hidden" name = "method" value = "net banking"> <input name = "email" type = "email" placeholder = "Email Address" required value = "{{prefill.email}}"> <input name = "contact" type = "tel" placeholder = "Contact Number" required value = "{{prefill.contact}}"> <div class="rzp-select-style"> <select name = "bank" required> <option value="">Select Bank</option> <option value="ALLA">Allahabad Bank</option> <option value="CITI">Citi Bank</option> <option value="HDFC">HDFC Bank</option> <option value="IBKL">IDBI Bank</option> <option value="ICIC">ICICI Bank</option> <option value="KKBK">Kotak Mahindra Bank</option> <option value="PUNB">Punjab National Bank</option> <option value="SBIN">State Bank of India</option> </select> </div> <button class = "rzp-submit"> <span class = "rzp-ring"></span> <span class = "rzp-text">Pay ₹{{toRupee amount}}</span> </button> <ul class = "rzp-error_box"></ul> </form> </div> {{/if}} </div> </div> </div>';
