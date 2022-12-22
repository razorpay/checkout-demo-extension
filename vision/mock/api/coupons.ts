export function getMerchantCoupons(route, request, context) {
  return {
    response: {
      statusCode: 200,
      promotions: [
        {
          code: 'FLAT10',
          summary: 'Flat ₹10 off',
          description: 'Use code FLAT10 and get ₹10 off on your purchase',
          tnc: ['Offer applicable on both COD & pre-paid orders!'],
        },
      ],
    },
  };
}
