export default {
  netbanking: {
    select_label: 'Select a different bank',
    select_help: 'Please select a bank',
    selection_radio_text: 'Complete Payment Using',
    corporate_label: 'Corporate',
    retail_label: 'Retail',
  },
  home: {
    preferred_block_title: 'Preferred Payment Methods',
    single_block_title: 'Pay via ${method}',

    contact_label_required: 'Phone with Country Code',
    contact_label_optional: 'Phone with Country Code (Optional)',
    contact_help_text: 'Please enter a valid contact number',
    email_label_required: 'Email',
    email_label_optional: 'Email (Optional)',
    email_help_text: 'Please enter a valid email. Example: you@example.com',
    edit_button_label: 'Edit',

    partial_payment_title: 'Select a payment type',
    min_amount_label: 'Minimum first amount',
    full_amount_label: 'Pay in full',
    partial_amount_label: 'Make payment in parts',
    partial_amount_description: 'Pay some now and the remaining later.',
    partial_amount_placeholder: 'Enter amount',
    partial_amount_help_invalid: 'Please enter a valid amount upto {amount}',
    partial_amount_help_lower: 'Minimum payable amount is {amount}',
    partial_amount_help_higher: 'Amount cannot exceed {amount}',
    partial_amount_edit_label: 'Change Amount',
    partial_amount_status_full: 'Paying full amount',
    partial_amount_status_partial: 'Paying in parts',

    address_label: 'Address',
    address_help: 'Address should be at least 10 characters long',
    pincode_label: 'PIN Code',
    pincode_help: 'Enter 6 digit pincode',
    state_label: 'Select State',
    state_help: 'Select a value from list of states',

    multi_tpv_title: 'Pay Using',
    multi_tpv_upi_title: 'UPI',
    multi_tpv_upi_subtitle: '{bankName} Account {accountNumber}',

    secured_by_message: 'This payment is secured by Razorpay.',
  },
  callouts: {
    subscriptions: {
      credit_only_callout:
        'Subscription payments are only supported on Mastercard and Visa Credit Cards.',
      debit_only_callout:
        'Subscription payments are only supported on Visa and Mastercard Debit Cards from ICICI, Kotak, Citibank and Canara Bank.',
      credit_debit_callout:
        'Subscription payments are supported on Visa and Mastercard Credit Cards from all Banks and Debit Cards from ICICI, Kotak, Citibank and Canara Bank.',
    },
    card_offer: {
      credit_only_callout:
        'All {issuer} Credit Cards are supported for this payment',
      debit_only_callout:
        'All {issuer} Debit Cards are supported for this payment',
      credit_debit_callout: 'All {issuer} Cards are supported for this payment',
    },
    recurring: {
      credit_only_callout:
        'Only Visa and Mastercard Credit Cards are supported for this payment.',
      debit_only_callout:
        'Only Visa and Mastercard Debit Cards from ICICI, Kotak, Citibank and Canara Bank are supported for this payment.',
      credit_debit_callout:
        'Visa and Mastercard Credit Cards from all Banks and Debit Cards from ICICI, Kotak, Citibank and Canara Bank are supported for this payment.',
    },
  },
  bank_transfer: {
    loading_message: 'Getting bank details...',
    header: 'To complete the transaction, make NEFT / RTGS / IMPS transfer to',
    account_label: 'Account',
    ifsc_label: 'IFSC',
    beneficiary_label: 'Beneficiary Name',
    amount_label: 'Amount Expected',
    due_date_note: 'Note: Please complete the transaction before {date}',
    round_off_callout:
      'Do not round-off the amount. Transfer the exact amount for the payment to be successful.',
    retry_button_label: 'Retry',
  },
  instruments: {
    titles: {
      netbanking: 'Netbanking - {name}',
      wallet: 'Wallet - {name}',
      paypal: 'PayPal',
      upiqr: 'UPI QR',
      upi: 'UPI - {name}',
      cardless_emi: 'EMI - {name}',
      paylater: 'Pay Later - {name}',
    },
  },
  methods: {
    prefixes: {
      card: 'Cards',
      netbanking: 'Netbanking',
      emi: 'EMI',
      paylater: 'PayLater',
      paypal: 'PayPal',
      qr: 'UPI QR',
      upi: 'UPI',
      wallet: 'Wallets',
      gpay: 'Google Pay',
      bank_transfer: 'Bank Transfer',
    },
    titles: {
      card: 'Card',
      cardless_emi: 'Cardless EMI',
      credit_card: 'Credit Card',
      debit_card: 'Debit Card',
      emi: 'EMI',
      nach: 'NACH',
      netbanking: 'Netbanking',
      paylater: 'Pay Later',
      paypal: 'PayPal',
      qr: 'UPI QR',
      upiqr: 'UPI / QR',
      upi: 'UPI',
      gpay: 'Google Pay',
      wallet: 'Wallet',
      bank_transfer: 'Bank Transfer',
      generic: 'Pay using {name}',
    },
    descriptions: {
      emandate: 'Pay with Netbanking',
      emi: 'EMI via Credit & Debit Cards',
      netbanking: 'All Indian banks',
      paypal: 'Pay using PayPal wallet',
      qr: 'Pay by scanning QR Code',
      gpay: 'Instant payment using Google Pay App',
      upi: 'Instant payment using UPI App',
      cardless_emi: 'EMI via {text}',
      recurring_cards: '{networks} credit cards',
      paylater: 'Pay later using {providers}',
    },
  },
  networks: {
    VISA: 'Visa',
    MC: 'MasterCard',
    RUPAY: 'RuPay',
    AMEX: 'Amex',
    DICL: 'Diners Club',
    MAES: 'Maestro',
    JCB: 'JCB',
  },
  paylater: {
    providers: {
      epaylater: 'ePayLater',
      getsimpl: 'Simpl',
      icic: 'ICICI Bank PayLater',
    },
  },
  cardless_emi: {
    providers: {
      bajaj: 'Bajaj Finserv',
      earlysalary: 'EarlySalary',
      zestmoney: 'ZestMoney',
      flexmoney: 'InstaCred Cardless EMI',
    },
  },
  wallets: {
    airtelmoney: 'Airtel Money',
    amazonpay: 'Amazon Pay',
    citrus: 'Citrus Wallet',
    freecharge: 'Freecharge',
    jiomoney: 'JioMoney',
    mobikwik: 'Mobikwik',
    olamoney: 'Ola Money (Postpaid + Wallet)',
    paypal: 'PayPal',
    paytm: 'Paytm',
    payumoney: 'PayUMoney',
    payzapp: 'PayZapp',
    phonepe: 'PhonePe',
    sbibuddy: 'SBI Buddy',
    zeta: 'Zeta',
  },
  banks: {
    long: {
      AUBL: 'AU Small Finance Bank',
      AIRP: 'Airtel Payments Bank',
      ALLA: 'Allahabad Bank',
      ANDB: 'Andhra Bank',
      UTIB: 'Axis Bank',
      BBKM: 'Bank of Bahrein and Kuwait',
      BARB_C: 'Bank of Baroda - Corporate Banking',
      BARB_R: 'Bank of Baroda - Retail Banking',
      BKID: 'Bank of India',
      MAHB: 'Bank of Maharashtra',
      CNRB: 'Canara Bank',
      CSBK: 'Catholic Syrian Bank',
      CBIN: 'Central Bank of India',
      CIUB: 'City Union Bank',
      COSB: 'Cosmos Co-operative Bank',
      DCBL: 'DCB Bank',
      BKDN: 'Dena Bank',
      DEUT: 'Deutsche Bank',
      DBSS: 'Development Bank of Singapore',
      DLXB: 'Dhanlaxmi Bank',
      ESFB: 'Equitas Small Finance Bank',
      FDRL: 'Federal Bank',
      HDFC: 'HDFC Bank',
      ICIC: 'ICICI Bank',
      ICIC_C: 'ICICI Bank - Corporate Banking',
      IBKL: 'IDBI',
      IDFB: 'IDFC FIRST Bank',
      IDIB: 'Indian Bank',
      IOBA: 'Indian Overseas Bank',
      INDB: 'Indusind Bank',
      JAKA: 'Jammu and Kashmir Bank',
      JSBP: 'Janata Sahakari Bank (Pune)',
      KARB: 'Karnataka Bank',
      KVBL: 'Karur Vysya Bank',
      KKBK: 'Kotak Mahindra Bank',
      LAVB_C: 'Lakshmi Vilas Bank - Corporate Banking',
      LAVB_R: 'Lakshmi Vilas Bank - Retail Banking',
      NKGS: 'NKGSB Co-operative Bank',
      ORBC: 'PNB (Erstwhile-Oriental Bank of Commerce)',
      UTBI: 'PNB (Erstwhile-United Bank of India)',
      PSIB: 'Punjab & Sind Bank',
      PUNB_R: 'Punjab National Bank - Retail Banking',
      RATN: 'RBL Bank',
      SRCB: 'Saraswat Co-operative Bank',
      SVCB: 'Shamrao Vithal Co-operative Bank',
      SIBL: 'South Indian Bank',
      SCBL: 'Standard Chartered Bank',
      SBBJ: 'State Bank of Bikaner and Jaipur',
      SBHY: 'State Bank of Hyderabad',
      SBIN: 'State Bank of India',
      SBMY: 'State Bank of Mysore',
      STBP: 'State Bank of Patiala',
      SBTR: 'State Bank of Travancore',
      SYNB: 'Syndicate Bank',
      TMBL: 'Tamilnadu Mercantile Bank',
      TNSC: 'Tamilnadu State Apex Co-operative Bank',
      UCBA: 'UCO Bank',
      UBIN: 'Union Bank of India',
      CORP: 'Union Bank of India (Erstwhile Corporation Bank)',
      VIJB: 'Vijaya Bank',
      YESB: 'Yes Bank',
    },
    short: {
      ICIC_C: 'ICICI Corporate',
      UTIB_C: 'Axis Corporate',
      SBIN: 'SBI',
      HDFC: 'HDFC',
      ICIC: 'ICICI',
      UTIB: 'Axis',
      KKBK: 'Kotak',
      YESB: 'Yes',
      IBKL: 'IDBI',
      BARB_R: 'BOB',
      PUNB_R: 'PNB',
      IOBA: 'IOB',
      FDRL: 'Federal',
      CORP: 'Corporate',
      IDFB: 'IDFC',
      INDB: 'IndusInd',
      VIJB: 'Vijaya Bank',
    },
  },
};
