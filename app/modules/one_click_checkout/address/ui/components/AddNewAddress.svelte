<script>
  // svelte imports
  import { t } from 'svelte-i18n';
  import { createEventDispatcher, onMount } from 'svelte';
  // UI imports
  import AddressFormBuilder from 'one_click_checkout/address/ui/components/AddressFormBuilder.svelte';
  import Checkbox from 'ui/elements/Checkbox.svelte';
  import Tag from 'one_click_checkout/address/ui/elements/Tag.svelte';
  // labels import
  import {
    NAME_LABEL,
    PINCODE_LABEL,
    CITY_LABEL,
    HOUSE_LABEL,
    AREA_LABEL,
    LANDMARK_LABEL,
    SAVE_ADDRESS_CONSENT,
    UNSERVICEABLE_LABEL,
    SERVICEABLE_LABEL,
    INTERNATIONAL_STATE_LABEL,
    INTERNATIONAL_PINCODE_LABEL,
    STATE_LABEL,
  } from 'one_click_checkout/address/i18n/labels';
  // const import
  import { tagLabels } from 'one_click_checkout/address/constants';
  import { COUNTRY_POSTALS_MAP } from 'common/countrycodes';
  // store import
  import {
    getCityState,
    postServiceability,
    getStatesList,
  } from 'one_click_checkout/address/service';
  import {
    codChargeAmount,
    shippingCharge,
  } from 'one_click_checkout/charges/store';
  import { availableStateList } from 'one_click_checkout/address/store';
  // analytics imports
  import { Events } from 'analytics';
  import AddressEvents from 'one_click_checkout/address/analytics';
  import { isIndianCustomer } from 'checkoutstore';
  import { savedAddresses, phoneObj } from 'one_click_checkout/address/store';
  import { toTitleCase } from 'lib/utils';
  import {
    PHONE_PATTERN,
    INDIA_COUNTRY_CODE,
    PHONE_REGEX_INDIA,
    INDIA_COUNTRY_ISO_CODE,
  } from 'common/constants';

  // props
  export let formData;
  export let error;
  export let checkServiceability = true;
  export let id = 'addressForm';
  export let shouldSaveAddress;
  export let addressType;
  export let selectedCountryISO;

  let selectedTag = '';
  let called = false;
  let pinIndex = -1;
  let stateIndex = -1;
  let stateSubIndex = -1;
  let pinPattern;
  let selectedCountry;
  let phonePattern = new RegExp(PHONE_PATTERN);

  let INPUT_FORM = [
    {
      id: 'name',
      label: $t(NAME_LABEL),
      required: true,
      autofillToken: 'name',
    },
    {
      id: 'contact',
      required: true,
    },
    {
      id: 'country_name',
      label: 'Country',
      required: true,
      autofillToken: 'none',
    },
    {
      id: 'zipcode',
      label: $t(PINCODE_LABEL),
      required: true,
      unserviceableText: '',
      autofillToken: 'postal-code',
      hide: false,
    },
    [
      {
        id: 'city',
        label: $t(CITY_LABEL),
        required: true,
        autofillToken: 'none',
      },
      {
        id: 'state',
        label: `${$t(STATE_LABEL)}*`,
        required: true,
        items: [],
      },
    ],
    {
      id: 'line1',
      label: $t(HOUSE_LABEL),
      required: true,
      pattern: '^.{1,255}$',
      autofillToken: 'address-line1',
    },
    {
      id: 'line2',
      label: $t(AREA_LABEL),
      required: true,
      pattern: '^.{1,255}$',
      autofillToken: 'address-line2',
    },
    {
      id: 'landmark',
      label: $t(LANDMARK_LABEL),
      pattern: '^.{2,32}$',
    },
  ];

  const dispatch = createEventDispatcher();

  const isFormComplete = () => {
    let completed = false;
    const { countryCode, phoneNum } = $phoneObj;
    for (let key in $formData) {
      if (
        ['landmark', 'tag', 'cod'].includes(key) ||
        (key === 'zipcode' && !INPUT_FORM[pinIndex]?.required)
      ) {
        continue;
      }
      if (
        key === 'contact' &&
        ((countryCode === INDIA_COUNTRY_CODE &&
          !PHONE_REGEX_INDIA.test(phoneNum)) ||
          (countryCode !== INDIA_COUNTRY_CODE && !phonePattern.test(phoneNum)))
      ) {
        completed = false;
        return completed;
      }
      if (
        INPUT_FORM[pinIndex]?.unserviceableText !== SERVICEABLE_LABEL &&
        checkServiceability
      ) {
        completed = false;
        return completed;
      }
      if (!$formData[key]) {
        completed = false;
        return completed;
      }
    }
    return true;
  };

  function handleCountrySelect(name, iso) {
    $selectedCountryISO = iso.toLowerCase();
    pinPattern = new RegExp(COUNTRY_POSTALS_MAP[iso].pattern);
    INPUT_FORM[pinIndex].pattern = COUNTRY_POSTALS_MAP[iso].pattern;
    if (!INPUT_FORM[pinIndex].pattern) {
      INPUT_FORM[pinIndex].required = false;
      INPUT_FORM[pinIndex].hide = true;
      const pincodeEle = document.getElementById('zipcode').parentNode;
      pincodeEle.classList.remove('invalid');
      const payload = [
        {
          zipcode: $selectedCountryISO,
          country: $selectedCountryISO,
        },
      ];

      if (checkServiceability) {
        postServiceability(payload)
          .then((res) => {
            if (res && res[$selectedCountryISO]?.serviceability) {
              codChargeAmount.set(res[$selectedCountryISO].cod_fee);
              shippingCharge.set(res[$selectedCountryISO].shipping_fee);
              INPUT_FORM[pinIndex].unserviceableText = SERVICEABLE_LABEL;
            } else {
              INPUT_FORM[pinIndex].unserviceableText = UNSERVICEABLE_LABEL;
            }
            $formData.cod = res[$selectedCountryISO]?.cod;
          })
          .catch(() => {
            INPUT_FORM[pinIndex].unserviceableText = UNSERVICEABLE_LABEL;
          });
      }
    } else {
      INPUT_FORM[pinIndex].required = true;
      INPUT_FORM[pinIndex].hide = false;
      const pincodeEle = document.getElementById('zipcode').parentNode;
      pincodeEle.classList.add('invalid');
    }
    if ($availableStateList[iso]) {
      INPUT_FORM[stateIndex][stateSubIndex].items = $availableStateList[iso];
    } else {
      getStatesList($selectedCountryISO).then((res) => {
        availableStateList.update((currentStateList) => {
          const state = {
            ...currentStateList,
            [iso]: res,
          };
          return state;
        });
        INPUT_FORM[stateIndex][stateSubIndex].items = res;
      });
    }
  }

  const changePincodeStateLabel = () => {
    const { countryCode } = $phoneObj;
    if (
      countryCode !== INDIA_COUNTRY_CODE ||
      $selectedCountryISO?.toUpperCase() !== INDIA_COUNTRY_ISO_CODE
    ) {
      INPUT_FORM[pinIndex].label = $t(INTERNATIONAL_PINCODE_LABEL);
      INPUT_FORM[stateIndex][stateSubIndex].label = `${$t(
        INTERNATIONAL_STATE_LABEL
      )}*`;
      $shouldSaveAddress = false;
    } else {
      INPUT_FORM[pinIndex].label = $t(PINCODE_LABEL);
      INPUT_FORM[stateIndex][stateSubIndex].label = `${$t(STATE_LABEL)}*`;
      $shouldSaveAddress = true;
    }
  };

  export function onUpdate(key, value, extra) {
    // checks if pincode has been filled and autofills city, state for the same
    if (key === 'zipcode' && checkServiceability) {
      // Hack to prevent api being called twice, will remove and look for a better solution
      called = !called;
      if (!called) {
        return;
      }
      if (pinPattern.test(value)) {
        const payload = [
          {
            zipcode: value,
            country: $selectedCountryISO,
          },
        ];

        postServiceability(payload)
          .then((res) => {
            if (res && res[value]?.serviceability) {
              codChargeAmount.set(res[value].cod_fee);
              shippingCharge.set(res[value].shipping_fee);
              INPUT_FORM[pinIndex].unserviceableText = SERVICEABLE_LABEL;
              onUpdate('city', toTitleCase(res[value].city) || '');
              onUpdate('state', toTitleCase(res[value].state) || '');
            } else {
              INPUT_FORM[pinIndex].unserviceableText = UNSERVICEABLE_LABEL;
            }
            $formData.cod = res[value]?.cod;
          })
          .catch(() => {
            INPUT_FORM[pinIndex].unserviceableText = UNSERVICEABLE_LABEL;
          });
      } else {
        INPUT_FORM[pinIndex].unserviceableText = '';
      }
    } else if (
      !checkServiceability &&
      key === 'zipcode' &&
      pinPattern.test(value)
    ) {
      getCityState(value, $selectedCountryISO).then((response) => {
        onUpdate('city', toTitleCase(response.city) || '');
        onUpdate('state', toTitleCase(response.state) || '');
      });
    }

    if (key === 'country_name' && value !== selectedCountry) {
      selectedCountry = value;
      handleCountrySelect(value, extra);
      changePincodeStateLabel();
      if (value !== $formData.country_name) {
        $formData.state = '';
        $formData.zipcode = '';
      }
    }

    if (key === 'contact' && pinIndex !== -1) {
      changePincodeStateLabel();
    }

    $formData = {
      ...$formData,
      [key]: value,
    };
    dispatch('formCompletion', {
      isComplete: isFormComplete(),
    });
  }

  const updateTag = (tag) => {
    selectedTag = tag;
    onUpdate('tag', tag);
  };

  const handleSaveConsentChange = () => {
    shouldSaveAddress.set(!$shouldSaveAddress);
    if (!$shouldSaveAddress) {
      Events.Track(AddressEvents.SAVE_ADDRESS_UNCHECKED);
      onUpdate('tag', '');
      selectedTag = '';
    } else {
      Events.Track(AddressEvents.SAVE_ADDRESS_CHECKED);
    }
  };

  const onInputFieldBlur = ({ detail }) => {
    const { id } = detail;
    Events.Track(AddressEvents[`INPUT_ENTERED_${id}`]);
  };

  const initialiseStateIndex = () => {
    for (let index = 0; index < INPUT_FORM.length; index++) {
      if (Array.isArray(INPUT_FORM[index])) {
        stateSubIndex = INPUT_FORM[index].findIndex(
          (field) => field.id === 'state'
        );
        if (stateSubIndex) {
          stateIndex = index;
          break;
        }
      }
    }
    return;
  };

  onMount(() => {
    if ($shouldSaveAddress === null) {
      $shouldSaveAddress = $isIndianCustomer;
    }
    Events.Track(AddressEvents.ADD_ADDRESS_VIEW, {
      meta: { saved_address_count: $savedAddresses?.length },
      type: addressType,
    });

    pinIndex = INPUT_FORM.findIndex((field) => field.id === 'zipcode');

    initialiseStateIndex();
    changePincodeStateLabel();
    const el = document.querySelector(
      '#addressForm > div:nth-child(1) > div > #name'
    );
    el.focus();
  });
