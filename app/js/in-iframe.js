if(isCriOS){
  // remove old onComplete cookie
  deleteCookie('onComplete');
}
var CheckoutBridge = window.CheckoutBridge;
// flag for checkout-frame.js
discreet.isFrame = true;
window.onComplete = onComplete;
// initial error (helps in case of redirection flow)
var qpmap = {};

// iphone/ipad restrict non user initiated focus on input fields
var shouldFocusNextField = !/iPhone|iPad/.test(ua);

// dont shake in mobile devices. handled by css, this is just for fallback.
var shouldShakeOnError = !/Android|iPhone/.test(ua);

var gifBase64Prefix = 'data:image/gif;base64,';
var freqBanks = {
  SBIN: {
    image: 'R0lGODlhKAAoAMQQAPD2/EGI2sTa86fI7m2k4l6b3+Lt+dPk9nyt5SR21Hut5cXb9Jm/61CS3f///xVt0f///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAABAALAAAAAAoACgAAAXyICSO5GgMRPCsbEAMRinPslCweL4WAu2PgoZumGv0fiUAgsjMIQBIEUDVrK4C0N8hYe0+EgcfgOvtJrJJarmLlS3XZURJAIcfRcJ6uQHU20U3fmUFEAaCcCeHayiKZSlwCgsLCnBqXgcOmQ4HjUwKmpqUnToLoJkLo6SmDqipOJ+moq4smJqca5ZdDJkMlQRwDZl5jgPAwnAwxg7DXjGBXsHLa4QQdHvHZXfMVdHbTXx90NhddyJvVt1ecmld6VZtMmPo40xnPlvc9ENgSFPf+jng9Tunw92QJ1FIBBliEIeRhDNsFNHHA+KPE4/SuYCRMAQAOw==',
    title: 'SBI'
  },
  ICIC: {
    image: 'R0lGODlhKAAoAOZGAP/58evKy/ry8vzOk/qpQsRfZMJHLvqvUP7t1uGvsbUxL79SV9iVmPmjNbpFSueAKbU3PctVLfCPKPvCeP7z5PDX2PzIhvSWKNVkLOa8vsltcfu2Xc56frk4L850cNeUl/Xk5f3myd5yKtOHi+uHKfzUoMdOLf3arr5MSf/58r5ALv3gu9+EU9yipLo/PPXe1/rs5eCjlvTYytybl+qxle/FsMRZVvu8a+J5Kuq9sNlrK/7nyeOAN+Wee/3gvNyWifWcNeGopOuONvmdJ////7AqMP///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAAEYALAAAAAAoACgAAAf/gEaCg4SFhoICCR4oRY1FLh45h5OUgwEejpmZNi+VnoIBBZqjjhAVn5MwmJkQDAJEAgujKACohTUumgsVRL1EGaQztoIAPQqaECC+vcCjDsMALKQJy70cpEWnnwg8pBDVRCDYRUHbQsejBdWx4x+eCEDoowvLILLtlQANBuNFDAEBGEDoV8TdJAAHMBBcmMngoQkS+hVoESCDBoYxJpUYwo+UgwDVLhKUcYhCgwfYRryqxoCggVqGNnB0BhIckWv9WBw6MQSlpgIrwQkg2MGCIX1DTGjiYNNXAoIiEBgaMOSCJmpNe4nE1oHA0QZDRGQakbXX0H4PThjaOCRCpgAC+xg4KEKvWot+JhrAJERgyJAO/XgtE8X1wgBDCPwOIVjTbD8SXg1Z8EuCYLWn2EQMWXGob0/Ly7ZqwjBkQ0nFPrGpWzZwVIQhDSgcCqE44jimvgKQer15ElXF8kZh7dVSkw6/Eyj99qsUmzJfhBspwOH3QKXlnz1Wy6SCRPW9h7DPHEXWVwXppP0SAB9esd8LKkZlWKY7ggTFBKR6Yuv+gltHDlRDw32KHcDeJIm5VxsGBhjwQzXYbXAgJZ4p6B4F1figmFHDGMGThYrdYNMEE4TQ4SAHgOjXDlmdOAgFFbpnQVMuFgKATO4dkAI4NU4SwgQHEDDAjsv0OEggADs=',
    title: 'ICICI'
  },
  HDFC: {
    image: 'R0lGODlhKAAoAKIAAL/S4+4xN/WDh+/0+PJaXwBMj////+0jKiH5BAAAAAAALAAAAAAoACgAAAOqeLrca9C4SauL0uqtMP+VB46MSJLmCaZqh71wHBGcbNv0du9vrvFAg88S5A1DxduRklTWYIWodBoFwJaTGHVbsPaeLy7Vi8FeoGIpeXbmpdXN27sat827ddl9jSP4/1pzfAYCf39ZaG+DZg2BildgGHuQOjAAl5iZlwOUP3lflZ9soaJCkaKMJaUQqQ+rphuGsn5ls4YBLaoQuSsRvB8sv0y+wp67xUTEIwkAOw==',
    title: 'HDFC'
  },
  UTIB: {
    image: 'R0lGODlhKAAoAMQQAOvJ1vry9bM1Z7hDcfXk68JehtaTrvDX4eGuwsdrkNKGpMx5mr1Qe+a8zNuhuK4oXf///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAABAALAAAAAAoACgAAAXdICSOZGmeaKqubIsGgSunyjLf5PE8B44Xu4Jv1tjtEMNWYGB8DGJJlaG5M0RTBAF1R7ieEttdwlsChI0A8ohx3g3UEEfb2PMGtPMxWTHnknV9VmRAcwJQVwh9D0h2THNvZFN9aV4EikJkYH1dXmZ9CmqObQJ4bZArknMOqW0OK3d9kKJnhioLipRFnymeeSSEc3UmwG2cIpZ9mCWJgSZ8fYwjsI+H0qVnTySsZ9HLioIQyHPKJ2yFnMRnwie9bWO6czYrt5OzYbUrWX0MAP3+//3WqTgAsCAlOAivhAAAOw==',
    title: 'AXIS'
  },
  PUNB_R: {
    image: 'R0lGODlhKAAoAKIHAP/56P3oqP7vxf3TXvzLP/3dhPu8Cf///yH5BAEAAAcALAAAAAAoACgAAAP5eLrc/pCJSSmI+ATCey9GKIZEFoHjCKSjYD4oaxyEbBSvE7PHPpYNQKDAKQR0tpkgyQD4SMfFU3RY2RaAWnIgZR682aQI1/NqeWWxyDUNKc6pqvqXlr2vbZvTyxzMW3kKTHBzBYFfeoRqhnw2An5/IY9mNgEBkSFWVzQ2A5pzA0tekDJ7f2FeeVykSUNqCqKVAKwslnMLiiM4GyyeeSMLl2IEAQACQ0bGuXa4fwOGBQPLmwrCmNduDL/YzAy03GIP3+DdDdvkEQLT6Bi8mBxeGQHjI88XhznH0IYCF9rxOV7gC2hiIEEMBg9CSKgQCbWGCwFCdLDBg4cEADs=',
    title: 'PNB'
  },
  BARB_R: {
    image: 'R0lGODlhKAAoAMQQAPrBrvvWyfislPaYevzg1/eih/WObP718vm3ofvLvP3q5PNvRPR5UfJkNvWDX/FaKf///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAABAALAAAAAAoACgAAAX/ICSOZGmeaKqubOu+p+HMdG3PA0LAovL8wKBwuAgQBICAYgUYOp8/gELQeDQGyxh0G2wcIAoGEHGq/sxD9BMgIgQTpUDXueA+BCPxb1ESBOtCgFx4Ig5BJXoPhoFqUAEjiz8kB0EGQ4lCDGgNJIIPJE0/Do2RQg1qhBByQAwkA0CvQaNOpQ+tkEFsI4AzXbWimV8iCEG3bUAFQsmmsUAGwhChZzsjxA8LzQ8GjQ2WQAtwIgfLPwzUuA8IaAy17N+6IgCeBdAjZ9IN5OXesgEFm1hOJPghIBGVSvyGJInFgN6JZA1WPRiAyUA2J3AIAGoAL8+DArEW6CuAydSeNmjC4/X4QcCMtHQloVDzswdakwGhEOhpoJOOpx+PIFACAs+SgjoOaDZIENOdk6AQ0AwY0cCBnKV7AJDa5ogqEAfHArxKUIdBADUOCvw0NWKoKBEFKRVIZnadgF9DUr0sIIIBAJ1yBrTcI+DikwXQPFHjUxfnHgQ0fZ6ycs7aWxIECgBosuAvNwMGGGBqcE4iUIGdyX4zIABkI0XQzgYhc+IAAUPYACQoeLhj5B98UwQAQADAgNfOOgYY3fFEmGI1BAgIAO0AgJIBeRwIwL27dAGhAxXIwuL2jfM1WBPnwb69+/fwX4QAADs=',
    title: 'BOB'
  }
};

