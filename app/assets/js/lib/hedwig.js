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

  function Hedwig(XD, CS, options){
    this.XD = XD;
    this.CS = CS;

    if(typeof options !== 'undefined' && typeof options.csHubLocation !== 'undefined'){
      this.options.csHubLocation = options.csHubLocation;
    }
    if(typeof options !== 'undefined' && typeof options.ccHubLocation !== 'undefined'){
      this.options.ccHubLocation = options.ccHubLocation;
    }

    /**
     * clear any postmessage data receive listeners
     */
    XD.receiveMessage();

    /**
     * decide what to use, dependent on browser + platform
     */
    this.decideMethod();
  }

  Hedwig.prototype.options = {
    method: 'xd',
    csHubLocation: '',
    csLabel: 'rzp'
  }

  /**
   * Holds all cs related props
   */
  Hedwig.prototype.cs = {};

  Hedwig.prototype.callMethod = function(method, args){
    if(this.options.method === 'xd'){
      method = 'xd' + method;
    }
    else if(this.options.method === 'cc'){
      method = 'cc' + method;
    }
    else if(this.options.method === 'cs'){
      method = 'cs' + method;
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
   * Decide whether to use window.postmessage or cross local storage
   * OPTIONS: xd | cs
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

  Hedwig.prototype.receiveMessage = function(callback, source){
    this.callMethod('ReceiveMessage', arguments);
  }

  Hedwig.prototype.xdReceiveMessage = function(callback, source){
    this.XD.receiveMessage(callback, source);
  }

  Hedwig.prototype.ccReceiveMessage = function(callback, source){
    this.XD.receiveMessage(callback, source);
  }

  Hedwig.prototype.csReceiveMessage = function(callback, source){
    this.options.receiveMessageCallback = callback;
    if(typeof this.cs.data !== 'undefined' && typeof this.cs.data.time !== 'undefined'){
      callback({data: this.cs.data});
    }
  }

  /**
   * Removes xd listeners
   */
  Hedwig.prototype.clearReceiveMessage = function(){
    this.XD.receiveMessage();
  }

  Hedwig.prototype.sendMessage = function(data, url, target){
    this.callMethod('SendMessage', arguments);
  }

  Hedwig.prototype.xdSendMessage = function(data, url, target){
    data.rzp = true;
    this.XD.postMessage(data, url, target);
  }

  Hedwig.prototype.ccSendMessage = function(data, url, target){
    data.rzp = true;
    this.XD.postMessage(data, url, this.ccFrame.contentWindow);
  }

  Hedwig.prototype.csSendMessage = function(data, url, target){
    data.rzp = true;
    this.cs.storage.set('rzp-receive', data);
  }

  Hedwig.prototype.setupCC = function(){
    this.ccFrame = document.createElement('iframe')
    this.ccFrame.src = this.options.ccHubLocation + '#' + location.origin
    this.ccFrame.style.display = 'none'
    this.currentScript = document.currentScript || (function() {
      var scripts;
      scripts = document.getElementsByTagName('script');
      return scripts[scripts.length - 1];
    })();
    this.currentScript.parentNode.appendChild(this.ccFrame)
  }

  /**
   * Init ZenDesk's Cross Storage and setup polling
   */
  Hedwig.prototype.setupCS = function(){
    var storage = this.cs.storage = new this.CS(this.options.csHubLocation);

    var self = this;
    storage.onConnect().then(function(){
      self.cs.connected = true;
      self._csPollStart();
    });
  }

  Hedwig.prototype._csPollStart = function(){
    var self = this;
    this.cs.pollID = setInterval(function(){
      self.cs.storage.get(self.options.csLabel).then(function(data){
        self._csHandleData(data);
      })
    }, 500);
  }

  Hedwig.prototype._csPollStop = function(){
    if(typeof this.cs.pollID !== 'undefined'){
      clearInterval(this.cs.pollID);
      this.cs.pollID = 0;
    }
  }

  Hedwig.prototype._csHandleData = function(data){
    if(typeof data.time === 'undefined'){
      return;
    }

    if(typeof this.cs.data !== 'undefined'
       && typeof this.cs.data.time !== 'undefined'
       && this.cs.data.time === data.time){
      return;
    }

    if(data.time === 0){
      this.cs.data = {};
      return;
    }

    this.cs.data = data;

    if(typeof this.options.receiveMessageCallback !== 'undefined'){
      this.options.receiveMessageCallback({data: data});
    }
  }

  root.exports = Hedwig;

})(typeof module !== 'undefined' ? module : window)
