<script>
  import { createEventDispatcher, onMount } from 'svelte';

  // i18n
  import { t } from 'svelte-i18n';
  import { SERVICEABLE_LABEL } from 'one_click_checkout/address/i18n/labels';

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
  import { ADDRESS_TYPES } from 'one_click_checkout/address/constants';

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

  const onBlur = (id, e) => {
    dispatch('blur', { id });

    if (id === 'landmark' && !formData[id]) {
      showLandmark = false;
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
              modifyIconPosition={errors[subInput.id] || errors['city']}
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
              labelClasses="address-label"
              elemClasses={'address-elem'}
              handleInput
              autocomplete={subInput.autofillToken ?? 'off'}
              extraLabel={subInput.unserviceableText}
              extraLabelClass={subInput.unserviceableText === SERVICEABLE_LABEL
                ? 'successText'
                : 'failureText'}
              disabled={subInput.disabled}
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
          required={input.required}
          validationText={errors[input.id] ? errors[input.id] : ''}
          on:blur={() => onBlur(input.id)}
          on:input={(e) => handleInput(input.id, e.target.textContent)}
        />
      {:else if input.autocomplete}
        {#if input.id === 'landmark'}
          {#if showLandmark}
            <AutoCompleteInput
              id={input.id}
              label={input.label}
              required={input.required}
              value={formData[input.id]}
              suggestionsResource={input.suggestionsResource}
              validationText={errors[input.id] ? errors[input.id] : ''}
              on:blur={() => onBlur(input.id)}
              on:input={(e) =>
                handleInput(input.id, e.detail.target.textContent)}
              on:select={input.onSelect}
              autofocus={true}
            />
          {:else}
            <span
              on:click={() => handleLandmarkToggle()}
              class="show-landmark-label"
            >
              + Add Landmark <span class="optional"> (Optional) </span>
            </span>
          {/if}
        {:else}
          <AutoCompleteInput
            id={input.id}
            label={input.label}
            required={input.required}
            value={formData[input.id]}
            suggestionsResource={input.suggestionsResource}
            validationText={errors[input.id] ? errors[input.id] : ''}
            on:blur={() => onBlur(input.id)}
            on:input={(e) => handleInput(input.id, e.detail.target.textContent)}
            on:select={input.onSelect}
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
  }

  form :global(.filled:not(.input-radio) label) {
    transform: scale(0.86) translateY(-30px);
  }

  form :global(.elem > i) {
    transform: rotate(-90deg) scale(0.5);
    top: 50%;
  }

  .show-landmark-label {
    margin-bottom: 12px;
    color: #3395ff;
    cursor: pointer;
  }
  .show-landmark-label .optional {
    color: #79747e;
  }
</style>
