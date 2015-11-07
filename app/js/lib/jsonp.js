var _$objectToURI = function(obj) {
  var data = [];
  var encode = window.encodeURIComponent;
  each( obj, function( key, val ) {
    data.push(encode(key) + '=' + encode(val));
  })
  return data.join('&');
};

var _$getAjaxParams = function(options){
  var params = {
    data: options.data || {},
    error: options.error || noop,
    success: options.success || noop,
    complete: options.complete || noop,
    url: options.url || ''
  }

  var url = params.url;
  url += params.url.indexOf('?') < 0 ? '?' : '&';
  url += _$objectToURI(params.data);
  params.computedUrl = url;
  return params;
};

var _$randomString = function(length) {
  var str = '';
  while(str.length < length) { str += Math.random().toString(36)[2] }
  return str
};

$.jsonp = function(options){
  if(!options.data) { options.data = {} }

  var callback = options.data.callback = 'jsonp_' + _$randomString(15);
  var params = _$getAjaxParams(options);
  var done = false;
  
  window[callback] = function(data){
    params.success(data, params);
    params.complete(data, params);
    try {
      delete window[callback]
    }
    catch(e){
      window[callback] = undefined;
    }
  }
  
  var script = document.createElement('script');
  script.src = params.computedUrl;
  script.async = true;

  script.onerror = function(e){
    params.error({ error: true, url: script.src, event: e });
    params.complete({ error: true, url: script.src, event: e }, params);
  }

  script.onload = script.onreadystatechange = function(){
    if(!done && (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete')){
      done = true;
      script.onload = script.onreadystatechange = null;
      $(script).remove();
      script = null;
    }
  }
  var head = document.documentElement;
  head.appendChild(script);
};