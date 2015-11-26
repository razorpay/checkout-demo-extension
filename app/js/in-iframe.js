var isCriOS = /CriOS/.test(ua);
// flag for checkout-frame.js
discreet.isFrame = true;
window.onComplete = onComplete;
// initial error (helps in case of redirection flow)
var qpmap = {};

// iphone/ipad restrict non user initiated focus on input fields
var _if_should_focus_next = !/iPhone|iPad/.test(ua);

// dont shake in mobile devices. handled by css, this is just for fallback.
var _if_should_shake = !/Android|iPhone/.test(ua);

var _if_logo_image_prefix = 'data:image/gif;base64,';
var _if_freq_banks = {
  SBIN: 'iVBORw0KGgoAAAANSUhEUgAAAMQAAAAkCAMAAADhPGXbAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAGBQTFRFQEBAf39/v7+/EBAQYGBgcHBwz8/PIHDfICAgUFBQMDAwn5+fr6+v7+/vPoPj0uL5iLLu4ez78PX9a6Dqj4+P39/ftM/0eqnsw9n2pcXyTYzmlrzwL3nhEWbdAAAA////pTcZMwAAACB0Uk5T/////////////////////////////////////////wBcXBvtAAADhUlEQVR42tSZ2YKrIAyG2VzApbV2mc45yvu/5SEBLYvLmbshFzOtKOQLfwJYoj17vr4ntP711BkZWT/drtXkWfUa8oMIERDjmhnE0E8b1l9ygrhU06ZVl3wg9hhyoQCIYZchEwqA6KcD6/OAuE6Hds0B4lYdQ0xDBhAnEzFNY/BAx8pfCHE2EVN1+9xe1rOx/8MgaIJttZWmZffBB6XF8lkUMu2AUsoaSpt1pOd0au9P9xwYZqa7gvq9MrXhy+xMbLQxc32PoTVtxOuEbvVMiXcTeZ1DfPQkrFus5X7Xndj0aIGY259BkJ9DfJ9D9EH/shWtEZUsTXow9nBorMN8iYaqW7LpxSGEaeLFKURByHoTSSrqMCSpHkCYPumMwcJ/ZjwnsVbB1dIfiqA2qJazbTLP12rm1EKURpyrrvXdRIbTDkMSQZgEopII6BoGUStEY1okZTHEH3jyT3TxFsipWSCkVUtpIRr7jZe+nAhHPttUYxDAKEIAUqxU1ZE5kdOiy4cdeV7l5L6SzaBHFesrTOymscEqGbuDj3gRQl6DJyrOiQbLiXRu21EBgvnp0qxl4AAC2X0IMxNqF+LvDgQqYOYQLTPhRvBQcRnEA4JSl8QvRl51au1gAMEb7iBqz1fEK+7cTawoYwhewCeIhCz4J7FNoeUpBPp72ZOTzcgZ0pWi3OcVwkyC4uBjkNgMnCsXEWgcWTiIoG5Z2MZNENUxhP3DrecLRKe25QTnoOSEFJUV7EGCRwrCihBdYbt7lI80sc1NqlghqIPg/hICITbJ7WZiD8LN6wIBt2NB7tNStF9il9jDkzVqSjmI2kqZiZn5M0FBbwXGPIGgmKrOrFAATR9AoOiaVU4YS/MQGc8hxgjCVhklbTRnZiVWL4TJYgex5SqB6LiXFGvK0iOINkxsCUUZenmeQ7xDCFNEBSYfd15jje3Wr2lihzmxQNgMWPdDrsTqI4ilEDuIhTzdACYQ3gawUDW5m7W5k4S0uhRECEKYprh6dkUNWRJtACVcoKoWsOXDFeoO6x5uABUmwjIXJq7qrnchOF7GJdEVKlNiuStyrzOI8TcfJXC7Q5ITdgKRw6EoPhXFEFkcT+MXBRFEf8sDInztFEJk88ompAghsng7nr7G9CGqr5xeKF/6LYi8Xihrr0Z9IK43nRmEHsbKh6jGDH9kgd+K3mNvIfrxfdP52D8BBgDiLQzlBa661AAAAABJRU5ErkJggg==',
  ICIC: 'iVBORw0KGgoAAAANSUhEUgAAALYAAAAkCAMAAAATgDB+AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAPBQTFRFQISY+Z0nv9bcf6267/X2EGV+MHqPz+DlIHCGYJmpn8HLr8zU3+ruj7fCcKOyUI6gukVK+vLy68rLv1JX8NfY+aM104eLtTEv//nx+7Zd/dqu3nIq/ebJ9JYovkAu54Ap/MiG8I8o+8J49eTlwkcuxF9k5ry+/u3WtTc98NHL2JWYuTgv/vPk+qlCuj88/M6T+7xr+q9Q/eC7yW1x2Wsr//ny64cp3KGkznp+1WQs4a+xyGdjxFlW4nkqx04t98GGw1NJ4aik+eXX+NOuy1Ut/u3XyGZjzGJH04iL0Fws88ai5JhusCowAFt1////////ESHCXQAAAFB0Uk5T/////////////////////////////////////////////////////////////////////////////////////////////////////////wATc6Z5AAAE1klEQVR42tSY13rbOBBGAYJNpCSqWpKr3O3YsWM7u0k2ZXunpPd/mwVmMMCAVvbzJTM3MUEAPPinQRGb53b67uNdre3Tu+GmpSaejYw+1s7urr8R7Otz4D3fGcC/s+tvAXv+F8A+na7XQ+S+G7Yf+5efAPX92hjKXv/ceuxfDwF0ANRrVLv+1HbsH5G6/gGoLygt5+3GPrHU9amhHl4R9nWrsU9+I86Jpp6MXREctRn7fs9xjkcX733pbjX27vGs/oq1GPtyekaUTzpGLq489azFleThyEIORlBGXnnsP9uLvZQ3yLgzxJq947H/bS32pfwMhFcX63XQarTd7LYWeyEhsscTop54sffmbcXel8dAPSRqFiM3b1p7A1zItyZCNPXkWYwc7cOsrgLrumURmHsu4HXhXnfxvXtsLM8iZvELSTM+V2ix5RcQ+9WgHgP1yFH//Rpn9VZgFqKXrqzlfdwogSdlj9RJ6L0o+HL30XzFrf8y7JzvIDYnUvpWE8bI4cGjnQX7V+bPuB98M8mMEPg3qBuFTB0zVuEZnPir0NRLqM2i1AfJXEpZh9gUI7PvF3YWbt8zhHnjm7keVHgCM7PfeL0qms5A8RMBFp7n/6wI/CIepTxy1IOgjnyWlzipRAItbGb9nypVrZzG3hkd64OOUvZ8InQGia+Y8C/CNjuXHnvJsc95i9yT93ZSn9TsInVqIsNqbGicM+yQMjEYJ4TNnOEyIWJ+tCLGPMndUJctYpVkIbH+YZc02GOifqBJKYUpyppiZkSE7ZwR+WByCSGCzNjYTEh4vBiyrs3jXNHWIkaH5SUtEk6sSkge2+aHzZCop7d0ZorSqOHtwBk5Aw0lCw6DH06h9vUERb8KE9ScRrgsKu2I3iEWuBVgf6nZD5sRZqOUjzwbtHVtRaiaYUfOyLafymcG9wJZldkpabmJe9YRHVtelSAdBOxQJjZEAZt+IowptM8OpNwNssFUn9gffouahVf9K84IytKKchu+oItKTO9IiB6lr8AXCe4ErQKw5RkL7ad69lZyatsd+iRbvKU0gTPE9u6R+gJO4mP5C15g58TzxT6oCsSGF2Z+gqIh9sGh+xW5/uPDQUjdJZEV75WbZ87YbG8eXV+/nfgWNU6tDIUIGlThM0ThjtQOEquZeA3c8sMN/QeJgebUvjWH2IpEJmeE2HFuIYqGj1J2BtgjilMeNiUKUfgaH+EiwavUibR2fPQPYOtzTPe5XFVYf23K2cbjErEk7JT7QJ+qw0et+DF3FFCnZdffO3JYSImQYNTk2Agws8U+Ycvpd4C9nC5uAy+71mxjOylifafDUV1z/TUr9bWhFO6alIcRX7AzwIlFCUzk1xSHbQZHWLlKEAjqL84UmzeEvaTrdhibrFg37yOrJOL3pKL5mhh4+TECV1i10Q+RomCH8tZH+o5PhJ7r7Mq1BbGZPwRiN6l5a86SxjUqC+9JnQa1qVW9Rh7nz65a5gNJLyoqkqfyx0wxLOjSmtKnNPsc9J7+vhU6bM0ZbxU5XD0i3kwUP1cVbbm0Zo2DR+wem9rzJS76YwwXd2nFO1Fkf7lfLhf3t9uh9Qwwyv1M4XOnZ7tegc/Ueoo+Pqsy3rZcBz2zPmoaAW9axHqoMtro7e3XzE64qPBf03P+E2AAg3LhAj+eZ7cAAAAASUVORK5CYII=',
  HDFC: 'iVBORw0KGgoAAAANSUhEUgAAANgAAAAkCAMAAADcrgS9AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAEVQTFRFv9LjQHeq9Y2R+sbI7/T4EFWVMGyjIGGc3+jxn7vUYI65cJnAr8bcz93qj7DNUIOx/ePk8VVbyqSzf6TG7BwkAEqO////gRfhcgAAABd0Uk5T/////////////////////////////wDmQOZeAAACoklEQVR42uyY7ZajIAyGoQUEtdoZVu//UrcEAuHD2e5M3bM9h/yKEWgeDC9Q9quw675fy9j2hsY6WAfrYB3sB2AfF7T7vt/jw8fbg132pl062NuDcessuWOMWTtxlTcLxn1MWfawhRcZjNhs5bL6IYwMMH5yIQNwBuet4KqfgFmIJ5fFGJgwkjQLBlkMDB9vKp9a0pKlVzMERsSEJ55c58XYCJ7ZTgR7oKkmmBJlkxZYejX45zkD07IJxhtcORhL5cO+C7aLoQEmddZEHoFFkik8Swq2Ly0wP2fmqzVmS4C/ANPWzjpOHYZwjfluhvNRYIIZ2MQ5N2nobbsFsCkDS98ngXmueTsLzDmbwVlOITAp4vCQlyjBOCYqSCW6N7ccTFdgK8zmTb4GzMkb0zWY9L9Vga2krGbXVzbAJPmWi0sWeg0Z2CPFAky0uTZ2Bbu3we7w8rMCIzqWgfksbV6KW8VZq6KxdtEkQ+cvMuUUwXZVgHmhPRg20+UagH0TLBiW6FdgVHiQg8MrTVXRMbTAaOb/FGx+Egw3LuP7gTQqso/hyqvAdvWaUjxaY17MarA/lqJTxUnENSW8zg1Rx8NnWuigAWxuF+NrVXFATS7W2EgET0cVLFXRYg4rCr3GbgEsbYcRzATa6UwweUOAUu5TmXG6WzXAlnicQltJL16B8bCX4PI8Y4NmIo5S1h4sGmFxgzbHpWhxGqIZOh2mBgtHRXb6kUo2wKTYG+LXEA+3xsZCoCQBw4GyQzBrFOOZh2A6h08egqES4zfknIUSTgW8NsBUfQI99dqSFcdT1xa9ogIJchaes5U512BBP+azLppjcdEc86of4KJp1qOLJnZXpC/eKtPtcpONi6aPWdn/Grj0v9/6H6YdrIN1sA72X9tvAQYA0ftdYPNTP+4AAAAASUVORK5CYII=',
  UTIB: 'iVBORw0KGgoAAAANSUhEUgAAAI4AAAAkCAMAAABopPKyAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAADNQTFRFv39/37+/oEBAiBAQ9+/vz5+fkCAg79/fuHBwx4+P58/PsGBgmDAw16+vqFBQgAAA////2dEiCAAAABF0Uk5T/////////////////////wAlrZliAAACzElEQVR42syW2baDIAxFwySDaPz/r71hBqXDw20rD11tRdgk5yTAMRmcHT8aMPlvQ34jHLkgqvvgACIKeRccLQgH4S44K8ah74HDEs2P1HzB4RkH2R1wVKHB5QY4weRl2Nl882wxxtgTR9oiRy/fxYFGMzU7lBwaxC3h0zQelQbBkgLGtXw9lMY1f0Ovm1BZ+qClPKIZcTT242ouKYrEE8exR6qIQ7sLTsE1p6NBc2xekCa6C44TofiOOHtPs05ShbVg0yJ7UJo5Ms6CC/Gtq+5wDkkQsjp2LzgothPOJlCwU7IYPs8VBU9UiROaFeiPgiPOtSHglExkx7KCk09Vcehc3p2143ucSV3e6VStn4XZKeolWYvVZxyTj0X7qSUDU0h9CmvBoZ9cnqWsepqJz1lwG69hc9V9WcqxerIeh4uipYCicnjoqJJHMRScWnVh0Gk3tiuOD4ysxm2rIUw4h7Qeu8sAdBqESLKkQ8bXSFReNpz8GsxNPusRdDgOQHZO4Un0rsMJAaSnQ7LcHnakuYJe5WnXdAp67FXGAZF54IHJ3fQalIfJ2qTNY0kLOFpBZehw0uZm0EAOqsq9KITIZR64Nqu64cUoBiCdkRRrw6JbM7pNwljPOKQwq1NcAUwkKTlmouLkstNwXpm8VUAd5OBSPtcIEaND+bDb3pUrwgGgP4TeawWMRqjqc8vDMrj0OJN2tbYEBoZUlPsmoZITuDxpcXFN/ckI7Sc1htokIk95YIfg8H6k9QGqZTSABUiOduGLis+03Tl01xIW0mNZ/FIZLdgD2iy5s7CczksBzEzOXunoH4ecdXQzmty9aKUfvu9cOvn6ogZ9FueSnFPyvouzXU0OL/rXJ3EGk6v3jP85nCES/mgN8uk99VM4D3TyRbMPOIOL9vrkJ2aHx9uaH5gdxqTA8eg69h2zwxPJ2u+bHWYmf7fL///4E2AAoFAi+Z4HEgIAAAAASUVORK5CYII=',
  PUNB_R: 'iVBORw0KGgoAAAANSUhEUgAAAFwAAAAkCAMAAAAzQK3GAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAGNQTFRF/d2E6MPNuUpp/M1H0Iab/u7BqB1E3KS0rixQ+8AYxWmC+fDy7dLZ8+Hm/dVm/NFW/eai1pWn/vLR//vw/vfgy3iP/uqy/dl1/MQo/Mk3v1p2tDtd4rPA/eKTog43+7wJ////10BwSwAAACF0Uk5T//////////////////////////////////////////8An8HQIQAAAgBJREFUeNrs1teSrCAQAFBBEOOoY5wE/P9XrgRJ47pJ79PtF8seOGU1DUPEDwxAKQXOe7RG9z42Zjqi3+KzBi5n4JEGsjNwvApYZzC+HoZzT8C1qlF/EB47wlojxppj8IsWYs4nxlx9Cwd5sgh3YhJFe4cQtoXFAVqiVHhkcMzcuG7gxZ3qeJQq0ybqPSEGhzKRAh+PPbx+x4sHNZFIfbAJ4uOUIgefeubHOw6pE2mhNBNVgFNi8QgHOA5xSSXDk0D9ZcqBCMlnrnH0BCCXQy1ef4nfTTWI/HReiEcrErl8d7pFjnBq/iWe2Lmy1pXAHmo1xG9eK+Yefgtr3rEAl1+nohI4ENhgl8PDiYez7uZ3S7OBw7UpDY4CvPVwY7xGvyrzDl59iudeWa4rkXUXx55ebAdHdMVcvBRZtbtKtaA8s9vG6peGbeOV3Je29Vycp6KfnqJrE41bse5GVfcbfrFPcJQOQ+psGg8nantBNSBd5jldkk19jzHuR/8k8PBgu3u4v4eBmOeWms1xHGdBU27g5qDycff0IVzM60KM7eCy3Ele8U18WWp9TMKSS9w2zDfwhQTV3j9G8UQwX89zEU32TRz96B6j512zE3He1SfinI9zQM7ZcfjC17Y4t+n9P/RPuKh9I+6NI968FP0V373OLVcIchr+4/iP/3v8Q4ABAGFkcNPvV0OlAAAAAElFTkSuQmCC',
  BARB_R: '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'
};

