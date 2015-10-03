$ = Razorpay.$
unless templates
  templates = {}
templates.modal = '
<div id="container" tabIndex="0">
  <div class="backdrop"></div>
  <div class="modal">
    <i id="powered-by"><a id="powered-link" href="https://razorpay.com" target="_blank">&#xe608;</a></i>
    <div id="modal-inner" class="modal-inner">
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
                  <input class="input" name="email" type="email" id="email" placeholder="Email Address" required value="{{=it.prefill.email}}" pattern="^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(\\.[a-zA-Z0-9-]+)+$">
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
                <li id="method-card-tab" data-target="tab-card" class="active">Card</li>
              {{?}}
              {{? it.method.netbanking }}
                <li id="method-netbanking-tab" data-target="tab-netbanking"{{? !it.method.card}} class="active"{{?}}>Net Banking</li>
              {{?}}
              {{? it.method.wallet }}
                {{ var wallet_name, wallet_mono, wallet_col, wallet_h; }}
                <li id="method-wallet-tab" data-target="tab-wallet"{{? !it.method.card && !it.method.netbanking }} class="active"{{?}}>Wallets
                  {{ if(it.method.wallet.paytm){
                      wallet_h = "12px";
                      wallet_name = "paytm";
                      wallet_mono = "R0lGODlhUAAYAJEDAOHh4cPDw5SUlP///yH5BAEAAAMALAAAAABQABgAAAL/nI+py80AnZy02gFCALf7n2QaBx7QiZJhGiHQiGjbKo4RauC5Pgj+DxSoDEGgKmA0IH+qmkz2gj5tU1KxOLwylcleFzOthsdhjhYYQJx9xG6wSR7F55v1T702u7/OMj0OYMdm8oTltXXoA0cW9VcWxAXUsLT11obo8kTSx1EGBgWJEZqjIUBZuYdJCEXK+gnzWicpOjtwetWZqqjgtDnVKgMse2cbGmiXi2YYoins69orKHCZl3g25CycFrsdLUh9TVvNDN0c+zwiuB20cbyVgcxr3qftbDdjbdUFH04O25vt3Bp8+cANaWTJHz563OzVWsBO3K4dJ25hOxcQoMCHQwqK3BKSI55CdBrqbSTGQNomkZnKufynadSCj8vcXdk20iRDbygX2NSyUgvBljBfLozJ0SeSpaZMwfE4lOjCGiSrFgAAOw==";
                      wallet_col = "R0lGODlhUAAYANUgAD/L9UJik+/y9oGWtzJVihM6dw++8+/7/mJ8pV/U9+Dl7dDY5M/y/S/H9JGjwCNHgZ/l+r/u/B/C9K/p+9/2/bC90lJvnKGwyW/Y+HGJrsLu/I/h+cDL23/c+AC68gQub////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAACAALAAAAABQABgAAAb/QJBwSCwaj8gkEiJhKJ/QqHQKgng8Hap2yy1ar9nuUMEpm8uLI/nMSRMFg7hb6JAXGZPE9ZqIHEAUERFOIBEdHRFDBxAdEH9CBR+Sk5MPHEWRlJIPFUMWkwUKQgigokITe6lXDRoGewkSqRITGK57YZq5BXMguZSdIAGUl73DQx2qqnrJzKpZvpoIRNCSBELCk8SaxCDIzR7L398U1JVEBOUCIA/GxdnH4uHizBvlk29xcZnv20L9QgcaNEvgbZ4Bgak6aKKzEMmAfv/+ESmIRQhFDxRAxNpjwAmAhA05NBTCAUGAk7kuoXvnThI3eLcspgIgcw/NbiApkRxJqtwl7WySgEmECabmlZsUkea8B6In0wv2PvykVCDASpYTExr1oNTmVoVRhVylNtXey69bux79GtVaS7IgHEQ9izNm3bV3ubK1l8EfJQsCFPQTMNYXXYphkqbdS42Aurfa2gkAatgI4sV51WKhVgDBY8h+sYJYUCHOp3ZZ7SrOzFiSEk0ORktcU0YuaqIVWetGPPJIrgD7XApREDylZa27Z7b+oISd2Z3pjqtWnvxWbyMPn4MQSU2a9KLV8fLWmYSwvcfcfTk+cjm83rwdrhaAcuGk/fsXhpjXFMDB5zu2NPBIQHtgIAQDthgwgRAUBHhAEAA7";
                    } else if(it.method.wallet.mobikwik){
                      wallet_h = "15.5px";
                      wallet_name = "mobikwik";
                      wallet_mono = "R0lGODlhbAAfAKIHAPT09Li4uKWlpcPDw+Hh4f///4iIiP///yH5BAEAAAcALAAAAABsAB8AAAP/eLrMMIO0Sau9OOttR/lABRBDIEhcqq6sAgBfER5jKRh4bsxt7/ue2OCmK+YEggDvx2w2agKY0Eg1EHADp7ZXM+kEsc/A6C0ebtmtenOt7sKFsQ4GIOYO2LX+0q4G4HE6QQV9BgJ4Bml7iwxyVVJhjgZhhYd5jJgHkkV/gI6DhF9tEiMomWqbc4CBOHCFEThIOYqnTqlYkVOJroJ9UWOHtVq3k0KdgWC8OSTLUUjCw1SgSVMEgIXMywGJE0MnFd5ZBONLmhC0GOEESAEUt5EGx0Or2HZH5Zo4pg1yWUT7jvalw9ImGD8jgwDgkGftmo4zRQbgy2cFHBJ/+hZ8SqEu/5a7IsnELBSS60MhiAIiXJAjsMI/BX3QpSj4UUdDGTmOQVoXwxeiNA+IpNSob93CGeuGvlS48ICJbwqGtHPBzts4j1GRpPwCbyQgJD2PICJlL1YIOduKSGiD0UodrGgXLIu6kCVNilYk3WTqlZKhsLFGQVxop52kJA/ZDiaQNooLrDEVpM121dCByI5CFkjbN8aNkDFHyXF8OceDWTBnKRY6Vy6OEJyDmbZrFjVeSHw7h/prcpacxQzSQrizIG2A1VR4CEdkmukh2oaITKWombNuoYAT/Sa+oE2AfgwKIifT/WgsLOCh2yT6pjcnv7GyM7OEo0FBluED57EDK6OCWcuvEfYaRZV9QZRmZcUTBlci6fPZYEsYBx57J+x3iR0z2HNIWXRZ4YttY+xERUibePBWfTe0s5xr2sVXgAJE9NcWCnwFI4lhOkyl3mkDlhBGggsx5kaOeUQGAGc8xvMCZ5XNWF5GuZGyHoF3SafJMYUMqaVt1q1HTDylcfPSAhgOZgCZ3EEXTB/MLLnlmw+xNyVL9kw13j41UjTdaOxVZlBjX8JpxAktPQABnuRcdugCpYQwDgHllEJKot1Byig5kob3KJCCGtESNHokAAA7";
                      wallet_col = "R0lGODlhbAAfAKIHAJvl5ODt7UPS0L/w73/h4P///wDDwf///yH5BAEAAAcALAAAAABsAB8AAAP/eBfczgPIR4O6OOvNu/9gqBBFaWnDQAiCMYhwLM/cUJpHurZG77u0oHCYAdwKgJ9y2TsRn9CMjnUsEJjMQI8Q7QanPB/peFWulocW18sWlbFV609wC/cO27bek8QajFVvLjcDc3gGa3uKGIJLcXI9dISGPQCLlyN+gIE+NpM+AoWDKkaYbY0/j5CSn1uikXmmXqiVR5tlnq2IfQahSQKys0ysVmNyxCWvLm8ABIXAwVG0uQWIN1cBccoqPwAtlhm4HGVczQROB8XOMOSi0OFLxFfGK4/KAXaRG+L7eTwvF8IUYOdKnwZUubRYK3HO3o80cwAe7CGxCAtL/y68qQjC/5sAAO76zTnCwxg1kw8jVcwGDwiIjAd4cYwRcuKPbCbE2GP1ClgsfD9IZFr2A+CAixCBvLK0Q2KLdwo/skhhMKkAQcTCGDvSq5VPpcMGlsn3J4c/igp7KegDrRrFtVtw1XwTQBDOAsq2lvjlVZQNUM1AHRAkIZUoLv94vHNrAG6sf3L1yRwMimTQOJFaOWsy9sIrbm/T+QB5Vgk4BTwshIHmg7ILd0uHGjiibOENtpr7JK1IrvMFtoeTKnFSxtLwkJF7jda4xfJlrpmTdSpzqDEGd/wUwC6t5N12RJWKu6aqRGIZ2ku28uI5XW1rDGyzm+0VPAz5sgrE9HDLYv/42rL+UbYVEwNWtlcnT+2GQUniMUdfaeBshJohdkCTnHKxXGELHAx1F8FDari2WHv7lVAdaYgoOKFa81XSYor/+YCXDxYQUOAw3vgxRx5phXJUa2/4GEYA9YXWIheMGWBBkgAlB41igxnDi45UFuXYEi/Q4mKRLsn2QhgBvRcji2kFFgFZVer4zou9nIDLlOBwyRGUfSRSp4PkvfOGlmlisWYGRA6ADqApRANCAWj2mYWhmCQAADs=";
                    }
                  }}
                  <img class="wallet-logo" height="{{=wallet_h}}" onerror="this.parentNode.innerHTML=\'{{=wallet_name}}\'" src="data:image/gif;base64,{{=wallet_mono}}"/>
                  <img class="wallet-logo colored" height="{{=wallet_h}}" src="data:image/gif;base64,{{=wallet_col}}"/>
                </li>
              {{?}}
            </ul>
            {{? it.method.card }}
              <div class="fieldset tab-content active" id="tab-card">
                <input type="hidden" name="method" value="card">
                <p class="elem elem-name" style="border-radius: 4px 4px 0 0">
                  <i>&#xe602;</i>
                  <span class="help-text">Please fill out this field.</span>
                  <input class="input" type="text" id="card_name" name="card[name]" placeholder="Card Holder\'s Name" required value="{{=it.prefill.name}}">
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
                  <div class="netb-bank"><div class="netb-inner" data-value="SBIN">
                    <img src="data:image/gif;base64,R0lGODlhKAAoAMQQAPD2/EGI2sTa86fI7m2k4l6b3+Lt+dPk9nyt5SR21Hut5cXb9Jm/61CS3f///xVt0f///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAABAALAAAAAAoACgAAAXyICSO5GgMRPCsbEAMRinPslCweL4WAu2PgoZumGv0fiUAgsjMIQBIEUDVrK4C0N8hYe0+EgcfgOvtJrJJarmLlS3XZURJAIcfRcJ6uQHU20U3fmUFEAaCcCeHayiKZSlwCgsLCnBqXgcOmQ4HjUwKmpqUnToLoJkLo6SmDqipOJ+moq4smJqca5ZdDJkMlQRwDZl5jgPAwnAwxg7DXjGBXsHLa4QQdHvHZXfMVdHbTXx90NhddyJvVt1ecmld6VZtMmPo40xnPlvc9ENgSFPf+jng9Tunw92QJ1FIBBliEIeRhDNsFNHHA+KPE4/SuYCRMAQAOw=="/>
                    SBI
                  </div></div>
                  <div class="netb-bank"><div class="netb-inner" data-value="HDFC">
                    <img src="data:image/gif;base64,R0lGODlhKAAoAKIAAL/S4+4xN/WDh+/0+PJaXwBMj////+0jKiH5BAAAAAAALAAAAAAoACgAAAOqeLrca9C4SauL0uqtMP+VB46MSJLmCaZqh71wHBGcbNv0du9vrvFAg88S5A1DxduRklTWYIWodBoFwJaTGHVbsPaeLy7Vi8FeoGIpeXbmpdXN27sat827ddl9jSP4/1pzfAYCf39ZaG+DZg2BildgGHuQOjAAl5iZlwOUP3lflZ9soaJCkaKMJaUQqQ+rphuGsn5ls4YBLaoQuSsRvB8sv0y+wp67xUTEIwkAOw=="/>
                    HDFC
                  </div></div>
                  <div class="netb-bank"><div class="netb-inner" data-value="ICIC">
                    <img src="data:image/gif;base64,R0lGODlhKAAoAOZGAP/58evKy/ry8vzOk/qpQsRfZMJHLvqvUP7t1uGvsbUxL79SV9iVmPmjNbpFSueAKbU3PctVLfCPKPvCeP7z5PDX2PzIhvSWKNVkLOa8vsltcfu2Xc56frk4L850cNeUl/Xk5f3myd5yKtOHi+uHKfzUoMdOLf3arr5MSf/58r5ALv3gu9+EU9yipLo/PPXe1/rs5eCjlvTYytybl+qxle/FsMRZVvu8a+J5Kuq9sNlrK/7nyeOAN+Wee/3gvNyWifWcNeGopOuONvmdJ////7AqMP///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAAEYALAAAAAAoACgAAAf/gEaCg4SFhoICCR4oRY1FLh45h5OUgwEejpmZNi+VnoIBBZqjjhAVn5MwmJkQDAJEAgujKACohTUumgsVRL1EGaQztoIAPQqaECC+vcCjDsMALKQJy70cpEWnnwg8pBDVRCDYRUHbQsejBdWx4x+eCEDoowvLILLtlQANBuNFDAEBGEDoV8TdJAAHMBBcmMngoQkS+hVoESCDBoYxJpUYwo+UgwDVLhKUcYhCgwfYRryqxoCggVqGNnB0BhIckWv9WBw6MQSlpgIrwQkg2MGCIX1DTGjiYNNXAoIiEBgaMOSCJmpNe4nE1oHA0QZDRGQakbXX0H4PThjaOCRCpgAC+xg4KEKvWot+JhrAJERgyJAO/XgtE8X1wgBDCPwOIVjTbD8SXg1Z8EuCYLWn2EQMWXGob0/Ly7ZqwjBkQ0nFPrGpWzZwVIQhDSgcCqE44jimvgKQer15ElXF8kZh7dVSkw6/Eyj99qsUmzJfhBspwOH3QKXlnz1Wy6SCRPW9h7DPHEXWVwXppP0SAB9esd8LKkZlWKY7ggTFBKR6Yuv+gltHDlRDw32KHcDeJIm5VxsGBhjwQzXYbXAgJZ4p6B4F1figmFHDGMGThYrdYNMEE4TQ4SAHgOjXDlmdOAgFFbpnQVMuFgKATO4dkAI4NU4SwgQHEDDAjsv0OEggADs="/>
                    ICICI
                  </div></div>
                  <div class="netb-bank"><div class="netb-inner" data-value="UTIB">
                    <img src="data:image/gif;base64,R0lGODlhKAAoAMQQAOvJ1vry9bM1Z7hDcfXk68JehtaTrvDX4eGuwsdrkNKGpMx5mr1Qe+a8zNuhuK4oXf///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAABAALAAAAAAoACgAAAXdICSOZGmeaKqubIsGgSunyjLf5PE8B44Xu4Jv1tjtEMNWYGB8DGJJlaG5M0RTBAF1R7ieEttdwlsChI0A8ohx3g3UEEfb2PMGtPMxWTHnknV9VmRAcwJQVwh9D0h2THNvZFN9aV4EikJkYH1dXmZ9CmqObQJ4bZArknMOqW0OK3d9kKJnhioLipRFnymeeSSEc3UmwG2cIpZ9mCWJgSZ8fYwjsI+H0qVnTySsZ9HLioIQyHPKJ2yFnMRnwie9bWO6czYrt5OzYbUrWX0MAP3+//3WqTgAsCAlOAivhAAAOw=="/>
                    AXIS
                  </div></div>
                  <div class="netb-bank"><div class="netb-inner" data-value="PUNB_R">
                    <img src="data:image/gif;base64,R0lGODlhKAAoAKIHAP/56P3oqP7vxf3TXvzLP/3dhPu8Cf///yH5BAEAAAcALAAAAAAoACgAAAP5eLrc/pCJSSmI+ATCey9GKIZEFoHjCKSjYD4oaxyEbBSvE7PHPpYNQKDAKQR0tpkgyQD4SMfFU3RY2RaAWnIgZR682aQI1/NqeWWxyDUNKc6pqvqXlr2vbZvTyxzMW3kKTHBzBYFfeoRqhnw2An5/IY9mNgEBkSFWVzQ2A5pzA0tekDJ7f2FeeVykSUNqCqKVAKwslnMLiiM4GyyeeSMLl2IEAQACQ0bGuXa4fwOGBQPLmwrCmNduDL/YzAy03GIP3+DdDdvkEQLT6Bi8mBxeGQHjI88XhznH0IYCF9rxOV7gC2hiIEEMBg9CSKgQCbWGCwFCdLDBg4cEADs="/>
                    PNB
                  </div></div>
                  <div class="netb-bank"><div class="netb-inner" data-value="BARB_R">
                    <img src="data:image/gif;base64,R0lGODlhKAAoAMQQAPrBrvvWyfislPaYevzg1/eih/WObP718vm3ofvLvP3q5PNvRPR5UfJkNvWDX/FaKf///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAABAALAAAAAAoACgAAAX/ICSOZGmeaKqubOu+p+HMdG3PA0LAovL8wKBwuAgQBICAYgUYOp8/gELQeDQGyxh0G2wcIAoGEHGq/sxD9BMgIgQTpUDXueA+BCPxb1ESBOtCgFx4Ig5BJXoPhoFqUAEjiz8kB0EGQ4lCDGgNJIIPJE0/Do2RQg1qhBByQAwkA0CvQaNOpQ+tkEFsI4AzXbWimV8iCEG3bUAFQsmmsUAGwhChZzsjxA8LzQ8GjQ2WQAtwIgfLPwzUuA8IaAy17N+6IgCeBdAjZ9IN5OXesgEFm1hOJPghIBGVSvyGJInFgN6JZA1WPRiAyUA2J3AIAGoAL8+DArEW6CuAydSeNmjC4/X4QcCMtHQloVDzswdakwGhEOhpoJOOpx+PIFACAs+SgjoOaDZIENOdk6AQ0AwY0cCBnKV7AJDa5ogqEAfHArxKUIdBADUOCvw0NWKoKBEFKRVIZnadgF9DUr0sIIIBAJ1yBrTcI+DikwXQPFHjUxfnHgQ0fZ6ycs7aWxIECgBosuAvNwMGGGBqcE4iUIGdyX4zIABkI0XQzgYhc+IAAUPYACQoeLhj5B98UwQAQADAgNfOOgYY3fFEmGI1BAgIAO0AgJIBeRwIwL27dAGhAxXIwuL2jfM1WBPnwb69+/fwX4QAADs="/>
                    BOB
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
                <input type="radio" name="wallet" value="{{=wallet_name}}" id="wallet-radio" checked><label for="wallet-radio">Pay using {{=(wallet_name[0].toUpperCase()+wallet_name.slice(1))}} wallet</label>
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
