async function verifyTokenPresentInRequest({ expectRequest }) {
  const req = await expectRequest();
  expect(req.url).toContain('session_token=DEMO_SESSION_TOKEN');
}

module.exports = {
  verifyTokenPresentInRequest,
};
