function respondJSON(data, request, reply) {
  const { query } = request
  const { callback } = query
  if (callback) {
    const response = callback + `(${JSON.stringify(data)})`
    return reply
      .header('content-type', 'text/javascript; charset=UTF-8')
      .send(response)
  } else {
    reply.send(data)
  }
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

module.exports = { respondJSON, delay }
