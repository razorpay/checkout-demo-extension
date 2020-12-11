const {
  interceptor,
  chrnum,
  randomBool,
  randomItem,
  randomEmail,
  randomContact,
  randomId,
  randomName,
  randomString,
} = require('../util');

async function sendRewards({ expectRequest, respondJSON, options, rewards }) {
  await expectRequest(({ URL, params }) => {
    expect(URL.pathname).toEqual('/v1/rewards');

    // if (options.key) {
    //   expect(options.key).toEqual(params.key_id);
    // } else {
    //   expect(params).not.toHaveProperty('key_id');
    // }

    // preferencesParams.forEach(param => {
    //   if (options[param]) {
    //     expect(options[param]).toEqual(params[param]);
    //   } else {
    //     expect(params).not.toHaveProperty(param);
    //   }
    // });
  });
  await respondJSON(makeRewards());
}

function makeRewards(rewards) {
  return [];
}

module.exports = {
  sendRewards,
  makeRewards,
};
