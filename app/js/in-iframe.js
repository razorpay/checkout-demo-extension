/* global handleMessage */
/* jshint -W027 */

(function(){
  'use strict';
  var Razorpay = window.Razorpay;
  var roll = Razorpay.roll || $.noop;
  var ua = navigator.userAgent;
  var $ = Razorpay.$;

  // iphone/ipad restrict non user initiated focus on input fields
  var should_focus_next = !/iPhone|iPad/.test(ua);

  // dont shake in mobile devices. handled by css, this is just for fallback.
  var should_shake = !/Android|iPhone/.test(ua);

  var logo_image_prefix = 'data:image/gif;base64,';
  var wallet_logos = {
    paytm: {
      h: '12',
      mono: logo_image_prefix + 'R0lGODlhUAAYAJEDAOHh4cPDw5SUlP///yH5BAEAAAMALAAAAABQABgAAAL/nI+py80AnZy02gFCALf7n2QaBx7QiZJhGiHQiGjbKo4RauC5Pgj+DxSoDEGgKmA0IH+qmkz2gj5tU1KxOLwylcleFzOthsdhjhYYQJx9xG6wSR7F55v1T702u7/OMj0OYMdm8oTltXXoA0cW9VcWxAXUsLT11obo8kTSx1EGBgWJEZqjIUBZuYdJCEXK+gnzWicpOjtwetWZqqjgtDnVKgMse2cbGmiXi2YYoins69orKHCZl3g25CycFrsdLUh9TVvNDN0c+zwiuB20cbyVgcxr3qftbDdjbdUFH04O25vt3Bp8+cANaWTJHz563OzVWsBO3K4dJ25hOxcQoMCHQwqK3BKSI55CdBrqbSTGQNomkZnKufynadSCj8vcXdk20iRDbygX2NSyUgvBljBfLozJ0SeSpaZMwfE4lOjCGiSrFgAAOw==',
      col: logo_image_prefix + 'R0lGODlhUAAYANUgAD/L9UJik+/y9oGWtzJVihM6dw++8+/7/mJ8pV/U9+Dl7dDY5M/y/S/H9JGjwCNHgZ/l+r/u/B/C9K/p+9/2/bC90lJvnKGwyW/Y+HGJrsLu/I/h+cDL23/c+AC68gQub////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAACAALAAAAABQABgAAAb/QJBwSCwaj8gkEiJhKJ/QqHQKgng8Hap2yy1ar9nuUMEpm8uLI/nMSRMFg7hb6JAXGZPE9ZqIHEAUERFOIBEdHRFDBxAdEH9CBR+Sk5MPHEWRlJIPFUMWkwUKQgigokITe6lXDRoGewkSqRITGK57YZq5BXMguZSdIAGUl73DQx2qqnrJzKpZvpoIRNCSBELCk8SaxCDIzR7L398U1JVEBOUCIA/GxdnH4uHizBvlk29xcZnv20L9QgcaNEvgbZ4Bgak6aKKzEMmAfv/+ESmIRQhFDxRAxNpjwAmAhA05NBTCAUGAk7kuoXvnThI3eLcspgIgcw/NbiApkRxJqtwl7WySgEmECabmlZsUkea8B6In0wv2PvykVCDASpYTExr1oNTmVoVRhVylNtXey69bux79GtVaS7IgHEQ9izNm3bV3ubK1l8EfJQsCFPQTMNYXXYphkqbdS42Aurfa2gkAatgI4sV51WKhVgDBY8h+sYJYUCHOp3ZZ7SrOzFiSEk0ORktcU0YuaqIVWetGPPJIrgD7XApREDylZa27Z7b+oISd2Z3pjqtWnvxWbyMPn4MQSU2a9KLV8fLWmYSwvcfcfTk+cjm83rwdrhaAcuGk/fsXhpjXFMDB5zu2NPBIQHtgIAQDthgwgRAUBHhAEAA7'
    },
    mobikwik: {
      h: '15.5',
      mono: logo_image_prefix + 'R0lGODlhbAAfAKIHAPT09Li4uKWlpcPDw+Hh4f///4iIiP///yH5BAEAAAcALAAAAABsAB8AAAP/eLrMMIO0Sau9OOttR/lABRBDIEhcqq6sAgBfER5jKRh4bsxt7/ue2OCmK+YEggDvx2w2agKY0Eg1EHADp7ZXM+kEsc/A6C0ebtmtenOt7sKFsQ4GIOYO2LX+0q4G4HE6QQV9BgJ4Bml7iwxyVVJhjgZhhYd5jJgHkkV/gI6DhF9tEiMomWqbc4CBOHCFEThIOYqnTqlYkVOJroJ9UWOHtVq3k0KdgWC8OSTLUUjCw1SgSVMEgIXMywGJE0MnFd5ZBONLmhC0GOEESAEUt5EGx0Or2HZH5Zo4pg1yWUT7jvalw9ImGD8jgwDgkGftmo4zRQbgy2cFHBJ/+hZ8SqEu/5a7IsnELBSS60MhiAIiXJAjsMI/BX3QpSj4UUdDGTmOQVoXwxeiNA+IpNSob93CGeuGvlS48ICJbwqGtHPBzts4j1GRpPwCbyQgJD2PICJlL1YIOduKSGiD0UodrGgXLIu6kCVNilYk3WTqlZKhsLFGQVxop52kJA/ZDiaQNooLrDEVpM121dCByI5CFkjbN8aNkDFHyXF8OceDWTBnKRY6Vy6OEJyDmbZrFjVeSHw7h/prcpacxQzSQrizIG2A1VR4CEdkmukh2oaITKWombNuoYAT/Sa+oE2AfgwKIifT/WgsLOCh2yT6pjcnv7GyM7OEo0FBluED57EDK6OCWcuvEfYaRZV9QZRmZcUTBlci6fPZYEsYBx57J+x3iR0z2HNIWXRZ4YttY+xERUibePBWfTe0s5xr2sVXgAJE9NcWCnwFI4lhOkyl3mkDlhBGggsx5kaOeUQGAGc8xvMCZ5XNWF5GuZGyHoF3SafJMYUMqaVt1q1HTDylcfPSAhgOZgCZ3EEXTB/MLLnlmw+xNyVL9kw13j41UjTdaOxVZlBjX8JpxAktPQABnuRcdugCpYQwDgHllEJKot1Byig5kob3KJCCGtESNHokAAA7',
      col: logo_image_prefix + 'R0lGODlhbAAfAKIHAJvl5ODt7UPS0L/w73/h4P///wDDwf///yH5BAEAAAcALAAAAABsAB8AAAP/eBfczgPIR4O6OOvNu/9gqBBFaWnDQAiCMYhwLM/cUJpHurZG77u0oHCYAdwKgJ9y2TsRn9CMjnUsEJjMQI8Q7QanPB/peFWulocW18sWlbFV609wC/cO27bek8QajFVvLjcDc3gGa3uKGIJLcXI9dISGPQCLlyN+gIE+NpM+AoWDKkaYbY0/j5CSn1uikXmmXqiVR5tlnq2IfQahSQKys0ysVmNyxCWvLm8ABIXAwVG0uQWIN1cBccoqPwAtlhm4HGVczQROB8XOMOSi0OFLxFfGK4/KAXaRG+L7eTwvF8IUYOdKnwZUubRYK3HO3o80cwAe7CGxCAtL/y68qQjC/5sAAO76zTnCwxg1kw8jVcwGDwiIjAd4cYwRcuKPbCbE2GP1ClgsfD9IZFr2A+CAixCBvLK0Q2KLdwo/skhhMKkAQcTCGDvSq5VPpcMGlsn3J4c/igp7KegDrRrFtVtw1XwTQBDOAsq2lvjlVZQNUM1AHRAkIZUoLv94vHNrAG6sf3L1yRwMimTQOJFaOWsy9sIrbm/T+QB5Vgk4BTwshIHmg7ILd0uHGjiibOENtpr7JK1IrvMFtoeTKnFSxtLwkJF7jda4xfJlrpmTdSpzqDEGd/wUwC6t5N12RJWKu6aqRGIZ2ku28uI5XW1rDGyzm+0VPAz5sgrE9HDLYv/42rL+UbYVEwNWtlcnT+2GQUniMUdfaeBshJohdkCTnHKxXGELHAx1F8FDari2WHv7lVAdaYgoOKFa81XSYor/+YCXDxYQUOAw3vgxRx5phXJUa2/4GEYA9YXWIheMGWBBkgAlB41igxnDi45UFuXYEi/Q4mKRLsn2QhgBvRcji2kFFgFZVer4zou9nIDLlOBwyRGUfSRSp4PkvfOGlmlisWYGRA6ADqApRANCAWj2mYWhmCQAADs='
    },
    payzapp: {
      h: '18.5',
      mono: logo_image_prefix + 'iVBORw0KGgoAAAANSUhEUgAAAHAAAAAlCAMAAACtfZ09AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAADNQTFRFpaWl+Pj48PDw0tLStLS0lpaWj4+P6enpnp6era2ty8vLvLy82tra4eHhw8PDiIiI////azBkpwAAABF0Uk5T/////////////////////wAlrZliAAADFElEQVR42rxW2XbrIAxkx5uA///aa7SAnKanSRtfHlrHSBpppMGY9sHlvPvRxnwKDLY11heifQLQHsVUXHA/YPYhVllruxXQQjGp6uXuA3R+X+rj2ts9gOd4pPpkJXsLoCsPa1RaWmv/YUqtVBvb64CS5GaFnaxKyWjo+6Nv0P9JoX2nSIF+2CDv7Ly5dg3VAQWmZpAnqyLhMDh8MvT2DBJ6TVbe4xYXS5ytVScyfgQEHDADZLm41EwAPRiQvhHnaPKeNF/qBIx6lsIMBYZZITKQE0yEXKKMg5UyLAUPHNkpzXM3ERDNkqSyzB+lb5uqD0FHNGAocDsBnlmkBc264wYic6M0v3VqONSBhOVAgEiH2wbgVbMHcUguuFlLTz5QXga9WAWg2xzJpjshaQvvA/BUJAbM1A7T11naWVNiFyMu/UcmQHzPEzMK7Jr32CEGNJQETovdSDTUd0NUOO6GHwSTC/SsUk9+aRTsYIxDF1iowNgEMGEsnzDrFacCsJP2jO0AQEb35PL85dhF5OnRnYLlOkcjKs13m00AszrxQE3smdmYlr1y0/izU5V2IpJmZlNpYrySGu4Omym8c8/qUI0GfePThnukXaLH59AkmBnnZpyaR3anzT6OA5hN6KE6IE+l9GIl2e9oTez2KKGUOAFxYorSPL5dycayx+ltx8RyqA5YNJPYu52PVz7+QTWE6wr61F6/NK1drhvmIjvzXPZNBlGLG7PHjmy6QKdPOESCy+c/cUgB5OrB2v63kKlolQtM/ciLM1hWBY6jfdps+mvl2EEABxmoT1Rxa9olMIVYKVBhqib8zj/YBH2h8hxSALfxgQiqJ9NlJkjBVhpLpzVvR8/MEF7RelM9M6tWmz42sFEEvbQZbCEWg/7Ol8EH2tgvM6NuHyYDLdf4AWdZ/p/zNwY64zu21Zp/tMFhmHeusfmXO804tcs7C34NCPW9Zdbih/B/s5YXgaIJ5YC/XxP9j0iLOQnMH7uXxpfI+9xF+FmBCcmzt9y8bbqSt39D3scAyyBvA/e+oN4HXF8k7/n6J8AAwRbn93osJ0UAAAAASUVORK5CYII=',
      col: logo_image_prefix + 'iVBORw0KGgoAAAANSUhEUgAAAHAAAAAlCAMAAACtfZ09AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAGNQTFRF7kBBgZm//u/vQWWfwMzf/N/f9p+g6yAi6RAS8WBh+8/Q7DAx71BR+K+w7/L39Y+Q3+Xv8nBx0NnnYX+vIkyPoLLPEj+HcYy3MVmXsL/XkKXHUXKn+b/A84CBAzN/6AED////uAlYJQAAACF0Uk5T//////////////////////////////////////////8An8HQIQAAA3VJREFUeNq8ltuC4iAMhpGW0qNVax3HBZv3f8olByjuzO44q04ubKGVjyR/UhQ80fRgvnxHPQvWVo1dOvgZoPOqXtDc64Gm2ndLtHsWewToxt4uuZnXAfXg1fKnNfAaYDs2dvnEav0SoBn9raUUegD4AZXqWnhW3w+MmxwhRqcF2G3YLjt6ccb7GUq8hOEWr4dw46ODFcCAHldSKWwVbsPIYDQM1PE/rYt34bXNNRoCdnRX8GzYwhQux21YKzrYRWc5Zn3KbNhAlfK8J2DCpO3aMPsrAa/BkzcBlngpmf8e3mrif110loE219J+VZZTEhUORoUXEfjxmrm4PQlwy8CJBsHBrOYlmwTUmXodrK1h8fhY3fQIQ8mUlQ9vDAyRPJ2JgeTLQQK7Omg4cFaWoqDB0DMQf4d2n4A1xjbZgMkEeMc1w5CA6OBUELDAcSGZdXnNB1iP3QAkaJ08d05UEYEt8sNKaDNgwGtgzZxBcnbBRDIQ5wtRDKis5tHBIQIVb4LUokdWBYW/UjxrRIZzCjAu+gZliOP1hPk804x4Lopxec1bXDUCa6oTV1NOMbA9GMqkDmsb54LE5qjHMMImfMo0M9NWGHi4inyy+sWad8QVoLnRTNYI/dppWPcpk4eVN6GDp60AgSdRMVVW84QyEbgWXniWKbbHwtesykL2PfJf5og7zhTFCSKwiL0g7byT6PYQganwOpcF3npqbQNXbewpPS+ADhdlWR4EMW02xxVIiqmymidS771lPZJmJDes2DBopZd6ybOYZY1H4YMIVUwawpR3bfUhaXBz3FBLXnbqk7KvJFPvPFVkwC03hEvetU3eAIjkbj7/tSwZgeK90xp/PZd9yauDtO0TfhuO1NSkma4ONtFBbIuWgFJ4qwtLuwLb9IEYYxWHaaz0I78xSQjJ05KeXDNd0He+Yclw+Nw6hJjq7Hs4Jqk1q3aJ8is5iOUZgdK2TV7z5O2wArv8+7+/Pc6pJkXGZksck2YmbnEJeKYOlHZH33mfQkhA/UEz2elDtY7NgNw4XCIURMkpPIS7Xbrb0pMdtHnNQ5tE3yYxrIfJWB4PnWnSGdF/x4b/Brrle9Yp71PhP+TgV6Z6Xznz8DFx+BJUq8YPTj/rXGr/Fbx9DN7zDsLVX4I3OvOSk7e29wXvaUB/Z/CeBuzvDN7n9luAAQCV1M8Wdd5JRwAAAABJRU5ErkJggg=='
    }
  }

  var frameDiscreet = {
    smarty: null,
    modal: null,
    $el: null,
    rzp: null,

    shake: function(){
      if(should_shake && frameDiscreet.modal){
        var el = $('modal-inner');
        if(el[0]){
          el.removeClass('shake')[0].offsetWidth;
          el.addClass('shake');
        }
      }
    },

    notifyBridge: function(message){
      var method, data;
      if(window.CheckoutBridge && message && message.event){
        method = 'on' + message.event;
        if(typeof window.CheckoutBridge[method] == 'function'){
          data = message.data;
          if(typeof data != 'string'){
            if(!data){
              return window.CheckoutBridge[method]();
            }
            data = JSON.stringify(data);
          }
          window.CheckoutBridge[method](data);
        }
      }
    },
    
    setMethods: function(payment_methods, opts){
      var i;
      var methodOptions = opts.method;

      if(!payment_methods.error){
        for(i in payment_methods){
          if(methodOptions[i] != false && payment_methods[i] != false){
            methodOptions[i] = payment_methods[i];
          }
        }
        var wallets = [];
        if(methodOptions.wallet && frameDiscreet.rzp.options.amount <= 100*10000){
          var printedWallets = payment_methods['wallet'];
          if(typeof printedWallets == 'object'){
            for(i in printedWallets){
              if(printedWallets[i]){
                var logos = wallet_logos[i];
                if(logos){
                  wallets.push({
                    'name': i,
                    'mono': logos.mono,
                    'col': logos.col,
                    'h': logos.h
                  });
                }
              }
            }
          }
        }
        methodOptions.wallet = wallets;
      } else {
        methodOptions.card = false;
        methodOptions.netbanking = {error: {description: payment_methods.error.description || "Payments not available right now."}};
      }
      if(methodOptions.netbanking !== false && typeof methodOptions.netbanking != 'object'){
        methodOptions.netbanking = {error: {description: "Netbanking not available right now."}}
      }
    },

    sanitizeDOM: function(obj){
      // directly appended tags
      var user_fields = ['name', 'description', 'amount', 'currency', 'display_amount'];
      for(var i = 0; i < user_fields.length; i++){
        obj[user_fields[i]] = obj[user_fields[i]].replace(/<[^>]*>?/g, "");
      }

      // attributes
      if(typeof obj.image == 'string'){
        obj.image = obj.image.replace(/"/g,'');
      }

      // prefills
      if(typeof obj.prefill == 'object'){
        for(var i in obj.prefill){
          if(typeof obj.prefill[i] == 'string'){
            obj.prefill[i] = obj.prefill[i].replace(/"/g,'');
          }
        }
      }

      // notes
      if(typeof obj.notes == 'object'){
        for(var i in obj.notes){
          if(typeof obj.notes[i] == 'string'){
            obj.notes[i] = obj.notes[i].replace(/"/g,'');
          }
        }
      }
    },

    sanitizeOptions: function(obj){ // warning: modifies original object
      if(obj){
        frameDiscreet.sanitizeDOM(obj);
        if(obj.prefill){
          if(obj.prefill.contact){
            if(typeof obj.prefill.contact != 'string'){
              obj.prefill.contact = obj.prefill.contact + '';
            }
            obj.prefill.contact = obj.prefill.contact.replace(/[^0-9+]/g,'');
          }
        }
      }
    },

    setNumberValidity: function(){
      $(this.parentNode)[Razorpay.card.validateNumber(this.value, this.getAttribute('cardtype')) ? 'removeClass' : 'addClass']('invalid');
    },

    setCardFormatting: function(){
      var $el_number = $('card_number');
      var el_expiry = $('card_expiry')[0];
      var el_cvv = $('card_cvv')[0];
      var el_contact = $('contact')[0];
      
      Razorpay.card.setType = function(el, type){
        !type && (type = Razorpay.card.getType(el.value) || 'unknown');
        el.parentNode.setAttribute('cardtype', type);
        frameDiscreet.setNumberValidity.call(el);
        
        // if(type != 'maestro'){
          // $('nocvv-check')[0].checked = false;
          // frameDiscreet.toggle_nocvv();
        // }
      }

      if(should_focus_next){
        Razorpay.card.filled = function(el){
          if(el == el_expiry)
            el_cvv.focus();
          else
            el_expiry.focus();
        }
      }
      
      $el_number.on('blur', frameDiscreet.setNumberValidity);
      Razorpay.card.formatNumber($el_number[0]);
      Razorpay.card.formatExpiry(el_expiry);
      Razorpay.card.ensureNumeric(el_cvv);
      Razorpay.card.ensureNumeric(el_contact);

      // if we're in webkit
      // we check el_expiry, as IE also returns browser unsupported attribute rules from getComputedStyle
      if(el_cvv && window.getComputedStyle && typeof getComputedStyle(el_expiry)['-webkit-text-security'] == 'string'){
        el_cvv.type = 'tel';
      }
    },

    showModal: function() {
      frameDiscreet.renew();
      
      if(frameDiscreet.modal){
        return frameDiscreet.modal.show();
      }

      var opts = $.clone(frameDiscreet.rzp.options);
      frameDiscreet.setMethods(window.payment_methods, opts);
      frameDiscreet.sanitizeOptions(opts);
      var div = document.createElement('div');
      div.innerHTML = Razorpay.templates.modal(opts);
      document.body.appendChild(div.firstChild);
      frameDiscreet.$el = $('container');
      frameDiscreet.smarty = new Smarty(frameDiscreet.$el);

      // init modal
      var modalOptions = opts.modal;
      modalOptions.onhide = function(){
        Razorpay.sendMessage({event: 'dismiss'});
      };
      modalOptions.onhidden = function(){
        Razorpay.sendMessage({event: 'hidden'});
      };
      delete modalOptions.ondismiss;

      frameDiscreet.applyFont($('powered-link')[0]);
      frameDiscreet.modal = new Modal(frameDiscreet.$el.children('modal')[0], modalOptions);
      if($('nb-na')[0]) $('nb-elem').css('display', 'none');

      // event listeners
      // $('nocvv-check').on('change', frameDiscreet.toggle_nocvv)
      $('tabs').on('click', frameDiscreet.tab_change);
      $('form').on('submit', function(e){
        frameDiscreet.formSubmit(e);
        e.preventDefault();
      });

      $('bank-select').on('change', frameDiscreet.bank_change);

      $('netb-banks').on('click', function(e){
        var target = e.target;
        if(!target.className)
          target = target.parentNode;
        if(target.className.indexOf('netb-inner') != -1){
          var value = target.getAttribute('data-value');
          var select = $('bank-select')[0];
          select.value = value;
          frameDiscreet.smarty.input({target: select});
          frameDiscreet.bank_change(value);
        }
      });

      if(frameDiscreet.qpmap){
        var lis = $(tabs)[0].getElementsByTagName('li');
        for(var i=0; i<lis.length; i++){
          if(lis[i].getAttribute('data-target') == 'tab-' + frameDiscreet.qpmap.tab){
            frameDiscreet.tab_change({target: lis[i]});
            break;
          }
        }
        if(frameDiscreet.qpmap.error){
          frameDiscreet.errorHandler(qpmap)
        }
      }
      frameDiscreet.setCardFormatting();
    },

    bank_change: function(val){
      if(typeof val !== 'string')
        val = this.value;
      var inners = $('netb-banks').find('netb-inner');
      for(var i = 0; i < inners.length; i++){
        var inner = $(inners[i]);
        inner[inner.attr('data-value') === val ? 'addClass' : 'removeClass']('active')
      }
    },

    tab_change: function(e){
      var target = e.target;
      
      if(target.nodeName == 'IMG') target = target.parentNode;
      
      if(target.nodeName != 'LI' || target.className.indexOf('active') >= 0)
        return;

      frameDiscreet.renew();

      var tabContent = $(target.getAttribute('data-target'));
      var activeTab = tabContent.parent().children('active')[0];
      activeTab && $(activeTab).removeClass('active');
      tabContent.addClass('active');

      activeTab = $(target.parentNode).children('active')[0];
      activeTab && $(activeTab).removeClass('active');
      $(target).addClass('active');
    },

    // toggle_nocvv: function(){
    //   var checked = this.checked;
    //   for(var i in {card_expiry: 0, card_cvv: 0}){
    //     var el = $(i).removeClass('invalid')[0];
    //     el.value = '';
    //     el.disabled = checked;
    //     el.required = !checked;
    //   }
    // },

    applyFont: function(anchor, retryCount){
      if(!retryCount) retryCount = 0;
      if(anchor.offsetWidth/anchor.offsetHeight > 5) frameDiscreet.$el.addClass('font-loaded');
      else if(retryCount < 25) setTimeout(function(){
        frameDiscreet.applyFont(anchor, ++retryCount);
      }, 120 + retryCount*50);
    },

    /* sets focus on invalid input and returns true, if any. */
    isInvalid: function(parent){
      var invalids = $(parent).find('invalid', 'p');
      if(invalids.length){
        frameDiscreet.shake();
        $(invalids[0]).find('input')[0].focus();
        for(var i=0; i<invalids.length; i++) $(invalids[i]).addClass('mature');
        return true;
      }
    },

    formSubmit: function(e) {
      frameDiscreet.smarty.refresh();

      if (frameDiscreet.isInvalid('form-common')){
        return;
      }

      // var card_number = $('card_number')[0];
      // card_number && frameDiscreet.setNumberValidity.call(card_number);

      var activeTab = $('tabs').find('active')[0];
      if (activeTab && frameDiscreet.isInvalid(activeTab.getAttribute('data-target')))
        return;
      var data = frameDiscreet.getFormData();

      // Signature is set in case of hosted checkout
      if (frameDiscreet.rzp.options.signature !== '')
        data.signature = frameDiscreet.rzp.options.signature;

      Razorpay.sendMessage({
        event: 'submit',
        data: data
      });
      frameDiscreet.renew();
      $('submitbtn').attr('disabled', true);
      if(frameDiscreet.modal)
        frameDiscreet.modal.options.backdropClose = false;
      Razorpay.payment.authorize({
        data: data,
        options: frameDiscreet.rzp.options,
        error: frameDiscreet.errorHandler,
        success: frameDiscreet.successHandler
      })
    },

    getFormFields: function(container, returnObj){
      var allels = $(container)[0].getElementsByTagName('*');
      var len = allels.length;
      for(var i=0; i<len; i++){
        var el = allels[i];
        if(el.getAttribute('type') === 'radio' && !el.checked)
          continue;
        if(el.name && !el.disabled && el.value.length)
          returnObj[el.name] = el.value;
      }
    },

    getFormData: function() {
      var activeTab = $('tabs').find('active')[0];
      if(!activeTab) return;
      
      var data = {};
      frameDiscreet.getFormFields('form-common', data);
      
      var targetTab = activeTab.getAttribute('data-target');
      frameDiscreet.getFormFields(targetTab, data);

      if(targetTab == 'tab-card'){
        data['card[number]'] = data['card[number]'].replace(/\ /g, '');
        
        // if(!data['card[expiry]'])
        //   data['card[expiry]'] = '';

        // if(!data['card[cvv]'])
        //   data['card[cvv]'] = '';

        var expiry = data['card[expiry]'].replace(/[^0-9\/]/g, '').split('/');
        data['card[expiry_month]'] = expiry[0];
        data['card[expiry_year]'] = expiry[1];
        delete data['card[expiry]'];
      }
      return data;
    },

    // close on backdrop click and remove errors
    renew: function(){
      if (frameDiscreet.$el)
        $('error-container').css('display', 'none').removeClass('has-error').css('paddingTop', '');

      if(frameDiscreet.modal)
        frameDiscreet.modal.options.backdropClose = true;
    },

    hide: function(){
      if(frameDiscreet.modal){
        $('modal-inner').removeClass('shake');
        frameDiscreet.modal.hide();
      }
      frameDiscreet.modal = null;
    },

    successHandler: function(response){
      if(frameDiscreet.modal)
        frameDiscreet.modal.options.onhide = null;
      Razorpay.sendMessage({ event: 'success', data: response});
      frameDiscreet.hide();
    },

    errorHandler: function(response){
      if(!frameDiscreet.modal){
        return;
      }
      var message;
      frameDiscreet.shake();

      $('submitbtn')[0].removeAttribute('disabled');
      frameDiscreet.modal && (frameDiscreet.modal.options.backdropClose = true);

      if (response && response.error){
        message = response.error.description;

      var err_field = response.error.field;
        if (err_field){
          if(!err_field.indexOf('expiry'))
            err_field = 'card[expiry]';
          var error_el = document.getElementsByName(err_field);
          if (error_el.length){
            $(error_el[0].parentNode).addClass('invalid');
            error_el[0].focus();
          }
        }
      }

      if (!message){
        message = 'There was an error in handling your request';
      }

      var error_message = $('error-message')[0];
      error_message.innerHTML = message;
      $('error-container').css('display', 'block').addClass('has-error').css('paddingTop', error_message.offsetHeight + 'px');
    },

    dataHandler: function(data){
      if(!('method' in data))
        return;

      frameDiscreet.tab_change({target: $('method-' + data.method + '-tab')[0]});

      if('contact' in data) $('contact')[0].value = data.contact;
      if('email' in data) $('email')[0].value = data.email;

      if(data.method === 'card'){
        if('card[name]' in data) $('card_name')[0].value = data['card[name]'];
        if('card[number]' in data) $('card_number')[0].value = data['card[number]'];
        if(('card[expiry_month]' in data) && ('card[expiry_year]' in data))
          $('card_expiry')[0].value = data['card[expiry_month]'] + ' / ' + data['card[expiry_year]'];
        frameDiscreet.setCardFormatting();
        $('card_cvv')[0].focus();
      } else if(data.method == 'netbanking'){
        $('bank-select')[0].value = data.bank;
      }
      frameDiscreet.smarty.refresh();
    },

    configureRollbar: function(message){
      if(window.Rollbar){
        Rollbar.configure({
          payload: {
            person: {
              id: message.options.key
            },
            context: message.context
          }
        });
        if('sdk_version' in window){
          roll(null, 'sdk_version='+sdk_version, 'info');
        }
      }
    },
    setQueryParams: function(search){
      var params = search.replace(/^\?/,'').split('&');
      for(var i=0; i < params.length; i++){
        var split = params[i].split('=', 2);
        if(split[0].indexOf('.') != -1){
          var dotsplit = split[0].split('.', 2);
          if(!qpmap[dotsplit[0]]){
            qpmap[dotsplit[0]] = {};
          }
          qpmap[dotsplit[0]][dotsplit[1]] = decodeURIComponent(split[1]);
        } else {
          qpmap[split[0]] = decodeURIComponent(split[1]);
        }
      }
    },
    parseMessage: function(e){ // not concerned about adding/removeing listeners, iframe is razorpay's fiefdom
      if(!e || !e.data)
        return;
      var data;
      if(typeof e.data == 'string'){
        try{
          data = JSON.parse(e.data);
        } catch(e){
          return;
        }
      } else {
        data = e.data;
      }
      window.handleMessage(data);
    }
  }

  Razorpay.sendMessage = function(message){
    if(typeof window.CheckoutBridge == 'object'){
      frameDiscreet.notifyBridge(message);
    } else if(window != window.parent){
      message.source = 'frame';
      if(typeof message != 'string'){
        message = JSON.stringify(message);
      }
      window.parent.postMessage(message, '*');
    }
  }

  window.handleMessage = function(message){
    if(typeof message != 'object'){
      return;
    }
    if(message.options && !frameDiscreet.rzp){ // open modal
      try{
        frameDiscreet.rzp = new Razorpay(message.options);
        frameDiscreet.configureRollbar(message);
      } catch(e){
        Razorpay.sendMessage({event: 'fault', data: e.message});
        roll('fault ' + e.message, message);
        return;
      }
      frameDiscreet.showModal();
    } else if(message.event == 'close'){
      frameDiscreet.hide();
    } else if(message.event == 'open' && frameDiscreet.rzp){
      frameDiscreet.showModal();
    }
    if(frameDiscreet.rzp){
      var params = message.params;
      if(params){
        try{
          frameDiscreet.errorHandler(JSON.parse(params));
        } catch(e){
          roll('message.params', params);
        }
      }
      var data = message.data;
      if(data){
        if(typeof data === 'string'){
          try{
            data = JSON.parse(data);
          } catch(e){
            roll('message.data', data);
          }
        }
        if(typeof data == 'object')
          frameDiscreet.dataHandler(data);
      }
    }
  }

  $(window).on('message', frameDiscreet.parseMessage);



  // initial error (helps in case of redirection flow)
  var qpmap = frameDiscreet.qpmap = {};
  if(location.search){
    frameDiscreet.setQueryParams(location.search);
  }

  if(qpmap.platform === 'ios'){
    window.CheckoutBridge = {
      map: {},
      get: function(index){
        var val = this.map[index];
        delete this.map[index];
        return val;
      }
    };
    var dataIndex = 0;
    var iOSMethod = function(method){
      return function(data){
        var iF = document.createElement('iframe');
        var src = 'razorpay://on'+method;
        if(data){
          src += '?' + dataIndex;
          CheckoutBridge.map[dataIndex] = data;
          dataIndex++;
        }
        iF.setAttribute('src', src);
        document.documentElement.appendChild(iF);
        iF.parentNode.removeChild(iF);
        iF = null;
      }
    }
    var bridgeMethods = ['load','dismiss','submit','fault','success'];
    bridgeMethods.forEach(function(prop){
      CheckoutBridge['on'+prop] = iOSMethod(prop)
    })
  }
  Razorpay.sendMessage({event: 'load'});
  //ENV_TEST window.frameDiscreet = frameDiscreet;
})();