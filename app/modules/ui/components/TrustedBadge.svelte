<script>
  // svelte imports
  import Icon from 'ui/elements/Icon.svelte';

  // Store
  import { getMerchantId } from 'checkoutstore';

  //Utils
  import { getSession } from 'sessionmanager';

  //i18n
  import {
    TRUSTED_BADGE_CUSTOMER_LABEL,
    TRUSTED_BADGE_SELLER_LABEL,
  } from 'ui/labels/trusted-badge';
  import { t, locale } from 'svelte-i18n';

  import trustedBadge from 'ui/constants/trusted-badge';

  //props
  export const list = trustedBadge[getMerchantId()].list;
  const icons = getSession().themeMeta.icons;
  export let isInfoVisible = false;

  function handleInfoClicked() {
    isInfoVisible = !isInfoVisible;
  }
</script>

<style>
  .trusted-badge-wrapper {
    padding: 16px 32px;
  }
  .trusted-badge-header-section {
    display: flex;
    align-items: center;
  }
  .trusted-badge-header-labels {
    margin-left: 12px;
    display: inline-block;
    line-height: 16px;
  }
  .trusted-badge-list-text {
    display: inline-block;
    font-size: 12px;
    line-height: 18px;
    color: #575757;
    margin: 10px 0 0 24px;
    width: 86%;
  }
  .trusted-badge-list-item {
    margin-left: 12px;
  }
  .trusted-badge-header-labels > span {
    font-size: 11px;
  }
  .trusted-badge-arrow {
    float: right;
    cursor: pointer;
  }
  .trusted-badge-full-width {
    width: 100%;
  }
  .trusted-badge-border-top {
    border-top: 1px solid;
    padding-top: 16px;
  }
</style>

<trusted-badge>
  <div class="trusted-badge-wrapper">
    <div class="trusted-badge-header-section">
      <i slot="icon">
        <Icon icon={icons.trusted_badge} />
      </i>
      <div class="trusted-badge-full-width">
        <div class="trusted-badge-header-labels">
          <span>{$t(TRUSTED_BADGE_CUSTOMER_LABEL)}</span>
          <div><b>{$t(TRUSTED_BADGE_SELLER_LABEL)}</b></div>
        </div>
        <div class="trusted-badge-arrow" on:click={handleInfoClicked}>
          {#if isInfoVisible}^{:else}{'>'}{/if}
        </div>
      </div>
    </div>
    {#if isInfoVisible}
      <div class="trusted-badge-info-section">
        {#each list as point, i}
          <div class="trusted-badge-list-item">
            <i slot="icon">
              <Icon icon={icons.tick_filled} />
            </i>
            <div
              class={`trusted-badge-list-text ${i === 0 ? 'trusted-badge-border-top' : ''}`}>
              {point}
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</trusted-badge>
