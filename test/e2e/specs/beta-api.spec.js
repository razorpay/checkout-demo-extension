const utils = require('../helpers/utils')
const CheckoutForm = require('../pageobjects/checkout-form')
const checkoutForm = new CheckoutForm()

function payWithCard(card) {
  checkoutForm.fillCommonFields()
  browser.click('#payment-options > [tab=card]')
  checkoutForm.fillCardFields(card)
  browser.click('#footer')
}

function switchToCheckout() {
  let tabIds = browser.getTabIds()
  browser.switchTab(tabIds[0])
}

function switchToPopup() {
  let tabIds = browser.getTabIds()
  browser.switchTab(tabIds[1])
}

beforeEach(() => {
  switchToCheckout()
  checkoutForm.loadFrame()
})

describe('Beta Testing', () => {
  it('CyberSource', () => {
    payWithCard({
      card_number: '4000000000000002',
      card_cvv: '880'
    })

    browser.waitUntil(() => {
      return (browser.getTabIds() || []).length === 2
    }, 50000, 'Awaiting for server\'s response', 3000)

    assert.equal(browser.getTabIds().length, 2, 'Popup is opened')

    switchToPopup()
    browser.waitUntil(() => {
      return browser.elements('form[name=PAReq]').value.length
    }, 50000, 'Awaiting for bank page', 3000)
    assert.equal(browser.elements('form[name=PAReq]').value.length, 1, 'Bank page is loaded')

    browser.waitUntil(() => {
      return (browser.getTabIds() || []).length === 1
    }, 50000, 'Awaiting for bank page to close', 3000)
    assert.equal(browser.getTabIds().length, 1, 'Popup is closed')
  })

  it('Amex', () => {
    payWithCard({
      card_number: '341111111111111',
      card_cvv: '8888'
    })

    browser.waitUntil(() => {
      return (browser.getTabIds() || []).length === 2
    }, 50000, 'Awaiting for server\'s response', 3000)

    assert.equal(browser.getTabIds().length, 2, 'Popup is opened')

    switchToPopup()
    browser.waitUntil(() => {
      return browser.elements('form[name=PAReq]').value.length
    }, 50000, 'Awaiting for bank page', 3000)
    assert.equal(browser.elements('form[name=PAReq]').value.length, 1, 'Bank page is loaded')

    browser.waitUntil(() => {
      return !!browser.elements('input[type=submit]').value.length
    }, 50000, 'Awaiting for server\'s response', 3000)

    browser.click('input[type=submit]')

    browser.waitUntil(() => {
      return (browser.getTabIds() || []).length === 1
    }, 50000, 'Awaiting for server\'s response', 3000)

    assert.equal(browser.getTabIds().length, 1, 'Popup is closed')
  })
})
