async function verifyMethodDisabled(context, method, message) {
  // if (context.preferences.offers && method !== 'upi') {
  //   const toolTip = await context.page.waitForSelector(
  //     '.callout.error.downtime-callout'
  //   );
  //   const toolTipText = await context.page.evaluate(
  //     toolTip => toolTip.textContent,
  //     toolTip
  //   );
  //   expect(toolTipText).toContain(message); //class="callout error downtime-callout drishy"
  // } else {
  //   const toolTip = await context.page.waitForSelector(
  //     'button[method="' + method + '"] [slot=subtitle]'
  //   );
  //   const toolTipText = await context.page.evaluate(
  //     toolTip => toolTip.textContent,
  //     toolTip
  //   );
  //   expect(toolTipText).toContain(message);
  // }
}

async function verifyMethodWarned(context, message, method, instrumentKey) {
  const downtime = context.preferences.payment_downtime.items.filter(item => item.method === method)[0];
  const downtimeSeverity = downtime.severity;
  let instrument = downtime.instrument[instrumentKey];
  let selector = `.downtime-${downtimeSeverity}`;
  const warningDiv = await context.page.waitForSelector(selector);
  const warningText = await context.page.evaluate(
    warningDiv => warningDiv.textContent,
    warningDiv
  );
  expect(warningText).toContain(instrument);
}

module.exports = {
  verifyMethodDisabled,
  verifyMethodWarned,
};
