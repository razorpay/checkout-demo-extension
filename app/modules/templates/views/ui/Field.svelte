<div ref:wrap class="elem">
  <input
    class='input'
    ref:input
    id={identifier}
    {type}
    {name}
    {value}
    {required}
    {autocomplete}
    {placeholder}
    {pattern}
    use:formatter="formatter"
    on:focus="fire('focus', event)"
    on:blur="fire('blur', event)"

    class:no-refresh="!refresh"
  />
  {#if helpText}
    <div class="help">{helpText}</div>
  {/if}
</div>

<style>
  ref:wrap {
    padding: 4px 0;
    input {
      opacity: 1;
      width: 100%;
    }
  }
</style>

<script>
  import { getSession } from 'sessionmanager';
  import Track from 'tracker.js';

  export default {
    data() {
      return {
        id:'',
        type: 'text',
        value: null,
        invalid: false,
        focused: false,
        required: false,
        refresh: true,
        formatter: null,
        helpText: '',
        placeholder: '',
        pattern: '.*',
        autocomplete: 'off',
      };
    },

    onupdate({ changed, current }) {
      if (changed.maxlength) {
        const { maxlength } = current;
        this.setMaxLength(maxlength);
      }
    },

    actions: {
      formatter(node, data) {
        const session = getSession();

        if (!(session && session.delegator && data)) {
          return;
        }

        const delegator = session.delegator;
        const formatterObj = delegator.add(data.type, node);

        _Obj.loop(data.on, (callback, event) => {
          formatterObj.on(event, callback);
        });
      },
    },

    computed: {
      identifier: ({ id }) => (id ? id : `id_${Track.makeUid()}`),
    },

    methods: {
      /* focus trigger for the input field */
      focus() {
        this.refs.input.focus();
      },

      /* blur trigger for the input field */
      blur() {
        this.refs.input.blur();
      },

      getValue() {
        return this.refs.input.value;
      },

      setMaxLength(length) {
        const { input } = this.refs;

        if (length) {
          input.maxLength = length
        }
      }
    },
  };
</script>
