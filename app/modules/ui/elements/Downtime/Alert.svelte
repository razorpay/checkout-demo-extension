<script>
  // UI imports
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

  let instrument;
  const session = getSession();
  const themeMeta = getThemeMeta();
  const icons = themeMeta.icons;

  const handleContinue = () => {
    session.hideOverlayMessage();
    session.submit();
  };
  const handleBack = () => {
    session.hideOverlayMessage();
    resetSelectedUPIAppForPay();
  };
  export const handleChange = function (param) {
    instrument = param;
    Events.setMeta(MetaProperties.DOWNTIME_ALERTSHOWN, true);
    Events.TrackRender(DowntimeEvents.DOWNTIME_ALERTSHOW, {
      instrument,
      downtimeMethod: $selectedInstrument?.method,
    });
    if ($selectedInstrument?.method === 'netbanking') {
      instrument = getLongBankName(instrument, $locale);
    }
  };
</script>

<div id="downtime-wrap">
  <div class="container">
    <ul class="list">
      <li class="line1">
        <div class="icon-wrapper"><DowntimeIcon severe="high" /></div>
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
      <button class="back-button" on:click={handleBack}>Back</button>
      <button class="continue-button" on:click={handleContinue}>Continue</button
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
    border: 1px solid #5aa4f5;
    color: #5aa4f5;
  }
  .continue-button {
    padding: 12px 60px;
    background: linear-gradient(
        97.84deg,
        rgba(255, 255, 255, 0.2) 0%,
        rgba(0, 0, 0, 0.2) 100%
      ),
      #3a97fc;
    color: #ffffff;
  }
  .icon-wrapper {
    min-width: 25px;
    text-align: right;
    margin-top: 2px;
  }
  #downtime-wrap {
    border-radius: 0 0 3px 3px;
    background: #fff;
    bottom: -55px;
    position: absolute;
    width: 100%;
    display: none;
    -webkit-box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.16);
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.16);
    height: 250px;
    -webkit-transition: 0.2s;
    -o-transition: 0.2s;
    transition: 0.2s;
    padding-top: 20px;
    z-index: 100;
  }
</style>
