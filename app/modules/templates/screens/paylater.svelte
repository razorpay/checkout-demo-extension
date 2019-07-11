<Tab method="paylater">
  <input type="hidden" name="provider">
  <input type="hidden" name="ott">
  <h3>Select an Option</h3>
  <div class="options">
    {#each providers as provider}
      <NextOption
        classes={[ provider.data.code ]}
        {...provider}

        on:select="select(event)"
      >
        {provider.title}
      </NextOption>
    {/each}
  </div>
</Tab>

<script>
  export default {
    components: {
      Tab: 'templates/tabs/Tab.svelte',
      NextOption: 'templates/views/ui/options/NextOption.svelte',
    },

    methods: {
      select: function (event) {
        const {
          on = {}
        } = this.get();

        const {
          select = _Func.noop
        } = on;

        select(event);
      },
    }
  }
</script>
