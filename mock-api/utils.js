function respondJSON(data, request, reply) {
  const { query } = request;
  const { callback } = query;
  if (callback) {
    const response = callback + `(${JSON.stringify(data)})`;
    return reply
      .header('content-type', 'text/javascript; charset=UTF-8')
      .send(response);
  } else {
    reply.send(data);
  }
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * This utility can be used to log the styled content
 * @param {string} message content to log
 */
function logger(message) {
  console.log('\x1b[33m%s\x1b[0m', `\n${message}`);
}

module.exports = { respondJSON, delay, logger };
