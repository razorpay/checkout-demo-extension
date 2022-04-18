<script>
  // UI Imports
  import SlottedOption from 'ui/elements/options/Slotted/Option.svelte';
  import Icon from 'ui/elements/Icon.svelte';
  import RewardsIcon from 'ui/components/rewards/Icon.svelte';

  // Store
  import { contact, isContactPresent, email } from 'checkoutstore/screens/home';
  import {
    isEmailOptional,
    isContactHidden,
    isEmailHidden,
    isContactEmailHidden,
  } from 'razorpay';
  import { reward } from 'checkoutstore/rewards';
  import { getThemeMeta } from 'checkoutstore/theme';

  export let onEdit;

  const themeMeta = getThemeMeta();
  const { edit } = themeMeta.icons;

  let showUserDetailsStrip;
  $: {
    showUserDetailsStrip =
      ($isContactPresent || $email) && !isContactEmailHidden();
  }
</script>

{#if showUserDetailsStrip}
  <div class="details-strip-container">
    <div class="details-strip border-list-horizontal">
      <SlottedOption on:click={onEdit} id="user-details">
        <i slot="icon">
          <Icon icon={edit} />
        </i>
        <div slot="title">
          {#if $isContactPresent && !isContactHidden()}
            <span>{$contact}</span>
          {/if}
          {#if $email && !isEmailHidden()}<span>{$email}</span>{/if}
        </div>
      </SlottedOption>
      {#if $reward?.reward_id && !isEmailOptional()}
        <RewardsIcon />
      {/if}
    </div>
  </div>
{/if}

<style>
  .details-strip-container {
    /* margin: 12px; */
    white-space: nowrap;
    text-overflow: ellipsis;
    margin-bottom: 20px;
  }

  .details-strip-container :global(.stack > div:nth-of-type(1)) {
    flex-grow: 1;
  }

  .details-strip-container div[slot='title'] {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .details-strip-container div[slot='title'] span:first-child {
    font-size: 0.9rem;
    color: #363636;
  }

  .details-strip-container div[slot='title'] span:nth-child(2) {
    font-size: 0.7rem;
    color: #757575;
    margin-left: 8px;
    padding-left: 8px;
    border-left: solid 1px #757575;
  }

  .details-strip {
    display: flex;
  }
</style>
