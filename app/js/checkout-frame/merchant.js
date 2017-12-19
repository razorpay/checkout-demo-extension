var preferences = window.preferences,
  CheckoutBridge = window.CheckoutBridge,
  iosCheckoutBridgeNew = getNewIOSWebkitInstance(),
  cookieDisabled = !navigator.cookieEnabled,
  sessions = {},
  isIframe = window !== parent,
  ownerWindow = isIframe ? parent : opener;

var contactPattern = /^\+?[0-9]{8,15}$/;
var emailPattern = /^[^@\s]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+$/;

function getNewIOSWebkitInstance() {
  //Verify inner CheckoutBridge property for new iOS devices
  return ((window.webkit || {}).messageHandlers || {}).CheckoutBridge;
}
function getSession(id) {
  return sessions[id || _uid];
}

function addBodyClass(className) {
  $(doc).addClass(className);
}

// initial error (helps in case of redirection flow)
var qpmap = {};

var pngBase64Prefix = 'data:image/png;base64,';
var bankPrefix = RazorpayConfig.cdn + 'bank/';
var sessProto = Session.prototype;
sessProto.netbanks = {
  SBIN: {
    image:
      pngBase64Prefix +
      'R0lGODlhKAAoAMQQAPD2/EGI2sTa86fI7m2k4l6b3+Lt+dPk9nyt5SR21Hut5cXb9Jm/61CS3f///xVt0f///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAABAALAAAAAAoACgAAAXyICSO5GgMRPCsbEAMRinPslCweL4WAu2PgoZumGv0fiUAgsjMIQBIEUDVrK4C0N8hYe0+EgcfgOvtJrJJarmLlS3XZURJAIcfRcJ6uQHU20U3fmUFEAaCcCeHayiKZSlwCgsLCnBqXgcOmQ4HjUwKmpqUnToLoJkLo6SmDqipOJ+moq4smJqca5ZdDJkMlQRwDZl5jgPAwnAwxg7DXjGBXsHLa4QQdHvHZXfMVdHbTXx90NhddyJvVt1ecmld6VZtMmPo40xnPlvc9ENgSFPf+jng9Tunw92QJ1FIBBliEIeRhDNsFNHHA+KPE4/SuYCRMAQAOw==',
    title: 'SBI'
  },
  HDFC: {
    image:
      pngBase64Prefix +
      'R0lGODlhKAAoAKIAAL/S4+4xN/WDh+/0+PJaXwBMj////+0jKiH5BAAAAAAALAAAAAAoACgAAAOqeLrca9C4SauL0uqtMP+VB46MSJLmCaZqh71wHBGcbNv0du9vrvFAg88S5A1DxduRklTWYIWodBoFwJaTGHVbsPaeLy7Vi8FeoGIpeXbmpdXN27sat827ddl9jSP4/1pzfAYCf39ZaG+DZg2BildgGHuQOjAAl5iZlwOUP3lflZ9soaJCkaKMJaUQqQ+rphuGsn5ls4YBLaoQuSsRvB8sv0y+wp67xUTEIwkAOw==',
    title: 'HDFC'
  },
  ICIC: {
    image:
      pngBase64Prefix +
      'R0lGODlhKAAoAOZGAP/58evKy/ry8vzOk/qpQsRfZMJHLvqvUP7t1uGvsbUxL79SV9iVmPmjNbpFSueAKbU3PctVLfCPKPvCeP7z5PDX2PzIhvSWKNVkLOa8vsltcfu2Xc56frk4L850cNeUl/Xk5f3myd5yKtOHi+uHKfzUoMdOLf3arr5MSf/58r5ALv3gu9+EU9yipLo/PPXe1/rs5eCjlvTYytybl+qxle/FsMRZVvu8a+J5Kuq9sNlrK/7nyeOAN+Wee/3gvNyWifWcNeGopOuONvmdJ////7AqMP///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAAEYALAAAAAAoACgAAAf/gEaCg4SFhoICCR4oRY1FLh45h5OUgwEejpmZNi+VnoIBBZqjjhAVn5MwmJkQDAJEAgujKACohTUumgsVRL1EGaQztoIAPQqaECC+vcCjDsMALKQJy70cpEWnnwg8pBDVRCDYRUHbQsejBdWx4x+eCEDoowvLILLtlQANBuNFDAEBGEDoV8TdJAAHMBBcmMngoQkS+hVoESCDBoYxJpUYwo+UgwDVLhKUcYhCgwfYRryqxoCggVqGNnB0BhIckWv9WBw6MQSlpgIrwQkg2MGCIX1DTGjiYNNXAoIiEBgaMOSCJmpNe4nE1oHA0QZDRGQakbXX0H4PThjaOCRCpgAC+xg4KEKvWot+JhrAJERgyJAO/XgtE8X1wgBDCPwOIVjTbD8SXg1Z8EuCYLWn2EQMWXGob0/Ly7ZqwjBkQ0nFPrGpWzZwVIQhDSgcCqE44jimvgKQer15ElXF8kZh7dVSkw6/Eyj99qsUmzJfhBspwOH3QKXlnz1Wy6SCRPW9h7DPHEXWVwXppP0SAB9esd8LKkZlWKY7ggTFBKR6Yuv+gltHDlRDw32KHcDeJIm5VxsGBhjwQzXYbXAgJZ4p6B4F1figmFHDGMGThYrdYNMEE4TQ4SAHgOjXDlmdOAgFFbpnQVMuFgKATO4dkAI4NU4SwgQHEDDAjsv0OEggADs=',
    title: 'ICICI'
  },
  UTIB: {
    image:
      pngBase64Prefix +
      'R0lGODlhKAAoAMQQAOvJ1vry9bM1Z7hDcfXk68JehtaTrvDX4eGuwsdrkNKGpMx5mr1Qe+a8zNuhuK4oXf///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAABAALAAAAAAoACgAAAXdICSOZGmeaKqubIsGgSunyjLf5PE8B44Xu4Jv1tjtEMNWYGB8DGJJlaG5M0RTBAF1R7ieEttdwlsChI0A8ohx3g3UEEfb2PMGtPMxWTHnknV9VmRAcwJQVwh9D0h2THNvZFN9aV4EikJkYH1dXmZ9CmqObQJ4bZArknMOqW0OK3d9kKJnhioLipRFnymeeSSEc3UmwG2cIpZ9mCWJgSZ8fYwjsI+H0qVnTySsZ9HLioIQyHPKJ2yFnMRnwie9bWO6czYrt5OzYbUrWX0MAP3+//3WqTgAsCAlOAivhAAAOw==',
    title: 'Axis'
  },
  KKBK: {
    image:
      pngBase64Prefix +
      'R0lGODlhKAAoANUtAL/N3O/z9s/a5d/m7kBqlyBRhTBdjjsxYFB2oI+owoCcup+0y3cqTK/B1HCPsVB2n2CDqPvGyB41avRxdkovW+4qMmgsUfBHTf7x8fm4u4tviw82b+idpNy8xf3j5PNjaI2Mp7dqfPaOkntjg5QnQsEhM4hFYks9ad4eKRBEfe0cJP///wA4dP///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAAC0ALAAAAAAoACgAAAb/wJZwSCwaj8ikcslsFgOAqDTgdA4SiBRry92mEIlB9bggdM9oFmExFgIK6fi5AHAGEPKuZCNHUJUCBnksEhYlKgd5BgJJAlp5FiqSiIMpjEaOgywMk5SVl0MBgmgFcFyck4maBn9CDmcEDSuzKwtwqJIHKQoDtAMKj1wOQwBnELTIKwq4KhoBybMDo1x1LXhcBNDIHJMT2rQBplsILQNnvd8rEZIX6bTFXVddD8lQyOsVGO60ZlwJ/VsWRIMQrAAEAOsiaGvg4EGCZysadCEQjEWvTGlMiIAWqIulFQE8npklDs0IjhW9EACYZoW5OCkg+kqpiYtLOQCgTat55tlOui4Ck72CqUBByYqyBByVlSwDCJoBZwVLwdLBrAALHjiUSctDBZBG5wmINjGBR67fMFxQgWxAlGRm/b3komDfig+SOuwrKYYli7HpJkw6AVibgi7kWsDjkiIntAAhOukqjGzBmWothnaBwHSFAGDMVPGi1cDvsFA/44SuyaoIxjyrPx15rVqybCQd5XBCQYLCoEVL7sg54FuTHydveJLCXKWMcjVs2hC5kgUmGDHSk0CREqVV9u/gwy8JAgA7',
    title: 'Kotak'
  },
  YESB: {
    image:
      pngBase64Prefix +
      'R0lGODlhKAAoANUxAMg0KRBcmfTW1NNcVNdqY8tBOOmtqfvx8c9PRjBypyBnoPjk4sJ9gKGTpL9EP8ptajxvn9WVlFl3nuGSjfDJxrSruY16j2yQtK5la6qCj8dfXFyFrdp4cbCdq2mCpZSWq52FlixkmaZ1gHiNrL5wcqu7zrWAh3ybu1VqkXR/npGIncNRTc56eEB9rb/T5MQmGwBRkv///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAADEALAAAAAAoACgAAAb/wJhwSCwaj0bDAslsNgUTp3QaOyAO1CySYNB6iQbEdywAUMZeKwHt5byWR5d8Tq/b74YX6y6H+f+AgYKCKAAAEIOJioswIQ4vIoySkgEYLwUJk5qJFi8vFpuhgBIALysKoqIJjy8pqaGVng8Br5sgngAStZoepS8Mu5MJA54FiMGLAQyeLxnIjA3MCKjPiRe+LyrVicPMGrTbgcrMLyPhgtHMJODnftfMABvtfy0E5CbzfgER5AUt+TAqkHvRAeCJAuQGUGtXb+CHfPsGztrVoqLFiwLJAShxsaPHj0UOEBhAEpunKGyOlBlYDEtKlSY9dXmJZCWzATSfYDuTk8nKBzU9n7zpGQQAOw==',
    title: 'Yes'
  },
  SCBL: {
    image: bankPrefix + 'SCBL.gif',
    title: 'SCB'
  },
  IBKL: {
    image: bankPrefix + 'IBKL.gif',
    title: 'IDBI'
  },
  PUNB_R: {
    image: bankPrefix + 'PUNB_R.gif',
    title: 'PNB'
  },
  FDRL: {
    image: bankPrefix + 'FDRL.gif',
    title: 'Federal'
  },
  CORP: {
    image: bankPrefix + 'CORP.gif',
    title: 'Corporation'
  }
};

