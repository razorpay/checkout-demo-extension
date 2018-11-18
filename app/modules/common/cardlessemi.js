import { RazorpayConfig } from 'common/Razorpay';

const cdnUrl = RazorpayConfig.cdn;

const prefix = cdnUrl + 'emi/';
const sqPrefix = cdnUrl + 'emi-sq/';

const list = {
  zestmoney: ['Zest Money'],
  earlysalary: ['Early Salary'],
};

export const providers = _Obj.map(list, (details, code) => ({
  name: details[0],
  code,
  logo: prefix + code + '.png',
  sqLogo: sqPrefix + code + '.png',
}));

export const getProvider = code => providers[code];
