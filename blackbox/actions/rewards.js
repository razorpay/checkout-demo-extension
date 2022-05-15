const { makeJSONResponse } = require('../util');

async function sendRewardsOneCC(context) {
  const { getRequest, resetRequest } = context;
  const request = getRequest(`/v1/checkout/rewards`);
  if (!request) {
    sendRewards(context);
    return;
  }
  await request.respond(makeJSONResponse(makeRewards()));
  resetRequest(request);
}

async function sendRewards({
  getRequest,
  expectRequest,
  respondJSON,
  options,
  rewards,
}) {
  await getRequest(`/v1/checkout/rewards`);
  const request = await expectRequest();
  expect(request.url).toContain('/checkout/rewards');
  if (options.key) {
    expect(options.key).toEqual(request.params.key_id);
  } else {
    expect(request.params).not.toHaveProperty('key_id');
  }

  await respondJSON(makeRewards());
}
function makeRewards(rewards) {
  return [];
}

module.exports = {
  sendRewards,
  makeRewards,
  sendRewardsOneCC,
};
