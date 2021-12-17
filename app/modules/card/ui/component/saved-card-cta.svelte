<script lang="ts">
  import { getSession } from 'sessionmanager';

  // i18n
  import { t } from 'svelte-i18n';
  import Icon from 'ui/elements/Icon.svelte';
  import {
    PAY_WITH_SAVED_CARD,
    PAY_WITH_SAVED_CARD_SUBTITLE,
  } from 'card/i18n/labels';

  const session = getSession();
  const icons: { [x: string]: any } = session.themeMeta.icons;

  export let showSubTitle = true;
</script>

<div class="pad">
  <div class="saved-card-cta" on:click>
    <div class="saved-content">
      <div class="saved-icon">
        <Icon icon={icons.saved_card} />
      </div>
      <div class="saved-text">
        <div>{$t(PAY_WITH_SAVED_CARD)}</div>
        {#if showSubTitle}
          <div class="saved-text-subtitle">
            {$t(PAY_WITH_SAVED_CARD_SUBTITLE)}
          </div>
        {/if}
      </div>
    </div>
    <div class="arrow-right theme-highlight-color">&#xe604;</div>
  </div>
</div>

<style>
  .saved-card-cta {
    background: #ffffff;
    border: 1px solid rgba(0, 0, 0, 0.08);
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
    padding: 12px 16px;
    cursor: pointer;
  }

  .saved-content {
    display: flex;
    align-items: center;
  }

  .saved-text {
    margin-left: 10px;
    display: flex;
    flex-direction: column;
    font-size: 13px;
    line-height: 16px;
    color: #373737;
  }

  .saved-text-subtitle {
    font-size: 12px;
    line-height: 16px;
    color: rgba(81, 89, 120, 0.7);
  }

  .arrow-right {
    display: flex;
    align-items: center;
    transform: rotate(180deg);
    font-size: 8px;
  }
</style>