var downBanks = {};
var walletPrefix = RazorpayConfig.cdn + 'wallet/';
var sqWalletPrefix = RazorpayConfig.cdn + 'wallet-sq/';

var freqWallets = (sessProto.walletData = {
  amazonpay: {
    h: 28,
    col: walletPrefix + 'amazonpay.png',
    sq: sqWalletPrefix + 'amazonpay.png',
    title: 'Amazon Pay'
  },
  paytm: {
    h: 18,
    col: walletPrefix + 'paytm.png',
    sq: sqWalletPrefix + 'paytm.png',
    title: 'Paytm'
  },
  zeta: {
    h: 25,
    col: walletPrefix + 'zeta.png',
    sq: sqWalletPrefix + 'zeta.png',
    title: 'Zeta'
  },
  freecharge: {
    h: 18,
    col: walletPrefix + 'freecharge.png',
    sq: sqWalletPrefix + 'freecharge.png',
    title: 'Freecharge'
  },
  airtelmoney: {
    power: false,
    h: 32,
    col: walletPrefix + 'airtelmoney.png',
    sq: sqWalletPrefix + 'airtelmoney.png',
    title: 'Airtel Money'
  },
  jiomoney: {
    h: 68,
    col: walletPrefix + 'jiomoney.png',
    sq: sqWalletPrefix + 'jiomoney.png',
    title: 'JioMoney'
  },
  olamoney: {
    h: 22,
    col: walletPrefix + 'olamoney.png',
    sq: sqWalletPrefix + 'olamoney.png',
    title: 'Ola Money'
  },
  mobikwik: {
    h: 20,
    col: walletPrefix + 'mobikwik.png',
    sq: sqWalletPrefix + 'mobikwik.png',
    title: 'Mobikwik'
  },
  payumoney: {
    h: 18,
    col: walletPrefix + 'payumoney.png',
    sq: sqWalletPrefix + 'payumoney.png',
    title: 'PayUMoney'
  },
  payzapp: {
    power: false,
    h: 24,
    col: walletPrefix + 'payzapp.png',
    sq: sqWalletPrefix + 'payzapp.png',
    title: 'PayZapp'
  },
  citrus: {
    h: 32,
    col: walletPrefix + 'citrus.png',
    sq: sqWalletPrefix + 'citrus.png',
    title: 'Citrus Wallet'
  },
  mpesa: {
    h: 50,
    col: walletPrefix + 'mpesa.png',
    sq: sqWalletPrefix + 'mpesa.png',
    title: 'Vodafone mPesa'
  },
  sbibuddy: {
    h: 22,
    col: walletPrefix + 'sbibuddy.png',
    sq: sqWalletPrefix + 'sbibuddy.png',
    title: 'SBI Buddy'
  }
});

