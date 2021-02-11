<script>
  // svelte imports
  import { fade } from 'svelte/transition';

  // Components
  import Icon from 'ui/elements/Icon.svelte';

  //Utils
  import { getSession } from 'sessionmanager';

  //i18n
  import {
    TRUSTED_BADGE_HEADER,
    TRUSTED_BADGE_HIGHLIGHT1,
    TRUSTED_BADGE_HIGHLIGHT2,
    TRUSTED_BADGE_HIGHLIGHT3,
  } from 'ui/labels/trusted-badge';
  import { t, locale } from 'svelte-i18n';
  import { formatTemplateWithLocale } from 'i18n';

  //props
  export let nos;
  const { customersNo, securedTime, noFraudTime } = nos;
  let list;
  $: {
    list = [
      formatTemplateWithLocale(
        TRUSTED_BADGE_HIGHLIGHT1,
        { customersNo },
        $locale
      ),
      formatTemplateWithLocale(
        TRUSTED_BADGE_HIGHLIGHT2,
        { securedTime },
        $locale
      ),
      formatTemplateWithLocale(
        TRUSTED_BADGE_HIGHLIGHT3,
        { noFraudTime },
        $locale
      ),
    ];
  }
  const session = getSession();
  const icons = session.themeMeta.icons;

  export let isInfoVisible = false;

  function handleInfoClicked() {
    isInfoVisible = !isInfoVisible;
  }
</script>

<style>
  .trusted-badge-wrapper {
    padding: 8px 32px;
  }
  .trusted-badge-header-section {
    display: flex;
    cursor: pointer;
  }
  .trusted-badge-header-labels {
    font-size: 16px;
    margin-top: 4px;
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
    padding-top: 16px;
  }
  :global(.screen) > :global(.screen-main) {
    padding-top: 0 !important;
  }
  .arrow {
    border-width: 0 2px 2px 0;
    display: inline-block;
    padding: 3px;
  }
  .arrow-up {
    transform: rotate(-135deg);
    -webkit-transform: rotate(-135deg);
  }
  .arrow-down {
    transform: rotate(45deg);
    -webkit-transform: rotate(45deg);
  }
</style>

<trusted-badge>
  <div class="trusted-badge-wrapper">
    <div class="trusted-badge-header-section" on:click={handleInfoClicked}>
      <i slot="icon">
        <Icon icon={icons.trusted_badge} />
      </i>
      <div class="trusted-badge-full-width">
        <div class="trusted-badge-header-labels">
          <div><b>{$t(TRUSTED_BADGE_HEADER)}</b></div>
        </div>
        <div class="trusted-badge-arrow">
          {#if !isInfoVisible}
            <i class="arrow arrow-down" />
          {:else}<i class="arrow arrow-up" />{/if}
        </div>
      </div>
    </div>
    {#if isInfoVisible}
      <div class="trusted-badge-info-section" in:fade out:fade>
        {#each list as point, i}
          <div class="trusted-badge-list-item">
            <i slot="icon">
              <Icon icon={icons.tick_filled} />
            </i>
            <div
              class="trusted-badge-list-text"
              class:trusted-badge-border-top={i === 0}>
              {point}
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</trusted-badge>
