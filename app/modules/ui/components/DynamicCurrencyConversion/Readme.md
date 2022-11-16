## DynamicCurrencyConversion (DCC)

```ts
import { DynamicCurrencyConversion } from 'ui/components/DynamicCurrencyConversion';
```

### Props
| Prop | Description | Default |  |
|---|---|---|---|
| className: string | Customize styles for component by adding class on root element default to blank string | "" | optional |
| method: string | To improve DCC analytics tracking, add the payment method | "" | optional |
| retryOnFail: boolean | Prop to retry the /flows api one more time if it failed | false | optional |
| selectedCurrency: string | Prop to show selected currency on the UI and also to make controlled component | "" | optional |
| dccEnabled: boolean | Indicate wether dcc is enabled or not for a payment method. If false component will not render | false | optional |
| amount: number | Pass original checkout amount to dcc component. |  | required |
| originalCurrency: string | Along with amount pass original checkout currency to dcc component |  | required |
| entity: string | A payment instrument. Derived from payment method. e.g card number(424242), card tokenId(token_ral23), wallet code(paypal) and provider(trustly, poli) |  | required |
| identifier: string | Identifier for payment method instrument, e.g ‘iin’ \| ‘tokenId’ \| ‘walletCode’ \| ‘provider’, which can be sent to /flows api |  | required |

### Events
| Name | Description | Data |
|---|---|---|
| on:currencyMetaLoading | Loading event triggered before calling /flows api, if the response is already cached then this event will not be fired | { isLoading: boolean } |
| on:currencyMetaLoaded | Triggered after /flows api response successfully, if the response is already cached then this event will not be fired | {     all_currencies?: CurrenciesMapType;     card_currency?: string;     wallet_currency?: string;     app_currency?: string;     error?: string;     show_markup?: boolean;     currency_request_id: string;     avs_required: boolean;     currency: string;     currencies: [];     selectedCurrency?: string;     originalCurrency: string; } |
| on:currencyMetaFailed | Triggered when /flows api failed to respond, if the response is already cached then this event will not be fired | { isError: boolean } |
| on:selectedCurrencyChange | An event emitted when selectedCurrency is changed on UI. Also can be combined with selectedCurrency prop to make it controlled component | { selectedCurrency: string, amount: number } |

### Usage
```html
<script lang="ts">
  import { DynamicCurrencyConversion } from 'ui/components/DynamicCurrencyConversion';
</script>

<DynamicCurrencyConversion
  amount={100}
  entity="424242424242"
  identifier="iin"
  originalCurrency="INR"
/>
```

### Example

#### Paypal Integration
```html
<script lang="ts">
  import { getCurrency, getAmount } from "razorpay";
  // DCC component
  import { DynamicCurrencyConversion, getEntityFromInstrument } from 'ui/components/DynamicCurrencyConversion';
  // variables
  let selectedCurrency = '';
  let isCTADisabled = false;
  $: dccEntity = getEntityFromInstrument({ instrument: 'paypal', identifier: 'walletCode' });
  $: dccEnabled = dccEntity.dccEnabled;
  // DCC events
  const onSelectedCurrencyChange = (evt: CustomEvent<{ selectedCurrency: string, amount: number }>) => {
    selectedCurrency = evt.detail.selectedCurrency;
    const dccAmount = evt.detail.amount;
  };
  const onCurrencyMetaLoading = () => {
    isCTADisabled = true;
  };
  const onCurrencyMetaLoaded = (evt) => {
    // console.log(evt);
    isCTADisabled = false;
  };
  const onCurrencyMetaFailed = () => {
    isCTADisabled = false;
  }
</script>

{#if dccEnabled}
<DynamicCurrencyConversion
  amount={getAmount()}
  entity={dccEntity.entity}
  originalCurrency={getCurrency()}
  identifier={dccEntity.identifier}
  selectedCurrency={selectedCurrency}
  on:selectedCurrencyChange={onSelectedCurrencyChange}
  on:currencyMetaLoading={onCurrencyMetaLoading}
  on:currencyMetaLoaded={onCurrencyMetaLoaded}
  on:currencyMetaFailed={onCurrencyMetaFailed}
/>
{/if}

<CTA disabled={isCTADisabled} label="Pay Now">
```


