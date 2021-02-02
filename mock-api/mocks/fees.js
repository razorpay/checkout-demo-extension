const getFees = _ => {
  return {
    display: {
      amount: 100,
      original_amount: 10,
      razorpay_fee: 10,
    },
    input: {
      amount: 100,
      fee: 20,
    },
  }
}

module.exports = { getFees }
