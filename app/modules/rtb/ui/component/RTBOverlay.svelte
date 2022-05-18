<script lang="ts">
  import RTBIcon from './RTBIcon.svelte';
  import Icon from 'ui/elements/Icon.svelte';
  import {
    RTB_HEADER,
    RTB_HIGHLIGHT1,
    RTB_HIGHLIGHT2,
    RTB_HIGHLIGHT3,
  } from 'rtb/i18n/labels';
  import { getName } from 'razorpay';

  import { t, locale } from 'svelte-i18n';
  import { formatTemplateWithLocale } from 'i18n';
  import { fly, fade } from 'svelte/transition';
  import close from 'one_click_checkout/coupons/icons/close';
  import { popStack } from 'navstack';
  import { onDestroy, onMount } from 'svelte';
  import { Events } from 'analytics';
  import { getRTBAnalyticsPayload } from 'rtb/helper';
  import { RTBEvents } from 'rtb/events';

  onMount(() => {
    Events.TrackRender(RTBEvents.OVERLAY_SHOW, getRTBAnalyticsPayload());
  });

  onDestroy(() => {
    Events.TrackRender(RTBEvents.OVERLAY_HIDE, getRTBAnalyticsPayload());
  });

  const merchantName = getName();
  let list: string[] = [];

  $: {
    list = [
      formatTemplateWithLocale(RTB_HIGHLIGHT1, {}, $locale),
      formatTemplateWithLocale(RTB_HIGHLIGHT2, {}, $locale),
      formatTemplateWithLocale(RTB_HIGHLIGHT3, {}, $locale),
    ];
  }

  function onClose() {
    popStack();
  }
</script>

<div transition:fly={{ duration: 200, y: 20 }} class="rtb-overlay">
  <div class="rtb-overlay-header" data-testid="rtb-overlay-header">
    <div class="rtb-overlay-title">
      <RTBIcon width={50} height={52} />
      <div class="rtb-labels">
        <div class="rtb-merchant-name">{merchantName}</div>
        <div class="rtb-merchant-certification">
          {$t(RTB_HEADER)}
        </div>
        <hr class="rtb-separator" />
      </div>
    </div>
    <div class="rtb-overlay-header-aside">
      <span class="rtb-overlay-close-icon-wrapper" on:click={onClose}>
        <Icon icon={close('#757575')} />
      </span>
    </div>
  </div>
  <div
    data-testid="rtb-overlay-content"
    class="rtb-overlay-content"
    in:fade
    out:fade
  >
    {#each list as point, i}
      <div class="rtb-list-item">
        <div class="rtb-list-text">{point}</div>
      </div>
    {/each}
  </div>
</div>

<style>
  .rtb-overlay {
    padding: 16px;
  }
  .rtb-overlay-header {
    display: flex;
    flex: 1;
    padding-bottom: 8px;
  }
  .rtb-overlay-content {
    background: #e7f7f1;
    color: #616161;
    padding: 16px 16px 2px;
    border-radius: 8px;
  }
  .rtb-overlay-title {
    display: flex;
    align-items: center;
    flex: 1;
    overflow: hidden;
  }
  .rtb-labels {
    overflow: hidden;
    padding: 0 8px;
  }
  .rtb-merchant-name {
    text-align: left;
    color: #424242;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    font-size: 14px;
    line-height: 18px;
  }
  .rtb-merchant-certification {
    text-align: left;
    font-size: 12px;
    line-height: 18px;
    color: #043723;
  }
  .rtb-list-item {
    padding-bottom: 16px;
  }
  .rtb-list-text {
    position: relative;
    padding-left: 24px;
    text-align: left;
    font-size: 12px;
  }
  .rtb-list-text::before {
    display: inline-block;
    position: absolute;
    content: '';
    height: 16px;
    width: 16px;
    background-image: url('data:image/svg+xml,%3Csvg%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2016%2016%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20clip-rule%3D%22evenodd%22%20d%3D%22M8%2016A8%208%200%201%200%208%200a8%208%200%200%200%200%2016Zm4.707-9.96a1%201%200%200%200-1.414-1.414L6.62%209.298%204.66%207.581a1%201%200%201%200-1.317%201.505l2.666%202.333a1%201%200%200%200%201.366-.045l5.333-5.334Z%22%20fill%3D%22%2336B34F%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E');
    background-repeat: no-repeat;
    left: 0;
  }
  .rtb-overlay-close-icon-wrapper {
    cursor: pointer;
  }
  .rtb-separator {
    border: 2px solid #59d686;
    width: 40%;
    background: #59d686;
    border-radius: 4px;
    margin-left: 0;
    margin-bottom: 0;
  }
</style>
