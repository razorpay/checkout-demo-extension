import GridItem from 'ui/tabs/netbanking/GridItem.svelte';
import { render } from '@testing-library/svelte';

describe('GridItem.svelte', () => {
  it('should contain name as HDFC', () => {
    const { getByText } = render(GridItem, {
      props: {
        name: 'HDFC',
      },
    });
    expect(getByText('HDFC')).toBeInTheDocument();
  });
  it('should contain downtime warning for SBI bank', () => {
    const { getByText } = render(GridItem, {
      props: {
        fullName: 'State Bank of India',
        disabled: true,
      },
    });
    expect(
      getByText(
        'State Bank of India accounts are facing temporary issues right now. Please select another bank.'
      )
    ).toBeInTheDocument();
  });
});
