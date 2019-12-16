<script>
  import { createEventDispatcher } from 'svelte';

  import Field from 'templates/views/ui/Field.svelte';
  import Icon from 'templates/views/ui/Icon.svelte';
  import { getSession } from 'sessionmanager';
  import { Formatter } from 'formatter';
  import { getCardType, getIin, getCardDigits } from 'common/card';
  import { DEFAULT_AUTH_TYPE_RADIO, SHOWN_CLASS } from 'common/constants';

  import { getIcon } from 'icons/network';

  export let value = '';
  export let type = null;

  const dispatch = createEventDispatcher();
  const session = getSession();
  const INVALID_CLASS = 'invalid';

  let invalid = false;
  let field = null;
  let formatterObj = null;

  const Flows = {
    PIN: 'pin',
    OTP: 'otp',
    RECURRING: 'recurring',
  };

  /**
   * @param {Object} flows
   * @param {String} flow
   *
   * @return {Boolean}
   */
  const isFlowApplicable = _.curry2((flows, flow) => Boolean(flows[flow]));

  export function onShown() {}

  export function getType() {
    return type;
  }

  function handleInput(e) {
    value = e.target.value;
    onChange();
  }

  /**
   * Validate the card number.
   * @return {Boolean}
   */
  function sync() {
    const cardNumber = getCardDigits(value);
    const cardType = getCardType(cardNumber);

    let isValid = Formatter.rules.card.isValid.call({
      value: cardNumber,
      type: cardType,
    });

    if (!session.preferences.methods.amex && cardType === 'amex') {
      isValid = false;
    }

    return isValid;
  }

  function handleNetwork(data) {
    dispatch('network', { type });
    // TODO: check what amex, maestro and noamex classes do
    // update cvv element
    // var cvvlen = type !== 'amex' ? 3 : 4;
    // el_cvv.maxLength = cvvlen;
    // el_cvv.pattern = '^[0-9]{' + cvvlen + '}$';
    // $(el_cvv)
    //   .toggleClass('amex', type === 'amex')
    //   .toggleClass('maestro', type === 'maestro');
    //
    // if (!preferences.methods.amex && type === 'amex') {
    //   $('#elem-card').addClass('noamex');
    // } else {
    //   $('#elem-card').removeClass('noamex');
    // }
  }

  function setCardValidity(isValid) {
    const cardNumber = getCardDigits(value);
    const cardType = getCardType(cardNumber);
    const caretPosition = field.getCaret();

    if (isValid) {
      invalid = false;
      /**
       * Focus on expiry elem if we have the entire card number
       * and the cursor is at the end of the input field.
       */
      if (
        value.length === caretPosition &&
        document.activeElement === field.input
      ) {
        if (cardType !== 'maestro') {
          dispatch('filled');
        }
      }
    } else {
      invalid = true;
    }
  }

  function setDebitPinRadiosVisibility(visible) {
    const container = _Doc.querySelector(
      '#add-card-container .flow-selection-container'
    );
    const checkedRadio = _Doc.querySelector(
      '#add-card-container .flow.input-radio input[type=radio]:checked'
    );

    if (visible) {
      // Show container
      _El.addClass(container, SHOWN_CLASS);

      // Get default radio
      const defaultRadio = _Doc.querySelector(
        `#add-card-container .flow.input-radio #flow-${DEFAULT_AUTH_TYPE_RADIO}`
      );

      // Set default radio to checked if none is checked
      if (!checkedRadio && defaultRadio) {
        defaultRadio.checked = true;
      }
    } else {
      // Hide container
      _El.removeClass(container, SHOWN_CLASS);

      // Uncheck values
      if (checkedRadio) {
        checkedRadio.checked = false;
      }
    }
  }

  const showDebitPinRadios = () => setDebitPinRadiosVisibility(true);
  const hideDebitPinRadios = () => setDebitPinRadiosVisibility(false);

  /**
   * Checks and performs actions related to card flows
   * and validate the card input.
   * @param cardElem {DOMNode} #elem-card or similar
   * @param cardInput (DOMNode) <input /> of card number
   * @param {DOMNode} cardExpiry Expiry <input> on which to focus if card is valid
   */
  function onChange() {
    // Perform sync validation initially
    setCardValidity(sync());

    const cardNumber = getCardDigits(value);
    const iin = getIin(cardNumber);
    const isStrictlyRecurring =
      session.recurring && session.get('recurring') !== 'preferred';

    const flowChecker = (flows = {}) => {
      const cardNumber = getCardDigits(value);
      const isIinSame = getIin(cardNumber) === iin;

      // If the card number was changed before response, do nothing
      if (!isIinSame) {
        return;
      }

      let isValid = sync();

      if (isStrictlyRecurring) {
        isValid = isValid && isFlowApplicable(flows, Flows.RECURRING);
      } else {
        // Debit-PIN is not supposed to work in case of recurring
        if (isFlowApplicable(flows, Flows.PIN)) {
          showDebitPinRadios();
        } else {
          hideDebitPinRadios();
        }
      }

      setCardValidity(isValid);
    };

    if (iin.length < 6) {
      hideDebitPinRadios();
    }

    if (iin.length >= 6) {
      session.r.getCardFlows(iin, flowChecker);
    }
  }
</script>

<style>
  .field-container {
    position: relative;
  }

  .icon {
    position: absolute;
    right: 4px;
    top: 32px;
    width: 24px;
  }
</style>

<div class="field-container {invalid ? 'name_readonly' : ''}">
  {#if type}
    <div class="icon">
      <Icon icon={getIcon(type)} />
    </div>
  {/if}
  <!-- TODO: set maxlength based on type or remove from here if already handled by formatter -->
  <!-- TODO: handle prefill and readonly -->
  <Field
    formatter={{ type: 'card', on: { network: handleNetwork } }}
    helpText="Please enter your card number"
    name="card[number]"
    required={true}
    {value}
    type="tel"
    formatterObj
    autocomplete="off"
    label="Card Number"
    handleBlur
    handleFocus
    handleInput
    on:
    maxlength={19}
    bind:this={field}
    on:input={handleInput} />
</div>
