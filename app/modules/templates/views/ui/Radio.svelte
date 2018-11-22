<div class={containerClass}>
  <input
    type="radio"
    {checked}
    class={inputClass}
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
        containerClass: '',
        id: '',
        inputClass: '',
        name: '',
        value: '',
      };
    },

    computed: {
      containerClass: ({ containerClass }) => `input-radio ${containerClass}`,
      inputClass: ({ inputClass }) => ``
    }
  }
</script>
