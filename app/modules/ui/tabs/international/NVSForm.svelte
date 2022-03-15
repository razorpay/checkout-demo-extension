<script>
  import { onMount } from 'svelte';
  import Analytics, { Events, MetaProperties } from 'analytics';
  import EVENT_NAMES from 'ui/tabs/international/events';

  // i18n
  import { t } from 'svelte-i18n';

  import Field from 'ui/components/Field.svelte';
  import SearchModal from 'ui/elements/SearchModal.svelte';
  import CountrySearchItem from 'ui/elements/search-item/Country.svelte';
  import { AVS_FORM_INPUT_REQUIRED } from 'ui/labels/card';

  // Store
  import { setNVSFormData } from 'checkoutstore/screens/international';
  import {
    allCountries,
    getStatesByCountryCodeFromStore,
    setAllCountries,
    setStatesByCountryCode,
  } from 'checkoutstore/country';

  import { getPrefillBillingAddress } from 'razorpay';

  // Helpers
  import {
    createNVSFormInputs,
    createSearchModalProps,
    updateSearchModalCountries,
    updateSearchModalStates,
    getAllCountries,
    getStatesWithCountryCode,
  } from 'ui/tabs/international/helper';

  import { getSession } from 'sessionmanager';

  import { NVS_COUNTRY_MAP } from 'ui/tabs/international/constants';

  let formData = getPrefillBillingAddress(true);

  let formErrors = {};

  let spacialCharRegex = /^[\s`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]*$/; // Regex to check if input field contains only special characters.

  let INPUT_FORM = createNVSFormInputs($t);

  let SearchModalProps = createSearchModalProps($t);

  let searchModalState = {
    isOpen: false,
  };

  const session = getSession();

  let showModal = false;

  $: SearchModalProps = updateSearchModalCountries(
    SearchModalProps,
    $allCountries
  );

  $: {
    setNVSFormData({ ...formData });
    Events.setMeta(MetaProperties.NVS_FORM_DATA, formData);
  }

  $: showModal =
    searchModalState.isOpen &&
    searchModalState.data &&
    searchModalState.data.length > 0;

  const checkFormErrors = () => {
    Object.keys(formData).forEach((key) => {
      if (key !== 'line2') {
        if (!formData[key].trim()) {
          formErrors[key] = $t(AVS_FORM_INPUT_REQUIRED);
        } else {
          delete formErrors[key];
        }
      }
    });

    Events.Track(EVENT_NAMES.NVS_FORM_ERRORS, {
      errors: formErrors,
    });
  };

  const openSearchModal = (id) => {
    searchModalState = {
      isOpen: true,
      ...SearchModalProps[id],
      key: id,
    };
  };

  const downArrowHandler = (id, event) => {
    const DOWN_ARROW = 40;

    if (event.keyCode === DOWN_ARROW) {
      openSearchModal(id);
    }
  };

  const updateValue = (key, value) => {
    formData = {
      ...formData,
      [key]: value,
    };
  };

  /**
   * Trim the input field value to not allow blank spaces
   * @param key
   */
  const handleOnBlur = (key) => {
    formData = {
      ...formData,
      [key]: spacialCharRegex.test(formData[key]) ? '' : formData[key].trim(),
    };
  };

  const fetchStates = (countryCode) => {
    const states = getStatesByCountryCodeFromStore(countryCode);
    if (!states.length) {
      getStatesWithCountryCode(session.r, countryCode)
        .then((res) => {
          SearchModalProps = updateSearchModalStates(SearchModalProps, res);
          setStatesByCountryCode(countryCode, res);
        })
        .catch((err) => {
          // do nothing
        });
    } else {
      SearchModalProps = updateSearchModalStates(SearchModalProps, states);
    }
  };

  onMount(() => {
    getAllCountries(session.r)
      .then(setAllCountries)
      .catch((err) => {
        console.log(err);
        // do nothing
      });

    /**
     * convert US to United States of America in UI
     */
    if (
      formData.country &&
      formData.country.length === 2 &&
      !formData._country
    ) {
      formData.country = formData.country?.toUpperCase();
      formData._country = formData.country;
      formData.country = NVS_COUNTRY_MAP[formData.country];
    }

    /**
     * TODO need better way
     * Check if main form is submitted
     */
    const footerCta = document.getElementById('footer-cta');
    if (footerCta) {
      footerCta.addEventListener('click', checkFormErrors);
    }

    Events.Track(EVENT_NAMES.NVS_SHOW);

    return () => {
      if (footerCta) {
        footerCta.removeEventListener('click', checkFormErrors);
      }
      Events.removeMeta(MetaProperties.NVS_FORM_DATA);
    };
  });
</script>

<form>
  {#each INPUT_FORM as input, index (index)}
    <div class="form-input">
      {#if Array.isArray(input)}
        {#each input as subInput (subInput.id)}
          <Field
            id={`nvs-${subInput.id}`}
            name={`nvs-${subInput.id}`}
            type="text"
            autocomplete="donot-autocomplete"
            leftImage={subInput.id === 'country' && formData._country
              ? `https://cdn.razorpay.com/country-flags/${formData._country}.svg`
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
          elemClasses={'nvs-single-input'}
          id={`nvs-${input.id}`}
          name={`nvs-${input.id}`}
          type="text"
          autocomplete="donot-autocomplete"
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
    identifier="nvs_location_selector"
    title={searchModalState.title || ''}
    placeholder={searchModalState.placeholder || ''}
    all={searchModalState.all}
    autocomplete="donot-autocomplete"
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
        fetchStates(formData._country.toLowerCase());
      }
      searchModalState = { isOpen: false };
    }}
  />
</form>

<style type="text/css">
  form {
    padding: 0 24px 24px;
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

  form :global(#nvs-country),
  form :global(#nvs-state) {
    text-overflow: ellipsis;
    width: calc(100% - 30px);
    padding-right: 15px;
  }

  form :global(.elem > i) {
    transform: rotate(-90deg) scale(0.5);
    top: 50%;
  }
</style>
