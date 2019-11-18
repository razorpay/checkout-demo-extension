const { readFileSync } = require('fs');
const callbackLocation = __dirname + '/../fixtures/callback.html';
const callbackTemplate = String(readFileSync(callbackLocation));

function callbackHtml(paymentResult) {
  return callbackTemplate.replace(
    '// Callback data //',
    JSON.stringify(paymentResult)
  );
}

async function callbackPage(context, response) {
  const req = await context.expectRequest();
  expect(req.raw.isNavigationRequest()).toBe(true);
  expect(req.method).toBe('POST');
  await context.respondHTML(callbackHtml(response));
}

module.exports = {
  callbackPage,
  callbackHtml,
};
