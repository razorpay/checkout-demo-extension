<div class="legend left" style="margin-top: 18px">
  Enter your UPI ID
</div>
<Card selected={true} on:click="handleCardClick(event)">
    <div id='vpa-wrap' class={appId}>
    <!-- TODO: use formatter for validation once all fields
      are moved to `Field` -->
    <Field
      type="text"
      name="vpa"
      id="vpa"
      ref:vpaField
      placeholder={selectedApp ? "" : "Enter your UPI Address"}
      helpText="Please enter a valid VPA of the form username@bank"
      value={selectedApp === null ? vpa : ''}
      pattern={pattern}
      required={true}
      formatter={{
        type: 'vpa'
      }}
      on:blur
    />
    {#if pspHandle}
      <div ref:pspName>@{pspHandle}</div>
    {/if}
  </div>
</Card>

<style>

ref:pspName {
  color: #424242;
  position: absolute;
  top: 12px;
  right: 12px;
  line-height: 40px;
  z-index: 1;
}

</style>

<script>

import { VPA_REGEX } from 'common/constants.js';

function isVpaValid(vpa) {
  return VPA_REGEX.test(vpa);
}

const PATTERN_WITH_HANDLE = '.+@.+';
const PATTERN_WITHOUT_HANDLE = '.+';

export default {
  components: {
    Field: 'templates/views/ui/Field.svelte',
    Card: 'templates/views/ui/Card.svelte',
  },

  data() {
    return {
      focusOnCreate: false
    }
  },

  oncreate() {
    const { focusOnCreate } = this.get();
    if (focusOnCreate) {
      this.focus();
    }
  },

  methods: {
    handleCardClick(event) {
      const target = event && event.target;
      const { googlePayPspHandle } = this.refs;

      // Don't focus on VPA input if the dropdown elem was clicked.
      if (target === googlePayPspHandle) {
        return;
      }

      this.refs.vpaField.focus();
    },
    getVpa() {
      const { pspHandle } = this.get();
      const vpa = this.refs.vpaField.getValue();
      if (isVpaValid(vpa)) {
        return vpa;
      }
      return `${this.refs.vpaField.getValue()}@${pspHandle}`;
    },
    blur() {
      this.refs.vpaField.blur();
    },
    focus() {
      this.refs.vpaField.focus();
    }
  },

  computed: {
    pattern: ({ appId }) => appId ? PATTERN_WITHOUT_HANDLE : PATTERN_WITH_HANDLE
  }

}

</script>

