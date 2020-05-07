<script>
  export let text = '';
  const formatters = [
    {
      flag: '**',
      type: 'bold',
    },
    {
      flag: '__',
      type: 'italic',
    },
  ];

  let tokenized = [
    {
      text: text,
      type: 'plain',
    },
  ];

  const tokenizeTextForFormatter = (tokenText, formatter) => {
    return tokenText.split(formatter.flag).map((text, i) => {
      return { text: text, type: i % 2 ? formatter.type : 'plain' };
    });
  };

  formatters.forEach(formatter => {
    tokenized = tokenized.reduce((pV, cV) => {
      if (cV.type === 'plain') {
        return [...pV, ...tokenizeTextForFormatter(cV.text, formatter)];
      }
      pV.push(cV);
      return pV;
    }, []);
  });
</script>

{#each tokenized as token}
  {#if token.type === 'plain'}
    {token.text}
  {:else if token.type === 'bold'}
    <strong>{token.text}</strong>
  {:else if token.type === 'italic'}
    <i>{token.text}</i>
  {/if}
{/each}
