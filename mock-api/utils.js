function respondJSON(data, request, reply) {
  const { query } = request;
  const { callback } = query;
  if (callback) {
    const response = callback + `(${JSON.stringify(data)})`;
    return reply
      .header('content-type', 'text/javascript; charset=UTF-8')
      .send(response);
  }
  reply.json(data);
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * This utility can be used to log the styled content
 * @param {string} message content to log
 */
function logger(message) {
  console.log('\x1b[33m%s\x1b[0m', `\n${message}`);
}

/**
 * modules are cached by nodejs from fs to memory
 * When the mocks are updated in background, we want
 * them to be loaded freshly instead of cached version of module
 * @param path
 * @returns {*}
 */
const requireOnce = (path) => {
  const value = require(path);
  delete require.cache[require.resolve(path)];
  return value;
};

module.exports = { respondJSON, delay, logger, requireOnce };
