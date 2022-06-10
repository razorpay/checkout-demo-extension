<script lang="ts">
  import { t, locale } from 'svelte-i18n';
  import { getUpiIntentAppName } from 'i18n';
  import ListHeader from 'ui/elements/ListHeader.svelte';
  import Icon from 'ui/elements/Icon.svelte';
  import { getMiscIcon } from 'checkoutframe/icons';
  import {
    UPI_REDIRECT_TO_APP,
    UPI_REDIRECT_TO_APP_V2,
    UPI_UX_FAILED_APP_CALLOUT,
  } from 'ui/labels/upi';
  import { formatTemplateWithLocale } from 'i18n';
  import FormattedText from 'ui/elements/FormattedText/FormattedText.svelte';
  import { getLastUpiUxErroredPaymentApp } from 'upi/helper/upiUx';
  import { upiUxV1dot1 } from 'upi/experiments';

  export let visible = false;
  export let showRedirectV2message = false;
  let { app_name, name, shortcode } = {} as UPI.AppConfiguration;

  $: {
    /**
     * @TODO UPIUX1.1
     * remove experimentation
     * Note: Only code inside if is required once we remove the experiment.
     */
    if (upiUxV1dot1.enabled()) {
      ({ app_name, name, shortcode } =
        getLastUpiUxErroredPaymentApp('automatic'));
    }
  }
</script>

{#if visible}
  <ListHeader warningMode={!!shortcode}>
    <i slot="icon">
      <Icon icon={getMiscIcon(shortcode ? 'warningTriangle' : 'redirect')} />
    </i>
    <!-- LABEL: You will be redirected to your UPI app/Payment failed with <selected UPI app>. Please retry payment with a different UPI app -->
    <div slot="subtitle">
      <FormattedText
        text={shortcode
          ? formatTemplateWithLocale(
              UPI_UX_FAILED_APP_CALLOUT,
              {
                appName: getUpiIntentAppName(
                  shortcode,
                  $locale,
                  app_name || name
                ),
              },
              $locale
            )
          : $t(
              showRedirectV2message
                ? UPI_REDIRECT_TO_APP_V2
                : UPI_REDIRECT_TO_APP
            )}
      />
    </div>
  </ListHeader>
{/if}
