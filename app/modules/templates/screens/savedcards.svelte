{#each cards as card}
  <SavedCard
    {card}
  />
{/each}

<script>
  import SavedCard from 'templates/views/savedcard.svelte';
  import * as Network from 'common/network';

  export default {
    components: {
      SavedCard,
    },

    computed: {
      cards: ({ amount, emi, emiOptions, recurring, tokens }) => {
        let {
          banks: allBanks,
          min: minimumAmount
        } = emiOptions;

        _Arr.loop(tokens, item => {
          const {
            card
          } = item;

          let {
            flows = [],
            issuer: bank,
            network
          } = card;

          let networkCode = Network.findCodeByNetworkName(network);

          if (networkCode === 'amex') {
            bank = 'AMEX';
            minimumAmount = emiOptions.amex_min;
          }

          card.networkCode = networkCode;

          item.plans = bank && emi && card.emi && amount > minimumAmount && allBanks[bank];
          item.cvvDigits = networkCode === 'amex' ? 4 : 3;
          item.debitPin = !recurring && Boolean(flows.pin);
        });

        return tokens;
      }
    }
  }
</script>
