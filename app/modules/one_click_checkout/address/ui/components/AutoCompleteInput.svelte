<script>
  // svelte imports
  import { createEventDispatcher } from 'svelte';

  // UI Imports
  import WrappedInput from 'one_click_checkout/common/ui/WrappedInput.svelte';

  // Utils imports
  import { debounce } from 'lib/utils';

  export let id;
  export let value;
  export let label;
  export let required;
  export let validationText;
  export let suggestionsResource;
  export let autofocus;

  export let handleValidation;

  let suggestions = [];
  const dispatch = createEventDispatcher();

  const debouncedFetch = debounce(() => {
    suggestionsResource(value).then((result) => (suggestions = result));
  }, 250);

  function fetchSuggestions() {
    debouncedFetch();
  }

  function onInput({ detail: e }) {
    dispatch('input', e);
    if (e.target.textContent.length > 3) {
      fetchSuggestions();
    } else {
      suggestions = [];
    }
  }

  function onSuggestionSelect(e) {
    suggestions = [];
    const { line1 } = e.detail;

    dispatch('input', {
      target: {
        textContent: line1,
      },
    });
    dispatch('select', { index: e.detail.index });
    handleValidation(id);
  }
</script>

<WrappedInput
  {id}
  {label}
  {value}
  {required}
  {validationText}
  on:input={onInput}
  on:blur
  {suggestions}
  on:suggestion-select={onSuggestionSelect}
  {autofocus}
/>
