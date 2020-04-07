async function verifyHighDowntime(context, method, message) {
  if (context.preferences.offers) {
    const toolTip = await context.page.waitForXPath(
      '//div[contains(@class,"callout error downtime-callout")]'
    );
    const toolTipText = await context.page.evaluate(
      toolTip => toolTip.textContent,
      toolTip
    );
    expect(toolTipText).toContain(message); //class="callout error downtime-callout drishy"
  } else {
    const toolTip = await context.page.waitForXPath(
      '//button[@method = "' + method + '"]//*[@slot = "subtitle"]'
    );
    const toolTipText = await context.page.evaluate(
      toolTip => toolTip.textContent,
      toolTip
    );
    expect(toolTipText).toContain(message);
  }
}

async function verifyLowDowntime(context, message, method) {
  let selector = '.downtime-callout';

  if (method) {
    selector = `#form-${method} ${selector}`;
  }

  const warningDiv = await context.page.waitForSelector(selector);
  const warningText = await context.page.evaluate(
    warningDiv => warningDiv.textContent,
    warningDiv
  );
  expect(warningText).toContain(message);
}

module.exports = {
  verifyHighDowntime,
  verifyLowDowntime,
};
