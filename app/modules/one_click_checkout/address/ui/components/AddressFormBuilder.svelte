<script>
  import { createEventDispatcher, onMount } from 'svelte';

  // i18n
  import { t } from 'svelte-i18n';
  import {
    SERVICEABLE_LABEL,
    ADD_LANDMARK,
    OPTIONAL,
    UNSERVICEABLE_LABEL,
  } from 'one_click_checkout/address/i18n/labels';

  import { country, phone } from 'checkoutstore/screens/home';

  import Field from 'ui/components/Field.svelte';
  import ContactField from 'ui/components/ContactField.svelte';
  import WrappedInput from 'one_click_checkout/common/ui/WrappedInput.svelte';
  import AutoCompleteInput from 'one_click_checkout/address/ui/components/AutoCompleteInput.svelte';
  import CountryField from 'one_click_checkout/address/ui/elements/CountryField.svelte';
  import StateSearchField from 'one_click_checkout/address/ui/elements/StateSearchField.svelte';

  // analytics imports
  import { Events } from 'analytics';
  import AddressEvents from 'one_click_checkout/address/analytics';
  // constant imports
  import { ADDRESS_TYPES, SOURCE } from 'one_click_checkout/address/constants';

  export let INPUT_FORM;
  export let formData;
  export let onUpdate;
  export let id;
  export let forceStopDispatch = false;
  export let addressType;
  export let errors;

  let countryCode;
  let phoneNum;

  $: {
    if (countryCode || phoneNum) {
      handleInput('contact', { countryCode, phoneNum });
    }
  }

  const dispatch = createEventDispatcher();
  const handleInput = (id, value) => {
    value.extra ? onUpdate(id, value.val, value.extra) : onUpdate(id, value);
  };

  const onBlur = (id) => {
    dispatch('blur', { id });

    if (id === 'landmark' && !formData[id]) {
      showLandmark = false;
    }

    // Analytics Event

    const fieldError = errors[id];
    const fieldData = formData[id];

    if (!fieldError) {
      let data = {};

      if ('city' === id) {
        data = {
          meta: { [id]: fieldData },
          is_prefilled: formData?.zipcode
            ? SOURCE.OVERIDDEN
            : SOURCE.ENTERED_BEFORE_AUTOCOMPLETE,
        };
      }
      if (id === 'country_name') {
        data = {
          country: fieldData,
          is_prefilled: SOURCE.OVERIDDEN,
        };
      }

      if (id === 'zipcode') {
        data = {
          pincode: fieldData,
        };
      }

      Events.TrackBehav(AddressEvents[`INPUT_ENTERED_${id}_V2`], data);
    }
  };

  onMount(() => {
    if (formData?.contact?.countryCode) {
      const { countryCode: code, phoneNum: phone } = formData.contact;
      countryCode = code;
      phoneNum = phone;
    } else {
      countryCode = $country;
      phoneNum = $phone;
    }
    if (addressType === ADDRESS_TYPES.SHIPPING_ADDRESS) {
      // Field related analytics constants are suffixed with lowercase
      Events.Track(AddressEvents.INPUT_ENTERED_contact, {
        selection: 'prefilled',
        country_code: countryCode,
      });
    }

    Events.TrackBehav(AddressEvents.INPUT_ENTERED_country_V2, {
      is_prefilled: SOURCE.ENTERED_BEFORE_AUTOCOMPLETE,
    });
  });

  let showLandmark = false;

  const handleLandmarkToggle = () => {
    showLandmark = true;
  };
</script>

