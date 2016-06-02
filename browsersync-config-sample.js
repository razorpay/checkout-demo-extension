// Copy this file to `browsersync.config.js` to enable/disable any browser sync option
// For more options check, https://www.browsersync.io/docs/options/

module.exports = {
  ui: false, // Disable UI completely
  open: false, // Stop the browser from automatically opening
  ghostMode: true, // Clicks, Scrolls & Form inputs on any device will be mirrored to all others
  codeSync: true // Enable livereload. Sends any file-change events to browsers
}
