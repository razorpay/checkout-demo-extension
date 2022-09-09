<script lang="ts">
  import {
    CONTACT_REGEX,
    INDIAN_CONTACT_PATTERN,
    INDIAN_CONTACT_REGEX,
    INDIA_COUNTRY_CODE,
    PHONE_REGEX_INDIA,
  } from 'common/constants';
  import Field from 'ui/components/Field.svelte';
  import Icon from 'ui/elements/Icon.svelte';
  import info from 'ui/icons/payment-methods/info';
  import { emiContact, contact, country } from 'checkoutstore/screens/home';
  import circle_check from 'one_click_checkout/rtb_modal/icons/circle_check';
  import { t } from 'svelte-i18n';
  import {
    ADD_MOBILE_NUMBER,
    CHECK_ELIGIBILITY,
    CONTACT_LABEL,
    CONTACT_TOOLTIP,
    ELIGIBLE_FOR_EMI,
    ENTER_DIGIT_MOBILE_NUMBER,
  } from 'ui/labels/debit-emi';

  import { clickOutside } from 'one_click_checkout/helper';
  import { onMount } from 'svelte';
  import { isRedesignV15 } from 'razorpay';
  import { checkEligibility } from 'emiV2/helper/eligibility';
  import { isCardlessTab } from 'emiV2/helper/tabs';
  import {
    cardlessEligibilityError,
    selectedInstrumentCardlessEligible,
    loadingEligibility,
    isEmiContactValid,
    eligibilityInfoClicked,
  } from 'checkoutstore/screens/emi';
  import { selectedPlan } from 'checkoutstore/emi';
  import { MOBILE_NUMBER_INVALID } from 'ui/labels/emi';

  let contactValue = '';
  contactValue = $emiContact || $contact || '';

  onMount(() => {
    removeZeroFromPhoneAsynchronously();
  });

  function removeZeroFromPhoneAsynchronously() {
    setTimeout(() => {
      if ($country === '+91') {
        if (contactValue.startsWith('0')) {
          contactValue = contactValue.slice(1);
        }

        if (contactValue.startsWith('+91')) {
          contactValue = contactValue.slice(3);
        }
      }
    });
  }

  let validationText = '';

  let showEligibilitySpan = false;
  $: {
    if (contactValue.length === 10) {
      showEligibilitySpan = true;
      validationText = '';
    } else {
      $selectedInstrumentCardlessEligible = false;
      showEligibilitySpan = false;
      $cardlessEligibilityError = '';
    }
  }

  const handleCheckEligibility = () => {
    // Need to clear the existing selected plan
    // In order to avoid eligibility API failure
    // else emi_duration will gp in the API call
    $selectedPlan = null;
    checkEligibility();
  };

  $: {
    validationText = $cardlessEligibilityError
      ? $t($cardlessEligibilityError)
      : '';
  }

  $: showTooltip = false;

  function handleShowTooltip() {
    $eligibilityInfoClicked = true;
    showTooltip = true;
  }

  function handleHideTooltip() {
    showTooltip = false;
  }

  let oneCCFieldProps = {};

  const isRedesignV15Enabled = isRedesignV15();

  $: {
    if (isRedesignV15Enabled) {
      oneCCFieldProps = {
        elemClasses: 'add-card-fields-one-cc-wrapper',
        inputFieldClasses: 'add-card-fields-one-cc',
        labelClasses: 'add-card-fields-label-one-cc',
        labelUpperClasses: 'add-card-fields-label-upper-one-cc',
      };
    }
  }

  $: eligibilit_span_class = $selectedInstrumentCardlessEligible
    ? 'emi-eligible'
    : 'check-eligibility-btn';

  const handleContactInput = (e) => {
    contactValue = e.target.value;
    $emiContact = e.target.value;

    if (getValidationText()) {
      $isEmiContactValid = false;
    } else {
      $isEmiContactValid = true;
    }
  };

  // Phone Validation for 1CC
  function getValidationText() {
    if (!contactValue) {
      return $t(ENTER_DIGIT_MOBILE_NUMBER);
    }
    if ($country === INDIA_COUNTRY_CODE) {
      return !PHONE_REGEX_INDIA.test(contactValue) ||
        !INDIAN_CONTACT_REGEX.test(contactValue)
        ? $t(MOBILE_NUMBER_INVALID)
        : '';
    }
    return !CONTACT_REGEX.test(contactValue) ? $t(MOBILE_NUMBER_INVALID) : '';
  }

  const handleOnBlur = () => {
    validationText = getValidationText();

    if (validationText) {
      $isEmiContactValid = false;
    }
  };
</script>

<div
  class:phone-number-container-onecc={isRedesignV15Enabled}
  class="phone-number-container"
