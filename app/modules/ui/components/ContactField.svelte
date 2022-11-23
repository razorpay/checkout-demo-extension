<script lang="ts">
  // Utils
  import { createEventDispatcher } from 'svelte';
  import * as _ from 'utils/_';

  // UI imports
  import Field from 'ui/components/Field.svelte';
  import CountrySearchModal from 'ui/components/CountrySearchModal.svelte';

  import {
    CONTACT_REGEX,
    COUNTRY_CODE_PATTERN,
    INDIA_COUNTRY_CODE,
    PHONE_PATTERN,
    PHONE_PATTERN_INDIA,
    INDIAN_CONTACT_REGEX_WITH_ZERO,
  } from 'common/constants';

  // i18n
  import {
    CONTACT_LABEL_REQUIRED,
    CONTACT_LABEL_OPTIONAL,
    COUNTRY_LABEL,
    COUNTRY_HELP_TEXT,
    PHONE_NUMBER,
  } from 'ui/labels/home';
  import { CONTACT_ERROR_LABEL } from 'one_click_checkout/address/i18n/labels';

  import { t } from 'svelte-i18n';

  import { isRedesignV15, getPreferences } from 'razorpay';
  import { isContactReadOnly } from 'checkoutframe/customer';
  import { isContactValid } from 'one_click_checkout/common/details/store';
  import autotest from 'autotest';
  import { getIndErrLabel } from 'one_click_checkout/helper';
  import { COUNTRY_CONFIG } from 'common/countrycodes';

  // Refs
  let countryField;
  let phoneField;

  // Props
  export let country;
  export let phone;
  export let isOptional;
  export let inAddress = false;
  export let validationText;
  export let showValidations = false;

  const isRedesignV15Enabled = isRedesignV15();

  const dispatch = createEventDispatcher();

  const COUNTRY_CODE_REGEX = isOptional ? '.*' : COUNTRY_CODE_PATTERN;

  let contactRegex = isOptional ? '.*' : PHONE_PATTERN;
  $: {
    if (isOptional) {
      contactRegex = '.*';
    } else {
      if (country === '+91') {
        contactRegex = PHONE_PATTERN_INDIA;
      } else {
        contactRegex = PHONE_PATTERN;
      }
    }
  }

  let searchModalOpen = false;

  function appendPlusToCountryCodeAsynchronously() {
    setTimeout(() => {
      if (!country.startsWith('+')) {
        country = `+${country}`;
      }
    });
  }

  function removeZeroFromPhoneAsynchronously() {
    setTimeout(() => {
      if (country === '+91') {
        if (phone.startsWith('0')) {
          phone = phone.slice(1);
        }

        if (phone.startsWith('+91')) {
          phone = phone.slice(3);
        }
      }
    });
  }

  let label = isOptional ? CONTACT_LABEL_OPTIONAL : CONTACT_LABEL_REQUIRED;
  // if (isRedesignV15Enabled) {
  //   label = isOptional ? MOBILE_NUMBER_OPTIONAL : MOBILE_NUMBER;
  // }

  function closeSearch() {
    searchModalOpen = false;
  }

  function downArrowHandler(event) {
    const DOWN_ARROW = 40;
    const key = _.getKeyFromEvent(event);

    if (key === DOWN_ARROW) {
      openCountryCodeModal(event);
    }
  }

  function openCountryCodeModal(event) {
    // Don't open the modal if contact is readonly
    if (isContactReadOnly()) {
      return;
    }

    if (event) {
      event.preventDefault();
    }

    countryField.blur();
    searchModalOpen = true;
  }

  function closeCountryCodeModal() {
    closeSearch();

    if (phoneField) {
      phoneField.focus();
    }
  }

  function validateContact(country, phone) {
    const merchantCountryCode = getPreferences('merchant_country');
    if (country === INDIA_COUNTRY_CODE) {
      return !INDIAN_CONTACT_REGEX_WITH_ZERO.test(phone)
        ? $t(getIndErrLabel(phone))
        : null;
    } else if (merchantCountryCode) {
      const countryDetails = COUNTRY_CONFIG[merchantCountryCode];
      const regexPattern = countryDetails.phone_number_regex;
      if (regexPattern) {
        const phoneNumberRegex = new RegExp(regexPattern);
        return !phoneNumberRegex.test(phone) ? $t(CONTACT_ERROR_LABEL) : null;
      }
    }
    return !CONTACT_REGEX.test(phone) ? $t(CONTACT_ERROR_LABEL) : null;
  }

  $: validationText = validateContact(country, phone);
  $: $isContactValid = !validationText;
