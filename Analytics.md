# How to use the Analytics module

```js
import Analytics from 'analytics';
import * as AnalyticsTypes from 'analytics-types';
```

---

## Analytics (`analytics.js`)

There are two parts to the Analytics module: Meta, and Events.

### Meta

These are meta-properties that need to be sent with each event. Because meta-properties are so many in number, you don't want to pass all of them to the method that sends an event (`Analytics.track`).

Examples of meta properties:

- What screen the user is on.
- Has a payment attempted and failed.
- How much time has passed since Checkout was rendered.
- How much time has passed since the screen was changed.
- Is the user logged in while performing this action.

We have a single `META` object which stores all the meta properties, meaning all the meta-properties are global.

META is a flattened object, meaning keys will always need to be a string. For example,

```js
const foo = {
  bar: 'baz',
};
```

will need to be set as using

```js
Analytics.setMeta('foo.bar', 'baz');
```

and removed using

```js
Analytics.removeMeta('foo.bar');
```

### API for Meta

#### `Analytics.setMeta(key, val)`

This method sets a meta property. This meta property will be applicable to all the events fired AFTER this property has been added.

#### `Analytics.removeMeta(key)`

This method removes a meta property.

#### `Analytics.getMeta()`

Returns the unflattened META object.

### Events

Events are, well, _events_. Events have a name, an optional type, and some optional data.

#### `Analytics.track(name, { type, data }, r, immediate)`

- `name` (String) Name of the event
- (Object)
  - `type` (String) Type of event [Optional]
  - `data` (Object) Data of the event [Optional]
- `r` (Razorpay) [Optional]
- `immediate` (Boolean) Send the event immediately (don't add it to the queue/batch) [Optional]

If a `type` is provided, the event's name will be transformed to `${type}:${name}`. If it is omitted, the name will just be `${name}`.

If `r` is not provided, the Razorpay instance set by `Analytics.setR` (see below) will be used.

If `immediate` is `false` or not provided, the event will be added to the queue/batch.

### `Analytics.setR(razorpayInstance)`

Set the default Razorpay instance to be used by all events. We are setting this with a different method invocation because we don't want to pass the Razorpay instance every time we invoke `Analytics.track`.

---

## AnalyticsTypes (`analytics-types.js`)

There are different types of Analytics events that are tracked.

- `AnalyticsTypes.RENDER` - Used when the event is fired as a result of something being rendered or shown on the screen.
- `AnalyticsTypes.BEHAV` - Used when the event is fired as a result of a user action.

| Type                  | Actual String |
| --------------------- | ------------- |
| AnalyticsTypes.RENDER | 'render'      |
| AnalyticsTypes.BEHAV  | 'behav'       |

---

# Naming convention for events

It is recommended that events have a type, because it adds as a namespace. We would be separating each part of the event name using a colon (`:`).

The idea name for an event would be `type`:`element`:`action`.

For example

- If the user hovers on Pay button, the event name would be `behav:pay:hover`.
- If the user clicks on Pay button, the event name would be `behav:pay:click`.
- If a toast is shown, the event name would be `render:toast:show`.
- If a toast is hidden, the event name would be `render:toast:hide`.
- `behav:otp:resend`
- `behav:payment_method:select`
- `behav:wallet:select`
- `behav:bank:select`
- `behav:saved_cards:toggle`

Because we have namespacing, we can even namespace events for specific screens. For example, events for eMandate screen are sent as `${event_type}:emandate:${event_name}`. You get the idea.
