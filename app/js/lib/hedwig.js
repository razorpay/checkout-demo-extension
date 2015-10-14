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
  var discreet = root.discreet;
  var ua = navigator.userAgent;
  var strategy = ua.indexOf('MSIE ') > 0 || /Trident.*rv\:11\./.test(ua) ? 'cc' : 'xd';
  var defaultCCHub = 'https://api.razorpay.com/crossCookies.php';
  var ccFrame;
  
  discreet.hedwig = {
    setupCC: function(ccHubLocation){
      if(strategy == 'xd'){
        return;
      }
      if(ccFrame && ccFrame.parentNode)
        ccFrame.parentNode.removeChild(ccFrame);
      
      ccFrame = discreet.hedwig.ccFrame = document.createElement('iframe');
      ccFrame.width = 0;
      ccFrame.height = 0;
      ccFrame.style.display = 'none';
      ccFrame.src = ccHubLocation || defaultCCHub;
      document.body.appendChild(ccFrame);
    },
    
    sendMessage: function(data, url, target){
      if(strategy == 'xd'){
        target.postMessage(data, url);
      } else {
        if(typeof data != 'string'){
          data = JSON.stringify(data);
        }
        ccFrame.contentWindow.postMessage(data, url);
      }
    }
  }
})(Razorpay);