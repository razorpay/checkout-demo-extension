<script lang="ts">
  import { t } from 'svelte-i18n';

  // Utils imports
  import { getSession } from 'sessionmanager';
  import { Track } from 'analytics';
  import DowntimeIcon from 'ui/elements/Downtime/Icon.svelte';
  import { isRedesignV15 } from 'razorpay';

  // Icon Imports
  import Icon from 'ui/elements/Icon.svelte';
  import { getIcons } from 'one_click_checkout/sessionInterface';
  import circle_check from 'one_click_checkout/rtb_modal/icons/circle_check';
  const { solid_down_arrow } = getIcons();

  import * as ObjectUtils from 'utils/object';
  import * as _El from 'utils/DOM';
  // Actions
  import {
    focus as focusAction,
    blur as blurAction,
    input as inputAction,
  } from 'actions/input';
  import { showAccountTab } from 'checkoutstore';
  import { createEventDispatcher, onMount } from 'svelte';

  // Props
  export let id = '';
  export let type = 'text';
  export let name;
  export let value = null;
  export let readonly = false;
  export let required = false;
  export let autocomplete = 'off';
  export let xautocompletetype;
  export let icon = null;
  export let label = '';
  export let placeholder = '';
  export let pattern = '.*';
  export let formatter = null;
  export let refresh = true;
  export let handleFocus = false;
  export let handleBlur = false;
  export let handleInput = false;
  export let helpText = '';
  export let maxlength: number | null = null;
  export let inputmode = null;
  export let min = null;
  export let max = null;
  export let elemClasses = '';
  export let tabindex = 0;
  export let spellcheck = 'false';
  export let autocorrect = 'off';
  export let autocapitalize = 'off';
  export let readonlyValue = value;
  export let prediction = false;
  export let downtimeSeverity;
  export let validationText = '';
  export let labelClasses = '';
  export let extraLabel = '';
  export let extraLabelClass = '';
  export let forceStopDispatch = false;
  export let loader = false;
  export let leftImage = null;
  export let dir;
  export let disabled = false;
  export let inputFieldClasses = '';
  export let errorValidationClasses = '';
  export let labelUpperClasses = '';
  export let showServicableIcon = false;
  export let showDropDownIcon = false;
  export let isInvalid = false;
  export let attributes = {};

  /**
   * To show prediction as dropdown
   */
  export let showDropdownPredictions = false;
  let suggestionInputRef = null;
  let isPredictionEnable = typeof prediction === 'function';
  let predictedValue = '';
  let dropDownSuggestion = [];
  let dropDownSelection;
  let dropdownArrowIndex = -1;
  let mainInputScrollLeft = 0;
  let dropDownPosition = {
    left: 'auto',
    right: 'auto',
  };

  export let showValidations = false;

  const singleCharacterWidth = 7;
  /**
   * default 180 but can be modify using prediction function output
   */
  let maxLeftPositionOfDropdown = 180;

  $: {
    if (readonlyValue) {
      const estimateWidth = singleCharacterWidth * readonlyValue.length;
      dropDownPosition = {
        left:
          estimateWidth > maxLeftPositionOfDropdown
            ? 'auto'
            : `${estimateWidth}px`,
        right: estimateWidth > maxLeftPositionOfDropdown ? '0' : 'auto',
      };
    }
  }

  $: isPredictionEnable = typeof prediction === 'function';

  // Computed
  let identifier;
  let inputType;

  let focused = false;
  let placeholderToShow = placeholder;

  // Refs
  export let wrap = null;
  export let input = null;
  let formatterObj = null;

  const session = getSession();

  const isRedesignV15Enabled = isRedesignV15();

  export function getCaretPosition() {
    return formatterObj.caretPosition;
  }

  $: {
    if (maxlength && input) {
      input.maxLength = maxlength;
    }
  }

  function formatterAction(node, data) {
    if (!(session && session.delegator && data)) {
      return;
    }

    const delegator = session.delegator;
    formatterObj = delegator.add(data.type, node);

    ObjectUtils.loop(data.on, (callback, event) => {
      formatterObj.on(event, callback);
    });
  }

  $: identifier = id ? id : `id_${Track.makeUid()}`;
  $: inputType = type === 'cvv' ? 'tel' : type;
  $: inputmode = type === 'cvv' ? 'numeric' : inputmode;

  $: {
    const _value = value;

    setTimeout(() => {
      if (input && !forceStopDispatch) {
        let event;

        if (typeof global.Event === 'function') {
          event = new global.Event('input');
        } else {
          event = document.createEvent('Event');
          event.initEvent('input', true, true);
        }

        input.dispatchEvent(event);
      }
    });
  }

  $: {
    if (!focused && label && placeholder) {
      placeholderToShow = '';
    } else {
      placeholderToShow = placeholder;
    }
  }

  function getPrediction() {
    predictedValue = readonlyValue;
    // reset dropdown suggestion on change input
    dropDownSuggestion = [];
    if (isPredictionEnable) {
      const suggestion = prediction(readonlyValue);
      if (!suggestion) {
        return;
      }
      if (typeof suggestion === 'string') {
        predictedValue = suggestion;
      } else {
        predictedValue = suggestion.value;
        if (predictedValue !== readonlyValue) {
          dropdownArrowIndex = -1;
          dropDownSuggestion = suggestion?.suggestions || [];
          dropDownSelection = suggestion?.onSelect;
          maxLeftPositionOfDropdown =
            suggestion.maxLeftPositionOfDropdown || 180;
        }
      }
    }
  }

  function handleInputEvent(e) {
    readonlyValue = e.target.value;
    value = readonlyValue;
    getPrediction();
    if (isRedesignV15Enabled) {
      const { parentNode } = e.target || {};
      if (parentNode?.classList?.contains('filled')) {
        parentNode.classList.remove('filled');
      }
    }
  }

  function handleInputFocus(event) {
    focused = true;
    getPrediction();
    $showAccountTab = false;
  }

  function handleInputBlur(event) {
    focused = false;
    // showValidations if required field only
    showValidations = required;
    $showAccountTab = true;
    setTimeout(() => {
      // prevent dropdown selection destroy before click
      dropDownSuggestion = [];
      dropdownArrowIndex = -1;
    }, 300);
  }

  $: {
    if (dropDownSuggestion.length < 1) {
      dropdownArrowIndex = -1;
    }
  }

  export function focus() {
    if (typeof input.focus === 'function') {
      input.focus();
    }
  }

  export function blur() {
    input.blur();
  }

  export function setSelectionRange(
    selectionStart,
    selectionEnd,
    selectionDirection = 'none'
  ) {
    input.setSelectionRange(selectionStart, selectionEnd, selectionDirection);
  }

  export function getValue() {
    return input.value;
  }

  export function getRawValue() {
    return formatterObj ? formatterObj.value : input.value;
  }

  export function setValid(isValid) {
    setTimeout((_) => {
      _El.keepClass(wrap, 'invalid', !isValid);
    });
  }

  $: {
    if (suggestionInputRef && suggestionInputRef.scrollTo) {
      suggestionInputRef.scrollTo(mainInputScrollLeft, 0);
    }
  }

  /**
   * used for prediction autocomplete
   */
  function onKeyDown(e) {
    //prediction feature enable & predited value !== current input value
    if (!isPredictionEnable || readonlyValue === predictedValue) {
      return true;
    }
    // tab key
    if (
      e.target.selectionStart === e.target.value?.length &&
      (e.keyCode === 9 || e.keyCode === 39)
    ) {
      e.preventDefault();
      value = predictedValue;
      readonlyValue = predictedValue;
      dropDownSuggestion = [];
    }

    /**
     * Accesibility using arrow key on dropdown selection
     */
    if (showDropdownPredictions && dropDownSuggestion?.length > 0) {
      if (
        e.keyCode === 13 &&
        dropdownArrowIndex !== -1 &&
        typeof dropDownSelection === 'function'
      ) {
        e.preventDefault();
        value = dropDownSelection(dropDownSuggestion[dropdownArrowIndex]);
        readonlyValue = value;
      } else if (
        e.keyCode === 40 &&
        dropdownArrowIndex + 1 < dropDownSuggestion?.length
      ) {
        e.preventDefault();
        dropdownArrowIndex = dropdownArrowIndex + 1;
      } else if (e.keyCode === 38 && dropdownArrowIndex - 1 >= 0) {
        e.preventDefault();
        dropdownArrowIndex = dropdownArrowIndex - 1;
      }
    }
    return true;
  }

  let hasError = false;
  $: hasError = ((validationText || isInvalid) && showValidations) as boolean;

  const dispatch = createEventDispatcher();

  onMount(() => {
    dispatch('mount');
  });
