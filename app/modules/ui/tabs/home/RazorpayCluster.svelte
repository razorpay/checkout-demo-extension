<script>
  // Svelte imports
  import { createEventDispatcher } from 'svelte';

  // Store imports
  import { locale } from 'svelte-i18n';

  // UI imports
  import Method from 'ui/tabs/home/Method.svelte';

  // Util imports
  import { getTranslatedMethodPrefix } from 'checkoutframe/paymentmethods';
  import { generateTextFromList } from 'lib/utils';

  // Props
  export let block;

  const dispatch = createEventDispatcher();

  let title;
  $: $locale, (title = getTitleFromInstruments(block.instruments));

  function getTitleFromInstruments(instruments) {
    const methods = _Arr.map(instruments, (instrument) => instrument.method);

    const names = _Arr.map(methods, getTranslatedMethodPrefix);

    let name;

    /**
     * For just one method, use "Pay via {method}"
     * For more, use generateTextFromList
     */
    if (names.length === 1) {
      name = `Pay via ${names[0]}`;
    } else {
      name = generateTextFromList(names, 3);
    }

    return name;
  }

  function selectMethod(event) {
    dispatch('selectMethod', event.detail);
  }
</script>

<style>
  .border-list {
    margin-bottom: 24px;
  }
</style>

<div class="methods-block" data-block={block.code}>
  <h3 class="title">{title}</h3>
  <div role="list" class="border-list">
    {#each block.instruments as instrument, index (instrument.id)}
      <Method method={instrument.method} on:select={selectMethod} />
    {/each}
  </div>
</div>
