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
    STATE_LABEL,
    HOUSE_LABEL,
    AREA_LABEL,
    LANDMARK_LABEL,
    SAVE_ADDRESS_CONSENT,
    UNSERVICEABLE_LABEL,
    SERVICEABLE_LABEL,
  } from 'one_click_checkout/address/i18n/labels';
  // const import
  import {
    tagLabels,
    ZIPCODE_REQUIRED_LENGTH,
  } from 'one_click_checkout/address/constants';
  // store import
  import {
    getCityState,
    postServiceability,
  } from 'one_click_checkout/address/service';
  import {
    codChargeAmount,
    shippingCharge,
  } from 'one_click_checkout/charges/store';
  // analytics imports
  import { Events } from 'analytics';
  import AddressEvents from 'one_click_checkout/address/analytics';
  import { isIndianCustomer } from 'checkoutstore';
  import { savedAddresses } from 'one_click_checkout/address/store';

  // props
  export let formData;
  export let error;
  export let checkServiceability = true;
  export let id = 'addressForm';
  export let shouldSaveAddress;
  export let addressType;

  let selectedTag = '';
  let called = false;
  let pinIndex = -1;

  let INITIAL_INPUT_FORM = [
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
      id: 'zipcode',
      label: $t(PINCODE_LABEL),
      required: true,
      unserviceableText: '',
      pattern: '[0-9]{6}',
      formatter: { type: 'number' },
      length: 6,
      autofillToken: 'postal-code',
    },
  ];

  let NEXT_INPUT_FORM = [
    [
      {
        id: 'city',
        label: $t(CITY_LABEL),
        required: true,
        autofillToken: 'none',
      },
      {
        id: 'state',
        label: $t(STATE_LABEL),
        required: true,
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

  let INPUT_FORM = [...INITIAL_INPUT_FORM, ...NEXT_INPUT_FORM];

  const isFormComplete = () => {
    let completed = false;
    for (let key in $formData) {
      if (['landmark', 'tag', 'cod'].includes(key)) {
        continue;
      }
      if (key === 'contact' && $formData[key]?.length < 13) {
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

  export function onUpdate(key, value) {
    // checks if pincode has been filled and autofills city, state for the same
    if (key === 'zipcode' && checkServiceability) {
      // Hack to prevent api being called twice, will remove and look for a better solution
      called = !called;
      if (!called) {
        return;
      }
      if (value.length === ZIPCODE_REQUIRED_LENGTH) {
        const payload = [
          {
            zipcode: value,
          },
        ];

        postServiceability(payload)
          .then((res) => {
            if (res && res[value]?.serviceability) {
              codChargeAmount.set(res[value].cod_fee);
              shippingCharge.set(res[value].shipping_fee);
              INPUT_FORM[pinIndex].unserviceableText = SERVICEABLE_LABEL;
              onUpdate('city', res[value].city || '');
              onUpdate('state', res[value].state || '');
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
      value.length === ZIPCODE_REQUIRED_LENGTH
    ) {
      getCityState(value).then((response) => {
        onUpdate('city', response.city || '');
        onUpdate('state', response.state || '');
      });
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

  onMount(() => {
    if ($shouldSaveAddress === null) {
      $shouldSaveAddress = $isIndianCustomer;
    }
    Events.Track(AddressEvents.ADD_ADDRESS_VIEW, {
      meta: { saved_address_count: $savedAddresses?.length },
      type: addressType,
    });

    pinIndex = INPUT_FORM.findIndex((field) => field.id === 'zipcode');

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
      on:addressInputUpdate
      on:blur={onInputFieldBlur}
    />
    <div class="address-save-consent">
      <Checkbox
        on:change={handleSaveConsentChange}
        checked={$shouldSaveAddress}
        id="address-consent-checkbox"
      />
      <span>{$t(SAVE_ADDRESS_CONSENT)}</span>
    </div>
    {#if $isIndianCustomer && $shouldSaveAddress}
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
