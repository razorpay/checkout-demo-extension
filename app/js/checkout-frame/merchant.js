// flag for checkout-frame.js
discreet.isFrame = true;

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

var gifBase64Prefix = 'data:image/gif;base64,';
var sessProto = Session.prototype;
sessProto.netbanks = {
  SBIN: {
    image: 'R0lGODlhKAAoAMQQAPD2/EGI2sTa86fI7m2k4l6b3+Lt+dPk9nyt5SR21Hut5cXb9Jm/61CS3f///xVt0f///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAABAALAAAAAAoACgAAAXyICSO5GgMRPCsbEAMRinPslCweL4WAu2PgoZumGv0fiUAgsjMIQBIEUDVrK4C0N8hYe0+EgcfgOvtJrJJarmLlS3XZURJAIcfRcJ6uQHU20U3fmUFEAaCcCeHayiKZSlwCgsLCnBqXgcOmQ4HjUwKmpqUnToLoJkLo6SmDqipOJ+moq4smJqca5ZdDJkMlQRwDZl5jgPAwnAwxg7DXjGBXsHLa4QQdHvHZXfMVdHbTXx90NhddyJvVt1ecmld6VZtMmPo40xnPlvc9ENgSFPf+jng9Tunw92QJ1FIBBliEIeRhDNsFNHHA+KPE4/SuYCRMAQAOw==',
    title: 'SBI'
  },
  HDFC: {
    image: 'R0lGODlhKAAoAKIAAL/S4+4xN/WDh+/0+PJaXwBMj////+0jKiH5BAAAAAAALAAAAAAoACgAAAOqeLrca9C4SauL0uqtMP+VB46MSJLmCaZqh71wHBGcbNv0du9vrvFAg88S5A1DxduRklTWYIWodBoFwJaTGHVbsPaeLy7Vi8FeoGIpeXbmpdXN27sat827ddl9jSP4/1pzfAYCf39ZaG+DZg2BildgGHuQOjAAl5iZlwOUP3lflZ9soaJCkaKMJaUQqQ+rphuGsn5ls4YBLaoQuSsRvB8sv0y+wp67xUTEIwkAOw==',
    title: 'HDFC'
  },
  ICIC: {
    image: 'R0lGODlhKAAoAOZGAP/58evKy/ry8vzOk/qpQsRfZMJHLvqvUP7t1uGvsbUxL79SV9iVmPmjNbpFSueAKbU3PctVLfCPKPvCeP7z5PDX2PzIhvSWKNVkLOa8vsltcfu2Xc56frk4L850cNeUl/Xk5f3myd5yKtOHi+uHKfzUoMdOLf3arr5MSf/58r5ALv3gu9+EU9yipLo/PPXe1/rs5eCjlvTYytybl+qxle/FsMRZVvu8a+J5Kuq9sNlrK/7nyeOAN+Wee/3gvNyWifWcNeGopOuONvmdJ////7AqMP///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAAEYALAAAAAAoACgAAAf/gEaCg4SFhoICCR4oRY1FLh45h5OUgwEejpmZNi+VnoIBBZqjjhAVn5MwmJkQDAJEAgujKACohTUumgsVRL1EGaQztoIAPQqaECC+vcCjDsMALKQJy70cpEWnnwg8pBDVRCDYRUHbQsejBdWx4x+eCEDoowvLILLtlQANBuNFDAEBGEDoV8TdJAAHMBBcmMngoQkS+hVoESCDBoYxJpUYwo+UgwDVLhKUcYhCgwfYRryqxoCggVqGNnB0BhIckWv9WBw6MQSlpgIrwQkg2MGCIX1DTGjiYNNXAoIiEBgaMOSCJmpNe4nE1oHA0QZDRGQakbXX0H4PThjaOCRCpgAC+xg4KEKvWot+JhrAJERgyJAO/XgtE8X1wgBDCPwOIVjTbD8SXg1Z8EuCYLWn2EQMWXGob0/Ly7ZqwjBkQ0nFPrGpWzZwVIQhDSgcCqE44jimvgKQer15ElXF8kZh7dVSkw6/Eyj99qsUmzJfhBspwOH3QKXlnz1Wy6SCRPW9h7DPHEXWVwXppP0SAB9esd8LKkZlWKY7ggTFBKR6Yuv+gltHDlRDw32KHcDeJIm5VxsGBhjwQzXYbXAgJZ4p6B4F1figmFHDGMGThYrdYNMEE4TQ4SAHgOjXDlmdOAgFFbpnQVMuFgKATO4dkAI4NU4SwgQHEDDAjsv0OEggADs=',
    title: 'ICICI'
  },
  UTIB: {
    image: 'R0lGODlhKAAoAMQQAOvJ1vry9bM1Z7hDcfXk68JehtaTrvDX4eGuwsdrkNKGpMx5mr1Qe+a8zNuhuK4oXf///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAABAALAAAAAAoACgAAAXdICSOZGmeaKqubIsGgSunyjLf5PE8B44Xu4Jv1tjtEMNWYGB8DGJJlaG5M0RTBAF1R7ieEttdwlsChI0A8ohx3g3UEEfb2PMGtPMxWTHnknV9VmRAcwJQVwh9D0h2THNvZFN9aV4EikJkYH1dXmZ9CmqObQJ4bZArknMOqW0OK3d9kKJnhioLipRFnymeeSSEc3UmwG2cIpZ9mCWJgSZ8fYwjsI+H0qVnTySsZ9HLioIQyHPKJ2yFnMRnwie9bWO6czYrt5OzYbUrWX0MAP3+//3WqTgAsCAlOAivhAAAOw==',
    title: 'Axis'
  },
  KKBK: {
    image: 'R0lGODlhKAAoANUtAL/N3O/z9s/a5d/m7kBqlyBRhTBdjjsxYFB2oI+owoCcup+0y3cqTK/B1HCPsVB2n2CDqPvGyB41avRxdkovW+4qMmgsUfBHTf7x8fm4u4tviw82b+idpNy8xf3j5PNjaI2Mp7dqfPaOkntjg5QnQsEhM4hFYks9ad4eKRBEfe0cJP///wA4dP///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAAC0ALAAAAAAoACgAAAb/wJZwSCwaj8ikcslsFgOAqDTgdA4SiBRry92mEIlB9bggdM9oFmExFgIK6fi5AHAGEPKuZCNHUJUCBnksEhYlKgd5BgJJAlp5FiqSiIMpjEaOgywMk5SVl0MBgmgFcFyck4maBn9CDmcEDSuzKwtwqJIHKQoDtAMKj1wOQwBnELTIKwq4KhoBybMDo1x1LXhcBNDIHJMT2rQBplsILQNnvd8rEZIX6bTFXVddD8lQyOsVGO60ZlwJ/VsWRIMQrAAEAOsiaGvg4EGCZysadCEQjEWvTGlMiIAWqIulFQE8npklDs0IjhW9EACYZoW5OCkg+kqpiYtLOQCgTat55tlOui4Ck72CqUBByYqyBByVlSwDCJoBZwVLwdLBrAALHjiUSctDBZBG5wmINjGBR67fMFxQgWxAlGRm/b3komDfig+SOuwrKYYli7HpJkw6AVibgi7kWsDjkiIntAAhOukqjGzBmWothnaBwHSFAGDMVPGi1cDvsFA/44SuyaoIxjyrPx15rVqybCQd5XBCQYLCoEVL7sg54FuTHydveJLCXKWMcjVs2hC5kgUmGDHSk0CREqVV9u/gwy8JAgA7',
    title: 'Kotak'
  },
  YESB: {
    image: 'R0lGODlhKAAoANUxAMg0KRBcmfTW1NNcVNdqY8tBOOmtqfvx8c9PRjBypyBnoPjk4sJ9gKGTpL9EP8ptajxvn9WVlFl3nuGSjfDJxrSruY16j2yQtK5la6qCj8dfXFyFrdp4cbCdq2mCpZSWq52FlixkmaZ1gHiNrL5wcqu7zrWAh3ybu1VqkXR/npGIncNRTc56eEB9rb/T5MQmGwBRkv///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAADEALAAAAAAoACgAAAb/wJhwSCwaj0bDAslsNgUTp3QaOyAO1CySYNB6iQbEdywAUMZeKwHt5byWR5d8Tq/b74YX6y6H+f+AgYKCKAAAEIOJioswIQ4vIoySkgEYLwUJk5qJFi8vFpuhgBIALysKoqIJjy8pqaGVng8Br5sgngAStZoepS8Mu5MJA54FiMGLAQyeLxnIjA3MCKjPiRe+LyrVicPMGrTbgcrMLyPhgtHMJODnftfMABvtfy0E5CbzfgER5AUt+TAqkHvRAeCJAuQGUGtXb+CHfPsGztrVoqLFiwLJAShxsaPHj0UOEBhAEpunKGyOlBlYDEtKlSY9dXmJZCWzATSfYDuTk8nKBzU9n7zpGQQAOw==',
    title: 'Yes'
  }
};

