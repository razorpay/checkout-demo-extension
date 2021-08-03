<script>
  // Utils imports
  import { getSession } from 'sessionmanager';
  import { Track } from 'analytics';
  import DowntimeIcon from 'ui/elements/Downtime/Icon.svelte';

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
      if (input) {
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
  class:readonly
  class:with-prediction={isPredictionEnable}
>
  {#if icon}
    <i>
      {@html icon}
    </i>
  {/if}
  {#if isPredictionEnable}
    <input
      bind:this={suggestionInputRef}
      bind:value={predictedValue}
      class="input prediction-input"
    />
  {/if}
  <input
    class="input main"
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
  {#if label}<label>{label}</label>{/if}
  {#if helpText}
    <div class="help">{helpText}</div>
  {/if}
  {#if downtimeSeverity}
    <div class="downtime-icon"><DowntimeIcon severe={downtimeSeverity} /></div>
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
</div>

<style>
  div:not(.help) {
    input {
      opacity: 1;
      width: 100%;
    }
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
    }
    input.main {
      background: transparent;
      color: black;
      opacity: 1;
      width: 100%;
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
  .downtime-icon {
    float: right;
    margin-top: -24px;
  }
</style>
