import { appendLoader } from 'common/loader';

describe('Loader', () => {
  test('should check the append Loader without parent', () => {
    expect(appendLoader).not.toBeUndefined();
    const loaderElement: HTMLDivElement | undefined = appendLoader();
    const attribute = {
      class: 'razorpay-loader',
      style:
        'margin:-25px 0 0 -25px;height:50px;width:50px;animation:rzp-rot 1s infinite linear;-webkit-animation:rzp-rot 1s infinite linear;border: 1px solid rgba(255, 255, 255, 0.2);border-top-color: rgba(255, 255, 255, 0.7);border-radius: 50%;position:absolute;left:50%;top:50%;',
    };
    for (const property in attribute) {
      expect((loaderElement as HTMLDivElement).getAttribute(property)).toBe(
        attribute[property as keyof typeof attribute]
      );
    }
  });

  test('should check the append Loader without parent', () => {
    const modalEle = document.createElement('div');

    expect(appendLoader(document.body, modalEle, true)).not.toBeUndefined();
    const loaderElement: HTMLDivElement | undefined = appendLoader(
      document.body,
      modalEle,
      true
    );
    const attribute = {
      class: 'razorpay-loader',
      style:
        'margin:-25px 0 0 -25px;height:50px;width:50px;animation:rzp-rot 1s infinite linear;-webkit-animation:rzp-rot 1s infinite linear;border: 1px solid rgba(255, 255, 255, 0.2);border-top-color: rgba(255, 255, 255, 0.7);border-radius: 50%;margin: 100px auto -150px;border: 1px solid rgba(0, 0, 0, 0.2);border-top-color: rgba(0, 0, 0, 0.7);',
    };
    for (const property in attribute) {
      expect((loaderElement as HTMLDivElement).getAttribute(property)).toBe(
        attribute[property as keyof typeof attribute]
      );
    }
  });
});
