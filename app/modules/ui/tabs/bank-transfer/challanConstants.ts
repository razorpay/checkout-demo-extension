// @note:don't change existing CHALLAN_FIELDS values and ROW_HEADERS ids as we are exposing this ids to merchant so that they can customize default title according to their needs
export const CHALLAN_FIELDS = {
  BENEFICIARY_NAME: 'beneficiary_name',
  ACCOUNT_NO: 'account_no',
  IFSC_CODE: 'ifsc_code',
  BANK: 'bank',
  BRANCH: 'branch',
  AMOUNT: 'amount',
  CUSTOMER_NAME: 'customer_name',
  CUSTOMER_EMAIL: 'customer_email',
  CUSTOMER_MOBILE: 'customer_mobile',
  ORDER_ID: 'order_id',
  EXPIRY: 'expiry',
  DISCLAIMER: 'disclaimers',
} as const;
export const labels = {
  HEADER: 'For RTGS/NEFT/Funds Transfer',
  HDFC_HEADER: 'For RTGS/NEFT/IMPS/Funds Transfer',
  ROW_HEADERS: [
    {
      title: 'Beneficiary Name',
      id: CHALLAN_FIELDS.BENEFICIARY_NAME,
    },
    {
      title: 'Account No.',
      id: CHALLAN_FIELDS.ACCOUNT_NO,
    },
    {
      title: 'IFSC Code',
      id: CHALLAN_FIELDS.IFSC_CODE,
    },
    {
      title: 'Bank',
      id: CHALLAN_FIELDS.BANK,
    },
    {
      title: 'Branch',
      id: CHALLAN_FIELDS.BRANCH,
    },
    {
      title: 'Amount',
      id: CHALLAN_FIELDS.AMOUNT,
    },
    {
      title: 'Customer Name',
      id: CHALLAN_FIELDS.CUSTOMER_NAME,
    },
    {
      title: 'Customer Email ID',
      id: CHALLAN_FIELDS.CUSTOMER_EMAIL,
    },
    {
      title: 'Customer Mobile No',
      id: CHALLAN_FIELDS.CUSTOMER_MOBILE,
    },
    {
      title: 'Merchant Order Id',
      id: CHALLAN_FIELDS.ORDER_ID,
    },
    {
      title: 'Expiry Date',
      id: CHALLAN_FIELDS.EXPIRY,
    },
    {
      title: 'Disclaimers',
      id: CHALLAN_FIELDS.DISCLAIMER,
    },
  ],

  // @not:keep this as id of above data only , key will be show on left side of row and value on right side
  FIELD_PAIRS: {
    [CHALLAN_FIELDS.AMOUNT]: CHALLAN_FIELDS.CUSTOMER_MOBILE,
    [CHALLAN_FIELDS.ACCOUNT_NO]: CHALLAN_FIELDS.IFSC_CODE,
    [CHALLAN_FIELDS.ORDER_ID]: CHALLAN_FIELDS.EXPIRY,
  },
  OFFICE_USE: {
    header: '(FOR BANK USE ONLY)',
    list: ['Amount (Rs.)', 'Debit A/C No.', 'UTR No.'],
  },
  HDFC_DISCLAIMERS: [
    {
      text: 'This challan can be used only for electronic funds transfer to provided account no. from HDFC Bank and Other Banks through intra bank Funds Transfer or RTGS / NEFT / IMPS.',
      padding: 4,
    },
    {
      text: "It is remitter's responsibility to remit the funds to correct account no. with correct amount as provided above. Incase of any mismatch in account no or amount, the transaction will be rejected and funds will be refunded.",
      padding: 9,
    },
    {
      text: 'This challan is valid for only one transaction hence Remitter has to generate new challan for every payment.',
      padding: 2,
    },
  ],
  NON_HDFC_DISCLAIMERS: [
    {
      text: 'This challan can be used only for electronic funds transfer to provided account number through intra bank Funds Transfer or RTGS / NEFT/ IMPS.',
      padding: 4,
    },
    {
      text: "It is remitter's responsibility to remit the funds to correct account no. with correct amount as provided above. Incase of any mismatch in account no or amount, the transaction willbe rejected and funds will be refunded back to remitter account by next working day.",
      padding: 9,
    },
    {
      text: 'This challan is valid for only one transaction hence Remitter has to generate new challanfor every payment.',
      padding: 2,
    },
  ],
  DISCLAIMER_LABEL: 'Disclaimer',
  DIPOSITOR_SIGN_LABEL: 'Signature of Depositor',
  AUTH_SIGN_LABEL: 'Authorised Signatory',
  BRANCH_LABEL: 'Branch Stamp',
} as const;
export const rzpLogo =
  'https://cdn.razorpay.com/static/assets/secured_by_razorpay.png';
export const hdfcLogo = 'https://cdn.razorpay.com/bank/HDFC.gif';
export const jsPdfUrl =
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/1.4.0/jspdf.min.js';
export const rupeeDataUrl =
  'data:image/png;base64,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';
export const csdKey = 'rzp_live_urB6b259UQ3bD0';
export const csdDisclaimer =
  'This is to certify that through this yes bank virtual pre-printed challan generated through NSDL-PayGov India payment gateway, the money of beneficiary will be transferred to CSD HO AFD A/c  No. 0062002100156092 against his AFD purchase.';
