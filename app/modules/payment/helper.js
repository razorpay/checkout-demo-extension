import { submitForm } from 'common/form';
import { checkValidFlow } from './utils';
import FLOWS from 'config/FLOWS';
import { iOS, android } from 'common/useragent';
import { getPaymentEntity } from 'razorpay';
import * as errorService from 'error-service';
/**
 * popupIframeCheck check for given method is required to open in iframe inside
 * popup. If required it will do necessary steps to load the page
 */
export function popupIframeCheck(context, request) {
  const popup = context.popup;
  const data = context.data;
  const isMobile = iOS || android;
  const isSDK = !!global.CheckoutBridge;
  const isMobileWebOnly = isMobile && !isSDK;
  const popupDocument = popup.window?.document;
  if (typeof popupDocument.write !== 'function') {
    return false;
  }
  const isValidPopupFlow = checkValidFlow(data, FLOWS.POPUP_IFRAME);
  /**
   * For Mobile Web only for Valid flow like Paytm
   */
  if (isMobileWebOnly && isValidPopupFlow) {
    popupDocument.write(`
        <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
        <html xmlns="http://www.w3.org/1999/xhtml">
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <title>Razorpay</title>
            \x3Cscript>
            window.addEventListener('message', event => {
              // IMPORTANT: check the origin of the data!
              if (event.origin.startsWith('https://api.razorpay.com')) {
                  const data = event.data;
                  if (!window.CheckoutBridge) {
                    try { window.opener.onComplete(data) } catch(e){}
                    try { (window.opener || window.parent).postMessage(data, '*') } catch(e){}
                    setTimeout(window.close, 999);
                  }
              } else {
                  // The data was NOT sent from your site!
                  // Be careful! Do not use it. This else branch is
                  // here just for clarity, you usually shouldn't need it.
                  return;
              }
          });
            \x3C/script>
            <style type="text/css">
              body,
              html {
                margin: 0;
                padding: 0;
                height: 100%;
                overflow: hidden;
              }
              #content {
                position: absolute;
                left: 0;
                right: 0;
                bottom: 0;
                top: 0px;
              }
            </style>
          </head>
          <body>
            <div id="content">
              <iframe
                id="frame"
                width="100%"
                height="100%"
                frameborder="0"
              ></iframe>
            </div>
          </body>
        </html>
      `);
    const popupIframe = popupDocument.querySelector('#frame');
    // To hide about:blank in popup just pushing url for display purpose only
    if (popup.window.history) {
      // url should be of same origin
      const popupUrl = `razorpay.html?url=${request.url}`;
      popup.window.history.pushState({ Url: popupUrl }, 'Razorpay', popupUrl);
    }
    submitForm({
      doc: popupIframe.contentWindow.document,
      path: request.url,
      params: request.content,
      method: request.method,
    });
    return true;
  }
  return false;
}

/**
 * In this function, we're checking if the necessary metadata is being passed to the merchant
 * on payment success in addition to razorpay_payment_id.
 *
 * This is required to for merchants to correlate the payment with corresponding order/invoice/subscription etc
 */

export function assertPaymentSuccessMetadata(data) {
  try {
    if (!data || !data.razorpay_payment_id) {
      // Ideally this case should not get triggered but have added it here just in case.
      return;
    }

    const paymentEntity = getPaymentEntity();

    if (!paymentEntity) {
      // In this case, usually there is no other metadata sent except for
      // razorpay_payment_id and hence needs no further validation.
      return;
    }

    const expectedEntities = [
      'razorpay_signature',
      `razorpay_${paymentEntity}_id`,
    ];

    expectedEntities.forEach((entity) => {
      // Raise an error if an expected entity is not present
      if (!data[entity]) {
        errorService.capture(new Error(`ValidationError: Missing ${entity}`), {
          severity: errorService.SEVERITY_LEVELS.S2, // TODO: Change it to S0 after monitoring for a few days
          analytics: {
            event: 'validation:failed',
            data: {
              validationFailure: {
                flow: 'payment_success',
                field: entity,
                value: data[entity], // This will (should?) always be an empty value
                data,
              },
            },
          },
        });
      }
    });
  } catch (e) {
    // Adding this try/catch block to ensure any potential errors here
    // do not cause any cascading failures as this is in the critical payment oncomplete flow
  }
}
