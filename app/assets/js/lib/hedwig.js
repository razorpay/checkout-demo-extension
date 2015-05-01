/**
 *
 * Hedwig.js
 *
 * For reliable communication with a popup, across all browsers + platform combo. Hopefully.
 *
 * Author: Shashank Mehta <sm@razorpay.com>, Razorpay
 * Copyright: Razorpay
 *
 */

(function(root){
  function Hedwig(options){
    this.listeners = {};
    if(typeof options !== 'undefined' && typeof options.ccHubLocation !== 'undefined'){
      this.options.ccHubLocation = options.ccHubLocation;
    }

    /**
     * clear any postmessage data receive listeners
     */

    /**
     * decide what to use, dependent on browser + platform
     */
    this.decideMethod();
  }

  Hedwig.prototype.options = {
    method: 'xd',
    ccHubLocation: '',
  }

  Hedwig.prototype.callMethod = function(method, args){
    if(this.options.method === 'xd'){
      method = 'xd' + method;
    }
    else if(this.options.method === 'cc'){
      method = 'cc' + method;
    }
    this[method].apply(this, args);
  }

  Hedwig.prototype.detectBrowser = function(){
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf("MSIE ");

    // If Internet Explorer, return version number
    if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)){
      return (parseInt(ua.substring(msie + 5, ua.indexOf(".", msie))));
    }
    else {
      return false
    }
  }

  /**
   * Decide whether to use window.postmessage or cookie polling
   * OPTIONS: xd | cc
   */
  Hedwig.prototype.decideMethod = function(){
    if(this.detectBrowser() === false){
      this.options.method = 'xd';
    }
    else {
      this.options.method = 'cc';
      this.setupCC();
    }
  }

  Hedwig.prototype.addListener = function(callback, context){
    var callback = $.proxy(callback, context);
  }

  Hedwig.prototype._removeListener = function(lid){
    if(window.removeEventListener){
      window.removeEventListener('message', this.listeners[lid], false);
    } else if(window.detachEvent){
      window.detachEvent('onmessage', this.listeners[lid]);
    }
  }

  Hedwig.prototype.removeListener = function(lid){
    if(lid){
      this._removeListener(lid);    
      delete this.listeners[lid];
    } else {
      for(var i in this.listeners){
        this._removeListener(i); 
      }
      this.listeners = [];
    }
  }

  Hedwig.prototype.sendMessage = function(data, url, target){
    this.callMethod('SendMessage', arguments);
  }

  Hedwig.prototype.xdSendMessage = function(data, url, target){
    data.rzp = true;
    target.postMessage(data, url);
  }

  Hedwig.prototype.ccSendMessage = function(data, url, target){
    data.rzp = true;
    if(typeof data != 'string'){
      data = JSON.stringify(data);
    }
    this.ccFrame.contentWindow.postMessage(data, url);
  }

  Hedwig.prototype.setupCC = function(){
    this.ccFrame = document.createElement('iframe')
    this.ccFrame.width = 0;
    this.ccFrame.height = 0;
    this.ccFrame.src = this.options.ccHubLocation
    this.ccFrame.style.display = 'none'
    this.currentScript = document.currentScript || (function() {
      var scripts;
      scripts = document.getElementsByTagName('script');
      return scripts[scripts.length - 1];
    })();
    this.currentScript.parentNode.appendChild(this.ccFrame)
  }

  root.exports = Hedwig;

})(typeof module !== 'undefined' ? module : window)
