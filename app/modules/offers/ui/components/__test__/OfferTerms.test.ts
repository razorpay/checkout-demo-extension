import { render } from '@testing-library/svelte';
import OffersTermsSvelte from 'offers/ui/components/OffersTerms.svelte';

const sampleOffer: Offers.OfferItem = {
  id: 'offer_Jf1deiENY5fdlb',
  name: 'instant offer',
  payment_method: 'card',
  display_text: '10% off card',
  type: 'instant',
  original_amount: 100000,
  amount: 90000,
  terms: 'Offers terms and conditions',
};

describe('Validate Offer Terms', () => {
  test('Should render Terms and condtions if present', async () => {
    const result = render(OffersTermsSvelte, {
      offer: sampleOffer,
    });
    expect(result).toBeTruthy();
    expect(result.queryByText('Terms and Conditions')).toBeInTheDocument();
  });

  test('Should not render Terms and condtions if not present', () => {
    delete sampleOffer.terms;
    const result = render(OffersTermsSvelte, {
      offer: sampleOffer,
    });
    expect(result.queryByText('Terms and Conditions')).not.toBeInTheDocument();
  });
});
