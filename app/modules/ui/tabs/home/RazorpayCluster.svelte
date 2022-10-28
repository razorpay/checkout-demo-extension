<script lang="ts">
  // Svelte imports
  import { createEventDispatcher, onMount } from 'svelte';

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

  // Analytics imports
  import { genericMethodShown } from 'home/analytics/helpers';

  // helpers
  import { getSectionCategoryForBlock, setDynamicFees } from './helpers';

  // Props
  export let block;

  onMount(() => {
    block.instruments?.forEach((item) => {
      genericMethodShown(item?.method as string);
    });
  });

  const dispatch = createEventDispatcher();

  let title;
  $: title = getTitleFromInstruments(block.instruments, $locale);

  function getTitleFromInstruments(instruments, locale) {
    const methods = instruments.map((instrument) => instrument.method);

    const blockNames = methods.map((method) =>
      getTranslatedMethodPrefix(method, locale)
    );

    const names = blockNames.filter(
      (name, index) => blockNames.indexOf(name) === index
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
        {instrument}
        on:select={() => {
          setDynamicFees(instrument, 'rzpCluster');
          instrument.section = getSectionCategoryForBlock(block);
          instrument.blockTitle = title;
          dispatch('selectInstrument', instrument);
        }}
      />
    {/each}
  </div>
</div>

<style>
  .border-list {
    margin-bottom: 24px;
  }
</style>
