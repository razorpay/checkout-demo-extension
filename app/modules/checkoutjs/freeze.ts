import { Track } from 'analytics/base-analytics';

let worker: Worker;
const separator = ':-)';

// WEB Worker Code (unminify code located at app/freeze-webworker.js)
const webWorker = `
var pingReceived=!1,checkoutId="",sessionErrored=!1,checkoutContext={};function handlePingReceived(){pingReceived=!0,postMessage("pong")}function createEventObject(e,t){return[{name:"checkout.sessionErrored.metrics",labels:[{type:e,severity:t},]},]}function capture(e,t){try{let{analytics:r={},severity:s="S2",unhandled:n=!1}=t={},{data:c,immediately:a=!0}=r||{};try{if(!sessionErrored){let i={metrics:createEventObject("session_errored",s)},o=encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify(i)))));sendRequest({url:"https://lumberjack-metrics.razorpay.com/v1/frontend-metrics",data:{key:"ZmY5N2M0YzVkN2JiYzkyMWM1ZmVmYWJk",data:o}}),sessionErrored=!0}}catch(u){}Track("js_error",{data:Object.assign({},"object"==typeof c?c:{},{error:constructErrorObject(e,{severity:s,unhandled:n})}),immediately:Boolean(a),isError:!0})}catch(d){}}self.onmessage=function(e){if("string"==typeof e.data){if("ping"===e.data){handlePingReceived();return}let t=e.data.split("${separator}");switch(t[0]){case"id":checkoutId=t[1];break;case"context":try{checkoutContext=JSON.parse(t[1])}catch(r){}}}},self.interval=setInterval(()=>{pingReceived?pingReceived=!1:(capture(Error("Iframe Freeze Alert")),clearInterval(self.interval))},3500);const EVT_Q=[],CHUNK_SIZE=5,pushToEventQ=e=>EVT_Q.push(e);function Track(e,{data:t={}}={}){let r={data:t};r.checkout_id=checkoutId,pushToEventQ({event:e,properties:r,timestamp:Date.now()})}function flushEvents(){if(!EVT_Q.length)return;let e={context:checkoutContext,addons:[{name:"ua_parser",input_key:"user_agent",output_key:"user_agent_parsed"},],events:EVT_Q.splice(0,5)},t=encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify(e)))));sendRequest({url:"https://lumberjack.razorpay.com/v1/track",data:{key:"ZmY5N2M0YzVkN2JiYzkyMWM1ZmVmYWJk",data:t}})}function sendRequest(e){try{fetch(e.url,{method:"POST",body:JSON.stringify(e.data)})}catch(t){}}const FLUSH_INTERVAL_DURATION=1e3;function constructErrorObject(e,t){let r={tags:t};switch(!0){case!e:r.message="NA";break;case"string"==typeof e:r.message=e;break;case"object"==typeof e:{let{name:s,message:n,stack:c,fileName:a,lineNumber:i,columnNumber:o}=e;r=Object.assign(JSON.parse(JSON.stringify(e)),{name:s,message:n,stack:c,fileName:a,lineNumber:i,columnNumber:o,tags:t})}break;default:r.message=JSON.stringify(e)}return r}setInterval(()=>{flushEvents()},1e3);
`;

/**
 * it will not work in IE
 */
/**
 * This function will setup ping mechanism at 2s interval
 * It will send ping in every 1s and we are checking ping received in every 3.5s (in web worker) i.e.
 * at least one ping should received in 3.5s if not we consider checkout is in block state
 */
export function setupFreezeCheck() {
  try {
    cleanupFreezeCheck();
    window.URL = window.URL || window.webkitURL;

    const blob = new Blob([webWorker], { type: 'application/javascript' });
    worker = new Worker(URL.createObjectURL(blob));
    worker.onmessage = function () {
      setTimeout(() => {
        worker.postMessage('ping');
      }, 1000);
    };
    worker.postMessage('ping');
    worker.postMessage(`id${separator}${Track.id}`);
    worker.postMessage(`context${separator}${JSON.stringify(Track.common())}`);
  } catch (e) {
    // e
  }
}

/**
 * cleanup close web worker
 */
export function cleanupFreezeCheck() {
  try {
    // terminate web worker
    if (worker) {
      worker.terminate();
    }
  } catch (e) {
    // do nothing
  }
}
