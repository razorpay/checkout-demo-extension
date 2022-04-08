<script>
  // Svelte imports
  import { getOption } from 'razorpay';
  import { onMount } from 'svelte';
  import Icon from 'ui/elements/Icon.svelte';

  //i18n
  import { t, locale } from 'svelte-i18n';
  import { formatTemplateWithLocale } from 'i18n';
  import FormattedText from 'ui/elements/FormattedText/FormattedText.svelte';

  import {
    COVID_DONATIONS_PAYMENT_SUCCESS,
    COVID_DONATIONS_HEADER,
    COVID_DONATIONS_CTA_TEXT,
    COVID_DONATIONS_SUB_TEXT,
    COVID_DONATIONS_REDIRECTION_TEXT,
  } from 'ui/labels/covid-donations';

  // Utils
  import { getSession } from 'sessionmanager';
  import Analytics from 'analytics';
  import * as AnalyticsTypes from 'analytics-types';
  import { getThemeMeta } from 'checkoutstore/theme';

  let merchantName = getOption('name');

  export let onCompletionHandler;
  let interval;
  const covidPageLink =
    'https://razorpay.com/links/covid19?ref=checkout_covid_donations#hs_cos_wrapper_widget_1585571452797';

  const session = getSession();
  const themeMeta = getThemeMeta();
  const icons = themeMeta.icons;
  let secondsRemaining = 10;

  function finishCheckout() {
    clearInterval(interval);
    if (onCompletionHandler) {
      onCompletionHandler();
    }
  }
  onMount(() => {
    Analytics.track('coviddonation:alert:show', {
      type: AnalyticsTypes.RENDER,
    });
    interval = setInterval(() => {
      secondsRemaining--;
      if (secondsRemaining === 0) {
        finishCheckout();
      }
    }, 1000);
    session.r.on('backDropClicked', () => {
      finishCheckout();
    });
  });

  function donateCtaHandle() {
    Analytics.track('coviddonation:cta:click', {
      type: AnalyticsTypes.BEHAV,
    });
    finishCheckout();
    window.open(covidPageLink, '_blank');
  }
</script>

<covid-wrap>
  <div id="covid-wrap">
    <div id="covid-wrap-success-text">
      <div class="tick-icon">
        <i slot="icon">
          <Icon icon={icons.tick_filled_donate} />
        </i>
      </div>
      <div>{$t(COVID_DONATIONS_PAYMENT_SUCCESS)}</div>
    </div>
    <div class="button-wrapper">
      <div class="donate-icon">
        <i slot="icon">
          <Icon icon={icons.donate_heart} />
        </i>
      </div>
      <div class="header">{$t(COVID_DONATIONS_HEADER)}</div>
      <div on:click={donateCtaHandle} class="donate-button">
        {$t(COVID_DONATIONS_CTA_TEXT)}
      </div>
      <div class="donate-subtext">
        {$t(COVID_DONATIONS_SUB_TEXT)}
      </div>
    </div>
    <div class="redirection-text">
      <FormattedText
        text={formatTemplateWithLocale(
          COVID_DONATIONS_REDIRECTION_TEXT,
          { secondsRemaining, merchantName },
          $locale
        )}
      />
    </div>
  </div>
</covid-wrap>

<style>
  .tick-icon {
    margin-top: 2px;
    margin-right: 4px;
  }
  .donate-icon {
    margin-bottom: 3px;
  }
  .header {
    color: #11082c;
  }
  .redirection-text {
    color: #3f71d7;
    text-decoration-line: underline;
    font-size: 11px;
  }
  .donate-subtext {
    font-size: 12px;
    line-height: 1.4;
    margin-top: 8px;
  }
  .button-wrapper {
    margin: 20px 14px 14px 14px;
    background: linear-gradient(270deg, #ecf2ff -0.15%, #f4fbff 99.85%);
    border-radius: 2px;
    padding: 20px;
  }
  .donate-button {
    cursor: pointer;
    background: linear-gradient(266.47deg, #0067ff -3.91%, #2b8dd5 112.81%);
    border-radius: 2px;
    margin: 15px 0 8px 0;
    font-size: 12px;
    padding: 8px 30px;
    display: inline-block;
    color: #ffffff;
  }
  :global(.mobile) #covid-wrap {
    bottom: 0;
  }
  #covid-wrap {
    border-radius: 0 0 3px 3px;
    background: #fff;
    bottom: -55px;
    position: absolute;
    width: 100%;
    -webkit-box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.16);
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.16);
    height: 275px;
    -webkit-transition: 0.2s;
    -o-transition: 0.2s;
    transition: 0.2s;
    padding-top: 20px;
    z-index: 100;
  }
  #covid-wrap-success-text {
    display: flex;
    justify-content: center;
  }
</style>
