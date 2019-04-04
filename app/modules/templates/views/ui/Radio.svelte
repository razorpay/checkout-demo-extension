<div class={classes}>
  <input
    type="radio"
    id={identifier}
    {checked}
    {name}
    {value}

    on:change="fire('change', event)"
  >
  <label for={identifier}>
    <div class="radio-display"></div>
    <div class="label-content">{@html label}</div>
  </label>
</div>

<script>
  import Track from 'tracker.js';

  export default {
    data: function() {
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
      identifier: ({ id }) => (id ? id : `id_${Track.makeUid()}`),
      classes: ({ classes }) => `input-radio ${classes}`,
    },
  };
</script>
