<script>
  import { t } from 'svelte-i18n';
  import { formatMessageWithLocale } from 'i18n';
  import { Track } from 'analytics';
  import SearchModal from 'ui/elements/SearchModal.svelte';
  import CountryCodeSearchItem from 'ui/elements/search-item/CountryCode.svelte';
  import {
    COUNTRY_SEARCH_ALL,
    COUNTRY_SEARCH_PLACEHOLDER,
  } from 'ui/labels/home';
  import { COUNTRY_TO_CODE_MAP } from 'common/countrycodes';

  export let open = false;
  let countryCodesList;
  $: $t, (countryCodesList = generateCountryCodesList());

  function generateCountryCodesList() {
    let list = [];

    for (const [country, code] of Object.entries(COUNTRY_TO_CODE_MAP)) {
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
    }

    // Sort countries using this order
    const orderOfCountries = ['IN', 'US', 'GB', 'CA', 'AU'];

    list = list.sort((a, b) => {
      const countryA = a.country;
      const countryB = b.country;

      const hasA = orderOfCountries.includes(countryA);
      const hasB = orderOfCountries.includes(countryB);

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

  const searchIdentifier = `country_code_select_${Track.makeUid()}`; // Add a UUID since this field can exist in multiple places
</script>

<SearchModal
  identifier={searchIdentifier}
  placeholder={$t(COUNTRY_SEARCH_PLACEHOLDER)}
  all={$t(COUNTRY_SEARCH_ALL)}
  items={countryCodesList}
  keys={['country_code', 'country', 'name', 'original']}
  component={CountryCodeSearchItem}
  bind:open
  on:close
  on:select
/>
