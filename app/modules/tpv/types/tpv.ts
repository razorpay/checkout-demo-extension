export interface TPVBank {
  name: string;
  code: string;
  account_number: string;
  image: string;
  method?: 'upi' | 'netbanking';
  invalid: boolean;
  ifsc?: string;
}
