<script>
  // Svelte imports
  import { onMount } from 'svelte';
  import { slide } from 'svelte/transition';

  // UI Imports
  import Field from 'templates/views/ui/Field.svelte';
  import Icon from 'templates/views/ui/Icon.svelte';
  import SlottedRadioOption from 'templates/views/ui/options/Slotted/RadioOption.svelte';
  import { getSession } from 'sessionmanager';

  // Util imports
  import { VPA_REGEX } from 'common/constants';

  // Props
  export let selected = true;
  export let selectedApp;
  export let vpa;
  export let pspHandle;
  export let focusOnCreate = false;
  export let onSelection = false;

  // Refs
  export let vpaField = null;
  let rememberVpaCheckbox = null;

  // Computed
  export let pattern;

  function isVpaValid(vpa) {
    return VPA_REGEX.test(vpa);
  }

  const PATTERN_WITH_HANDLE = '.+@.+';
  const PATTERN_WITHOUT_HANDLE = '.+';

  const session = getSession();

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
    return rememberVpaCheckbox.checked ? 1 : 0;
  }

  export function blur() {
    if (selected) vpaField.blur();
  }

  export function focus() {
    vpaField.focus();
  }

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
</style>

<SlottedRadioOption
  name="payment_type"
  value="full"
  align="top"
  on:click={onSelection}
  {selected}>
  <div id="new-vpa-field" slot="title">UPI ID</div>
  <div slot="subtitle">Google Pay, BHIM, Phone Pe & more</div>
  <i slot="icon" class="top">
    <Icon icon={session.themeMeta.icons.upi} />
  </i>

  <div slot="slot-body">
    {#if selected}
      <div transition:slide={{ duration: 200 }}>
        <Field
          formatter={{ type: 'vpa' }}
          {pattern}
          helpText="Please enter a valid VPA of the form username@bank"
          elemClasses="mature"
          id="amount-value"
          name="amount"
          type="text"
          required
          bind:this={vpaField}
          on:blur
          placeholder="Enter your UPI ID" />
        <div class="should-save-vpa-container">
          <label id="should-save-vpa" for="save-vpa">
            <input
              type="checkbox"
              class="checkbox--square"
              id="save-vpa"
              bind:this={rememberVpaCheckbox}
              name="save" />
            <span class="checkbox" />
            Remember VPA
          </label>
        </div>
      </div>
    {/if}
  </div>
</SlottedRadioOption>
