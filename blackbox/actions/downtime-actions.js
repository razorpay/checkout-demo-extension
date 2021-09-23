async function verifyMethodWarned(context, method, instrumentKey, instrument) {
  const downtime = context.preferences.payment_downtime.items.filter(
    (item) => item.method === method
  )[0];
  const downtimeSeverity = downtime.severity;
  if (!instrument) {
    instrument = downtime.instrument[instrumentKey];
  }
  let selector = `.downtime-${downtimeSeverity}`;
  const warningDiv = await context.page.waitForSelector(selector);
  const warningText = await context.page.evaluate(
    (warningDiv) => warningDiv.textContent,
    warningDiv
  );
  expect(warningText.toLowerCase()).toContain(instrument.toLowerCase());
}

async function downtimeHighAlert(context) {
  let selector = '#downtime-wrap';
  const alertDiv = await context.page.waitForSelector(selector);
  const alertText = await context.page.evaluate(
    (alertDiv) => alertDiv.textContent,
    alertDiv
  );
  expect(alertText.toLowerCase()).toContain(
    'there is a high chance this payment might fail'
  );
  const continuePromise = context.page.click('.continue-button');

  if (context.options.redirect) {
    await delay(600);
  } else {
    await continuePromise;
  }
}

module.exports = {
  verifyMethodWarned,
  downtimeHighAlert,
};
