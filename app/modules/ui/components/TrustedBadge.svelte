<script>
  import { getMerchantId } from 'checkoutstore';
  import { getSession } from 'sessionmanager';

  import {
    TRUSTED_BADGE_CUSTOMER_LABEL,
    TRUSTED_BADGE_SELLER_LABEL,
  } from 'ui/labels/trusted-badge';

  import { t, locale } from 'svelte-i18n';
  import Icon from 'ui/elements/Icon.svelte';
  import trustedBadge from 'ui/constants/trusted-badge';

  const icons = getSession().themeMeta.icons;
</script>

<style>
</style>

<trusted-badge>
  <div class="trusted-badge-wrapper" />
  <!-- <i slot="icon">
		<Icon icon={icons.trusted_badge} />
	</i>
	<i slot="icon">
		<Icon icon={icons.tick_filled} />
	</i> -->
</trusted-badge>
