<script>
  // Utils imports
  import Icon from 'ui/elements/Icon.svelte';
  import shield from 'card/icons/shield';
  import { getOption, isRecurring, isSubscription } from 'razorpay';
  import { formatTemplateWithLocale } from 'i18n';

  // reusing the existing one
  import close from 'one_click_checkout/coupons/icons/close.js';
  // i18n
  import { t, locale } from 'svelte-i18n';

  // Export Statements
  export let onClick, modalType;
  export let merchantName = getOption('name');
  // i18n labels
  import {
    SAVE_CARD_KNOW_MORE_EXISTING_CARD_MODAL_TITLE,
    SAVE_CARD_KNOW_MORE_EXISTING_CARD_MODAL_CONTENT1,
    SAVE_CARD_KNOW_MORE_EXISTING_CARD_MODAL_CONTENT2,
    SAVE_CARD_KNOW_MORE_EXISTING_CARD_MODAL_CONTENT_BULLET1,
    SAVE_CARD_KNOW_MORE_ADD_CARD_MODAL_TITLE,
    SAVED_CARD_KNOW_MORE_SUBSCRIPTION_CONTENT,
    SAVE_CARD_KNOW_MORE_ADD_CARD_MODAL_CONTENT1,
    SAVED_CARD_KNOW_MORE_CAW_CONTENT,
  } from 'ui/labels/card';
</script>

<div class="secure-card-know-more-overlay" id="know-more-modal">
  <div class="secure-card-know-more-header">
    <span class="secure-card-know-more-header-title">
      {#if modalType === 'add-new-card'}
        {$t(SAVE_CARD_KNOW_MORE_ADD_CARD_MODAL_TITLE)}
      {:else}
        {$t(SAVE_CARD_KNOW_MORE_EXISTING_CARD_MODAL_TITLE)}
      {/if}
    </span>
    <span class="secure-card-know-more-header-close" on:click={onClick}
      ><Icon icon={close()} /></span
    >
  </div>
  <div class="secure-card-know-more-content">
    {#if modalType === 'add-new-card'}
      <!-- If recurring -->
      {#if isRecurring()}
        <div class="recurring-know-more-container">
          <div class="recurring-shield">
            <Icon icon={shield()} />
          </div>
          <div>
            <p>
              {formatTemplateWithLocale(
                'card.save_card_know_more_add_card_modal_content_recurring',
                { merchantName },
                $locale
              )}
            </p>

            {#if isSubscription()}
              <!-- If recurring and subscription -->
              <p>{$t(SAVED_CARD_KNOW_MORE_SUBSCRIPTION_CONTENT)}</p>
            {:else}
              <!-- If recurring and !subscription i.e caw-->
              <p>{$t(SAVED_CARD_KNOW_MORE_CAW_CONTENT)}</p>
            {/if}
          </div>
        </div>
      {:else}
        <p>{$t(SAVE_CARD_KNOW_MORE_ADD_CARD_MODAL_CONTENT1)}</p>
      {/if}
    {:else}
      <p>{$t(SAVE_CARD_KNOW_MORE_EXISTING_CARD_MODAL_CONTENT1)}</p>
      <p>{$t(SAVE_CARD_KNOW_MORE_EXISTING_CARD_MODAL_CONTENT2)}</p>

      <ul>
        <li>
          <span class="know-more-modal-icon"><Icon icon={shield()} /></span>
          <span>
            {$t(SAVE_CARD_KNOW_MORE_EXISTING_CARD_MODAL_CONTENT_BULLET1)}
          </span>
        </li>
      </ul>
    {/if}
  </div>
</div>

<style>
  .secure-card-know-more-overlay {
    box-sizing: border-box;
    background: white;
    text-align: start;
    padding: 20px;
  }
  .recurring-know-more-container {
    display: flex;
  }
  .recurring-shield {
    margin: 14px 6px 0px 0px;
  }
  .secure-card-know-more-header {
    display: flex;
    justify-content: space-between;
  }

  .secure-card-know-more-header-title {
    font-weight: 600;
    font-size: 12px;
    line-height: 14px;
    text-transform: uppercase;
    color: #3f71d7;
  }

  .secure-card-know-more-header-close {
    color: #000000;
    cursor: pointer;
    font-size: 12px;
    line-height: 14px;
    font-weight: bold;
  }

  .secure-card-know-more-content {
    font-size: 12px;
    line-height: 17px;
    color: rgba(81, 89, 120, 0.7);
  }

  .secure-card-know-more-content ul {
    padding: 0;
    margin: 0;
    list-style: none;
  }

  .secure-card-know-more-content li {
    padding-left: 12px;
    text-indent: -0.7rem;
    padding-bottom: 5px;
  }

  .know-more-modal-icon {
    padding-right: 5px;
  }
</style>
