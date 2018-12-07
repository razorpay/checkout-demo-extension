<div class={classes}>
  <input
    type="radio"
    {checked}
    {id}
    {name}
    {value}

    on:change="fire('change', event)"
  >
  <label for={id}>
    <div class="radio-display"></div>
    <div class="label-content">{@html label}</div>
  </label>
</div>

<script>
  export default {
    data: function () {
      return {
        checked: false,
        classes: '',
        id: '',
        name: '',
        value: '',
        label: '',
      };
    },

    computed: {
      classes: ({ classes }) => `input-radio ${classes}`,
    }
  }
</script>
