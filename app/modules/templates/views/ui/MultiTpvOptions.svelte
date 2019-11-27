<script>
  import SlottedRadioOption from 'templates/views/ui/options/Slotted/RadioOption.svelte';
  import Icon from 'templates/views/ui/Icon.svelte';

  export let bank;
  export let icons;

  export let selectedOption = '';

  function handleOptionSelection(option) {
    selectedOption = option;
  }
</script>

<div class="multi-tpv-header">Pay Using</div>
<div class="border-list">
  <SlottedRadioOption
    name="method"
    value="netbanking"
    selected={selectedOption === 'netbanking'}
    on:click={_ => handleOptionSelection('netbanking')}>
    <i slot="icon">
      <Icon icon="https://cdn.razorpay.com/bank/{bank.code}.gif" />
    </i>
    <div slot="title">A/C: {bank.account_number}</div>
    <div slot="subtitle">{bank.name}</div>
  </SlottedRadioOption>
  <SlottedRadioOption
    name="method"
    value="upi"
    selected={selectedOption === 'upi'}
    on:click={_ => handleOptionSelection('upi')}>
    <i slot="icon">
      <Icon icon={icons.upi} />
    </i>
    <div slot="title">UPI</div>
    <div slot="subtitle">{bank.name} Account {bank.account_number}</div>
  </SlottedRadioOption>
</div>
