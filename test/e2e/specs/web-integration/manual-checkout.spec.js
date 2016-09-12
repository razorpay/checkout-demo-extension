'use strict'

const utils = require('../../helpers/utils')
const CheckoutForm = require('../../pageobjects/checkout-form')
const checkoutForm = new CheckoutForm()
let data

before(() => {
  checkoutForm.open()
  data = browser.execute(() => {
    return options
  }).value
})

describe('Index Page loaded', () => {
  it('Test page should have the right title - Everything is good to go now', () => {
    let title = browser.getTitle()
    assert.equal(title, 'Razorpay Manual Checkout')
  })
})

describe('Loads RZP Modal', () => {
  it('Clicking on the `Pay Now` button should open RZP iframe', () => {
    expect($('.razorpay-container')).to.exist
    expect($('.razorpay-backdrop')).to.exist
    expect($('.razorpay-container .razorpay-checkout-frame')).to.exist

    browser.checkoutFrame()
    expect($('#container')).to.exist
    expect($('#modal')).to.exist
    expect($('#powered-by')).to.exist
    expect($('#backdrop')).to.exist
  })
})

describe('Options & prefills', () => {
  it('rzp options should load correctly', () => {
    assert.isOk(
      browser.getAttribute('#logo > img', 'src'),
      'Image loaded correctly'
    )

    assert.equal(
      browser.getText('#amount'),
      `₹ ${Number(data.amount)/100}`,
      'Amount is shown correctly'
    )

    assert.equal(
      browser.getText('#merchant-name'),
      data.name,
      'Merchant name is shown correctly'
    )

    assert.equal(
      browser.getText('#merchant-desc'),
      data.description,
      'Description is shown correctly'
    )

    assert.equal(
      browser.getAttribute('#email', 'value'),
      data.prefill.email,
      'Email is prefilled'
    )

    assert.isNotTrue(
      browser.getAttribute('#contact', 'value'),
      'Phone field is left empty, when prefill is not provided'
    )

    assert.equal(
      utils.rgb2hex(browser.css('#header', 'background-color')),
      (data.theme.color || '').toLowerCase(),
      'Theme color is set'
    )
  })
})

describe('Home Screen', () => {
  it('Make sure home screen is shown', () => {
    assert.isNotOk(
      browser.hasClass('#body', 'sub'),
      'Home screen is shown - `sub` class is not added'
    )

    assert.isNotOk(
      browser.getAttribute('#body', 'tab'),
      'Home screen is shown - no `tab` attribute'
    )
  })

  it('PAY button should be hidden on home screen', () => {
    assert.notEqual(
      browser.css('#footer', 'transform'),
      'none',
      'Button is hidden - negative transform is set'
    )

    assert.isNotOk(
      browser.css('#footer', 'opacity'),
      'Button is hidden - with zero opacity'
    )
  })

  describe('Payment tabs should be shown based on passed payment options', () => {
    it('Initially, all payment options are shown', () => {
      checkoutForm.open()
      browser.checkoutFrame()
      assert.equal(
        browser.elements('#payment-options > .payment-option').value.length,
        3,
        'All payment options are shown'
      )
    })

    it('Hide card tab, if `card` is false', () => {
      checkoutForm.open({
        preferences: {
          methods: {
            card: false
          }
        }
      })
      browser.checkoutFrame()
      assert.equal(
        browser.elements('#payment-options > .payment-option').value.length,
        2,
        'Two payment options are shown'
      )

      assert.isNotOk(
        $('#payment-options > [tab=card]'),
        'Card tab is hidden'
      )
    })

    it('Hide Netbanking, if `netbanking` is set to false', () => {
      checkoutForm.open({
        preferences: {
          methods: {
            card: false,
            netbanking: false
          }
        }
      })

      browser.checkoutFrame()
      assert.equal(
        browser.elements('#payment-options > .payment-option').value.length,
        1,
        'Only one payment option is shown'
      )

      assert.isNotOk(
        $('#payment-options > [tab=card]'),
        'Card tab is hidden'
      )

      assert.isNotOk(
        $('#payment-options > [tab=netbanking]'),
        'Netbanking is hidden'
      )
    })

    it('Hide Wallet, if `wallet` is set to false', () => {
      checkoutForm.open({
        preferences: {
          methods: {
            card: true,
            netbanking: false,
            wallet: false
          }
        }
      })

      browser.checkoutFrame()
      assert.equal(
        browser.elements('#payment-options > .payment-option').value.length,
        1,
        'Only one payment option is shown'
      )

      assert.isNotOk(
        $('#payment-options > [tab=wallet]'),
        'Wallet is hidden'
      )

      assert.isNotOk(
        $('#payment-options > [tab=netbanking]'),
        'Netbanking is hidden'
      )

      assert.isOk(
        $('#payment-options > [tab=card]'),
        'Only Card tab is shown'
      )
    })
  })

  describe('Wallets are shown based on the passed options', () => {
    it('All wallets are shown', () => {
      checkoutForm.open()
      browser.checkoutFrame()
      checkoutForm.fillCommonFields()
      browser.click('#payment-options > [tab=wallet]')

      assert.equal(
        browser.elements('#Wallets > .wallet').value.length,
        3,
        'All wallets are shown'
      )
    })
  })
})

describe('Modal should close', () => {
  function checkFromParent() {
    browser.frameParent()
    // Uncomment below cases once the issue is fixed in dev

    // assert.equal(
    //   browser.css('.razorpay-container', 'display'),
    //   'none',
    //   'RZP container is removed on escape press'
    // )
    //
    // assert.equal(
    //   browser.css('.razorpay-backdrop', 'background-color'),
    //   '',
    //   'Backdrop is removed on escape press'
    // )
  }

  function checkFromFrame() {
    browser.checkoutFrame()
    browser.waitUntil(() => {
      return !browser.element('#container').value
    })
    assert.isNotOk($('#container'), 'Iframe container is removed')
  }

  beforeEach(() => {
    checkoutForm.open()
  })

  // it('Close on escape press, which parent window is focused', () => {
  //   browser.keys('\uE00C')
  //   checkFromParent()
  //   checkFromFrame()
  // })

  // it('Close on escape press, which iframe is focused', () => {
  //   browser.checkoutFrame()
  //   browser.keys('\uE00C')
  //   checkFromParent()
  //   checkFromFrame()
  // })

  it('Close on closs button click', () => {
    browser.checkoutFrame()
    browser.click('#modal-close')
    checkFromParent()
    checkFromFrame()
  })
})
