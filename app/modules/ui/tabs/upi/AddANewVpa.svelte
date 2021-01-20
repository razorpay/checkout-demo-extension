<script>
  // Svelte imports
  import { onMount, createEventDispatcher } from 'svelte';
  import { slide } from 'svelte/transition';
  import { _ as t } from 'svelte-i18n';

  // UI Imports
  import Field from 'ui/components/Field.svelte';
  import Icon from 'ui/elements/Icon.svelte';
  import SlottedRadioOption from 'ui/elements/options/Slotted/RadioOption.svelte';
  import Checkbox from 'ui/elements/Checkbox.svelte';
  import FormattedText from 'ui/elements/FormattedText/FormattedText.svelte';

  // Util imports
  import { getSession } from 'sessionmanager';
  import { hasFeature, getPrefilledVPA } from 'checkoutstore';
  import { VPA_REGEX } from 'common/constants';
  import { getAnimationOptions } from 'svelte-utils';

  import {
    UPI_COLLECT_NEW_VPA_HELP,
    UPI_COLLECT_ENTER_ID,
    UPI_COLLECT_SAVE,
    NEW_VPA_TITLE_LOGGED_OUT,
    NEW_VPA_TITLE_LOGGED_IN,
    NEW_VPA_SUBTITLE,
    NEW_VPA_SUBTITLE_UPI_OTM,
  } from 'ui/labels/upi';

  // Props
  export let selected = false;
  export let focusOnCreate = false;
  export let customer;
  export let paymentMethod = 'upi';
  export let recurring = false;
  export let value = '';
  export let rememberVpa = true;
  export let defaultValue = '';

  // Refs
  export let vpaField = null;
  let rememberVpaCheckbox = null;

  const PATTERN_WITH_HANDLE = '.+@.+';
  const PATTERN_WITHOUT_HANDLE = '.+';

  const session = getSession();

  // Computed
  export let pattern;
  let newVpa = getPrefilledVPA();
  let vpa;
  let pspHandle;

  function isVpaValid(vpa) {
    return VPA_REGEX.test(vpa);
  }

  let defaultValueSet = false;

  $: {
    if (!value && !defaultValueSet && defaultValue) {
      // run only once
      value = defaultValue;
      defaultValueSet = true;
    }
  }

  onMount(() => {
    if (focusOnCreate) {
      focus();
    }
  });

  function handleVpaInput() {
    if (isVpaValid(vpa) || !pspHandle) {
      value = vpa;
    } else {
      value = `${vpa}@${pspHandle}`;
    }
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

    #should-save-vpa-upi span.checkbox,
    #should-save-vpa-upi_otm span.checkbox {
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

  .less-focus-smaller {
    font-size: 12px;
    line-height: 16px;
    color: rgba(81, 89, 120, 0.7);
  }
</style>

<SlottedRadioOption
  name={'upi-vpa-input-' + paymentMethod}
  value="full"
  align="top"
  overflow
  on:click
  on:click={focusAfterTimeout}
  {selected}>
  <div id={'new-vpa-field-' + paymentMethod} slot="title">
    <!-- LABEL: UPI ID -->
    <!-- LABEL: Add UPI ID -->
    {logged && canSaveVpa ? $t(NEW_VPA_TITLE_LOGGED_IN) : $t(NEW_VPA_TITLE_LOGGED_OUT)}
  </div>
  <!-- LABEL: Google Pay, BHIM, PhonePe & more -->
  <div
    slot="subtitle"
    class:less-focus-smaller={paymentMethod === 'upi_otm' || recurring}>
    {#if paymentMethod === 'upi_otm' || recurring}
      <FormattedText text={$t(NEW_VPA_SUBTITLE_UPI_OTM)} />
    {:else}{$t(NEW_VPA_SUBTITLE)}{/if}
  </div>
  <i slot="icon" class="top">
    <Icon icon={session.themeMeta.icons.upi} />
  </i>

  <div slot="body">
    {#if selected}
      <div
        id={'user-new-vpa-container-' + paymentMethod}
        transition:slide={getAnimationOptions({ duration: 200 })}>
        <!-- LABEL: Please enter a valid VPA of the form username@bank -->
        <!-- LABEL: Enter your UPI ID -->
        <Field
          formatter={{ type: 'vpa' }}
          {pattern}
          helpText={$t(UPI_COLLECT_NEW_VPA_HELP)}
          id={'vpa-' + paymentMethod}
          name={'vpa-' + paymentMethod}
          type="text"
          required
          bind:value
          bind:this={vpaField}
          bind:readonlyValue={vpa}
          on:input={handleVpaInput}
          on:blur
          placeholder={$t(UPI_COLLECT_ENTER_ID)} />
        {#if logged && canSaveVpa}
          <div class="should-save-vpa-container">
            <label
              id={'should-save-vpa-' + paymentMethod}
              for={'save-vpa-' + paymentMethod}>
              <!-- LABEL: Securely save your UPI ID -->
              <Checkbox
                bind:checked={rememberVpa}
                id={'save-vpa-' + paymentMethod}>
                {$t(UPI_COLLECT_SAVE)}
              </Checkbox>
            </label>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</SlottedRadioOption>
