<script lang="ts">
  // UI imports
  import Field from 'ui/components/Field.svelte';

  // i18n imports
  import { t } from 'svelte-i18n';
  import { GIFT_CARD_NUMBER } from 'one_click_checkout/gift_card/i18n/labels';

  // constants imports
  import {
    GC_NUMBER_REGEX_PATTERN,
    GC_NUMBER,
  } from 'one_click_checkout/gift_card/constants';

  // type imports
  import type {
    handleInputType,
    handleBlurType,
    errorType,
    valueType,
  } from 'one_click_checkout/gift_card/types/giftcard';

  export let handleInput: handleInputType;
  export let handleBlur: handleBlurType;
  export let error: errorType;
  export let value: valueType;

  const handleFieldInput = (id: string, evt: Event) => {
    handleInput(
      id,
      (<HTMLInputElement>evt.target)?.value,
      GC_NUMBER_REGEX_PATTERN
    );
  };
</script>

<div class="gift-card-number" data-testid="gift-card-number">
  <Field
    id={GC_NUMBER}
    name={GC_NUMBER}
    required
    validationText={error}
    pattern={GC_NUMBER_REGEX_PATTERN}
    {value}
    label={`${$t(GIFT_CARD_NUMBER)}`}
    on:blur={() => handleBlur(GC_NUMBER)}
    on:input={(evt) => handleFieldInput(GC_NUMBER, evt)}
  />
</div>

<style>
  .gift-card-number {
    margin-bottom: 24px;
  }
  .gift-card-number > :global(.elem-one-click-checkout) {
    width: 100%;
  }
  .gift-card-number > :global(.elem-one-click-checkout) {
    width: 100%;
  }
</style>
