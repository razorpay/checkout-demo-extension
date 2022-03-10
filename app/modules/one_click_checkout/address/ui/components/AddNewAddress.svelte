<script>
  // svelte imports
  import { t } from 'svelte-i18n';
  import { createEventDispatcher, onMount } from 'svelte';
  // UI imports
  import AddressFormBuilder from 'one_click_checkout/address/ui/components/AddressFormBuilder.svelte';
  import Checkbox from 'ui/elements/Checkbox.svelte';
  import TagSelector from 'one_click_checkout/address/ui/components/TagSelector.svelte';
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
    SAVE_ADDRESS_CONSENT_TNC,
    SAVE_ADDRESS_CONSENT_PRIVACY,
    SAVE_ADDRESS_CONSENT_AND,
    INTERNATIONAL_STATE_LABEL,
    INTERNATIONAL_PINCODE_LABEL,
    STATE_LABEL,
    REQUIRED_LABEL,
  } from 'one_click_checkout/address/i18n/labels';
  // const import
  import {
    TNC_LINK,
    PRIVACY_LINK,
    ADDRESS_TYPES,
  } from 'one_click_checkout/address/constants';
  import { COUNTRY_POSTALS_MAP } from 'common/countrycodes';
  import {
    CATEGORIES,
    ACTIONS,
  } from 'one_click_checkout/merchant-analytics/constant';
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
  import { country as countryCode } from 'checkoutstore/screens/home';
  // analytics imports
  import { Events } from 'analytics';
  import { merchantAnalytics } from 'one_click_checkout/merchant-analytics';
  import AddressEvents from 'one_click_checkout/address/analytics';
  import { isIndianCustomer } from 'checkoutstore';
  import { savedAddresses } from 'one_click_checkout/address/store';
  import {
    findItem,
    validateInputField,
  } from 'one_click_checkout/address/helpers';
  import { toTitleCase } from 'lib/utils';
  import {
    PHONE_PATTERN,
    INDIA_COUNTRY_CODE,
    PHONE_REGEX_INDIA,
    INDIA_COUNTRY_ISO_CODE,
  } from 'common/constants';

  import { fetchSuggestionsResource } from 'one_click_checkout/address/suggestions';

  import { isAutopopulateDisabled } from 'one_click_checkout/store';

  // props
  export let formData;
  export let checkServiceability = true;
  export let id = 'addressForm';
  export let shouldSaveAddress;
  export let addressType;
  export let selectedCountryISO;

  let errors = {};
  let selectedTag = $formData.tag || 'Home';
  let called = false;
  let pinIndex = 2;
  let pinSubIndex = 1;
  let stateIndex = 3;
  let stateSubIndex = 1;
  let pinPattern;
  let selectedCountry;
  let phonePattern = new RegExp(PHONE_PATTERN);
  let stateCode = '';
  const isShippingAddress = addressType === ADDRESS_TYPES.SHIPPING_ADDRESS;

  const isCityStateAutopopulateDisabled = isAutopopulateDisabled();

  let INPUT_FORM = [
    {
      id: 'name',
      label: NAME_LABEL,
      required: true,
      autofillToken: 'name',
    },
    {
      id: 'contact',
      required: true,
    },
    [
      {
        id: 'country_name',
        label: 'Country',
        required: true,
        autofillToken: 'none',
      },
      {
        id: 'zipcode',
        label: PINCODE_LABEL,
        required: true,
        unserviceableText: '',
        autofillToken: 'postal-code',
        disabled: false,
      },
    ],
    [
      {
        id: 'city',
        label: CITY_LABEL,
        required: true,
        autofillToken: 'none',
      },
      {
        id: 'state',
        label: STATE_LABEL,
        required: true,
        items: [],
      },
    ],
    {
      id: 'line1',
      label: HOUSE_LABEL,
      required: true,
      pattern: '^.{1,255}$',
      autofillToken: 'address-line1',
    },
    {
      id: 'line2',
      label: AREA_LABEL,
      required: true,
      pattern: '^.{1,255}$',
      autofillToken: 'address-line2',
      autocomplete: true,
      onSelect: trackSuggestionSelection('line2'),
      suggestionsResource: (value) => {
        return fetchSuggestionsResource(
          {
            input: value,
            zipCode: $formData.zipcode,
            selectedCountryISO: $selectedCountryISO,
          },
          (response) =>
            response.predictions.map((prediction) => {
              const components = prediction.description.split(',');
              return {
                line1: components.slice(0, components.length - 3).join(','),
                line2: prediction.structured_formatting.secondary_text,
              };
            })
        );
      },
    },
    {
      id: 'landmark',
      label: LANDMARK_LABEL,
      pattern: '^.{2,32}$',
      autocomplete: true,
      onSelect: trackSuggestionSelection('landmark'),
      suggestionsResource: (value) => {
        return fetchSuggestionsResource(
          {
            input: value,
            zipCode: $formData.zipcode,
            selectedCountryISO: $selectedCountryISO,
          },
          (response) =>
            response.predictions.map((prediction) => ({
              line1: prediction.structured_formatting.main_text,
              line2: prediction.structured_formatting.secondary_text,
            }))
        );
      },
    },
  ];

  const dispatch = createEventDispatcher();

  const isFormComplete = () => {
    let completed = false;
    const { countryCode, phoneNum } = $formData?.contact;
    for (let key in $formData) {
      if (
        ['landmark', 'tag', 'cod'].includes(key) ||
        (key === 'zipcode' && !INPUT_FORM[pinIndex][pinSubIndex]?.required)
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
        INPUT_FORM[pinIndex][pinSubIndex]?.unserviceableText !==
          SERVICEABLE_LABEL &&
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

  function trackSuggestionSelection(id) {
    return function (e) {
      Events.Track(AddressEvents.SUGGESTION_SELECTED, {
        index: e?.detail?.index,
        field: id,
      });
    };
  }

  function handleCountrySelect(name, iso) {
    // show number keypad for pincode if country is India
    if (iso === INDIA_COUNTRY_ISO_CODE) {
      INPUT_FORM[pinIndex][pinSubIndex].type = 'tel';
    } else {
      INPUT_FORM[pinIndex][pinSubIndex].type = 'text';
    }
    $selectedCountryISO = iso.toLowerCase();
    pinPattern = new RegExp(COUNTRY_POSTALS_MAP[iso].pattern);
    INPUT_FORM[pinIndex][pinSubIndex].pattern =
      COUNTRY_POSTALS_MAP[iso].pattern;
    if (!INPUT_FORM[pinIndex][pinSubIndex].pattern) {
      INPUT_FORM[pinIndex][pinSubIndex].required = false;
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
              stateCode = res[$selectedCountryISO]?.state_code;
              INPUT_FORM[pinIndex][pinSubIndex].unserviceableText =
                SERVICEABLE_LABEL;
            } else {
              INPUT_FORM[pinIndex][pinSubIndex].unserviceableText =
                UNSERVICEABLE_LABEL;
            }
            $formData.cod = res[$selectedCountryISO]?.cod;
          })
          .catch(() => {
            INPUT_FORM[pinIndex][pinSubIndex].unserviceableText =
              UNSERVICEABLE_LABEL;
          });
      }
    } else {
      INPUT_FORM[pinIndex][pinSubIndex].required = true;
      const pincodeEle = document.getElementById('zipcode').parentNode;
      pincodeEle.classList.add('invalid');
    }
    getStatesList($selectedCountryISO).then((res) => {
      INPUT_FORM[stateIndex][stateSubIndex].items = res;
    });
  }

  const changePincodeStateLabel = () => {
    const { countryCode } = $formData?.contact;
    if (
      countryCode !== INDIA_COUNTRY_CODE ||
      $selectedCountryISO?.toUpperCase() !== INDIA_COUNTRY_ISO_CODE
    ) {
      INPUT_FORM[pinIndex][pinSubIndex].label = INTERNATIONAL_PINCODE_LABEL;
      INPUT_FORM[stateIndex][stateSubIndex].label = INTERNATIONAL_STATE_LABEL;
      $shouldSaveAddress = false;
    } else {
      INPUT_FORM[pinIndex][pinSubIndex].label = PINCODE_LABEL;
      INPUT_FORM[stateIndex][stateSubIndex].label = STATE_LABEL;
      $shouldSaveAddress = true;
    }
  };

  export function onUpdate(key, value, extra) {
    // Track whenever suggestion is cleared
    if (
      ['landmark', 'line2'].includes(key) &&
      value !== $formData[key] &&
      !value
    ) {
      Events.Track(AddressEvents.SUGGESTION_CLEARED, { field: key });
    }
    // If invalid field, then re-validate the input and update error messages
    if (errors[key]) {
      const field = findItem(INPUT_FORM, key);
      const errorLabel = validateInputField(
        $formData[key],
        field,
        $selectedCountryISO
      );
      errors[key] = errorLabel ? $t(errorLabel) : null;
    }
    // checks if pincode has been filled and autofills city, state for the same
    if (key === 'zipcode' && checkServiceability) {
      if (
        INPUT_FORM[pinIndex][pinSubIndex]?.unserviceableText &&
        !$formData.city
      ) {
        INPUT_FORM[pinIndex][pinSubIndex].unserviceableText = '';
      }
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

        INPUT_FORM[pinIndex][pinSubIndex].disabled = true;
        postServiceability(payload)
          .then((res) => {
            INPUT_FORM[pinIndex][pinSubIndex].disabled = false;
            if (res && res[value]?.serviceability) {
              codChargeAmount.set(res[value].cod_fee);
              shippingCharge.set(res[value].shipping_fee);
              stateCode = res[value].state_code;
              INPUT_FORM[pinIndex][pinSubIndex].unserviceableText =
                SERVICEABLE_LABEL;
              if (!isCityStateAutopopulateDisabled) {
                onUpdate('city', toTitleCase(res[value].city) || '');
                onUpdate('state', toTitleCase(res[value].state) || '');
              }
            } else {
              INPUT_FORM[pinIndex][pinSubIndex].unserviceableText =
                UNSERVICEABLE_LABEL;
            }
            $formData.cod = res[value]?.cod;
            if (isShippingAddress) {
              if (!res[value].city) {
                Events.Track(AddressEvents.PINCODE_MISSING_CITY, {
                  country: $selectedCountryISO,
                  zipcode: value,
                });
              }
              if (!res[value].state) {
                Events.Track(AddressEvents.PINCODE_MISSING_STATE, {
                  country: $selectedCountryISO,
                  zipcode: value,
                });
              }
            }
          })
          .catch(() => {
            INPUT_FORM[pinIndex][pinSubIndex].unserviceableText =
              UNSERVICEABLE_LABEL;
            INPUT_FORM[pinIndex][pinSubIndex].disabled = false;
          });
      } else if (INPUT_FORM[pinIndex][pinSubIndex]?.required) {
        INPUT_FORM[pinIndex][pinSubIndex].unserviceableText = '';
      }
    } else if (
      !checkServiceability &&
      key === 'zipcode' &&
      pinPattern.test(value) &&
      !isCityStateAutopopulateDisabled
    ) {
      getCityState(value, $selectedCountryISO).then((response) => {
        onUpdate('city', toTitleCase(response.city) || '');
        onUpdate('state', toTitleCase(response.state) || '');
      });
    }

    if (
      key === 'contact' &&
      value.countryCode !== $countryCode &&
      isShippingAddress
    ) {
      Events.Track(AddressEvents.INPUT_ENTERED_contact, {
        selection: 'manual',
        country_code: value.countryCode,
      });
    }

    if (key === 'country_name' && value !== selectedCountry) {
      if (selectedCountry && selectedCountry !== value && isShippingAddress) {
        Events.Track(AddressEvents.INPUT_ENTERED_country, {
          selection: 'manual',
          country: extra,
        });
      }
      selectedCountry = value;
      handleCountrySelect(value, extra);
      changePincodeStateLabel();
      if (value !== $formData.country_name) {
        $formData.city = '';
        $formData.state = '';
        $formData.zipcode = '';
      }
    }

    $formData = {
      ...$formData,
      [key]: value,
    };

    if (key === 'contact' && pinIndex !== -1) {
      changePincodeStateLabel();
    }

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
    const field = findItem(INPUT_FORM, id);
    const errorLabel = validateInputField(
      $formData[id],
      field,
      $selectedCountryISO
    );
    if (errorLabel) {
      Events.Track(AddressEvents.ADDRESS_VALIDATION_ERROR, {
        field: id,
        input: $formData[id] || '',
        reason:
          errorLabel === REQUIRED_LABEL ? 'NULL_VALUE' : 'PATTERN_MATCH_FAILED',
      });
    }

    errors[id] = errorLabel ? $t(errorLabel) : null;
    if (
      id === 'zipcode' &&
      !INPUT_FORM[pinIndex][pinSubIndex].required &&
      $formData?.zipcode &&
      checkServiceability
    ) {
      const zipcode = $formData.zipcode;
      const payload = [
        {
          zipcode,
          country: $selectedCountryISO,
        },
      ];

      postServiceability(payload)
        .then((res) => {
          if (res && res[zipcode]?.serviceability) {
            codChargeAmount.set(res[zipcode].cod_fee);
            shippingCharge.set(res[zipcode].shipping_fee);
            stateCode = res[zipcode].state_code;
            INPUT_FORM[pinIndex][pinSubIndex].unserviceableText =
              SERVICEABLE_LABEL;
            if (!isCityStateAutopopulateDisabled) {
              onUpdate('city', toTitleCase(res[zipcode].city) || '');
              onUpdate('state', toTitleCase(res[zipcode].state) || '');
            }
          } else {
            INPUT_FORM[pinIndex][pinSubIndex].unserviceableText =
              UNSERVICEABLE_LABEL;
          }
        })
        .catch(() => {
          INPUT_FORM[pinIndex][pinSubIndex].unserviceableText =
            UNSERVICEABLE_LABEL;
        });
    }
    if (id === 'line1') {
      Events.Track(AddressEvents[`INPUT_ENTERED_${id}`], {
        input_length: $formData?.name?.length,
      });
    } else if (
      id === 'zipcode' &&
      addressType === ADDRESS_TYPES.SHIPPING_ADDRESS
    ) {
      Events.Track(AddressEvents[`INPUT_ENTERED_${id}`], {
        country: $selectedCountryISO,
        country_code: $formData?.contact?.countryCode,
      });
    } else {
      Events.Track(AddressEvents[`INPUT_ENTERED_${id}`]);
    }
  };

  onMount(() => {
    if ($shouldSaveAddress === null) {
      $shouldSaveAddress = $isIndianCustomer;
    }
    Events.Track(AddressEvents.ADD_ADDRESS_VIEW, {
      meta: { saved_address_count: $savedAddresses?.length },
      type: addressType,
    });
    merchantAnalytics({
      event: ACTIONS.ADDRESS_ENTERED,
      category: CATEGORIES.ADDRESS,
    });
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
      {errors}
      {onUpdate}
      formData={$formData}
      {INPUT_FORM}
      {pinIndex}
      {addressType}
      on:blur={onInputFieldBlur}
    />
    {#if $isIndianCustomer && $formData?.contact?.countryCode === INDIA_COUNTRY_CODE && $selectedCountryISO?.toUpperCase() === INDIA_COUNTRY_ISO_CODE}
      <div class="address-save-consent">
        <Checkbox
          on:change={handleSaveConsentChange}
          checked={$shouldSaveAddress}
          id="address-consent-checkbox"
        />
        <span>
          {$t(SAVE_ADDRESS_CONSENT)}
          <a href={TNC_LINK} class="address-consent-links" target="_blank">
            {$t(SAVE_ADDRESS_CONSENT_TNC)}
          </a>
          {$t(SAVE_ADDRESS_CONSENT_AND)}
          <a href={PRIVACY_LINK} class="address-consent-links" target="_blank">
            {$t(SAVE_ADDRESS_CONSENT_PRIVACY)}
          </a>
        </span>
      </div>
    {/if}
    {#if $isIndianCustomer && $shouldSaveAddress}
      <TagSelector on:select={(e) => updateTag(e.detail.label)} {selectedTag} />
    {/if}
  </div>
</div>

<style>
  .address-new {
    margin-bottom: -14px;
  }
  .address-save-consent {
    display: flex;
    margin-top: 4px;
    font-size: 13px;
  }
  .address-consent-links {
    color: #551a8b;
  }
</style>
