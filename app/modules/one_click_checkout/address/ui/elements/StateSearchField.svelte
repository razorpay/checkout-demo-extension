<script>
  import { t } from 'svelte-i18n';
  import { Track } from 'analytics';
  import Field from 'ui/components/Field.svelte';
  import SearchModal from 'ui/elements/SearchModal.svelte';
  import StateSearchItem from 'one_click_checkout/address/ui/elements/StateSearchItem.svelte';
  import {
    STATE_LABEL,
    STATE_SEARCH_ALL,
    STATE_SEARCH_PLACEHOLDER,
  } from 'one_click_checkout/address/i18n/labels';
  import { truncateString } from 'utils/strings';
  import { createEventDispatcher } from 'svelte';

  export let items = [];
  export let onChange;
  export let stateName;
  export let label = '';
  export let modifyIconPosition;
  export let validationText;

  let open = false;
  let stateField;
  let id = 'state';

  const dispatch = createEventDispatcher();
  const searchIdentifier = `state_select_${Track.makeUid()}`; // Add a UUID since this field can exist in multiple places

  function openStateModal(event) {
    event?.preventDefault();

    stateField.blur();
    open = true;
  }

  function closeStateModal() {
    open = false;
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
</script>

<Field
  bind:this={stateField}
  {id}
  name="state"
  autocomplete="off"
  value={stateName}
  displayValue={truncateString(stateName, 12)}
  on:click={openStateModal}
  on:keydown={downArrowHandler}
  required
  icon=""
  {modifyIconPosition}
  label={label || `${$t(STATE_LABEL)}*`}
  on:input={(e) => {
    stateName = e.target.value;
    onChange(id, e.target.value);
  }}
  on:blur
  {validationText}
  elemClasses="address-elem"
  labelClasses="address-label"
  showDropDownIcon={true}
/>
<SearchModal
  bind:open
  identifier={searchIdentifier}
  all={$t(STATE_SEARCH_ALL)}
  placeholder={$t(STATE_SEARCH_PLACEHOLDER)}
  items={generateStateList(items)}
  component={StateSearchItem}
  keys={['name', 'code']}
  on:close={closeStateModal}
  on:select={({ detail }) => {
    stateName = detail.name;
    onChange(id, detail.name);
    closeStateModal();
  }}
/>
