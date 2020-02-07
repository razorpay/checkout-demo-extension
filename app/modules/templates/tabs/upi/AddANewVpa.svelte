<script>
  // Svelte imports
  import { onMount, createEventDispatcher } from 'svelte';
  import { slide } from 'svelte/transition';

  // UI Imports
  import Field from 'templates/views/ui/Field.svelte';
  import Icon from 'templates/views/ui/Icon.svelte';
  import SlottedRadioOption from 'templates/views/ui/options/Slotted/RadioOption.svelte';
  import Checkbox from 'templates/views/ui/Checkbox.svelte';
  import { getSession } from 'sessionmanager';

  // Util imports
  import { VPA_REGEX } from 'common/constants';

  // Props
  export let selected = true;
  let vpa;
  let pspHandle;
  export let focusOnCreate = false;

  // Refs
  export let vpaField = null;
  let newVpa = '';
  let rememberVpaCheckbox = null;
  let rememberVpa = true;

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
    if (session.get('prefill.vpa')) {
      newVpa = session.get('prefill.vpa');
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
    return getSafely(session, 'customer.logged') &&
      getSafely(session, 'preferences.features.save_vpa') &&
      rememberVpa
      ? 1
      : 0;
  }

  export function blur() {
    const dispatch = createEventDispatcher();
    dispatch('blur');
    if (selected) {
      vpaField.blur();
    }
  }

  export function focus() {
    vpaField.focus();
  }

  const getSafely = _Obj.getSafely;

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
  {selected}>
  <div id="new-vpa-field" slot="title">Add UPI ID</div>
  <div slot="subtitle">Google Pay, BHIM, Phone Pe & more</div>
  <i slot="icon" class="top">
    <Icon icon={session.themeMeta.icons.upi} />
  </i>

  <div slot="body">
    {#if selected}
      <div transition:slide={{ duration: 200 }}>
        <Field
          formatter={{ type: 'vpa' }}
          {pattern}
          helpText="Please enter a valid VPA of the form username@bank"
          elemClasses="mature"
          id="new-vpa-input"
          name="amount"
          type="text"
          required
          bind:value={newVpa}
          bind:this={vpaField}
          on:blur
          placeholder="Enter your UPI ID" />
        {#if getSafely(session, 'customer.logged') && getSafely(session, 'preferences.features.save_vpa')}
          <div class="should-save-vpa-container">
            <label id="should-save-vpa" for="save-vpa">
              <Checkbox bind:checked={rememberVpa} id="save-vpa">
                Securely save your UPI ID
              </Checkbox>
            </label>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</SlottedRadioOption>
