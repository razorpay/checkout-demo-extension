<script>
  // import store from '../store';
  // import NeftPrintDetails from './NeftPrintDetails.svelte';
  import { getOption, getAmount, showFeeLabel } from 'checkoutstore';
  import { getCustomerDetails } from 'checkoutstore/screens/home';
  import { onMount } from 'svelte';

  let neftView;

  onMount(() => {
    const currentWindow = neftView.ownerDocument.defaultView;
    currentWindow.print();
    currentWindow.close();
  });
</script>

<neftView bind:this={neftView}>
  <div class="neft-print-view">
    <h2>Challan Payment Details</h2>

    <footer>
      <p>
        <b>Note:</b>
        Please pay the exact amount to the last paisa. Incorrect amount and Bank
        Account details will lead to rejection of deposit.
      </p>
      <p>Do not make multiple transfers using the same challan.</p>
      <p>
        The contents of this challan should not be modified when presented to
        any bank for remittance of funds.
      </p>
      <p>
        You may also add this account number/IFSC code as beneficiary in your
        Netbanking account and initiate NEFT / RTGS / IMPS funds transfer.
      </p>
      <p>Please use your own Challan details while doing Transaction.</p>
      <p>
        NEFT needs to be deposited against the account number and for the exact
        amount mentioned above only.
      </p>
      <p>
        Kindly ensure the transaction is made online or via branch well before
        the Challan expiry date mentioned above.
      </p>
      <p>
        In case you fail to deposit the NEFT within Challan expiry date, please
        regenerate the Challan.
      </p>
    </footer>
  </div>
</neftView>
