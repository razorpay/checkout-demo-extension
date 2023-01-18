<script lang="ts">
  import { Events } from 'analytics';
  import { shake as shakeForm } from 'checkoutframe/form';
  import CTAStore from './store';
  import CTAEvents from 'cta/analytics';
  import { getCurrentScreen } from 'one_click_checkout/analytics/helpers';
  import { getSession } from 'sessionmanager';
  import { showSummaryModal } from 'summary_modal';
  import { PAY_NOW_CTA_LABEL } from './i18n';
  import type { CTAVariant } from './types';

  // Fake CTA
  export let screen: string | string[] = 'default';
  export let tab: string | string[] = 'tab';
  export let disabled = false;
  export let show = true;
  export let label = PAY_NOW_CTA_LABEL;
  export let labelData = {};
  export let showAmount = true;
  export let handleDisableState = true;
  export let variant: CTAVariant = '';

  export let isCTAClickInvalid = false;

  $: {
    if (!disabled) {
      isCTAClickInvalid = false;
    }
  }

  function defaultCTAAction(e?: Event) {
    const session = getSession();
    session.preSubmit(e);
  }

  function defaultOnViewDetailsClick() {
    (Events as any).TrackBehav(CTAEvents.VIEW_DETAILS_CLICKED, {
      screen_name: getCurrentScreen(),
    });
    showSummaryModal({ withCta: false });
  }

  export let onSubmit: (...args: any) => void = defaultCTAAction;
  export let onViewDetailsClick: () => void = defaultOnViewDetailsClick;

  function handleSubmit(...args: any) {
    if (handleDisableState && disabled) {
      isCTAClickInvalid = true;
      shakeForm('#redesign-v15-cta', 'x-shake');
      return;
    }
    isCTAClickInvalid = false;
    const submitAction = onSubmit || defaultCTAAction;
    submitAction(...args);
  }

  let key: string[] = [];
  $: {
    let tempScreen = !Array.isArray(screen) ? [screen] : screen;
    let tempTab = !Array.isArray(tab) ? [tab] : tab;
    key = [];
    tempScreen.forEach((screenName) => {
      tempTab.forEach((tabName) => {
        key.push(`${screenName}:${tabName}`);
      });
    });
  }

  $: {
    CTAStore.setState(
      {
        disabled: handleDisableState ? false : disabled,
        show,
        showAmount,
        label: label || PAY_NOW_CTA_LABEL,
        variant,
        onSubmit: handleSubmit,
        onViewDetailsClick: onViewDetailsClick || defaultOnViewDetailsClick,
        labelData,
      },
      key
    );
  }
</script>
