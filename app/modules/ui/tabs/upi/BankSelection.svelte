<script>
  import Screen from 'ui/layouts/Screen.svelte';
  import SlottedRadioOption from 'ui/elements/options/Slotted/RadioOption.svelte';
  import FormattedText from 'ui/elements/FormattedText/FormattedText.svelte';
  import Icon from 'ui/elements/Icon.svelte';

  import { _ as t, locale } from 'svelte-i18n';

  import { ID_LINKED_TO_BANK } from 'ui/labels/upi';

  export let value = null;

  const banksThatSupportRecurring = [
    {
      name: 'ICICI Bank',
      id: 'icic',
      img: 'ICIC',
    },
    {
      name: 'HDFC Bank',
      id: 'hdfc',
      img: 'HDFC',
    },
    {
      name: 'SBI Bank',
      id: 'sbi',
      img: 'SBIN',
    },
    {
      name: 'AXIS Bank',
      id: 'axis',
      img: 'UTIB',
    },
    {
      name: 'Yes Bank',
      id: 'yesb',
      img: 'YESB',
    },
    {
      name: 'IndusInd bank',
      id: 'indb',
      img: 'INDB',
    },
    {
      name: 'Paytm payments bank',
      id: 'pytm',
      img: 'PYTM',
    },
  ];
</script>

<div class="legend left">{$t(ID_LINKED_TO_BANK)}</div>
<div class="border-list" id="upi-recurring-bank-list">
  {#each banksThatSupportRecurring as bank}
    <SlottedRadioOption
      name="upi_recurring_psp_bank"
      ellipsis
      selected={(value && value.id) === bank.id}
      on:click={() => {
        value = bank;
      }}
    >
      <div slot="title" id={`upi-psp-bank-${bank.id}`}>{bank.name}</div>
      <i slot="icon">
        <Icon icon={`https://cdn.razorpay.com/bank/${bank.img}.gif`} />
      </i>
    </SlottedRadioOption>
  {/each}
</div>

<style>
  .legend {
    margin-top: 10px;
    padding: 12px 0 8px 12px;
  }
  .recurring-supported-apps-note {
    padding: 10px;
    border: 1px solid #e6e7e8;
    background: #fcfcfc;
    font-size: 12px;
    line-height: 16px;
    margin-top: 14px;
  }
</style>
