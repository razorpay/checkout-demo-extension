import OptionTestComponent from './option-test.test.svelte';
import { render, fireEvent, screen } from '@testing-library/svelte';

describe('Option Svelte Component', () => {
  it('should be rendered properly', async () => {
    const { queryByText } = render(OptionTestComponent, {
      withRow: false,
    });
    expect(queryByText('row slot data')).not.toBeInTheDocument();
  });
  it('should render row slot only on withRow Prop', async () => {
    const { getByText } = render(OptionTestComponent, {
      props: {
        withRow: true,
      },
    });
    expect(getByText('row slot data')).toBeInTheDocument();
  });
});
