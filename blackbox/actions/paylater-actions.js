async function verifyPayLaterPaymentMode(context) {
  const messageDiv = await context.page.waitForSelector(
    '[data-paylater="epaylater"]'
  );
  let messageText = await context.page.evaluate(
    messageDiv => messageDiv.textContent,
    messageDiv
  );
  messageText = messageText.trim();
  expect(messageText).toEqual('ePayLater');
}

async function selectPayLaterPaymentMode(context) {
  const paylater = await context.page.waitForSelector(
    '[data-paylater="epaylater"]'
  );
  await paylater.click();
}

async function verifyPayLaterOTP(context) {
  const req = await context.expectRequest();
  expect(req.url).toContain('otp/verify');
  await context.respondJSON({
    ott: '3007d85081c8fb',
    success: 1,
  });
}

module.exports = {
  verifyPayLaterPaymentMode,
  selectPayLaterPaymentMode,
  verifyPayLaterOTP,
};
