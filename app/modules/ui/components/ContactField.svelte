<script>
  // Utils
  import { isContactReadOnly, isContactOptional } from 'checkoutstore';
  import { findCountryCode } from 'common/countrycodesutil';

  // UI imports
  import Field from 'ui/components/Field.svelte';

  import { CONTACT_PATTERN } from 'common/constants';

  // i18n
  import {
    CONTACT_LABEL_REQUIRED,
    CONTACT_LABEL_OPTIONAL,
    CONTACT_HELP_TEXT,
  } from 'ui/labels/home';

  import { t } from 'svelte-i18n';

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

  // LABEL: Phone with Country Code (Optional) / Phone with Country Code
  const label = isOptional ? CONTACT_LABEL_OPTIONAL : CONTACT_LABEL_REQUIRED;
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
    label={$t(label)}
    icon="&#xe607;"
    on:input={e => (value = e.target.value)}
    on:blur
    {value}
    helpText={$t(CONTACT_HELP_TEXT)} />
  <!-- LABEL: Please enter a valid contact number -->
</div>