var emi_options = (sessProto.emi_options = {
  // minimum amount to enable emi
  min: 3000 * 100 - 1,
  amex_min: 5000 * 100 - 1,
  selected: 'KKBK',
  banks: {
    KKBK: {
      patt: /4(62409|04861|78006|34668|1(4767|664[3-6])|363(88|89|90))|5(24253|43705|47981)/,
      name: 'Kotak Mahindra Bank',
      plans: {
        3: 12,
        6: 12,
        9: 14,
        12: 14,
        18: 15,
        24: 15
      }
    },

    HDFC: {
      patt: /36(08(25|26|86|87)|1011|7123|8357)|4(05028|16317|17410|18136|3467[78]|36(152|306|520)|37546|5(11|77)04|6178[67]|6(247|391)7|8549[89]|89377)|5(176(35|52)|2(2852|4(1[18]1|216|368|931)|8945)|3(2118|2135|3744|6311)|45226|45964|5(2(088|260|274|3(44|65|85|89|94))|3583|6042|9300))/,
      name: 'HDFC Bank',
      plans: {
        3: 13,
        6: 13,
        9: 14,
        12: 14,
        18: 15,
        24: 15
      }
    },

    UTIB: {
      patt: /4((07438|05995|50506|64118|71864|6111[678]|71863|51457|3083[2-4])00|074390[03]|111460[0-6]|182120[12]|365600[01]|514560[04]|7186(00[013]|10[012]|30[12]))|5(24((178|240|508|512)00|1781[01])|5934([12]00|00[01])|305620[0245])/,
      name: 'Axis Bank',
      plans: {
        3: 12,
        6: 12,
        9: 13,
        12: 13,
        18: 15,
        24: 15
      }
    },

    INDB: {
      patt: /377151((0|6|7|8)0|2[0-6])|5(3765210|26861(0[0-2]|10)|24480([1-4]0|11|12)|160680[0-2])|4((63787|68936|98726)00|14752((0|1|2)0|1(2|3))|27124(0|1)0|4128(300|400|410|411|5(\d0|02|03|([3,6-8])1|7[5-8]|95)))/,
      name: 'IndusInd Bank',
      plans: {
        3: 13,
        6: 13,
        9: 13,
        12: 13,
        18: 15,
        24: 15
      }
    },

    RATN: {
      patt: /5(23(6|9)50|36301|36907|24373|28028|31845|41538|42505|49489)/,
      name: 'RBL Bank',
      plans: {
        3: 13,
        6: 13,
        9: 13,
        12: 13,
        18: 13,
        24: 13
      }
    },

    ICIC: {
      patt: /4(37551|50172|61133|62986|70573|74846|0(2368|5533|765(1|9))|2322(6|7)|20580|477(46|47|58)|44341)|5(17(637|653|719)|24(193|376)|(23951|25996|52418|47467|45207|40282))/,
      name: 'ICICI Bank',
      plans: {
        3: 13,
        6: 13,
        9: 13,
        12: 13
      }
    },

    SCBL: {
      patt: /4(02874|1(290[345]|9607)|29344|5(4198|6398|7036)|622(69|7[0-3])|9407[67])|5(2(3990|9388)|4(0(46[01]|711)|3186|4438|7359|9(1(24|32)))|5(3160|437[458]|4623|8959))/,
      name: 'Standard Chartered Bank',
      plans: {
        3: 13,
        6: 13,
        9: 14,
        12: 14
      }
    },

    YESB: {
      patt: /5(3(1849105|630320[567])|24167208|36303209|49921204|5891830[12])0[01]/,
      name: 'Yes Bank',
      plans: {
        3: 12,
        6: 12,
        9: 13,
        12: 13,
        18: 14,
        24: 15
      }
    }
  },
  other_banks: {
    AMEX: {
      patt: /37(693|9397|98(6[1-3,7-9]|7[0-2,6-8]))/,
      name: 'American Express',
      plans: {
        3: 12,
        6: 12,
        9: 12,
        12: 12,
        18: 12,
        24: 12
      }
    }
  }
});