>
  {#if !$cardlessEligibilityError && isCardlessTab()}
    <p class="contact-header">
      {$t(ENTER_DIGIT_MOBILE_NUMBER)}
    </p>
  {/if}
  <div class="label-container">
    <p>{$t(ADD_MOBILE_NUMBER)}</p>
    <div class="tooltip-container" on:click={handleShowTooltip}>
      <Icon icon={info('#666666')} />
      <div
        class="elem-wrap-save-address-tc"
        use:clickOutside
        on:click_outside={handleHideTooltip}
      >
        {#if showTooltip}
          <div class="save-address-tooltip">
            {$t(CONTACT_TOOLTIP)}
          </div>
        {/if}
      </div>
    </div>
  </div>
  <div
    class="contact-field-container"
    class:validation-error-onecc={!!validationText}
  >
    {#if showEligibilitySpan && isCardlessTab()}
      {#if $loadingEligibility}
        <div
          class="spinner async-load"
          class:async-load-1cc={isRedesignV15Enabled}
        />
      {:else}
        <span
          on:click={() => {
            if (!$isEmiContactValid) {
              return;
            }
            handleCheckEligibility();
          }}
          class="eligibility-span {eligibilit_span_class}"
          class:eligibility-span-redesigns={isRedesignV15Enabled}
        >
          {#if $selectedInstrumentCardlessEligible}
            <Icon icon={circle_check()} />
            <span>{$t(ELIGIBLE_FOR_EMI)}</span>
          {:else}
            {$t(CHECK_ELIGIBILITY)}
          {/if}
        </span>
      {/if}
    {/if}
    <Field
      label={$t(CONTACT_LABEL)}
      id="emi-contact"
      name="emi-contact"
      type="tel"
      autocomplete="tel"
      required
      autocompletetype="phone-full"
      labelClasses="add-card-fields-label-one-cc"
      pattern={INDIAN_CONTACT_PATTERN}
      handleFocus={true}
      handleBlur={true}
      handleInput={true}
      value={contactValue}
      on:input={handleContactInput}
      on:blur={handleOnBlur}
      {validationText}
      showValidations={Boolean(validationText)}
      {...oneCCFieldProps}
    />
    <!-- TODO: Will be replaced by the error message inside the field component from redesign -->
  </div>
  {#if validationText && !isRedesignV15Enabled}
    <p class="eligibility-error">{validationText}</p>
  {/if}
</div>

<style>
  .contact-header {
    font-size: 14px;
    color: #263a4a;
    margin-top: 0px;
  }
  .phone-number-container {
    margin-bottom: 22px;
  }
  .phone-number-container-onecc {
    margin-left: 0;
    margin-right: 0;
  }
  .label-container {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
  }
  .label-container p {
    margin: 0;
    color: #263a4a;
    font-size: 14px;
    font-weight: 600;
    margin-right: 10px;
  }
  .contact-field-container {
    position: relative;
    margin-top: 22px;
  }
  .eligibility-span {
    position: absolute;
    right: 10px;
    top: 8px;
    z-index: 1;
  }
  .eligibility-span-redesigns {
    top: 30%;
  }

  .validation-error-onecc .eligibility-span-redesigns {
    top: 20%;
  }
  .check-eligibility-btn {
    color: var(--highlight-color);
    font-size: 14px;
    /* text-decoration: underline; */
    cursor: pointer;
  }
  .emi-eligible {
    background: rgba(85, 171, 104, 0.25);
    border-radius: 30px;
    color: #4f4f4f;
    font-size: 10px;
    padding: 4px 8px 4px 4px;
    display: flex;
    align-items: center;
  }
  .emi-eligible span {
    margin-left: 4px;
  }

  .tooltip-container {
    position: relative;
    cursor: pointer;
    top: 2px;
  }
  .save-address-tooltip {
    transition: 0.25s ease-in transform, 0.16s ease-in opacity;
    transform: translateY(-10px);
    color: #fff;
    position: absolute;
    line-height: 17px;
    padding: 12px;
    font-size: 12px;
    background: #555555;
    box-shadow: rgba(0, 0, 0, 0.05) 1px 1px 2px 0;
    z-index: 3;
    border-radius: 2px;
    bottom: -76px;
    letter-spacing: 0.125px;
    min-width: 164px;
    max-width: 200px;
    left: -60px;
  }
  .save-address-tooltip::after {
    content: '';
    position: absolute;
    width: 0;
    height: 0;
    border-width: 8px;
    border-style: solid;
    border-color: transparent transparent #555555;
    bottom: 100%;
    left: 68px;
    margin: 0 0 -1px -10px;
  }
  .eligibility-error {
    color: #b21528;
    font-size: 10px;
    margin: 0;
    margin-top: 6px;
  }

  .async-load {
    position: absolute;
    right: 0px;
    top: 8px;
    z-index: 1;
  }
  .async-load-1cc {
    top: 24%;
    right: 6px;
  }
</style>
