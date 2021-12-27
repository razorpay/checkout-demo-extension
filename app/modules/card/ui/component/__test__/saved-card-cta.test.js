import SavedCardCTA from '../saved-card-cta.svelte';

import { render, fireEvent } from '@testing-library/svelte';

jest.mock('sessionmanager', () => ({
  getSession: () => ({
    themeMeta: {
      icons: {
        saved_card: '',
      },
    },
  }),
}));

describe('Saved Card CTA', () => {
  it('should be rendered', async () => {
    const result = render(SavedCardCTA);
    expect(result).toBeTruthy();
  });

  test('Logged Out User', () => {
    const { getByText } = render(SavedCardCTA, { showSubTitle: true });
    expect(getByText('Pay With Your Saved Card')).toBeInTheDocument();
    expect(getByText('Access securely with OTP')).toBeInTheDocument();
  });
  test('Logged In User', () => {
    const { getByText, container } = render(SavedCardCTA, {
      showSubTitle: false,
    });
    expect(getByText('Pay With Your Saved Card')).toBeInTheDocument();
    expect(
      container.querySelector('.saved-text-subtitle')
    ).not.toBeInTheDocument();
  });

  test('Click Action', async () => {
    const { component, container } = render(SavedCardCTA, {
      showSubTitle: false,
    });
    const onClick = jest.fn();
    // assign click event to component
    component.$on('click', onClick);
    const CTA = container.querySelector('.saved-card-cta');
    expect(CTA).not.toBeNull();
    await fireEvent.click(CTA);
    expect(container).toBeInTheDocument();
    expect(onClick.mock.calls.length).toEqual(1);
  });
});
