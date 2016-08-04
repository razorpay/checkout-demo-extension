'use strict'
module.exports = function() {
  let currentTabId, data

  before(() => {
    currentTabId = browser.getCurrentTabId()
    browser.frameParent()
    data = browser.exec(() => {
      return options
    }).value
    browser.checkoutFrame()
  })

  function switchToPopup() {
    let allTabs = browser.getTabIds()
    allTabs.splice(allTabs.indexOf(currentTabId), 1)
    let popup = allTabs[0]
    browser.switchTab(popup)
  }

  describe('Direct pay', () => {
    it('Open popup', () => {
      browser.click('#footer')
      browser.waitUntil(() => {
        return (browser.getTabIds() || []).length === 2
      }, 1000)

      let allTabs = browser.getTabIds()
      assert.equal(allTabs.length, 2, 'Popup is opened')
    })

    it('Shows loading indicator in the modal', () => {
      assert.equal(
        browser.css('#modal-inner #error-message', 'display'),
        'block',
        'Loading is shown inside the modal'
      )

      assert.equal(
        browser.css('#modal-inner #overlay', 'display'),
        'block',
        'Loading overlay is shown inside the modal'
      )

      assert.equal(
        browser.getText('#fd-t'),
        'Your payment is being processed',
        'Loading text is shown'
      )

      // assert.equal(
      //   browser.css('#modal-inner #error-message #spin', 'display'),
      //   'block',
      //   'Loading spinner is shown'
      // )
    })

    it('Check the info displayed in the popup', () => {
      switchToPopup()
      assert.isOk(
        browser.getAttribute('#top > img', 'src'),
        'Image loaded in the popup'
      )

      assert.equal(
        browser.getText('#top > span'),
        `₹${Number(data.amount)/100}`,
        'Amount is shown in the popup'
      )
    })

    describe('Error Payment', () => {
      it('Popup is closed & Retry is shown on error', () => {
        browser.waitForExist('form input[data-value=F]', 15000)
        browser.click('form input[data-value=F]')
        browser.waitUntil(() => {
          return (browser.getTabIds() || []).length === 1
        }, 15000, 'Awaiting for server\'s response', 1000)

        assert.equal(browser.getTabIds().length, 1, 'Popup is closed')
        browser.switchTab(currentTabId)
        browser.checkoutFrame()
        browser.pause(300)

        assert.equal(
          browser.css('#error-message', 'display'),
          'block',
          'Error container is shown'
        )

        assert.isOk(
          browser.getText('#fd-t'),
          'Error text is shown'
        )

        assert.equal(
          browser.getText('#error-message #fd-hide'),
          'RETRY',
          'RETRY button is shown'
        )
      })

      it('Error container should hide on clicking Retry', () => {
        browser.click('#error-message #fd-hide')
        browser.waitUntil(() => {
          return browser.css('#error-message', 'display') === 'none'
        })
        assert.equal(
          browser.css('#error-message', 'display'),
          'none',
          'Error container is removed'
        )
      })
    })

    describe('Success Payment', () => {
      it('Popup is closed on success', () => {
        browser.click('#footer')
        browser.waitUntil(() => {
          return (browser.getTabIds() || []).length === 2
        }, 1000)
        switchToPopup()

        browser.waitForExist('form input[data-value=S]', 15000)
        browser.click('form input[data-value=S]')

        browser.waitUntil(() => {
          return (browser.getTabIds() || []).length === 1
        }, 15000, 'Awaiting for server\'s response', 1000)

        assert.equal(browser.getTabIds().length, 1, 'Popup is closed')
      })
    })
  })
}
