<script>
  import { tokenizeTextForFormatters } from './tokenizer';

  export let text = '';
  const splitTextTokens = tokenizeTextForFormatters(text);
</script>

{#each splitTextTokens as token}
  {#if token.type === 'plain'}
    {token.text}
  {:else if token.type === 'strong'}
    <strong>{token.text}</strong>
  {:else if token.type === 'italic'}
    <i>{token.text}</i>
  {:else if token.type === 'bold'}
    <b>{token.text}</b>
  {:else if token.type === 'emphasis'}<em>{token.text}</em>{/if}
{/each}
