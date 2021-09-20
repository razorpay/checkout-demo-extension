// only for handling vs code error
const preprocess = require('svelte-preprocess');

module.exports = {
  preprocess: preprocess({ defaults: { style: 'scss' } }),
};
