export default {
  netbanking: {
    select_label: 'Select a different bank',
    select_help: 'Please select a bank',

    search_title: 'Select bank to pay',
    search_placeholder: 'Search for bank',
    search_all: 'All banks',

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

    bank_verification_title: 'Bank verification required',
    bank_verification_description:
      'Click continue to complete the payment on the bank page',
    bank_verification_action_continue: 'Continue',

    amex_unsupported_error: 'AMEX cards are not supported',

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

    plan_title: '{duration} months ({amount}/mo)',
    no_cost_label: 'No Cost',

    plan_list_title: 'Select an EMI Plan',
    plan_list_title_without_offer: 'Plans without offer',
    plan_list_view_all_action: 'View all EMI Plans',
    plan_list_pay_entire_action: 'Pay entire amount',
    plan_list_callout_agreement:
      'By clicking on Pay, you agree to the terms of our ',
    plan_list_callout_agreement_highlight: 'Loan Agreement',

    interest_charged_label: 'Interest charged by the bank',
    no_cost_discount_label: 'No Cost EMI offer discount',
    no_cost_explain_action: '+ How does it work?',

    credit_emi_description:
      'Full amount of {amount} will be deducted from your account, which will be converted into EMI by your bank in 3-4 days.',
    hdfc_debit_description_min_balance:
      'No minimum balance is required. There will be no amount blocked on your card. You will pay ',
    hdfc_debit_description_includes_interest: '(includes interest).',
    hdfc_debit_description_convenience:
      ' Convenience Fee of ₹99 + GST applicable for EMI transactions on HDFC Bank Cards.',
    description_monthly_installment: 'Monthly Installment: {amount}',
    description_total_amount:
      'Total Amount: {totalAmount} ({monthlyAmount} x {duration})',
  },
  emi_modal: {
    select_bank_label: 'Select Bank:',
    emi_tenure_label: 'EMI Tenure',
    emi_tenure: '{duration} Months',
    interest_rate_label: 'Interest Rate',
    installments_label: 'Monthly Installments',
    total_label: 'Total Money',
  },
  emi_details: {
    installment_label: 'EMI',
    tenure_label: 'Tenure',
    tenure: '{duration} Months',
    interest_label: 'Interest',
    no_cost_header: 'How does No Cost EMI work?',
    no_cost_description:
      'You are buying a product worth <b>{amount} on a {duration}-month EMI period.<b> The bank used charges <b>{rate}% interest<b> per annum.',
    normal_emi_label: 'Normal EMI',
    no_cost_label: 'No Cost EMI',
    total_amount_label: 'Total Amount',
    effective_interest_info:
      '<b>Zero effective interest:<b> you get upfront discount equal to interest charged by the bank.',
    you_save_info: 'You save {amount}',
  },
  debit_emi: {
    card_box_title: 'SELECTED DEBIT CARD',
    contact_title: 'MOBILE NUMBER',
    contact_description:
      'Enter the mobile number registered with your bank and Debit Card.',
    contact_help: 'Please enter a valid indian mobile number',
  },
  bajaj_finserv: {
    card_details_header: 'Enter Card Details',
    card_number_label: 'Card Number',
    card_number_help: 'Please enter a valid Bajaj Finserv issued card number',
    name_label: "Card Holder's Name",
    name_help: 'Please enter name on your card',
    callout:
      'You need to have a <strong>Bajaj Finserv issued card<strong> to continue.',
  },
  fees: {
    loading_message: 'Loading fees breakup...',
    breakup_title: 'Fees Breakup',
    amount_label: 'Amount',
    gateway_charges_label: 'Gateway Charges',
    gst_label: 'GST on {label}',
    total_charges_label: 'Total Charges',
    continue_action: 'Continue',
  },
  home: {
    preferred_block_title: 'Preferred Payment Methods',
    single_block_title: 'Pay via {method}',
    config_block_default_title: 'Available Payment Methods',

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
    multi_tpv_netbanking_title: 'A/C: {accountNumber}',
    multi_tpv_upi_title: 'UPI',
    multi_tpv_upi_subtitle: '{bankName} Account {accountNumber}',
    bank_details_heading: 'Bank Details',
    account_numer_label: 'Account Number',
    customer_name_label: 'Customer Name',
    ifsc_label: 'IFSC Code',

    secured_by_message: 'This payment is secured by Razorpay.',

    country_search_all: 'All countries',
    country_search_placeholder: 'Search a country',
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
  nach: {
    attaching_message: 'Attaching your NACH form',
    uploading_message: 'Uploading your NACH form',
    attachment_info:
      'Please upload a clear and legible copy of your signed NACH form',
    image_info:
      'The image should not be <strong>cropped<strong> and should not have any <strong>shadows<strong>',
    allowed_formats_info:
      'Only {extensions} files with size less than {size} MB are allowed',
    confirm_cancel: 'Are you sure you want to stop uploading your NACH form?',
  },
  payouts: {
    select_account_title: 'Select an account',
    select_account_description:
      '{amount} will be credited to your specified account.',
    select_upi_title: 'Select a UPI ID',
    add_upi_action: 'Add UPI ID',
    select_bank_title: 'Select a Bank Account',
    add_bank_action: 'Add Bank Account',

    add_upi_button_title: 'UPI',
    add_upi_button_description: 'Add a UPI ID (BHIM, PhonePe and more)',

    add_bank_button_title: 'BANK',
    add_bank_button_description: 'Add a Bank Account',

    account_number_label: 'Bank Account Number',
    account_number_help: 'Please enter a valid account number',

    account_number_confirm_label: 'Re-enter account number',
    account_number_confirm_help: 'Re-enter account number',

    ifsc_label: 'IFSC',
    ifsc_help: 'Please enter a valid IFSC',

    name_label: 'Account Holder Name',
    name_help: 'Please enter a valid account name',
  },
  offers: {
    not_applicable_card_message: 'Offer is not applicable on this card.',
    offer_applied_message: 'Offer Applied!',
    you_save_message: 'You save {amount}',
    offers_available_message: '{count} Offers Available',
    change_action: 'Change',
    select_action: 'Select',
    back_action: 'Back',
    hide_action: 'Hide',
    continue_without_offer_action: 'Continue without offer',
    not_applicable_error: 'The offer is not applicable on {error}',
    pay_original_message: 'You can pay the original amount.',
    select_offer_header: 'Select an offer',
    available_offers_header: 'Available Offers',
    no_offer_available_method_message:
      'No offers available for this method. Please look at other offers available below',
    other_offers_header: 'Other Offers',
    other_offers_action: '+ OTHER OFFERS',
    other_offers_count: '({count} more)',
    no_cost_emi: 'No Cost EMI',
    cashback_detail: 'Cashback would be credited to source mode of payment.',
    remove_action: 'Remove Offer',
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
      upi_otm: 'UPI OTM',
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
      irctc_card: 'Debit/Credit Card',
      irctc_upi: 'BHIM/UPI',
    },
    descriptions: {
      emandate: 'Pay with Netbanking',
      emi: 'EMI via Credit & Debit Cards',
      netbanking: 'All Indian banks',
      paypal: 'Pay using PayPal wallet',
      qr: 'Pay by scanning QR Code',
      gpay: 'Instant payment using Google Pay App',
      upi: 'Instant payment using UPI App',
      upi_otm: 'Pay later using BHIM and HDFC',
      cardless_emi: 'EMI via {text}',
      recurring_cards: '{networks} credit cards',
      paylater: 'Pay later using {providers}',
    },
  },
  otp: {
    add_funds_label: 'Add Funds',
    try_different_label: 'Try different payment method',
    retry_label: 'Retry',
    resend_label: 'Resend OTP',
    back_label: 'Go Back',
    otp_field_help: 'Please enter the OTP',
    skip_text: {
      complete_bank_page: "Complete on bank's page",
      skip_saved_cards: 'Skip Saved Cards',
      skip_saving_card: 'Skip saving card',
      resend_otp: 'Resend OTP',
    },
    title: {
      loading: 'Loading...',
      insufficient_wallet_balance: 'Insufficient balance in your wallet',
      native_otp_sent: 'Enter OTP to complete the payment',
      resending_otp: 'Resending OTP...',
      verifying_otp: 'Verifying OTP...',
      saved_cards_sending: 'Looking for saved cards associated with {phone}',
      wallet_sending: 'Looking for {wallet} account associated with {phone}',
      paylater_sending:
        'Looking for {provider} account associated with {phone}',
      cardlessemi_sending:
        'Looking for {provider} account associated with {phone}',
      cardlessemi_plans:
        'Enter the OTP sent on {phone} to get EMI plans for {provider}',
      otp_sent_save_card: 'Enter OTP sent to {phone} to save your card',
      otp_sent_save_card_recurring:
        'Enter OTP sent to {phone} to save your card for future payments',
      otp_sent_access_card: 'Enter OTP sent to {phone} to access Saved Cards',
      otp_sending_generic: 'Sending OTP to {phone}',
      otp_sent_generic: 'An OTP has been sent on {phone}',
      otp_sent_no_phone: 'Enter OTP to complete payment',
      otp_resent_generic: 'OTP Resent',
      otp_resent_successful: 'OTP has been resent successfully.',
      payment_processing: 'Your payment is being processed',
      wallet_insufficient_balance: 'Insufficient balance in your wallet',
      incorrect_otp_retry: 'Entered OTP was incorrect. Re-enter to proceed.',
      paylater_continue:
        'Enter the OTP sent on {phone} to continue with {provider}',
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
    upi_otm: 'UPI Mandate',
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
  emi_issuers: {
    KKBK: 'Kotak Mahindra Bank',
    HDFC_DC: 'HDFC Debit Cards',
    HDFC: 'HDFC Credit Cards',
    UTIB: 'Axis Bank',
    INDB: 'Indusind Bank',
    RATN: 'RBL Bank',
    ICIC: 'ICICI Bank',
    SCBL: 'Standard Chartered Bank',
    YESB: 'Yes Bank',
    AMEX: 'American Express',
    SBIN: 'State Bank of India',
    BARB: 'Bank of Baroda',
    BAJAJ: 'Bajaj Finserv',
    CITI: 'CITI Bank',
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
      credit_debit_cards: 'EMI on Debit/Credit cards',
      cards: 'EMI on Cards',
      bajaj: 'Bajaj Finserv',
      earlysalary: 'EarlySalary',
      zestmoney: 'ZestMoney',
      flexmoney: 'Cardless EMI by InstaCred',
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
      ABPB: 'Aditya Birla Idea Payments Bank',
      ANDB_C: 'Andhra Bank - Corporate Banking',
      BACB: 'Bassein Catholic Co-operative Bank',
      BDBL: 'Bandhan Bank',
      DLXB_C: 'Dhanlaxmi Bank - Corporate Banking',
      ESAF: 'ESAF Small Finance Bank',
      IBKL_C: 'IDBI - Corporate Banking',
      KCCB: 'Kalupur Commercial Co-operative Bank',
      KJSB: 'Kalyan Janata Sahakari Bank',
      MSNU: 'Mehsana Urban Co-operative Bank',
      NESF: 'North East Small Finance Bank',
      RATN_C: 'RBL Bank - Corporate Banking',
      SURY: 'Suryoday Small Finance Bank',
      SVCB_C: 'Shamrao Vithal Bank - Corporate Banking',
      TBSB: 'Thane Bharat Sahakari Bank',
      TJSB: 'Thane Janata Sahakari Bank',
      VARA: 'Varachha Co-operative Bank',
      YESB_C: 'Yes Bank - Corporate Banking',
      ZCBL: 'Zoroastrian Co-operative Bank',
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
    new_vpa_subtitle_upi_otm: 'Supported only for BHIM and HDFC',
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
    omni_verifying_phone: 'Verifying mobile number with Google Pay...',
    verifying_vpa_info: 'Verifying your VPA',
    cancel_reason_title: 'Please give us a reason before we cancel the payment',
    cancel_reason_collect_not_received: 'Did not receive collect request',
    cancel_reason_failed_in_app: 'Payment failed in UPI app',
    cancel_reason_money_deducted:
      'Money got deducted but payment is still processing',
    cancel_reason_other: 'Other',
    cancel_reason_back_action: 'Back',
    cancel_reason_submit_action: 'Submit',
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
  dcc: {
    search_all: 'All currencies',
    search_title: 'Select Currency to Pay',
    search_placeholder: 'Search for currency or code',
  },
  popup: {
    paying: 'PAYING',
    secured_by: 'Secured by',
    trying_to_load: 'Still trying to load...',
    want_to_cancel: 'Do you want to cancel the ongoing payment?',
    processing: 'Processing, Please Wait...',
    wait_while_we_redirect:
      'Please wait while we redirect you to your {method} page.',
    redirecting: 'Redirecting...',
    loading_method_page: 'Loading {method} page…',
    trying_bank_page_msg:
      'The bank page is taking time to load. You can either wait or change the payment method.',
  },
  misc: {
    loading: 'Loading',
    processing: 'Processing...',
    payment_processing: 'Your payment is being processed',
    payment_incomplete: 'Payment did not complete.',
    payment_timeout: 'Payment did not complete on time',
    redirecting_bank: 'Redirecting to Bank page',
    acs_load_delay: 'Seems like your bank page is taking time to load.',
    payment_waiting_on_bank: 'Waiting for payment to complete on bank page',
    frequently_used_config_title: 'Frequently used methods',
    search_no_results: 'No results for "{query}"',
    search_results_label: 'Results',
    logout_action: 'Log out',
    logout_all_devices_action: 'Log out from all devices',
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
};
