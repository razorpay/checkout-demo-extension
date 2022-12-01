<script lang="ts">
  // svelte imports
  import { createEventDispatcher } from 'svelte';

  // UI imports
  import GiftCardNumber from 'one_click_checkout/gift_card/ui/GiftCardNumber.svelte';

  // i18n imports
  import { t } from 'svelte-i18n';

  // store imports
  import { giftCardForm } from 'one_click_checkout/gift_card/store';

  // Analytics imports
  import { Events } from 'analytics';
  import GiftCardEvents from 'one_click_checkout/gift_card/analytics';

  // utils imports
  import { getErrorMessageLabel } from 'one_click_checkout/gift_card/helpers';
  import { checkPatternMatching } from 'one_click_checkout/common/utils';

  // constants imports
  import { GC_NUMBER } from 'one_click_checkout/gift_card/constants';

  // type imports
  import type { fieldErr } from 'one_click_checkout/gift_card/types/giftcard';

  let error: fieldErr = {};
  const dispatch = createEventDispatcher();
  const isFormComplete = () =>
    Object.values(error)?.every((value) => value === null);
  const handleInput = (id: string, value: string, pattern: string) => {
    const isFieldValueValid = checkPatternMatching({ value, pattern });
    const errorLabel = getErrorMessageLabel({
      id,
      isFieldValueValid,
      value,
    });
    error[id] = errorLabel ? $t(errorLabel) : null;
    giftCardForm.update((prevValue) => ({
      ...prevValue,
      [id]: value,
    }));
    dispatch('formCompletion', {
      isComplete: isFormComplete(),
    });
  };

  const handleBlur = (id: string) => {
    const eventName =
      id === GC_NUMBER
        ? GiftCardEvents.GC_NUMBER_ENTERED
        : GiftCardEvents.GC_PIN_ENTERED;
    Events.TrackBehav(eventName);
  };
</script>

<div class="gift-card-form">
  <div class="gift-card-field">
    <GiftCardNumber
      error={error[GC_NUMBER]}
      value={$giftCardForm[GC_NUMBER]}
      {handleInput}
      {handleBlur}
    />
  </div>
</div>

<style>
  .gift-card-form {
    font-size: var(--font-size-body);
    font-style: normal;
    font-weight: var(--font-weight-regular);
    line-height: 16px;
    letter-spacing: 0;
    color: #8d97a1;
    padding: 0 16px;
  }

  .gift-card-field
    :global(.elem-one-click-checkout > input::-webkit-outer-spin-button) {
    -webkit-appearance: none;
    margin: 0;
  }

  .gift-card-field
    :global(.elem-one-click-checkout > input::-webkit-inner-spin-button) {
    -webkit-appearance: none;
    margin: 0;
  }

  .gift-card-field :global(input[type='number']) {
    -moz-appearance: textfield;
  }
</style>
