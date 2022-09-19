import { JsonResponse } from './utils/index.mjs';
import { createRouter } from './utils/router.mjs';
import handlePreferences from './handlers/preferences.mjs';
import handlePersonalisation from './handlers/personalisation.mjs';
import handleCountries from './handlers/countries.mjs';
import handleStatus from './handlers/status.mjs';
import {
  serveCheckout,
  servePublicPage,
  serveCdn,
  serveQR,
} from './handlers/static.mjs';
import * as payment from './handlers/createPayment.mjs';

const router = createRouter();
export default router;
const posRouter = router.origin('https://checkout.razorpay.com');
const cdnRouter = router.origin('https://cdn.razorpay.com');
const apiRouter = router.origin('https://api.razorpay.com');
const googleChartRouter = router.origin('https://chart.googleapis.com');
const googleDNSRouter = router.origin('https://dns.google');

posRouter.get('/v1/:assetPath*', serveCheckout);
cdnRouter.get('/:assetPath*', serveCdn);

apiRouter.get('/v1/checkout/public', servePublicPage);
apiRouter.get('/v1/preferences', handlePreferences);
apiRouter.get('/v1/personalisation', handlePersonalisation);
apiRouter.get('/v1/countries', handleCountries);
apiRouter.get('/v1/checkout/rewards', function* () {
  yield {data: JsonResponse([{ variant: false }])};
});
apiRouter.get('/v1/personalisation', function* () {
  yield {data: JsonResponse({preferred_methods:{}})};
});
apiRouter.post('/v1/payments/create/ajax', payment.createAjax);
apiRouter.post('/v1/payments/create/checkout', payment.createCheckout);
apiRouter.get('/v1/payments/:payment_id/status/(.)*', handleStatus);

googleChartRouter.get('/chart', serveQR);
googleDNSRouter.get('/:foo*', function* () {
  yield {data: JsonResponse({})};
});