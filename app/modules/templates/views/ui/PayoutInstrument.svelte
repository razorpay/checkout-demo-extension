<RadioOption
  data="{account}"
  name="instrument"
  {reverse}
  {selected}
  value="account.id"

  on:select="fire('select', account)">
  <slot></slot>
</RadioOption>

<script>
export default {
  components: {
    RadioOption: 'templates/views/ui/options/RadioOption.svelte',
  },

  data: () => ({
    selected: false,
    reverse: true
  })
}
</script>

<style>
:global(.instrument-info) {
  color: #999;
  font-size: 12px;
}
</style>
