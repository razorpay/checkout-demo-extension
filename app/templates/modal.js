/* jshint ignore:start */

(function () {
  function modal(_) {
    var out = '';
    var params = arguments[1];
    var Store = params.Store;
    var RazorpayHelper = params.RazorpayHelper;
    var SecurityUtils = params.SecurityUtils;
    var MethodStore = params.MethodStore;
    var isMethodEnabled = MethodStore.isMethodEnabled;
    var emiBanks = MethodStore.getEMIBanks();
    var cta = params.cta;
    var o = _.get;
    var html = function (html) {
      return html.replace(/<[^>]*>?/g, '');
    };
    var attr = function (attr) {
      return attr.replace(/"/g, '');
    };
    var amount;
    var amount_figure = _.formatAmountWithCurrency(o('amount'));
    if (o('display_currency') && o('display_amount'))
      amount =
        discreet.currencies[o('display_currency')] + html(o('display_amount'));
    else amount = amount_figure;
    out +=
      '<div id="container" class="mfix animations" tabIndex="0"> <div id="backdrop"></div> <div id="tnc-wrap"></div> <div id="modal" class="mchild"> <div id="modal-inner"> <div id="one-cc-loader"></div> <div id="overlay"></div> <div id="nocost-overlay" class="showable"></div> <div id="confirmation-dialog" class="showable"></div> <div id="emi-wrap" class="overlay showable mfix"></div> <div id="recurring-cards-wrap" class="overlay showable mfix"></div> <div id="fee-wrap" class="overlay showable mfix"></div> <div id="one-cc-summary"></div> <div id="options-wrap"></div> <div id="error-message" class="overlay showable"> <div class="omnichannel"> <img style="width:35px;" src="https://cdn.razorpay.com/app/googlepay.svg"> <div id="overlay-close" class="close">×</div> </div> <div id="fd-t"></div> <div class="spin"><div></div></div> <div class="spin spin2"><div></div></div> <span class="link"></span> <button id="fd-hide" class="btn">Retry</button> <div id="cancel_upi"></div> </div> <div id="content" class="';
    if (RazorpayHelper.isOneClickCheckout()) {
      out += 'one-cc';
    }
    out += '"> <div id="header"> <div id="modal-close" class="close">×</div> ';
    if (o('image')) {
      out += ' <div id="logo"> <img src="' + attr(o('image')) + '"> </div> ';
    }
    out += ' <div id="merchant"> ';
    if (o('name')) {
      out += ' <div id="merchant-name">' + html(o('name')) + '</div> ';
    }
    out +=
      ' <div id="merchant-desc">' + html(o('description').trim()) + '</div> ';
    if (o('amount')) {
      out +=
        ' <div id="amount"> <span class="discount"></span> <span class="original-amount">' +
        amount +
        '</span> <span class="fee"></span> </div> ';
    }
    out += ' </div> <div id="language-dropdown"></div> ';
    if (o('theme.branding') === 'payzapp') {
      out +=
        ' <div id="cob-image" style="background-image: url(\'https://cdn.razorpay.com/brand/' +
        SecurityUtils.sanitizeHTML(o('theme.branding')) +
        '.png\')"></div> ';
    } else if (o('theme.branding')) {
      out +=
        ' <div id="cob-image" style="background-image: url(\'' +
        SecurityUtils.sanitizeHTML(o('theme.branding')) +
        '\')"> </div> ';
    }
    out +=
      ' </div> <div id="body" class="sub"> <div id="topbar-wrap"></div> <div id="messages"></div> <form id="form" method="POST" novalidate autocomplete="off" onsubmit="return false"> <div id="root"></div> <div id="form-fields"> <div id="body-overlay"></div> ';
    if (RazorpayHelper.isIRCTC()) {
      out +=
        " <div class='recurring-message' style='right: 0;left: 0;border-radius:0 0 3px 3px'> <span>&#x2139;</span> *Payment charges and taxes as applicable.</div> ";
    }
    out += ' ';
    if (isMethodEnabled('emi') && emiBanks.BAJAJ) {
      out += ' <div class="tab-content showable screen" id="form-emi"></div> ';
    }
    out +=
      ' </div> <div id="bottom"></div> <div id="footer" role="button" class="button"> <span id="footer-cta">' +
      cta +
      '</span> </div> ';
    if (o('theme.branding')) {
      out += ' <img id="cob-rzp" src="https://cdn.razorpay.com/logo.svg"> ';
    }
    out +=
      ' <button type="submit"></button> </form> </div> </div> </div> </div></div>';
    return out;
  }
  var itself = modal,
    _encodeHTML = (function (doNotSkipEncoded) {
      var encodeHTMLRules = {
          '&': '&#38;',
          '<': '&#60;',
          '>': '&#62;',
          '"': '&#34;',
          "'": '&#39;',
          '/': '&#47;',
        },
        matchHTML = doNotSkipEncoded ? /[&<>"'\/]/g : /&(?!#?\w+;)|<|>|"|'|\//g;
      return function (code) {
        return code
          ? code.toString().replace(matchHTML, function (m) {
              return encodeHTMLRules[m] || m;
            })
          : '';
      };
    })();
  templates['modal'] = itself;
})();

/* jshint ignore:end */
