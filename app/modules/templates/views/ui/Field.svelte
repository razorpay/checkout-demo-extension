<script>
  // Utils imports
  import { getSession } from 'sessionmanager';
  import Track from 'tracker';

  // Props
  export let id = '';
  export let type = 'text';
  export let name;
  export let value = null;
  export let readonly = false;
  export let required = false;
  export let autocomplete = 'off';
  export let icon = null;
  export let label = '';
  export let placeholder = '';
  export let pattern = '.*';
  export let formatter = null;
  export let refresh = true;
  export let helpText = '';
  export let maxlength = null;
  export let inputmode = null;

  // Computed
  export let identifier;
  let _type;

  // Refs
  export let wrap = null;
  export let input = null;

  const session = getSession();

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
    const formatterObj = delegator.add(data.type, node);

    _Obj.loop(data.on, (callback, event) => {
      formatterObj.on(event, callback);
    });
  }

  $: identifier = id ? id : `id_${Track.makeUid()}`;
  $: inputType = type === 'cvv' ? 'tel' : type;
  $: inputmode = type === 'cvv' ? 'numeric' : inputmode;

  export function focus() {
    input.focus();
  }

  export function blur() {
    input.blur();
  }

  export function getValue() {
    return input.value;
  }

  export function setInvalid() {
    _El.addClass(wrap, 'invalid');
  }
</script>

<style>
  /*
   * TODO: standardize / fix padding
   */
  div:not(.help) {
    /*padding: 4px 0;*/
    input {
      opacity: 1;
      width: 100%;
    }
  }
</style>

<div bind:this={wrap} class="elem" class:readonly>
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
    {placeholder}
    {pattern}
    {readonly}
    use:formatterAction={formatter}
    on:focus
    on:blur
    class:no-refresh={!refresh}
    class:cvv-input={type === 'cvv'} />
  {#if label}
    <label>{label}</label>
  {/if}
  {#if helpText}
    <div class="help">{helpText}</div>
  {/if}
</div>
