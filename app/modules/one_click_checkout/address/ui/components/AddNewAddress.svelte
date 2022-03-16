<script>
  // svelte imports
  import { t } from 'svelte-i18n';
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';

  // UI imports
  import AddressFormBuilder from 'one_click_checkout/address/ui/components/AddressFormBuilder.svelte';
  import Checkbox from 'ui/elements/Checkbox.svelte';
  import TagSelector from 'one_click_checkout/address/ui/components/TagSelector.svelte';
  import { showToast, hideToast, TOAST_THEME } from 'one_click_checkout/Toast';
  import Icon from 'ui/elements/Icon.svelte';
  import info from 'ui/icons/payment-methods/info';
  import SameBillingAndShipping from 'one_click_checkout/address/ui/components/SameBillingAndShipping.svelte';

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
    PINCODE_NON_SERVICEABLE_LABEL,
    INTERNATIONAL_STATE_LABEL,
    INTERNATIONAL_PINCODE_LABEL,
    STATE_LABEL,
    REQUIRED_LABEL,
  } from 'one_click_checkout/address/i18n/labels';

  // const import
  import {
    ADDRESS_TYPES,
    views as addressViews,
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
  import { isAutopopulateDisabled } from 'one_click_checkout/store';
  import { activeRoute } from 'one_click_checkout/routing/store';

  // analytics imports
  import { Events } from 'analytics';
  import { merchantAnalytics } from 'one_click_checkout/merchant-analytics';
  import AddressEvents from 'one_click_checkout/address/analytics';

  // other imports
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
  import { views } from 'one_click_checkout/routing/constants';

  import { fetchSuggestionsResource } from 'one_click_checkout/address/suggestions';

  // props
  export let formData;
  export let checkServiceability = true;
  export let id = 'addressForm';
  export let shouldSaveAddress;
  export let addressType;
  export let selectedCountryISO;
  export let currentView;

  let errors = {};
  let selectedTag = $formData.tag;
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

  const pincode_error_toast = {
    message: $t(PINCODE_NON_SERVICEABLE_LABEL),
    theme: TOAST_THEME.ERROR,
  };

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
        hideStatusText: false,
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
    if (!COUNTRY_POSTALS_MAP[iso]?.pattern) {
      INPUT_FORM[pinIndex][pinSubIndex].hideStatusText = true;
    } else {
      INPUT_FORM[pinIndex][pinSubIndex].hideStatusText = false;
      INPUT_FORM[pinIndex][pinSubIndex].unserviceableText = '';
    }
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
              showToast(pincode_error_toast);
            }
            $formData.cod = res[$selectedCountryISO]?.cod;
          })
          .catch(() => {
            INPUT_FORM[pinIndex][pinSubIndex].unserviceableText =
              UNSERVICEABLE_LABEL;
            showToast(pincode_error_toast);
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
      hideToast();
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
              showToast(pincode_error_toast);
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
            showToast(pincode_error_toast);
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
            showToast(pincode_error_toast);
          }
        })
        .catch(() => {
          INPUT_FORM[pinIndex][pinSubIndex].unserviceableText =
            UNSERVICEABLE_LABEL;
          showToast(pincode_error_toast);
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

  function trackSameBillingAndShippingCheckbox({ detail }) {
    if (detail.checked) {
      Events.Track(AddressEvents.BILLING_SAME_AS_SHIPPING_CHECKED, {
        address_screen: ADDRESS_TYPES.SHIPPING_ADDRESS,
      });
    } else {
      Events.Track(AddressEvents.BILLING_SAME_AS_SHIPPING_UNCHECKED, {
        address_screen: ADDRESS_TYPES.SHIPPING_ADDRESS,
      });
    }
  }

  let showTooltipVar = false;
  function showTooltip() {
    showTooltipVar = true;
    setInterval(function () {
      showTooltipVar = false;
    }, 5000);
  }

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

  onDestroy(() => {
    hideToast();
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

    {#if $activeRoute?.name !== views.ADD_BILLING_ADDRESS}
      <SameBillingAndShipping
        shouldSaveAddress={true}
        on:toggle={trackSameBillingAndShippingCheckbox}
      />
    {/if}

    {#if currentView === addressViews.ADD_ADDRESS && $isIndianCustomer && $formData?.contact?.countryCode === INDIA_COUNTRY_CODE && $selectedCountryISO?.toUpperCase() === INDIA_COUNTRY_ISO_CODE}
      <div class="address-save-consent">
        <Checkbox
          on:change={handleSaveConsentChange}
          checked={$shouldSaveAddress}
          id="address-consent-checkbox"
        />
        <div class="save-address-wrapper">
          {$t(SAVE_ADDRESS_CONSENT)} &nbsp;
          <div class="icon-wrapper" on:click={showTooltip}>
            <Icon icon={info('#263A4A')} />
          </div>
        </div>
      </div>
      <div class="elem-wrap-save-address-tc">
        {#if showTooltipVar}
          <div class="save-address-tooltip">
            I agree to save my details as per Razorpay’s <span class="tc-text">
              Terms and Conditions
            </span>
            and <span class="tc-text"> Privacy Policy </span>
          </div>
        {/if}
      </div>
    {/if}
    {#if $isIndianCustomer && $shouldSaveAddress}
      <TagSelector on:select={(e) => updateTag(e.detail.label)} {selectedTag} />
    {/if}
  </div>
</div>

<style>
  .address-new {
    margin-top: 16px;
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

  .save-address-wrapper {
    height: fit-content;
    display: flex;
    align-items: center;
  }

  .icon-wrapper {
    cursor: pointer;
  }

  .elem-wrap-save-address-tc {
    margin-top: 5px;
    position: relative;
  }

  .save-address-tooltip {
    transition: 0.25s ease-in transform, 0.16s ease-in opacity;
    transform: translateY(-10px);
    color: #fff;
    position: absolute;
    line-height: 16px;
    padding: 12px;
    font-size: 12px;
    background: #2d313a;
    box-shadow: rgba(0, 0, 0, 0.05) 1px 1px 2px 0;
    z-index: 3;
    border-radius: 2px;
    bottom: -56px;
    pointer-events: none;
    margin: 0px 16px;
  }
  .save-address-tooltip::after {
    content: '';
    position: absolute;
    width: 0;
    height: 0;
    border-width: 8px;
    border-style: solid;
    border-color: transparent transparent #2d313a;
    bottom: 100%;
    left: 50%;
    margin: 0 0 -1px -10px;
  }

  .tc-text {
    cursor: pointer;
    color: #3684d6;
  }
</style>
