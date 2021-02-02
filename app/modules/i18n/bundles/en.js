export default {
  app: {
    providers: {
      cred: {
        name: 'CRED Pay',
        subtext: 'exclusive discounts with CRED coins',
      },
      google_pay_cards: {
        name: 'Pay with Google Pay',
        subtext: 'Use cards saved on Google Pay',
      },
    },
  },
  bajaj_finserv: {
    callout:
      'You need to have a <strong>Bajaj Finserv issued card<strong> to continue.',
    card_details_header: 'Enter Card Details',
    card_number_help: 'Please enter a valid Bajaj Finserv issued card number',
    card_number_label: 'Card Number',
    name_help: 'Please enter name on your card',
    name_label: "Card Holder's Name",
  },
  bank_transfer: {
    account_label: 'Account',
    amount_label: 'Amount Expected',
    beneficiary_label: 'Beneficiary Name',
    due_date_note: 'Note: Please complete the transaction before {date}',
    header: 'To complete the transaction, make NEFT / RTGS / IMPS transfer to',
    ifsc_label: 'IFSC',
    loading_message: 'Getting bank details...',
    retry_button_label: 'Retry',
    round_off_callout:
      'Do not round-off the amount. Transfer the exact amount for the payment to be successful.',
  },
  banks: {
    long: {
      ABHY: 'Abhyudaya Co-operative Bank',
      ABNA: 'Royal Bank of Scotland N.V.',
      ABPB: 'Aditya Birla Idea Payments Bank',
      AIRP: 'Airtel Payments Bank',
      ALLA: 'Allahabad Bank',
      ANDB: 'Andhra Bank',
      ANDB_C: 'Andhra Bank - Corporate Banking',
      AUBL: 'AU Small Finance Bank',
      BACB: 'Bassein Catholic Co-operative Bank',
      BARB_C: 'Bank of Baroda - Corporate Banking',
      BARB_R: 'Bank of Baroda - Retail Banking',
      BBKM: 'Bank of Bahrein and Kuwait',
      BDBL: 'Bandhan Bank',
      BKDN: 'Dena Bank',
      BKID: 'Bank of India',
      CBIN: 'Central Bank of India',
      CITI: 'Citibank',
      CIUB: 'City Union Bank',
      CNRB: 'Canara Bank',
      CORP: 'Union Bank of India (Erstwhile Corporation Bank)',
      COSB: 'Cosmos Co-operative Bank',
      CSBK: 'Catholic Syrian Bank',
      DBSS: 'Development Bank of Singapore',
      DCBL: 'DCB Bank',
      DEUT: 'Deutsche Bank',
      DLXB: 'Dhanlaxmi Bank',
      DLXB_C: 'Dhanlaxmi Bank - Corporate Banking',
      ESAF: 'ESAF Small Finance Bank',
      ESFB: 'Equitas Small Finance Bank',
      FDRL: 'Federal Bank',
      FSFB: 'Fincare Small Finance Bank',
      HDFC: 'HDFC Bank',
      HDFC_C: 'HDFC Bank - Corporate Banking',
      HSBC: 'Hongkong & Shanghai Banking Corporation',
      IBKL: 'IDBI',
      IBKL_C: 'IDBI - Corporate Banking',
      ICIC: 'ICICI Bank',
      ICIC_C: 'ICICI Bank - Corporate Banking',
      IDFB: 'IDFC FIRST Bank',
      IDIB: 'Indian Bank',
      INDB: 'Indusind Bank',
      IOBA: 'Indian Overseas Bank',
      JAKA: 'Jammu and Kashmir Bank',
      JSBP: 'Janata Sahakari Bank (Pune)',
      JSFB: 'Jana Small Finance Bank',
      KARB: 'Karnataka Bank',
      KCCB: 'Kalupur Commercial Co-operative Bank',
      KJSB: 'Kalyan Janata Sahakari Bank',
      KKBK: 'Kotak Mahindra Bank',
      KKBK_C: 'Kotak Mahindra Bank - Corporate Banking',
      KVBL: 'Karur Vysya Bank',
      LAVB_C: 'Lakshmi Vilas Bank - Corporate Banking',
      LAVB_R: 'Lakshmi Vilas Bank - Retail Banking',
      MAHB: 'Bank of Maharashtra',
      MSNU: 'Mehsana Urban Co-operative Bank',
      NESF: 'North East Small Finance Bank',
      NKGS: 'NKGSB Co-operative Bank',
      ORBC: 'PNB (Erstwhile-Oriental Bank of Commerce)',
      PSIB: 'Punjab & Sind Bank',
      PUNB_R: 'Punjab National Bank - Retail Banking',
      PYTM: 'Paytm Payments Bank',
      RATN: 'RBL Bank',
      RATN_C: 'RBL Bank - Corporate Banking',
      SBBJ: 'State Bank of Bikaner and Jaipur',
      SBHY: 'State Bank of Hyderabad',
      SBIN: 'State Bank of India',
      SBMY: 'State Bank of Mysore',
      SBTR: 'State Bank of Travancore',
      SCBL: 'Standard Chartered Bank',
      SIBL: 'South Indian Bank',
      SRCB: 'Saraswat Co-operative Bank',
      STBP: 'State Bank of Patiala',
      SURY: 'Suryoday Small Finance Bank',
      SVCB: 'Shamrao Vithal Co-operative Bank',
      SVCB_C: 'Shamrao Vithal Bank - Corporate Banking',
      SYNB: 'Syndicate Bank',
      TBSB: 'Thane Bharat Sahakari Bank',
      TJSB: 'Thane Janata Sahakari Bank',
      TMBL: 'Tamilnadu Mercantile Bank',
      TNSC: 'Tamilnadu State Apex Co-operative Bank',
      UBIN: 'Union Bank of India',
      UCBA: 'UCO Bank',
      USFB: 'Ujjivan Small Finance Bank',
      UTBI: 'PNB (Erstwhile-United Bank of India)',
      UTIB: 'Axis Bank',
      VARA: 'Varachha Co-operative Bank',
      VIJB: 'Vijaya Bank',
      YESB: 'Yes Bank',
      YESB_C: 'Yes Bank - Corporate Banking',
      ZCBL: 'Zoroastrian Co-operative Bank',
    },
    short: {
      BARB_R: 'BOB',
      CORP: 'Corporate',
      FDRL: 'Federal',
      HDFC: 'HDFC',
      IBKL: 'IDBI',
      ICIC: 'ICICI',
      ICIC_C: 'ICICI Corporate',
      IDFB: 'IDFC',
      INDB: 'IndusInd',
      IOBA: 'IOB',
      KKBK: 'Kotak',
      PUNB_R: 'PNB',
      SBIN: 'SBI',
      UTIB: 'Axis',
      UTIB_C: 'Axis Corporate',
      VIJB: 'Vijaya Bank',
      YESB: 'Yes',
    },
  },
  callouts: {
    card_offer: {
      credit_debit_callout:
        'All {issuer} cards are supported for this payment.',
      credit_only_callout:
        'All {issuer} credit cards are supported for this payment.',
      debit_only_callout:
        'All {issuer} debit cards are supported for this payment.',
    },
    recurring: {
      credit_debit_callout:
        '{creditIssuers} credit cards and debit cards from {debitIssuers} are supported for this payment.',
      credit_only_callout:
        'Only {issuers} credit cards are supported for this payment.',
      debit_only_callout:
        'Only debit cards from {issuers} are supported for this payment.',
    },
    subscriptions: {
      credit_debit_callout:
        'Subscription payments are supported on {creditIssuers} credit cards and debit cards from {debitIssuers}.',
      credit_only_callout:
        'Subscription payments are supported on {issuers} credit cards.',
      debit_only_callout:
        'Subscription payments are supported on debit cards from {issuers}.',
    },
  },
  card: {
    add_another_card_btn: 'Add another card',
    auth_type_header: 'Complete Payment Using',
    auth_type_otp: 'OTP / Password',
    auth_type_pin: 'ATM PIN',
    bank_verification_action_continue: 'Continue',
    bank_verification_description:
      'Click continue to complete the payment on the bank page',
    bank_verification_title: 'Bank verification required',
    card_number_help: 'Please enter a valid card number.',
    card_number_help_amex: 'Amex cards are not supported for this transaction.',
    card_number_help_recurring: 'Card does not support recurring payments.',
    card_number_help_unsupported: 'This card is not supported for the payment',
    card_number_label: 'Card Number',
    cards_saved_on_apps_label: 'Cards saved on apps',
    cards_saved_on_rzp_label: 'Cards saved on Razorpay',
    cvv_help: "It's a {length} digit code printed on the back of your card.",
    cvv_label: 'CVV',
    enter_card_details_option_label: 'Or, Enter card details',
    expiry_label: 'Expiry',
    name_help: 'Please enter name on your card',
    name_label: "Card Holder's name",
    nocvv_label: "My Maestro Card doesn't have Expiry/CVV",
    recurring_callout:
      'Future payments on this card will be charged automatically.',
    remember_card_label: 'Remember Card',
    saved_card_label: 'Card ending with <b>{last4}<b>',
    subscription_callout:
      'This card will be linked to the subscription and future payments will be charged automatically.',
    subscription_refund_callout:
      'The charge is to enable subscription on this card and it will be refunded.',
    use_saved_cards_btn: 'Use saved cards',
    use_saved_cards_on_rzp_btn: 'Use saved cards on Razorpay',
    view_all_emi_plans: 'View all EMI Plans',
    international_currency_charges:
      'Relevant currency conversion charges might be applicable, as Amex will process the transaction in INR. To avoid currency conversion charges please use MasterCard or Visa.',
  },
  card_subtext: {
    all_cards_supported: 'All cards supported',
    cards: 'cards',
    only: 'Only',
    select: 'select',
    select_bins_supported: 'Only select BINs accepted',
    select_network: 'select network',
    select_networks: 'select networks',
    select_networks_specific_issuers: 'select {issuers}',
    specific_bins_supported: 'Only {bins} accepted',
    supported: 'supported',
  },
  cardless_emi: {
    providers: {
      bajaj: 'Bajaj Finserv',
      cards: 'EMI on Cards',
      credit_debit_cards: 'EMI on Debit/Credit cards',
      earlysalary: 'EarlySalary',
      flexmoney: 'Cardless EMI by InstaCred',
      zestmoney: 'ZestMoney',
      fdrl: 'Federal Bank',
      hdfc: 'HDFC Bank',
      idfb: 'IDFC First Bank',
      kkbk: 'Kotak Mahindra Bank',
    },
    select_option_title: 'Select an option',
  },
  countries: {
    AD: 'Andorra',
    AE: 'United Arab Emirates',
    AF: 'Afghanistan',
    AG: 'Antigua and Barbuda',
    AI: 'Anguilla',
    AL: 'Albania',
    AM: 'Armenia',
    AN: 'Netherlands Antilles',
    AO: 'Angola',
    AQ: 'Antarctica',
    AR: 'Argentina',
    AS: 'American Samoa',
    AT: 'Austria',
    AU: 'Australia',
    AW: 'Aruba',
    AX: 'Åland Islands',
    AZ: 'Azerbaijan',
    BA: 'Bosnia and Herzegovina',
    BB: 'Barbados',
    BD: 'Bangladesh',
    BE: 'Belgium',
    BF: 'Burkina Faso',
    BG: 'Bulgaria',
    BH: 'Bahrain',
    BI: 'Burundi',
    BJ: 'Benin',
    BL: 'Saint Barthelemy',
    BM: 'Bermuda',
    BN: 'Brunei',
    BO: 'Bolivia',
    BR: 'Brazil',
    BS: 'Bahamas',
    BT: 'Bhutan',
    BW: 'Botswana',
    BY: 'Belarus',
    BZ: 'Belize',
    CA: 'Canada',
    CC: 'Cocos Islands',
    CD: 'Democratic Republic of the Congo',
    CF: 'Central African Republic',
    CG: 'Republic of the Congo',
    CH: 'Switzerland',
    CI: 'Ivory Coast',
    CK: 'Cook Islands',
    CL: 'Chile',
    CM: 'Cameroon',
    CN: 'China',
    CO: 'Colombia',
    CR: 'Costa Rica',
    CU: 'Cuba',
    CV: 'Cape Verde',
    CW: 'Curacao',
    CX: 'Christmas Island',
    CY: 'Cyprus',
    CZ: 'Czech Republic',
    DE: 'Germany',
    DJ: 'Djibouti',
    DK: 'Denmark',
    DM: 'Dominica',
    DO: 'Dominican Republic',
    DZ: 'Algeria',
    EC: 'Ecuador',
    EE: 'Estonia',
    EG: 'Egypt',
    EH: 'Western Sahara',
    ER: 'Eritrea',
    ES: 'Spain',
    ET: 'Ethiopia',
    FI: 'Finland',
    FJ: 'Fiji',
    FK: 'Falkland Islands',
    FM: 'Micronesia',
    FO: 'Faroe Islands',
    FR: 'France',
    GA: 'Gabon',
    GB: 'United Kingdom',
    GD: 'Grenada',
    GE: 'Georgia',
    GF: 'French Guiana',
    GG: 'Guernsey',
    GH: 'Ghana',
    GI: 'Gibraltar',
    GL: 'Greenland',
    GM: 'Gambia',
    GN: 'Guinea',
    GP: 'Guadeloupe',
    GQ: 'Equatorial Guinea',
    GR: 'Greece',
    GT: 'Guatemala',
    GU: 'Guam',
    GW: 'Guinea-Bissau',
    GY: 'Guyana',
    HK: 'Hong Kong',
    HN: 'Honduras',
    HR: 'Croatia',
    HT: 'Haiti',
    HU: 'Hungary',
    ID: 'Indonesia',
    IE: 'Ireland',
    IL: 'Israel',
    IM: 'Isle of Man',
    IN: 'India',
    IO: 'British Indian Ocean Territory',
    IQ: 'Iraq',
    IR: 'Iran',
    IS: 'Iceland',
    IT: 'Italy',
    JE: 'Jersey',
    JM: 'Jamaica',
    JO: 'Jordan',
    JP: 'Japan',
    KE: 'Kenya',
    KG: 'Kyrgyzstan',
    KH: 'Cambodia',
    KI: 'Kiribati',
    KM: 'Comoros',
    KN: 'Saint Kitts and Nevis',
    KP: 'North Korea',
    KR: 'South Korea',
    KW: 'Kuwait',
    KY: 'Cayman Islands',
    KZ: 'Kazakhstan',
    LA: 'Laos',
    LB: 'Lebanon',
    LC: 'Saint Lucia',
    LI: 'Liechtenstein',
    LK: 'Sri Lanka',
    LR: 'Liberia',
    LS: 'Lesotho',
    LT: 'Lithuania',
    LU: 'Luxembourg',
    LV: 'Latvia',
    LY: 'Libya',
    MA: 'Morocco',
    MC: 'Monaco',
    MD: 'Moldova',
    ME: 'Montenegro',
    MF: 'Saint Martin',
    MG: 'Madagascar',
    MH: 'Marshall Islands',
    MK: 'Macedonia',
    ML: 'Mali',
    MM: 'Myanmar',
    MN: 'Mongolia',
    MO: 'Macau',
    MP: 'Northern Mariana Islands',
    MQ: 'Martinique',
    MR: 'Mauritania',
    MS: 'Montserrat',
    MT: 'Malta',
    MU: 'Mauritius',
    MV: 'Maldives',
    MW: 'Malawi',
    MX: 'Mexico',
    MY: 'Malaysia',
    MZ: 'Mozambique',
    NA: 'Namibia',
    NC: 'New Caledonia',
    NE: 'Niger',
    NF: 'Norfolk Island',
    NG: 'Nigeria',
    NI: 'Nicaragua',
    NL: 'Netherlands',
    NO: 'Norway',
    NP: 'Nepal',
    NR: 'Nauru',
    NU: 'Niue',
    NZ: 'New Zealand',
    OM: 'Oman',
    PA: 'Panama',
    PE: 'Peru',
    PF: 'French Polynesia',
    PG: 'Papua New Guinea',
    PH: 'Philippines',
    PK: 'Pakistan',
    PL: 'Poland',
    PM: 'Saint Pierre and Miquelon',
    PN: 'Pitcairn',
    PR: 'Puerto Rico',
    PS: 'Palestine',
    PT: 'Portugal',
    PW: 'Palau',
    PY: 'Paraguay',
    QA: 'Qatar',
    RE: 'Reunion',
    RO: 'Romania',
    RS: 'Serbia',
    RU: 'Russia',
    RW: 'Rwanda',
    SA: 'Saudi Arabia',
    SB: 'Solomon Islands',
    SC: 'Seychelles',
    SD: 'Sudan',
    SE: 'Sweden',
    SG: 'Singapore',
    SH: 'Saint Helena',
    SI: 'Slovenia',
    SJ: 'Svalbard and Jan Mayen',
    SK: 'Slovakia',
    SL: 'Sierra Leone',
    SM: 'San Marino',
    SN: 'Senegal',
    SO: 'Somalia',
    SR: 'Suriname',
    SS: 'South Sudan',
    ST: 'Sao Tome and Principe',
    SV: 'El Salvador',
    SX: 'Sint Maarten',
    SY: 'Syria',
    SZ: 'Swaziland',
    TC: 'Turks and Caicos Islands',
    TD: 'Chad',
    TG: 'Togo',
    TH: 'Thailand',
    TJ: 'Tajikistan',
    TK: 'Tokelau',
    TL: 'East Timor',
    TM: 'Turkmenistan',
    TN: 'Tunisia',
    TO: 'Tonga',
    TR: 'Turkey',
    TT: 'Trinidad and Tobago',
    TV: 'Tuvalu',
    TW: 'Taiwan',
    TZ: 'Tanzania',
    UA: 'Ukraine',
    UG: 'Uganda',
    US: 'United States',
    UY: 'Uruguay',
    UZ: 'Uzbekistan',
    VA: 'Vatican',
    VC: 'Saint Vincent and the Grenadines',
    VE: 'Venezuela',
    VG: 'British Virgin Islands',
    VI: 'U.S. Virgin Islands',
    VN: 'Vietnam',
    VU: 'Vanuatu',
    WF: 'Wallis and Futuna',
    WS: 'Samoa',
    XK: 'Kosovo',
    YE: 'Yemen',
    YT: 'Mayotte',
    ZA: 'South Africa',
    ZM: 'Zambia',
    ZW: 'Zimbabwe',
  },
  cta: {
    amount: 'Pay {amount}',
    apply_offer: 'Apply Offer',
    authenticate: 'Authenticate',
    confirm_account: 'Confirm Account',
    continue: 'Continue',
    copied: 'Copied',
    copy_details: 'Copy Details',
    enter_card_details: 'Enter Card Details',
    next: 'Next',
    pay_single_method: 'Pay using {method}',
    pay_without_offer: 'Pay Without Offer',
    pay: 'Pay',
    proceed: 'Proceed',
    select_emi_plan: 'Select EMI Plan',
    submit: 'Submit',
    upload_nach_form: 'Upload NACH Form',
    verify: 'Verify',
    view_emi_plans: 'View EMI Plans',
  },
  dcc: {
    search_all: 'All currencies',
    search_placeholder: 'Search for currency or code',
    search_title: 'Select Currency to Pay',
  },
  debit_emi: {
    card_box_title: 'SELECTED DEBIT CARD',
    contact_description:
      'Enter the mobile number registered with your bank and Debit Card.',
    contact_help: 'Please enter a valid indian mobile number',
    contact_title: 'MOBILE NUMBER',
  },
  emandate: {
    account_number_help: 'Please enter a valid account number',
    account_number_label: 'Bank Account Number',
    account_type_current: 'Current Account',
    account_type_help: 'Please select a bank account type',
    account_type_label: 'Type of Bank Account',
    account_type_savings: 'Savings Account',
    auth_type_debit_description: 'via Bank Account and Debit Card details',
    auth_type_debit_title: 'Debit Card',
    auth_type_header: 'Authenticate using',
    auth_type_netbanking_description: 'via Bank Account and Netbanking details',
    auth_type_netbanking_title: 'Netbanking',
    auth_type_aadhaar_title: 'Aadhaar',
    auth_type_aadhaar_description: 'via Bank Account and Aadhaar details',
    change_bank_btn: 'Change Bank',
    ifsc_help: 'Please enter a valid IFSC',
    ifsc_label: 'IFSC',
    name_help: 'Please enter a valid Name as per your account',
    name_label: 'Account Holder Name',
  },
  emi: {
    available_action: 'Pay with EMI',
    available_text: 'EMI Available',
    credit_emi_description:
      'Full amount of {amount} will be deducted from your account, which will be converted into EMI by your bank in 3-4 days.',
    description_monthly_installment: 'Monthly Installment: {amount}',
    description_total_amount:
      'Total Amount: {totalAmount} ({monthlyAmount} x {duration})',
    edit_plan_action: 'Edit',
    edit_plan_text: '{duration} Months ({amount}/mo)',
    axis_bank_emi:
      'Full amount of Rs {amount} would be deducted from your account, which will be converted into EMI by your bank in 3-4 days. Convenience fee of 1% of transaction amount or Rs 100 whichever is higher + GST applicable for EMI transactions on Axis bank cards.',
    citi_bank_emi:
      'Full amount of {amount} will be deducted from your account. EMI processing may take upto 8 working days.',
    citi_know_more:
      'In case the total amount due has not been paid in full, finance charges as applicable (currently, between 3.50%- 3.60% per month i.e. 42-43.2% annualized) on card balances may apply until the EMI is converted & posted to the card. Latest rates are available at ',
    show_more: 'Show More',
    show_less: 'Show Less',
    citi_url:
      'https://www.online.citibank.co.in/portal/newgen/cards/tab/creditcards_tc.htm',
    hdfc_debit_description_convenience:
      ' Convenience Fee of ₹199 + GST applicable for EMI transactions on HDFC Bank Cards.',
    hdfc_debit_description_includes_interest: '(includes interest).',
    hdfc_debit_description_min_balance:
      'No minimum balance is required. There will be no amount blocked on your card. You will pay ',
    interest_charged_label: 'Interest charged by the bank',
    no_cost_discount_label: 'No Cost EMI offer discount',
    no_cost_explain_action: '+ How does it work?',
    no_cost_label: 'No Cost',
    pay_entire_amount_action: 'Pay entire amount',
    pay_entire_amount_count: '({count} cards available)',
    plan_list_callout_agreement:
      'By clicking on Pay, you agree to the terms of our ',
    plan_list_callout_agreement_highlight: 'Loan Agreement',
    plan_list_pay_entire_action: 'Pay entire amount',
    plan_list_title: 'Select an EMI Plan',
    plan_list_title_without_offer: 'Plans without offer',
    plan_list_view_all_action: 'View all EMI Plans',
    plan_title: '{duration} months ({amount}/mo)',
    saved_card_unavailable_help: 'EMI is not available on this card',
    unavailable_btn: 'EMI unavailable',
    unavailable_help:
      'EMI is available on {issuers} cards. Enter your credit card to avail.',
  },
  emi_details: {
    effective_interest_info:
      '<b>Zero effective interest:<b> you get upfront discount equal to interest charged by the bank.',
    installment_label: 'EMI',
    interest_label: 'Interest',
    no_cost_description:
      'You are buying a product worth <b>{amount} on a {duration}-month EMI period.<b> The bank used charges <b>{rate}% interest<b> per annum.',
    no_cost_header: 'How does No Cost EMI work?',
    no_cost_label: 'No Cost EMI',
    normal_emi_label: 'Normal EMI',
    tenure: '{duration} Months',
    tenure_label: 'Tenure',
    total_amount_label: 'Total Amount',
    you_save_info: 'You save {amount}',
  },
  emi_issuers: {
    AMEX: 'American Express',
    BAJAJ: 'Bajaj Finserv',
    BARB: 'Bank of Baroda',
    CITI: 'CITI Bank',
    HDFC: 'HDFC Credit Cards',
    HDFC_DC: 'HDFC Debit Cards',
    ICIC: 'ICICI Bank',
    INDB: 'Indusind Bank',
    KKBK: 'Kotak Mahindra Bank',
    RATN: 'RBL Bank',
    SBIN: 'State Bank of India',
    SCBL: 'Standard Chartered Bank',
    UTIB: 'Axis Bank',
    YESB: 'Yes Bank',
  },
  emi_modal: {
    emi_tenure: '{duration} Months',
    emi_tenure_label: 'EMI Tenure',
    installments_label: 'Monthly Installments',
    interest_rate_label: 'Interest Rate',
    select_bank_label: 'Select Bank:',
    total_label: 'Total Money',
  },
  fees: {
    amount_label: 'Amount',
    breakup_title: 'Fees Breakup',
    continue_action: 'Continue',
    gateway_charges_label: 'Convenience Charges',
    gst_label: 'GST on {label}',
    loading_message: 'Loading fees breakup...',
    total_charges_label: 'Total Charges',
  },
  home: {
    account_numer_label: 'Account Number',
    address_help: 'Address should be at least 10 characters long',
    address_label: 'Address',
    bank_details_heading: 'Bank Details',
    config_block_default_title: 'Available Payment Methods',
    contact_help_text: 'Please enter a valid contact number',
    contact_label_optional: 'Phone (Optional)',
    contact_label_required: 'Phone',
    country_help_text: 'Please enter a valid country code',
    country_label: 'Country',
    country_search_all: 'All countries',
    country_search_placeholder: 'Search a country',
    customer_name_label: 'Customer Name',
    email_help_text: 'Please enter a valid email. Example: you@example.com',
    email_label_optional: 'Email (Optional)',
    email_label_required: 'Email',
    full_amount_label: 'Pay in full',
    ifsc_label: 'IFSC Code',
    min_amount_label: 'Minimum first amount',
    multi_tpv_netbanking_title: 'A/C: {accountNumber}',
    multi_tpv_title: 'Pay Using',
    multi_tpv_upi_subtitle: '{bankName} Account {accountNumber}',
    multi_tpv_upi_title: 'UPI',
    partial_amount_description: 'Pay some now and the remaining later.',
    partial_amount_edit_label: 'Change Amount',
    partial_amount_help_higher: 'Amount cannot exceed {amount}',
    partial_amount_help_invalid: 'Please enter a valid amount upto {amount}',
    partial_amount_help_lower: 'Minimum payable amount is {amount}',
    partial_amount_label: 'Make payment in parts',
    partial_amount_placeholder: 'Enter amount',
    partial_amount_status_full: 'Paying full amount',
    partial_amount_status_partial: 'Paying in parts',
    partial_payment_title: 'Select a payment type',
    pincode_help: 'Enter 6 digit pincode',
    pincode_label: 'PIN Code',
    preferred_block_title: 'Preferred Payment Methods',
    secured_by_message: 'This payment is secured by Razorpay.',
    single_block_title: 'Pay via {method}',
    state_help: 'Select a value from list of states',
    state_label: 'Select State',
  },
  instruments: {
    titles: {
      app: '{name}',
      card_logged_in: '{bank} {type} card - {last4}',
      card_logged_out: 'Use your {bank} {type} card',
      cardless_emi: 'EMI - {name}',
      emi_logged_in: 'EMI - {bank} {type} card - {last4}',
      emi_logged_out: 'EMI - Use your {bank} {type} card',
      emi_saved_cards: 'EMI - Use your saved cards',
      netbanking: 'Netbanking - {name}',
      paylater: 'Pay Later - {name}',
      paypal: 'PayPal',
      saved_cards: 'Use your saved cards',
      upi: 'UPI - {name}',
      upiqr: 'UPI QR',
      wallet: 'Wallet - {name}',
    },
  },
  methods: {
    descriptions: {
      cardless_emi: 'EMI via {text}',
      emandate: 'Pay with Netbanking',
      emi: 'EMI via Credit & Debit Cards',
      gpay: 'Instant payment using Google Pay App',
      netbanking: 'All Indian banks',
      paylater: '{providers}',
      paypal: 'Only PayPal accounts issued outside India accepted',
      qr: 'Pay by scanning QR Code',
      recurring_cards: '{networks} credit cards',
      upi: 'Instant payment using UPI App',
      upi_otm: 'Pay later using BHIM',
      upi_recurring: 'Pay using BHIM or PayTM App',
    },
    prefixes: {
      bank_transfer: 'Bank Transfer',
      card: 'Cards',
      credit_cards: 'Credit cards',
      credit_debit: 'Credit/Debit',
      credit_debit_cards: 'Credit/Debit cards',
      debit_cards: 'Debit cards',
      debit_credit_cards: 'Debit/Credit cards',
      emi: 'EMI',
      gpay: 'Google Pay',
      netbanking: 'Netbanking',
      paylater: 'PayLater',
      paypal: 'PayPal',
      qr: 'UPI QR',
      upi: 'UPI',
      upi_otm: 'UPI OTM',
      wallet: 'Wallets',
    },
    titles: {
      bank_transfer: 'Bank Transfer',
      card: 'Card',
      cardless_emi: 'Cardless EMI',
      cred: 'CRED',
      credit_card: 'Credit Card',
      debit_card: 'Debit Card',
      emandate: 'Emandate',
      emi: 'EMI',
      generic: 'Pay using {name}',
      google_pay_cards: 'Google Pay Cards',
      gpay: 'Google Pay',
      irctc_card: 'Debit/Credit Card',
      irctc_upi: 'BHIM/UPI',
      nach: 'NACH',
      netbanking: 'Netbanking',
      paylater: 'Pay Later',
      paypal: 'PayPal',
      qr: 'UPI QR',
      upi: 'UPI',
      upi_otm: 'UPI OTM',
      upiqr: 'UPI / QR',
      wallet: 'Wallet',
    },
  },
  misc: {
    acs_load_delay: 'Seems like your bank page is taking time to load.',
    and_more: '{text} & More',
    cancel_action: 'Cancel Payment',
    checking_payment_status: 'Checking the payment status...',
    complete_payment_on_app: 'Please complete the payment on the {app}',
    confirm_cancel_heading: 'Cancel payment?',
    confirm_cancel_message:
      'Your payment is ongoing. Are you sure you want to cancel the payment?',
    confirm_cancel_positive_text: 'Yes, cancel',
    confirm_cancel_negative_text: 'No',
    downtime_multiple_methods:
      '{method} are facing temporary issues right now.',
    downtime_single_method: '{method} is facing temporary issues right now.',
    error_handling_request: 'There was an error in handling your request.',
    frequently_used_config_title: 'Frequently used methods',
    go_to_payment: 'Go to payment',
    list_multiple_combined: '{init}, and {last}',
    list_two_combined: '{one} and {two}',
    loading: 'Loading',
    logout_action: 'Log out',
    logout_all_devices_action: 'Log out from all devices',
    payment_canceled: 'Payment cancelled',
    payment_incomplete: 'Payment did not complete.',
    payment_processing: 'Your payment is being processed',
    payment_timeout: 'Payment did not complete on time',
    payment_waiting_confirmation: 'Waiting for payment confirmation.',
    payment_waiting_on_bank: 'Waiting for payment to complete on bank page',
    processing: 'Processing...',
    redirecting_bank: 'Redirecting to Bank page',
    redirecting_to_app: 'Redirecting you to the {app}...',
    retry: 'Retry',
    search_no_results: 'No results for "{query}"',
    search_results_label: 'Results',
    select_another_method: 'Please select another method.',
  },
  nach: {
    allowed_formats_info:
      'Only {extensions} files with size less than {size} MB are allowed',
    attaching_message: 'Attaching your NACH form',
    attachment_info:
      'Please upload a clear and legible copy of your signed NACH form',
    confirm_cancel: 'Are you sure you want to stop uploading your NACH form?',
    image_info:
      'The image should not be <strong>cropped<strong> and should not have any <strong>shadows<strong>',
    uploading_message: 'Uploading your NACH form',
  },
  netbanking: {
    corporate_label: 'Corporate',
    downtime_low_callout:
      '<strong>{bank}<strong> accounts are experiencing low success rates.',
    downtime_high_callout:
      '<strong>{bank}<strong> accounts are temporarily unavailable right now. Please select another bank.',
    recurring_callout:
      'Future payments from your bank account will be charged automatically.',
    retail_label: 'Retail',
    search_all: 'All banks',
    search_placeholder: 'Search for bank',
    search_title: 'Select bank to pay',
    select_help: 'Please select a bank',
    select_label: 'Select a different bank',
    selection_radio_text: 'Complete Payment Using',
  },
  networks: {
    AMEX: 'Amex',
    DICL: 'Diners Club',
    JCB: 'JCB',
    MAES: 'Maestro',
    MC: 'MasterCard',
    RUPAY: 'RuPay',
    VISA: 'Visa',
  },
  offers: {
    available_offers_header: 'Available Offers',
    back_action: 'Back',
    cashback_detail: 'Cashback would be credited to source mode of payment.',
    change_action: 'Change',
    continue_without_offer_action: 'Continue without offer',
    hide_action: 'Hide',
    no_cost_emi: 'No Cost EMI',
    no_offer_available_method_message:
      'No offers available for this method. Please look at other offers available below',
    not_applicable_card_message: 'Offer is not applicable on this card.',
    not_applicable_error: 'The offer is not applicable on {error}',
    offer_applied_message: 'Offer Applied!',
    offers_available_message: '{count} Offers Available',
    other_offers_action: '+ OTHER OFFERS',
    other_offers_count: '({count} more)',
    other_offers_header: 'Other Offers',
    pay_original_message: 'You can pay the original amount.',
    remove_action: 'Remove Offer',
    select_action: 'Select',
    select_offer_header: 'Select an offer',
    you_save_message: 'You save {amount}',
  },
  otp: {
    add_funds_label: 'Add Funds',
    back_label: 'Go Back',
    otp_field_help: 'Please enter the OTP',
    resend_label: 'Resend OTP',
    retry_label: 'Retry',
    skip_text: {
      complete_bank_page: "Complete on bank's page",
      resend_otp: 'Resend OTP',
      skip_saved_cards: 'Skip Saved Cards',
      skip_saving_card: 'Skip saving card',
    },
    title: {
      cardlessemi_plans:
        'Enter the OTP sent on {phone} to get EMI plans for {provider}',
      cardlessemi_sending:
        'Looking for {provider} account associated with {phone}',
      incorrect_otp_retry: 'Entered OTP was incorrect. Re-enter to proceed.',
      loading: 'Loading...',
      otp_proceed_with_upi_subscription:
        'Enter OTP sent to {phone} to proceed with the subscription',
      otp_resent_generic: 'OTP Resent',
      otp_resent_successful: 'OTP has been resent successfully.',
      otp_sending_generic: 'Sending OTP to {phone}',
      otp_sent_access_card: 'Enter OTP sent to {phone} to access Saved Cards',
      otp_sent_generic: 'An OTP has been sent on {phone}',
      otp_sent_phone: 'Enter OTP sent on {phone} to complete the payment',
      otp_sent_no_phone: 'Enter OTP to complete payment',
      otp_sent_save_card: 'Enter OTP sent to {phone} to save your card',
      otp_sent_save_card_recurring:
        'Enter OTP sent to {phone} to save your card for future payments',
      paylater_continue:
        'Enter the OTP sent on {phone} to continue with {provider}',
      paylater_sending:
        'Looking for {provider} account associated with {phone}',
      payment_processing: 'Your payment is being processed',
      resending_otp: 'Resending OTP...',
      saved_cards_sending: 'Looking for saved cards associated with {phone}',
      verifying_otp: 'Verifying OTP...',
      wallet_insufficient_balance: 'Insufficient balance in your wallet',
      wallet_sending: 'Looking for {wallet} account associated with {phone}',
    },
    try_different_label: 'Try different payment method',
    misc: {
      security_text:
        'Your transaction is processed through a secure 128 bit https internet connection based on secure socket layer technology. For security purpose, your IP address {ipAddress} and access time {accessTime} have been logged.',
    },
  },
  paylater: {
    providers: {
      epaylater: 'ePayLater',
      getsimpl: 'Simpl',
      icic: 'ICICI Bank PayLater',
      hdfc: 'FlexiPay by HDFC Bank',
    },
    select_option_title: 'Select an option',
  },
  payouts: {
    account_number_confirm_help: 'Re-enter account number',
    account_number_confirm_label: 'Re-enter account number',
    account_number_help: 'Please enter a valid account number',
    account_number_label: 'Bank Account Number',
    add_bank_action: 'Add Bank Account',
    add_bank_button_description: 'Add a Bank Account',
    add_bank_button_title: 'BANK',
    add_upi_action: 'Add UPI ID',
    add_upi_button_description: 'Add a UPI ID (BHIM, PhonePe and more)',
    add_upi_button_title: 'UPI',
    ifsc_help: 'Please enter a valid IFSC',
    ifsc_label: 'IFSC',
    name_help: 'Please enter a valid account name',
    name_label: 'Account Holder Name',
    select_account_description:
      '{amount} will be credited to your specified account.',
    select_account_title: 'Select an account',
    select_bank_title: 'Select a Bank Account',
    select_upi_title: 'Select a UPI ID',
  },
  popup: {
    loading_method_page: 'Loading {method} page…',
    paying: 'PAYING',
    payment_canceled: 'Payment processing cancelled by user',
    processing: 'Processing, Please Wait...',
    redirecting: 'Redirecting...',
    secured_by: 'Secured by',
    trying_bank_page_msg:
      'The bank page is taking time to load. You can either wait or change the payment method.',
    trying_to_load: 'Still trying to load...',
    wait_while_we_redirect:
      'Please wait while we redirect you to your {method} page.',
    want_to_cancel: 'Do you want to cancel the ongoing payment?',
  },
  qr: {
    downtime_text: '<strong>UPI QR<strong> is experiencing low success rate.',
    generating_label: 'Generating QR Code...',
    payment_status_checking: 'Checking payment status...',
    retry: 'Retry',
    scan_on_phone:
      'Scan the QR using any UPI app on your phone like BHIM, PhonePe, Google Pay etc.',
  },
  tab_titles: {
    bank_transfer: 'Bank Transfer',
    card: 'Card',
    cardless_emi: 'EMI',
    credit_card: 'Credit Card',
    debit_card: 'Debit Card',
    emandate: 'Account Details',
    emandate_account: 'Bank Account',
    emi: 'EMI',
    emiplans: 'EMI Plans',
    gpay: 'Google Pay',
    irctc_card: 'Debit/Credit Card',
    irctc_upi: 'BHIM/UPI',
    nach: 'NACH',
    netbanking: 'Netbanking',
    otp: 'Enter OTP',
    paylater: 'Pay Later',
    payout_account: 'Add Bank Account',
    payout_upi: 'Add UPI ID',
    paypal: 'PayPal',
    qr: 'UPI QR',
    upi: 'UPI',
    upi_otm: 'UPI Mandate',
    wallet: 'Wallet',
  },
  upi: {
    cancel_reason_back_action: 'Back',
    cancel_reason_collect_not_received: 'Did not receive collect request',
    cancel_reason_failed_in_app: 'Payment failed in UPI app',
    cancel_reason_money_deducted:
      'Money got deducted but payment is still processing',
    cancel_reason_other: 'Other',
    cancel_reason_submit_action: 'Submit',
    cancel_reason_title: 'Please give us a reason before we cancel the payment',
    collect_block_heading: 'Pay using UPI ID',
    collect_block_subheading:
      'You will receive a payment request on your UPI app',
    collect_enter_upi_id: 'Enter your UPI ID',
    collect_new_vpa_help: 'Please enter a valid VPA of the form username@bank',
    collect_securely_save: 'Securely save your UPI ID',
    downtime_text: '<strong>UPI<strong> is experiencing low success rate.',
    gpay_block_heading: 'Pay using Gpay App',
    gpay_web_api_title: 'Google Pay',
    intent_accept_request:
      "Please accept the request from Razorpay's VPA on your UPI app",
    intent_block_heading: 'PAY USING APPS',
    intent_no_apps_error:
      'No UPI App on this device. Select other UPI option to proceed.',
    intent_select_app: 'Select UPI App in your device',
    invalid_vpa_default_message:
      'Invalid VPA, please try again with correct VPA',
    new_vpa_subtitle: 'Google Pay, BHIM, PhonePe & more',
    new_vpa_subtitle_upi_otm:
      'Please note, you can only complete this payment using <strong>BHIM App<strong> or <strong>PayTM App<strong>',
    new_vpa_title_logged_in: 'Add UPI ID',
    new_vpa_title_logged_out: 'UPI ID',
    omni_block_heading: 'Or, pay using phone number',
    omni_enter_number: 'Enter your phone number',
    omni_error:
      'Please ensure the same number is linked to the Google Pay account.',
    omni_gpay_number: 'Google Pay phone number',
    omni_verifying_phone: 'Verifying mobile number with Google Pay..',
    qr_block_heading: 'Pay using QR Code',
    recommended: 'Recommended',
    recurring_subscription_callout:
      'The charge is to enable subscription on this card and it will be refunded.',
    recurring_caw_callout_all_data:
      'This is a recurring payment and upto {maxAmount} will be charged now. {merchantName} can charge upto {amount} on a {recurringFrequency} basis till {endDate}.',
    recurring_caw_callout_no_frequency:
      'This is a recurring payment and {maxAmount} will be charged now. {merchantName} can charge upto {amount} anytime till {endDate}.',
    recurring_caw_callout_no_name:
      'This is a recurring payment and upto {maxAmount} will be charged now. You will be charged upto {amount} on a {recurringFrequency} basis till {endDate}.',
    recurring_caw_callout_no_name_no_frequency:
      'This is a recurring payment and {maxAmount} will be charged now. You will be charged upto {amount} anytime till {endDate}.',
    redirect_to_app: 'You will be redirected to your UPI app',
    scan_qr_code: 'Scan the QR code using your UPI app',
    supported_banks:
      'You can only pay using UPI ID linked with either <strong>ICICI Bank<strong> or <strong>SBI Bank<strong>',
    upi_id_linked_to_bank: 'UPI ID is linked to',
    show_other_apps: 'Show other UPI apps',
    show_qr_code: 'Show QR Code',
    subscription_refund_callout:
      'This card will be linked to the subscription and future payments will be charged automatically.',
    upi_otm_callout:
      '<strong>{amount}<strong> will be blocked on your account by clicking pay. Your account will be charged {nameString} between <strong>{startDate}<strong> to <strong>{endDate}<strong>.',
    use_saved_cards_btn: 'Use saved cards',
    use_saved_cards_on_rzp_btn: 'Use saved cards on Razorpay',
    view_all_emi_plans: 'View all EMI Plans',
    verifying_vpa_info: 'Verifying your VPA',
  },
  upi_intent_apps: {
    amazon: 'Amazon Pay UPI',
    axis: 'Axis Mobile',
    axispay: 'Axis Pay',
    'bank-of-baroda': 'Baroda Pay',
    bhim: 'BHIM',
    cred: 'CRED',
    'dcb-bank': 'DCB Bank',
    dena: 'Dena UPI',
    digibank: 'Digibank by DBS India',
    fino: 'Fino BPay',
    finserv: 'Finserv MARKETS',
    freecharge: 'Freecharge',
    google_pay: 'Google Pay',
    'hdfc-bank': 'HDFC Bank',
    hike: 'Hike',
    'icici-pocket': 'Pockets-UPI (ICICI Bank)',
    idfc: 'IDFC First Bank',
    imobile: 'iMobile by ICICI Bank',
    induspay: 'IndusPay',
    'jk-upi': 'JK Bank UPI',
    kotak: 'Kotak Bank UPI',
    kvb: 'KVB Upay',
    lazypay: 'LazyPay',
    lotza: 'LOTZA UPI',
    'microsoft-kaizala': 'Microsoft Kaizala',
    mipay: 'Mi Pay',
    oriental: 'Oriental Pay',
    paytm: 'PayTM',
    payzapp: 'PayZapp',
    phonepe: 'PhonePe',
    'pnb-bank': 'PNB Bank',
    'rbl-mobank': 'RBL Bank MoBank',
    samsung: 'Samsung Pay',
    'samsung-mini': 'Samsung Pay Mini',
    sbi: 'SBI Bank',
    sibmirror: 'SIB Mirror',
    'united-upi': 'United UPI Pay',
    vijaya: 'VIJAYA UPI',
    'whatsapp-biz': 'WhatsApp Business',
    wizely: 'Wizely',
    'yes-bank': 'Yes Bank',
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
  powered_by: {
    partnership_label: 'In partnership with',
    powered_by_label: 'Powered By',
  },
  rewards: {
    header:
      'Pay successfully now & unlock <strong>exciting rewards for free,<strong> for your future buys!',
    sub_text: 'Look for these rewards from amazing brands in your mail box!',
    close: 'Close',
    tooltip_text: 'Unlock free rewards after payment',
  },
  trusted_badge: {
    header: 'Razorpay Verified Seller',
    highlight1: 'Trusted by {customersNo} customers',
    highlight2: 'Secured Razorpay merchant for {securedTime} months',
    highlight3: 'No fraud transaction for last {noFraudTime} months',
  },
};
