<div class="option-icon">
  <Icon icon={icon} {placeholder} />
</div>

<script>
  export default {
    data() {
      return {
        placeholder: ''
      }
    },

    components: {
      Icon: 'templates/views/ui/Icon.svelte'
    },
  }
</script>