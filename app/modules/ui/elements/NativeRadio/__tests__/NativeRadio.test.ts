import {
  render,
  cleanup,
  waitFor,
  fireEvent,
  screen,
} from '@testing-library/svelte';

// component
import NativeRadio from '../NativeRadio.svelte';

describe('Test NativeRadio component', () => {
  afterEach(cleanup);

  test('Should render radio button without breaking', () => {
    render(NativeRadio);
    expect(screen.getByRole('radio')).toBeInTheDocument();
  });

  test('Should render the label on right side of radio', () => {
    const { container } = render(NativeRadio, { label: 'Bank Transfer' });
    expect(screen.getByText('Bank Transfer')).toBeInTheDocument();
    expect(
      container.querySelector(
        'input[type="radio"] ~ .native-radio-control--label'
      )
    ).toBeDefined();
  });

  test('Should add custom class on root element', () => {
    const { container } = render(NativeRadio, { classes: 'custom-class' });
    expect(container.querySelector('.custom-class')).toBeDefined();
  });

  test('Should accept name, id, checked and tabIndex attributes', () => {
    const { container } = render(NativeRadio, {
      name: 'name',
      id: '1',
      checked: true,
      tabIndex: 1,
    });
    expect(container.querySelector('input[type="radio"]')).toBeDefined();
  });

  test('Should be clickable', async () => {
    const props = { checked: false };
    const callback = jest.fn();
    const { component } = render(NativeRadio, props);
    component.$on('change', callback);
    await fireEvent.click(screen.getByRole('radio'));
    expect(callback).toHaveBeenCalled();
  });
});
