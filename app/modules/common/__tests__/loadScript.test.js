import loadScript from '../loadScript';

describe('Test loadScript', () => {
  test('Should load the script without breaking', () => {
    const scriptTag = document.createElement('script');
    jest.spyOn(document, 'createElement').mockReturnValue(scriptTag);

    expect(loadScript('http://localhost.success')).resolves.toBeTruthy();

    // simulate load script success
    const loadEvent = new CustomEvent('load');
    scriptTag.dispatchEvent(loadEvent);
  });
  test('Should throw error if failed to load script', () => {
    const scriptTag = document.createElement('script');
    jest.spyOn(document, 'createElement').mockReturnValue(scriptTag);

    expect(loadScript('http://localhost.failure')).rejects.toBeTruthy();

    // simulate load script failure
    const errorEvent = new CustomEvent('error');
    scriptTag.dispatchEvent(errorEvent);
  });
});
