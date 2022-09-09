<script lang="ts">
  import Field from 'ui/components/Field.svelte';

  // i18n
  import { t, locale } from 'svelte-i18n';
  import { formatTemplateWithLocale } from 'i18n';
  import { CVV_LABEL, CVV_HELP } from 'ui/labels/card';
  import { isRedesignV15 } from 'razorpay';

  export let ref = null;

  function handleInput(event) {
    value = event.target.value;
  }

  export let value = '';
  export let id;
  export let length = 3;
  export let showPlaceholder = false; // Turns label into placeholder
  export let showHelp = true;

  export let elemClasses;
  export let inputFieldClasses;
  export let labelClasses;
  export let labelUpperClasses;

  let cvvPattern = '[0-9]{3}';
  let helpText = formatTemplateWithLocale(CVV_HELP, { length }, $locale);
  let placeholder;
  let label;
  let isInvalid;

  const isRedesignV15Enabled = isRedesignV15();
  let CVV_REGEX = new RegExp(cvvPattern);

  $: {
    if (showHelp) {
      // LABEL: It's a {length} digit code printed on the back of your card.
      helpText = formatTemplateWithLocale(CVV_HELP, { length }, $locale);
    } else {
      helpText = null;
    }
  }

  $: {
    // LABEL: CVV
    if (showPlaceholder) {
      label = null;
      placeholder = $t(CVV_LABEL);
    } else {
      label = $t(CVV_LABEL);
      placeholder = null;
    }
  }

  $: {
    cvvPattern = `[0-9]{${length}}`;
    CVV_REGEX = new RegExp(cvvPattern);
  }

  export function focus() {
    ref.focus();
  }

  export function blur() {
    ref.blur();
  }

  let helpTextToDisplay;

  export function isValid() {
    const result = CVV_REGEX.test(value);
    helpTextToDisplay = result ? undefined : helpText;
    return result;
  }

  // Option Specific to 1cc
  $: isInvalid = !CVV_REGEX.test(value);
</script>

<!-- TODO: make helpText support an image as well -->
<Field
  formatter={{ type: 'number' }}
  {helpText}
  {id}
  {label}
  {placeholder}
  name="card[cvv]"
  pattern={cvvPattern}
  required
  type="cvv"
  autocomplete="cc-csc"
  maxlength={length}
  {value}
  bind:this={ref}
  on:input={handleInput}
  on:input
  on:blur
  on:focus
  on:copy={(e) => {
    e.preventDefault();
    return false;
  }}
  handleBlur
  handleFocus
  handleInput
  {elemClasses}
  {inputFieldClasses}
  {labelClasses}
  {labelUpperClasses}
  validationText={isRedesignV15Enabled && helpTextToDisplay}
  {isInvalid}
/>

