<script>
  // Utils
  import { isContactReadOnly } from 'checkoutstore';
  import { findCountryCode } from 'common/countrycodes';

  // UI imports
  import Field from 'ui/components/Field.svelte';
  import SearchModal from 'ui/elements/SearchModal.svelte';
  import CountryCodeSearchItem from 'ui/elements/search-item/CountryCode.svelte';
  import Track from 'tracker';

  import {
    COUNTRY_CODE_PATTERN,
    PHONE_PATTERN,
    PHONE_PATTERN_INDIA,
  } from 'common/constants';
  import { COUNTRY_TO_CODE_MAP } from 'common/countrycodes';

  // i18n
  import {
    CONTACT_LABEL_REQUIRED,
    CONTACT_LABEL_OPTIONAL,
    CONTACT_HELP_TEXT,
    COUNTRY_LABEL,
    COUNTRY_HELP_TEXT,
    COUNTRY_SEARCH_ALL,
    COUNTRY_SEARCH_PLACEHOLDER,
  } from 'ui/labels/home';

  import { t } from 'svelte-i18n';
  import { formatMessageWithLocale } from 'i18n';

  // Refs
  let countryField;
  let phoneField;

  // Props
  export let country;
  export let phone;
  export let isOptional;

  const COUNTRY_CODE_REGEX = isOptional ? '.*' : COUNTRY_CODE_PATTERN;
  const searchIdentifier = `country_code_select_${Track.makeUid()}`; // Add a UUID since this field can exist in multiple places

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

  let countryCodesList;
  $: $t, (countryCodesList = generateCountryCodesList());

  let searchModalOpen = false;

  function appendPlusToCountryCodeAsynchronously() {
    setTimeout(() => {
      if (!_Str.startsWith(country, '+')) {
        country = `+${country}`;
      }
    });
  }

  function removeZeroFromPhoneAsynchronously() {
    setTimeout(() => {
      if (country === '+91') {
        if (_Str.startsWith(phone, '0')) {
          phone = phone.slice(1);
        }

        if (_Str.startsWith(phone, '+91')) {
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

  function generateCountryCodesList() {
    let list = [];

    _Obj.loop(COUNTRY_TO_CODE_MAP, (code, country) => {
      const i18nLabel = `countries.${country}`;
      const originalName = formatMessageWithLocale(i18nLabel, 'en');
      const translatedName = $t(i18nLabel);

      list.push({
        country,
        _key: country,
        original: originalName,
        name: translatedName,
        country_code: code,
      });
    });

    // Sort countries using this order
    const orderOfCountries = ['IN', 'US', 'GB', 'CA', 'AU'];

    list = list.sort((a, b) => {
      const countryA = a.country;
      const countryB = b.country;

      const hasA = _Arr.contains(orderOfCountries, countryA);
      const hasB = _Arr.contains(orderOfCountries, countryB);

      if (hasA && hasB) {
        const indexA = orderOfCountries.indexOf(countryA);
        const indexB = orderOfCountries.indexOf(countryB);

        if (indexA < indexB) {
          return -1; // a comes first
        } else {
          return 1; // b comes first
        }
      } else if (hasA) {
        return -1; // a comes first
      } else if (hasB) {
        return 1; // b comes first
      } else {
        return 0; // leave unchanged
      }
    });

    return list;
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
    label={$t(COUNTRY_LABEL)}
    on:input={e => (country = e.target.value)}
    on:blur
    value={country}
    helpText={$t(COUNTRY_HELP_TEXT)} />
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
    on:input={e => (phone = e.target.value)}
    on:blur
    value={phone}
    helpText={$t(CONTACT_HELP_TEXT)} />
  <!-- LABEL: Please enter a valid contact number -->
</div>

<!-- LABEL: Search a country -->
<!-- LABEL: All countries -->
<SearchModal
  identifier={searchIdentifier}
  placeholder={$t(COUNTRY_SEARCH_PLACEHOLDER)}
  all={$t(COUNTRY_SEARCH_ALL)}
  items={countryCodesList}
  keys={['country_code', 'country', 'name', 'original']}
  component={CountryCodeSearchItem}
  bind:open={searchModalOpen}
  on:close={closeSearch}
  on:select={({ detail }) => {
    country = `+${detail.country_code}`;
    closeCountryCodeModal();
  }} />
