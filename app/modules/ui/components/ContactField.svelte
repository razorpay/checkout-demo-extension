<script>
  // Utils
  import { isContactReadOnly, isContactOptional } from 'checkoutstore';
  import { findCountryCode } from 'common/countrycodes';

  // UI imports
  import Field from 'ui/components/Field.svelte';
  import SearchModal from 'ui/elements/SearchModal.svelte';
  import CountryCodeSearchItem from 'ui/elements/search-item/CountryCode.svelte';

  import { CONTACT_PATTERN } from 'common/constants';
  import { COUNTRY_TO_CODE_MAP } from 'common/countrycodes';

  // i18n
  import {
    CONTACT_LABEL_REQUIRED,
    CONTACT_LABEL_OPTIONAL,
    CONTACT_HELP_TEXT,
    COUNTRY_SEARCH_ALL,
    COUNTRY_SEARCH_PLACEHOLDER,
  } from 'ui/labels/home';

  import { t } from 'svelte-i18n';
  import { formatMessageWithLocale } from 'i18n';

  // Refs
  let searchModal;

  // Props
  export let value;

  const isOptional = isContactOptional();
  const CONTACT_REGEX = isOptional ? '.*' : CONTACT_PATTERN;

  let countryCodesList;
  $: $t, (countryCodesList = generateCountryCodesList());

  function appendCountryCodeAsynchronously() {
    setTimeout(() => {
      const internationalFormat = findCountryCode(value);

      if (internationalFormat.code) {
        value = `+${internationalFormat.code}${internationalFormat.phone}`;
      }
    });
  }

  // LABEL: Phone with Country Code (Optional) / Phone with Country Code
  const label = isOptional ? CONTACT_LABEL_OPTIONAL : CONTACT_LABEL_REQUIRED;

  function closeSearch() {
    searchModal.close();
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
</script>

<div>
  <Field
    id="contact"
    name="contact"
    type="tel"
    autocomplete="tel"
    on:autocomplete={appendCountryCodeAsynchronously}
    on:paste={appendCountryCodeAsynchronously}
    on:blur={appendCountryCodeAsynchronously}
    required={!isOptional}
    xautocompletetype="phone-full"
    pattern={CONTACT_REGEX}
    readonly={isContactReadOnly()}
    formatter={{ type: 'phone' }}
    label={$t(label)}
    icon="&#xe607;"
    on:input={e => (value = e.target.value)}
    on:blur
    {value}
    helpText={$t(CONTACT_HELP_TEXT)} />
  <!-- LABEL: Please enter a valid contact number -->
</div>

<button
  type="button"
  on:click|preventDefault={() => {
    searchModal.open();
  }}>
  Show Modal
</button>

<!-- LABEL: Search a country -->
<!-- LABEL: All countries -->
<SearchModal
  identifier="country_code_select"
  placeholder={$t(COUNTRY_SEARCH_PLACEHOLDER)}
  all={$t(COUNTRY_SEARCH_ALL)}
  items={countryCodesList}
  keys={['country_code', 'country', 'name', 'original']}
  component={CountryCodeSearchItem}
  bind:this={searchModal}
  on:close={closeSearch}
  on:select={({ detail }) => {
    console.log(detail);
    searchModal.close();
  }} />
