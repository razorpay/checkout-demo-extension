<script lang="ts">
  import { Events } from 'analytics';
  import CTAStore from './store';
  import CTAEvents from 'cta/analytics';
  import { getCurrentScreen } from 'one_click_checkout/analytics/helpers';
  import { getSession } from 'sessionmanager';
  import { showSummaryModal } from 'summary_modal';
  import { PAY_NOW_CTA_LABEL } from './i18n';

  // Fake CTA
  export let screen = 'default';
  export let tab = 'tab';
  export let disabled = false;
  export let show = true;
  export let label = PAY_NOW_CTA_LABEL;
  export let labelData = {};
  export let showAmount = true;
  export let variant: 'disabled' | '' = '';

  function defaultCTAAction(e?: Event) {
    const session = getSession();
    session.preSubmit(e);
  }

  function defaultOnViewDetailsClick() {
    (Events as any).TrackBehav(CTAEvents.VIEW_DETAILS_CLICKED, {
      screen_name: getCurrentScreen(),
    });
    showSummaryModal({ withCta: false } as any);
  }

  export let onSubmit: (...args: any) => void = defaultCTAAction;
  export let onViewDetailsClick: () => void = defaultOnViewDetailsClick;

  $: key = `${screen}:${tab}`;

  $: {
    CTAStore.setState(
      {
        disabled,
        show,
        showAmount,
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
