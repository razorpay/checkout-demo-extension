import { render } from '@testing-library/svelte';
import AddressBox from 'one_click_checkout/address/ui/components/AddressBox.svelte';

const address = {
  name: "Amitabh Bachchan",
  type: "shipping_address",
  line1: "1042, Prestige Sunnyside Oak,",
  line2: "Mahadevapura, 2nd Main Road, Guttahalli",
  zipcode: "560001",
  city: "Bengaluru",
  state: "Karnataka",
  tag: "test",
  landmark: "",
  country: "in",
  contact: "+916378879437",
  source_type: null,
  serviceability: false,
  formattedLine1: "1042, Prestige Sunnyside Oak",
  formattedLine2: "Mahadevapura, 2nd Main Road, Guttahalli",
  formattedLine3: "Bengaluru, Karnataka, India, 560001",
  id: "KEHPE7QYWrZwWB"
};

describe('AddressBox', () => {
  it('Should not show anything if loading', () => {
    const { queryByText } = render(AddressBox, {
      loading: true,
      address,
    });
    expect(queryByText('Amitabh Bachchan')).not.toBeInTheDocument();
  });

  it('Should not show edit icon if not editable', () => {
    const { queryByTestId } = render(AddressBox, {
      isEditable: false,
      loading: false,
      address,
    });
    expect(queryByTestId('address-edit-cta')).not.toBeInTheDocument();
  });

  it('Should show the corresponding address tag', () => {
    const { getByText } = render(AddressBox, {
      address,
    });
    expect(getByText('Others')).toBeInTheDocument();
  });

  it('Should callout unserviceability correctly unserviceable address', () => {
    const { getByText } = render(AddressBox, {
      address,
    });
    expect(getByText('This order cannot be delivered to this location.')).toBeInTheDocument();
  });

  it('Should not say unserviceable for serviceable address', () => {
    const { queryByTestId } = render(AddressBox, {
      address: { ...address, serviceability: true },
    });
    expect(queryByTestId('address-box-unserviceability')).not.toBeInTheDocument();
  });
});