</script>

{#if isRedesignV15Enabled}
  <div
    bind:this={wrap}
    class={`elem elem-one-click-checkout ${elemClasses}`}
    class:readonly
    class:with-prediction={isPredictionEnable}
  >
    {#if showServicableIcon}
      <span class="servicibility-icon-wrapper">
        <Icon icon={circle_check()} />
      </span>
    {/if}
    {#if showDropDownIcon}
      <span class="drop-down-icon-wrapper">
        <Icon icon={solid_down_arrow} />
      </span>
    {/if}
    {#if leftImage}
      <img alt="left-img" class="left-img" src={leftImage} />
    {/if}
    <input
      class={`input-one-click-checkout ${inputFieldClasses} main`}
      class:error-field-one-click-checkout={hasError}
      class:with-left-img={leftImage}
      bind:this={input}
      id={identifier}
      type={inputType}
      {name}
      {inputmode}
      {value}
      {required}
      {autocomplete}
      x-autocompletetype={xautocompletetype}
      placeholder={placeholderToShow}
      {pattern}
      {readonly}
      {min}
      {max}
      {tabindex}
      {autocapitalize}
      {autocorrect}
      {spellcheck}
      {dir}
      {disabled}
      {...attributes}
      use:formatterAction={formatter}
      use:focusAction={handleFocus}
      use:blurAction={handleBlur}
      use:inputAction={handleInput}
      on:focus={handleInputFocus}
      on:blur={handleInputBlur}
      on:input={handleInputEvent}
      on:focus
      on:blur
      on:input
      on:autocomplete
      on:paste
      on:click
      on:copy
      on:keydown={onKeyDown}
      on:keydown
      on:scroll={(e) => {
        mainInputScrollLeft = e.target.scrollLeft;
      }}
      class:no-refresh={!refresh}
      class:no-focus={handleFocus}
      class:no-blur={handleBlur}
      class:no-validate={handleInput}
      class:cvv-input={type === 'cvv'}
    />
    <!-- TODO prediction input -->
    {#if label}
      <label
        class={`${labelClasses} label-one-click-checkout ${
          !focused && value ? `${labelUpperClasses}` : ''
        }`}
        class:label-upper={focused || value}
        class:error-label-one-click-checkout={hasError}>{label}</label
      >
    {/if}
    {#if extraLabel}
      <div class={`${extraLabelClass} input-extralabel`}>
        {$t(extraLabel)}
      </div>
    {/if}
    {#if loader}
      <div class="spinner input-loader" />
    {/if}
    {#if downtimeSeverity}
      <div class="downtime-icon">
        <DowntimeIcon severe={downtimeSeverity} />
      </div>
    {/if}
    {#if showDropdownPredictions && dropDownSuggestion?.length > 0}
      <ul
        style={`left: ${dropDownPosition.left}; right: ${dropDownPosition.right};`}
        class="suggestion-dropdown"
      >
        {#each dropDownSuggestion as suggestion, index (suggestion)}
          <li
            class:hover={dropdownArrowIndex === index}
            tabindex={index}
            on:click={() => {
              if (typeof dropDownSelection === 'function') {
                const updatedValue = dropDownSelection(suggestion);
                if (typeof updatedValue === 'string') {
                  value = updatedValue;
                  readonlyValue = updatedValue;
                }
              }
            }}
          >
            {suggestion}
          </li>
        {/each}
      </ul>
    {/if}
    {#if validationText && showValidations}
      <div
        class={`input-validation-error validation-error-one-click-checkout ${errorValidationClasses}`}
      >
        {validationText}
      </div>
    {/if}
  </div>
{:else}
  <div
    bind:this={wrap}
    class={`elem ${elemClasses}`}
    class:readonly
    class:with-prediction={isPredictionEnable}
  >
    {#if icon}
      <i>
        {@html icon}
      </i>
    {/if}
    {#if leftImage}
      <img alt="left-img" class="left-img" src={leftImage} />
    {/if}
    <input
      class="input main"
      class:with-left-img={leftImage}
      bind:this={input}
      id={identifier}
      type={inputType}
      {name}
      {inputmode}
      {value}
      {required}
      {autocomplete}
      x-autocompletetype={xautocompletetype}
      placeholder={placeholderToShow}
      {pattern}
      {readonly}
      {min}
      {max}
      {tabindex}
      {autocapitalize}
      {autocorrect}
      {spellcheck}
      {dir}
      {disabled}
      use:formatterAction={formatter}
      use:focusAction={handleFocus}
      use:blurAction={handleBlur}
      use:inputAction={handleInput}
      on:focus={handleInputFocus}
      on:blur={handleInputBlur}
      on:input={handleInputEvent}
      on:focus
      on:blur
      on:input
      on:autocomplete
      on:paste
      on:copy
      on:click
      on:keydown={onKeyDown}
      on:keydown
      on:scroll={(e) => {
        mainInputScrollLeft = e.target.scrollLeft;
      }}
      class:no-refresh={!refresh}
      class:no-focus={handleFocus}
      class:no-blur={handleBlur}
      class:no-validate={handleInput}
      class:cvv-input={type === 'cvv'}
      {...attributes}
    />
    {#if isPredictionEnable}
      <input
        bind:this={suggestionInputRef}
        bind:value={predictedValue}
        class="input prediction-input"
      />
    {/if}
    {#if label}
      <label for={identifier} class={labelClasses}>{label}</label>
    {/if}
    {#if extraLabel}
      <div class={`${extraLabelClass} input-extralabel`}>
        {$t(extraLabel)}
      </div>
    {/if}
    {#if loader}
      <div class="spinner input-loader" />
    {/if}
    {#if helpText}
      <div class="help">{helpText}</div>
    {/if}
    {#if downtimeSeverity}
      <div class="downtime-icon">
        <DowntimeIcon severe={downtimeSeverity} />
      </div>
    {/if}
    {#if showDropdownPredictions && dropDownSuggestion?.length > 0}
      <ul
        style={`left: ${dropDownPosition.left}; right: ${dropDownPosition.right};`}
        class="suggestion-dropdown"
      >
        {#each dropDownSuggestion as suggestion, index (suggestion)}
          <li
            class:hover={dropdownArrowIndex === index}
            tabindex={index}
            on:click={() => {
              if (typeof dropDownSelection === 'function') {
                const updatedValue = dropDownSelection(suggestion);
                if (typeof updatedValue === 'string') {
                  value = updatedValue;
                  readonlyValue = updatedValue;
                }
              }
            }}
          >
            {suggestion}
          </li>
        {/each}
      </ul>
    {/if}
  </div>
{/if}

<style>
  div:not(.help) {
    input {
      opacity: 1;
      width: 100%;
    }
  }
  .elem,
  .elem.invalid.mature:not(.focused),
  .input-validation-error {
    border-bottom: 0px;
  }
  .input-validation-error {
    color: var(--error-validation-color);
    margin-top: 4px;
    font-size: 12px;
  }
  .input {
    border-bottom: 1px solid #ebedf0;
  }

  .input-extralabel {
    margin-top: 4px;
  }

  .input-extralabel,
  .input-loader {
    font-size: 11px;
  }

  .input-loader {
    position: absolute;
    right: 0;
    top: 33px;
  }

  .cvv-input {
    font-family: 'rzpcvv' !important;
  }
  .successText {
    color: var(--positive-text-color);
  }
  .failureText {
    color: var(--error-validation-color);
  }
  .with-prediction {
    .prediction-input {
      opacity: 0.5 !important;
      background: transparent;
      position: absolute;
      box-sizing: border-box;
      cursor: text;
      pointer-events: none;
      color: black;
      width: 100%;
      top: 0;
    }
    &.elem-one-click-checkout .prediction-input {
      color: var(--primary-text-color);
    }
    input.main {
      background: transparent;
      color: black;
      opacity: 1;
      width: 100%;
      position: relative;
    }
  }

  .elem-one-click-checkout.with-prediction input.main {
    color: var(--primary-text-color);
  }

  .suggestion-dropdown {
    position: absolute;
    list-style: none;
    background: #fff;
    z-index: 10;
    padding: 0;
    margin: 0;

    li {
      padding: 9px 12px;
      font-size: 14px;
      border: 1px solid #e6e7e8;
      line-height: 16px;

      &:hover,
      &.hover {
        background-color: #f2f3f5;
      }
    }
  }
  .address-elem {
    margin-bottom: 12px;
  }
  .address-label {
    top: 36px;
  }
  .downtime-icon {
    float: right;
    margin-top: -24px;
  }
  .focused .address-label {
    transform: scale(0.86) translateY(-30px);
  }

  .with-left-img {
    padding-left: 22px;
  }

  .left-img {
    position: absolute;
    bottom: 6px;
    height: 18px;
    width: 18px;
  }

  .icon-invalid {
    top: 12%;
  }

  .hidden {
    display: none;
  }

  .visible {
    display: block;
  }

  .input-one-click-checkout {
    font-size: var(--font-size-body);
    position: relative;
    border: 1px solid var(--light-dark-color);
    margin-top: 8px;
    padding: 15px 16px;
    border-radius: 4px;
    box-sizing: border-box;
    color: var(--primary-text-color);
  }

  .elem-one-click-checkout::after {
    border-bottom: none !important;
  }

  .elem-one-click-checkout .input-loader {
    right: 2px;
    top: 25px;
  }
  .country-code-one-click-checkout {
    border-right: none;
    border-top-right-radius: 0px;
    border-bottom-right-radius: 0px;
  }

  .input-one-click-checkout.phone-field-one-click-checkout {
    border-top-left-radius: 0px;
    border-bottom-left-radius: 0px;
    margin-left: -8%;
    padding-right: 10%;
    width: calc(100% + 8%);
  }

  .label-one-click-checkout {
    color: var(--tertiary-text-color);
    position: absolute;
    top: 24px;
    left: 15px;
    cursor: inherit;
    transition: all ease-in 0.2s;
  }

  .input-one-click-checkout:focus + .label-one-click-checkout,
  .label-upper {
    top: 0px;
    background-color: transparent;
    font-size: var(--font-size-small);
    padding: 0px 4px;
    left: 9px;
    color: var(--highlight-color);
    transition: all ease-out 0.2s;
    background-color: #fff;
  }

  .label-upper {
    color: var(--tertiary-text-color);
  }

  .label-upper.error-label-one-click-checkout {
    color: var(--error-validation-color);
  }

  .input-one-click-checkout:focus
    + .label-one-click-checkout.error-label-one-click-checkout {
    color: var(--error-validation-color);
  }

  .label-one-click-checkout.label-upper.contact-label {
    left: -40%;
  }

  .label-one-click-checkout.contact-label {
    left: -2%;
  }

  .input-one-click-checkout:focus + .label-one-click-checkout.contact-label {
    left: -40%;
  }

  .input-one-click-checkout:focus {
    border-color: var(--highlight-color);
  }

  .error-field-one-click-checkout,
  .pincode-unserviceable-wrapper {
    border-color: var(--error-validation-color);
  }

  .error-field-one-click-checkout .label-one-click-checkout,
  .pincode-unserviceable-label {
    color: var(--error-validation-color);
  }

  .error-field-one-click-checkout:focus {
    border-color: var(--error-validation-color);
  }

  .validation-error-one-click-checkout {
    color: var(--error-validation-color);
  }

  .contact-validation-error {
    position: relative;
    left: -8%;
  }

  /* For the CVV Input field for 1cc */

  .cvv-one-cc {
    padding: 6px 8px;
    background: #fff;
    font-family: rzpcvv !important;
  }

  .cvv-one-cc-wrapper {
    width: 56px;
  }

  .cvv-one-cc-label {
    top: 18px;
    left: 12px;
    line-height: 12px;
  }

  .input-one-click-checkout:focus + .cvv-one-cc-label {
    top: 20px;
    left: 6px;
  }

  .cvv-one-cc-label-upper {
    padding: 0px 2px;
    font-size: var(--font-size-tiny);
    line-height: 12px;
    left: 6px;
    top: 2px;
    background-color: #fff;
  }

  /* For the Prefered Block CVV Input field for 1cc */
  .cvv-one-cc-wrapper-prefered-block {
    width: 48px;
  }

  :global(.redesign) .cvv-one-cc-wrapper-prefered-block {
    width: 50px;
  }

  .cvv-one-cc-prefered-block {
    padding: 4px;
    margin: 0px;
    background-color: #fff;
    font-family: rzpcvv !important;
  }

  .cvv-one-cc-label-prefered-block {
    top: 6px;
    left: 6px;
    font-size: var(--font-size-small);
  }
  .input-one-click-checkout:focus + .cvv-one-cc-label-prefered-block,
  .cvv-one-cc-label-upper-prefered-block {
    background-color: #fff;
    padding: 0px 2px;
    font-size: var(--font-size-tiny);
    left: 6px;
    top: -6px;
  }

  /* For the Input field on Add new card and Emi Page for 1cc */

  .add-card-fields-one-cc-wrapper {
    width: 100%;
    margin: 10px 0px;
    font-size: var(--font-size-small);
  }

  .add-card-fields-one-cc {
    padding: 15px 12px;
    box-sizing: border-box;
    margin-top: 0px;
  }

  .add-card-fields-label-one-cc {
    top: 18px;
    line-height: 14px;
    font-size: var(--font-size-small);
  }
  .input-one-click-checkout:focus + .add-card-fields-label-one-cc {
    top: 12px;
    background: #fff;
    padding: 0px 4px;
    left: 8px;
    font-size: var(--font-size-small);
    line-height: 14px;
  }
  .add-card-fields-label-upper-one-cc {
    background-color: #fff;
    top: -6px;
    padding: 0px 4px;
    left: 8px;
    font-size: var(--font-size-small);
    line-height: 14px;
  }

  /* For UPI Page 1cc */
  .upi-vpa-field-one-cc {
    background-color: #fff !important;
    height: 42px;
  }

  .upi-vpa-labal-one-cc {
    top: 20px;
  }

  .upi-vpa-label-upper-one-cc {
    top: 0px;
  }

  /* For the Icons needed for 1cc */
  .servicibility-icon-wrapper {
    position: absolute;
    right: 14px;
    top: 24px;
    z-index: 1;
  }

  .drop-down-icon-wrapper {
    position: absolute;
    right: 14px;
    top: 22px;
  }
  .elem-one-click-checkout {
    #amount-value {
      padding-top: 15px !important;
    }
  }
  .fs-12 {
    font-size: 12px;
  }

  :global(.redesign) {
    .left-img {
      position: absolute;
      left: 11px;
      bottom: 50%;
      height: 14px;
      width: 14px;
      border-radius: 50%;
      overflow: hidden;
      object-fit: cover;
      margin-bottom: -11px;
    }

    .with-left-img {
      padding-left: 1.8rem;
    }
  }
</style>
