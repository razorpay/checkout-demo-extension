const { openCheckout } = require('../../checkout');
const { makePreferences } = require('../../actions/preferences');
const { delay } = require('../../util');
const { handleFeeBearer } = require('../../actions/common');

describe.skip('Card tests', async () => {
  test('perform card transaction', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 200,
      personalization: false,
    };
    const preferences = makePreferences();
    const context = await openCheckout({ page, options, preferences });
    await page.type('[name=contact]', '9999988888');
    await page.type('[name=email]', 'pro@rzp.com');
    await page.click('[tab=card');

    await delay(200);
    const cardNum = await page.waitForSelector('#card_number');
    await cardNum.type('4111111111111111');
    await context.expectRequest();
    await context.respondJSON({
      recurring: false,
      iframe: true,
      http_status_code: 200,
    });
    const cardExp = await page.type('#card_expiry', '12/55');
    const cardName = await page.type('#card_name', 'Sakshi Jain');
    const cardCvv = await page.type('#card_cvv', '112');
    const payButton = await page.$('.pay-btn');
    await payButton.click();

    await context.expectRequest();
    await context.respondJSON({
      type: 'first',
      request: {
        url:
          'https://api.razorpay.com/v1/gateway/mocksharp/payment?key_id=rzp_test_1DP5mmOlF5G5ag&action=authorize&amount=5100&method=card&payment_id=DLXKaJEF1T1KxC&callback_url=https%3A%2F%2Fapi.razorpay.com%2Fv1%2Fpayments%2Fpay_DLXKaJEF1T1KxC%2Fcallback%2F10b9b52d2b5974f35acfec916f3785eab0c98325%2Frzp_test_1DP5mmOlF5G5ag&recurring=0&card_number=eyJpdiI6ImdnUm9BbnZucTRMU09VWiswMHQ1WFE9PSIsInZhbHVlIjoiSkpwZjJOd2htQlcza2dzYnNiRjJFb3ZqUlVaNGw4WEtLWDgyOVVxYnN4ST0iLCJtYWMiOiIxZDg2YTBlYWY3MGEyNzE5NWQ1NzNhNTRiMjc4ZTZhZTFlYTQxNDUyNWU1NjkzOTNlYTEzYjljZmM0YWY1NGIyIn0%3D&encrypt=1',
        method: 'get',
        content: [],
      },
      payment_id: 'pay_DLXKaJEF1T1KxC',
      amount: '\u20b9 51',
      image: 'https://cdn.razorpay.com/logos/D3JjREAG8erHB7_medium.jpg',
    });
    const popup = context.popup();

    const popupPage = await popup.page();
    const failButton = await popupPage.$('.danger');
    await failButton.click();
    await delay(200);
    const errorMessage = await page.$('#fd-t');
    const text = await page.evaluate(
      errorMessage => errorMessage.textContent,
      errorMessage
    );
    expect(text).toEqual('The payment has already been processed');
    const retryButton = await page.$('#fd-hide');
    await retryButton.click();
    await delay(500);
    await payButton.click();

    await context.expectRequest();
    await context.respondJSON({
      type: 'first',
      request: {
        url:
          'https://api.razorpay.com/v1/gateway/mocksharp/payment?key_id=rzp_test_1DP5mmOlF5G5ag&action=authorize&amount=5100&method=card&payment_id=DLXKaJEF1T1KxC&callback_url=https%3A%2F%2Fapi.razorpay.com%2Fv1%2Fpayments%2Fpay_DLXKaJEF1T1KxC%2Fcallback%2F10b9b52d2b5974f35acfec916f3785eab0c98325%2Frzp_test_1DP5mmOlF5G5ag&recurring=0&card_number=eyJpdiI6ImdnUm9BbnZucTRMU09VWiswMHQ1WFE9PSIsInZhbHVlIjoiSkpwZjJOd2htQlcza2dzYnNiRjJFb3ZqUlVaNGw4WEtLWDgyOVVxYnN4ST0iLCJtYWMiOiIxZDg2YTBlYWY3MGEyNzE5NWQ1NzNhNTRiMjc4ZTZhZTFlYTQxNDUyNWU1NjkzOTNlYTEzYjljZmM0YWY1NGIyIn0%3D&encrypt=1',
        method: 'get',
        content: [],
      },
      payment_id: 'pay_DLXKaJEF1T1KxC',
      amount: '\u20b9 51',
      image: 'https://cdn.razorpay.com/logos/D3JjREAG8erHB7_medium.jpg',
      magic: false,
    });
    const popupNew = context.popup();

    const popupPageNew = await popupNew.page();
    const passButton = await popupPageNew.$('.success');
    await passButton.click();
  });

  test('perform card transaction with fee bearer', async () => {
    const page = await browser.newPage();
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 200,
      personalization: false,
    };
    const preferences = makePreferences({ fee_bearer: true });
    const context = await openCheckout({ page, options, preferences });
    await page.type('[name=contact]', '9999988888');
    await page.type('[name=email]', 'pro@rzp.com');
    const cardButton = await page.waitForSelector('div[tab="card"');
    await cardButton.click();

    await delay(1500);
    const cardNum = await page.waitForSelector('#card_number');
    await cardNum.type('4111111111111111');
    await context.expectRequest();
    await context.respondJSON({
      recurring: false,
      iframe: true,
      http_status_code: 200,
    });
    const cardExp = await page.waitForSelector('#card_expiry');
    await cardExp.type('12/55');
    const cardName = await page.waitForSelector('#card_name');
    await cardName.type('Sakshi Jain');
    const cardCvv = await page.waitForSelector('#card_cvv');
    await cardCvv.type('112');
    const payButton = await page.waitForSelector('.pay-btn');
    await payButton.click();
    await handleFeeBearer(context, page);

    await context.expectRequest();
    await context.respondJSON({
      type: 'first',
      request: {
        url:
          'https://api.razorpay.com/v1/gateway/mocksharp/payment?key_id=rzp_test_1DP5mmOlF5G5ag&action=authorize&amount=5100&method=card&payment_id=DLXKaJEF1T1KxC&callback_url=https%3A%2F%2Fapi.razorpay.com%2Fv1%2Fpayments%2Fpay_DLXKaJEF1T1KxC%2Fcallback%2F10b9b52d2b5974f35acfec916f3785eab0c98325%2Frzp_test_1DP5mmOlF5G5ag&recurring=0&card_number=eyJpdiI6ImdnUm9BbnZucTRMU09VWiswMHQ1WFE9PSIsInZhbHVlIjoiSkpwZjJOd2htQlcza2dzYnNiRjJFb3ZqUlVaNGw4WEtLWDgyOVVxYnN4ST0iLCJtYWMiOiIxZDg2YTBlYWY3MGEyNzE5NWQ1NzNhNTRiMjc4ZTZhZTFlYTQxNDUyNWU1NjkzOTNlYTEzYjljZmM0YWY1NGIyIn0%3D&encrypt=1',
        method: 'get',
        content: [],
      },
      payment_id: 'pay_DLXKaJEF1T1KxC',
      amount: '\u20b9 51',
      image: 'https://cdn.razorpay.com/logos/D3JjREAG8erHB7_medium.jpg',
    });
    await delay(1500);
    const popup = context.popup();

    const popupPage = await popup.page();
    const failButton = await popupPage.$('.danger');
    await failButton.click();
    await delay(1500);
    const errorMessage = await page.$('#fd-t');
    const text = await page.evaluate(
      errorMessage => errorMessage.textContent,
      errorMessage
    );
    expect(text).toEqual('The payment has already been processed');
    const retryButton = await page.$('#fd-hide');
    await retryButton.click();
    await delay(500);
    await payButton.click();
    await handleFeeBearer(context, page);

    await context.expectRequest();
    await context.respondJSON({
      type: 'first',
      request: {
        url:
          'https://api.razorpay.com/v1/gateway/mocksharp/payment?key_id=rzp_test_1DP5mmOlF5G5ag&action=authorize&amount=5100&method=card&payment_id=DLXKaJEF1T1KxC&callback_url=https%3A%2F%2Fapi.razorpay.com%2Fv1%2Fpayments%2Fpay_DLXKaJEF1T1KxC%2Fcallback%2F10b9b52d2b5974f35acfec916f3785eab0c98325%2Frzp_test_1DP5mmOlF5G5ag&recurring=0&card_number=eyJpdiI6ImdnUm9BbnZucTRMU09VWiswMHQ1WFE9PSIsInZhbHVlIjoiSkpwZjJOd2htQlcza2dzYnNiRjJFb3ZqUlVaNGw4WEtLWDgyOVVxYnN4ST0iLCJtYWMiOiIxZDg2YTBlYWY3MGEyNzE5NWQ1NzNhNTRiMjc4ZTZhZTFlYTQxNDUyNWU1NjkzOTNlYTEzYjljZmM0YWY1NGIyIn0%3D&encrypt=1',
        method: 'get',
        content: [],
      },
      payment_id: 'pay_DLXKaJEF1T1KxC',
      amount: '\u20b9 51',
      image: 'https://cdn.razorpay.com/logos/D3JjREAG8erHB7_medium.jpg',
    });
    await delay(1500);
    const popupNew = context.popup();

    const popupPageNew = await popupNew.page();
    const passButton = await popupPageNew.$('.success');
    await passButton.click();
  });
  test('perform card transaction with partial payments', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 20000,
      personalization: false,
    };
    const preferences = makePreferences({
      order: {
        amount: 20000,
        amount_due: 20000,
        amount_paid: 0,
        currency: 'INR',
        first_payment_min_amount: null,
        partial_payment: true,
      },
    });
    const context = await openCheckout({ page, options, preferences });
    await page.type('[name=contact]', '9999988888');
    await page.type('[name=email]', 'pro@rzp.com');

    const makePartialCheckBox = await page.waitForSelector('.checkbox');
    await makePartialCheckBox.click();
    const amountValue = await page.waitForSelector('#amount-value');
    await amountValue.type('100');
    const nextButton = await page.waitForSelector('#next-button');
    await nextButton.click();
    await delay(500);
    const cardButton = await page.waitForSelector('div[tab="card"');
    await cardButton.click();

    await delay(1500);
    const cardNum = await page.waitForSelector('#card_number');
    await cardNum.type('4111111111111111');
    await context.expectRequest();
    await context.respondJSON({
      recurring: false,
      iframe: true,
      http_status_code: 200,
    });
    const cardExp = await page.waitForSelector('#card_expiry');
    await cardExp.type('12/55');
    const cardName = await page.waitForSelector('#card_name');
    await cardName.type('Sakshi Jain');
    const cardCvv = await page.waitForSelector('#card_cvv');
    await cardCvv.type('112');
    const otpField = await page.waitForSelector('#otp');
    await otpField.type('5555');
    const orignalAmount = await page.waitForSelector('.original-amount');
    const otpAmount = await page.evaluate(
      orignalAmount => orignalAmount.textContent,
      orignalAmount
    );
    expect(otpAmount).toEqual('₹ 100');
    const payButton = await page.waitForSelector('.pay-btn');
    await payButton.click();

    await context.expectRequest();
    await context.respondJSON({
      type: 'first',
      request: {
        url:
          'https://api.razorpay.com/v1/gateway/mocksharp/payment?key_id=rzp_test_1DP5mmOlF5G5ag&action=authorize&amount=5100&method=card&payment_id=DLXKaJEF1T1KxC&callback_url=https%3A%2F%2Fapi.razorpay.com%2Fv1%2Fpayments%2Fpay_DLXKaJEF1T1KxC%2Fcallback%2F10b9b52d2b5974f35acfec916f3785eab0c98325%2Frzp_test_1DP5mmOlF5G5ag&recurring=0&card_number=eyJpdiI6ImdnUm9BbnZucTRMU09VWiswMHQ1WFE9PSIsInZhbHVlIjoiSkpwZjJOd2htQlcza2dzYnNiRjJFb3ZqUlVaNGw4WEtLWDgyOVVxYnN4ST0iLCJtYWMiOiIxZDg2YTBlYWY3MGEyNzE5NWQ1NzNhNTRiMjc4ZTZhZTFlYTQxNDUyNWU1NjkzOTNlYTEzYjljZmM0YWY1NGIyIn0%3D&encrypt=1',
        method: 'get',
        content: [],
      },
      payment_id: 'pay_DLXKaJEF1T1KxC',
      amount: '\u20b9 51',
      image: 'https://cdn.razorpay.com/logos/D3JjREAG8erHB7_medium.jpg',
    });
    await delay(1500);
    const popup = context.popup();

    const popupPage = await popup.page();
    const failButton = await popupPage.$('.danger');
    await failButton.click();
    await delay(1500);
    const errorMessage = await page.$('#fd-t');
    const text = await page.evaluate(
      errorMessage => errorMessage.textContent,
      errorMessage
    );
    expect(text).toEqual('The payment has already been processed');
    const retryButton = await page.$('#fd-hide');
    await retryButton.click();
    await delay(500);
    await payButton.click();

    await context.expectRequest();
    await context.respondJSON({
      type: 'first',
      request: {
        url:
          'https://api.razorpay.com/v1/gateway/mocksharp/payment?key_id=rzp_test_1DP5mmOlF5G5ag&action=authorize&amount=5100&method=card&payment_id=DLXKaJEF1T1KxC&callback_url=https%3A%2F%2Fapi.razorpay.com%2Fv1%2Fpayments%2Fpay_DLXKaJEF1T1KxC%2Fcallback%2F10b9b52d2b5974f35acfec916f3785eab0c98325%2Frzp_test_1DP5mmOlF5G5ag&recurring=0&card_number=eyJpdiI6ImdnUm9BbnZucTRMU09VWiswMHQ1WFE9PSIsInZhbHVlIjoiSkpwZjJOd2htQlcza2dzYnNiRjJFb3ZqUlVaNGw4WEtLWDgyOVVxYnN4ST0iLCJtYWMiOiIxZDg2YTBlYWY3MGEyNzE5NWQ1NzNhNTRiMjc4ZTZhZTFlYTQxNDUyNWU1NjkzOTNlYTEzYjljZmM0YWY1NGIyIn0%3D&encrypt=1',
        method: 'get',
        content: [],
      },
      payment_id: 'pay_DLXKaJEF1T1KxC',
      amount: '\u20b9 51',
      image: 'https://cdn.razorpay.com/logos/D3JjREAG8erHB7_medium.jpg',
    });
    await delay(1500);
    const popupNew = context.popup();

    const popupPageNew = await popupNew.page();
    const passButton = await popupPageNew.$('.success');
    await passButton.click();
  });
});
