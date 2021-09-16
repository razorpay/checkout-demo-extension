async function sendSiftJS({ expectRequest, respondPlain }) {
  await expectRequest(({ URL, params }) => {
    expect(URL).toEqual('https://siftjs.razorpay.com/s.js');
  });
  await respondPlain('');
}

module.exports = {
  sendSiftJS,
};
