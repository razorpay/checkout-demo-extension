<script>
  // Svelte imports
  import { createEventDispatcher } from 'svelte';

  // Store imports
  import { locale } from 'svelte-i18n';

  // UI imports
  import Method from 'ui/tabs/home/Method.svelte';

  // Util imports
  import { getTranslatedMethodPrefix } from 'checkoutframe/paymentmethods';
  import { generateTextFromList } from 'i18n/text-utils';

  // i18n
  import { formatTemplateWithLocale } from 'i18n';
  import { SINGLE_BLOCK_TITLE } from 'ui/labels/methods';

  // Props
  export let block;

  const dispatch = createEventDispatcher();

  let title;
  $: title = getTitleFromInstruments(block.instruments, $locale);

  function getTitleFromInstruments(instruments, locale) {
    const methods = _Arr.map(instruments, instrument => instrument.method);

    const names = _Arr.map(methods, method =>
      getTranslatedMethodPrefix(method, locale)
    );

    let name;

    /**
     * For just one method, use SINGLE_BLOCK_TITLE
     * For more, use generateTextFromList
     */
    if (names.length === 1) {
      name = formatTemplateWithLocale(
        SINGLE_BLOCK_TITLE, // LABEL: Pay via {method}
        { method: names[0] },
        locale
      );
    } else {
      name = generateTextFromList(names, locale, 3);
    }

    return name;
  }
</script>

<div class="methods-block" data-block={block.code}>
  <h3 class="title">{title}</h3>
  <div role="list" class="border-list">
    {#each block.instruments as instrument, index (instrument.id)}
      <Method
        method={instrument.method}
        on:select={() => dispatch('selectInstrument', instrument)}
      />
    {/each}
  </div>
</div>

<style>
  .border-list {
    margin-bottom: 24px;
  }
</style>
