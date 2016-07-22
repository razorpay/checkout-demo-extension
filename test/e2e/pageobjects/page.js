function Page () {

}

Page.prototype.open = function(path) {
  browser.url(`/${path}`)
}

module.exports = Page;
