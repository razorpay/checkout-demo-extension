var preferences = window.preferences,
  CheckoutBridge = window.CheckoutBridge,
  sessions = {},
  isIframe = window !== parent,
  ownerWindow = isIframe ? parent : opener;

function getSession(id){
  return sessions[id || _uid];
}

function addBodyClass(className){
  $(doc).addClass(className);
}

// initial error (helps in case of redirection flow)
var qpmap = {};

var pngBase64Prefix = 'data:image/png;base64,';
var sessProto = Session.prototype;
sessProto.netbanks = {
  SBIN: {
    image: pngBase64Prefix + 'R0lGODlhKAAoAMQQAPD2/EGI2sTa86fI7m2k4l6b3+Lt+dPk9nyt5SR21Hut5cXb9Jm/61CS3f///xVt0f///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAABAALAAAAAAoACgAAAXyICSO5GgMRPCsbEAMRinPslCweL4WAu2PgoZumGv0fiUAgsjMIQBIEUDVrK4C0N8hYe0+EgcfgOvtJrJJarmLlS3XZURJAIcfRcJ6uQHU20U3fmUFEAaCcCeHayiKZSlwCgsLCnBqXgcOmQ4HjUwKmpqUnToLoJkLo6SmDqipOJ+moq4smJqca5ZdDJkMlQRwDZl5jgPAwnAwxg7DXjGBXsHLa4QQdHvHZXfMVdHbTXx90NhddyJvVt1ecmld6VZtMmPo40xnPlvc9ENgSFPf+jng9Tunw92QJ1FIBBliEIeRhDNsFNHHA+KPE4/SuYCRMAQAOw==',
    title: 'SBI'
  },
  HDFC: {
    image: pngBase64Prefix + 'R0lGODlhKAAoAKIAAL/S4+4xN/WDh+/0+PJaXwBMj////+0jKiH5BAAAAAAALAAAAAAoACgAAAOqeLrca9C4SauL0uqtMP+VB46MSJLmCaZqh71wHBGcbNv0du9vrvFAg88S5A1DxduRklTWYIWodBoFwJaTGHVbsPaeLy7Vi8FeoGIpeXbmpdXN27sat827ddl9jSP4/1pzfAYCf39ZaG+DZg2BildgGHuQOjAAl5iZlwOUP3lflZ9soaJCkaKMJaUQqQ+rphuGsn5ls4YBLaoQuSsRvB8sv0y+wp67xUTEIwkAOw==',
    title: 'HDFC'
  },
  ICIC: {
    image: pngBase64Prefix + 'R0lGODlhKAAoAOZGAP/58evKy/ry8vzOk/qpQsRfZMJHLvqvUP7t1uGvsbUxL79SV9iVmPmjNbpFSueAKbU3PctVLfCPKPvCeP7z5PDX2PzIhvSWKNVkLOa8vsltcfu2Xc56frk4L850cNeUl/Xk5f3myd5yKtOHi+uHKfzUoMdOLf3arr5MSf/58r5ALv3gu9+EU9yipLo/PPXe1/rs5eCjlvTYytybl+qxle/FsMRZVvu8a+J5Kuq9sNlrK/7nyeOAN+Wee/3gvNyWifWcNeGopOuONvmdJ////7AqMP///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAAEYALAAAAAAoACgAAAf/gEaCg4SFhoICCR4oRY1FLh45h5OUgwEejpmZNi+VnoIBBZqjjhAVn5MwmJkQDAJEAgujKACohTUumgsVRL1EGaQztoIAPQqaECC+vcCjDsMALKQJy70cpEWnnwg8pBDVRCDYRUHbQsejBdWx4x+eCEDoowvLILLtlQANBuNFDAEBGEDoV8TdJAAHMBBcmMngoQkS+hVoESCDBoYxJpUYwo+UgwDVLhKUcYhCgwfYRryqxoCggVqGNnB0BhIckWv9WBw6MQSlpgIrwQkg2MGCIX1DTGjiYNNXAoIiEBgaMOSCJmpNe4nE1oHA0QZDRGQakbXX0H4PThjaOCRCpgAC+xg4KEKvWot+JhrAJERgyJAO/XgtE8X1wgBDCPwOIVjTbD8SXg1Z8EuCYLWn2EQMWXGob0/Ly7ZqwjBkQ0nFPrGpWzZwVIQhDSgcCqE44jimvgKQer15ElXF8kZh7dVSkw6/Eyj99qsUmzJfhBspwOH3QKXlnz1Wy6SCRPW9h7DPHEXWVwXppP0SAB9esd8LKkZlWKY7ggTFBKR6Yuv+gltHDlRDw32KHcDeJIm5VxsGBhjwQzXYbXAgJZ4p6B4F1figmFHDGMGThYrdYNMEE4TQ4SAHgOjXDlmdOAgFFbpnQVMuFgKATO4dkAI4NU4SwgQHEDDAjsv0OEggADs=',
    title: 'ICICI'
  },
  UTIB: {
    image: pngBase64Prefix + 'R0lGODlhKAAoAMQQAOvJ1vry9bM1Z7hDcfXk68JehtaTrvDX4eGuwsdrkNKGpMx5mr1Qe+a8zNuhuK4oXf///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAABAALAAAAAAoACgAAAXdICSOZGmeaKqubIsGgSunyjLf5PE8B44Xu4Jv1tjtEMNWYGB8DGJJlaG5M0RTBAF1R7ieEttdwlsChI0A8ohx3g3UEEfb2PMGtPMxWTHnknV9VmRAcwJQVwh9D0h2THNvZFN9aV4EikJkYH1dXmZ9CmqObQJ4bZArknMOqW0OK3d9kKJnhioLipRFnymeeSSEc3UmwG2cIpZ9mCWJgSZ8fYwjsI+H0qVnTySsZ9HLioIQyHPKJ2yFnMRnwie9bWO6czYrt5OzYbUrWX0MAP3+//3WqTgAsCAlOAivhAAAOw==',
    title: 'Axis'
  },
  KKBK: {
    image: pngBase64Prefix + 'R0lGODlhKAAoANUtAL/N3O/z9s/a5d/m7kBqlyBRhTBdjjsxYFB2oI+owoCcup+0y3cqTK/B1HCPsVB2n2CDqPvGyB41avRxdkovW+4qMmgsUfBHTf7x8fm4u4tviw82b+idpNy8xf3j5PNjaI2Mp7dqfPaOkntjg5QnQsEhM4hFYks9ad4eKRBEfe0cJP///wA4dP///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAAC0ALAAAAAAoACgAAAb/wJZwSCwaj8ikcslsFgOAqDTgdA4SiBRry92mEIlB9bggdM9oFmExFgIK6fi5AHAGEPKuZCNHUJUCBnksEhYlKgd5BgJJAlp5FiqSiIMpjEaOgywMk5SVl0MBgmgFcFyck4maBn9CDmcEDSuzKwtwqJIHKQoDtAMKj1wOQwBnELTIKwq4KhoBybMDo1x1LXhcBNDIHJMT2rQBplsILQNnvd8rEZIX6bTFXVddD8lQyOsVGO60ZlwJ/VsWRIMQrAAEAOsiaGvg4EGCZysadCEQjEWvTGlMiIAWqIulFQE8npklDs0IjhW9EACYZoW5OCkg+kqpiYtLOQCgTat55tlOui4Ck72CqUBByYqyBByVlSwDCJoBZwVLwdLBrAALHjiUSctDBZBG5wmINjGBR67fMFxQgWxAlGRm/b3komDfig+SOuwrKYYli7HpJkw6AVibgi7kWsDjkiIntAAhOukqjGzBmWothnaBwHSFAGDMVPGi1cDvsFA/44SuyaoIxjyrPx15rVqybCQd5XBCQYLCoEVL7sg54FuTHydveJLCXKWMcjVs2hC5kgUmGDHSk0CREqVV9u/gwy8JAgA7',
    title: 'Kotak'
  },
  YESB: {
    image: pngBase64Prefix + 'R0lGODlhKAAoANUxAMg0KRBcmfTW1NNcVNdqY8tBOOmtqfvx8c9PRjBypyBnoPjk4sJ9gKGTpL9EP8ptajxvn9WVlFl3nuGSjfDJxrSruY16j2yQtK5la6qCj8dfXFyFrdp4cbCdq2mCpZSWq52FlixkmaZ1gHiNrL5wcqu7zrWAh3ybu1VqkXR/npGIncNRTc56eEB9rb/T5MQmGwBRkv///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAADEALAAAAAAoACgAAAb/wJhwSCwaj0bDAslsNgUTp3QaOyAO1CySYNB6iQbEdywAUMZeKwHt5byWR5d8Tq/b74YX6y6H+f+AgYKCKAAAEIOJioswIQ4vIoySkgEYLwUJk5qJFi8vFpuhgBIALysKoqIJjy8pqaGVng8Br5sgngAStZoepS8Mu5MJA54FiMGLAQyeLxnIjA3MCKjPiRe+LyrVicPMGrTbgcrMLyPhgtHMJODnftfMABvtfy0E5CbzfgER5AUt+TAqkHvRAeCJAuQGUGtXb+CHfPsGztrVoqLFiwLJAShxsaPHj0UOEBhAEpunKGyOlBlYDEtKlSY9dXmJZCWzATSfYDuTk8nKBzU9n7zpGQQAOw==',
    title: 'Yes'
  }
};

