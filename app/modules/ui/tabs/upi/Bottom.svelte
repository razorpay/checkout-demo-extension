<script>
  import Bottom from 'ui/layouts/Bottom.svelte';
  import FormattedText from 'ui/elements/FormattedText/FormattedText.svelte';
  import Callout from 'ui/elements/Callout.svelte';

  import { getSession } from 'sessionmanager';

  import { _ as t, locale } from 'svelte-i18n';
  import { formatTemplateWithLocale } from 'i18n';

  import {
    UPI_OTM_CALLOUT,
    UPI_RECURRING_CAW_CALLOUT_ALL_DATA,
    UPI_RECURRING_CAW_CALLOUT_NO_NAME,
    UPI_RECURRING_CAW_CALLOUT_NO_NAME_NO_FREQUENCY,
    UPI_RECURRING_CAW_CALLOUT_NO_FREQUENCY,
    UPI_RECURRING_SUBSCRIPTION_CALLOUT,
  } from 'ui/labels/upi';

  import {
    getAmount,
    getName,
    getCurrency,
    isASubscription,
    getSubscription,
  } from 'checkoutstore';

  export let isOtm = false;
  export let isUpiRecurringCAW = false;
  export let isUpiRecurringSubscription = false;
  export let otmStartDate = false;
  export let otmEndDate = false;
  export let recurring_callout = '';
  export let endDate = null;
  export let maxRecurringAmount = 0;
  export let recurringFrequency = 0;

  const session = getSession();
  const merchantName = getName();

  let toShortFormat = function(date, delimter = ' ') {
    let month_names = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    let day = date.getDate();
    let month_index = date.getMonth();
    let year = date.getFullYear();

    return '' + day + delimter + month_names[month_index] + delimter + year;
  };
</script>

<Bottom>
  {#if isOtm}
    <Callout classes={['downtime-callout']} showIcon={true}>
      <FormattedText
        text={formatTemplateWithLocale(UPI_OTM_CALLOUT, {
          amount: session.formatAmountWithCurrency(getAmount()),
          nameString: merchantName ? 'by ' + merchantName : '',
          startDate: toShortFormat(otmStartDate),
          endDate: toShortFormat(otmEndDate),
        })} />
    </Callout>
  {/if}
  <!-- Both CAW and subscriptions show the same callout with the same information -->
  {#if isUpiRecurringCAW || isUpiRecurringSubscription}
    <Callout classes={['downtime-callout']} showIcon={true}>
      <!-- This is a recurring payment and {maxAmount} will be charged now. After this, {merchantName} can charge upto {amount} {recurringFrequency} till {endDate}. -->
      <!-- This is a recurring payment and {maxAmount} will be charged now. You will be charged upto {amount} on a {recurringFrequency} basis till {endDate}. -->
      <!-- This is a recurring payment and {maxAmount} will be charged now. You will be charged upto {amount} anytime till {endDate}. -->
      <!-- This is a recurring payment and {maxAmount} will be charged now. {merchantName} can charge upto {amount} anytime till {endDate}. -->
      {formatTemplateWithLocale(recurring_callout, { maxAmount: session.formatAmountWithCurrency(getAmount()), merchantName: !merchantName ? '' : merchantName, amount: session.formatAmountWithCurrency(maxRecurringAmount), recurringFrequency, endDate: toShortFormat(new Date(endDate * 1000)) }, $locale)}
    </Callout>
  {/if}
</Bottom>
