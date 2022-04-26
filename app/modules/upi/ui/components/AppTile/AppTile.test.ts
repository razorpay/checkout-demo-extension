import { fireEvent } from '@testing-library/dom';
import { render } from '@testing-library/svelte';
import { AppTile } from '.';

const app = {
  package_name: 'com.phonepe.app',
  app_icon: 'https://cdn.razorpay.com/checkout/phonepe.png',
  shortcode: 'phonepe',
  app_name: 'PhonePe',
  handles: ['ybl'],
};
const spyOnConsoleLog = jest.spyOn((global as any).console, 'log');

describe('App tile', () => {
  it('should be rendered', async () => {
    const result = render(AppTile, {
      selected: false,
      variant: 'square',
      app,
      onClick: console.log,
    });
    expect(result).toBeTruthy();
  });
  it('should be rendered as expected for square variant', async () => {
    const result = render(AppTile, {
      selected: true,
      variant: 'square',
      app,
      onClick: console.log,
    });
    expect(result).toBeTruthy();
    expect(result.queryByText(app.app_name)).toBeInTheDocument();
  });
  it('should be rendered as expected for circle variant', async () => {
    const result = render(AppTile, {
      selected: true,
      variant: 'circle',
      app,
      onClick: console.log,
    });
    expect(result).toBeTruthy();
    expect(result.queryByText(app.app_name)).not.toBeInTheDocument();
  });
  it('on click should be working as expected', async () => {
    const result = render(AppTile, {
      selected: true,
      variant: 'circle',
      app,
      onClick: console.log,
    });
    expect(result).toBeTruthy();
    expect(result.queryByText(app.app_name)).not.toBeInTheDocument();
    fireEvent.click(result.getByTestId('app-tile'));
    expect(spyOnConsoleLog).toBeCalled();
  });
});
