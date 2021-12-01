#### `razorpay` module

* `razorpay` module which accepts razorpay instance while initialization of checkout from `checkoutframe` 
* This module ideally should not import other modules (to prevent circular dependency) but if required then only import module from unit module (i.e. other modules should be like library)

## API exposed from `razorpay`

### `RazorpayStore methods`
```ts
// by default we export store
import RazorpayStore from 'razorpay';

// update instance to store
RazorpayStore.updateInstance(rzpInstance)
```

> There are other methods by `RazorpayStore` but i don't suggest to consume directly as helper method already expose all API required for development

### `helper methods`


* getPreferences
```ts
import { getPreferences } from 'razorpay'

getPreferences(path?: string): any
// usage

getPreferences() // returns all preference response

getPreferences('order') // return preference.order if not exist then returns undefined

// can fetch nth level preference data directly no need for optional chaining
getPreferences('mypath.childpath.anotherchildpath') // returns preference.mypath.childpath.anotherchildpath
```


* getPreferences
```ts
import { getPreferences } from 'razorpay'

getPreferences(path?: string): any
// usage

getPreferences() // returns all preference response

getPreferences('order') // return preference.order if not exist then returns undefined

// can fetch nth level preference data directly no need for optional chaining
getPreferences('mypath.childpath.anotherchildpath') // returns preference.mypath.childpath.anotherchildpath
```

* getOption
```ts
import { getOption } from 'razorpay'

/**
 * getOption return the options of checkout
 */ 
getOption(path?: string, needFunction?: boolean): any | ()=> any
// usage

getOption() // returns all options

getOption('prefill.name') // return option.prefill.name if not exist then returns undefined

// get function which returns particular option
const getOrderId = getOption('order_id', true);
getOrderId() // returns option.order_id
```

* getMerchantOption
```ts
import { getMerchantOption } from 'razorpay'

/**
 * getMerchantOption returns options that actually passed by merchant
 */ 
getMerchantOption(path?: string): any
// usage

getMerchantOption() // returns all options

getMerchantOption('order_id')
```

> `getMerchantOption` is different from `getOption` as `getMerchantOption` only return options that is passed by merchant whereas `getOption` can return default value defined by checkout(`RazorpayDefaults`) like `retry` is consider as `true` by default, `getMerchantOption` will return `undefined` if not passed and `getOption` will return `true`


* setOption

```ts
import { setOption } from 'razorpay'

setOption(key: string, value: any): void

// usage
setOption('remember_customer', false) 
```

* getCardFeatures
```ts
import { getCardFeatures } from 'razorpay'

getCardFeatures(iin: string): Promise<CardFeatures>
```

#### `Other helper methods`
There are other helper methods which is written in razorpay like

* isIRCTC
* getPayoutContact
* getMerchantMethods
* getMerchantOrder
* getOrderMethod
* getMerchantOrderAmount
* getMerchantOrderDueAmount
* getMerchantKey
* isGlobalVault
* isPartialPayment
* hasFeature

...etc

You can check full list at `app/modules/razorpay/helper.js`


## TODO 

As `Other helper methods` are methods which basically consume main helper method like getPreferences, getOption to generate output. 

So basically we want to move all `other helper methods` outside of razorpay module and move to individual module helpers if required or one can directly import main helper method and directly consume that like

```ts
import { getPreferences, getPayoutContact } from 'razorpay'
...
/**
 * As both return same data in single line 
 * According to requirement you don't always required to create helper method you can directly consume it
 */ 
const contact = getPreferences('contact');
const sameContact = getPayoutContact();
...

```

If we need methods that is require by multiple modules(card, upi, emi etc)
So i suggest them to move to `common/helper`