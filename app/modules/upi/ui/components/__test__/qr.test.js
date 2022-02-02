import { tick } from 'svelte';
import { render, fireEvent } from '@testing-library/svelte';
import { qrUrl, timer } from 'upi/store/qr';
import UPIQR from '../qr.svelte';

describe('UPI-QR ', () => {
  const response = {
    id: 'qr_Il7gw9B44g4syD',
    image_content:
      'upi://pay?ver=01&mode=15&pa=rpy.qrtestrazorp39589201@icici&pn=TestRazorpay&tr=RZPIl7gw9B44g4syDqrv2&tn=PaymenttoTestRazorpay&cu=INR&mc=8062&qrMedium=04&am=1',
  };
  beforeEach(() => {
    global.fetch.post = jest.fn(({ callback }) => {
      callback(response);
    });

    setTimeout(() => {
      global.fetch = jest.fn();
    }, 400);

    jest.resetAllMocks();
  });

  it('should be rendered', async () => {
    const result = render(UPIQR);
    expect(result).toBeTruthy();
  });

  test('Loader/Generating QR Code...', () => {
    const { getByText, container } = render(UPIQR);
    expect(container.querySelector('.async-loading')).toBeInTheDocument();
    expect(getByText('Generating QR Code...')).toBeInTheDocument();
  });

  test('QR ELEMENTS ', () => {
    timer.set(900);
    qrUrl.set(response.image_content);
    const { getByText, container } = render(UPIQR);
    expect(container.querySelector('.qr-container')).toBeInTheDocument();
    expect(container.querySelector('.qr-image')).toBeInTheDocument();
    expect(
      getByText(
        'Scan the QR using any UPI app on your phone like BHIM, PhonePe, Google Pay etc.'
      )
    ).toBeInTheDocument();
    expect(container.querySelector('.timer')).toBeInTheDocument();
    expect(container.querySelector('.button-text')).not.toBeInTheDocument();
    expect(container.querySelector('.qr-overlay')).not.toBeInTheDocument();
  });
  test('QR EXPIRED', () => {
    timer.set(0);
    const { getByText, container } = render(UPIQR);
    expect(container.querySelector('.qr-overlay')).toBeInTheDocument();
    expect(container.querySelector('.timer')).not.toBeInTheDocument();
    expect(container.querySelector('.button-text')).toBeInTheDocument();
    expect(getByText('Previous QR code got expired')).toBeInTheDocument();
  });

  test('GENERATE NEW QR', async () => {
    var { component, container, getByText } = render(UPIQR);
    const onClick = jest.fn();
    // assign click event to component
    component.$on('click', onClick);
    const generate = container.querySelector('.button-text');
    expect(generate).toBeInTheDocument();
    expect(generate).not.toBeNull();
    timer.set(0);
    await fireEvent.click(generate);
    timer.set(900);
    qrUrl.set(response.image_content);
    var { component, container, getByText } = render(UPIQR);
    expect(container.querySelector('.qr-container')).toBeInTheDocument();
    expect(container.querySelector('.qr-image')).toBeInTheDocument();
    expect(
      getByText(
        'Scan the QR using any UPI app on your phone like BHIM, PhonePe, Google Pay etc.'
      )
    ).toBeInTheDocument();
    expect(container.querySelector('.timer')).toBeInTheDocument();
    expect(container.querySelector('.button-text')).not.toBeInTheDocument();
    expect(container.querySelector('.qr-overlay')).not.toBeInTheDocument();
  });

  test('TIMER SHOULD UPDATE AFTER EACH SECOND', async () => {
    jest.useFakeTimers();
    timer.set(70);
    qrUrl.set('dummy url');
    await tick();

    const { getByTestId, queryByTestId } = render(UPIQR);
    const expectedMessage = (left) =>
      `This QR Code is valid for ${left} minutes`;

    expect(getByTestId('timer-text')).toHaveTextContent(
      expectedMessage('1: 10')
    );

    jest.advanceTimersByTime(1000);
    await tick();
    expect(getByTestId('timer-text')).toHaveTextContent(
      expectedMessage('1: 09')
    );

    jest.advanceTimersByTime(1000);
    await tick();
    expect(getByTestId('timer-text')).toHaveTextContent(
      expectedMessage('1: 08')
    );

    // complete timer to finish
    jest.advanceTimersByTime(68 * 1000);
    await tick();
    expect(queryByTestId('timer-text')).not.toBeInTheDocument();
    expect(getByTestId('qr-expiry-message')).toHaveTextContent(
      'Previous QR code got expired'
    );
  });
});
