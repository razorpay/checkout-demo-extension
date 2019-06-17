import { RazorpayConfig } from 'common/Razorpay';

const cdnUrl = RazorpayConfig.cdn;

const prefix = cdnUrl + 'cardless_emi/';
const sqPrefix = cdnUrl + 'cardless_emi-sq/';

const config = {
  bajaj: {
    name: 'Bajaj Finserv',
  },
  earlysalary: {
    name: 'EarlySalary',
  },
  zestmoney: {
    name: 'ZestMoney',
  },
  flexmoney: {
    name: 'InstaCred Cardless EMI',
  },
};

/**
 * Create an provider object for rendering on Cardless EMI screen.
 * @param {String} code
 * @param {String} title
 *
 * @return {Object}
 */
export const createProvider = (code, title) => ({
  data: {
    code,
  },
  icon: 'https://cdn.razorpay.com/cardless_emi-sq/' + code + '.svg',
  title,
});

export const providers = _Obj.map(config, (details, code) => ({
  name: details.name,
  code,
  logo: prefix + code + '.svg',
  sqLogo: sqPrefix + code + '.svg',
}));

export const getProvider = code => providers[code];
