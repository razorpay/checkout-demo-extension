<script lang="ts">
  import { t } from 'svelte-i18n';
  import { Track } from 'analytics';
  import Field from 'ui/components/Field.svelte';
  import StateSearchItem from 'one_click_checkout/address/ui/elements/StateSearchItem.svelte';
  import {
    STATE_LABEL,
    STATE_SEARCH_ALL,
    STATE_SEARCH_PLACEHOLDER,
  } from 'one_click_checkout/address/i18n/labels';
  import * as _ from 'utils/_';

  import triggerSearchModal from 'components/SearchModal';

  export let items = [];
  export let onChange;
  export let stateName;
  export let label = '';
  export let validationText;
  export let disabled = false;
  export let readonly = false;
  export let showValidations = false;
  export let extraLabel;
  export let extraLabelClass;
  export let showExtraLabel;

  let stateField;
  let id = 'state';

  const searchIdentifier = `state_select_${Track.makeUid()}`; // Add a UUID since this field can exist in multiple places

  function openStateModal(event) {
    event?.preventDefault();

    stateField.blur();

    triggerSearchModal({
      identifier: searchIdentifier,
      placeholder: STATE_SEARCH_PLACEHOLDER,
      all: STATE_SEARCH_ALL,
      items: generateStateList(items),
      keys: ['name', 'code'],
      component: StateSearchItem,
      onSelect: (data) => {
        stateName = data.name;
        onChange(id, data.name);
      },
    });
  }

  function downArrowHandler(event) {
    const DOWN_ARROW = 40;
    const key = _.getKeyFromEvent(event);

    if (key === DOWN_ARROW) {
      openStateModal(event);
    }
  }

  function generateStateList(items) {
    let stateList = [];
    if (Array.isArray(items)) {
      stateList = items.map((item) => ({
        _key: item.name,
        name: item.name,
        state_code: item.state_code,
      }));
    }
    return stateList;
  }

  function handleOnFocus(event) {
    if (readonly) {
      openStateModal(event);
    }
  }
</script>

<div class:field-wrapper={showExtraLabel && extraLabel}>
  <Field
    bind:this={stateField}
    {id}
    name="state"
    autocomplete="off"
    value={stateName || ''}
    on:click={openStateModal}
    on:keydown={downArrowHandler}
    on:focus={handleOnFocus}
    required
    icon=""
    label={label || `${$t(STATE_LABEL)}*`}
    on:input={(e) => {
      stateName = e.target.value;
      onChange(id, e.target.value);
    }}
    on:blur
    {validationText}
    elemClasses="address-elem dropdown-select"
    labelClasses="address-label"
    {disabled}
    showDropDownIcon={true}
    {readonly}
    {showValidations}
    handleInput
  />
  {#if showExtraLabel && extraLabel}
    <div class={`${extraLabelClass} extralabel`}>
      {$t(extraLabel)}
    </div>
  {/if}
</div>

<style lang="scss">
  .field-wrapper .successText {
    color: var(--positive-text-color);
  }
  .field-wrapper .failureText {
    color: var(--error-validation-color);
  }
  .field-wrapper .extralabel {
    position: absolute;
    left: 0px;
    top: 60px;
    font-size: 11px;
  }
  .field-wrapper {
    position: relative;
    margin-bottom: 12px;
  }
</style>
