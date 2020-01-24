const AUTH_PENDING_MSG =
  'Payment is pending authorization. Request for authorization from approver.';

/**
 * If error code exists and matches the string, removed the retry button
 * and replaces it with ok button, which closes checkout.
 * @param {Session} session
 * @param {string} message
 */
export function replaceRetryIfCorporateNetbanking(session, message) {
  if (message === AUTH_PENDING_MSG) {
    session.isCorporateBanking = true;

    _El.detach(_Doc.querySelector('#fd-hide'));

    const okButton =
      _El.create('button')
      |> _El.addClass('btn')
      |> _El.setContents('OK')
      |> _El.setAttribute('id', 'fd-ok')
      |> _El.appendTo(_Doc.querySelector('#error-message'));

    okButton.addEventListener('click', () => {
      session.hide();
    });
  } else {
    _Doc.querySelector('#fd-hide').focus();
  }
}