var freqWallets = {
  paytm: {
    h: '16',
    col: gifBase64Prefix + 'R0lGODlhUAAYANUgAD/L9UJik+/y9oGWtzJVihM6dw++8+/7/mJ8pV/U9+Dl7dDY5M/y/S/H9JGjwCNHgZ/l+r/u/B/C9K/p+9/2/bC90lJvnKGwyW/Y+HGJrsLu/I/h+cDL23/c+AC68gQub////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAACAALAAAAABQABgAAAb/QJBwSCwaj8gkEiJhKJ/QqHQKgng8Hap2yy1ar9nuUMEpm8uLI/nMSRMFg7hb6JAXGZPE9ZqIHEAUERFOIBEdHRFDBxAdEH9CBR+Sk5MPHEWRlJIPFUMWkwUKQgigokITe6lXDRoGewkSqRITGK57YZq5BXMguZSdIAGUl73DQx2qqnrJzKpZvpoIRNCSBELCk8SaxCDIzR7L398U1JVEBOUCIA/GxdnH4uHizBvlk29xcZnv20L9QgcaNEvgbZ4Bgak6aKKzEMmAfv/+ESmIRQhFDxRAxNpjwAmAhA05NBTCAUGAk7kuoXvnThI3eLcspgIgcw/NbiApkRxJqtwl7WySgEmECabmlZsUkea8B6In0wv2PvykVCDASpYTExr1oNTmVoVRhVylNtXey69bux79GtVaS7IgHEQ9izNm3bV3ubK1l8EfJQsCFPQTMNYXXYphkqbdS42Aurfa2gkAatgI4sV51WKhVgDBY8h+sYJYUCHOp3ZZ7SrOzFiSEk0ORktcU0YuaqIVWetGPPJIrgD7XApREDylZa27Z7b+oISd2Z3pjqtWnvxWbyMPn4MQSU2a9KLV8fLWmYSwvcfcfTk+cjm83rwdrhaAcuGk/fsXhpjXFMDB5zu2NPBIQHtgIAQDthgwgRAUBHhAEAA7'
  },
  mobikwik: {
    h: '19',
    col: gifBase64Prefix + 'R0lGODlhbAAfAKIHAJvl5ODt7UPS0L/w73/h4P///wDDwf///yH5BAEAAAcALAAAAABsAB8AAAP/eBfczgPIR4O6OOvNu/9gqBBFaWnDQAiCMYhwLM/cUJpHurZG77u0oHCYAdwKgJ9y2TsRn9CMjnUsEJjMQI8Q7QanPB/peFWulocW18sWlbFV609wC/cO27bek8QajFVvLjcDc3gGa3uKGIJLcXI9dISGPQCLlyN+gIE+NpM+AoWDKkaYbY0/j5CSn1uikXmmXqiVR5tlnq2IfQahSQKys0ysVmNyxCWvLm8ABIXAwVG0uQWIN1cBccoqPwAtlhm4HGVczQROB8XOMOSi0OFLxFfGK4/KAXaRG+L7eTwvF8IUYOdKnwZUubRYK3HO3o80cwAe7CGxCAtL/y68qQjC/5sAAO76zTnCwxg1kw8jVcwGDwiIjAd4cYwRcuKPbCbE2GP1ClgsfD9IZFr2A+CAixCBvLK0Q2KLdwo/skhhMKkAQcTCGDvSq5VPpcMGlsn3J4c/igp7KegDrRrFtVtw1XwTQBDOAsq2lvjlVZQNUM1AHRAkIZUoLv94vHNrAG6sf3L1yRwMimTQOJFaOWsy9sIrbm/T+QB5Vgk4BTwshIHmg7ILd0uHGjiibOENtpr7JK1IrvMFtoeTKnFSxtLwkJF7jda4xfJlrpmTdSpzqDEGd/wUwC6t5N12RJWKu6aqRGIZ2ku28uI5XW1rDGyzm+0VPAz5sgrE9HDLYv/42rL+UbYVEwNWtlcnT+2GQUniMUdfaeBshJohdkCTnHKxXGELHAx1F8FDari2WHv7lVAdaYgoOKFa81XSYor/+YCXDxYQUOAw3vgxRx5phXJUa2/4GEYA9YXWIheMGWBBkgAlB41igxnDi45UFuXYEi/Q4mKRLsn2QhgBvRcji2kFFgFZVer4zou9nIDLlOBwyRGUfSRSp4PkvfOGlmlisWYGRA6ADqApRANCAWj2mYWhmCQAADs='
  },
  payzapp: {
    h: '24',
    col: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHAAAAAlCAMAAACtfZ09AAAAY1BMVEXuQEGBmb/+7+9BZZ/AzN/839/2n6DrICLpEBLxYGH7z9DsMDHvUFH4r7Dv8vf1j5Df5e/ycHHQ2edhf68iTI+gss8SP4dxjLcxWZewv9eQpcdRcqf5v8DzgIEDM3/oAQP///+4CVglAAAAIXRSTlP//////////////////////////////////////////wCfwdAhAAADRUlEQVR4Ab2Ue3PiOBDEZflh/DAG8whhpXV//095jKYlqyp1x20C239ESE755+6ZkcELZacaz/QyYN907Trg7wCdN7tV5N4PrJvjsEYZvBfo5rFdc9XvA9rJmzWJ6vAeYD93ubGknX0LsJ49RaUSelDv7VK7I6+1/x8YP3JGTKcHDoXqfoDoIr8vqGQBsJd1AeBXqgEmcdxwUlSNBVBzM9cKtCvVu5WyQPE7SgCH8KvU0wNweiznPVBHgwPNcjbGVNkGaNaoYwAmTPrcFsCv30kL8EFgJUul/E8A3Uo5miWwzXvpuCY5w1Q0jEYWNvh5AxbYXwncK/AUNkCdZp4GCbRrxkglE448NtsdwXfM4JuXjwCUJK+3wBDyfWGwm8Fag2v5qhAaplGB8nfqjwm4k2yTJikm8CnvBBCAYvBUBmAp+/AnL0anKY5GOAxt4HPn2BUR2AsfKEUXSOA7aM/cwJrdpZAC1POSHQOT6qQGpwiUtWO32FmsM/7G6GnNNrwwYHXyger2WK44C1xO6Jwdkwx6NdgiAqWcDZwsJnTsiHoIdAPUzjngEvvxsauhtaIKeXYhcNGzMp/f1ircE6hmKJc6Vv8DlPY9opaNdxKD1z2B0MMDsvFqGGJNIJ/wWdaxI2BgtStLfrcEDjFMnS/4DNQILIPpfNYGpjsiAtPgDS4LvvUQ4KRTy4GTwAcaLquqWog4FcWZwNgxyYajwdH7VsrEnmFttGMfmx4iE/bY1GqPx8YHG5XihXDKb23zpWjgIlL6EWn3Zey1JLERyY7a64Vwz29tsdHlQLh4jNSxGZDunbXy1+vYV/p28Nq+FoVGWnEwM4NdNOgfagOQgyfis34D9rLnfKp2AO5SKASdGCHKQLoz2WOaeRocY3xu2yKWGkkmYoYUy0jKLxrU8YxAXtupaB50O23AgecAv8xkwIjpUpd7dkaRDN6wAW/hBkKXzTw8IyTQfukZnwF7p6rhKAugekhLuDx+HdKvPaqw7/OZR5+avk/NgCh9eZLBt2RSon+i6dtAt/6ZBuN9GvwfGXwmM/omBfp94PQUtDOdn5wF9VNg+1/hHRke9Qpg8y/hzSm81wJt+zy8lwL98/BeCxwZ3vf0D5XUzxaJRoO1AAAAAElFTkSuQmCC'
  }
}

