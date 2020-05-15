<script>
  // Svelte imports
  import { onMount, createEventDispatcher } from 'svelte';
  import { slide } from 'svelte/transition';
  import { _ } from 'svelte-i18n';

  // UI Imports
  import Field from 'ui/components/Field.svelte';
  import Icon from 'ui/elements/Icon.svelte';
  import SlottedRadioOption from 'ui/elements/options/Slotted/RadioOption.svelte';
  import Checkbox from 'ui/elements/Checkbox.svelte';

  // Util imports
  import { getSession } from 'sessionmanager';
  import { hasFeature, getPrefilledVPA } from 'checkoutstore';
  import { VPA_REGEX } from 'common/constants';

  import {
    UPI_COLLECT_NEW_VPA_HELP,
    UPI_COLLECT_ENTER_ID,
    UPI_COLLECT_SAVE,
    NEw_VPA_TITLE_LOGGED_OUT,
    NEw_VPA_TITLE_LOGGED_IN,
  } from 'ui/labels';

  // Props
  export let selected = false;
  export let focusOnCreate = false;
  export let customer;

  // Refs
  export let vpaField = null;
  let rememberVpaCheckbox = null;

  const PATTERN_WITH_HANDLE = '.+@.+';
  const PATTERN_WITHOUT_HANDLE = '.+';

  const session = getSession();

  // Computed
  export let pattern;
  let rememberVpa = true;
  let newVpa = getPrefilledVPA();
  let vpa;
  let pspHandle;

  function isVpaValid(vpa) {
    return VPA_REGEX.test(vpa);
  }

  onMount(() => {
    if (focusOnCreate) {
      focus();
    }
  });

  export function getVpa() {
    const vpa = vpaField.getValue();
    if (isVpaValid(vpa) || !pspHandle) {
      return vpa;
    }
    return `${vpa}@${pspHandle}`;
  }

  export function shouldRememberVpa() {
    return _Obj.getSafely(customer, 'logged') &&
      hasFeature('save_vpa') &&
      rememberVpa
      ? 1
      : 0;
  }

  export function blur() {
    const dispatch = createEventDispatcher();
    dispatch('blur');

    try {
      if (selected) {
        vpaField.blur();
      }
    } catch (err) {}
  }

  export function focus() {
    vpaField.focus();
  }

  function focusAfterTimeout() {
    setTimeout(() => {
      if (vpaField) {
        vpaField.focus();
      }
    }, 200);
  }

  const canSaveVpa = hasFeature('save_vpa');

  let logged;

  $: logged = _Obj.getSafely(customer, 'logged');

  $: pattern = PATTERN_WITH_HANDLE;
</script>

<style>
  .ref-pspName {
    color: #424242;
    position: absolute;
    top: 12px;
    right: 12px;
    line-height: 40px;
    z-index: 1;
  }

  .should-save-vpa-container {
    margin-top: 12px;

    #should-save-vpa span.checkbox {
      display: inline-block;
    }
  }

  .legend {
    padding: 12px 0 8px 12px;
  }

  [slot='icon'].top {
    align-self: flex-start;
  }

  div[slot='body'] {
    margin-top: 5px;
  }
</style>

<SlottedRadioOption
  name="payment_type"
  value="full"
  align="top"
  on:click
  on:click={focusAfterTimeout}
  {selected}>
  <div id="new-vpa-field" slot="title">
    {logged && canSaveVpa ? $_(NEw_VPA_TITLE_LOGGED_IN) : $_(NEw_VPA_TITLE_LOGGED_OUT)}
  </div>
  <div slot="subtitle">Google Pay, BHIM, PhonePe & more</div>
  <i slot="icon" class="top">
    <Icon icon={session.themeMeta.icons.upi} />
  </i>

  <div slot="body">
    {#if selected}
      <div transition:slide={{ duration: 200 }}>
        <Field
          formatter={{ type: 'vpa' }}
          {pattern}
          helpText={$_(UPI_COLLECT_NEW_VPA_HELP)}
          id="vpa"
          name="vpa"
          type="text"
          required
          bind:value={newVpa}
          bind:this={vpaField}
          on:blur
          placeholder={$_(UPI_COLLECT_ENTER_ID)} />
        {#if logged && canSaveVpa}
          <div class="should-save-vpa-container">
            <label id="should-save-vpa" for="save-vpa">
              <Checkbox bind:checked={rememberVpa} id="save-vpa">
                {$_(UPI_COLLECT_SAVE)}
              </Checkbox>
            </label>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</SlottedRadioOption>