<style lang="scss">
  :global {
    /* TODO: find a better way */
    #card_cvv {
      font-family: rzpcvv;
    }

    #card_cvv ~ .help {
      width: 130px;
      left: auto;
      right: -10px;
      padding-left: 60px;
      background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDUiIGhlaWdodD0iMjkiIHZpZXdCb3g9IjAgMCA0NSAyOSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+PHRpdGxlPmNhcmQ8L3RpdGxlPjxkZWZzPjxyZWN0IGlkPSJjIiB3aWR0aD0iNDQiIGhlaWdodD0iMjgiIHJ4PSIxLjI1NyIvPjxwYXR0ZXJuIGlkPSJkIiB3aWR0aD0iNC44IiBoZWlnaHQ9IjQuOCIgeD0iLTQuOCIgeT0iLTQuOCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHVzZSB4bGluazpocmVmPSIjYSIgdHJhbnNmb3JtPSJzY2FsZSguMSkiLz48L3BhdHRlcm4+PGltYWdlIGlkPSJhIiB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHhsaW5rOmhyZWY9ImRhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBREFBQUFBd0NBWUFBQUJYQXZtSEFBQUFBWE5TUjBJQXJzNGM2UUFBQVY5SlJFRlVhQVh0Mk8wTmdqQVFCbUJydDREb0RpYXdFSEVRQjFGM01LN0JIS3hSKzJvS1FmbnNlWENYMEIvU0VyM3p1Y1pJeitSNTduWitPT2Z1WlZtZU1jV2FPRXlXWlZkalRCSGljTVczYVpwZWtNUW5PeVZKY3FpcTZobVNVcTZJZzNpSXl4bmYraVJIN2lTYzhlMVNsZUpDV0d5dlpzUWJvQmxSQTdRaVdnQ05pQitBTmtRblFCT2lGNkFGTVFqUWdCZ0ZTRWRNQWtoR1RBWklSY3dDU0VUTUJraERSQUVrSWFJQlVoQWtnQVFFR2JBMkFnQ0RMMEVkYXgyS3JPOGUzSkNjQ3NEbjEwQ2dLL0hRMkkwSVordzlLdWNYQmZvNG1HSk5IQTc5SmZTQlFoek8rRnRmS0ZTNTY3ckViMkxyQzNWVi92c2U1MDdVZjJTY1NRRGlpbDhET0pPRUhlRkF0QUFhRVQ4QWJZaE9nQ1pFTDBBTFloQ2dBVEVLa0k2WUJKQ01tQXlRaXBnRmtJaVlEWkNHaUFKSVFrUURwQ0JJQUFrSU1tQnRCQUQvT01pelBlK2pRQmg5aitKYlgraFRuK2ExcjFLNDM3d3JmdllkL3dWK1VnYmxEL2JHRmdBQUFBQkpSVTVFcmtKZ2dnPT0iLz48cGF0aCBpZD0iYiIgZD0iTTE4LjIzIDExLjQ1NWgxMy44Mjh2MTAuMTgyaC0xMy44M3oiLz48bWFzayBpZD0iZSIgeD0iMCIgeT0iMCIgd2lkdGg9IjEzLjgyOSIgaGVpZ2h0PSIxMC4xODIiIGZpbGw9IiNmZmYiPjx1c2UgeGxpbms6aHJlZj0iI2IiLz48L21hc2s+PC9kZWZzPjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKC42NjMgLjA5MikiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+PHVzZSBmaWxsPSIjRDlEOUQ5IiB4bGluazpocmVmPSIjYyIvPjx1c2UgZmlsbC1vcGFjaXR5PSIuMiIgZmlsbD0idXJsKCNkKSIgeGxpbms6aHJlZj0iI2MiLz48cGF0aCBmaWxsPSIjMDAwIiBkPSJNMCAyLjU0NWg0NHY1LjA5SDB6Ii8+PHBhdGggZmlsbD0iI0ZGRiIgZD0iTTAgMTEuNDU1aDMxLjQzdjEwLjE4MkgweiIvPjx0ZXh0IGZvbnQtZmFtaWx5PSJMYXRvLUJvbGQsIExhdG8iIGZvbnQtc2l6ZT0iNS4wMjkiIGZvbnQtd2VpZ2h0PSJib2xkIiBsZXR0ZXItc3BhY2luZz0iLjYyOSIgZmlsbD0iIzAwMCI+PHRzcGFuIHg9IjUuNjU3IiB5PSIxNy43MjciPjQ1NiAxMjM8L3RzcGFuPjwvdGV4dD48dXNlIHN0cm9rZT0iI0M4NDA0MCIgbWFzaz0idXJsKCNlKSIgc3Ryb2tlLXdpZHRoPSIyLjUxNCIgeGxpbms6aHJlZj0iI2IiLz48L2c+PC9zdmc+');
      background-size: 44px 28px;
      background-position: 10px center;
      background-repeat: no-repeat;
    }

    #card_cvv ~ .help:after {
      left: auto;
      right: 50px;
    }
  }
</style>
