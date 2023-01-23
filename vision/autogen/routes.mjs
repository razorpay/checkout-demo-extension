import { createRouter } from './utils/router.mjs';
import * as handlers from './handlers/index.mjs';
import {
  serveCheckout,
  servePublicPage,
  serveCdn,
  serveQR,
} from './handlers/static.mjs';

const router = createRouter();
export default router;

router.origin('wss://api.razorpay.com:8000').ignore();
router.origin('https://rudderstack.razorpay.com').ignore();
router.origin('https://browser.sentry-cdn.com').ignore();
router.origin('https://dns.google').ignore();
router.origin('https://o515678.ingest.sentry.io').ignore();
router.origin('https://cdn.razorpay.com').get('/:any*', serveCdn);
router.origin('https://chart.googleapis.com').get('/chart', serveQR);
router.origin('https://checkout.razorpay.com').get('/v1/:any*', serveCheckout);

router
  .origin('https://api.razorpay.com')
  .get('/v1/checkout/public', servePublicPage)
  .get('/v1/preferences', handlers.preferences)
  .get('/v1/personalisation', handlers.personalization)
  .get('/v1/countries', handlers.countries)
  .post('/v1/payments/create/:type', handlers.createPayment)
  .get('/v1/payments/:payment_id/status/:any*', handlers.paymentStatus)
  .get('/v1/payment/iin', handlers.iin)
  .get('/v1/checkout/rewards', function* () {
    yield { variant: false };
  })
  .get('/v1/personalisation', function* () {
    yield { preferred_methods: {} };
  })
  .post('/v1/otp/create', function* () {
    yield { success: true };
  })
  .post('/v1/otp/verify', function* () {
    yield { success: 1, addresses: [] };
  })
  .post('/v1/payments/validate/account', function* ({ request }) {
    const vpa = new URLSearchParams(request.postData()).get('value');
    yield { vpa, customer: null, success: true };
  })
  .get('/v1/customers/status/:contact_no', function* () {
    yield { saved: false };
  });
