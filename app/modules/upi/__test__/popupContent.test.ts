import popupContent from 'upi/helper/popupContent';

describe('Popup Content for the iOS Safari deeplink', () => {
  it('should have the passed in the callBackName for events', async () => {
    expect(popupContent('fromPopup')).toContain('window.opener.fromPopup');
  });
  it('should have the blur event callback to parent with passed callback', async () => {
    expect(popupContent('fromPopup')).toContain(
      `window.opener.fromPopup('blur',`
    );
  });
  it('should have the focus event callback to parent with passed callback', async () => {
    expect(popupContent('fromPopup')).toContain(
      `window.opener.fromPopup('focus',`
    );
  });
  it('should have the beforeunload event callback to parent with passed callback', async () => {
    expect(popupContent('fromPopup')).toContain(
      `window.opener.fromPopup('beforeunload',`
    );
  });
  it('should have the button to goBack to payment page ', async () => {
    expect(popupContent('fromPopup')).toContain(`id="goBack"`);
  });
});
