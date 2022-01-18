<script>
  import { t } from 'svelte-i18n';
  import { createEventDispatcher } from 'svelte';

  export let id;
  export let label = '';
  export let value = '';
  export let required = false;
  export let suggestions = [];
  export let validationText = '';

  let focused = false;
  let inputField;

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

  function onFocus() {
    focused = true;

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
</script>

<div class="wrapper" class:invalid={validationText}>
  <div
    {id}
    bind:this={inputField}
    bind:textContent={value}
    contenteditable
    class="input"
    class:focused
    on:input
    on:focus={onFocus}
    on:blur={onBlur}
  >
    {value}
  </div>
  <span class="label" class:label-top={focused || !!value}>
    {`${$t(label)}${required ? '*' : ''}`}
  </span>
  {#if validationText !== ''}
    <div class="input-validation-error">{validationText}</div>
  {/if}
  {#if suggestions.length > 0}
    <div class="suggestion-dropdown">
      {#each suggestions as suggestion}
        <div
          class="suggestion-item"
          on:click={() => dispatch('suggestion-select', { ...suggestion })}
        >
          <span class="leading">{suggestion.line1} </span>
          <span class="description">{suggestion.line2} </span>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .input {
    border-bottom: 1px solid #ebedf0;
    line-height: 15px;
    padding: 28px 0 7px 0;

    outline-style: none;
  }

  .wrapper {
    position: relative;
    margin-bottom: 12px;
  }

  .label {
    position: absolute;
    line-height: 19px;
    color: #757575;
    z-index: -1;
    top: 28px;
    left: 0;

    transition: 0.3s;
  }

  .label-top {
    top: 40px;
    font-size: 12px;
    line-height: 13px;
    transform: translateY(-30px);
  }

  .suggestion-dropdown {
    width: 100%;
    position: absolute;
    z-index: 1;
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
    font-family: Mulish;
    font-style: normal;
    font-weight: normal;
    font-size: 13px;
    line-height: 16px;
    color: #000000;
  }

  .description {
    font-family: Mulish;
    font-style: normal;
    font-weight: normal;
    font-size: 10px;
    line-height: 13px;
    color: #7d7d7d;
  }

  .input-validation-error {
    color: #f46060;
    margin-top: 4px;
    font-size: 12px;
  }

  .invalid:not(.focused) {
    color: #f46060;
  }
</style>
