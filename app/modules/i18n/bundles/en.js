export default {
  netbanking: {
    select_label: 'Select a different bank',
    select_help: 'Please select a bank',
    selection_radio_text: 'Complete Payment Using',
    corporate_label: 'Corporate',
    retail_label: 'Retail',
  },
  card: {
    use_saved_cards_btn: 'Use saved cards',
    add_another_card_btn: 'Add another card',

    card_number_label: 'Card Number',
    card_number_help: 'Please enter a valid card number.',
    card_number_help_amex: 'Amex cards are not supported for this transaction.',
    card_number_help_recurring: 'Card does not support recurring payments.',
    card_number_help_unsupported: 'This card is not supported for the payment',

    expiry_label: 'Expiry',

    name_label: "Card Holder's name",
    name_help: 'Please enter name on your card',

    cvv_label: 'CVV',
    cvv_help: "It's a {length} digit code printed on the back of your card.",

    remember_card_label: 'Remember Card',
    view_all_emi_plans: 'View all EMI Plans',
    nocvv_label: "My Maestro Card doesn't have Expiry/CVV",

    auth_type_header: 'Complete Payment Using',
    auth_type_otp: 'OTP / Password',
    auth_type_pin: 'ATM PIN',

    saved_card_label: 'Card ending with <b>{last4}<b>',

    recurring_callout:
      'Future payments on this card will be charged automatically.',
    subscription_callout:
      'The charge is to enable subscription on this card and it will be refunded.',
    subscription_refund_callout:
      'This card will be linked to the subscription and future payments will be charged automatically.',
  },
  emi: {
    unavailable_help:
      'EMI is available on {issuers} cards. Enter your credit card to avail.',
    unavailable_btn: 'EMI unavailable',
    saved_card_unavailable_help: 'EMI is not available on this card',

    edit_plan_text: '{duration} Months ({amount}/mo)',
    edit_plan_action: 'Edit',

    available_text: 'EMI Available',
    available_action: 'Pay with EMI',

    pay_entire_amount_action: 'Pay entire amount',
    pay_entire_amount_count: '({count} cards available)',
  },
  home: {
    preferred_block_title: 'Preferred Payment Methods',
    single_block_title: 'Pay via {method}',

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
  emandate: {
    change_bank_btn: 'Change Bank',
    auth_type_header: 'Authenticate using',
    auth_type_debit_title: 'Debit Card',
    auth_type_debit_description: 'via Bank Account and Debit Card details',
    auth_type_netbanking_title: 'Netbanking',
    auth_type_netbanking_description: 'via Bank Account and Netbanking details',
    account_type_current: 'Current Account',
    account_type_savings: 'Savings Account',

    account_number_label: 'Bank Account Number',
    account_number_help: 'Please enter a valid account number',

    ifsc_label: 'IFSC',
    ifsc_help: 'Please enter a valid IFSC',

    name_label: 'Account Holder Name',
    name_help: 'Please enter a valid Name as per your account',

    account_type_label: 'Type of Bank Account',
    account_type_help: 'Please select a bank account type',
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
  tab_titles: {
    card: 'Card',
    irctc_card: 'Debit/Credit Card',
    cardless_emi: 'EMI',
    credit_card: 'Credit Card',
    debit_card: 'Debit Card',
    emandate: 'Account Details',
    emandate_account: 'Bank Account',
    emi: 'EMI',
    emiplans: 'EMI Plans',
    nach: 'NACH',
    netbanking: 'Netbanking',
    otp: 'Enter OTP',
    paylater: 'Pay Later',
    paypal: 'PayPal',
    qr: 'UPI QR',
    upi: 'UPI',
    irctc_upi: 'BHIM/UPI',
    gpay: 'Google Pay',
    wallet: 'Wallet',
    payout_account: 'Add Bank Account',
    payout_upi: 'Add UPI ID',
    bank_transfer: 'Bank Transfer',
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
    select_option_title: 'Select an option',
    providers: {
      epaylater: 'ePayLater',
      getsimpl: 'Simpl',
      icic: 'ICICI Bank PayLater',
    },
  },
  cardless_emi: {
    select_option_title: 'Select an option',
    providers: {
      cards: 'EMI on Credit/Debit cards',
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
  qr: {
    generating_label: 'Generating QR Code...',
    scan_on_phone:
      'Scan the QR using any UPI app on your phone like BHIM, PhonePe, Google Pay etc.',
    retry: 'Retry',
    downtime_text: '<strong>UPI QR<strong> is experiencing low success rates.',
  },
  upi: {
    intent_block_heading: 'PAY USING APPS',
    redirect_to_app: 'You will be redirected to your UPI app',
    recommended: 'Recommended',
    show_other_apps: 'Show other UPI apps',
    gpay_block_heading: 'Pay using Gpay App',
    collect_block_heading: 'Pay using UPI ID',
    collect_block_subheading:
      'You will receive a payment request on your UPI app',
    collect_new_vpa_help: 'Please enter a valid VPA of the form username@bank',
    collect_enter_upi_id: 'Enter your UPI ID',
    collect_securely_save: 'Securely save your UPI ID',
    new_vpa_title_logged_out: 'UPI ID',
    new_vpa_title_logged_in: 'Add UPI ID',
    new_vpa_subtitle: 'Google Pay, BHIM, PhonePe & more',
    gpay_web_api_title: 'Google Pay',
    qr_block_heading: 'Pay using QR Code',
    show_qr_code: 'Show QR Code',
    scan_qr_code: 'Scan the QR code using your UPI app',
    downtime_text: '<strong>UPI<strong> is experiencing low success rates.',
    omni_block_heading: 'Or, pay using phone number',
    omni_gpay_number: 'Google Pay phone number',
    omni_enter_number: 'Enter your phone number',
    omni_error:
      'Please ensure the same number is linked to the Google Pay account.',
  },
  upi_intent_apps: {
    google_pay: 'Google Pay (Tez)',
    phonepe: 'PhonePe',
    paytm: 'PayTM',
    bhim: 'BHIM',
    'whatsapp-biz': 'WhatsApp Business',
    imobile: 'iMobile by ICICI Bank',
    sbi: 'SBI Bank',
    axispay: 'Axis Pay',
    'samsung-mini': 'Samsung Pay Mini',
    samsung: 'Samsung Pay',
    'hdfc-bank': 'HDFC Bank',
    'pnb-bank': 'PNB Bank',
    'icici-pocket': 'Pockets-UPI (ICICI Bank)',
    'bank-of-baroda': 'Baroda Pay',
    freecharge: 'Freecharge',
    'united-upi': 'United UPI Pay',
    axis: 'Axis Mobile',
    kvb: 'KVB Upay',
    vijaya: 'VIJAYA UPI',
    dena: 'Dena UPI',
    'jk-upi': 'JK Bank UPI',
    kotak: 'Kotak Bank UPI',
    payzapp: 'PayZapp',
    hike: 'Hike',
    idfc: 'IDFC First Bank',
    'yes-bank': 'Yes Bank',
    'microsoft-kaizala': 'Microsoft Kaizala',
    fino: 'Fino BPay',
    oriental: 'Oriental Pay',
    lotza: 'LOTZA UPI',
    induspay: 'IndusPay',
    wizely: 'Wizely',
    'dcb-bank': 'DCB Bank',
    digibank: 'Digibank by DBS India',
    'rbl-mobank': 'RBL Bank MoBank',
    lazypay: 'LazyPay',
    sibmirror: 'SIB Mirror',
    amazon: 'Amazon Shopping',
    mipay: 'Mi Pay',
    cred: 'CRED',
    finserv: 'Finserv MARKETS',
  },
  cta: {
    amount: 'Pay {amount}',
    continue: 'Continue',
    submit: 'Submit',
    next: 'Next',
    proceed: 'Proceed',
    copy_details: 'Copy Details',
    copied: 'Copied',
    authenticate: 'Authenticate',
    apply_offer: 'Apply Offer',
    view_emi_plans: 'View EMI Plans',
    select_emi_plan: 'Select EMI Plan',
    enter_card_details: 'Enter Card Details',
    confirm_account: 'Confirm Account',
    verify: 'Verify',
    pay_without_offer: 'Pay Without Offer',
    pay_single_method: 'Pay using {method}',
    upload_nach_form: 'Upload NACH Form',
  },
};
