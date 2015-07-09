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

// TODO 3dsecure in iframe
(function(root){
  var discreet = root.discreet;
  var ua = navigator.userAgent;
  var strategy = ua.indexOf('MSIE ') > 0 || /Trident.*rv\:11\./.test(ua) ? 'cc' : 'xd';
  var defaultCCHub = 'https://api.razorpay.com/crossCookies.php';
  
  discreet.hedwig = {
    setupCC: function(ccHubLocation){
      var frame = discreet.hedwig.ccFrame = document.createElement('iframe');
      frame.width = 0;
      frame.height = 0;
      frame.style.display = 'none';
      frame.src = ccHubLocation || defaultCCHub;
      document.body.appendChild(frame);
    },
    
    sendMessage: function(data, url, target){
      if(strategy == 'xd'){
        target.postMessage(data, url);
      } else {
        if(typeof data != 'string'){
          data = JSON.stringify(data);
        }
        discreet.hedwig.ccFrame.contentWindow.postMessage(data, url);        
      }
    }
  }
})(window.Razorpay.prototype);