<script>
  // Utils
  import { isContactReadOnly, isContactOptional } from 'checkoutstore';
  import { findCountryCode } from 'common/countrycodesutil';

  // UI imports
  import Field from 'ui/components/Field.svelte';

  import { CONTACT_PATTERN } from 'common/constants';

  // Props
  export let value;

  const isOptional = isContactOptional();
  const CONTACT_REGEX = isOptional ? '.*' : CONTACT_PATTERN;

  function appendCountryCodeAsynchronously() {
    setTimeout(() => {
      const internationalFormat = findCountryCode(value);

      if (internationalFormat.code) {
        value = `+${internationalFormat.code}${internationalFormat.phone}`;
      }
    });
  }

  const label = isOptional
    ? 'Phone with Country Code (Optional)'
    : 'Phone with Country Code';
</script>

<div>
  <Field
    id="contact"
    name="contact"
    type="tel"
    autocomplete="tel"
    on:autocomplete={appendCountryCodeAsynchronously}
    on:paste={appendCountryCodeAsynchronously}
    on:blur={appendCountryCodeAsynchronously}
    required={!isOptional}
    xautocompletetype="phone-full"
    pattern={CONTACT_REGEX}
    readonly={isContactReadOnly()}
    formatter={{ type: 'phone' }}
    {label}
    icon="&#xe607;"
    on:input={e => (value = e.target.value)}
    on:blur
    {value}
    helpText="Please enter a valid contact number" />
</div>
