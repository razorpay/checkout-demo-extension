<script lang="ts">
  import { Events } from 'analytics';
  import CTAStore, { CTAState } from './store';
  import CTAEvents from 'cta/analytics';
  import { getCurrentScreen } from 'one_click_checkout/analytics/helpers';
  import { getSession } from 'sessionmanager';
  import { showSummaryModal } from 'summary_modal';
  import { PAY_NOW_CTA_LABEL } from './i18n';

  // Fake CTA
  export let screen: string | string[] = 'default';
  export let tab: string | string[] = 'tab';
  export let disabled = false;
  export let show = true;
  export let label = PAY_NOW_CTA_LABEL;
  export let labelData = {};
  export let showAmount = true;
  export let showAmountVariant: CTAState['showAmountVariant'] = '';
  export let variant: 'disabled' | '' = '';

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
        disabled,
        show,
        showAmount,
        showAmountVariant,
        label: label || PAY_NOW_CTA_LABEL,
        variant,
        onSubmit: onSubmit || defaultCTAAction,
        onViewDetailsClick: onViewDetailsClick || defaultOnViewDetailsClick,
        labelData,
      },
      key
    );
  }
</script>