var freqWallets = sessProto.walletData = {
  paytm: {
    h: '16',
    col: gifBase64Prefix + 'R0lGODlhUAAYANUgAD/L9UJik+/y9oGWtzJVihM6dw++8+/7/mJ8pV/U9+Dl7dDY5M/y/S/H9JGjwCNHgZ/l+r/u/B/C9K/p+9/2/bC90lJvnKGwyW/Y+HGJrsLu/I/h+cDL23/c+AC68gQub////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAACAALAAAAABQABgAAAb/QJBwSCwaj8gkEiJhKJ/QqHQKgng8Hap2yy1ar9nuUMEpm8uLI/nMSRMFg7hb6JAXGZPE9ZqIHEAUERFOIBEdHRFDBxAdEH9CBR+Sk5MPHEWRlJIPFUMWkwUKQgigokITe6lXDRoGewkSqRITGK57YZq5BXMguZSdIAGUl73DQx2qqnrJzKpZvpoIRNCSBELCk8SaxCDIzR7L398U1JVEBOUCIA/GxdnH4uHizBvlk29xcZnv20L9QgcaNEvgbZ4Bgak6aKKzEMmAfv/+ESmIRQhFDxRAxNpjwAmAhA05NBTCAUGAk7kuoXvnThI3eLcspgIgcw/NbiApkRxJqtwl7WySgEmECabmlZsUkea8B6In0wv2PvykVCDASpYTExr1oNTmVoVRhVylNtXey69bux79GtVaS7IgHEQ9izNm3bV3ubK1l8EfJQsCFPQTMNYXXYphkqbdS42Aurfa2gkAatgI4sV51WKhVgDBY8h+sYJYUCHOp3ZZ7SrOzFiSEk0ORktcU0YuaqIVWetGPPJIrgD7XApREDylZa27Z7b+oISd2Z3pjqtWnvxWbyMPn4MQSU2a9KLV8fLWmYSwvcfcfTk+cjm83rwdrhaAcuGk/fsXhpjXFMDB5zu2NPBIQHtgIAQDthgwgRAUBHhAEAA7'
  },
  mobikwik: {
    h: '19',
    col: gifBase64Prefix + 'R0lGODlhbAAfAKIHAJvl5ODt7UPS0L/w73/h4P///wDDwf///yH5BAEAAAcALAAAAABsAB8AAAP/eBfczgPIR4O6OOvNu/9gqBBFaWnDQAiCMYhwLM/cUJpHurZG77u0oHCYAdwKgJ9y2TsRn9CMjnUsEJjMQI8Q7QanPB/peFWulocW18sWlbFV609wC/cO27bek8QajFVvLjcDc3gGa3uKGIJLcXI9dISGPQCLlyN+gIE+NpM+AoWDKkaYbY0/j5CSn1uikXmmXqiVR5tlnq2IfQahSQKys0ysVmNyxCWvLm8ABIXAwVG0uQWIN1cBccoqPwAtlhm4HGVczQROB8XOMOSi0OFLxFfGK4/KAXaRG+L7eTwvF8IUYOdKnwZUubRYK3HO3o80cwAe7CGxCAtL/y68qQjC/5sAAO76zTnCwxg1kw8jVcwGDwiIjAd4cYwRcuKPbCbE2GP1ClgsfD9IZFr2A+CAixCBvLK0Q2KLdwo/skhhMKkAQcTCGDvSq5VPpcMGlsn3J4c/igp7KegDrRrFtVtw1XwTQBDOAsq2lvjlVZQNUM1AHRAkIZUoLv94vHNrAG6sf3L1yRwMimTQOJFaOWsy9sIrbm/T+QB5Vgk4BTwshIHmg7ILd0uHGjiibOENtpr7JK1IrvMFtoeTKnFSxtLwkJF7jda4xfJlrpmTdSpzqDEGd/wUwC6t5N12RJWKu6aqRGIZ2ku28uI5XW1rDGyzm+0VPAz5sgrE9HDLYv/42rL+UbYVEwNWtlcnT+2GQUniMUdfaeBshJohdkCTnHKxXGELHAx1F8FDari2WHv7lVAdaYgoOKFa81XSYor/+YCXDxYQUOAw3vgxRx5phXJUa2/4GEYA9YXWIheMGWBBkgAlB41igxnDi45UFuXYEi/Q4mKRLsn2QhgBvRcji2kFFgFZVer4zou9nIDLlOBwyRGUfSRSp4PkvfOGlmlisWYGRA6ADqApRANCAWj2mYWhmCQAADs='
  },
  payzapp: {
    h: '24',
    col: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHAAAAAlCAMAAACtfZ09AAAAY1BMVEXuQEGBmb/+7+9BZZ/AzN/839/2n6DrICLpEBLxYGH7z9DsMDHvUFH4r7Dv8vf1j5Df5e/ycHHQ2edhf68iTI+gss8SP4dxjLcxWZewv9eQpcdRcqf5v8DzgIEDM3/oAQP///+4CVglAAAAIXRSTlP//////////////////////////////////////////wCfwdAhAAADRUlEQVR4Ab2Ue3PiOBDEZflh/DAG8whhpXV//095jKYlqyp1x20C239ESE755+6ZkcELZacaz/QyYN907Trg7wCdN7tV5N4PrJvjsEYZvBfo5rFdc9XvA9rJmzWJ6vAeYD93ubGknX0LsJ49RaUSelDv7VK7I6+1/x8YP3JGTKcHDoXqfoDoIr8vqGQBsJd1AeBXqgEmcdxwUlSNBVBzM9cKtCvVu5WyQPE7SgCH8KvU0wNweiznPVBHgwPNcjbGVNkGaNaoYwAmTPrcFsCv30kL8EFgJUul/E8A3Uo5miWwzXvpuCY5w1Q0jEYWNvh5AxbYXwncK/AUNkCdZp4GCbRrxkglE448NtsdwXfM4JuXjwCUJK+3wBDyfWGwm8Fag2v5qhAaplGB8nfqjwm4k2yTJikm8CnvBBCAYvBUBmAp+/AnL0anKY5GOAxt4HPn2BUR2AsfKEUXSOA7aM/cwJrdpZAC1POSHQOT6qQGpwiUtWO32FmsM/7G6GnNNrwwYHXyger2WK44C1xO6Jwdkwx6NdgiAqWcDZwsJnTsiHoIdAPUzjngEvvxsauhtaIKeXYhcNGzMp/f1ircE6hmKJc6Vv8DlPY9opaNdxKD1z2B0MMDsvFqGGJNIJ/wWdaxI2BgtStLfrcEDjFMnS/4DNQILIPpfNYGpjsiAtPgDS4LvvUQ4KRTy4GTwAcaLquqWog4FcWZwNgxyYajwdH7VsrEnmFttGMfmx4iE/bY1GqPx8YHG5XihXDKb23zpWjgIlL6EWn3Zey1JLERyY7a64Vwz29tsdHlQLh4jNSxGZDunbXy1+vYV/p28Nq+FoVGWnEwM4NdNOgfagOQgyfis34D9rLnfKp2AO5SKASdGCHKQLoz2WOaeRocY3xu2yKWGkkmYoYUy0jKLxrU8YxAXtupaB50O23AgecAv8xkwIjpUpd7dkaRDN6wAW/hBkKXzTw8IyTQfukZnwF7p6rhKAugekhLuDx+HdKvPaqw7/OZR5+avk/NgCh9eZLBt2RSon+i6dtAt/6ZBuN9GvwfGXwmM/omBfp94PQUtDOdn5wF9VNg+1/hHRke9Qpg8y/hzSm81wJt+zy8lwL98/BeCxwZ3vf0D5XUzxaJRoO1AAAAAElFTkSuQmCC'
  },
  payumoney: {
    h: '18',
    col:  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAI0AAAAgCAMAAAAYAgunAAAAMFBMVEXT46mRuSr7/PeGsxakxk/I3JXz9+fr8ti30nTj7sqyzmqcwD+sy17d6b2+1oL///+7L4YrAAAAEHRSTlP///////////////////8A4CNdGQAAA+xJREFUeNrNV4tuIyEMNAbMw0D+/29vbEi2Fylt79RInSgrwMaeHWykpdv/gXMY5fbT+F82smL6PWyYtM42C/8KNkDTCH1+C5v5W9iwwdiMn2fDhm9QuIYyMxGt3rP8LBuW1or9yqeMuMBN9lBKTgG62I6fBZWujjTyZw3SBlyyO3BOqY/wlg7vMQYHXna+9ssRSC5OGVFXTm9hE6Jmw4L4/bU462LTjM16F5t+CqNHbSwFEGEs4GHw0ZM2oa6kXY7VN1wDB5/ZY+phr4iwupH54yLY1DOhEGZbfaAqcmMmPLal5Mx/s4lBFxU386xjjDVZch+jnk3csi0/nBqMsJLstHPdfTlj68m/8gc2DWxIQ0oaopL0MMo21KjyxCaGvGNIDdEQ1ogOJRgka9wYlotzONPeMPM9AX/NImon4mGR9YlNI5pz0kBR5BDOe2ocH7Vpnvf0l9VdXVWNUF81Wav5ahh72V6pJRh9GhY7N105d/hO7jGQhyJw/cAmgw0zu/oYTo10J51vL7RhhCQRbLC8IhN56SZIUZuIEPJDnIwkhWF1rmWY9MxlBUSBbcnpE7IqFkOhD13SNM6SYpVDeprvxebSRpDdF7FGNs/gaVqk5mRXgCPXGPbUG6XpCTQVGYxAMRsiNFe6A8NlBOM2J1YDSQ3J3VZUeaUN2KgPKmK5wIhyg0Kn5vzNuTtlAKEmm0I0gawgUhDBSl1AxKgdBF2F0VMJADPaJ4cECM23F3XzTTbhsKmHTdCEn0awuRdOwcTrzbWpawoShaB3NlOR8pTND2sTNdgvaBZzybBSRJpTN/uiYtRVna3Z+RHLgGmXzWGjnnDqxabc2fR/0kYzZTIUturpgo0W4OopwPIXT2L9BG6W3svG/IAOqtQxtM55rU17NIRVsXD9WxuNQ3hj50qNecDnmc1poxYCMWyWM8V+jgcweX3Qy2s2cMZToLU1/PSeurSBnqYsrCJWvlztIBoU4ovNvQOpiLRqnWjbOk+c57nmLsCNX7PBc99+y28/D1se2tgtAOtaq6Yxd+SUu1cnhv1iY7dVGkNBUZx1GHruCiF9JgOIHjYDItzZ4D323Y9HmmxsQrm04dJNZWCfd0mYRa9OSsbpojNcAmv2x/Eob9us6sag1n4bslJ1M+kQdxr+viUPS5ZqYzO60x6UyxrSKr4nYbarsyHyBS6TcqYmvGe0Lu1YmhtncetZK7JplXK2+MK+Re+e7nQGvHch1MMMXxztwJiYn78GBP/HjGKkZyN//7viU+uVxnvv6y+Yoqbgu+H1Kl+wYVoJ0vCbuRTqGtHZX7CRgVLLb5eGUvSL4EttKri8HS3pmOzDP+UnwTXbEK2hAAAAAElFTkSuQmCC'
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
    }
  }
}

