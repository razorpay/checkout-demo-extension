export const labels = {
  HEADER: 'For RTGS/NEFT/Funds Transfer',
  ROW_HEADERS: {
    row1: 'Beneficiary Name',
    row2: 'Account No.',
    row3: 'IFSC Code',
    row4: 'Bank',
    row5: 'Branch',
    row6: 'Amount',
    row7: 'Customer Name',
    row8: 'Customer Email ID',
    row9: 'Customer Mobile No',
    row10: 'Merchant Order Id',
    row11: 'Expiry time',
    row12: 'Disclaimers',
  },
  OFFICE_USE: {
    header: '(FOR BANK USE ONLY)',
    list: ['Amount (Rs.)', 'Debit A/C No.', 'UTR No.'],
  },
  DISCLAIMERS: [
    'This challan can be used only for electronic funds transfer to provided account no. fromHDFC Bank and Other Banks through intra bank Funds Transfer or RTGS / NEFT.',
    "It is remitter's responsibility to remit the funds to correct account no. with correctamount as provided above. Incase of any mismatch in account no or amount, the transaction willbe rejected and funds will be refunded back to remitter account by next working day.",
    'IMPS transactions are not allowed into provided account no. Bank shall not be liable incaseof IMPS transactions are not updated successfully or not refunded back to remitter. (This isrequired as solution for refund of IMPS rejections is yet to be finalized)',
    'This challan is valid for only one transaction hence Remitter has to generate new challanfor every payment.',
  ],
  DISCLAIMER_LABEL: 'Disclaimer',
  DIPOSITOR_SIGN_LABEL: 'Signature of Depositor',
  AUTH_SIGN_LABEL: 'Authorised Signatory',
  BRANCH_LABEL: 'Branch Stamp',
};
export const rzpLogo =
  'https://cdn.razorpay.com/static/assets/secured_by_razorpay.svg';
export const hdfcLogo = 'https://cdn.razorpay.com/bank/HDFC.gif';
