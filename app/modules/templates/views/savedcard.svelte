<div
  tabIndex="0"
  class="saved-card left-card"
  {...attributes}
>
  <div class="help up">EMI is not available on this card</div>
  <div class="cardtype" cardtype={card.networkCode}></div>
  <div class="saved-inner">
    <span class="saved-number">{card.last4}</span>
    <input
      class="saved-cvv cvv-input"
      inputmode="numeric"
      maxlength={cvvDigits}
      pattern={`[0-9]{${cvvDigits}}`}
      placeholder="CVV"
      required
      type="tel"
    />
    {#if plans}
      <div class="elem selector elem-savedcards-emi" data-bank={issuer} data-default="Select an EMI Plan" tabindex="0">
        <div class="help up">Please select the EMI duration</div>
        <i class="select-arrow">&#xe601;</i>
        <div class="overflow-parent">
          <span class="text theme-highlight">Select an EMI Plan</span>
        </div>
        <input type="hidden" class="emi_duration">
      </div>
    {/if}

    {#if card.networkCode === 'maestro'}
      <label for={`nocvv-${token}`} class="maestro-cvv">
        <input class="nocvv-checkbox" type="checkbox" id={`nocvv-${token}`} />
        <span class="checkout"></span>
        My Maestro Card doesn't have Expiry/CVV
      </label>
    {/if}
  </div>
  {#if debitPin}
    <div class="elem-wrap flow-selection-container">
      <Radio
        checked={true}
        containerClass="flow"
        id={`flow-3ds-${token}`}
        inputClass="auth_type_radio"
        label="Pay using <strong>OTP / Password </strong>"
        name={`auth_type-${token}`}
        value="c3ds"

        on:change="trackAtmRadio(event)"
      />
      <Radio
        contaierClass="flow"
        id={`flow-pin-${token}`}
        inputClass="auth_type_radio"
        label="Pay using <strong>ATM PIN</strong>"
        name={`auth_type-${token}`}
        value="pin"

        on:change="trackAtmRadio(event)"
      />
    </div>
  {/if}
</div>

<script>
  import Analytics from 'analytics';
  import * as AnalyticsTypes from 'analytics-types';
  import { DEFAULT_AUTH_TYPE_RADIO } from 'common/constants';

  export default {
    components: {
      Radio: 'templates/views/ui/Radio.svelte',
    },

    computed: {
      attributes: ({ card, debitPin, network, plans, token }) => {
        const {
          issuer: bank,
          networkCode,
        } = card;

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
    },

    methods: {
      trackAtmRadio: function (event) {
        Analytics.track('atmpin:flows:change', {
          type: AnalyticsTypes.BEHAV,
          data: {
            default_auth_type: DEFAULT_AUTH_TYPE_RADIO,
            flow: event.target.value || null,
          },
        });
      },
    }
  }
</script>
