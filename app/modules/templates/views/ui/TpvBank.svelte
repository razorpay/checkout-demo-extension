<script>
  export let bank;
  export let accountName;
  export let showIfsc;
</script>

<style>
  .customer-bank-details {
    padding: 0 24px;
  }
</style>

<div class="customer-bank-details">
  <div class="bank-name">
    {#if bank.image}
      <img src={bank.image} />
    {/if}
    {#if bank.name}{bank.name}{:else}Bank Details{/if}
  </div>
  {#if bank.account_number}
    <div class="account-details clearfix">
      <div>Account Number</div>
      <div>{bank.account_number}</div>
    </div>
  {/if}
  {#if accountName}
    <div class="account-details clearfix">
      <div>Customer Name</div>
      <div>{accountName}</div>
    </div>
  {/if}
  {#if showIfsc && bank.ifsc}
    <div class="account-details clearfix">
      <div>IFSC code</div>
      <div class="text-uppercase">{bank.ifsc}</div>
    </div>
  {/if}
</div>
