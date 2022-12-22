const { getPreferences } = require('./preferences');

function getVerifyPendingResponse() {
  return {
    status: 'pending',
  };
}

function getVerifySuccessResponse() {
  const { customer } = getPreferences('loggedIn');

  return {
    status: 'resolved',
    contact: customer.contact,
    email: customer.email,
    tokens: customer.tokens,
    addresses: [],
  };
}

module.exports = {
  getVerifyPendingResponse,
  getVerifySuccessResponse,
};