var tab_titles = (sessProto.tab_titles = {
  emi: 'EMI',
  card: 'Card',
  netbanking: 'Netbanking',
  wallet: 'Wallet',
  upi: 'UPI',
  ecod: 'Pay by Link'
});

function notifyBridge(message) {
  if (message && message.event) {
    var bridgeMethod = CheckoutBridge['on' + message.event];
    var data = message.data;
    if (!isString(data)) {
      if (!data) {
        return invoke(bridgeMethod, CheckoutBridge);
      }
      data = stringify(data);
    }
    invoke(bridgeMethod, CheckoutBridge, data);
  }
}

function setDownBanks(session) {
  var downObj = [];
  var downtime = preferences.downtime;
  if (downtime) {
    each(downtime.netbanking, function(i, o) {
      downObj = downObj.concat(o.issuer);
    });
  }
  session.down = downObj;
}

function setPaymentMethods(session) {
  var recurring = session.recurring;
  var international = session.get('currency') !== 'INR';
  var availMethods = preferences.methods;
  var methods = (session.methods = {
    count: 0
  });

  var passedWallets = session.get('method.wallet');
  each(availMethods, function(method, enabled) {
    if (enabled && session.get('method.' + method) !== false) {
      methods[method] = enabled;
    }
  });
  if (recurring) {
    methods.netbanking =
      availMethods.recurring && availMethods.recurring.netbanking;
  }

  var amount = session.get('amount');
  if (amount <= emi_options.min) {
    methods.emi = false;
  }

  var emiMethod = session.get('theme.emi_mode');
  if (
    !((emiMethod && methods.emi) || methods.card) ||
    recurring ||
    international
  ) {
    methods.emi = false;
  }

  if (recurring || international) {
    methods.upi = false;
  }

  if (methods.emi && !emiMethod) {
    tab_titles.card = 'Card/EMI';
    sessProto = tab_titles;
  } else {
    tab_titles.card = 'Card';
  }

  // php encodes blank object as blank array
  if (
    amount >= 100 * 20000 ||
    methods.wallet instanceof Array ||
    recurring ||
    international
  ) {
    methods.wallet = {};
  } else if (typeof passedWallets === 'object') {
    each(passedWallets, function(wallet, enabled) {
      if (enabled === false) {
        delete methods.wallet[wallet];
      }
    });
  }

  if (
    !methods.netbanking ||
    methods.netbanking instanceof Array ||
    international
  ) {
    methods.netbanking = false;
  } else {
    methods.count = 1;
    setDownBanks(session);
  }

  if (methods.card) {
    methods.count++;
  }

  if (emiMethod) {
    methods.count++;
  }

  if (methods.upi) {
    methods.count++;
  }

  each(session.get('external.wallets'), function(i, externalWallet) {
    if (externalWallet in freqWallets) {
      methods.wallet[externalWallet] = true;
      freqWallets[externalWallet].custom = true;
    }
  });
  var wallets = [];
  each(methods.wallet, function(walletName) {
    var freqWallet = freqWallets[walletName];
    if (freqWallet) {
      freqWallet.name = walletName;
      wallets.push(freqWallet);
    }
  });

  if (wallets.length) {
    methods.count++;
  }

  wallets.sort(function(walletA, walletB) {
    return walletB.custom || session.offers.wallet[walletB.name] ? 1 : -1;
  });

  methods.wallet = wallets;
}