var _if_wallet_logos = {
  paytm: {
    h: '16',
    col: _if_logo_image_prefix + 'R0lGODlhUAAYANUgAD/L9UJik+/y9oGWtzJVihM6dw++8+/7/mJ8pV/U9+Dl7dDY5M/y/S/H9JGjwCNHgZ/l+r/u/B/C9K/p+9/2/bC90lJvnKGwyW/Y+HGJrsLu/I/h+cDL23/c+AC68gQub////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAACAALAAAAABQABgAAAb/QJBwSCwaj8gkEiJhKJ/QqHQKgng8Hap2yy1ar9nuUMEpm8uLI/nMSRMFg7hb6JAXGZPE9ZqIHEAUERFOIBEdHRFDBxAdEH9CBR+Sk5MPHEWRlJIPFUMWkwUKQgigokITe6lXDRoGewkSqRITGK57YZq5BXMguZSdIAGUl73DQx2qqnrJzKpZvpoIRNCSBELCk8SaxCDIzR7L398U1JVEBOUCIA/GxdnH4uHizBvlk29xcZnv20L9QgcaNEvgbZ4Bgak6aKKzEMmAfv/+ESmIRQhFDxRAxNpjwAmAhA05NBTCAUGAk7kuoXvnThI3eLcspgIgcw/NbiApkRxJqtwl7WySgEmECabmlZsUkea8B6In0wv2PvykVCDASpYTExr1oNTmVoVRhVylNtXey69bux79GtVaS7IgHEQ9izNm3bV3ubK1l8EfJQsCFPQTMNYXXYphkqbdS42Aurfa2gkAatgI4sV51WKhVgDBY8h+sYJYUCHOp3ZZ7SrOzFiSEk0ORktcU0YuaqIVWetGPPJIrgD7XApREDylZa27Z7b+oISd2Z3pjqtWnvxWbyMPn4MQSU2a9KLV8fLWmYSwvcfcfTk+cjm83rwdrhaAcuGk/fsXhpjXFMDB5zu2NPBIQHtgIAQDthgwgRAUBHhAEAA7'
  },
  mobikwik: {
    h: '19',
    col: _if_logo_image_prefix + 'R0lGODlhbAAfAKIHAJvl5ODt7UPS0L/w73/h4P///wDDwf///yH5BAEAAAcALAAAAABsAB8AAAP/eBfczgPIR4O6OOvNu/9gqBBFaWnDQAiCMYhwLM/cUJpHurZG77u0oHCYAdwKgJ9y2TsRn9CMjnUsEJjMQI8Q7QanPB/peFWulocW18sWlbFV609wC/cO27bek8QajFVvLjcDc3gGa3uKGIJLcXI9dISGPQCLlyN+gIE+NpM+AoWDKkaYbY0/j5CSn1uikXmmXqiVR5tlnq2IfQahSQKys0ysVmNyxCWvLm8ABIXAwVG0uQWIN1cBccoqPwAtlhm4HGVczQROB8XOMOSi0OFLxFfGK4/KAXaRG+L7eTwvF8IUYOdKnwZUubRYK3HO3o80cwAe7CGxCAtL/y68qQjC/5sAAO76zTnCwxg1kw8jVcwGDwiIjAd4cYwRcuKPbCbE2GP1ClgsfD9IZFr2A+CAixCBvLK0Q2KLdwo/skhhMKkAQcTCGDvSq5VPpcMGlsn3J4c/igp7KegDrRrFtVtw1XwTQBDOAsq2lvjlVZQNUM1AHRAkIZUoLv94vHNrAG6sf3L1yRwMimTQOJFaOWsy9sIrbm/T+QB5Vgk4BTwshIHmg7ILd0uHGjiibOENtpr7JK1IrvMFtoeTKnFSxtLwkJF7jda4xfJlrpmTdSpzqDEGd/wUwC6t5N12RJWKu6aqRGIZ2ku28uI5XW1rDGyzm+0VPAz5sgrE9HDLYv/42rL+UbYVEwNWtlcnT+2GQUniMUdfaeBshJohdkCTnHKxXGELHAx1F8FDari2WHv7lVAdaYgoOKFa81XSYor/+YCXDxYQUOAw3vgxRx5phXJUa2/4GEYA9YXWIheMGWBBkgAlB41igxnDi45UFuXYEi/Q4mKRLsn2QhgBvRcji2kFFgFZVer4zou9nIDLlOBwyRGUfSRSp4PkvfOGlmlisWYGRA6ADqApRANCAWj2mYWhmCQAADs='
  },
  payzapp: {
    h: '22',
    col: 'images/payzapp.png'
  }
}