#### Card Integration
```html
<script lang="ts">
  import { getCurrency, getAmount } from "razorpay";
  // DCC component
  import { DynamicCurrencyConversion, getEntityFromCardInstrument } from 'ui/components/DynamicCurrencyConversion';
  // variables
  let selectedCurrency = '';
  const amount = getAmount();
  const originalCurrency = getCurrency();
  $: dccEntity = getEntityFromCardInstrument({
    view: 'ADD_CARD',
    cardNumber: $cardNumber,
    selectedCard: $selectedCard,
    selectedInstrument: $selectedInstrument
  });
  $: dccEnabled = dccEntity.dccEnabled;
  // DCC events
  const onSelectedCurrencyChange = (evt) => {
    selectedCurrency = evt.detail.selectedCurrency;
    const dccAmount = evt.detail.amount;
  };
  const onCurrencyMetaLoaded = (evt) => {
    // console.log(evt);
    isCTADisabled = false;
  };
</script>

{#if dccEnabled}
<DynamicCurrencyConversion
  {amount}
  {originalCurrency}
  {selectedCurrency}
  entity={dccEntity.entity}
  identifier={dccEntity.identifier}
  on:selectedCurrencyChange={onSelectedCurrencyChange}
  on:currencyMetaLoaded={onCurrencyMetaLoaded}
/>
{/if}
```

### Public Helper Functions

#### getEntityFromInstrument

This helper function will create DCC entity for particular instrument

```ts
import { getEntityFromInstrument } from 'ui/components/DynamicCurrencyConversion';

// usage for paypal or other payment method
let dccEntity = getEntityFromInstrument({ instrument: 'paypal', identifier: 'walletCode' })

console.log(dccEntity)
// { entity: 'paypal', identifier: 'walletCode', dccEnabled: true };
```

#### getEntityFromCardInstrument

This helper function will create DCC entity for card payment method

```ts
import { getEntityFromInstrument } from 'ui/components/DynamicCurrencyConversion';

// usage for paypal or other payment method
let dccEntity = getEntityFromCardInstrument({
  view: 'ADD_CARD',
  cardNumber: $cardNumber,
  selectedCard: $selectedCard,
  selectedInstrument: $selectedInstrument
})

console.log(dccEntity);
// { entity: '424242', identifier: 'iin', dccEnabled: true }
```

#### getDCCPayloadForRequest

This helper function will return the DCC payload for particular payment method

```ts
import { getDCCPayloadForRequest } from 'ui/components/DynamicCurrencyConversion';

let dccPayload: DCC.PayloadStore | null = getDCCPayloadForRequest('card');

console.log(dccPayload);
/**
  {
    enable?: boolean;
    method?: Props['method'];
    selectedCurrency?: Currency;
    all_currencies?: CurrenciesMapType;
    card_currency?: string;
    wallet_currency?: string;
    app_currency?: string;
    error?: string;
    originalCurrency?: Currency;
    defaultCurrency?: Currency;
    currencies?: CurrencyListType;
    show_markup?: boolean;
    currency_request_id?: string;
    avs_required?: boolean;
  }
  */
```

#### addDCCPayloadOnRequest

Helper function to modify ajax/create payment request data with DCC payload only if DCC is applied to payment method, else it will remove DCC parameters from payment payload.

```ts
import { getDCCPayloadForRequest } from 'ui/components/DynamicCurrencyConversion';

let paymentPayload = { method: 'card', card: '4242424242424242' };

addDCCPayloadOnRequest(paymentPayload);

console.log(paymentPayload);
/*
{
  currency_request_id: 'adf',
  dcc_currency: 'USD',
  default_dcc_currency: 'USD',
  method: 'card',
  card: '4242424242424242'
}
*/
```

#### getDCCAmountIfApplied

Helper function to get DCC amount if DCC is applied to payment method. This function will return the amount of selected DCC currency else null.

```ts
import { getDCCAmountIfApplied } from 'ui/components/DynamicCurrencyConversion';

const dccAmount: number | null = getDCCAmountIfApplied();
```