function fetchPrefsAndShowModal(session) {
  // set test cookie
  // if it is not reflected at backend while fetching prefs, disable cardsaving
  var prefData = makePrefParams(session);
  if (cookieDisabled) {
    prefData.checkcookie = 0;
  } else {
    prefData.checkcookie = 1;
    document.cookie = 'checkcookie=1;path=/';
  }

  Razorpay.payment.getPrefs(prefData, function(response) {
    if (response.error) {
      return Razorpay.sendMessage({
        event: 'fault',
        data: response.error.description
      });
    }
    preferences = response;
    showModal(session);
  });
}

function showModal(session) {
  var options = preferences.options;

  // pass preferences options to app
  if (CheckoutBridge) {
    invoke('setMerchantOptions', CheckoutBridge, JSON.stringify(options));
  }

  var offers = preferences.offers;
  session.offers = {
    wallet: {}
  };
  each(offers, function(index, offer) {
    var payment_method = offer.payment_method;
    if (payment_method === 'card') {
      session.offers.card = offer;
    } else if (payment_method === 'wallet') {
      session.offers.wallet[offer.issuer || offer.payment_network] = offer;
    }
  });

  var customer;
  var session_options = session.get();
  var saved_customer = preferences.customer;
  var filters = {};

  if (preferences.global === false) {
    session.local = true;
    customer = new Customer('');
    getCustomer = function() {
      return customer;
    };
  }

  if (preferences.subscription || session_options.recurring) {
    session.recurring = filters.recurring = true;
  }

  if (saved_customer) {
    // we put saved customer contact, email into default prefills
    if (saved_customer.contact) {
      session_options['prefill.contact'] = saved_customer.contact;
    }
    if (saved_customer.email) {
      session_options['prefill.email'] = saved_customer.email;
    }

    customer = getCustomer(saved_customer.contact);
    sanitizeTokens(saved_customer.tokens, filters);
    customer.tokens = saved_customer.tokens;

    if (saved_customer.tokens) {
      customer.logged = true;
    }

    customer.customer_id = saved_customer.customer_id;
  }

  if (
    preferences.subscription ||
    (saved_customer && saved_customer.customer_id)
  ) {
    session_options.remember_customer = true;
    options.remember_customer = true;
  }

  session.optional = arr2obj(preferences.optional);
  if (cookieDisabled || session.optional.contact || is_ie8) {
    options.remember_customer = false;
  }

  Customer.prototype.key = session.get('key');
  Razorpay.configure(options);
  showModalWithSession(session);
}
function showModalWithSession(session) {
  var order = (session.order = preferences.order);
  var invoice = (session.invoice = preferences.invoice);
  var subscription = (session.subscription = preferences.subscription);
  var get = session.get;
  var options = get();

  var prefillAmount = get('prefill.amount');
  if (prefillAmount) {
    options.amount = Number(Math.floor(prefillAmount));
  } else {
    if (order && order.amount) {
      options.amount = order.partial_payment ? order.amount_due : order.amount;
    } else if (invoice && invoice.amount) {
      options.amount = invoice.amount;
    } else if (subscription && subscription.amount) {
      options.amount = subscription.amount;
    }
  }

  if (order && order.bank && get('callback_url')) {
    options.redirect = true;
    return session.r.createPayment({
      contact: get('prefill.contact') || '9999999999',
      email: get('prefill.email') || 'void@razorpay.com',
      bank: order.bank,
      method: 'netbanking'
    });
  }
  setPaymentMethods(session);
  session.render();
  Razorpay.sendMessage({ event: 'render' });

  if (CheckoutBridge) {
    if (isFunction(CheckoutBridge.setDimensions)) {
      var containerBox = $('#container')[0];
      if (containerBox) {
        var rect = containerBox.getBoundingClientRect();
        CheckoutBridge.setDimensions(
          Math.floor(rect.width),
          Math.floor(rect.height)
        );
      }
    }
    $('#backdrop').css('background', 'rgba(0, 0, 0, 0.6)');
  }

  if (qpmap.error) {
    errorHandler.call(session, qpmap);
  }
  if (qpmap.tab) {
    session.switchTab(qpmap.tab);
  }
}

