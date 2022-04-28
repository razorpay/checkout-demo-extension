<script lang="ts">
  // svelte
  import { createEventDispatcher, onMount } from 'svelte';

  // session
  import { getPrefillBillingAddress } from 'razorpay';
  import { getSession } from 'sessionmanager';

  // analytics
  import { Events, MetaProperties } from 'analytics';

  // components
  import Field from 'ui/components/Field.svelte';
  import SearchModal from 'ui/elements/SearchModal.svelte';
  import CountrySearchItem from 'ui/elements/search-item/Country.svelte';

  // i18n
  import { t } from 'svelte-i18n';

  // types
  import {
    FORM_TYPE,
    FORM_FIELDS,
    FormFieldType,
    SearchModalFieldSType,
    SearchModalFieldType,
    FormValuesType,
    FormErrorsType,
    FilterCallbackType,
  } from './types';

  // constants
  import RazorpayConfig from 'common/RazorpayConfig';
  import { AVS_FORM_INPUT_REQUIRED } from 'ui/labels/avs-form';
  import { FORM_FIELDS_TYPE_MAPPING, EVENT_NAMESPACE } from './constants';

  // helpers
  import {
    getAllCountries,
    createFormFields,
    combineFormValues,
    createSearchModalFields,
    getStatesWithCountryCode,
    validateFormValues,
    findCountryByCodeOrName,
  } from './helper';

  // props
  export let value: FormValuesType = {};
  export let formType: FORM_TYPE = FORM_TYPE.AVS;
  export let filterCountries: FilterCallbackType = null;
  export let filterStates: FilterCallbackType = null;

  // states
  let formErrors: FormErrorsType = {};
  let formFields: (FormFieldType | FormFieldType[])[] = [];
  let visibleModal: SearchModalFieldType | null = null;
  let searchModalFields: SearchModalFieldSType;
  let whichSearchModalVisible: null | FORM_FIELDS.country | FORM_FIELDS.state =
    null;
  let isStatesLoading = false;
  const session = getSession();
  const dispatch = createEventDispatcher();
  const preFilledValues = getPrefillBillingAddress(
    formType === FORM_TYPE.N_AVS
  );
  const countryFlagsUrl = `${RazorpayConfig.cdn}country-flags/`;
  const metaPropertyName =
    formType === FORM_TYPE.AVS
      ? MetaProperties.AVS_FORM_DATA
      : MetaProperties.NVS_FORM_DATA;

  // reactive states
  $: formValues = combineFormValues(value, preFilledValues);
  $: !searchModalFields && (searchModalFields = createSearchModalFields($t));
  $: formType,
    (formFields = createFormFields($t, FORM_FIELDS_TYPE_MAPPING[formType]));
  $: visibleModal = whichSearchModalVisible
    ? searchModalFields[whichSearchModalVisible]
    : null;

  // handlers
  const handleShowSearchModal = (
    whichSearchModal: null | FORM_FIELDS.country | FORM_FIELDS.state
  ) => {
    whichSearchModalVisible = whichSearchModal;
  };

  const handleHideSearchModal = () => {
    whichSearchModalVisible = null;
  };

  const handleSearchFieldClick = (field: FormFieldType) => {
    if (field.searchable) {
      handleShowSearchModal(
        field.id as FORM_FIELDS.country | FORM_FIELDS.state
      );
    }
  };

  const handleSearchFieldDownArrow = (
    evt: KeyboardEvent,
    field: FormFieldType
  ) => {
    // keyCode 40 is downarrow
    if (evt.keyCode === 40) {
      handleSearchFieldClick(field);
    }
  };

  const handleOnInput = (field: FORM_FIELDS, fieldValue: unknown) => {
    formValues = {
      ...formValues,
      [field]: fieldValue,
    };
    dispatch('input', { ...formValues });
  };

  const handleFetchStates = (countryCode: string) => {
    isStatesLoading = true;
    getStatesWithCountryCode(session.r, countryCode)
      .then((res) => {
        if (typeof filterStates === 'function') {
          searchModalFields[FORM_FIELDS.state].data = filterStates(res);
        } else {
          searchModalFields[FORM_FIELDS.state].data = res;
        }
      })
      .catch(() => {
        searchModalFields[FORM_FIELDS.state].data = [];
      })
      .finally(() => {
        isStatesLoading = false;
      });
  };

  const handleOnSelectChange = (
    event: CustomEvent<{
      type: FORM_FIELDS.country | FORM_FIELDS.state;
      key: string;
      label: string;
    }>
  ) => {
    const data = event.detail;
    handleOnInput(data.type, data.label);
    if (data.type === FORM_FIELDS.country) {
      handleOnInput(FORM_FIELDS.countryCode, data.key);
      handleOnInput(FORM_FIELDS.state, '');
      handleFetchStates(data.key);
    }
    handleHideSearchModal();
  };

  const handleFieldInput = (id: FORM_FIELDS, evt: Event) => {
    handleOnInput(id, (<HTMLInputElement>evt.target)?.value);
  };

  /**
   * Trim the input field value to not allow blank spaces
   * @param key
   */
  function handleOnBlur(key: FORM_FIELDS) {
    const value = (formValues[key] as string).trim();
    formValues = {
      ...formValues,
      [key]: value,
    };

    dispatch('blur', { ...formValues });
  }

  const handleFormSubmit = () => {
    const { isValid, errors } = validateFormValues(formValues);
    formErrors = errors;
    if (isValid) {
      dispatch('submit', { ...formValues });
    }
    Events.Track(`${EVENT_NAMESPACE}:${formType}:submit`);
  };

  /**
   * At initial render with default value of form, the parent might has passed ISO code in country value
   * We need to change that to country name to render in the input field.
   */
  const changeCountryCodeWithName = () => {
    if (
      formValues[FORM_FIELDS.country] &&
      (formValues[FORM_FIELDS.country] as string).length === 2
    ) {
      const country = findCountryByCodeOrName(
        searchModalFields[FORM_FIELDS.country].data,
        formValues.country
      );
      formValues = {
        ...formValues,
        [FORM_FIELDS.countryCode]: formValues[FORM_FIELDS.country],
        [FORM_FIELDS.country]: country?.label || '',
      };
      if (country) {
        handleFetchStates(country.key);
      }
      dispatch('input', { ...formValues });
    }
  };

  const checkFormErrors = () => handleFormSubmit();

  // lifecycle
  onMount(() => {
    getAllCountries(session.r)
      .then((res) => {
        if (typeof filterCountries === 'function') {
          searchModalFields[FORM_FIELDS.country].data = filterCountries(res);
        } else {
          searchModalFields[FORM_FIELDS.country].data = res;
        }
        changeCountryCodeWithName();
      })
      .catch(() => {
        // handle error
        searchModalFields[FORM_FIELDS.country].data = [];
        searchModalFields[FORM_FIELDS.state].data = [];
      });

    /**
     * TODO need better way
     * Check if main form is submitted
     */
    const footerCta = document.getElementById('footer-cta');
    if (footerCta) {
      footerCta.addEventListener('click', checkFormErrors);
    }
    Events.setMeta(metaPropertyName, formValues);
    Events.Track(`${EVENT_NAMESPACE}:${formType}:loaded`);
    return () => {
      if (footerCta) {
        footerCta.removeEventListener('click', checkFormErrors);
      }
      Events.removeMeta(metaPropertyName);
    };
  });
