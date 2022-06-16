<script>
  // UI imports
  import { onMount } from 'svelte';
  import DowntimeIcon from 'ui/elements/Downtime/Icon.svelte';
  import { getSession } from 'sessionmanager';
  import Icon from 'ui/elements/Icon.svelte';
  import { selectedInstrument } from 'checkoutstore/screens/home';
  import { resetSelectedUPIAppForPay } from 'checkoutstore/screens/upi';

  // i18
  import { t, locale } from 'svelte-i18n';
  import { formatTemplateWithLocale, getLongBankName } from 'i18n';
  import FormattedText from 'ui/elements/FormattedText/FormattedText.svelte';

  import {
    DOWNTIME_HIGHLIGHT1,
    DOWNTIME_CARD_HIGHLIGHT2,
    DOWNTIME_HIGHLIGHT2,
    DOWNTIME_HIGHLIGHT3,
  } from 'ui/labels/downtime';

  import { Events, DowntimeEvents, MetaProperties } from 'analytics';
  import { getThemeMeta } from 'checkoutstore/theme';
  import { popStack } from 'navstack';

  // helper imports
  import { isOneClickCheckout } from 'razorpay';

  export let instrument;

  const session = getSession();
  const isOneCCEnabled = isOneClickCheckout();
  const themeMeta = getThemeMeta();
  const icons = themeMeta.icons;

  const handleContinue = () => {
    popStack();
    session.submit();
  };
  const handleBack = () => {
    popStack();
    resetSelectedUPIAppForPay();
  };
  onMount(() => {
    Events.setMeta(MetaProperties.DOWNTIME_ALERTSHOWN, true);
    Events.TrackRender(DowntimeEvents.DOWNTIME_ALERTSHOW, {
      instrument,
      downtimeMethod: $selectedInstrument?.method,
    });
    if ($selectedInstrument?.method === 'netbanking') {
      instrument = getLongBankName(instrument, $locale);
    }
  });
</script>

<div id="downtime-wrap" class:container-one-cc={isOneCCEnabled}>
  <div class="container">
    <ul class="list">
      <li class={isOneCCEnabled ? 'theme line1-one-cc' : 'line1'}>
        <div class="icon-wrapper">
          <DowntimeIcon severe="high" />
        </div>
        <div>{$t(DOWNTIME_HIGHLIGHT1)}</div>
      </li>
      <li class="line2">
        <div class="icon-wrapper"><Icon icon={icons.warning} /></div>
        <div>
          {#if $selectedInstrument?.method === 'card'}
            <FormattedText
              text={formatTemplateWithLocale(
                DOWNTIME_CARD_HIGHLIGHT2,
                { instrument },
                $locale
              )}
            />
          {:else}
            <FormattedText
              text={formatTemplateWithLocale(
                DOWNTIME_HIGHLIGHT2,
                { instrument },
                $locale
              )}
            />
          {/if}
        </div>
      </li>
      <li class="line3">
        <div class="icon-wrapper"><Icon icon={icons.refund} /></div>
        <div>
          <FormattedText text={$t(DOWNTIME_HIGHLIGHT3)} />
        </div>
      </li>
    </ul>
    <div class="buttons">
      <button
        class="back-button {isOneCCEnabled
          ? 'theme theme-border'
          : 'blue-back-btn'}"
        on:click={handleBack}>Back</button
      >
      <button
        class="continue-button {isOneCCEnabled
          ? 'theme-bg-color'
          : 'blue-continue-btn'}"
        on:click={handleContinue}>Continue</button
      >
    </div>
  </div>
</div>

<style>
  .line1 {
    color: #3f71d7;
  }
  .line2 {
    color: rgba(81, 89, 120, 0.7);
    margin-top: 16px;
  }
  .line3 {
    color: rgba(81, 89, 120, 0.7);
    margin-top: 16px;
  }
  .list {
    list-style: none;
    padding: 0 10px;
  }
  .list li {
    display: flex;
  }
  .list li div {
    margin-left: 4px;
    text-align: left;
    white-space: normal;
  }
  .buttons {
    display: flex;
    justify-content: space-around;
    font-size: 16px;
  }
  .container {
    padding: 0 16px;
  }
  .back-button {
    padding: 12px 32px;
    border: 1px solid;
  }

  .blue-back-btn {
    border-color: #5aa4f5;
    color: #5aa4f5;
  }
  .continue-button {
    padding: 12px 60px;
    color: #ffffff;
  }
  .blue-continue-btn {
    background: linear-gradient(
        97.84deg,
        rgba(255, 255, 255, 0.2) 0%,
        rgba(0, 0, 0, 0.2) 100%
      ),
      #3a97fc;
  }

  .icon-wrapper {
    min-width: 25px;
    text-align: right;
    margin-top: 2px;
  }
  #downtime-wrap {
    border-radius: 0 0 3px 3px;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.16);
    height: 250px;
    transition: 0.2s;
    padding-top: 20px;
  }
  #downtime-wrap.container-one-cc {
    height: auto;
    bottom: 0px;
    padding: 20px 0px;
  }
  .container-one-cc .list {
    margin: 6px 0px 26px;
  }
  .container-one-cc .list li div {
    font-size: 12px;
  }

  .line1-one-cc {
    font-weight: 600;
  }

  .container-one-cc .line2,
  .container-one-cc .line3 {
    color: #8d97a1;
    font-weight: 400;
  }

  .container-one-cc .buttons button {
    border-radius: 6px;
    font-weight: 700;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 16px;
  }
</style>
