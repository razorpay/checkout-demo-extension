<script>
  import { getSession } from 'sessionmanager';

  import {
    WRONG_BANK_SELECTED,
    FORGOT_USERNAME_PASSWORD,
    ERROR_BANK_PAGE,
    CANCEL_REASON_OTHER,
    CANCELLATION_MODAL_TITLE,
  } from 'ui/labels/netbanking';

  import CancelReasonPicker from 'ui/components/cancellation-modals/CancelReasonPicker.svelte';

  const session = getSession();

  const cancellationReasonsContainer = _Doc.querySelector('#error-message');
  const method = 'netbanking';
  const cancellationReasons = [
    {
      value: 'wrong_bank_selected',

      // LABEL: Wrong bank selected
      label: WRONG_BANK_SELECTED,
    },
    {
      value: 'forgot_bank_details',

      // LABEL: Forgot username or password
      label: FORGOT_USERNAME_PASSWORD,
    },
    {
      value: 'bank_page_error',

      // LABEL: Error on bank page
      label: ERROR_BANK_PAGE,
    },
    {
      value: 'other',

      // LABEL: Other
      label: CANCEL_REASON_OTHER,
    },
  ];

  const onSubmit = function(reason) {
    if (!reason) {
      return;
    }
    _El.removeClass(cancellationReasonsContainer, 'cancel_' + method);
    session.hideOverlay(cancellationReasonsContainer);
    const metaParam = {};
    metaParam['_[reason]'] = reason;
    session.r.emit('payment.cancel', metaParam);
  };
</script>

<CancelReasonPicker
  method="netbanking"
  reasons={cancellationReasons}
  title={CANCELLATION_MODAL_TITLE}
  {onSubmit}
  } />
