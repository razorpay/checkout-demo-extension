import Toast from 'one_click_checkout/Toast/ui/Toast.svelte';
import { render, act } from '@testing-library/svelte';

describe('Toast', () => {
  it('should not show anything if shown is false', () => {
    const { component, queryByTestId } = render(Toast, {
      shown: false,
    });
    expect(queryByTestId('toast-success')).not.toBeInTheDocument();
  });
  it('toast-success element should be present', async () => {
    const { component, getByTestId } = render(Toast);
    const option = {
      message: 'Toast UT',
      theme: 'success',
    };
    await act(() => component.show(option));
    expect(getByTestId('toast-success')).toBeInTheDocument();
  });
  it('toast should have the same message', async () => {
    const { component, queryByText } = render(Toast);
    const option = {
      message: 'Toast UT',
      theme: 'success',
    };
    await act(() => component.show(option));
    expect(queryByText('Toast UT')).toBeInTheDocument();
  });
  it('toast should be removed after calling hide method', async () => {
    const { component, queryByText } = render(Toast);
    expect(queryByText('Toast UT')).not.toBeInTheDocument();
    const option = {
      message: 'Toast UT',
      theme: 'success',
    };
    await act(() => component.show(option));
    expect(queryByText('Toast UT')).toBeInTheDocument();
    expect(component.isVisible()).toBeTruthy();
    await act(() => component.hide());
    expect(component.isVisible()).toBeFalsy();
  });
});
