## SavedCard

```html
<script>
  import { BillingAddressVerificationForm } from 'ui/components/BillingAddressVerificationForm';
</script>
```

### inputProps

| Props   | Description                       |
| ------- | --------------------------------- |
| formType  | Form Type one of `AVS`, `N_AVS` |
| value  | Form value `{}` or for AVS: `{ line1: "", line2: "", city: "", postal_code: "", country: "", state: "" }` and for N_AVS: `{ first_name: "", last_name: "" line1: "", line2: "", city: "", postal_code: "", country: "", state: "" }` all fields are optional |
| filterCountries  | A function to filter out countries to be shown in countries dropdown     |
| filterStates  | A function to filter out states to be shown in states dropdown     |

### Actions

| Props    | Description                                                   |
| -------- | ------------------------------------------------------------- |
| on:submit | trigger when form is submitted and all form values are valid `CustomEvent<FormFields>`       |
| on:input | trigger when form input value is changed `CustomEvent<FormFields>`       |
| on:blur | trigger when form input is blurred `CustomEvent<FormFields>`       |

```html
<script>
    import { BillingAddressVerificationForm, FORM_TYPE } from 'ui/components/BillingAddressVerificationForm';

    let formValues = {}

    const handleFormSubmit = (evt) => {
      formValues = evt.details;
    }
</script>

<BillingAddressVerificationForm
    formType={FORM_TYPE.N_AVS}
    value={formValues}
    on:submit={handleFormSubmit}
/>
```

### Pre-filled some of or all form values
```html
<script>
    import { BillingAddressVerificationForm, FORM_TYPE } from 'ui/components/BillingAddressVerificationForm';

    let formValues = {
      first_name: "John",
      last_name: "Doe",
      line1: "line 1 value",
      line2: "line 2 value",
      postal_code: "123456",
      city: "New York",
      country: "US",
    }

    const handleFormSubmit = (evt) => {
      formValues = evt.details;
    }
</script>

<BillingAddressVerificationForm
    formType={FORM_TYPE.N_AVS}
    value={formValues}
    on:submit={handleFormSubmit}
/>
```