// generates ios event handling functions, like onload
function iosMethod(method) {
  return function(data) {
    if (iosCheckoutBridgeNew) {
      handleNewIOSMethods(method, data);
    } else {
      var iF = document.createElement('iframe');
      var src = 'razorpay://on' + method;
      if (data) {
        src += '?' + CheckoutBridge.index;
        CheckoutBridge.map[++CheckoutBridge.index] = data;
      }
      iF.setAttribute('src', src);
      doc.appendChild(iF);
      iF.parentNode.removeChild(iF);
      iF = null;
    }
  };
}

//handle methods for new IOS app
function handleNewIOSMethods(method, data) {
  var color = {
    theme: hexToRgb(preferences.options.theme.color) || null,
    navShow: { red: 0, green: 0, blue: 0, alpha: 0.5 },
    navHide: { red: 1, green: 1, blue: 1, alpha: 1 }
  };
  try {
    data = JSON.parse(data);
  } catch (e) {}

  data = data || {};

  switch (method) {
    case 'load':
      var navData = {
        webview_background_color: color.navHide
      };
      dispatchNewIOSEvents('hide_nav_bar', navData);
      //add theme color
      data.theme_color = color.theme;
      dispatchNewIOSEvents(method, data); //default load
      break;
    case 'submit':
      var navData;
      dispatchNewIOSEvents(method, data); //send default submit
      navData = {
        webview_background_color: color.navShow
      };
      dispatchNewIOSEvents('show_nav_bar', navData);
      break;
    default:
      dispatchNewIOSEvents(method, data);
  }
}

