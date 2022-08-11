import { displayAmount, getConvertedAmount } from 'common/currency';
import { translatePaymentPopup as t } from 'i18n/popup';
import track from 'analytics/tracker';
import css from './popupStyle.js';

const map = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
};

function sanitizeHtmlEntities(string) {
  return string.replace(/[&<>"'/]/g, (match) => map[match]);
}

import {
  PAYING,
  SECURED_BY,
  TRYING_TO_LOAD,
  PROCESSING,
  WAIT_WHILE_WE_REDIRECT,
  REDIRECTING,
  LOADING_METHOD_PAGE,
  TRYING_BANK_PAGE_MSG,
} from 'ui/labels/popup';

function popupTemplate(paymentInstance) {
  const razorpayInstance = paymentInstance.r;
  const get = razorpayInstance.get;
  const paymentData = paymentInstance.data || {};
  const method = paymentData.method === 'wallet' ? 'wallet' : 'bank';
  const color = get('theme.color') || '#3594E2';
  const highlightColor = razorpayInstance.themeMeta.highlightColor;
  const logo =
    razorpayInstance.preferences?.org?.checkout_logo_url ??
    'https://cdn.razorpay.com/logo.svg';

  const title = sanitizeHtmlEntities(
    get('name') || get('description') || t(REDIRECTING)
  );

  let amount = displayAmount(
    razorpayInstance,
    paymentData.amount,
    paymentData.currency
  );

  const dccCurrency = paymentData.dcc_currency;

  if (dccCurrency) {
    const dccAmount = getConvertedAmount(
      razorpayInstance.display_amount || paymentData.amount,
      dccCurrency
    );
    amount = displayAmount(
      razorpayInstance,
      dccAmount,
      dccCurrency,
      true,
      true
    );
  }

  const hideAmount = paymentData.method === 'emandate' ? 'display: none;' : '';

  let image = get('image');
  image = image
    ? `<div id="logo"><img src="${image.replace(/"/g, '')}"/></div>`
    : '';

  const message = sanitizeHtmlEntities(
    paymentInstance.message || t(WAIT_WHILE_WE_REDIRECT, { method })
  );

  const currentTime = new Date().getTime();
  const useCustomImg = currentTime < 1661020200000; // compare with time of Aug 21 2022
  const footer = `<div id='ftr' class='${
    useCustomImg ? 'with-custom-img' : ''
  }'>
  <div style="display:inline-block;">${t(SECURED_BY)}
    <img style="vertical-align:middle;margin-bottom:5px;" height="20px" src=${logo}>
  </div>
  ${
    useCustomImg
      ? `<img src="https://cdn.razorpay.com/static/assets/15aug.png" style="vertical-align:middle;margin-bottom:5px;" height="34px" />`
      : `<div style="display:inline-block;vertical-align:middle;height:100%"></div>`
  }
  
</div>`;

  return `<!doctype html><html style="height:100%;width:100%;"><head>
<title>${t(PROCESSING)}</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="${color}">
<style>${css}#ldr:after{background:${highlightColor}}#bg{background:${color}}
@media(max-height:580px),(max-width:420px){body{background:${color}}}
</style>
</head><body><div id='bg'></div><div id='cntnt'>
<div id="hdr">${image}
  <div id='name'>${title}</div>
  <div id="amt" style="${hideAmount}">
    <div style="font-size:12px;color:#757575;line-height:15px;margin-bottom:5px;text-align:right">${t(
      PAYING
    )}</div>
    <div dir="ltr" style="font-size:20px;line-height:24px;">${amount}</div>
  </div>
</div>
<div id="ldr"></div>
<div id="txt">
  <div style="display:inline-block;vertical-align:middle;white-space:normal;">
    <div class="initial">
      <h2>${t(LOADING_METHOD_PAGE, { method })}</h2>
      <p>${message}</p>
    </div>
    <div class="later">
      <h2>${t(TRYING_TO_LOAD)}</h2>
      <p>${t(TRYING_BANK_PAGE_MSG)}</p>
    </div>
  </div>
  <div style="display:inline-block;vertical-align:middle;height:100%"></div>
</div>
${footer}
</div>
<div style="display:inline-block;vertical-align:middle;height:100%"></div>
<form></form>
</body>
</html>`;
}

/**
 * update content of popup
 * @param {Window} popupWindow
 * @param {string} content
 */
export function updatePopup(popupWindow, content) {
  const { document: popupDocument } = popupWindow;
  popupDocument.write(content);
  popupDocument.close();
}

/**
 * write popup with loading screen
 * @param {Window} win
 * @param {PaymentInstance} paymentInstance
 */
export function writePopup(win, paymentInstance) {
  const doc = win.document;
  /*jshint evil:true */
  doc.write(popupTemplate(paymentInstance));
  doc.close();

  const trackPopup = (event, props = {}) => {
    const page = 'checkout_popup';
    event = `${page}:${event}`;
    track(paymentInstance.r, event, { page, ...props });
  };

  trackPopup('load');

  win.addEventListener('beforeunload', () => {
    trackPopup('unload');
  });
}