</script>

<div>
  <div class="address-new">
    <AddressFormBuilder
      {id}
      {error}
      {onUpdate}
      formData={$formData}
      {INPUT_FORM}
      {pinIndex}
      on:blur={onInputFieldBlur}
    />
    {#if $isIndianCustomer && $phoneObj?.countryCode === INDIA_COUNTRY_CODE && $selectedCountryISO?.toUpperCase() === INDIA_COUNTRY_ISO_CODE}
      <div class="address-save-consent">
        <Checkbox
          on:change={handleSaveConsentChange}
          checked={$shouldSaveAddress}
          id="address-consent-checkbox"
        />
        <span>{$t(SAVE_ADDRESS_CONSENT)}</span>
      </div>
      {#if $shouldSaveAddress}
        <div class="address-save">
          {#each tagLabels as label}
            <Tag
              onSelect={() => updateTag(label)}
              {label}
              selected={label === selectedTag}
            />
          {/each}
        </div>
      {/if}
    {/if}
  </div>
</div>

<style>
  .address-save-label {
    font-weight: bold;
    font-size: 14px;
  }
  .address-save-label {
    margin-bottom: 10px;
  }
  .address-save {
    display: flex;
    flex-direction: row;
    padding: 8px 0;
  }
  .address-new {
    margin-bottom: -14px;
  }
  .address-save-consent {
    display: flex;
    margin-top: 4px;
    font-size: 13px;
  }
</style>