var _smarty, _modal, _$el;

function addModalDOM(opts){
  var div = document.createElement('div');
  try{
    div.style.color = opts.theme.color;
    if(div.style.color){
      var style = document.createElement('style');
      document.body.appendChild(style);
      var rules = templates.theme(opts.theme.color);
      if (style.styleSheet) {
        style.styleSheet.cssText = rules;
      } else {
        style.appendChild(document.createTextNode(rules));
      }
    }
  } catch(e){
    roll(e.message);
  }

  div.innerHTML = templates.modal(opts);
  var container = div.firstChild;
  document.body.appendChild(container);

  var classes = [];

  if(window.innerWidth < 450 || shouldFixFixed || (window.matchMedia && matchMedia('@media (max-device-height: 450px),(max-device-width: 450px)').matches)){
    classes.push('mobile');
  }

  if(!opts.image){
    classes.push('noimage');
  }

  if(shouldFixFixed){
    classes.push('ip')
  }

  $(container).addClass(classes.join(' '));
}

function frontDrop(message, className) {
  if(!popupRequest){
    gel('fd-t').innerHTML = message || '';
    gel('fd').className = className || '';
  }
  var emic = $('#emi-container');
  if(emic[0]){
    emic.removeClass('shown');
    setTimeout(function(){
      emic.hide();
    }, 300)
    gel('fd-in').style.display = '';
  }
}

