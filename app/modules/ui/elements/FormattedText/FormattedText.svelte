<script>
  import { tokenizeTextForFormatters } from './tokenizer';

  export let text = '';

  let textToken = [
    {
      text: text,
      type: 'plain',
    },
  ];

  const splitTextTokens = tokenizeTextForFormatters(textToken);
</script>

{#each splitTextTokens as token}
  {#if token.type === 'plain'}
    {token.text}
  {:else if token.type === 'bold'}
    <strong>{token.text}</strong>
  {:else if token.type === 'italic'}
    <i>{token.text}</i>
  {/if}
{/each}
