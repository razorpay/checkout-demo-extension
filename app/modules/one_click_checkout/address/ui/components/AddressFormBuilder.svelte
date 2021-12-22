<script>
  // i18n
  import { country, phone } from 'checkoutstore/screens/home';
  import Field from 'ui/components/Field.svelte';
  import { createEventDispatcher, onMount } from 'svelte';
  import ContactField from 'ui/components/ContactField.svelte';
  import CountryField from 'one_click_checkout/address/ui/elements/CountryField.svelte';
  import StateSearchField from 'one_click_checkout/address/ui/elements/StateSearchField.svelte';
  import { SERVICEABLE_LABEL } from 'one_click_checkout/address/i18n/labels';
  import { phoneObj } from 'one_click_checkout/address/store';

  export let INPUT_FORM;
  export let formData;
  export let onUpdate;
  export let id;
  export let error;
  export let forceStopDispatch = false;
  export let pinIndex;

  let countryCode = $country;
  let phoneNum = $phone;

  $: handleInput('contact', `${countryCode}${phoneNum}`);

  const dispatch = createEventDispatcher();
  const handleInput = (id, value) => {
    if (error?.id === id) {
      error.text = '';
    }
    phoneObj.set({ countryCode, phoneNum });
    value.extra ? onUpdate(id, value.val, value.extra) : onUpdate(id, value);
  };

  const onBlur = (id) => {
    dispatch('blur', { id });
  };

  onMount(() => {
    countryCode = $country;
    phoneNum = $phone;
  });
</script>

<form {id}>
  {#each INPUT_FORM as input, index (index)}
    <div class="form-input">
      {#if Array.isArray(input)}
        {#each input as subInput (subInput.id)}
          {#if subInput.id === 'state'}
            <StateSearchField
              items={subInput.items}
              onChange={handleInput}
              stateName={formData[subInput.id]}
              label={subInput.label}
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
              label={`${subInput.label}${subInput.required ? '*' : ''}`}
              on:input={(e) => handleInput(subInput.id, e.target.value)}
              {forceStopDispatch}
              placeholder={subInput.placeholder}
              loader={subInput.loader}
              validationText={error?.id === subInput.id ? error.text : ''}
              labelClasses="address-label"
              elemClasses={'address-elem'}
              handleInput
              autocomplete={subInput.autofillToken ?? 'off'}
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
        />
      {:else if input.id === 'country_name'}
        <CountryField
          onChange={handleInput}
          extraLabel={INPUT_FORM[pinIndex]?.unserviceableText}
          showExtraLabel={!INPUT_FORM[pinIndex]?.required}
          {formData}
          extraLabelClass={INPUT_FORM[pinIndex]?.unserviceableText ===
          SERVICEABLE_LABEL
            ? 'successText'
            : 'failureText'}
        />
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
          label={`${input.label}${input.required ? '*' : ''}`}
          on:input={(e) => handleInput(input.id, e.target.value)}
          placeholder={input.placeholder}
          loader={input.loader}
          validationText={error?.id === input.id ? error.text : ''}
          labelClasses="address-label"
          extraLabel={formData[input.id] &&
            INPUT_FORM[pinIndex]?.required &&
            input.unserviceableText}
          elemClasses={`address-elem ${
            input.id === 'zipcode' && INPUT_FORM[pinIndex]?.hide && 'hide'
          }`}
          extraLabelClass={input.unserviceableText === SERVICEABLE_LABEL &&
          INPUT_FORM[pinIndex]?.required &&
          formData[input.id]
            ? 'successText'
            : 'failureText'}
          autocomplete={input.autofillToken ?? 'off'}
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
    margin-right: 18px;
  }

  .form-input > :global(div:nth-child(even)) {
    margin-left: 18px;
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
</style>