</script>

<form class="billing-address-form" on:submit={handleFormSubmit}>
  {#each formFields as field, index (index)}
    <div class="billing-address-form__field">
      {#if Array.isArray(field)}
        {#each field as subField, subIndex (subIndex)}
          <Field
            dir=""
            type="text"
            maxlength={255}
            forceStopDispatch={![
              FORM_FIELDS.country,
              FORM_FIELDS.state,
            ].includes(subField.id)}
            downtimeSeverity=""
            xautocompletetype=""
            required={subField.required}
            placeholder={subField.placeholder}
            autocomplete={subField.autocomplete}
            id={`billing-address-verification-${subField.id}`}
            name={`billing-address-verification-${subField.id}`}
            label={formValues[subField.id] ? subField.placeholder : ''}
            labelClasses={formValues[subField.id] ? 'input-label' : ''}
            icon={[FORM_FIELDS.country, FORM_FIELDS.state].includes(subField.id)
              ? ''
              : false}
            value={formValues[subField.id]}
            leftImage={subField.id === FORM_FIELDS.country &&
            formValues[FORM_FIELDS.countryCode]
              ? `${countryFlagsUrl}${formValues[FORM_FIELDS.countryCode]}.svg`
              : ''}
            helpText={formErrors[subField.id]
              ? $t(AVS_FORM_INPUT_REQUIRED)
              : ''}
            loader={subField.id === FORM_FIELDS.state && isStatesLoading}
            on:click={() => handleSearchFieldClick(subField)}
            on:focus={() => handleSearchFieldClick(subField)}
            on:keydown={(evt) => handleSearchFieldDownArrow(evt, subField)}
            on:input={(e) => handleFieldInput(subField.id, e)}
            on:blur={() => handleOnBlur(subField.id)}
          />
        {/each}
      {:else}
        <Field
          dir=""
          type="text"
          maxlength={255}
          forceStopDispatch
          downtimeSeverity=""
          xautocompletetype=""
          required={field.required}
          value={formValues[field.id]}
          placeholder={field.placeholder}
          autocomplete={field.autocomplete}
          id={`billing-address-verification-${field.id}`}
          name={`billing-address-verification-${field.id}`}
          label={formValues[field.id] ? field.placeholder : ''}
          labelClasses={formValues[field.id] ? 'input-label' : ''}
          helpText={formErrors[field.id] ? $t(AVS_FORM_INPUT_REQUIRED) : ''}
          on:click={() => handleSearchFieldClick(field)}
          on:focus={() => handleSearchFieldClick(field)}
          on:keydown={(evt) => handleSearchFieldDownArrow(evt, field)}
          on:input={(e) => handleFieldInput(field.id, e)}
          on:blur={() => handleOnBlur(field.id)}
        />
      {/if}
    </div>
  {/each}

  <SearchModal
    all={visibleModal?.all}
    sortSearchResult={null}
    component={CountrySearchItem}
    items={visibleModal?.data || []}
    autocomplete="donot-autocomplete"
    keys={visibleModal?.keys || ['label']}
    open={whichSearchModalVisible !== null}
    placeholder={visibleModal?.placeholder || ''}
    identifier="billing-address-verification-location"
    on:close={handleHideSearchModal}
    on:select={handleOnSelectChange}
  />
</form>

<style lang="css">
  .billing-address-form {
    padding: 0 24px;
  }

  .billing-address-form__field > :global(div) {
    width: 100%;
  }

  .billing-address-form__field > :global(div:nth-child(odd)) {
    margin-right: 12px;
  }

  .billing-address-form__field > :global(div:nth-child(even)) {
    margin-left: 12px;
  }

  .billing-address-form__field > :global(div:last-child) {
    margin-right: 0;
  }

  .billing-address-form__field {
    display: flex;
  }

  .billing-address-form :global(.filled:not(.input-radio) label),
  .billing-address-form :global(.input-label) {
    transform: scale(0.86) translateY(-30px);
  }

  .billing-address-form :global(#billing-address-verification-country),
  .billing-address-form :global(#billing-address-verification-state) {
    text-overflow: ellipsis;
    width: calc(100% - 30px);
    padding-right: 15px;
  }

  .billing-address-form :global(.elem > i) {
    transform: rotate(-90deg) scale(0.5);
    top: 50%;
  }
</style>
