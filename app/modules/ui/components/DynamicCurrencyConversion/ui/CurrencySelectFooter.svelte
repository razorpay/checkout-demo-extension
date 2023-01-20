<script lang="ts">
  // i18n
  import { t } from 'svelte-i18n';
  import { DCC_COMPLIANCE_FOOTER } from 'ui/labels/dcc';

  // constants
  import { RAZORPAY_WEBSITE_LINK } from '../constants';
</script>

<div class="currency-select-footer">
  {$t(DCC_COMPLIANCE_FOOTER)}
  <a
    href={RAZORPAY_WEBSITE_LINK}
    target="_blank"
    rel="noopener noreferrer nofollow">{RAZORPAY_WEBSITE_LINK}</a
  >
</div>

<style lang="scss">
  .currency-select-footer {
    padding: 0.875rem;
    text-align: left;
    color: var(--tertiary-text-color);
    font-size: 0.775rem;

    a {
      color: var(--primary-color);
    }
  }
</style>
