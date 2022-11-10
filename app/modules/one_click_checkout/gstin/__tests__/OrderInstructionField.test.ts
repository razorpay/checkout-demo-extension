import { render, fireEvent } from '@testing-library/svelte';
import OrderInstructionField from 'one_click_checkout/gstin/ui/OrderInstructionField.svelte';
import gstinLables from 'one_click_checkout/gstin/i18n/en';
import { setupPreferences } from 'tests/setupPreferences';
import { ORDER_INSTRUCTION } from 'one_click_checkout/gstin/constants';

const {
  optional: OPTIONAL,
  order_instructions_label: ORDER_INSTRUCTIONS_LABEL,
} = gstinLables;

const razorpayInstance = {
  id: 'id',
  key: 'rzp_test_key',
  get: jest.fn(),
  getMode: jest.fn(),
};

const orderInsFieldProps = {
  value: '',
  error: '',
  handleInput: jest.fn(),
  handleBlur: jest.fn(),
};

describe('Order Instruction Field to capture Order Instruction', () => {
  beforeEach(() => {
    setupPreferences('loggedIn', razorpayInstance, {
      one_cc_capture_order_insturction: 'false',
    });
  });
  it('Should render Order Instruction CTA', () => {
    const { container } = render(OrderInstructionField, orderInsFieldProps);

    const toggleOrderInsCTA = container.querySelector(
      '[data-test-id=toggle-order-Ins-cta]'
    )?.textContent;

    expect(toggleOrderInsCTA).toContain(
      `+ ${ORDER_INSTRUCTIONS_LABEL} ${OPTIONAL}`
    );
  });

  it('Should render Order Instruction input on CTA click', async () => {
    const { getByText, container } = render(
      OrderInstructionField,
      orderInsFieldProps
    );
    const orderInsCTA = container.querySelector(
      '.order-instruction-label'
    ) as HTMLElement;

    await fireEvent.click(orderInsCTA);
    const orderInsField = container.querySelector(`#${ORDER_INSTRUCTION}`);

    expect(getByText(ORDER_INSTRUCTIONS_LABEL)).toBeInTheDocument();
    expect(orderInsField).toBeInTheDocument();
  });

  it('Should render Order Instruction input on typing the Field', async () => {
    const { getByText, container } = render(
      OrderInstructionField,
      orderInsFieldProps
    );
    const orderInsCTA = container.querySelector(
      '.order-instruction-label'
    ) as HTMLElement;

    await fireEvent.click(orderInsCTA);
    const orderInsField = container.querySelector(
      `#${ORDER_INSTRUCTION}`
    ) as HTMLElement;

    expect(orderInsField).toBeInTheDocument();
    await fireEvent.change(orderInsField, { target: { textContent: 'Salem' } });

    expect(getByText(ORDER_INSTRUCTIONS_LABEL)).toBeInTheDocument();
    expect(orderInsField.textContent).toBe('Salem');
  });
});