var _smarty, _modal, _$el;

var _fr_frontDrop = function(message, className) {
  $('fd-t')[0].innerHTML = message || '';
  $('fd')[0].className = 'mfix ' + (className || '');
}

var frameDiscreet = {
  shake: function(){
    if(_if_should_shake && _modal){
      $('modal-inner').removeClass('shake').reflow().addClass('shake');
    }
  },

  notifyBridge: function(message){
    var method, data;
    if(window.CheckoutBridge && message && message.event){
      method = 'on' + message.event;
      if(typeof window.CheckoutBridge[method] === 'function'){
        data = message.data;
        if(typeof data !== 'string'){
          if(!data){
            return window.CheckoutBridge[method]();
          }
          data = JSON.stringify(data);
        }
        window.CheckoutBridge[method](data);
      }
    }
  },
  
  setMethods: function(payment_methods, methodOptions){

    if( !payment_methods.error ) {
      each(
        methodOptions,
        function(method, enabled){
          var printed = payment_methods[method];
          if ( !printed || enabled === false ) {
            methodOptions[method] = false;
          }
          else {
            methodOptions[method] = printed;
          }
        }
      )
      var wallets = [];
      if( methodOptions.wallet ) {
        each(
          payment_methods['wallet'],
          function(wallet, enabled){
            if(enabled){
              var logos = _if_wallet_logos[wallet];
              if(logos){
                wallets.push({
                  'name': wallet,
                  'col': logos.col,
                  'h': logos.h
                });
              }
            }
          }
        )
      }
      methodOptions.wallet = wallets;
    } else {
      methodOptions.card = false;
      methodOptions.netbanking = {error: {description: payment_methods.error.description || "Payments not available right now."}};
    }
    if(methodOptions.netbanking !== false && typeof methodOptions.netbanking !== 'object'){
      methodOptions.netbanking = {error: {description: "Netbanking not available right now."}}
    }
  },

  sanitize: function(obj, key){
    var attr = obj[key];

    if(typeof attr === 'string'){
      obj[key] = attr.replace(/"/g,'');
    }
    else if(typeof attr === 'object'){
      each(attr, function(attrKey, attrObj){
        frameDiscreet.sanitize(attrObj, attrKey);
      })
    }
  },

  sanitizeOptions: function(obj){ // warning: modifies original object
    // directly appended tags
    each(
      ['name', 'description', 'amount', 'currency', 'display_amount'],
      function(i, key){
        obj[key] = obj[key].replace(/<[^>]*>?/g, "");
      }
    )

    each(
      ['image', 'prefill', 'notes'],
      function(i, key){
        frameDiscreet.sanitize(obj, key);
      }
    )

    obj.prefill.contact = obj.prefill.contact.replace(/[^0-9+]/g,'');
  },

  setNumberValidity: function(){
    $(this.parentNode)[card.validateNumber(this.value, this.getAttribute('cardtype')) ? 'removeClass' : 'addClass']('invalid');
  },

  setCardFormatting: function(){
    var $el_number = $('card_number');
    var el_expiry = $('card_expiry')[0];
    var el_cvv = $('card_cvv')[0];
    var el_contact = $('contact')[0];
    
    card.setType = function(el, type){
      if(!type){
        type = card.getType(el.value) || 'unknown';
      }

      el.parentNode.setAttribute('cardtype', type);
      frameDiscreet.setNumberValidity.call(el);
      
      // if(type !== 'maestro'){
        // $('nocvv-check')[0].checked = false;
        // frameDiscreet.toggle_nocvv();
      // }
    }

    if(_if_should_focus_next){
      card.filled = function(el){
        if(el === el_expiry){
          el_cvv.focus();
        }
        else{
          el_expiry.focus();
        }
      }
    }
    
    $el_number.on('blur', frameDiscreet.setNumberValidity);
    card.formatNumber($el_number[0]);
    card.formatExpiry(el_expiry);
    card.ensureNumeric(el_cvv);
    card.ensureNumeric(el_contact);

    // check if we're in webkit
    // checking el_expiry here in place of el_cvv, as IE also returns browser unsupported attribute rules from getComputedStyle
    if ( el_cvv && window.getComputedStyle && typeof getComputedStyle(el_expiry)['-webkit-text-security'] === 'string' ) {
      el_cvv.type = 'tel';
    }
  },

  createModal: function(el, modalOptions){
    modalOptions.onhide = function(){
      Razorpay.sendMessage({event: 'dismiss'});
    };
    modalOptions.onhidden = function(){
      Razorpay.sendMessage({event: 'hidden'});
    };
    delete modalOptions.ondismiss;
    return new Modal(el, modalOptions)
  },

  showModal: function() {
    frameDiscreet.renew();
    
    if(_modal){
      return _modal.show();
    }
    $('loading').remove();
    var opts = $.clone(Razorpay.defaults);

    if(opts.amount >= 100*10000){
      opts.method.wallet = false;
    }

    frameDiscreet.setMethods(window.payment_methods, opts.method);
    frameDiscreet.sanitizeOptions(opts);

    var div = document.createElement('div');
    opts.netbanks = _if_freq_banks;

    try{
      div.style.color = opts.theme.color;
      if(div.style.color){
        var style = document.createElement('style');
        document.body.appendChild(style);
        var rules = templates.theme(opts.theme.color);
        if (style.styleSheet) {
          style.styleSheet.cssText = rules;
        } else {
          style.appendChild(document.createTextNode(rules));
        }
      }
    } catch(e){
      roll(e.message);
    }
    div.innerHTML = templates.modal(opts);
    document.body.appendChild(div.firstChild);

    if ( window.CheckoutBridge ) {
      $('backdrop').css('background', 'rgba(0, 0, 0, 0.6)');
    }

    _$el = $('container');
    _smarty = new Smarty(_$el);
    frameDiscreet.applyFont($('powered-link')[0]);
    _modal = frameDiscreet.createModal(_$el.children('modal')[0], opts.modal);

    if($('nb-na')[0]) {
      $('nb-elem').css('display', 'none');
    }

    // event listeners
    // $('nocvv-check').on('change', frameDiscreet.toggle_nocvv)
    $('modal-close').on('click', function(){
      Razorpay.payment.cancel();
      _modal.hide();
    });
    $('tabs').on('click', frameDiscreet.tab_change);
    $('form').on('submit', function(e){
      frameDiscreet.formSubmit();
      e.preventDefault();
    });

    $('bank-select').on('change', frameDiscreet.bank_change);
    $('netb-banks').on('change', frameDiscreet.bank_radio, true);
    $('netb-banks').on('click', frameDiscreet.bank_radio);
    $('fd-hide').on('click', _fr_frontDrop);
    // if(navigator.userAgent.indexOf("MSIE ") > 0)
    //   $('netb-banks').on('click', discreet.bank_radio, true);

    if(qpmap.tab){
      each(
        $('tabs')[0].getElementsByTagName('li'),
        function(i, li){
          if( li.getAttribute('data-target') === 'tab-' + qpmap.tab ) {
            frameDiscreet.tab_change({target: li});
          }
        },
        true
      )
    }
    if(qpmap.error){
      setTimeout(function(){
        frameDiscreet.errorHandler(qpmap)
      })
    }
    frameDiscreet.setCardFormatting();
  },

  bank_radio: function(e) {
    var target = e.target;
    if( target.nodeName !== 'LABEL' ) {
      target = target.parentNode;
    }
    if( target.nodeName !== 'LABEL' ) {
      return;
    }
    target = target.getElementsByTagName('input')[0];
    var select = $('bank-select')[0];
    select.value = target.value;
    _smarty.input({target: select});
  },

  bank_change: function() {
    var val = this.value;
    each(
      $('netb-banks')[0].getElementsByTagName('input'),
      function(i, radio) {
        if(radio.value === val){
          radio.checked = true;
        } else if(radio.checked){
          radio.checked = false;
        }
      }
    )
  },

  tab_change: function(e){
    var target = e.target;
    
    if( target.nodeName === 'IMG' ) {
      target = target.parentNode;
    }
    
    if( target.nodeName !== 'LI' || target.className.indexOf('active') >= 0 ) {
      return;
    }

    frameDiscreet.renew();

    var tabContent = $(target.getAttribute('data-target'));
    $(tabContent.parent().children('active')[0]).removeClass('active');
    tabContent.addClass('active');

    $($(target.parentNode).children('active')[0]).removeClass('active');
    $(target).addClass('active');
  },

  // toggle_nocvv: function(){
  //   var checked = this.checked;
  //   for(var i in {card_expiry: 0, card_cvv: 0}){
  //     var el = $(i).removeClass('invalid')[0];
  //     el.value = '';
  //     el.disabled = checked;
  //     el.required = !checked;
  //   }
  // },

  applyFont: function(anchor, retryCount) {
    if(!retryCount) {
      retryCount = 0;
    }
    if(anchor.offsetWidth/anchor.offsetHeight > 5) {
      _$el.addClass('font-loaded');
    }
    else if(retryCount < 25) {
      setTimeout(function(){
        frameDiscreet.applyFont(anchor, ++retryCount);
      }, 120 + retryCount*50);
    }
  },

  /* sets focus on invalid input and returns true, if any. */
  isInvalid: function(parent) {
    var invalids = $(parent).find('invalid', 'p');
    if(invalids[0]){
      frameDiscreet.shake();
      $($(invalids[0]).find('input')[0]).focus();

      each( invalids, function(i, field){
        $(field).addClass('mature');
      })
      return true;
    }
  },

  formSubmit: function() {
    _smarty.refresh();

    if (frameDiscreet.isInvalid('form-common')) {
      return;
    }

    // var card_number = $('card_number')[0];
    // card_number && frameDiscreet.setNumberValidity.call(card_number);

    var activeTab = $('tabs').find('active')[0];
    if ( activeTab && frameDiscreet.isInvalid(activeTab.getAttribute('data-target')) ) {
      return;
    }
    var data = frameDiscreet.getFormData();
    var options = Razorpay.defaults;
    // Signature is set in case of hosted checkout
    if (options.signature !== ''){
      data.signature = options.signature;
    }

    Razorpay.sendMessage({
      event: 'submit',
      data: data
    });

    if(_modal){
      _modal.options.backdropClose = false;
    }

    _fr_frontDrop('Please wait while your payment is processed...', 'shown loading');

    Razorpay.payment.authorize({
      postmessage: false,
      options: options,
      data: data,
      error: frameDiscreet.errorHandler,
      success: frameDiscreet.successHandler
    });
  },

  getFormFields: function(container, returnObj) {
    each(
      $(container)[0].getElementsByTagName('*'),
      function(i, el){
        if(el.getAttribute('type') === 'radio' && !el.checked) {
          return;
        }
        if(el.name && !el.disabled && el.value.length) {
          returnObj[el.name] = el.value;
        }
      }
    )
  },

  getFormData: function() {
    var activeTab = $('tabs').find('active')[0];
    if(!activeTab) { return }
    
    var data = {};
    frameDiscreet.getFormFields('form-common', data);
    
    var targetTab = activeTab.getAttribute('data-target');
    frameDiscreet.getFormFields(targetTab, data);

    if(targetTab === 'tab-card'){
      data['card[number]'] = data['card[number]'].replace(/\ /g, '');
      
      if(!data['card[expiry]']){
        data['card[expiry]'] = '';
      }

      if(!data['card[cvv]']){
        data['card[cvv]'] = '';
      }

      var expiry = data['card[expiry]'].replace(/[^0-9\/]/g, '').split('/');
      data['card[expiry_month]'] = expiry[0];
      data['card[expiry_year]'] = expiry[1];
      delete data['card[expiry]'];
    }
    return data;
  },

  // close on backdrop click and remove errors
  renew: function(){
    if(_$el) {
      _fr_frontDrop('', 'hidden');
    }

    if(_modal) {
      _modal.options.backdropClose = true;
    }
  },

  hide: function(){
    if(_modal){
      $('modal-inner').removeClass('shake');
      _modal.hide();
    }
    _modal = null;
  },

  successHandler: function(response){
    if(_modal){
      _modal.options.onhide = null;
    }
    Razorpay.sendMessage({ event: 'success', data: response });
    if(isCriOS) {
      setCookie('onComplete', JSON.stringify(response));
    }
    frameDiscreet.hide();
  },

  errorHandler: function(response){
    if(!_modal){
      return;
    }
    var message;
    frameDiscreet.shake();
    _modal.options.backdropClose = true;

    if (response && response.error){
      message = response.error.description;
      var err_field = response.error.field;
      if (err_field){
        if(!err_field.indexOf('expiry')){
          err_field = 'card[expiry]';
        }
        var error_el = document.getElementsByName(err_field)[0];
        if (error_el && error_el.type !== 'hidden'){
          var help = $(error_el)
            .focus()
            .parent()
            .addClass('invalid')
            .find('help-text')[0];

          if(help){
            $(help).html(message);
          }
          _fr_frontDrop();
          return;
        }
      }
    }

    _fr_frontDrop(
      message || 'There was an error in handling your request',
      'shown'
    );
    $('fd-hide').focus();
  },

  dataHandler: function(data){
    if( !('method' in data) ) {
      return;
    }

    frameDiscreet.tab_change({target: $('method-' + data.method + '-tab')[0]});

    if(('card[expiry_month]' in data) && ('card[expiry_year]' in data)) {
      data['card[expiry]'] = data['card[expiry_month]'] + ' / ' + data['card[expiry_year]'];
    }

    var lastel;
    each(
      {
        'contact': 'contact',
        'email': 'email',
        'card[name]': 'card_name',
        'card[number]': 'card_number',
        'card[expiry': 'card_expiry',
        'bank': 'bank-select'
      },
      function(name, id){
        var el = $(id)[0];
        if(el) {
          lastel = el;
          var val = data[name];
          if(val){
            el.value = val;
          }
        }
      }
    )

    if(data.method === 'card'){
      frameDiscreet.setCardFormatting();
    }
    if(lastel){
      lastel.focus();
    }
    _smarty.refresh();
  },

  configureRollbar: function(message){
    if(window.Rollbar){
      Rollbar.configure({
        payload: {
          person: {
            id: _uid
          },
          context: message.context
        }
      });
    }
  },
  setQueryParams: function(search){
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
  },
  parseMessage: function(e){ // not concerned about adding/removeing listeners, iframe is razorpay's fiefdom
    var data = e.data;
    if(typeof data === 'string') {
      data = JSON.parse(data);
    }
    window.handleMessage(data);
  }
}

Razorpay.sendMessage = function(message){
  if ( typeof window.CheckoutBridge === 'object' ) {
    return frameDiscreet.notifyBridge(message);
  }

  var ownerWindow = window === window.parent ? window.opener : window.parent;

  if(ownerWindow){
    message.source = 'frame';
    if ( typeof message !== 'string' ) {
      message = JSON.stringify(message);
    }
    ownerWindow.postMessage(message, '*');
  }
}
window.handleMessage = function(message) {
  if ( message.event === 'open' || message.options ) {
    if ( message.options ) { // open modal
      try{
        Razorpay.configure(message.options);
        frameDiscreet.configureRollbar(message);
        if(message.id){
          _uid = message.id;
        }
      } catch(e){
        Razorpay.sendMessage({event: 'fault', data: e.message});
        roll('fault ' + e.message, message);
        return;
      }
    }
    frameDiscreet.showModal();
    if(window.CheckoutBridge){
      message.options.meta = {
        ua: ua,
        cb: true
      }
      track('init', message.options);
    }
    else {
      track('open');
    }
  } else if ( message.event === 'close' ) {
    frameDiscreet.hide();
  }

  var params = message.params;
  if(params){
    setTimeout(function(){
      try{
        frameDiscreet.errorHandler(JSON.parse(params));
      } catch(e){
        roll('message.params', params);
      }
    })
  }
  var data = message.data;
  if(data){
    if( typeof data === 'string' ){
      try{
        data = JSON.parse(data);
      } catch(e){
        roll('message.data', data);
      }
    }
    if( typeof data === 'object' ) {
      frameDiscreet.dataHandler(data);
    }
  }
}

$(window).on('message', frameDiscreet.parseMessage);

if(location.search){
  frameDiscreet.setQueryParams(location.search);
}

// unique id for ios to retieve resources
var _fr_iOSdataIndex = 0;

function _fr_iOSMethod(method){
  return function(data){
    var iF = document.createElement('iframe');
    var src = 'razorpay://on'+method;
    if(data){
      src += '?' + _fr_iOSdataIndex;
      CheckoutBridge.map[_fr_iOSdataIndex] = data;
      _fr_iOSdataIndex++;
    }
    iF.setAttribute('src', src);
    document.documentElement.appendChild(iF);
    iF.parentNode.removeChild(iF);
    iF = null;
  }
}

function _fr_iosBridge(){
  if(qpmap.platform === 'ios'){
    window.CheckoutBridge = {
      map: {},
      get: function(index){
        var val = this.map[index];
        delete this.map[index];
        return val;
      }
    };

    var bridgeMethods = ['load','dismiss','submit','fault','success'];

    each(bridgeMethods, function(i, prop){
      CheckoutBridge['on'+prop] = _fr_iOSMethod(prop)
    })
  }
}

_fr_iosBridge();

Razorpay.sendMessage({event: 'load'});
if(qpmap.message){
  frameDiscreet.parseMessage({data: atob(qpmap.message)});
}
// remove old onComplete cookie
deleteCookie('onComplete');