var freqWallets = sessProto.walletData = {
  paytm: {
    h: 16,
    col: RazorpayConfig.cdn + 'paytm.gif'
  },
  mobikwik: {
    h: 19,
    col: 'data:image/gif;base64,R0lGODlhbAAfAKIHAJvl5ODt7UPS0L/w73/h4P///wDDwf///yH5BAEAAAcALAAAAABsAB8AAAP/eBfczgPIR4O6OOvNu/9gqBBFaWnDQAiCMYhwLM/cUJpHurZG77u0oHCYAdwKgJ9y2TsRn9CMjnUsEJjMQI8Q7QanPB/peFWulocW18sWlbFV609wC/cO27bek8QajFVvLjcDc3gGa3uKGIJLcXI9dISGPQCLlyN+gIE+NpM+AoWDKkaYbY0/j5CSn1uikXmmXqiVR5tlnq2IfQahSQKys0ysVmNyxCWvLm8ABIXAwVG0uQWIN1cBccoqPwAtlhm4HGVczQROB8XOMOSi0OFLxFfGK4/KAXaRG+L7eTwvF8IUYOdKnwZUubRYK3HO3o80cwAe7CGxCAtL/y68qQjC/5sAAO76zTnCwxg1kw8jVcwGDwiIjAd4cYwRcuKPbCbE2GP1ClgsfD9IZFr2A+CAixCBvLK0Q2KLdwo/skhhMKkAQcTCGDvSq5VPpcMGlsn3J4c/igp7KegDrRrFtVtw1XwTQBDOAsq2lvjlVZQNUM1AHRAkIZUoLv94vHNrAG6sf3L1yRwMimTQOJFaOWsy9sIrbm/T+QB5Vgk4BTwshIHmg7ILd0uHGjiibOENtpr7JK1IrvMFtoeTKnFSxtLwkJF7jda4xfJlrpmTdSpzqDEGd/wUwC6t5N12RJWKu6aqRGIZ2ku28uI5XW1rDGyzm+0VPAz5sgrE9HDLYv/42rL+UbYVEwNWtlcnT+2GQUniMUdfaeBshJohdkCTnHKxXGELHAx1F8FDari2WHv7lVAdaYgoOKFa81XSYor/+YCXDxYQUOAw3vgxRx5phXJUa2/4GEYA9YXWIheMGWBBkgAlB41igxnDi45UFuXYEi/Q4mKRLsn2QhgBvRcji2kFFgFZVer4zou9nIDLlOBwyRGUfSRSp4PkvfOGlmlisWYGRA6ADqApRANCAWj2mYWhmCQAADs='
  },
  payzapp: {
    h: 24,
    col: pngBase64Prefix + 'iVBORw0KGgoAAAANSUhEUgAAAHAAAAAlCAMAAACtfZ09AAAAY1BMVEXuQEGBmb/+7+9BZZ/AzN/839/2n6DrICLpEBLxYGH7z9DsMDHvUFH4r7Dv8vf1j5Df5e/ycHHQ2edhf68iTI+gss8SP4dxjLcxWZewv9eQpcdRcqf5v8DzgIEDM3/oAQP///+4CVglAAAAIXRSTlP//////////////////////////////////////////wCfwdAhAAADRUlEQVR4Ab2Ue3PiOBDEZflh/DAG8whhpXV//095jKYlqyp1x20C239ESE755+6ZkcELZacaz/QyYN907Trg7wCdN7tV5N4PrJvjsEYZvBfo5rFdc9XvA9rJmzWJ6vAeYD93ubGknX0LsJ49RaUSelDv7VK7I6+1/x8YP3JGTKcHDoXqfoDoIr8vqGQBsJd1AeBXqgEmcdxwUlSNBVBzM9cKtCvVu5WyQPE7SgCH8KvU0wNweiznPVBHgwPNcjbGVNkGaNaoYwAmTPrcFsCv30kL8EFgJUul/E8A3Uo5miWwzXvpuCY5w1Q0jEYWNvh5AxbYXwncK/AUNkCdZp4GCbRrxkglE448NtsdwXfM4JuXjwCUJK+3wBDyfWGwm8Fag2v5qhAaplGB8nfqjwm4k2yTJikm8CnvBBCAYvBUBmAp+/AnL0anKY5GOAxt4HPn2BUR2AsfKEUXSOA7aM/cwJrdpZAC1POSHQOT6qQGpwiUtWO32FmsM/7G6GnNNrwwYHXyger2WK44C1xO6Jwdkwx6NdgiAqWcDZwsJnTsiHoIdAPUzjngEvvxsauhtaIKeXYhcNGzMp/f1ircE6hmKJc6Vv8DlPY9opaNdxKD1z2B0MMDsvFqGGJNIJ/wWdaxI2BgtStLfrcEDjFMnS/4DNQILIPpfNYGpjsiAtPgDS4LvvUQ4KRTy4GTwAcaLquqWog4FcWZwNgxyYajwdH7VsrEnmFttGMfmx4iE/bY1GqPx8YHG5XihXDKb23zpWjgIlL6EWn3Zey1JLERyY7a64Vwz29tsdHlQLh4jNSxGZDunbXy1+vYV/p28Nq+FoVGWnEwM4NdNOgfagOQgyfis34D9rLnfKp2AO5SKASdGCHKQLoz2WOaeRocY3xu2yKWGkkmYoYUy0jKLxrU8YxAXtupaB50O23AgecAv8xkwIjpUpd7dkaRDN6wAW/hBkKXzTw8IyTQfukZnwF7p6rhKAugekhLuDx+HdKvPaqw7/OZR5+avk/NgCh9eZLBt2RSon+i6dtAt/6ZBuN9GvwfGXwmM/omBfp94PQUtDOdn5wF9VNg+1/hHRke9Qpg8y/hzSm81wJt+zy8lwL98/BeCxwZ3vf0D5XUzxaJRoO1AAAAAElFTkSuQmCC'
  },
  payumoney: {
    h: 18,
    col: pngBase64Prefix + 'iVBORw0KGgoAAAANSUhEUgAAAI0AAAAgCAMAAAAYAgunAAAAMFBMVEXT46mRuSr7/PeGsxakxk/I3JXz9+fr8ti30nTj7sqyzmqcwD+sy17d6b2+1oL///+7L4YrAAAAEHRSTlP///////////////////8A4CNdGQAAA+xJREFUeNrNV4tuIyEMNAbMw0D+/29vbEi2Fylt79RInSgrwMaeHWykpdv/gXMY5fbT+F82smL6PWyYtM42C/8KNkDTCH1+C5v5W9iwwdiMn2fDhm9QuIYyMxGt3rP8LBuW1or9yqeMuMBN9lBKTgG62I6fBZWujjTyZw3SBlyyO3BOqY/wlg7vMQYHXna+9ssRSC5OGVFXTm9hE6Jmw4L4/bU462LTjM16F5t+CqNHbSwFEGEs4GHw0ZM2oa6kXY7VN1wDB5/ZY+phr4iwupH54yLY1DOhEGZbfaAqcmMmPLal5Mx/s4lBFxU386xjjDVZch+jnk3csi0/nBqMsJLstHPdfTlj68m/8gc2DWxIQ0oaopL0MMo21KjyxCaGvGNIDdEQ1ogOJRgka9wYlotzONPeMPM9AX/NImon4mGR9YlNI5pz0kBR5BDOe2ocH7Vpnvf0l9VdXVWNUF81Wav5ahh72V6pJRh9GhY7N105d/hO7jGQhyJw/cAmgw0zu/oYTo10J51vL7RhhCQRbLC8IhN56SZIUZuIEPJDnIwkhWF1rmWY9MxlBUSBbcnpE7IqFkOhD13SNM6SYpVDeprvxebSRpDdF7FGNs/gaVqk5mRXgCPXGPbUG6XpCTQVGYxAMRsiNFe6A8NlBOM2J1YDSQ3J3VZUeaUN2KgPKmK5wIhyg0Kn5vzNuTtlAKEmm0I0gawgUhDBSl1AxKgdBF2F0VMJADPaJ4cECM23F3XzTTbhsKmHTdCEn0awuRdOwcTrzbWpawoShaB3NlOR8pTND2sTNdgvaBZzybBSRJpTN/uiYtRVna3Z+RHLgGmXzWGjnnDqxabc2fR/0kYzZTIUturpgo0W4OopwPIXT2L9BG6W3svG/IAOqtQxtM55rU17NIRVsXD9WxuNQ3hj50qNecDnmc1poxYCMWyWM8V+jgcweX3Qy2s2cMZToLU1/PSeurSBnqYsrCJWvlztIBoU4ovNvQOpiLRqnWjbOk+c57nmLsCNX7PBc99+y28/D1se2tgtAOtaq6Yxd+SUu1cnhv1iY7dVGkNBUZx1GHruCiF9JgOIHjYDItzZ4D323Y9HmmxsQrm04dJNZWCfd0mYRa9OSsbpojNcAmv2x/Eob9us6sag1n4bslJ1M+kQdxr+viUPS5ZqYzO60x6UyxrSKr4nYbarsyHyBS6TcqYmvGe0Lu1YmhtncetZK7JplXK2+MK+Re+e7nQGvHch1MMMXxztwJiYn78GBP/HjGKkZyN//7viU+uVxnvv6y+Yoqbgu+H1Kl+wYVoJ0vCbuRTqGtHZX7CRgVLLb5eGUvSL4EttKri8HS3pmOzDP+UnwTXbEK2hAAAAAElFTkSuQmCC'
  },
  olamoney: {
    h: 22,
    col: pngBase64Prefix + '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'
  }
}

