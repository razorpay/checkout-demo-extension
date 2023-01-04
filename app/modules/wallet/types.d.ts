import { list } from 'wallet/constants';

export type WalletCode = keyof typeof list;

export type Wallet = {
  code: WalletCode;
  h: number;
  logo: string;
  name: string;
  power: boolean;
  sqLogo: string;
};
