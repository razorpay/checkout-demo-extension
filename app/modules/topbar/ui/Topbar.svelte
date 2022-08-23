<script>
  // svelte imports
  import { createEventDispatcher, tick } from 'svelte';

  // UI imports
  import Icon from 'ui/elements/Icon.svelte';

  // store imports
  import { showFeeLabel } from 'checkoutstore/fee';

  import { getAmount } from 'razorpay';

  // utils imports
  import { setAmount } from 'topbar/sessionInterface';
  import {
    dynamicFeeObject,
    addCardView,
    showFeesIncl,
  } from 'checkoutstore/dynamicfee';
  import back_arrow from 'icons/back_arrow';
  import LanguageSelection from './components/LanguageSelection.svelte';

  const dispatch = createEventDispatcher();

  let shown = true;
  export function show() {
    shown = true;
  }

  export function hide() {
    shown = false;
  }

  function handleBackClick() {
    //For QR Based Feebearer payements, set the amount to the original amount.
    const amount = getAmount();
    setAmount(amount);
    $showFeeLabel = true;
    tick().then(() => {
      dynamicFeeObject.set({});
      showFeesIncl.set({});
      addCardView.set('');
    });

    dispatch('back');
  }
</script>

{#if shown}
  <div id="topbar-new" class:topbar-header={true}>
    <div class="title-section">
      <span class="back" on:click={handleBackClick}>
        <Icon icon={back_arrow()} />
      </span>
      <div>
        <LanguageSelection />
      </div>
    </div>
  </div>
{/if}

<style>
  #topbar-new {
    position: sticky;
    top: 0;
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid #e1e5ea;
    padding: 9px 16px;
    align-items: center;
    box-sizing: border-box;
    height: 44px;
    z-index: 2;
    box-shadow: 10px 10px 30px rgba(107, 108, 109, 0.1);
  }

  .back {
    cursor: pointer;
    margin-right: 10px;
  }
  .title-section {
    display: flex;
    align-items: center;
    font-weight: 600;
    text-transform: capitalize;
    flex: 1;
    justify-content: space-between;
  }
</style>
