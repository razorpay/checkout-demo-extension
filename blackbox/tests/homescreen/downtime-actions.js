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

async function verifyMethodWarned(context, message, method) {
  let selector = '.downtime-callout';
  // // if (method) {
  // //   selector = ['netbanking', 'upi', 'upi_otm'].includes(method)
  // //     ? `.bottom:not([tab]) ${selector}`
  // //     : `#form-${method}.drishy ~ #bottom .bottom[tab="${method}"] ${selector}`;
  // // }
  const warningDiv = await context.page.waitForSelector(selector);
  const warningText = await context.page.evaluate(
    warningDiv => warningDiv.textContent,
    warningDiv
  );
  expect(warningText).toContain(message);
}

module.exports = {
  verifyMethodDisabled,
  verifyMethodWarned,
};
