<script lang="ts">
  // svelte imports
  import { createEventDispatcher, onMount } from 'svelte';

  // i18n imports
  import { t } from 'svelte-i18n';

  // helper imports
  import { isOneClickCheckout } from 'razorpay';
  import { getScrollableParent } from 'one_click_checkout/helper';

  export let id: string;
  export let label = '';
  export let value = '';
  export let suggestions = [];
  export let validationText = '';
  export let autofocus;

  let focused = false;
  let inputField;
  let wrapperRef;
  let height = 49;

  const dispatch = createEventDispatcher();

  function selectFullText() {
    let selection, range;
    if (window.getSelection && document.createRange) {
      selection = window.getSelection();
      range = document.createRange();
      range.selectNodeContents(inputField);
      selection.removeAllRanges();
      selection.addRange(range);
    } else if (document.body.createTextRange) {
      range = document.body.createTextRange();
      range.moveToElementText(inputField);
      range.select();
    }
  }

  function onFocus(event) {
    inputField.scrollIntoView(true);
    focused = true;
    const { parentNode } = event.target || {};
    if (parentNode?.classList?.contains('focused')) {
      parentNode.classList.remove('focused');
    }
    if (value) {
      selectFullText();
    }
  }

  function onBlur(e) {
    focused = false;
    setTimeout(() => {
      suggestions = [];
    }, 200);
    dispatch('blur', e);
  }

  function handleClickLabel() {
    inputField.focus();
  }

  function onInput(e) {
    const parentNode = getScrollableParent(e.target);

    // Remove filled class which is added by global input event listener since it modifies CSS
    wrapperRef.classList.remove('filled');

    if (parentNode) {
      const { bottom: parentBottom } = parentNode.getBoundingClientRect();
      const { bottom: targetBottom } = e.target.getBoundingClientRect();
      // if autocomplete input is at the end of screen, scroll it into view
      if (parentBottom - targetBottom < 100) {
        e.target.scrollIntoView(true);
      }
    }

    // update height after input
    // TO DO: the below solution does not work in our case, need to discuss the better sol forn it, to increase the height
    height = e.target.scrollHeight;
    dispatch('input', e);
  }

  onMount(() => {
    if (autofocus) {
      inputField.focus();
    }
  });
</script>

<div
  class="wrapper input-group"
  class:invalid={validationText}
  bind:this={wrapperRef}
>
  <textarea
    {id}
    bind:this={inputField}
    bind:value
    class="input"
    class:focused
    class:input-focused={focused}
    class:input-error={validationText !== ''}
    on:input={onInput}
    on:focus={onFocus}
    on:blur={onBlur}
    style={`height: ${height}px`}
  />
  <label
    class="label"
    class:label-upper={value}
    class:label-error={validationText && (value || focused)}
    on:click={handleClickLabel}
  >
    {$t(label)}
  </label>
  {#if validationText !== ''}
    <div class="input-validation-error">{validationText}</div>
  {/if}
  {#if suggestions.length > 0}
    <div
      class="suggestion-dropdown"
      class:dropdown-one-cc={isOneClickCheckout()}
    >
      {#each suggestions as suggestion, index}
        <div
          class="suggestion-item"
          on:click={() =>
            dispatch('suggestion-select', { ...suggestion, index })}
        >
          <span class="leading">{suggestion.line1}</span>
          <span class="description">{suggestion.line2}</span>
          {#if isOneClickCheckout()}
            <div class="separator" />
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .input {
    border: 1px solid #e0e0e0;
    margin: 8px 0px;
    padding: 16px;
    border-radius: 4px;
    box-sizing: border-box;
    outline-style: none;
    position: relative;

    resize: none;
    overflow: hidden;

    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* Internet Explorer 10+ */
  }

  .input::-webkit-scrollbar {
    /* WebKit */
    width: 0;
    height: 0;
  }

  .input-focused {
    border-color: var(--highlight-color);
  }

  .input-error {
    border-color: var(--error-validation-color);
  }

  .wrapper {
    position: relative;
    margin-bottom: 12px;
  }

  .suggestion-dropdown {
    width: 100%;
    position: absolute;
    z-index: 2;
    max-height: 170px;
    overflow-y: scroll;
    background: white;
    margin-top: 8px;
    box-shadow: 4px 8px 16px rgba(58, 63, 72, 0.2);
  }

  .suggestion-item {
    padding: 12px;
    display: flex;
    flex-direction: column;
    border-bottom: 0.6px solid rgba(0, 0, 0, 0.1);
  }

  .suggestion-item:hover {
    cursor: pointer;
  }

  .leading {
    font-style: normal;
    font-weight: normal;
    font-size: 13px;
    line-height: 16px;
    color: var(--primary-text-color);
  }

  .description {
    font-style: normal;
    font-weight: normal;
    font-size: 10px;
    line-height: 13px;
    color: var(--secondary-text-color);
  }

  .input-validation-error {
    color: var(--error-validation-color);
    margin-top: 4px;
    font-size: var(--font-size-small);
  }

  .input {
    outline: none;
    padding: 14px 12px;
    border-radius: 4px;
    color: var(--primary-text-color);
    margin-bottom: 0px;
  }
  .label {
    color: var(--tertiary-text-color);
    position: absolute;
    top: 24px;
    left: 16px;
    background: #fff;
    cursor: inherit;
    transition: all ease-in 0.2s;
  }
  .input:focus {
    border: 1px solid var(--highlight-color);
  }
  .input-group.invalid .input:focus {
    border: 1px solid var(--error-validation-color);
  }

  .input:focus + .label {
    top: 0px;
    background-color: transparent;
    font-size: var(--font-size-small);
    padding: 0px 4px;
    left: 9px;
    color: var(--primary-color);
    transition: all ease-out 0.2s;
    background-color: #fff;
  }

  .label-upper {
    top: 0px;
    padding: 0 4px;
    font-size: var(--font-size-small);
    left: 8px;
    transition: all ease-out 0.2s;
  }

  .dropdown-one-cc {
    margin-top: 0px;
    max-height: 280px;
  }

  .dropdown-one-cc .suggestion-item {
    padding: 14px 16px 0px;
    border-bottom: none;
  }

  .dropdown-one-cc .leading {
    font-family: 'Inter';
    font-weight: var(--font-weight-medium);
    font-size: var(--font-size-small);
    line-height: 16px;
    color: #263a4a;
  }

  .dropdown-one-cc .description {
    margin-top: 4px;
    font-family: 'Inter';
    font-size: var(--font-size-small);
    font-weight: 200;
    line-height: 16px;
    color: #8d97a1;
  }

  .separator {
    margin-top: 14px;
    height: 1px;
    background-color: #e0e0e0;
  }

  .label-error {
    color: var(--error-validation-color) !important;
  }
</style>
