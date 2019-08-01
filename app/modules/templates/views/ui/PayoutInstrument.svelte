<RadioOption
  data="{account}"
  name="instrument"
  {reverse}
  {selected}
  value="{account.id}"
  {icon}

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
    reverse: true,
    icon: undefined
  })
}
</script>

<style>
:global(.instrument-info) {
  color: #999;
  font-size: 12px;
}
</style>
