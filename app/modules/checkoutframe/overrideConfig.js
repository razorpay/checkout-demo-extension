export default {
  features: [
    {
      name: 'enableUPITiles',
      config: {
        apps: [
          {
            shortcode: 'google_pay',
            url_schema: 'gpay://upi/pay',
          },
          {
            shortcode: 'phonepe',
            url_schema: 'phonepe://pay',
          },
          {
            shortcode: 'paytm',
            url_schema: {
              ios: 'paytmmp://upi/pay',
              android: 'paytmmp://pay',
            },
          },
        ],
      },
    },
  ],
};