<form {id}>
  {#each INPUT_FORM as input, index (index)}
    <div class="form-input">
      {#if Array.isArray(input)}
        {#each input as subInput (subInput.id)}
          {#if subInput.id === 'state'}
            <StateSearchField
              validationText={errors[subInput.id] ? errors[subInput.id] : ''}
              on:blur={() => onBlur(subInput.id)}
              items={subInput.items}
              onChange={handleInput}
              stateName={formData[subInput.id]}
              label={`${$t(subInput.label)}${subInput.required ? '*' : ''}`}
            />
          {:else if subInput.id === 'country_name'}
            <CountryField
              onChange={handleInput}
              on:blur={() => onBlur(subInput.id)}
              validationText={errors[subInput.id] ? errors[subInput.id] : ''}
              extraLabel={INPUT_FORM[2][1]?.unserviceableText}
              showExtraLabel={!formData.zipcode && !INPUT_FORM[2][1]?.required}
              {formData}
              {addressType}
              extraLabelClass={INPUT_FORM[2][1]?.unserviceableText ===
              SERVICEABLE_LABEL
                ? 'successText'
                : 'failureText'}
            />
          {:else}
            <Field
              id={subInput.id}
              name={subInput.id}
              type={subInput.type || 'text'}
              required={subInput.required}
              pattern={subInput.pattern || ''}
              maxlength={subInput.length || ''}
              formatter={subInput.formatter || ''}
              icon={subInput.type === 'search' ? '' : false}
              value={formData[subInput.id]}
              on:blur={() => onBlur(subInput.id)}
              label={`${$t(subInput.label)}${subInput.required ? '*' : ''}`}
              on:input={(e) => handleInput(subInput.id, e.target.value)}
              {forceStopDispatch}
              placeholder={subInput.placeholder}
              loader={subInput.loader}
              validationText={errors[subInput.id] ? errors[subInput.id] : ''}
              labelClasses="address-label {!subInput?.hideStatusText &&
                subInput.unserviceableText === UNSERVICEABLE_LABEL &&
                'pincode-unserviceable-label'}"
              elemClasses={'address-elem'}
              handleInput
              autocomplete={subInput.autofillToken ?? 'off'}
              showServicableIcon={!subInput?.hideStatusText &&
                subInput.unserviceableText === SERVICEABLE_LABEL}
              disabled={subInput.disabled}
              inputFieldClasses={!subInput?.hideStatusText &&
                subInput.unserviceableText === UNSERVICEABLE_LABEL &&
                'pincode-unserviceable-wrapper'}
            />
          {/if}
        {/each}
      {:else if input.id === 'contact'}
        <ContactField
          on:blur={() => onBlur(input.id)}
          bind:country={countryCode}
          isOptional={!input.required}
          bind:phone={phoneNum}
          inAddress
          validationText={errors[input.id] ? errors[input.id] : ''}
        />
      {:else if input.wrapped}
        <WrappedInput
          id={input.id}
          value={formData[input.id]}
          label={input.label}
          validationText={errors[input.id] ? errors[input.id] : ''}
          on:blur={() => onBlur(input.id)}
          on:input={({ detail: e }) =>
            handleInput(input.id, e.target.textContent)}
        />
      {:else if input.autocomplete}
        {#if input.id === 'landmark'}
          {#if showLandmark}
            <AutoCompleteInput
              id={input.id}
              label={input.label}
              value={formData[input.id]}
              suggestionsResource={input.suggestionsResource}
              validationText={errors[input.id] ? errors[input.id] : ''}
              on:blur={() => onBlur(input.id)}
              on:input={({ detail: e }) =>
                handleInput(input.id, e.target.textContent)}
              on:select={input.onSelect}
              autofocus={true}
              handleValidation={onBlur}
            />
          {:else}
            <span
              on:click={() => handleLandmarkToggle()}
              data-test-id="toggle-landmark-cta"
              class="show-landmark-label"
            >
              + {$t(ADD_LANDMARK)}
              <span class="optional"> {$t(OPTIONAL)} </span>
            </span>
          {/if}
        {:else}
          <AutoCompleteInput
            id={input.id}
            label={input.label}
            value={formData[input.id]}
            suggestionsResource={input.suggestionsResource}
            validationText={errors[input.id] ? errors[input.id] : ''}
            on:blur={() => onBlur(input.id)}
            on:input={(e) => handleInput(input.id, e.detail.target.textContent)}
            on:select={input.onSelect}
            handleValidation={onBlur}
          />
        {/if}
      {:else}
        <Field
          id={input.id}
          name={input.id}
          type={input.type || 'text'}
          required={input.required}
          pattern={input.pattern || ''}
          maxlength={input.length || ''}
          on:blur={() => onBlur(input.id)}
          formatter={input.formatter || ''}
          value={formData[input.id]}
          {forceStopDispatch}
          label={`${$t(input.label)}${input.required ? '*' : ''}`}
          on:input={(e) => handleInput(input.id, e.target.value)}
          placeholder={input.placeholder}
          loader={input.loader}
          validationText={errors[input.id] ? errors[input.id] : ''}
          labelClasses="address-label"
          extraLabel={formData[input.id] && input.unserviceableText}
          elemClasses="address-elem"
          extraLabelClass={input.unserviceableText === SERVICEABLE_LABEL &&
          formData[input.id]
            ? 'successText'
            : 'failureText'}
          autocomplete={input.autofillToken ?? 'off'}
          disabled={input.disabled}
        />
      {/if}
    </div>
  {/each}
</form>

<style>
  .form-input > :global(div) {
    width: 100%;
  }

  .form-input > :global(div:nth-child(odd)) {
    margin-right: 12px;
  }

  .form-input > :global(div:nth-child(even)) {
    margin-left: 12px;
  }

  .form-input > :global(div:last-child) {
    margin-right: 0;
  }

  .form-input {
    display: flex;
    margin-bottom: 6px;
  }

  form :global(.filled:not(.input-radio) label) {
    transform: scale(0.86) translateY(-30px);
  }

  form :global(.elem > i) {
    transform: rotate(-90deg) scale(0.5);
    top: 50%;
  }

  .show-landmark-label {
    margin: 8px 0px;
    color: var(--highlight-color);
    cursor: pointer;
    font-size: 12px;
    font-weight: 600;
  }
  .show-landmark-label .optional {
    color: #79747e;
  }
</style>
