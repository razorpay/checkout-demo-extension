import { render } from '@testing-library/svelte';

import labels from 'cta/i18n/en';
import CtaButton from 'one_click_checkout/cta/button.svelte';

describe('CTA Button tests', () => {
  test('it should render without passing props', () => {
    const button = render(CtaButton);
    const node = button.getByText(labels.label);

    expect(node).toBeInTheDocument();
    expect(node.textContent).toBe(labels.label);
  });

  test('cta enabled: it should trigger on click listener', () => {
    const clickHandler = jest.fn();
    const button = render(CtaButton);
    button.component.$on('click', clickHandler);

    const node = button.getByText(labels.label);
    node.click();

    expect(clickHandler).toHaveBeenCalled();
  });

  test('cta disabled, handleDisable true: it should trigger on click listener', () => {
    const clickHandler = jest.fn();
    const button = render(CtaButton, {
      props: {
        disabled: true,
        handleDisable: true,
      },
    });
    button.component.$on('click', clickHandler);

    const node = button.getByText(labels.label);
    node.click();

    expect(clickHandler).toHaveBeenCalled();
  });

  test('cta disabled, handleDisable false: it should not trigger on click listener', () => {
    const clickHandler = jest.fn();
    const button = render(CtaButton, {
      props: {
        disabled: true,
      },
    });
    button.component.$on('click', clickHandler);

    const node = button.getByText(labels.label);
    node.click();

    expect(clickHandler).not.toHaveBeenCalled();
  });
});
