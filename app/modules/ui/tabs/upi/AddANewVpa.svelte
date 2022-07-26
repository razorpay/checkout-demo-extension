<script lang="ts">
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
  import DowntimeCallout from 'ui/elements/Downtime/Callout.svelte';

  // Util imports
  import { shouldRememberCustomer } from 'checkoutstore';
  import { getPrefilledName, hasFeature, isOneClickCheckout } from 'razorpay';
  import { checkDowntime, getDowntimes } from 'checkoutframe/downtimes';
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
  import { phone } from 'checkoutstore/screens/home';
  import { suggestionVPA, suggestionVPAForRecurring } from 'common/upi';
  import { getThemeMeta } from 'checkoutstore/theme';

  // Props
  export let selected = false;
  export let focusOnCreate = false;
  export let customer;
  export let paymentMethod = 'upi';
  export let recurring = false;
  export let value = '';
  export let rememberVpa = true;
  export let helpTextToDisplay;

  // Refs
  export let vpaField = null;

  const PATTERN_WITH_HANDLE = '.+@.+';

  const themeMeta = getThemeMeta();

  const isOneClickCheckoutEnabled = isOneClickCheckout();

  // Computed
  export let pattern;
  let vpa;
  let pspHandle;
  export let downtimeSeverity = '';
  export let downtimeInstrument = '';

  let upiDowntimes = getDowntimes().upi;

  function isVpaValid(vpa) {
    return VPA_REGEX.test(vpa);
  }

  onMount(() => {
    if (focusOnCreate) {
      focus();
    }
  });

  function checkAndAddDowntime() {
    if (!vpa) {
      downtimeSeverity = false;
      return;
    }
    const vpaEntered = vpa.split('@')[1];
    if (vpaEntered) {
      const currentDowntime = checkDowntime(
        upiDowntimes,
        'vpa_handle',
        vpaEntered
      );
      if (currentDowntime) {
        downtimeSeverity = currentDowntime;
        downtimeInstrument = vpaEntered;
      } else {
        downtimeSeverity = false;
      }
    } else {
      downtimeSeverity = false;
    }
  }

  function handleVpaInput() {
    checkAndAddDowntime();
    const isValidVPA = isVpaValid(vpa);
    helpTextToDisplay = isValidVPA ? undefined : $t(UPI_COLLECT_NEW_VPA_HELP);
    if (isValidVPA || !pspHandle) {
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
    if (typeof vpaField.focus === 'function') {
      vpaField.focus();
    }
  }

  export function setSelectionRange(
    selectionStart,
    selectionEnd,
    selectionDirection = 'none'
  ) {
    vpaField.setSelectionRange(
      selectionStart,
      selectionEnd,
      selectionDirection
    );
  }

  function focusAfterTimeout() {
    setTimeout(() => {
      if (vpaField && typeof vpaField.focus === 'function') {
        vpaField.focus();
      }
    }, 200);
  }
  const canSaveVpa = hasFeature('save_vpa') && shouldRememberCustomer('upi');
  let logged;
  $: logged = _Obj.getSafely(customer, 'logged');

  $: pattern = PATTERN_WITH_HANDLE;

  let label;
  let placeholder;

  $: {
    // LABEL: VPA
    if (isOneClickCheckoutEnabled) {
      label = $t(UPI_COLLECT_ENTER_ID);
      placeholder = null;
    } else {
      label = null;
      placeholder = $t(UPI_COLLECT_ENTER_ID);
    }
  }
</script>

<!-- as="div" sent because in IE insider button we cannot add any other on:click action -->
<SlottedRadioOption
  name={'upi-vpa-input-' + paymentMethod}
  value="full"
  align="top"
  as="div"
  overflow
  on:click
  on:click={focusAfterTimeout}
  {selected}
>
  <div
    id={'new-vpa-field-' + paymentMethod}
    slot="title"
    class:title-vpa-upi-one-cc={isOneClickCheckoutEnabled}
  >
    <!-- LABEL: UPI ID -->
    <!-- LABEL: Add UPI ID -->
    {logged && canSaveVpa
      ? $t(NEW_VPA_TITLE_LOGGED_IN)
      : $t(NEW_VPA_TITLE_LOGGED_OUT)}
  </div>
  <!-- LABEL: Google Pay, BHIM, PhonePe & more -->
  <div
    slot="subtitle"
    class:less-focus-smaller={paymentMethod === 'upi_otm' || recurring}
    class:subtitle-vpa-upi-one-cc={isOneClickCheckoutEnabled &&
      paymentMethod === 'upi'}
  >
    {#if paymentMethod === 'upi_otm' || recurring}
      <FormattedText text={$t(NEW_VPA_SUBTITLE_UPI_OTM)} />
    {:else}{$t(NEW_VPA_SUBTITLE)}{/if}
  </div>
  <i slot="icon" class="top">
    <Icon icon={themeMeta.icons.upi} />
  </i>

  <div slot="body">
    {#if selected}
      <div
        id={'user-new-vpa-container-' + paymentMethod}
        transition:slide={getAnimationOptions({ duration: 200 })}
      >
        <!-- LABEL: Please enter a valid VPA of the form username@bank -->
        <!-- LABEL: Enter your UPI ID -->
        <Field
          formatter={{ type: 'vpa' }}
          {pattern}
          prediction={(currentVaue) => {
            const phoneInput = $phone;
            const prefillName = getPrefilledName() || '';
            const atIndex = currentVaue.indexOf('@');
            if (
              currentVaue?.length > 1 &&
              phoneInput &&
              phoneInput.startsWith(currentVaue) &&
              atIndex === -1
            ) {
              return phoneInput;
            }
            if (
              currentVaue?.length > 1 &&
              prefillName &&
              prefillName?.toLowerCase()?.startsWith(currentVaue) &&
              atIndex === -1
            ) {
              // handle mismatch case of suggestion and input
              return currentVaue + prefillName.substr(currentVaue.length);
            }
            if (
              currentVaue.length > 2 &&
              currentVaue.includes('@') &&
              atIndex < currentVaue.length - 1
            ) {
              const predictionInput = currentVaue.substr(atIndex + 1);
              const currentSuggestionVPAList = recurring
                ? suggestionVPAForRecurring
                : suggestionVPA;

              const predictions = currentSuggestionVPAList.filter((vpa) =>
                vpa.startsWith(predictionInput)
              );
              const value = `${currentVaue.substr(0, atIndex)}@${
                predictions?.[0] || ''
              }`;
              if (predictions?.length > 0) {
                return {
                  value,
                  maxLeftPositionOfDropdown: 180,
                  suggestions: predictions.map((x) => `@${x}`),
                  onSelect: (data) => {
                    return `${currentVaue.substr(0, atIndex)}${data}`;
                  },
                };
              }
            }
            return '';
          }}
          showDropdownPredictions
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
          {placeholder}
          {label}
          inputFieldClasses={isOneClickCheckoutEnabled &&
            'upi-vpa-field-one-cc'}
          validationText={isOneClickCheckoutEnabled && helpTextToDisplay}
          labelClasses={isOneClickCheckoutEnabled && 'upi-vpa-labal-one-cc'}
          labelUpperClasses={isOneClickCheckoutEnabled &&
            'upi-vpa-label-upper-one-cc'}
        />
        {#if logged && canSaveVpa}
          <div class="should-save-vpa-container">
            <label
              id={'should-save-vpa-' + paymentMethod}
              for={'save-vpa-' + paymentMethod}
            >
              <!-- LABEL: Securely save your UPI ID -->
              <Checkbox
                bind:checked={rememberVpa}
                id={'save-vpa-' + paymentMethod}
              >
                {$t(UPI_COLLECT_SAVE)}
              </Checkbox>
            </label>
          </div>
        {/if}
      </div>
    {/if}
  </div>
  <div slot="downtime" class="downtime-upi">
    {#if selected && !!downtimeSeverity}
      <DowntimeCallout
        showIcon={true}
        severe={downtimeSeverity}
        {downtimeInstrument}
      />
    {/if}
  </div>
</SlottedRadioOption>

<style lang="scss">
  .should-save-vpa-container {
    margin-top: 12px;
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

  .downtime-upi {
    margin-top: 8px;
  }

  /* 1CC Input Classes*/

  .subtitle-vpa-upi-one-cc {
    font-size: 12px;
    line-height: 16px;
    color: #8d97a1;
    margin-top: 2px;
    margin-bottom: 10px;
  }

  .title-vpa-upi-one-cc {
    color: #263a4a;
    font-weight: 400;
  }
</style>
