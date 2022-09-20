<script lang="ts">
  // Svelte importrs
  import { createEventDispatcher } from 'svelte';

  // Store
  import { t, locale } from 'svelte-i18n';
  import {
    codReason,
    showCodLoader,
  } from 'one_click_checkout/address/shipping_address/store';
  import { isCodAvailable } from 'one_click_checkout/address/derived';

  // UI imports
  import SlottedOption from 'ui/elements/options/Slotted/Option.svelte';
  import Icon from 'ui/elements/Icon.svelte';
  import CodIcon from 'ui/elements/CodIcon.svelte';

  // Utils imports
  import {
    getMethodNameForPaymentOption,
    getMethodDescription,
  } from 'checkoutframe/paymentmethods';
  import Analytics, { Events, HomeEvents } from 'analytics';
  import * as AnalyticsTypes from 'analytics-types';
  import { formatMessageWithLocale, formatTemplateWithLocale } from 'i18n';
  import { isRedesignV15, getCurrency, isEmiV2 } from 'razorpay';
  import { getRTBAnalyticsPayload } from 'rtb/helper';
  import { testid } from 'tests/autogen';

  // Store imports
  import {
    COD_DISABLED_LABEL,
    COD_CHARGES_DESCRIPTION,
  } from 'one_click_checkout/address/i18n/labels';
  import { codChargeAmount } from 'one_click_checkout/charges/store';
  import { selectedInstrumentId } from 'checkoutstore/screens/home';
  import { isNoCostEmiAvailable } from 'emiV2/store';
  import { enableUPITiles } from 'upi/features';
  import { UPIAppStack } from 'upi/ui/components/UPIAppStack';

  import { PAY_WITH_INSTALLED_OR_OTHERS } from 'upi/i18n/labels';
  import { captureFeature } from 'upi/events';
  import { getThemeMeta } from 'checkoutstore/theme';
  import { formatAmountWithSymbol } from 'common/currency';
  import { upiUxV1dot1 } from 'upi/experiments';
  import { shouldOverrideVisibleState } from 'one_click_checkout/header/store';
  import NoCostLabel from 'components/Label/NoCostLabel.svelte';
  import { NO_COST_EMI_AVAILABLE } from 'ui/labels/offers';
  import { emiMethodClicked } from 'emiV2/events/tracker';

  // Props
  export let method: string = null; // Name of the method
  export let icon = null; // Override: icon. Picked from method if not overridden.
  export let title = null; // Override: title. Picked from method if not overridden.
  export let subtitle = null; // Override: subtitle. Picked from method if not overridden.
  export let instrument = null;
  export let error = '';
  export let disabled = false;
  export let errorLabel = '';
  let uninteractive = false;

  const dispatch = createEventDispatcher();
  const isOneCC = isRedesignV15();

  const themeMeta = getThemeMeta();
  const icons = themeMeta.icons;
  let _icon = getIconForDisplay();
  /**
   * @TODO UPIUX1.1
   * remove experimentation
   * Note: enableUPITiles is to be called with true, once we remove the experiment.
   */
  let upiTiles = enableUPITiles(upiUxV1dot1.enabled());

  let _subtitle;
  const isMethodCOD = method === 'cod';

  $: {
    _subtitle = getSubtitleForDisplay($locale);
    if (isMethodCOD && disabled) {
      _subtitle = '';
    }
    uninteractive =
      method === 'upi' && upiTiles?.status && upiTiles?.variant === 'row';
    if (upiTiles.status) {
      captureFeature('enableUPITiles', upiTiles);
    }
  }

  let _title;
  $: _title = getTitleForDisplay($locale);
  $: codLoading = isMethodCOD && $showCodLoader;

  let _showNoCostLabel = false;
  $: _showNoCostLabel =
    (method === 'cardless_emi' || method === 'emi') && $isNoCostEmiAvailable;

  function getSubtitleForDisplay(locale: string) {
    const currency = getCurrency();
    const spaceAmountWithSymbol = false;

    if (subtitle) {
      return subtitle;
    } else if (isMethodCOD && $codChargeAmount) {
      return `
        <div class="highlight-text">
          ${formatTemplateWithLocale(
            COD_CHARGES_DESCRIPTION,
            {
              charge: formatAmountWithSymbol(
                $codChargeAmount,
                currency,
                spaceAmountWithSymbol
              ),
            },
            locale
          )}
        </div>
      `;
    } else if (method === 'upi' && upiTiles.variant === 'row') {
      return formatMessageWithLocale(PAY_WITH_INSTALLED_OR_OTHERS, locale);
    } else if (method === 'emi' && isEmiV2()) {
      // For new EMI flow taking the description of cardless_emi
      // Since the L1 screen will contain both card and cardless emi option
      return getMethodDescription('cardless_emi', locale);
    }
    return getMethodDescription(method, locale);
  }

  function getTitleForDisplay(locale) {
    return title || getMethodNameForPaymentOption(method, locale);
  }

  function getIconForDisplay() {
    if (icon) {
      return icon;
    }
    if (/card$/.test(method)) {
      return icons['card'];
    }
    return icons[method];
  }

  $: if (isMethodCOD) {
    disabled = !$isCodAvailable || $showCodLoader;
    errorLabel = COD_DISABLED_LABEL;
    error = $codReason;
  }

  function select() {
    Analytics.track('payment_method:select', {
      type: AnalyticsTypes.BEHAV,
      data: {
        method,
        ...getRTBAnalyticsPayload(),
      },
    });

    if (isMethodCOD) {
      Events.TrackBehav(HomeEvents.COD_METHOD_SELECTED);
    }
    $shouldOverrideVisibleState = false;

    if (method === 'emi' && isEmiV2()) {
      // Track EMI method clicked on L0 screen
      // passing whether the no cost label was shown or not
      emiMethodClicked(_showNoCostLabel);
    }

    dispatch('select');
  }

  function onClick() {
    if (uninteractive) {
      return;
    }
    select();
  }
  // disabled for phase 1 of Walnut369
  // let showWalnutBanner = false;
  // $: showWalnutBanner = instrument.showWalnutBanner;
  let walnutBannerText = '';
  $: walnutBannerText = formatMessageWithLocale(
    'cardless_emi.walnut_banner_text',
    $locale
  );
