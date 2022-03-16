<script>
  import { t } from 'svelte-i18n';
  // Utils imports
  import { getSession } from 'sessionmanager';
  import { Track } from 'analytics';
  import DowntimeIcon from 'ui/elements/Downtime/Icon.svelte';
  import { isOneClickCheckout } from 'razorpay';

  // Icon Imports
  import Icon from 'ui/elements/Icon.svelte';
  import { getIcons } from 'one_click_checkout/sessionInterface';
  const { circle_check } = getIcons();

  // Actions
  import {
    focus as focusAction,
    blur as blurAction,
    input as inputAction,
  } from 'actions/input';

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
  export let maxlength = null;
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
  export let modifyIconPosition = false;
  export let inputFieldClasses = '';
  export let errorValidationClasses = '';
  export let showServicableIcon = false;

  /**
   * To show prediction as dropdown
   */
  export let showDropdownPredictions = false;
  let suggestionInputRef = null;
  let isPredictionEnable = typeof prediction === 'function';
  let predictedValue = '';
  let dropDownSuggestion = [];
  let dropDownSelection = () => {};
  let dropdownRef = null;
  let dropdownArrowIndex = -1;
  let mainInputScrollLeft = 0;
  let dropDownPosition = {
    left: 'auto',
    right: 'auto',
  };

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

  const isOneClickCheckoutEnabled = isOneClickCheckout();

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

    _Obj.loop(data.on, (callback, event) => {
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
    if (isOneClickCheckoutEnabled) {
      const { parentNode } = e.target || {};
      if (parentNode?.classList?.contains('filled')) {
        parentNode.classList.remove('filled');
      }
    }
  }

  function handleInputFocus(event) {
    focused = true;
    getPrediction();
  }

  function handleInputBlur(event) {
    focused = false;
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
    input.focus();
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
</script>

<div
  bind:this={wrap}
  class={`elem ${elemClasses}`}
  class:elem-one-click-checkout={isOneClickCheckoutEnabled}
  class:readonly
  class:with-prediction={isPredictionEnable}
>
  {#if icon}
    <i
      class:icon-invalid={modifyIconPosition}
      class:hidden={isOneClickCheckoutEnabled}
    >
      {@html icon}
    </i>
  {/if}
  {#if showServicableIcon}
    <span class="servicibility-icon-wrapper"><Icon icon={circle_check} /></span>
  {/if}
  {#if leftImage}
    <img
      class="left-img"
      src={leftImage}
      class:hidden={isOneClickCheckoutEnabled}
    />
  {/if}
  <input
    class={`${
      isOneClickCheckoutEnabled
        ? `input-one-click-checkout ${inputFieldClasses}`
        : 'input'
    } main`}
    class:with-left-img={leftImage}
    class:error-field-one-click-checkout={isOneClickCheckoutEnabled &&
      validationText}
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
  />
  {#if isPredictionEnable}
    <input
      bind:this={suggestionInputRef}
      bind:value={predictedValue}
      class="input prediction-input"
    />
  {/if}
  {#if label}
    <label
      class={labelClasses}
      class:label-one-click-checkout={isOneClickCheckoutEnabled}
      class:label-upper={isOneClickCheckoutEnabled && !focused && value}
      class:error-label-one-click-checkout={isOneClickCheckoutEnabled &&
        validationText}>{label}</label
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
      bind:this={dropdownRef}
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
  {#if validationText !== ''}
    <div
      class={`input-validation-error ${errorValidationClasses}`}
      class:validation-error-one-click-checkout={isOneClickCheckoutEnabled}
      class:contact-validation-error={isOneClickCheckoutEnabled &&
        id === 'contact'}
    >
      {validationText}
    </div>
  {/if}
</div>

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
  .successText {
    color: #079f0d;
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
    input.main {
      background: transparent;
      color: black;
      opacity: 1;
      width: 100%;
      position: relative;
    }
  }

  .suggestion-dropdown {
    position: absolute;
    list-style: none;
    background: #fff;
    z-index: 1;
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
    border: 1px solid #e0e0e0;
    margin-top: 8px;
    padding: 15px 16px;
    border-radius: 4px;
    box-sizing: border-box;
  }

  .elem-one-click-checkout::after {
    border-bottom: none !important;
  }
  .country-code-one-click-checkout {
    border-right: none;
    border-top-right-radius: 0px;
    border-bottom-right-radius: 0px;
  }

  .phone-field-one-click-checkout {
    border-top-left-radius: 0px;
    border-bottom-left-radius: 0px;
    margin-left: -15%;
    padding-right: 15%;
    width: -webkit-fill-available !important;
  }

  .label-one-click-checkout {
    color: #8d8d8d;
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
    font-size: 12px;
    padding: 0px 4px;
    left: 9px;
    color: var(--highlight-color);
    transition: all ease-out 0.2s;
    background-color: #fff;
  }

  .input-one-click-checkout:focus
    + .label-one-click-checkout.error-label-one-click-checkout {
    color: var(--error-validation-color);
  }

  .label-upper {
    color: #8d8d8d;
  }
  .label-one-click-checkout.label-upper.contact-label {
    left: -40%;
  }

  .label-one-click-checkout.contact-label {
    left: -8%;
  }
  .input-one-click-checkout:focus + .label-one-click-checkout.contact-label {
    left: -40%;
  }

  .input-one-click-checkout:focus {
    border-color: var(--highlight-color);
  }

  .error-field-one-click-checkout {
    border-color: var(--error-validation-color);
  }

  .error-field-one-click-checkout .label-one-click-checkout {
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

  .servicibility-icon-wrapper {
    position: absolute;
    right: 14px;
    top: 24px;
  }
</style>
