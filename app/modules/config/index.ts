import FLOWS from './FLOWS';
import walletConfig from './wallet';
import cardlessEMIConfig from './cardlessEMI';
import appConfig from './app';
import codConfig from './cod';

export { FLOWS };

export default {
  wallet: walletConfig,
  cardless_emi: cardlessEMIConfig,
  app: appConfig,
  cod: codConfig,
};