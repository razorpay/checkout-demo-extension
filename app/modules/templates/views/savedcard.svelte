<div
  tabIndex="0"
  class={'saved-card left-card' + (checked ? 'checked': '')}
  {...attributes}
>
  <div class="help up">EMI is not available on this card</div>
  <div class="cardtype" cardtype={cardEntity.networkCode}></div>
  <div class="saved-inner">
    <span class="saved-number">{cardEntity.last4}</span>
    <input class="saved-cvv cvv-input" type="tel" placeholder="CVV" inputmode="numeric" maxlength={card.cvvDigits} required pattern={`[0-9]{${card.cvvDigits}}`} />
    {#if card.plans}
      <div class="elem selector elem-savedcards-emi" data-bank={cardEntity.issuer} data-default="Select an EMI Plan" tabindex="0">
        <div class="help up">Please select the EMI duration</div>
        <i class="select-arrow">&#xe601;</i>
        <div class="overflow-parent">
          <span class="text theme-highlight">Select an EMI Plan</span>
        </div>
        <input type="hidden" class="emi_duration">
      </div>
    {/if}

    {#if cardEntity.networkCode === 'maestro'}
      <label for={`nocvv-${card.token}`} class="maestro-cvv">
        <input class="nocvv-checkbox" type="checkbox" id={`nocvv-${card.token}`} />
        <span class="checkout"></span>
        My Maestro Card doesn't have Expiry/CVV
      </label>
    {/if}
  </div>
  {#if card.debitPin}
    <div class="elem-wrap flow-selection-container">
      <div class="flow input-radio">
        <input type="radio" name={`auth_type-${card.token}`} id={`flow-3ds-${card.token}`} value="c3ds" class="auth_type_radio" checked>
        <label for={`flow-3ds-${card.token}`}>
          <div class="radio-display"></div>
          <div class="label-content">Pay using <strong>OTP / Password </strong></div>
        </label>
      </div>
      <div class="flow input-radio">
        <input type="radio" name={`auth_type-${card.token}`} id={`flow-pin-${card.token}`} value="pin" class="auth_type_radio">
        <label for={`flow-pin-${card.token}`}>
          <div class="radio-display"></div>
          <div class="label-content">Pay using <strong>ATM PIN</strong></div>
        </label>
      </div>
    </div>
  {/if}
</div>

<script>
  export default {
    computed: {
      attributes: ({ card }) => {
        const {
          card: cardEntity,
          debitPin,
          network,
          plans,
          token,
        } = card;

        const {
          issuer: bank,
          networkCode,
        } = cardEntity;

        const attribs = {
          token,
        };

        if (plans) {
          attribs.emi = true;
          attribs.bank = bank;
        }

        if (networkCode === 'maestro') {
          attribs.maestro = true;
        }

        if (debitPin) {
          attribs.pin = true;
        }

        return attribs;
      },

      cardEntity: ({ card }) => card.card,
    }
  }
</script>