</script>

<SlottedOption
  className={`new-method has-tooltip ${
    $selectedInstrumentId === instrument.id && 'selected'
  } ${uninteractive ? 'uninteractive' : ''}`}
  defaultStyles={false}
  on:click={onClick}
  attributes={{ method, ...testid('click', 'method', method) }}
  flexGrow={codLoading}
  {disabled}
  withRow={method === 'upi' && upiTiles?.status}
>
  <i slot="icon" class:cod-icon={isMethodCOD}>
    {#if isMethodCOD}
      <CodIcon {disabled} />
    {:else}
      <Icon icon={_icon} />
    {/if}
  </i>
  <div slot="title" class:cod-error={disabled} class:title-one-cc={isOneCC}>
    {_title}
  </div>
  <div slot="label" class="no-cost-label">
    {#if _showNoCostLabel && isEmiV2()}
      <NoCostLabel text={NO_COST_EMI_AVAILABLE} expanded={false} />
    {/if}
  </div>
  <div slot="subtitle" class:subtitle-one-cc={isOneCC}>
    {#if method === 'upi' && upiTiles.status && upiTiles.variant === 'subText'}
      <!-- This component is built with "early return" concept and returns html upon conditions met -->
      <UPIAppStack onOtherClick={select} {method} variant={upiTiles.variant} />
    {:else}
      {@html _subtitle}
    {/if}
  </div>
  <div slot="error">
    {#if disabled}
      <div class="error">
        <div class="error-container">
          <span class="error-label">{$t(errorLabel)}</span>
          <!-- TODO: Fix the tooltip and add the error-icon again
            <div class="error-icon">
            <InfoIcon variant="red" />
            <Tooltip className="" bindTo="#form-common" align={['bottom']}>
              {error}
            </Tooltip>
          </div> -->
        </div>
      </div>
    {/if}
  </div>
  <div slot="extra">
    {#if codLoading}
      <div class="spinner cod-loader" />
    {/if}
  </div>
  <div slot="row">
    {#if method === 'upi' && upiTiles.status && upiTiles.variant === 'row'}
      <!-- This component has earli return and renders on demand -->
      <UPIAppStack onOtherClick={select} {method} variant={upiTiles.variant} />
    {/if}
  </div>
</SlottedOption>

<style lang="scss">
  /* Container styles */
  :global(.new-method) {
    padding: 16px;
  }

  :global(.redesign .new-method) {
    padding: 12px 16px;
  }
  /* Icon styles */
  i {
    display: flex;
    margin-right: 16px;
    width: 24px;
    min-width: 24px;
    text-align: center;
  }

  i :global(.gpay-icon) {
    margin-left: 0;
    flex: 1 1 0;
  }

  i :global(svg) {
    height: 24px;
    flex: 1 1 0;
    width: auto;
  }

  i.cod-icon :global(svg) {
    height: 28px;
    margin-top: 2px;
  }

  /* Content styles */
  div[slot='title'] {
    margin: 0;
    font-weight: 600;
    font-size: 1rem;
    line-height: 1.1rem;
    color: #4f4f4f;
    text-transform: none;
  }

  div[slot='subtitle'] {
    margin: 4px 0 0 0;
    line-height: 1rem;
    color: #828282;
  }

  .error {
    margin-top: 4px;
    color: #8d97a1cc !important;
    overflow: visible;
    font-size: 12px;
    line-height: 16px;
  }
  .error-container {
    display: flex;
    align-items: center;
  }
  .error-label {
    margin-right: 4px;
  }

  .cod-error {
    color: #263a4a99 !important;
  }

  .cod-loader {
    opacity: 1;
    height: 16px;
    width: 16px;
  }

  div[slot='title'].title-one-cc {
    font-weight: var(--font-weight-regular);
    color: var(--primary-text-color);
    font-size: var(--font-size-body);
  }

  div[slot='subtitle'].subtitle-one-cc {
    font-weight: var(--font-weight-regular);
    font-size: var(--font-size-small);
    color: var(--secondary-text-color);
    width: 101%; /** ios wrapping issue */

    &:empty {
      display: none;
    }
  }

  div[slot='label'].no-cost-label {
    margin: 0 8px;
  }
</style>
