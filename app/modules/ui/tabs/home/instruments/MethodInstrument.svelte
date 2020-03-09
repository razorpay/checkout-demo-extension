<script>
  // UI imports
  import Field from 'ui/components/Field.svelte';
  import SlottedOption from 'ui/elements/options/Slotted/Option.svelte';
  import Icon from 'ui/elements/Icon.svelte';

  // Utils imports
  import { getSession } from 'sessionmanager';
  import Track from 'tracker';
  import { getMethodNameForPaymentOption } from 'checkoutframe/paymentmethods';

  // Props
  export let instrument = {};

  const session = getSession();

  const method = instrument.method;
  const methodName = getMethodNameForPaymentOption(method, { session });
  const title = `Pay using ${methodName}`;
  const name = Track.makeUid();
  const id = Track.makeUid();

  let icon;
  if (/card$/.test(method)) {
    icon = session.themeMeta.icons['card'];
  } else {
    icon = session.themeMeta.icons[method];
  }
</script>

<style>
  span {
    display: inline-block;
    transform: rotate(180deg);
  }
</style>

<SlottedOption
  {name}
  ellipsis
  value={id}
  radio={false}
  className="instrument"
  on:click>
  <i slot="icon">
    <Icon {icon} alt={methodName} />
  </i>
  <div slot="title">{title}</div>

  <div slot="extra">
    <span class="theme-highlight-color">&#xe604;</span>
  </div>
</SlottedOption>