emi_options.banks.AXIS.plans = emi_options.banks.HDFC.plans;

var tab_titles = sessProto.tab_titles = {
  card: 'Card/EMI',
  netbanking: 'Netbanking',
  wallet: 'Wallet'
}

function notifyBridge(message){
  if( message && message.event ){
    var bridgeMethod = CheckoutBridge['on' + message.event];
    var data = message.data;
    if(typeof data !== 'string'){
      if(!data){
        return invoke(bridgeMethod, CheckoutBridge);
      }
      data = stringify(data);
    }
    invoke(bridgeMethod, CheckoutBridge, data);
  }
}

function setPaymentMethods(session){
  var availMethods = preferences.methods;
  var methods = session.methods = {};

  each(
    availMethods,
    function(method, enabled){
      if(enabled && session.get('method.' + method) !== false){
        methods[method] = enabled;
      }
    }
  )

  if(session.get('amount') >= 100*10000 || availMethods.wallet instanceof Array){ // php encodes blank object as blank array
    methods.wallet = false;
  }

  each(
    session.get('external.wallets'),
    function(i, externalWallet){
      if(externalWallet in freqWallets){
        if(!methods.wallet){
          methods.wallet = {};
        }
        methods.wallet[externalWallet] = true;
        freqWallets[externalWallet].custom = true;
      }
    }
  )
}