function shakeModal() {
  if(shouldShakeOnError && _modal){
    $('#modal-inner').removeClass('shake').reflow().addClass('shake');
  }
}

var frameDiscreet = {
  notifyBridge: function(message){
    if( message && message.event ){
      var method = 'on' + message.event;
      if(typeof CheckoutBridge[method] === 'function'){
        var data = message.data;
        if(typeof data !== 'string'){
          if(!data){
            return CheckoutBridge[method]();
          }
          data = JSON.stringify(data);
        }
        CheckoutBridge[method](data);
      }
    }
  },
  
  setMethods: function(payment_methods, methodOptions){

    if( !payment_methods.error ) {
      each(
        methodOptions,
        function(method, enabled){
          var printed = payment_methods[method];
          if ( !printed || enabled === false ) {
            methodOptions[method] = false;
          }
          else {
            methodOptions[method] = printed;
          }
        }
      )
      var wallets = [];
      if( methodOptions.wallet ) {
        each(
          payment_methods['wallet'],
          function(wallet, enabled){
            if(enabled){
              var logos = freqWallets[wallet];
              if(logos){
                wallets.push({
                  'name': wallet,
                  'col': logos.col,
                  'h': logos.h
                });
              }
            }
          }
        )
      }
      methodOptions.wallet = wallets;
    } else {
      methodOptions.card = false;
      methodOptions.netbanking = {error: {description: payment_methods.error.description || "Payments not available right now."}};
    }
    if(methodOptions.netbanking !== false && typeof methodOptions.netbanking !== 'object'){
      methodOptions.netbanking = {error: {description: "Netbanking not available right now."}}
    }
  },

  sanitize: function(obj, key){
    var attr = obj[key];

    if(typeof attr === 'string'){
      obj[key] = attr.replace(/"/g,'');
    }
    else if(typeof attr === 'object'){
      each(attr, function(attrKey, attrObj){
        frameDiscreet.sanitize(attrObj, attrKey);
      })
    }
  },

  sanitizeOptions: function(obj){ // warning: modifies original object
    // directly appended tags
    each(
      ['name', 'description', 'amount', 'currency', 'display_amount'],
      function(i, key){
        obj[key] = obj[key].replace(/<[^>]*>?/g, "");
      }
    )

    each(
      ['image', 'prefill', 'notes'],
      function(i, key){
        frameDiscreet.sanitize(obj, key);
      }
    )

    // obj.prefill.contact = obj.prefill.contact.replace(/[^0-9]/g,'');
  },

  setNumberValidity: function(){
    $(this.parentNode)[card.validateNumber(this.value, this.getAttribute('cardtype')) ? 'removeClass' : 'addClass']('invalid');
  },

  setCVVFormatting: function(cvvlen){
    var cvv_help = $('.elem-cvv .help-text');
    cvv_help.html(cvv_help.html().replace(/3|4/, cvvlen));
    this.maxLength = cvvlen;
    this.pattern = '[0-9]{'+cvvlen+'}';
    $(this.parentNode)[this.value.length === cvvlen ? 'removeClass' : 'addClass']('invalid');
  },

  setCardFormatting: function(){
    var $el_number = $('#card_number');
    var el_expiry = gel('card_expiry');
    var el_cvv = gel('card_cvv');
    var el_contact = gel('contact');
    
    card.setType = function(el, type){
      if(!type){
        type = card.getType(el.value) || 'unknown';
      }
      var parent = el.parentNode;

      var oldType = parent.getAttribute('cardtype');
      if(type === oldType){
        return;
      }

      parent.setAttribute('cardtype', type);
      frameDiscreet.setNumberValidity.call(el);
      
      if(type === 'amex'){
        frameDiscreet.setCVVFormatting.call(el_cvv, 4);
      }
      else if(oldType === 'amex'){
        frameDiscreet.setCVVFormatting.call(el_cvv, 3);
      }
      // if(type !== 'maestro'){
        // $('nocvv-check')[0].checked = false;
        // frameDiscreet.toggle_nocvv();
      // }
    }

    if(shouldFocusNextField){
      card.filled = function(el){
        if(el === el_expiry){
          el_cvv.focus();
        }
        else{
          el_expiry.focus();
        }
      }
    }
    
    $el_number.on('blur', frameDiscreet.setNumberValidity);
    card.formatNumber($el_number[0]);
    card.formatExpiry(el_expiry);
    card.ensureNumeric(el_cvv);

    // check if we're in webkit
    // checking el_expiry here in place of el_cvv, as IE also returns browser unsupported attribute rules from getComputedStyle
    if ( el_cvv && window.getComputedStyle && typeof getComputedStyle(el_expiry)['-webkit-text-security'] === 'string' ) {
      el_cvv.type = 'tel';
    }
  },

  createModal: function(el, modalOptions){
    modalOptions.onhide = function(){
      Razorpay.sendMessage({event: 'dismiss'});
    };
    modalOptions.onhidden = function(){
      Razorpay.sendMessage({event: 'hidden'});
    };
    delete modalOptions.ondismiss;
    return new window.Modal(el, modalOptions)
  },

  showModal: function() {
    frameDiscreet.renew();

    if(_modal){
      return _modal.show();
    }
    $('#loading').remove();
    var opts = $.clone(Razorpay.defaults);

    if(opts.amount >= 100*10000){
      opts.method.wallet = false;
    }

    frameDiscreet.setMethods(window.payment_methods, opts.method);
    frameDiscreet.sanitizeOptions(opts);

    opts.netbanks = freqBanks;

    addModalDOM(opts);
    
    if ( CheckoutBridge ) {
      $('#backdrop').css('background', 'rgba(0, 0, 0, 0.6)');
    }
    _$el = $('#container');
    _smarty = new window.Smarty(_$el);

    frameDiscreet.applyFont(gel('powered-link'));
    _modal = frameDiscreet.createModal(gel('modal'), opts.modal);

    if(opts.key === 'rzp_test_s9cT6UE4Mit7zL'){
      $('#emi-wrap').html(templates.emi());
      $('#emi-close').on('click', frontDrop);
      var elem_emi = $('#elem-emi');
      if(elem_emi[0]){
        elem_emi.addClass('shown').on('mouseup', function(){
          var shouldCheck = $(this).hasClass('check');
          if(!gel('emi').checked || !shouldCheck){

            $('#emi-container')
              .css('display', 'block')
              .reflow()
              .addClass('shown')[shouldCheck ? 'addClass' : 'removeClass']('active');

            $('#fd').addClass('shown');
            $('#fd-in').hide();
          }
        })
        $('#card_number').on('input keypress', function(){
          elem_emi[this.value.length > 6 ? 'addClass' : 'removeClass']('check');
        })
        each(
          $$('#emi-container > .emi-option'),
          function(i, el){
            $(el).on('click', function(){
              $('#emi-container > .emi-active').removeClass('emi-active');
              $(this).addClass('emi-active').find('input')[0].checked = true;
              frontDrop();
            })
          }
        )
      }
      $('#methods-specific-fields').css('minHeight', '263px');
    }
    if( opts.key === 'rzp_live_kfAFSfgtztVo28' || opts.key === 'rzp_test_s9cT6UE4Mit7zL' ) {
      $('#powered-link').css('visibility', 'hidden').css('pointerEvents', 'none');
    }
    // event listeners
    // $('nocvv-check').on('change', frameDiscreet.toggle_nocvv)
    $('#modal-close').on('click', function(){
      Razorpay.payment.cancel();
      _modal.hide();
    });
    $('#tabs').on('click', frameDiscreet.tab_change);
    $('#form').on('submit', function(e){
      frameDiscreet.formSubmit();
      e.preventDefault();
    });

    $('#bank-select').on('change', frameDiscreet.bank_change);

    if(window.addEventListener){
      $('#netb-banks').on('change', frameDiscreet.bank_radio, true);
    }
    else {
      each(
        $$('netb-banks .bank-radio'),
        function(i, bankRadio){
          $(bankRadio).on('click', frameDiscreet.bank_radio, true);
        }
      )
    }

    $('#fd').on('click', function(e){
      var id = e.target.id;
      if(id === 'fd' || id === 'fd-hide') {
        frontDrop();
      }
    });
    $('#backdrop').on('click', frontDrop);

    if(qpmap.tab){
      each(
        $$('#tabs > li'),
        function(i, li){
          if( li.getAttribute('data-target') === 'tab-' + qpmap.tab ) {
            frameDiscreet.tab_change({target: li});
          }
        }
      )
    }
    if(qpmap.error){
      setTimeout(function(){
        frameDiscreet.errorHandler(qpmap)
      })
    }
    frameDiscreet.setCardFormatting();
  },

  bank_radio: function(e) {
    var select = gel('bank-select');
    select.value = e.target.value;
    _smarty.input({target: select});
  },

  bank_change: function() {
    var val = this.value;
    each(
      $$('#netb-banks input'),
      function(i, radio) {
        if(radio.value === val){
          radio.checked = true;
        } else if(radio.checked){
          radio.checked = false;
        }
      }
    )
  },

  tab_change: function(e){
    var target = e.target;

    if( target.nodeName === 'IMG' ) {
      target = target.parentNode;
    }

    if( target.nodeName !== 'LI' || $(target).hasClass('active') ) {
      return;
    }

    frameDiscreet.renew();

    $('.tab-content.active').removeClass('active');
    $('#' + target.getAttribute('data-target')).addClass('active');

    $('#tabs > .active').removeClass('active');
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

  applyFont: function(anchor, retryCount) {
    if(!retryCount) {
      retryCount = 0;
    }
    if(anchor.offsetWidth/anchor.offsetHeight > 5) {
      _$el.addClass('font-loaded');
    }
    else if(retryCount < 25) {
      setTimeout(function(){
        frameDiscreet.applyFont(anchor, ++retryCount);
      }, 120 + retryCount*50);
    }
  },

  /* sets focus on invalid input and returns true, if any. */
  isInvalid: function(parentID) {
    var invalids = $('#' + parentID).find('.invalid');
    if(invalids[0]){
      shakeModal();
      $(invalids[0]).find('.input')[0].focus();

      each( invalids, function(i, field){
        $(field).addClass('mature');
      })
      return true;
    }
  },

  formSubmit: function() {
    _smarty.refresh();

    if (frameDiscreet.isInvalid('form-common')) {
      return;
    }

    // var card_number = $('card_number')[0];
    // card_number && frameDiscreet.setNumberValidity.call(card_number);

    var activeTab = $('#tabs > .active')[0];
    if ( activeTab && frameDiscreet.isInvalid(activeTab.getAttribute('data-target')) ) {
      return;
    }
    var data = frameDiscreet.getFormData();
    var options = Razorpay.defaults;

    data.amount = options.amount;

    Razorpay.sendMessage({
      event: 'submit',
      data: data
    });

    if(_modal){
      _modal.options.backdropClose = false;
    }

    frontDrop('Please wait while your payment is processed...', 'shown loading');

    Razorpay.payment.authorize({
      postmessage: false,
      options: options,
      data: data,
      error: frameDiscreet.errorHandler,
      success: frameDiscreet.successHandler
    });
  },

  getFormFields: function(containerID, returnObj) {
    each(
      $('#' + containerID).find('input[name],select[name]'),
      function(i, el){
        if(el.getAttribute('type') === 'radio' && !el.checked) {
          return;
        }
        if(!el.disabled && el.value.length) {
          returnObj[el.name] = el.value;
        }
      }
    )
  },

  getFormData: function() {
    var activeTab = $('#tabs > .active')[0];
    if(!activeTab) { return }
    
    var data = {};
    frameDiscreet.getFormFields('form-common', data);
    
    var targetTab = activeTab.getAttribute('data-target');
    frameDiscreet.getFormFields(targetTab, data);

    if(targetTab === 'tab-card'){
      data['card[number]'] = data['card[number]'].replace(/\ /g, '');
      
      if(!data['card[expiry]']){
        data['card[expiry]'] = '';
      }

      if(!data['card[cvv]']){
        data['card[cvv]'] = '';
      }

      var expiry = data['card[expiry]'].replace(/[^0-9\/]/g, '').split('/');
      data['card[expiry_month]'] = expiry[0];
      data['card[expiry_year]'] = expiry[1];
      delete data['card[expiry]'];
    }
    return data;
  },

  // close on backdrop click and remove errors
  renew: function(){
    if(_$el) {
      frontDrop('', 'hidden');
    }

    if(_modal) {
      _modal.options.backdropClose = true;
    }
  },

  hide: function(){
    if(_modal){
      $('#modal-inner').removeClass('shake');
      _modal.hide();
    }
    _modal = null;
  },

  successHandler: function(response){
    if(_modal){
      _modal.options.onhide = null;
    }
    Razorpay.sendMessage({ event: 'success', data: response });
    if(isCriOS) {
      setCookie('onComplete', JSON.stringify(response));
    }
    frameDiscreet.hide();
  },

  errorHandler: function(response){
    if(!_modal){
      return;
    }
    var message;
    shakeModal();
    _modal.options.backdropClose = true;

    if (response && response.error){
      message = response.error.description;
      var err_field = response.error.field;
      if (err_field){
        if(!err_field.indexOf('expiry')){
          err_field = 'card[expiry]';
        }
        var error_el = document.getElementsByName(err_field)[0];
        if (error_el && error_el.type !== 'hidden'){
          var help = $(error_el)
            .focus()
            .parent()
            .addClass('invalid')
            .find('help-text')[0];

          if(help){
            $(help).html(message);
          }
          frontDrop();
          return;
        }
      }
    }

    frontDrop(
      message || 'There was an error in handling your request',
      'shown'
    );
    $('#fd-hide').focus();
  },

  dataHandler: function(data){
    if( !('method' in data) ) {
      return;
    }

    frameDiscreet.tab_change({target: $('#method-' + data.method + '-tab')[0]});

    if(('card[expiry_month]' in data) && ('card[expiry_year]' in data)) {
      data['card[expiry]'] = data['card[expiry_month]'] + ' / ' + data['card[expiry_year]'];
    }

    var lastel;
    each(
      {
        'contact': 'contact',
        'email': 'email',
        'card[name]': 'card_name',
        'card[number]': 'card_number',
        'card[expiry': 'card_expiry',
        'bank': 'bank-select'
      },
      function(name, id){
        var el = gel(id);
        if(el) {
          lastel = el;
          var val = data[name];
          if(val){
            el.value = val;
          }
        }
      }
    )

    if(data.method === 'card'){
      frameDiscreet.setCardFormatting();
    }
    if(lastel){
      lastel.focus();
    }
    _smarty.refresh();
  },

  configureRollbar: function(message){
    if(Rollbar && typeof Rollbar.configure === 'function'){
      Rollbar.configure({
        payload: {
          person: {
            id: _uid
          },
          context: message.context
        }
      });
    }
  },
  setQueryParams: function(search){
    each(
      search.replace(/^\?/,'').split('&'),
      function(i, param){
        var split = param.split('=', 2);
        if( split[0].indexOf('.') !== -1 ) {
          var dotsplit = split[0].split('.', 2);
          if( !qpmap[dotsplit[0]] ) {
            qpmap[dotsplit[0]] = {};
          }
          qpmap[dotsplit[0]][dotsplit[1]] = decodeURIComponent(split[1]);
        } else {
          qpmap[split[0]] = decodeURIComponent(split[1]);
        }
      }
    )
  },
  parseMessage: function(e){ // not concerned about adding/removeing listeners, iframe is razorpay's fiefdom
    var data = e.data;
    if(typeof data === 'string') {
      data = JSON.parse(data);
    }
    window.handleMessage(data);
  }
}

Razorpay.sendMessage = function(message){
  if ( CheckoutBridge && typeof CheckoutBridge === 'object' ) {
    return frameDiscreet.notifyBridge(message);
  }

  var ownerWindow = window === window.parent ? window.opener : window.parent;

  if(!isCriOS && ownerWindow){
    message.source = 'frame';
    if ( typeof message !== 'string' ) {
      message = JSON.stringify(message);
    }
    ownerWindow.postMessage(message, '*');
  }
}
window.handleMessage = function(message) {
  if ( message.event === 'open' || message.options ) {
    if ( message.options ) { // open modal
      try{
        if(message.id){
          _uid = message.id;
        }
        frameDiscreet.configureRollbar(message);
        Razorpay.configure(message.options);
      } catch(e){
        Razorpay.sendMessage({event: 'fault', data: e.message});
        roll('fault ' + e.message, message);
        return;
      }
    }
    frameDiscreet.showModal();
    if(CheckoutBridge){
      track('init', message.options);
    }
    else {
      track('open');
    }
  } else if ( message.event === 'close' ) {
    frameDiscreet.hide();
  }

  var params = message.params;
  if(params){
    setTimeout(function(){
      try{
        frameDiscreet.errorHandler(JSON.parse(params));
      } catch(e){
        roll('message.params', params);
      }
    })
  }
  var data = message.data;
  if(data){
    if( typeof data === 'string' ){
      try{
        data = JSON.parse(data);
      } catch(e){
        roll('message.data', data);
      }
    }
    if( typeof data === 'object' ) {
      frameDiscreet.dataHandler(data);
    }
  }
}

$(window).on('message', frameDiscreet.parseMessage);

if(location.search){
  frameDiscreet.setQueryParams(location.search);
}

// unique id for ios to retieve resources
var iosDataIndex = 0;

function iosMethod(method){
  return function(data){
    var iF = document.createElement('iframe');
    var src = 'razorpay://on'+method;
    if(data){
      src += '?' + iosDataIndex;
      CheckoutBridge.map[iosDataIndex] = data;
      iosDataIndex++;
    }
    iF.setAttribute('src', src);
    document.documentElement.appendChild(iF);
    iF.parentNode.removeChild(iF);
    iF = null;
  }
}

function iosBridge(){
  if(qpmap.platform === 'ios'){
    CheckoutBridge = window.CheckoutBridge = {
      map: {},
      get: function(index){
        var val = this.map[index];
        delete this.map[index];
        return val;
      }
    };

    var bridgeMethods = ['load','dismiss','submit','fault','success'];

    each(bridgeMethods, function(i, prop){
      CheckoutBridge['on'+prop] = iosMethod(prop)
    })
  }
}

if(CheckoutBridge){
  discreet.medium = qpmap.platform || 'app';
  discreet.context = qpmap.context || null;
}

iosBridge();
Razorpay.sendMessage({event: 'load'});

if(qpmap.message){
  frameDiscreet.parseMessage({data: atob(qpmap.message)});
}
