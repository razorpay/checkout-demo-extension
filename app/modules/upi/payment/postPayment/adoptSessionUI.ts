import { format } from 'i18n';
import { updateLoadingCTA } from '../../../components/ErrorModal';

export function adoptSessionUI(
  paymentInstance: any,
  session: any,
  config: UPI.PaymentProcessConfiguration
) {
  /**
   * TODO remove when 100% migrate to v1.5
   */
  (document.querySelector('#error-message .link') as HTMLElement).textContent =
    format('misc.cancel_action');

  /** v1.5 error dialog */
  updateLoadingCTA(
    format('misc.cancel_action'),
    session.hideErrorMessage.bind(session)
  );
  /**
   * Start a general loader with cancel action
   */
  if (!config.qrFlow) {
    session.showLoadError();
  }

  paymentInstance.on('payment.upi.noapp', function () {
    session.showLoadError(format('upi.intent_no_apps_error'), true);

    session.body.addClass('upi-noapp');
  });

  paymentInstance.on('payment.upi.selectapp', function () {
    session.showLoadError(format('upi.intent_select_app'), false);
  });

  paymentInstance.on('payment.upi.pending', function (data: { flow: string }) {
    if (data && data.flow === 'upi-intent') {
      return session.showLoadError(format('misc.payment_waiting_confirmation'));
    }
    session.showLoadError(format('upi.intent_accept_request'));
  });
}
