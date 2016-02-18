options =
  key: 'key'
  amount: 100

describe 'dom elements:', ->
  it 'container', ->
    container = jQuery('div.razorpay-container')
    expect(container.length).toBe 1
    expect(container[0]).not.toBeVisible()
    expect(container.prop('parentNode')).toBe document.body

  it 'backdrop', ->
    backdrop = jQuery('div.razorpay-backdrop')
    expect(backdrop.length).toBe 1
    expect(backdrop.parent().hasClass('razorpay-container')).toBe true

  it 'iframe', ->
    frame = jQuery('iframe.razorpay-checkout-frame')
    expect(frame.length).toBe 1
    expect(frame.parent().hasClass('razorpay-container')).toBe true

describe 'Razorpay.open', ->
  it '', ->
    razorpay = new Razorpay options
    razorpay.open()
    expect jQuery 'div.razorpay-container'
      .toBeVisible()