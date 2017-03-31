var flatKeys = {};
each(
  Razorpay.defaults,
  function(key, val){
    if (isNonNullObject(val)) {
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
  objKey = objKey.toLowerCase();
  var defaultVal = defObj[objKey];
  var defaultType = typeof defaultVal;
  if (defaultType === 'string' && (isNumber(objVal) || isBoolean(objVal))) {
    objVal = String(objVal);
  } else if (defaultType === 'number') {
    objVal = Number(objVal);
  } else if (defaultType === 'boolean' && (isString(objVal))) {
    if (objVal === 'true') {
      objVal = true;
    } else if (objVal === 'false') {
      objVal = false;
    }
  }
  if (defaultVal === null || defaultType === typeof objVal) {
    flatObj[objKey] = objVal;
  }
}

function flattenProp(obj, prop, type) {
  each(
    obj[prop],
    function(key, val){
      var valType = typeof val;
      if (valType === 'string' || valType === 'number' || valType === 'boolean') {
        key = prop + type[0] + key;
        if (type.length > 1) {
          key += type[1];
        }
        obj[key] = val;
      }
    }
  )
  delete obj[prop];
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