</script>

<div class="fields-container">
  <Field
    bind:this={countryField}
    id="country-code"
    name="country-code"
    type="tel"
    autocomplete="tel-country-code"
    on:click={openCountryCodeModal}
    on:autocomplete={appendPlusToCountryCodeAsynchronously}
    on:paste={appendPlusToCountryCodeAsynchronously}
    on:blur={appendPlusToCountryCodeAsynchronously}
    on:keydown={downArrowHandler}
    required={!isOptional}
    xautocompletetype="phone-country-code"
    pattern={COUNTRY_CODE_REGEX}
    readonly={isContactReadOnly()}
    icon=""
    formatter={{ type: 'country_code' }}
    label={isRedesignV15Enabled ? $t(PHONE_NUMBER) : $t(COUNTRY_LABEL)}
    on:input={(e) => (country = e.target.value)}
    on:blur
    value={country}
    helpText={$t(COUNTRY_HELP_TEXT)}
    elemClasses={inAddress ? 'address-elem' : ''}
    labelClasses={`${inAddress && 'address-label'} ${
      isRedesignV15Enabled && 'hidden'
    }`}
    inputFieldClasses={isRedesignV15Enabled
      ? 'country-code-one-click-checkout'
      : ''}
    showDropDownIcon={true}
  />
  <!-- LABEL: Please enter a valid country code -->

  <Field
    bind:this={phoneField}
    id="contact"
    name="contact"
    type="tel"
    autocomplete="tel-national"
    on:autocomplete={removeZeroFromPhoneAsynchronously}
    on:paste={removeZeroFromPhoneAsynchronously}
    on:blur={removeZeroFromPhoneAsynchronously}
    required={!isOptional}
    xautocompletetype="phone-national"
    pattern={contactRegex}
    readonly={isContactReadOnly()}
    formatter={{ type: 'phone' }}
    label={$t(label)}
    icon=""
    on:input={(e) => {
      phone = e.target.value;
      dispatch('input', e);
    }}
    on:blur
    value={phone}
    elemClasses={inAddress ? 'address-elem' : ''}
    labelClasses={`${inAddress && 'address-label'} ${
      isRedesignV15Enabled && 'contact-label'
    }`}
    inputFieldClasses={isRedesignV15Enabled
      ? 'phone-field-one-click-checkout'
      : ''}
    errorValidationClasses={isRedesignV15Enabled
      ? 'contact-validation-error'
      : ''}
    {validationText}
    {showValidations}
    attributes={{ ...autotest('contact') }}
  />
  <!-- LABEL: Please enter a valid contact number -->
</div>

<!-- LABEL: Search a country -->
<!-- LABEL: All countries -->
<CountrySearchModal
  bind:open={searchModalOpen}
  on:close={closeSearch}
  on:select={({ detail }) => {
    country = `+${detail.country_code}`;
    dispatch('countrySelect', {
      country_code: country,
      country: detail.country,
    });
    closeCountryCodeModal();
  }}
/>

<style>
  .fields-container {
    display: flex;
    outline: red;
  }

  .fields-container > :global(div:first-child) {
    flex-shrink: 0;
    flex-basis: 25%;
  }

  .fields-container > :global(div:first-child > i) {
    transform: rotate(-90deg) scale(0.5);
  }

  .fields-container > :global(div:last-child) {
    flex-grow: 1;
    margin-left: 16px;
  }
</style>
