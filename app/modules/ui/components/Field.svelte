<script>
  // Utils imports
  import { getSession } from 'sessionmanager';
  import Track from 'tracker';

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

  function handleInputFocus(event) {
    focused = true;
  }

  function handleInputBlur(event) {
    focused = false;
  }

  export function focus() {
    input.focus();
  }

  export function blur() {
    input.blur();
  }

  export function getValue() {
    return input.value;
  }

  export function getRawValue() {
    return formatterObj ? formatterObj.value : input.value;
  }

  export function setValid(isValid) {
    setTimeout(_ => {
      _El.keepClass(wrap, 'invalid', !isValid);
    });
  }
</script>

<style>
  div:not(.help) {
    input {
      opacity: 1;
      width: 100%;
    }
  }
</style>

<div bind:this={wrap} class={`elem ${elemClasses}`} class:readonly>
  {#if icon}
    <i>
      {@html icon}
    </i>
  {/if}
  <input
    class="input"
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
    on:focus
    on:blur
    on:input
    on:autocomplete
    on:paste
    on:click
    on:keydown
    class:no-refresh={!refresh}
    class:no-focus={handleFocus}
    class:no-blur={handleBlur}
    class:no-validate={handleInput}
    class:cvv-input={type === 'cvv'} />
  {#if label}
    <label>{label}</label>
  {/if}
  {#if helpText}
    <div class="help">{helpText}</div>
  {/if}
</div>