function dispatchNewIOSEvents(method, data) {
  iosCheckoutBridgeNew.postMessage({
    action: method,
    body: data
  });
}

var platformSpecific = {
  ios: function() {
    // setting up js -> ios communication by loading custom protocol inside hidden iframe
    CheckoutBridge = window.CheckoutBridge = {
      // unique id for ios to retieve resources
      index: 0,
      map: {},
      get: function(index) {
        var val = this.map[this.index];
        delete this.map[this.index];
        return val;
      },
      getUID: function() {
        return _uid;
      }
    };
    var bridgeMethods = ['load', 'dismiss', 'submit', 'fault', 'success'];
    each(bridgeMethods, function(i, prop) {
      CheckoutBridge['on' + prop] = iosMethod(prop);
    });
    CheckoutBridge.oncomplete = CheckoutBridge.onsuccess;
  },

  android: function() {
    $(doc).css('background', 'rgba(0, 0, 0, 0.6)');
  }
};

function setQueryParams(search) {
  each(search.replace(/^\?/, '').split('&'), function(i, param) {
    var split = param.split('=', 2);
    if (split[0].indexOf('.') !== -1) {
      var dotsplit = split[0].split('.', 2);
      if (!qpmap[dotsplit[0]]) {
        qpmap[dotsplit[0]] = {};
      }
      qpmap[dotsplit[0]][dotsplit[1]] = decodeURIComponent(split[1]);
    } else {
      qpmap[split[0]] = decodeURIComponent(split[1]);
    }
  });

  var platform = qpmap.platform;
  if (platform) {
    addBodyClass(platform);
    invoke(platformSpecific[platform]);
  }
}

Razorpay.sendMessage = function(message) {
  if (
    isNonNullObject(CheckoutBridge) ||
    isNonNullObject(iosCheckoutBridgeNew)
  ) {
    return notifyBridge(message);
  }
  if (ownerWindow) {
    message.source = 'frame';
    message.id = _uid;
    if (isNonNullObject(message)) {
      message = stringify(message);
    }
    ownerWindow.postMessage(message, '*');
  }
};