var emi_options = sessProto.emi_options = {
  // minimum amount to enable emi
  min: 3000*100-1,
  installment: function(length, rate, principle){
    rate /= 1200;
    var multiplier = Math.pow(1+rate, length);
    return parseInt(principle*rate*multiplier/(multiplier - 1), 10);
  },

  selected: 'KKBK',
  banks: {
    KKBK: {
      patt: /4(04861|78006|34669|1(4767|664[3-6])|363(88|89|90))|5(24253|43705|47981)/,
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
      patt: /3608(25|26|86|87)|4(05028|18136|3(467(7|8)|6(306|520)|7546)|5(11|77)04|6178(6|7)|8(549(8|9)|9377))|5(176(35|52)|22852|24(111|181|216|368|931)|28945|33744|45(226|964)|5(2(088|2(60|74)|3(44|85))|6042|8818|9300|(358|515|898)3))/,
      name: 'HDFC Bank',
      plans: {
        3: 12,
        6: 12,
        9: 13,
        12: 13,
        18: 15,
        24: 15
      }
    },

    AXIS: {
      patt: /(436560|46111[6-8]|464118|524240|405995|55934[0-2]|(45(050|145)6)|(5245(08|12)))00|40743(903|(8|9)00)|524178(00|10|11)|5305620(0|2)|4111460(0|1)|45145(700|604)|4111460[2-5]|4182120(1|2)|47186(00(0|1|3)|10[0-2]|30[0-2]|400)/,
      name: 'Axis Bank'
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
    }
  }
}

