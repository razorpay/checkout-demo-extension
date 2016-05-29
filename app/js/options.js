var flatKeys = {};
each(
  Razorpay.defaults,
  function(key, val){
    if(val && typeof val === 'object'){
      flatKeys[key] = true;
      each(
        val,
        function(subKey, subVal){
          Razorpay.defaults[key + '.' + subKey] = subVal;
        }
      )
      delete Razorpay.defaults[key];
    }
  }
)

function base_set(flatObj, defObj, objKey, objVal){
  var defaultVal = defObj[objKey];
  if(typeof objVal === 'number'){
    objVal = String(objVal);
  }
  if(defaultVal === null || typeof defaultVal === typeof objVal){
    flatObj[objKey] = objVal;
  }
}

function flatten(obj, defObj){
  var flatObj = {};
  each(
    obj,
    function(objKey, objVal){
      if(objKey in flatKeys){
        each(
          objVal,
          function(objSubKey, objSubVal){
            base_set(flatObj, defObj, objKey + '.' + objSubKey, objSubVal);
          }
        )
      } else {
        base_set(flatObj, defObj, objKey, objVal);
      }
    }
  )
  return flatObj;
}

function Options(options){
  if(!(this instanceof Options)){
    return new Options(options, defaults);
  }

  var defaults = Razorpay.defaults;
  options = flatten(options, defaults);
  this.get = function(key){
    if(!arguments.length){
      return options;
    }
    return key in options ? options[key] : defaults[key];
  }

  this.set = function(key, val){
    options[key] = val;
  }

  this.unset = function(key){
    delete options[key];
  }
}