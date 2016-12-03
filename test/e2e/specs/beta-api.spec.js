const utils = require('../helpers/utils')
const CheckoutForm = require('../pageobjects/checkout-form')
const checkoutForm = new CheckoutForm()

beforeEach(() => {
  checkoutForm.loadFrame()
})

function payWithCard(card) {
  checkoutForm.fillCommonFields()
  browser.click('#payment-options > [tab=card]')
  checkoutForm.fillCardFields(card)
  browser.click('#footer')
}

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

    browser.waitUntil(() => {
      return (browser.getTabIds() || []).length === 1
    }, 50000, 'Awaiting for server\'s response', 3000)

    assert.equal(browser.getTabIds().length, 1, 'Popup is closed')
  })

  it('Amex', () => {
    payWithCard({
      card_number: '341111111111111',
      card_cvv: '8888'
    })
    let tabIds = browser.getTabIds()

    browser.waitUntil(() => {
      return (browser.getTabIds() || []).length === 2
    }, 50000, 'Awaiting for server\'s response', 3000)

    assert.equal(browser.getTabIds().length, 2, 'Popup is opened')

    browser.switchTab(tabIds[1])

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
