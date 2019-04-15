import { RazorpayConfig } from 'common/Razorpay';

const cdnUrl = RazorpayConfig.cdn;

const prefix = cdnUrl + 'cardless_emi/';
const sqPrefix = cdnUrl + 'cardless_emi-sq/';

const list = {
  bajaj: ['Bajaj Finserv'],
  earlysalary: ['EarlySalary'],
  zestmoney: ['ZestMoney'],
  flexmoney: ['InstaCred'],
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

export const providers = _Obj.map(list, (details, code) => ({
  name: details[0],
  code,
  logo: prefix + code + '.svg',
  sqLogo: sqPrefix + code + '.svg',
}));

export const getProvider = code => providers[code];
