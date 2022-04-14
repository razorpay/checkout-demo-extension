/* jshint ignore:start */

(function () {
  function theme(_) {
    var out = '';
    var bodyHeight = window.innerHeight - 128;
    var themeMeta = arguments[1];
    var c = themeMeta.color;
    var textColor = themeMeta.textColor;
    var highlightColor = themeMeta.highlightColor;
    var secondaryHighlightColor = themeMeta.secondaryHighlightColor;
    var hoverStateColor = themeMeta.hoverStateColor;
    var backgroundColor = themeMeta.backgroundColor;
    var activeStateColor = themeMeta.activeStateColor;
    out +=
      '.qr-action { color: ' +
      c +
      '; border-bottom: 1px solid ' +
      c +
      '; padding: 3px 1px; cursor: pointer;}.button, .btn, .submit-button, .loader::after{ background: ' +
      c +
      '; color: ' +
      textColor +
      ';}.elem::after { border-bottom-color: ' +
      highlightColor +
      ';}.address-elem::after { border: 0px;}.spin div, .link, .multi-tpv :checked + label{ border-color: ' +
      highlightColor +
      '!important;}.spinner { height: 12px; width: 12px; margin-right: 4px; border: 2px solid; border-color: ' +
      highlightColor +
      ' transparent ' +
      highlightColor +
      ' ' +
      highlightColor +
      ' !important; border-image: initial; border-radius: 50%; animation: 1s linear 0s infinite normal none running rotate;}@keyframes rotate { 0% { transform: rotate(0); } 100% { transform: rotate(360deg); }}.hc_border { border-color: ' +
      highlightColor +
      ' !important;}.hc_border:disabled { border-color: #ccc !important;}#cancel_upi .back-btn,.offer-info li:first-child,.options-list .option:hover,.options .option:hover,.options .option:focus { background: ' +
      hoverStateColor +
      ';}.theme-highlight-color,.options .next-option:after { color: ' +
      highlightColor +
      ';}.dcc-view { background-color: ' +
      secondaryHighlightColor +
      ';}.options .next-option.secondary-color:after { color: ' +
      backgroundColor +
      ';}#header{ background: ' +
      c +
      '; color: ' +
      textColor +
      ';}#header.ios-paybtn-landscape-fix{ padding-top: 10px; padding-bottom: 10px;}';
    if (_.image_padding) {
      out +=
        '.merchant-image{ width: 60px; height: 60px; padding: 12px; border: 1px solid #eaeaea; background: #fff;}';
    }
    if (!_('theme.image_frame')) {
      out +=
        '#logo { background: none; box-shadow: none; padding: 0; width: 80px; height: 80px;}';
    }
    out +=
      '.option.active,:not(.saved-card).checked .checkbox,input[type=checkbox]:checked + .checkbox{ color: #fff; background: ' +
      highlightColor +
      '; border-color: ' +
      highlightColor +
      ';}label.sv-checkbox.checked > .stack > input[type=checkbox]:checked::before { background: ' +
      highlightColor +
      '; border-color: ' +
      highlightColor +
      ';}label.sv-checkbox > .stack > input:focus::before { border-color: ' +
      highlightColor +
      ';}.options .option.selected { color: #333; background: ' +
      hoverStateColor +
      '; border-color: ' +
      highlightColor +
      '; border-bottom: 1px solid ' +
      highlightColor +
      ' !important;}.theme {color: ' +
      c +
      ';}#body .theme-border { border-color: ' +
      c +
      ';}.theme-highlight,.offers-container header:before,.close-offerlist:before,.close-offerlist span,.remove-offer{ color: ' +
      highlightColor +
      ';}.iframe-title,#topbar:before, .avs-card-info, .nvs-provider-info { background-color: ' +
      secondaryHighlightColor +
      ' !important;}.offers-container header { background-color: ' +
      secondaryHighlightColor +
      ';}.iframe-title,.grid label:hover,.auth-option:hover { background-color: ' +
      hoverStateColor +
      ' !important;}.grid :checked+label { background-color: ' +
      activeStateColor +
      ' !important; border-bottom: 2px solid ' +
      highlightColor +
      ';}.list :checked+label, .list .item.active { border-color: ' +
      highlightColor +
      ' !important;}.list :checked+label .checkbox:not(.inner-checkbox) { background: ' +
      highlightColor +
      '; border-color: ' +
      highlightColor +
      ';}.input-radio input[type=radio]:focus:not(:checked) + label .radio-display { border-color: ' +
      highlightColor +
      ';}.input-radio input[type=radio]:checked + label .radio-display { background-color: ' +
      highlightColor +
      '; border-color: ' +
      highlightColor +
      ';}.confirm-container { border-top: 2px solid ' +
      c +
      ';}.qr-image:before,.iframe-title { border-color: ' +
      c +
      ';}.offer-item.selected, .offer-item .checkbox { border-color: ' +
      highlightColor +
      ' !important;}.offer-item .checkbox { background-color: ' +
      highlightColor +
      ';}.expandable-card--expanded { border-color: ' +
      highlightColor +
      ';}.border-list > *:first-child { border-top-left-radius: 2px; border-top-right-radius: 2px;}.border-list > *:last-child { border-bottom-right-radius: 2px; border-bottom-left-radius: 2px;}.border-list:not(.touchfix) > *:not(.uninteractive):hover:not(:disabled),.border-list > *:focus,.border-list > *:focus-within,.border-list > .selected { border-color: ' +
      highlightColor +
      '; background-color: ' +
      hoverStateColor +
      ';}.saved-card-cta:hover { border-color: ' +
      highlightColor +
      ';}.border-list > *:not(:last-child) { border-bottom: none;}.border-list:not(.touchfix) > *:hover:not(:disabled):not(.uninteractive) + *,.border-list > *:focus + *,.border-list > *:focus-within + *,.border-list > .selected + * { border-top-color: ' +
      highlightColor +
      ';}.trusted-badge-wrapper { background: ' +
      activeStateColor +
      '}.trusted-badge-header-section.active { border-bottom: 2px solid ' +
      activeStateColor +
      '}.arrow { border: solid ' +
      backgroundColor +
      '}.border-list-horizontal > *:first-child { border-top-left-radius: 2px; border-bottom-left-radius: 2px;}.border-list-horizontal > *:last-child { border-bottom-right-radius: 2px; border-top-right-radius: 2px;}.border-list-horizontal:not(.touchfix) > *:not(.uninteractive):hover:not(:disabled),.border-list-horizontal > *:focus,.border-list-horizontal > *:focus-within,.border-list-horizontal > .selected { border-color: ' +
      highlightColor +
      '; background-color: ' +
      hoverStateColor +
      ';}.border-list-horizontal > *:not(:last-child) { border-right: none;}.border-list-horizontal:not(.touchfix) > *:hover:not(:disabled):not(.uninteractive) + *,.border-list-horizontal > *:focus + *,.border-list-horizontal > *:focus-within + *,.border-list-horizontal > .selected + * { border-left-color: ' +
      highlightColor +
      ';}.coupons-available-container { background-color: ' +
      secondaryHighlightColor +
      '; color: ' +
      highlightColor +
      '; border: 1px solid ' +
      secondaryHighlightColor +
      '; display: flex; align-items: center; padding: 10px 12px; width: 100%; font-size: 14px; font-weight: 600;}.coupon-item-code { padding: 4px 8px; background-color: ' +
      secondaryHighlightColor +
      '; color: ' +
      highlightColor +
      '; font-weight: 800; font-size: 14px; line-height: 20px; border: 1px dashed ' +
      highlightColor +
      ';}.highlight-text { color: ' +
      highlightColor +
      ';}.saved-addresses-cta { color: ' +
      highlightColor +
      '; font-weight: bold; border: 1px solid #E6E7E8; padding: 10px 12px; width: 100%; margin-bottom: 14px; display: inline-flex; justify-content: space-between; align-items: center;}.loading-indicator { border-radius: 50%; width: 33px; height: 33px; border: 1px solid; border-color: ' +
      highlightColor +
      ' transparent ' +
      highlightColor +
      ' ' +
      highlightColor +
      ' !important; animation: 1s linear 0s infinite normal none running rotate;}.summary-modal-cta { box-sizing: border-box; background: ' +
      c +
      '; color: ' +
      textColor +
      '; font-weight: bold; padding: 15px 0; width: 100%; text-align: center;}';
    return out;
  }
  var itself = theme,
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
  templates['theme'] = itself;
})();

/* jshint ignore:end */