emi_options.banks.AXIS.plans = emi_options.banks.HDFC.plans;

var tab_titles = sessProto.tab_titles = {
  emi: 'EMI',
  card: 'Card',
  netbanking: 'Netbanking',
  wallet: 'Wallet'
}

function notifyBridge(message){
  if( message && message.event ){
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

function setPaymentMethods(session){
  var availMethods = preferences.methods;
  var methods = session.methods = {
    count: 0
  };

  var passedWallets = session.get('method.wallet');
  each(
    availMethods,
    function(method, enabled){
      if(enabled && session.get('method.' + method) !== false){
        methods[method] = enabled;
      }
    }
  )

  var amount = session.get('amount');
  if (amount <= emi_options.min) {
    methods.emi = false;
  }

  if (!methods.card) {
    methods.emi = false;
  }

  if (methods.emi && !session.get('theme.emi_tab')) {
    tab_titles.card = 'Card/EMI';
    sessProto = tab_titles;
  }

  if (amount >= 100*10000 || methods.wallet instanceof Array) { // php encodes blank object as blank array
    methods.wallet = {};
  } else if (typeof passedWallets === 'object') {
    each(
      passedWallets,
      function(wallet, enabled){
        if (enabled === false) {
          delete methods.wallet[wallet];
        }
      }
    )
  }

  if (!methods.netbanking || methods.netbanking instanceof Array) {
    methods.netbanking = false;
  } else {
    methods.count = 1;
  }

  if (methods.card) {
    methods.count++;
  }

  each(
    session.get('external.wallets'),
    function(i, externalWallet){
      if(externalWallet in freqWallets){
        methods.wallet[externalWallet] = true;
        freqWallets[externalWallet].custom = true;
      }
    }
  )
  var wallets = [];
  each(
    methods.wallet,
    function(walletName){
      var freqWallet = freqWallets[walletName];
      if(freqWallet){
        freqWallet.name = walletName;
        wallets.push(freqWallet);
      }
    }
  )

  if(wallets.length){
    methods.count++;
  }
  methods.wallet = wallets;
}

function fetchPrefsAndShowModal(session) {
  // set test cookie
  // if it is not reflected at backend while fetching prefs, disable cardsaving
  document.cookie = 'checkcookie=1';
  var prefData = makePrefParams(session);
  prefData.checkcookie = 1;

  Razorpay.payment.getPrefs(prefData, function(response) {
    if(response.error){
      return Razorpay.sendMessage({event: 'fault', data: response.error.description});
    }
    preferences = response;
    showModal(session);
  })
}

function showModal(session) {
  var options = preferences.options;
  session.hide_topbar = preferences.hide_topbar;
  var saved_customer = preferences.customer;

  // pass preferences options to app
  if (CheckoutBridge) {
    invoke('setMerchantOptions', CheckoutBridge, JSON.stringify(options));
  }

  if (saved_customer) {
    var session_options = session.get();
    // we put saved customer contact, email into default prefills
    if (saved_customer.contact) {
      session_options['prefill.contact'] = saved_customer.contact;
    }
    if (saved_customer.email) {
      session_options['prefill.email'] = saved_customer.email;
    }

    var customer;
    if (saved_customer.customer_id) {
      options.remember_customer = true;
      customer = new Customer('');
      getCustomer = function(){
        return customer;
      }
    }

    customer = getCustomer(saved_customer.contact);
    sanitizeTokens(saved_customer.tokens);
    customer.tokens = saved_customer.tokens;

    if (saved_customer.saved !== true) {
      customer.logged = true;
    }

    customer.customer_id = saved_customer.customer_id;
  }
  if (!navigator.cookieEnabled) {
    options.remember_customer = false;
  }

  Customer.prototype.key = session.get('key');
  Razorpay.configure(options);
  showModalWithSession(session);
}

function showModalWithSession(session){
  setPaymentMethods(session);
  session.order = preferences.order;
  session.render();
  Razorpay.sendMessage({event: 'render'});

  if (CheckoutBridge) {
    $('#backdrop').css('background', 'rgba(0, 0, 0, 0.6)');
  }

  if(qpmap.error){
    errorHandler.call(session, qpmap);
  }
  if(qpmap.tab){
    session.switchTab(qpmap.tab);
  }
}

// generates ios event handling functions, like onload
function iosMethod(method){
  return function(data){
    var iF = document.createElement('iframe');
    var src = 'razorpay://on'+method;
    if(data){
      src += '?' + CheckoutBridge.index;
      CheckoutBridge.map[++CheckoutBridge.index] = data;
    }
    iF.setAttribute('src', src);
    doc.appendChild(iF);
    iF.parentNode.removeChild(iF);
    iF = null;
  }
}

var platformSpecific = {
  ios: function(){
    // setting up js -> ios communication by loading custom protocol inside hidden iframe
    CheckoutBridge = window.CheckoutBridge = {
      // unique id for ios to retieve resources
      index: 0,
      map: {},
      get: function(index){
        var val = this.map[this.index];
        delete this.map[this.index];
        return val;
      },

      getUID: function(){
        return _uid;
      }
    };

    var bridgeMethods = ['load','dismiss','submit','fault','success'];

    each(bridgeMethods, function(i, prop){
      CheckoutBridge['on'+prop] = iosMethod(prop)
    })
    CheckoutBridge.oncomplete = CheckoutBridge.onsuccess;
  },

  android: function() {
    $(doc).css('background', 'rgba(0, 0, 0, 0.6)');
  }
}

function setQueryParams(search){
  each(
    search.replace(/^\?/,'').split('&'),
    function(i, param){
      var split = param.split('=', 2);
      if( split[0].indexOf('.') !== -1 ) {
        var dotsplit = split[0].split('.', 2);
        if( !qpmap[dotsplit[0]] ) {
          qpmap[dotsplit[0]] = {};
        }
        qpmap[dotsplit[0]][dotsplit[1]] = decodeURIComponent(split[1]);
      } else {
        qpmap[split[0]] = decodeURIComponent(split[1]);
      }
    }
  )

  var platform = qpmap.platform;
  if(platform){
    addBodyClass(platform);
    invoke(platformSpecific[platform]);
  }
}

Razorpay.sendMessage = function(message){
  if (isNonNullObject(CheckoutBridge)) {
    return notifyBridge(message);
  }

  if(ownerWindow){
    message.source = 'frame';
    message.id = _uid;
    if (isNonNullObject(message)) {
      message = stringify(message);
    }
    ownerWindow.postMessage(message, '*');
  }
}

window.handleOTP = function(otp) {
  otp = String(otp).replace(/\D/g, '').split('').join(' ');
  var session = getSession();
  var otpEl = gel('otp');
  if(session && otpEl && !otpEl.value){
    otpEl.value = otp;
  }
}

function validUID(id){
  if(isIframe && !CheckoutBridge){
    if(!isString(id) || id.length < 14 || !/[0-9a-z]/i.test(id)){
      return false;
    }
  }
  return true;
}

window.handleMessage = function(message) {
  if('id' in message && !validUID(message.id)){
    return;
  }
  var id = message.id || _uid;
  var session = getSession(id);
  var options = message.options;
  if(!session){
    if(!options){
      return;
    }
    try{
      session = new Session(options);
    } catch(e){
      Razorpay.sendMessage({event: 'fault', data: e.message});
      return roll('fault', e, 'warn');
    }
    var oldSession = getSession();
    if(oldSession){
      invoke('saveAndClose', oldSession);
    }
    session.id = _uid = id;
    sessions[_uid] = session;
  }

  if (message.context) {
    trackingProps.context = message.context;
  }

  if (message.integration) {
    trackingProps.integration = message.integration;
  }

  if(message.embedded){
    session.embedded = true;
    $(doc).addClass('embedded');
  }

  if(message.data){
    session.data = message.data;
  }

  if(message.params){
    session.params = message.params;
  }

  if(message.event === 'open' || options) {
    if (!preferences || session.get('remember_customer')) {
      fetchPrefsAndShowModal(session);
    } else {
      showModal(session);
    }
  } else if(message.event === 'close') {
    session.hide();
  }
}

function parseMessage(e){ // not concerned about adding/removeing listeners, iframe is razorpay's fiefdom
  var data = e.data;
  if(e.source && e.source !== ownerWindow){
    return;
  }
  try{
    if(typeof data === 'string') {
      data = JSON.parse(data);
    }
    window.handleMessage(data);
  } catch(err){
    roll('message: ' + data, err, 'warn');
  }
}

function applyUAClasses(){
  if(/Android [2-4]/.test(ua)){
    addBodyClass('noanim');
  }
}

function initIframe(){
  $(window).on('message', parseMessage);

  if (location.search) {
    setQueryParams(location.search);
  }

  if (CheckoutBridge) {
    delete trackingProps.context;
    trackingProps.platform = 'mobile_sdk';
    var os = qpmap.platform;
    if (os) {
      trackingProps.os = os;
    }
  }

  if (qpmap.message) {
    parseMessage({data: atob(qpmap.message)});
  }

  applyUAClasses();
  Razorpay.sendMessage({event: 'load'});
}

initIframe();