function showModal(session) {
  if(!preferences){
    Razorpay.payment.getPrefs(session.get('key'), function(response){
      if(response.error){
        return Razorpay.sendMessage({event: 'fault', data: response.error.description});
      }
      preferences = response;
      showModalWithSession(session);
    })
    return;
  }
  Razorpay.configure(preferences.options);
  showModalWithSession(session);
}

function showModalWithSession(session){
  setPaymentMethods(session);
  session.render();
  trackInit(session);
  Razorpay.sendMessage({event: 'render'});

  if (CheckoutBridge) {
    $('#backdrop').css('background', 'rgba(0, 0, 0, 0.6)');
  }

  if(qpmap.error){
    session.errorHandler(qpmap);
  }
  if(qpmap.tab){
    session.switchTab($('#tabs > li[data-target=tab-' + qpmap.tab + ']'));
  }
}

function configureRollbar(id){
  if(Rollbar){
    invoke(
      Rollbar.configure,
      Rollbar,
      {
        payload: {
          person: {
            id: id
          },
          context: discreet.context
        }
      }
    );
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
    document.documentElement.appendChild(iF);
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

  android: function(){
    doc.css('background', 'rgba(0, 0, 0, 0.6)');
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
  if ( CheckoutBridge && typeof CheckoutBridge === 'object' ) {
    return notifyBridge(message);
  }

  if(ownerWindow){
    message.source = 'frame';
    message.id = _uid;
    if ( typeof message !== 'string' ) {
      message = stringify(message);
    }
    ownerWindow.postMessage(message, '*');
  }
}

window.handleOTP = function(otp){
  var session = getSession();
  var otpEl = gel('powerotp');
  if(session && session.rzp && otpEl && !otpEl.value){
    otpEl.value = otp;
  }
}

function validUID(id){
  if(isIframe && !CheckoutBridge){
    if(typeof id !== 'string' || id.length < 14 || !/[0-9a-z]/i.test(id)){
      return false;
    }
  }
  return true;
}

window.handleMessage = function(message){
  if('id' in message && !validUID(message.id)){
    return;
  }
  var id = message.id || _uid;
  var session = getSession(id)
  if(!session){
    if(!message.options){
      return;
    }
    try{
      session = new Session(message.options);
    } catch(e){
      Razorpay.sendMessage({event: 'fault', data: e.message});
      return roll('fault ' + e.message, message, 'warn');
    }
    configureRollbar(id);
    var oldSession = getSession();
    if(oldSession){
      invoke('saveAndClose', oldSession);
    }
    session.id = _uid = id;
    sessions[_uid] = session;
  }

  if(message.context){
    discreet.context = message.context;
  }
  if(message.embedded){
    // addBodyClass('embedded');
  }
  if(message.config){
    RazorpayConfig = message.config;
  }
  if(message.event === 'open' || message.options){
    showModal(session);
  }
  else if(message.event === 'close'){
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
    roll('invalid message', data, 'warn');
  }
}

function trackInit(session){
  var options = session.get();
  if(/^rzp_l/.test(options.key)){
    track(session.id, 'init', options);
  }
}

function applyUAClasses(){
  if(/Android [2-4]/.test(ua)){
    addBodyClass('noanim');
  }
}

function initIframe(){
  $(window).on('message', parseMessage);
  Razorpay.sendMessage({event: 'load'});

  if(location.search){
    setQueryParams(location.search);
  }

  if(CheckoutBridge){
    discreet.medium = qpmap.platform || 'app';
  }

  if(qpmap.message){
    parseMessage({data: atob(qpmap.message)});
  }

  applyUAClasses();
}

initIframe();