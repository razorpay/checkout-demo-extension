import { render } from '@testing-library/svelte';
import Analytics from 'analytics';

// component
import BillingAddressVerificationForm from '../BillingAddressVerificationForm.svelte';

// constants
import { FORM_TYPE } from '../types';
import { FORM_FIELDS_TYPE_MAPPING } from '../constants';

const razorpayInstance = {
  id: 'id',
  key: 'rzp_test_key',
  get: (arg: unknown) => arg,
  getMode: () => 'test',
};

jest.mock('sessionmanager', () => {
  return {
    getSession: () => ({
      get: jest.fn(),
      r: razorpayInstance,
    }),
  };
});

describe('Test BillingAddressVerificationForm', () => {
  beforeAll(() => {
    Analytics.setR(razorpayInstance);
  });
  it('should render without breaking', () => {
    const { component } = render(BillingAddressVerificationForm);
    expect(component).toBeTruthy();
  });
  it('should render input fields for AVS', () => {
    const { container } = render(BillingAddressVerificationForm);
    expect(container.querySelectorAll('input[type="text"]')).toHaveLength(6);
    FORM_FIELDS_TYPE_MAPPING[FORM_TYPE.AVS].forEach((field) => {
      if (Array.isArray(field)) {
        field.forEach((subField) => {
          expect(
            container.querySelector(
              `input[name="billing-address-verification-${subField}"]`
            )
          ).toBeTruthy();
        });
      } else {
        expect(
          container.querySelector(
            `input[name="billing-address-verification-${field}"]`
          )
        ).toBeTruthy();
      }
    });
  });
  it('should render input fields for N_AVS', () => {
    const { container } = render(BillingAddressVerificationForm, {
      props: {
        formType: FORM_TYPE.N_AVS,
      },
    });
    expect(container.querySelectorAll('input[type="text"]')).toHaveLength(8);
    FORM_FIELDS_TYPE_MAPPING[FORM_TYPE.N_AVS].forEach((field) => {
      if (Array.isArray(field)) {
        field.forEach((subField) => {
          expect(
            container.querySelector(
              `input[name="billing-address-verification-${subField}"]`
            )
          ).toBeTruthy();
        });
      } else {
        expect(
          container.querySelector(
            `input[name="billing-address-verification-${field}"]`
          )
        ).toBeTruthy();
      }
    });
  });
  it('should have default billing address', () => {
    const defaultValue: { [x in string]: string } = {
      line1: '123 Main St',
      line2: 'Apt 1',
      city: 'San Francisco',
      postal_code: '94107',
      country: 'US',
      state: 'CA',
    };

    const { container } = render(BillingAddressVerificationForm, {
      props: {
        value: defaultValue,
      },
    });

    FORM_FIELDS_TYPE_MAPPING[FORM_TYPE.AVS].forEach((field) => {
      if (Array.isArray(field)) {
        field.forEach((subField) => {
          const el = container.querySelector(
            `input[name="billing-address-verification-${subField}"]`
          ) as HTMLInputElement;
          expect(el?.value).toEqual(defaultValue[subField]);
        });
      } else {
        const el = container.querySelector(
          `input[name="billing-address-verification-${field}"]`
        ) as HTMLInputElement;
        expect(el?.value).toEqual(defaultValue[field]);
      }
    });
  });
});
