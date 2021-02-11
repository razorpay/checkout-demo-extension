module.exports = {
  ajaxResponse: {
    type: 'first',
    request: {
      url:
        'https://api.razorpay.com/v1/gateway/mocksharp/payment?key_id=rzp_test_1DP5mmOlF5G5ag&action=authorize&amount=200&method=card&payment_id=GZ7c6a2d9mfWAG&callback_url=https%3A%2F%2Fapi.razorpay.com%2Fv1%2Fpayments%2Fpay_GZ7c6a2d9mfWAG%2Fcallback%2F003a66d043ae11dc4cb2b29a3f089c465628b794%2Frzp_test_1DP5mmOlF5G5ag&recurring=0&card_number=eyJpdiI6ImJNT0cyQWdHbzliRGtMWVNBNHk3SVE9PSIsInZhbHVlIjoiZ0Vodkx3UmlVcUczS2NlK09OZFwvQmgzR1NXSWRLXC9LUVJLQUdsYzg1OTRjPSIsIm1hYyI6Ijk0ZjM2ODM4MzQzNGYzNTVjOWVjNWFiMWRjYjJiZWJiOWQ2MzhkMzQzOGFlNDc4MWU5NmZlOTEwYzNlNGE0YjEifQ%3D%3D&encrypt=1',
      method: 'get',
      content: [],
    },
    version: 1,
    payment_id: 'pay_GZ7c6a2d9mfWAG',
    gateway:
      'eyJpdiI6IkJhNEQrb0cwcWpoZEIwYmU2UVNDNkE9PSIsInZhbHVlIjoiRnA0SXpXV3NUNXdmSDlVQ3p1MWhyZDlNT05oRTZkQzN0WjJhd2VNeTlydz0iLCJtYWMiOiI5Y2Y3NzVlN2M2OTc2NTIwN2JiM2ZkMGYzMGZhZmFhY2I0YTJiNTRiNjA2NTJlNTMxODM2MDNjZGY5NmIzZTMxIn0=',
    amount: '₹ 2',
    image: 'https://cdn.razorpay.com/logos/GS8xtzE45HDhNT_medium.png',
    magic: false,
    org_logo: '',
    org_name: 'Razorpay Software Private Ltd',
    checkout_logo:
      'https://dashboard-activation.s3.amazonaws.com/org_100000razorpay/checkout_logo/phpnHMpJe',
    custom_branding: false,
  },
};
