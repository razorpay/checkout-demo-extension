<script>
  import { getSession } from 'sessionmanager';

  import CancelReasonPicker from 'ui/components/cancellation-modals/CancelReasonPicker.svelte';

  const session = getSession();

  const cancellationReasonsContainer = _Doc.querySelector('#error-message');
  const method = 'netbanking';
  const cancellationReasons = [
    {
      value: 'wrong_bank_selected',
      label: 'Wrong bank selected',
    },
    {
      value: 'forgot_bank_details',
      label: 'Forgot username or password',
    },
    {
      value: 'bank_page_error',
      label: 'Error on bank page',
    },
    {
      value: 'other',
      label: 'Other',
    },
  ];

  const onBack = function() {
    _El.removeClass(cancellationReasonsContainer, 'cancel_' + method);
    session.hideOverlay(cancellationReasonsContainer);
    session.r.emit('payment.cancel', {
      '_[reason]': 'other',
    });
  };

  const onSubmit = function() {
    const netbanking_radio = _Doc.querySelector(
      '#cancel_netbanking input:checked'
    );
    if (!netbanking_radio[0]) {
      return;
    }
    _El.removeClass(cancellationReasonsContainer, 'cancel_' + method);
    session.hideOverlay(cancellationReasonsContainer);
    const metaParam = {};
    metaParam[netbanking_radio.prop('name')] = netbanking_radio.val();
    session.r.emit('payment.cancel', metaParam);
  };
</script>

<CancelReasonPicker
  method="netbanking"
  reasons={cancellationReasons}
  title="Please share a reason for cancelling this payment"
  {onBack}
  {onSubmit} />
