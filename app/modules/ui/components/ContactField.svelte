<script>
  // Utils
  import { isContactReadOnly } from 'checkoutstore';
  import { createEventDispatcher } from 'svelte';

  // UI imports
  import Field from 'ui/components/Field.svelte';
  import CountrySearchModal from 'ui/components/CountrySearchModal.svelte';

  import { shouldShowNewDesign } from 'one_click_checkout/store';

  import {
    COUNTRY_CODE_PATTERN,
    PHONE_PATTERN,
    PHONE_PATTERN_INDIA,
  } from 'common/constants';

  // i18n
  import {
    CONTACT_LABEL_REQUIRED,
    CONTACT_LABEL_OPTIONAL,
    COUNTRY_LABEL,
    COUNTRY_HELP_TEXT,
    PHONE_NUMBER,
  } from 'ui/labels/home';

  import { t } from 'svelte-i18n';

  import { isOneClickCheckout } from 'razorpay';

  // Refs
  let countryField;
  let phoneField;

  // Props
  export let country;
  export let phone;
  export let isOptional;
  export let inAddress = false;
  export let validationText;

  const shouldShowNewDesigns = shouldShowNewDesign();

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

  // LABEL: Phone with Country Code (Optional) / Phone with Country Code
  const label = isOptional ? CONTACT_LABEL_OPTIONAL : CONTACT_LABEL_REQUIRED;

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
    modifyIconPosition={!!validationText}
    formatter={{ type: 'country_code' }}
    label={shouldShowNewDesigns ? $t(PHONE_NUMBER) : $t(COUNTRY_LABEL)}
    on:input={(e) => (country = e.target.value)}
    on:blur
    value={country}
    helpText={$t(COUNTRY_HELP_TEXT)}
    elemClasses={inAddress ? 'address-elem' : ''}
    labelClasses={`${inAddress && 'address-label'} ${
      shouldShowNewDesign && 'hidden'
    }`}
    inputFieldClasses={shouldShowNewDesigns
      ? 'country-code-one-click-checkout'
      : ''}
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
    modifyIconPosition={!!validationText}
    on:input={(e) => (phone = e.target.value)}
    on:blur
    value={phone}
    elemClasses={inAddress ? 'address-elem' : ''}
    labelClasses={`${inAddress && 'address-label'} ${
      shouldShowNewDesign && 'contact-label'
    }`}
    inputFieldClasses={shouldShowNewDesigns
      ? 'phone-field-one-click-checkout'
      : ''}
    errorValidationClasses={shouldShowNewDesigns
      ? 'contact-validation-error'
      : ''}
    {validationText}
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
