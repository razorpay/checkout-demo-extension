<script lang="ts">
  import { t } from 'svelte-i18n';
  import { onMount } from 'svelte';
  import { formatMessageWithLocale } from 'i18n';
  import { Events } from 'analytics';
  import Field from 'ui/components/Field.svelte';
  import { selectedCountryISO as selectedShippingCountryISO } from 'one_click_checkout/address/shipping_address/store';
  import { selectedCountryISO as selectedBillingCountryISO } from 'one_click_checkout/address/billing_address/store';
  import { activeRoute } from 'one_click_checkout/routing/store';
  import CountrySearchModal from 'ui/components/CountrySearchModal.svelte';
  import { COUNTRY_LABEL } from 'ui/labels/home';
  import {
    country as countryCode,
    countryISOCode,
  } from 'checkoutstore/screens/home';
  import AddressEvents from 'one_click_checkout/address/analytics';
  import { COUNTRY_TO_CODE_MAP } from 'common/countrycodes';
  import { views } from 'one_click_checkout/routing/constants';
  import { ADDRESS_TYPES } from 'one_click_checkout/address/constants';

  import * as _ from 'utils/_';

  export let onChange;
  export let formData;
  export let addressType;
  export let validationText;
  export let showValidations = false;

  let countryName;
  let id = 'country_name';
  let countryISO;

  let countryField;
  let searchModalOpen = false;

  onMount(() => {
    const countryObj = formData?.country_name
      ? getCountryISO(formData?.country_name)
      : getCountryfromCode($countryCode, $countryISOCode);
    countryName = countryObj.name;
    countryISO = countryObj.iso;
    if (addressType === ADDRESS_TYPES.SHIPPING_ADDRESS) {
      Events.Track(AddressEvents.INPUT_ENTERED_country, {
        selection: 'prefilled',
        country: countryISO?.toLocaleLowerCase(),
      });
    }
  });

  const getCountryISO = (countryName) => {
    return {
      name: countryName,
      iso:
        $activeRoute.name === views.ADD_BILLING_ADDRESS
          ? $selectedBillingCountryISO.toUpperCase()
          : $selectedShippingCountryISO.toUpperCase(),
    };
  };

  function getCountryfromCode(countryContactCode, countryISOCode) {
    const countryDetails = {};
    const rows = Object.entries(COUNTRY_TO_CODE_MAP);
    for (const [iso, code] of rows) {
      if (countryContactCode === `+${code}` && countryISOCode === iso) {
        countryDetails.name = formatMessageWithLocale(`countries.${iso}`, 'en');
        countryDetails.iso = iso;
        break;
      }
    }
    return countryDetails;
  }

  function openCountryModal(event) {
    event?.preventDefault();

    countryField.blur();
    searchModalOpen = true;
  }

  function closeCountryModal() {
    searchModalOpen = false;
  }

  function downArrowHandler(event) {
    const DOWN_ARROW = 40;
    const key = _.getKeyFromEvent(event);

    if (key === DOWN_ARROW) {
      openCountryModal(event);
    }
  }
</script>

<Field
  bind:this={countryField}
  {id}
  name="country_name"
  autocomplete="none"
  on:click={openCountryModal}
  on:keydown={downArrowHandler}
  required
  icon=""
  label={`${$t(COUNTRY_LABEL)}*`}
  on:input={(e) => {
    countryName = e.target.value;
    onChange(id, { val: countryName, extra: countryISO });
  }}
  on:blur
  value={countryName}
  elemClasses="address-elem dropdown-select"
  labelClasses="address-label"
  {validationText}
  {showValidations}
  showDropDownIcon={true}
/>

<CountrySearchModal
  bind:open={searchModalOpen}
  on:close={closeCountryModal}
  on:select={({ detail }) => {
    countryName = detail.original;
    countryISO = detail.country;
    onChange(id, { val: countryName, extra: countryISO });
    closeCountryModal();
  }}
/>