window.handleOTP = function(otp) {
  /* Old OTPelf will now send the whole body of the
 * message instead of just OTP */
  var matches = otp.match(/\b[0-9]{4}([0-9]{2})?\b/);
  otp = matches ? matches[0] : '';
  otp = String(otp).replace(/\D/g, '');
  var session = getSession();
  var otpEl = gel('otp');
  if (session && otpEl && !otpEl.value) {
    otpEl.value = otp;
    $('#otp-elem').removeClass('invalid');
  }
};

window.upiIntentResponse = function(data) {
  var session = getSession();

  if (session.r._payment && session.upi_intents_data) {
    session.r.emit('payment.upi.intent_response', data);
  }
};

window.backPressed = function(callback) {
  var session = getSession();
  if (
    session.tab &&
    !(session.get('prefill.method') && session.get('theme.hide_topbar'))
  ) {
    session.back();
  } else {
    invoke(callback, CheckoutBridge);
  }
};

function validUID(id) {
  if (isIframe && !CheckoutBridge) {
    if (!isString(id) || id.length < 14 || !/[0-9a-z]/i.test(id)) {
      return false;
    }
  }
  return true;
}

var epos_share_link;
window.handleMessage = function(message) {
  if ('id' in message && !validUID(message.id)) {
    return;
  }
  var id = message.id || _uid;
  var session = getSession(id);
  var options = message.options;

  try {
    if (options && options.epos_build_code >= 3) {
      epos_share_link = true;
    }
  } catch (e) {}

  if (!session) {
    if (!options) {
      return;
    }
    try {
      session = new Session(options);
    } catch (e) {
      Razorpay.sendMessage({ event: 'fault', data: e.message });
      return roll('fault', e, 'warn');
    }
    var oldSession = getSession();
    if (oldSession) {
      invoke('saveAndClose', oldSession);
    }
    session.id = _uid = id;
    sessions[_uid] = session;
  }

  if (message.referer) {
    trackingProps.referer = message.referer;
  }

  if (message.integration) {
    trackingProps.integration = message.integration;
  }

  if (message.embedded) {
    session.embedded = true;
    $(doc).addClass('embedded');
  }

  if (message.upi_intents_data && message.upi_intents_data.length) {
    session.upi_intents_data = message.upi_intents_data;
  }

  session.ua_Android = ua_Android;

  if (message.device_token) {
    qpmap.device_token = message.device_token;
  }

  var data = message.data;
  if (data) {
    if (isString(data)) {
      try {
        data = JSON.parse(data);
      } catch (e) {}
    }
    if (isNonNullObject(data)) {
      session.data = data;
    }
  }

  if (message.params) {
    session.params = message.params;
  }

  if (message.event === 'open' || options) {
    if (!preferences || session.get('remember_customer')) {
      fetchPrefsAndShowModal(session);
    } else {
      showModal(session);
    }
  } else if (message.event === 'close') {
    session.hide();
  }

  try {
    if (isNonNullObject(CheckoutBridge)) {
      CheckoutBridge.sendAnalyticsData = parseAnalyticsData;
    }
  } catch (e) {}
};

function parseAnalyticsData(data) {
  each(data, function(key, val) {
    trackingProps[key] = val;
  });
}

function parseMessage(e) {
  // not concerned about adding/removeing listeners, iframe is razorpay's fiefdom
  var data = e.data;
  if (e.source && e.source !== ownerWindow) {
    return;
  }
  try {
    if (typeof data === 'string') {
      data = JSON.parse(data);
    }
    window.handleMessage(data);
  } catch (err) {
    roll('message: ' + data, err, 'warn');
  }
}

function applyUAClasses() {
  if (/Android [2-4]/.test(ua)) {
    addBodyClass('noanim');
  }
}

function initIframe() {
  $(window).on('message', parseMessage);

  if (location.search) {
    setQueryParams(location.search);
  }

  if (CheckoutBridge) {
    delete trackingProps.referer;
    trackingProps.platform = 'mobile_sdk';

    var os = qpmap.platform;
    if (os) {
      trackingProps.os = os;
    }
  }

  if (qpmap.message) {
    parseMessage({ data: atob(qpmap.message) });
  }

  applyUAClasses();
  Razorpay.sendMessage({ event: 'load' });
}

initIframe();
