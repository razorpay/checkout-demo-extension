const { makeJSONResponse } = require('../../util');

async function handlePartialOrderUpdate(context) {
  let request = context.getRequest(
    `/v1/orders/1cc/${context.options.order_id}/customer`
  );
  if (!request) {
    request = await context.expectRequest();
    expect(request.url).toContain(
      `v1/orders/1cc/${context.options.order_id}/customer`
    );
    await context.respondJSON([]);
    return;
  }
  await request.respond(makeJSONResponse([]));
  context.resetRequest(request);
}

module.exports = {
  handlePartialOrderUpdate,
};
