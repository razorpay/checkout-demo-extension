<script>
  import { onMount } from 'svelte';
  import { Events, CardEvents, MetaProperties } from 'analytics';

  // i18n
  import { t } from 'svelte-i18n';

  import Field from 'ui/components/Field.svelte';
  import SearchModal from 'ui/elements/SearchModal.svelte';
  import {
    AVS_FORM_ADDRESS_LINE_1,
    AVS_FORM_ADDRESS_LINE_2,
    AVS_FORM_ZIP_CODE,
    AVS_FORM_COUNTRY,
    AVS_FORM_STATE,
    AVS_FORM_CITY,
    AVS_COUNTRY_SEARCH_TITLE,
    AVS_STATE_SEARCH_TITLE,
    AVS_COUNTRY_ALL,
    AVS_STATE_ALL,
    AVS_FORM_INPUT_REQUIRED,
  } from 'ui/labels/card';

  import CountrySearchItem from 'ui/elements/search-item/Country.svelte';
  import {
    AVSBillingAddress,
    selectedCardFromHome,
    selectedCard,
  } from 'checkoutstore/screens/card';
  import { getPrefillBillingAddress } from 'checkoutstore';
  import { AVS_COUNTRY_MAP, STATE_MAP, Views } from './constant';

  export let direct = false;
  export let lastView = null;

  let formData = $AVSBillingAddress || getPrefillBillingAddress();

  let formErrors = {};

  let spacialCharRegex = /^[\s`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]*$/; // Regex to check if input field contains only special characters.

  function checkFormErrors() {
    Object.keys(formData).forEach((key) => {
      if (key !== 'line2') {
        if (!formData[key].trim()) {
          formErrors[key] = $t(AVS_FORM_INPUT_REQUIRED);
        } else {
          delete formErrors[key];
        }
      }
    });
  }

  onMount(() => {
    // check for selected card
    let billingAddress;
    if (lastView !== Views.ADD_CARD) {
      if (direct && $selectedCardFromHome?.billing_address) {
        // directly come from home screen
        billingAddress = { ...$selectedCardFromHome.billing_address };
      } else if (!direct && $selectedCard?.billing_address) {
        // from card screen
        billingAddress = { ...$selectedCard.billing_address };
      }

      if (billingAddress?.line1) {
        $AVSBillingAddress = billingAddress;
      }
    }
    if (!$AVSBillingAddress && !$AVSBillingAddress.line1) {
      // check for prefill data
      $AVSBillingAddress = getPrefillBillingAddress();
    }
    /**
     * convert US to United States of America in UI
     */
    if (
      $AVSBillingAddress.country &&
      $AVSBillingAddress.country.length === 2 &&
      !$AVSBillingAddress._country
    ) {
      $AVSBillingAddress.country = $AVSBillingAddress.country?.toUpperCase();
      $AVSBillingAddress._country = $AVSBillingAddress.country;
      $AVSBillingAddress.country = AVS_COUNTRY_MAP[$AVSBillingAddress.country];
    }
    formData = $AVSBillingAddress;

    /**
     * TODO need better way
     * Check if main form is submitted
     */
    const footerCta = document.getElementById('footer-cta');
    if (footerCta) {
      footerCta.addEventListener('click', checkFormErrors);
    }
    return () => {
      if (footerCta) {
        footerCta.removeEventListener('click', checkFormErrors);
      }
    };
  });

  const AVS_COUNTRY_SUPPORTED = Object.keys(AVS_COUNTRY_MAP).reduce(
    (acc, c) => {
      acc.push({
        _key: c,
        label: AVS_COUNTRY_MAP[c],
        type: 'country',
      });
      return acc;
    },
    []
  );

  const SearchModalProps = {
    country: {
      title: $t(AVS_COUNTRY_SEARCH_TITLE),
      placeholder: $t(AVS_COUNTRY_SEARCH_TITLE),
      data: AVS_COUNTRY_SUPPORTED,
      keys: ['label'],
      all: $t(AVS_COUNTRY_ALL),
    },
    state: {
      title: $t(AVS_STATE_SEARCH_TITLE),
      placeholder: $t(AVS_STATE_SEARCH_TITLE),
      keys: ['label'],
      data: [],
      all: $t(AVS_STATE_ALL),
    },
  };

  $: {
    if (formData && formData._country && STATE_MAP[formData._country]) {
      SearchModalProps.state.data = STATE_MAP[formData._country].map((x) => ({
        _key: x,
        label: x,
      }));
    }
  }

  let searchModalState = {
    isOpen: false,
  };

  function openSearchModal(id) {
    searchModalState = {
      isOpen: true,
      ...SearchModalProps[id],
      key: id,
    };
  }

  function downArrowHandler(id, event) {
    const DOWN_ARROW = 40;

    if (event.keyCode === DOWN_ARROW) {
      openSearchModal(id);
    }
  }

  const INPUT_FORM = [
    {
      id: 'line1',
      placeholder: $t(AVS_FORM_ADDRESS_LINE_1),
      required: true,
    },
    {
      id: 'line2',
      placeholder: $t(AVS_FORM_ADDRESS_LINE_2),
    },
    [
      {
        id: 'city',
        placeholder: $t(AVS_FORM_CITY),
        required: true,
      },
      {
        id: 'postal_code',
        placeholder: $t(AVS_FORM_ZIP_CODE),
        required: true,
      },
    ],
    [
      {
        id: 'country',
        type: 'search',
        placeholder: $t(AVS_FORM_COUNTRY),
        required: true,
      },
      {
        id: 'state',
        type: 'search',
        placeholder: $t(AVS_FORM_STATE),
        required: true,
      },
    ],
  ];

  function updateValue(key, value) {
    formData = {
      ...formData,
      [key]: value,
    };
  }

  /**
   * Trim the input field value to not allow blank spaces
   * @param key
   */
  function handleOnBlur(key) {
    formData = {
      ...formData,
      [key]: spacialCharRegex.test(formData[key]) ? '' : formData[key].trim(),
    };
  }

  $: {
    $AVSBillingAddress = { ...formData };
    Events.setMeta(MetaProperties.AVS_FORM_DATA, formData);
  }

  let showModal = false;
  $: showModal =
    searchModalState.isOpen &&
    searchModalState.data &&
    searchModalState.data.length > 0;
</script>

<form>
  {#each INPUT_FORM as input, index (index)}
    <div class="form-input">
      {#if Array.isArray(input)}
        {#each input as subInput (subInput.id)}
          <Field
            id={`avs-${subInput.id}`}
            name={`avs-${subInput.id}`}
            type="text"
            leftImage={subInput.id === 'country' && formData._country
              ? `https://cdn.razorpay.com/country-flag/${formData._country}.svg`
              : ''}
            on:click={subInput.type === 'search'
              ? openSearchModal.bind(null, subInput.id)
              : () => {}}
            required={subInput.required}
            on:focus={subInput.type === 'search'
              ? openSearchModal.bind(null, subInput.id)
              : () => {}}
            on:input={(e) => updateValue(subInput.id, e.target.value)}
            value={formData[subInput.id]}
            on:blur={() => handleOnBlur(subInput.id)}
            icon={subInput.type === 'search' ? '' : false}
            on:keydown={downArrowHandler.bind(null, subInput.id)}
            label={formData[subInput.id] ? subInput.placeholder : ''}
            placeholder={subInput.placeholder}
            helpText={formErrors[subInput.id]}
            maxlength={255}
          />
        {/each}
      {:else}
        <Field
          elemClasses={'avs-single-input'}
          id={`avs-${input.id}`}
          name={`avs-${input.id}`}
          type="text"
          required={input.required}
          on:click={input.type === 'search'
            ? openSearchModal.bind(null, input.id)
            : () => {}}
          on:focus={input.type === 'search'
            ? openSearchModal.bind(null, input.id)
            : () => {}}
          on:keydown={downArrowHandler.bind(null, input.id)}
          value={formData[input.id]}
          on:input={(e) => updateValue(input.id, e.target.value)}
          on:blur={() => handleOnBlur(input.id)}
          label={formData[input.id] ? input.placeholder : ''}
          placeholder={input.placeholder}
          helpText={formErrors[input.id]}
          maxlength={255}
        />
      {/if}
    </div>
  {/each}

  <SearchModal
    sortSearchResult={(a, b) => {
      a = a.label.toLowerCase();
      b = b.label.toLowerCase();

      return a > b ? 1 : b > a ? -1 : 0;
    }}
    identifier="avs_location_selector"
    title={searchModalState.title || ''}
    placeholder={searchModalState.placeholder || ''}
    all={searchModalState.all}
    autocomplete="country"
    items={searchModalState.data || []}
    keys={searchModalState.keys || ['label']}
    component={CountrySearchItem}
    bind:open={showModal}
    on:close={() => {
      searchModalState = { isOpen: false };
    }}
    on:select={(event) => {
      const data = event.detail;
      formData[searchModalState.key] = data?.label;
      // on change of country reset state
      if (searchModalState.key === 'country') {
        formData.state = '';
        formData._country = data?._key;
      }
      searchModalState = { isOpen: false };
    }}
  />
</form>

<style>
  form {
    padding: 0 24px;
  }

  .form-input > :global(div) {
    width: 100%;
  }

  .form-input > :global(div:nth-child(odd)) {
    margin-right: 18px;
  }

  .form-input > :global(div:nth-child(even)) {
    margin-left: 18px;
  }

  .form-input > :global(div:last-child) {
    margin-right: 0;
  }

  .form-input {
    display: flex;
  }

  form :global(.filled:not(.input-radio) label) {
    transform: scale(0.86) translateY(-30px);
  }

  form :global(#avs-country),
  form :global(#avs-state) {
    text-overflow: ellipsis;
    width: calc(100% - 30px);
    padding-right: 15px;
  }

  form :global(.elem > i) {
    transform: rotate(-90deg) scale(0.5);
    top: 50%;
  }
</style>
