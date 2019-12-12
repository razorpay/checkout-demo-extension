async function handlePayLaterOTPOrCustomerCardStatusRequest(context) {
  const req = await context.expectRequest();
  if (req.url.includes('otp/verify')) {
    expect(req.url).toContain('otp/verify');
    await context.respondJSON({
      ott: '3007d85081c8fb',
      success: 1,
    });
  } else if (req.url.includes('customers/status')) {
    expect(req.url).toContain('customers/status');
    await context.respondJSON({ saved: true });
  }
}

module.exports = {
  handlePayLaterOTPOrCustomerCardStatusRequest,
};
