<script lang="ts">
  import { onDestroy } from 'svelte';
  import { locale, t } from 'svelte-i18n';
  import { formatTemplateWithLocale } from 'i18n';
  import FormattedText from 'ui/elements/FormattedText/FormattedText.svelte';
  import { TIMER_CALLOUT, CALLOUT_TIMEOUT } from 'ui/labels/callouts';
  import { isRedesignV15 } from 'razorpay';
  // how long should timer be displayed
  export let expiry;
  export let onExpire;

  // string in mm:ss, to indicate time left
  let displayTime;

  const timerFn = () => {
    const millisecLeft = expiry - _.now();
    if (millisecLeft <= 0) {
      clear();
      onExpire();
    }
    const secLeft = Math.round(millisecLeft / 1000);
    displayTime =
      Math.floor(secLeft / 60) + ':' + ('0' + (secLeft % 60)).slice(-2);
  };
  timerFn();

  // refs to clear timeouts
  const interval = setInterval(timerFn, 1000);

  export function clear() {
    clearInterval(interval);
  }

  onDestroy(clear);
</script>

<div id="timeout">
  {#if isRedesignV15()}
    <div>
      <i>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M7.9925 0.5C3.8525 0.5 0.5 3.86 0.5 8C0.5 12.14 3.8525 15.5 7.9925 15.5C12.14 15.5 15.5 12.14 15.5 8C15.5 3.86 12.14 0.5 7.9925 0.5ZM8 14C4.685 14 2 11.315 2 8C2 4.685 4.685 2 8 2C11.315 2 14 4.685 14 8C14 11.315 11.315 14 8 14ZM8.375 4.25H7.25V8.75L11.1875 11.1125L11.75 10.19L8.375 8.1875V4.25Z"
            fill="#E06B43"
          />
        </svg>
      </i>
      <span>{$t(CALLOUT_TIMEOUT)}</span>
    </div>
    <div>{displayTime} minutes</div>
  {:else}
    <i>&#x2139</i>
    <FormattedText
      text={formatTemplateWithLocale(
        TIMER_CALLOUT,
        { minutes: displayTime },
        $locale
      )}
    />
  {/if}
</div>

<style lang="scss">
  #timeout {
    padding: 12px;
    text-align: center;
    i {
      margin: 0;
      font-size: 18px;
      vertical-align: middle;
    }
  }

  :global(.redesign) {
    #timeout {
      color: #263a4a;
      text-align: left;
      display: flex;
      justify-content: space-between;
      padding: 7px 16px;
      font-size: 12px;
      font-weight: 700;

      i svg {
        margin-right: 4px;
      }

      span {
        position: relative;
        left: 0;
      }
    }
  }
</style>
