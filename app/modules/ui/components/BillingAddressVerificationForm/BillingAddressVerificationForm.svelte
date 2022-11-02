<script lang="ts">
  // svelte
  import { createEventDispatcher, onMount } from 'svelte';

  // session
  import { getPrefillBillingAddress, isRedesignV15 } from 'razorpay';
  import { getSession } from 'sessionmanager';

  // analytics
  import { Events, MetaProperties } from 'analytics';

  // components
  import Field from 'ui/components/Field.svelte';
  import CountrySearchItem from 'ui/elements/search-item/Country.svelte';

  // i18n
  import { t } from 'svelte-i18n';

  // types
  import {
    FORM_TYPE,
    FORM_FIELDS,
    FormFieldType,
    SearchModalFieldSType,
    FormValuesType,
    FormErrorsType,
    FilterCallbackType,
  } from './types';

  // constants
  import RazorpayConfig from 'common/RazorpayConfig';
  import {
    AVS_FORM_INPUT_REQUIRED,
    AVS_ADDRESS_DETAILS,
  } from 'ui/labels/avs-form';
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
  import triggerSearchModal from 'components/SearchModal';

  // props
  export let value: FormValuesType = {};
  export let formType: FORM_TYPE = FORM_TYPE.AVS;
  export let filterCountries: FilterCallbackType = null;
  export let filterStates: FilterCallbackType = null;

  let searchModalOpen = false;

  // states
  let formErrors: FormErrorsType = {};
  let formFields: (FormFieldType | FormFieldType[])[] = [];
  let searchModalFields: SearchModalFieldSType;
  let isStatesLoading = false;
  let isCountryListLoading = false;
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

  const isRedesign = isRedesignV15();

  // reactive states
  $: formValues = combineFormValues(value, preFilledValues);
  $: !searchModalFields &&
    (searchModalFields = createSearchModalFields($t, isRedesign));
  $: formType,
    (formFields = createFormFields($t, FORM_FIELDS_TYPE_MAPPING[formType]));

  // handlers
  const handleShowSearchModal = (
    whichSearchModal: null | FORM_FIELDS.country | FORM_FIELDS.state
  ) => {
    if (whichSearchModal && !searchModalOpen) {
      const modalData = searchModalFields[whichSearchModal];
      searchModalOpen = true;
      triggerSearchModal({
        identifier: `billing-address-verification-location-${whichSearchModal}`,
        placeholder: modalData?.placeholder || '',
        all: modalData?.all,
        sortSearchResult: null,
        autocomplete: 'donot-autocomplete',
        items: modalData?.data || [],
        keys: modalData?.keys || ['label'],
        component: CountrySearchItem,
        onClose: () => {
          searchModalOpen = false;
        },
        onSelect: handleOnSelectChange,
      });
    }
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
    const { isValid } = validateFormValues(formValues);
    dispatch('input', {
      value: { ...formValues },
      isValid,
    });
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

  const handleOnSelectChange = (data: {
    type: FORM_FIELDS.country | FORM_FIELDS.state;
    key: string;
    label: string;
  }) => {
    handleOnInput(data.type, data.label);
    if (data.type === FORM_FIELDS.country) {
      handleOnInput(FORM_FIELDS.countryCode, data.key);
      handleOnInput(FORM_FIELDS.state, '');
      handleFetchStates(data.key);
    }
  };

  const handleFieldInput = (id: FORM_FIELDS, evt: Event) => {
    handleOnInput(id, (<HTMLInputElement>evt.target)?.value);
  };

  const isFieldDisabled = (field: FormFieldType) => {
    return (
      (field.id === FORM_FIELDS.state && isStatesLoading) ||
      (field.id === FORM_FIELDS.country && isCountryListLoading)
    );
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
      const { isValid } = validateFormValues(formValues);
      dispatch('input', {
        value: { ...formValues },
        isValid,
      });
    }
  };

  export const checkFormErrors = () => handleFormSubmit();

  // lifecycle
  onMount(() => {
    isCountryListLoading = true;
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
      })
      .finally(() => {
        isCountryListLoading = false;
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
  <fieldset>
    {#if isRedesign}
      <!-- Address Details -->
      <legend class="billing-address-heading">{$t(AVS_ADDRESS_DETAILS)}</legend>
    {/if}
    {#each formFields as field, index (index)}
      <div
        class="billing-address-form--control"
        class:cols={Array.isArray(field)}
      >
        {#if Array.isArray(field)}
          {#each field as subField, subIndex (subIndex)}
            <div class="billing-address-form--input">
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
                elemClasses={formErrors[subField.id] ? 'invalid' : 'filled'}
                icon={[FORM_FIELDS.country, FORM_FIELDS.state].includes(
                  subField.id
                )
                  ? ''
                  : null}
                value={formValues[subField.id]}
                leftImage={subField.id === FORM_FIELDS.country &&
                formValues[FORM_FIELDS.countryCode]
                  ? `${countryFlagsUrl}${
                      formValues[FORM_FIELDS.countryCode]
                    }.svg`
                  : ''}
                helpText={formErrors[subField.id]
                  ? $t(AVS_FORM_INPUT_REQUIRED)
                  : ''}
                loader={isFieldDisabled(subField)}
                disabled={isFieldDisabled(subField)}
                showDropDownIcon={[
                  FORM_FIELDS.country,
                  FORM_FIELDS.state,
                ].includes(subField.id)}
                on:click={() => handleSearchFieldClick(subField)}
                on:focus={() => handleSearchFieldClick(subField)}
                on:keydown={(evt) => handleSearchFieldDownArrow(evt, subField)}
                on:input={(e) => handleFieldInput(subField.id, e)}
                on:blur={() => handleOnBlur(subField.id)}
              />
            </div>
          {/each}
        {:else}
          <div class="billing-address-form--input">
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
              elemClasses={formErrors[field.id] ? 'invalid' : 'filled'}
              on:click={() => handleSearchFieldClick(field)}
              on:focus={() => handleSearchFieldClick(field)}
              on:keydown={(evt) => handleSearchFieldDownArrow(evt, field)}
              on:input={(e) => handleFieldInput(field.id, e)}
              on:blur={() => handleOnBlur(field.id)}
            />
          </div>
        {/if}
      </div>
    {/each}
  </fieldset>
</form>

<style lang="scss">
  .billing-address-form {
    fieldset {
      padding: 0;
      margin: 0;
      border: 0;
    }

    legend.billing-address-heading {
      font-size: 0.875rem;
      line-height: 1;
      font-weight: 600;
    }
  }

  .billing-address-form--input {
    flex: 0 0 100%;
    max-width: 100%;
    box-sizing: border-box;
  }

  .billing-address-form--control {
    display: flex;
    width: 100%;
    margin: 0.5rem 0;
    box-sizing: border-box;

    &.cols {
      .billing-address-form--input {
        flex: 0 0 50%;
        max-width: 50%;
      }

      .billing-address-form--input:last-child {
        padding-left: 0.5rem;
      }

      .billing-address-form--input:first-child {
        padding-right: 0.5rem;
      }
    }
  }

  .billing-address-form {
    padding: 0 1rem 1rem;

    :global(.filled:not(.input-radio) label),
    :global(.input-label) {
      transform: scale(0.86) translateY(-30px);
    }

    :global(#billing-address-verification-country),
    :global(#billing-address-verification-state) {
      text-overflow: ellipsis;
      width: 100%;
      padding-right: 1.5rem;
      box-sizing: border-box;
    }

    :global(.elem > i) {
      transform: rotate(-90deg) scale(0.5);
      top: 50%;
    }
  }

  :global(.redesign) {
    .billing-address-form {
      padding: 0 1rem;
    }

    .billing-address-form :global(.drop-down-icon-wrapper) {
      top: 8px;
    }

    .billing-address-form :global(.filled:not(.input-radio) label),
    .billing-address-form :global(.input-label) {
      transform: scale(0.86) translateY(4px);
      line-height: 1;
    }
  }
</style>
