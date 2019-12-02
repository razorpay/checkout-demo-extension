/* eslint-disable */
/* jshint ignore:start */

/* Polyfill service v3.42.0
 * For detailed credits and licence information see https://github.com/financial-times/polyfill-service.
 *
 * Features requested: Object.getOwnPropertyDescriptors
 *
 * - _ESAbstract.ArrayCreate, License: CC0 (required by "_ESAbstract.ArraySpeciesCreate", "Array.prototype.filter", "Symbol", "Reflect.ownKeys", "Object.getOwnPropertyDescriptors", "Array.prototype.map")
 * - _ESAbstract.Call, License: CC0 (required by "Array.prototype.forEach", "Symbol", "Reflect.ownKeys", "Object.getOwnPropertyDescriptors", "Array.prototype.filter", "Array.prototype.map", "_ESAbstract.ToPrimitive", "_ESAbstract.ToString", "_ESAbstract.OrdinaryToPrimitive")
 * - _ESAbstract.Get, License: CC0 (required by "Array.prototype.forEach", "Symbol", "Reflect.ownKeys", "Object.getOwnPropertyDescriptors", "Array.prototype.filter", "Array.prototype.map", "_ESAbstract.ArraySpeciesCreate", "Object.defineProperties", "Object.create", "_ESAbstract.OrdinaryToPrimitive", "_ESAbstract.ToPrimitive", "_ESAbstract.ToString", "_ESAbstract.GetPrototypeFromConstructor", "_ESAbstract.OrdinaryCreateFromConstructor", "_ESAbstract.Construct")
 * - _ESAbstract.HasProperty, License: CC0 (required by "Array.prototype.forEach", "Symbol", "Reflect.ownKeys", "Object.getOwnPropertyDescriptors", "Array.prototype.filter", "Array.prototype.map")
 * - _ESAbstract.IsArray, License: CC0 (required by "_ESAbstract.ArraySpeciesCreate", "Array.prototype.filter", "Symbol", "Reflect.ownKeys", "Object.getOwnPropertyDescriptors", "Array.prototype.map")
 * - _ESAbstract.IsCallable, License: CC0 (required by "Function.prototype.bind", "Object.getOwnPropertyDescriptor", "Object.getOwnPropertyDescriptors", "Array.prototype.forEach", "Symbol", "Reflect.ownKeys", "Array.prototype.filter", "Array.prototype.map", "_ESAbstract.GetMethod", "_ESAbstract.ToPrimitive", "_ESAbstract.ToString", "_ESAbstract.IsConstructor", "_ESAbstract.ArraySpeciesCreate", "_ESAbstract.OrdinaryToPrimitive")
 * - _ESAbstract.ToBoolean, License: CC0 (required by "Array.prototype.filter", "Symbol", "Reflect.ownKeys", "Object.getOwnPropertyDescriptors")
 * - _ESAbstract.ToInteger, License: CC0 (required by "_ESAbstract.ToLength", "Array.prototype.forEach", "Symbol", "Reflect.ownKeys", "Object.getOwnPropertyDescriptors", "Array.prototype.filter", "Array.prototype.map")
 * - _ESAbstract.ToLength, License: CC0 (required by "Array.prototype.forEach", "Symbol", "Reflect.ownKeys", "Object.getOwnPropertyDescriptors", "Array.prototype.filter", "Array.prototype.map")
 * - _ESAbstract.ToObject, License: CC0 (required by "Object.getOwnPropertyDescriptors", "Array.prototype.forEach", "Symbol", "Reflect.ownKeys", "Array.prototype.filter", "Array.prototype.map", "Object.defineProperties", "Object.create", "_ESAbstract.GetV", "_ESAbstract.GetMethod", "_ESAbstract.ToPrimitive", "_ESAbstract.ToString", "_ESAbstract.IsConstructor", "_ESAbstract.ArraySpeciesCreate")
 * - _ESAbstract.GetV, License: CC0 (required by "_ESAbstract.GetMethod", "_ESAbstract.ToPrimitive", "_ESAbstract.ToString", "Array.prototype.forEach", "Symbol", "Reflect.ownKeys", "Object.getOwnPropertyDescriptors", "Array.prototype.filter", "Array.prototype.map", "_ESAbstract.IsConstructor", "_ESAbstract.ArraySpeciesCreate")
 * - _ESAbstract.GetMethod, License: CC0 (required by "_ESAbstract.ToPrimitive", "_ESAbstract.ToString", "Array.prototype.forEach", "Symbol", "Reflect.ownKeys", "Object.getOwnPropertyDescriptors", "Array.prototype.filter", "Array.prototype.map", "_ESAbstract.IsConstructor", "_ESAbstract.ArraySpeciesCreate")
 * - _ESAbstract.Type, License: CC0 (required by "Reflect.ownKeys", "Object.getOwnPropertyDescriptors", "Object.create", "Symbol", "_ESAbstract.ToString", "Array.prototype.forEach", "Array.prototype.filter", "Array.prototype.map", "_ESAbstract.ArraySpeciesCreate", "Object.defineProperties", "_ESAbstract.ToPrimitive", "_ESAbstract.IsConstructor", "_ESAbstract.OrdinaryToPrimitive", "_ESAbstract.GetPrototypeFromConstructor", "_ESAbstract.OrdinaryCreateFromConstructor", "_ESAbstract.Construct")
 * - _ESAbstract.GetPrototypeFromConstructor, License: CC0 (required by "_ESAbstract.OrdinaryCreateFromConstructor", "_ESAbstract.Construct", "_ESAbstract.ArraySpeciesCreate", "Array.prototype.filter", "Symbol", "Reflect.ownKeys", "Object.getOwnPropertyDescriptors", "Array.prototype.map")
 * - _ESAbstract.IsConstructor, License: CC0 (required by "_ESAbstract.ArraySpeciesCreate", "Array.prototype.filter", "Symbol", "Reflect.ownKeys", "Object.getOwnPropertyDescriptors", "Array.prototype.map", "_ESAbstract.Construct")
 * - _ESAbstract.OrdinaryToPrimitive, License: CC0 (required by "_ESAbstract.ToPrimitive", "_ESAbstract.ToString", "Array.prototype.forEach", "Symbol", "Reflect.ownKeys", "Object.getOwnPropertyDescriptors", "Array.prototype.filter", "Array.prototype.map")
 * - _ESAbstract.ToPrimitive, License: CC0 (required by "_ESAbstract.ToString", "Array.prototype.forEach", "Symbol", "Reflect.ownKeys", "Object.getOwnPropertyDescriptors", "Array.prototype.filter", "Array.prototype.map")
 * - _ESAbstract.ToString, License: CC0 (required by "Array.prototype.forEach", "Symbol", "Reflect.ownKeys", "Object.getOwnPropertyDescriptors", "Array.prototype.filter", "Array.prototype.map")
 * - Object.defineProperty, License: CC0 (required by "Object.getOwnPropertyDescriptors", "_ESAbstract.CreateMethodProperty", "Object.getOwnPropertyDescriptor", "Reflect.ownKeys", "_ESAbstract.CreateDataProperty", "Reflect", "Symbol", "Object.defineProperties", "Object.create", "_ESAbstract.OrdinaryCreateFromConstructor", "_ESAbstract.Construct", "_ESAbstract.ArraySpeciesCreate", "Array.prototype.filter", "Array.prototype.map")
 * - _ESAbstract.CreateDataProperty, License: CC0 (required by "Object.getOwnPropertyDescriptors", "_ESAbstract.CreateDataPropertyOrThrow", "Array.prototype.filter", "Symbol", "Reflect.ownKeys", "Array.prototype.map")
 * - _ESAbstract.CreateDataPropertyOrThrow, License: CC0 (required by "Array.prototype.filter", "Symbol", "Reflect.ownKeys", "Object.getOwnPropertyDescriptors", "Array.prototype.map")
 * - _ESAbstract.CreateMethodProperty, License: CC0 (required by "Object.getOwnPropertyDescriptors", "Object.getOwnPropertyDescriptor", "Reflect.ownKeys", "Function.prototype.bind", "Object.getOwnPropertyNames", "Symbol", "Array.prototype.forEach", "Array.prototype.filter", "Array.prototype.map", "Object.create", "Object.freeze", "Object.keys", "Object.defineProperties", "Object.getPrototypeOf", "_ESAbstract.OrdinaryCreateFromConstructor", "_ESAbstract.Construct", "_ESAbstract.ArraySpeciesCreate")
 * - Array.prototype.forEach, License: CC0 (required by "Symbol", "Reflect.ownKeys", "Object.getOwnPropertyDescriptors")
 * - Function.prototype.bind, License: MIT (required by "Object.getOwnPropertyDescriptor", "Object.getOwnPropertyDescriptors", "_ESAbstract.Construct", "_ESAbstract.ArraySpeciesCreate", "Array.prototype.filter", "Symbol", "Reflect.ownKeys", "Array.prototype.map")
 * - Object.freeze, License: CC0 (required by "Symbol", "Reflect.ownKeys", "Object.getOwnPropertyDescriptors")
 * - Object.getOwnPropertyDescriptor, License: CC0 (required by "Object.getOwnPropertyDescriptors", "Symbol", "Reflect.ownKeys", "Object.defineProperties", "Object.create")
 * - Object.getOwnPropertyNames, License: CC0 (required by "Reflect.ownKeys", "Object.getOwnPropertyDescriptors", "Symbol")
 * - Object.getPrototypeOf, License: CC0 (required by "_ESAbstract.OrdinaryCreateFromConstructor", "_ESAbstract.Construct", "_ESAbstract.ArraySpeciesCreate", "Array.prototype.filter", "Symbol", "Reflect.ownKeys", "Object.getOwnPropertyDescriptors", "Array.prototype.map")
 * - Object.keys, License: MIT (required by "Symbol", "Reflect.ownKeys", "Object.getOwnPropertyDescriptors", "Object.defineProperties", "Object.create")
 * - Object.defineProperties, License: CC0 (required by "Object.create", "Symbol", "Reflect.ownKeys", "Object.getOwnPropertyDescriptors")
 * - Object.create, License: CC0 (required by "Symbol", "Reflect.ownKeys", "Object.getOwnPropertyDescriptors", "_ESAbstract.OrdinaryCreateFromConstructor", "_ESAbstract.Construct", "_ESAbstract.ArraySpeciesCreate", "Array.prototype.filter", "Array.prototype.map")
 * - _ESAbstract.OrdinaryCreateFromConstructor, License: CC0 (required by "_ESAbstract.Construct", "_ESAbstract.ArraySpeciesCreate", "Array.prototype.filter", "Symbol", "Reflect.ownKeys", "Object.getOwnPropertyDescriptors", "Array.prototype.map")
 * - _ESAbstract.Construct, License: CC0 (required by "_ESAbstract.ArraySpeciesCreate", "Array.prototype.filter", "Symbol", "Reflect.ownKeys", "Object.getOwnPropertyDescriptors", "Array.prototype.map")
 * - _ESAbstract.ArraySpeciesCreate, License: CC0 (required by "Array.prototype.filter", "Symbol", "Reflect.ownKeys", "Object.getOwnPropertyDescriptors", "Array.prototype.map")
 * - Array.prototype.filter, License: CC0 (required by "Symbol", "Reflect.ownKeys", "Object.getOwnPropertyDescriptors")
 * - Array.prototype.map, License: CC0 (required by "Symbol", "Reflect.ownKeys", "Object.getOwnPropertyDescriptors")
 * - Reflect, License: CC0 (required by "Reflect.ownKeys", "Object.getOwnPropertyDescriptors")
 * - Symbol, License: MIT (required by "Reflect.ownKeys", "Object.getOwnPropertyDescriptors")
 * - Reflect.ownKeys, License: CC0 (required by "Object.getOwnPropertyDescriptors")
 * - Object.getOwnPropertyDescriptors, License: CC0 */

(function(undefined) {
  // _ESAbstract.ArrayCreate
  // 9.4.2.2. ArrayCreate ( length [ , proto ] )
  function ArrayCreate(length /* [, proto] */) {
    // eslint-disable-line no-unused-vars
    // 1. Assert: length is an integer Number ≥ 0.
    // 2. If length is -0, set length to +0.
    if (1 / length === -Infinity) {
      length = 0;
    }
    // 3. If length>2^32-1, throw a RangeError exception.
    if (length > Math.pow(2, 32) - 1) {
      throw new RangeError('Invalid array length');
    }
    // 4. If proto is not present, set proto to the intrinsic object %ArrayPrototype%.
    // 5. Let A be a newly created Array exotic object.
    var A = [];
    // 6. Set A's essential internal methods except for [[DefineOwnProperty]] to the default ordinary object definitions specified in 9.1.
    // 7. Set A.[[DefineOwnProperty]] as specified in 9.4.2.1.
    // 8. Set A.[[Prototype]] to proto.
    // 9. Set A.[[Extensible]] to true.
    // 10. Perform ! OrdinaryDefineOwnProperty(A, "length", PropertyDescriptor{[[Value]]: length, [[Writable]]: true, [[Enumerable]]: false, [[Configurable]]: false}).
    A.length = length;
    // 11. Return A.
    return A;
  }

  // _ESAbstract.Call
  /* global IsCallable */
  // 7.3.12. Call ( F, V [ , argumentsList ] )
  function Call(F, V /* [, argumentsList] */) {
    // eslint-disable-line no-unused-vars
    // 1. If argumentsList is not present, set argumentsList to a new empty List.
    var argumentsList = arguments.length > 2 ? arguments[2] : [];
    // 2. If IsCallable(F) is false, throw a TypeError exception.
    if (IsCallable(F) === false) {
      throw new TypeError(
        Object.prototype.toString.call(F) + 'is not a function.'
      );
    }
    // 3. Return ? F.[[Call]](V, argumentsList).
    return F.apply(V, argumentsList);
  }

  // _ESAbstract.Get
  // 7.3.1. Get ( O, P )
  function Get(O, P) {
    // eslint-disable-line no-unused-vars
    // 1. Assert: Type(O) is Object.
    // 2. Assert: IsPropertyKey(P) is true.
    // 3. Return ? O.[[Get]](P, O).
    return O[P];
  }

  // _ESAbstract.HasProperty
  // 7.3.10. HasProperty ( O, P )
  function HasProperty(O, P) {
    // eslint-disable-line no-unused-vars
    // Assert: Type(O) is Object.
    // Assert: IsPropertyKey(P) is true.
    // Return ? O.[[HasProperty]](P).
    return P in O;
  }

  // _ESAbstract.IsArray
  // 7.2.2. IsArray ( argument )
  function IsArray(argument) {
    // eslint-disable-line no-unused-vars
    // 1. If Type(argument) is not Object, return false.
    // 2. If argument is an Array exotic object, return true.
    // 3. If argument is a Proxy exotic object, then
    // a. If argument.[[ProxyHandler]] is null, throw a TypeError exception.
    // b. Let target be argument.[[ProxyTarget]].
    // c. Return ? IsArray(target).
    // 4. Return false.

    // Polyfill.io - We can skip all the above steps and check the string returned from Object.prototype.toString().
    return Object.prototype.toString.call(argument) === '[object Array]';
  }

  // _ESAbstract.IsCallable
  // 7.2.3. IsCallable ( argument )
  function IsCallable(argument) {
    // eslint-disable-line no-unused-vars
    // 1. If Type(argument) is not Object, return false.
    // 2. If argument has a [[Call]] internal method, return true.
    // 3. Return false.

    // Polyfill.io - Only function objects have a [[Call]] internal method. This means we can simplify this function to check that the argument has a type of function.
    return typeof argument === 'function';
  }

  // _ESAbstract.ToBoolean
  // 7.1.2. ToBoolean ( argument )
  // The abstract operation ToBoolean converts argument to a value of type Boolean according to Table 9:
  /*
--------------------------------------------------------------------------------------------------------------
| Argument Type | Result                                                                                     |
--------------------------------------------------------------------------------------------------------------
| Undefined     | Return false.                                                                              |
| Null          | Return false.                                                                              |
| Boolean       | Return argument.                                                                           |
| Number        | If argument is +0, -0, or NaN, return false; otherwise return true.                        |
| String        | If argument is the empty String (its length is zero), return false; otherwise return true. |
| Symbol        | Return true.                                                                               |
| Object        | Return true.                                                                               |
--------------------------------------------------------------------------------------------------------------
*/
  function ToBoolean(argument) {
    // eslint-disable-line no-unused-vars
    return Boolean(argument);
  }

  // _ESAbstract.ToInteger
  // 7.1.4. ToInteger ( argument )
  function ToInteger(argument) {
    // eslint-disable-line no-unused-vars
    // 1. Let number be ? ToNumber(argument).
    var number = Number(argument);
    // 2. If number is NaN, return +0.
    if (isNaN(number)) {
      return 0;
    }
    // 3. If number is +0, -0, +∞, or -∞, return number.
    if (
      1 / number === Infinity ||
      1 / number === -Infinity ||
      number === Infinity ||
      number === -Infinity
    ) {
      return number;
    }
    // 4. Return the number value that is the same sign as number and whose magnitude is floor(abs(number)).
    return (number < 0 ? -1 : 1) * Math.floor(Math.abs(number));
  }

  // _ESAbstract.ToLength
  /* global ToInteger */
  // 7.1.15. ToLength ( argument )
  function ToLength(argument) {
    // eslint-disable-line no-unused-vars
    // 1. Let len be ? ToInteger(argument).
    var len = ToInteger(argument);
    // 2. If len ≤ +0, return +0.
    if (len <= 0) {
      return 0;
    }
    // 3. Return min(len, 253-1).
    return Math.min(len, Math.pow(2, 53) - 1);
  }

  // _ESAbstract.ToObject
  // 7.1.13 ToObject ( argument )
  // The abstract operation ToObject converts argument to a value of type Object according to Table 12:
  // Table 12: ToObject Conversions
  /*
|----------------------------------------------------------------------------------------------------------------------------------------------------|
| Argument Type | Result                                                                                                                             |
|----------------------------------------------------------------------------------------------------------------------------------------------------|
| Undefined     | Throw a TypeError exception.                                                                                                       |
| Null          | Throw a TypeError exception.                                                                                                       |
| Boolean       | Return a new Boolean object whose [[BooleanData]] internal slot is set to argument. See 19.3 for a description of Boolean objects. |
| Number        | Return a new Number object whose [[NumberData]] internal slot is set to argument. See 20.1 for a description of Number objects.    |
| String        | Return a new String object whose [[StringData]] internal slot is set to argument. See 21.1 for a description of String objects.    |
| Symbol        | Return a new Symbol object whose [[SymbolData]] internal slot is set to argument. See 19.4 for a description of Symbol objects.    |
| Object        | Return argument.                                                                                                                   |
|----------------------------------------------------------------------------------------------------------------------------------------------------|
*/
  function ToObject(argument) {
    // eslint-disable-line no-unused-vars
    if (argument === null || argument === undefined) {
      throw TypeError();
    }
    return Object(argument);
  }

  // _ESAbstract.GetV
  /* global ToObject */
  // 7.3.2 GetV (V, P)
  function GetV(v, p) {
    // eslint-disable-line no-unused-vars
    // 1. Assert: IsPropertyKey(P) is true.
    // 2. Let O be ? ToObject(V).
    var o = ToObject(v);
    // 3. Return ? O.[[Get]](P, V).
    return o[p];
  }

  // _ESAbstract.GetMethod
  /* global GetV, IsCallable */
  // 7.3.9. GetMethod ( V, P )
  function GetMethod(V, P) {
    // eslint-disable-line no-unused-vars
    // 1. Assert: IsPropertyKey(P) is true.
    // 2. Let func be ? GetV(V, P).
    var func = GetV(V, P);
    // 3. If func is either undefined or null, return undefined.
    if (func === null || func === undefined) {
      return undefined;
    }
    // 4. If IsCallable(func) is false, throw a TypeError exception.
    if (IsCallable(func) === false) {
      throw new TypeError('Method not callable: ' + P);
    }
    // 5. Return func.
    return func;
  }

  // _ESAbstract.Type
  // "Type(x)" is used as shorthand for "the type of x"...
  function Type(x) {
    // eslint-disable-line no-unused-vars
    switch (typeof x) {
      case 'undefined':
        return 'undefined';
      case 'boolean':
        return 'boolean';
      case 'number':
        return 'number';
      case 'string':
        return 'string';
      case 'symbol':
        return 'symbol';
      default:
        // typeof null is 'object'
        if (x === null) return 'null';
        // Polyfill.io - This is here because a Symbol polyfill will have a typeof `object`.
        if ('Symbol' in this && x instanceof this.Symbol) return 'symbol';
        return 'object';
    }
  }

  // _ESAbstract.GetPrototypeFromConstructor
  /* global Get, Type */
  // 9.1.14. GetPrototypeFromConstructor ( constructor, intrinsicDefaultProto )
  function GetPrototypeFromConstructor(constructor, intrinsicDefaultProto) {
    // eslint-disable-line no-unused-vars
    // 1. Assert: intrinsicDefaultProto is a String value that is this specification's name of an intrinsic object. The corresponding object must be an intrinsic that is intended to be used as the [[Prototype]] value of an object.
    // 2. Assert: IsCallable(constructor) is true.
    // 3. Let proto be ? Get(constructor, "prototype").
    var proto = Get(constructor, 'prototype');
    // 4. If Type(proto) is not Object, then
    if (Type(proto) !== 'object') {
      // a. Let realm be ? GetFunctionRealm(constructor).
      // b. Set proto to realm's intrinsic object named intrinsicDefaultProto.
      proto = intrinsicDefaultProto;
    }
    // 5. Return proto.
    return proto;
  }

  // _ESAbstract.IsConstructor
  /* global Type */
  // 7.2.4. IsConstructor ( argument )
  function IsConstructor(argument) {
    // eslint-disable-line no-unused-vars
    // 1. If Type(argument) is not Object, return false.
    if (Type(argument) !== 'object') {
      return false;
    }
    // 2. If argument has a [[Construct]] internal method, return true.
    // 3. Return false.

    // Polyfill.io - `new argument` is the only way  to truly test if a function is a constructor.
    // We choose to not use`new argument` because the argument could have side effects when called.
    // Instead we check to see if the argument is a function and if it has a prototype.
    // Arrow functions do not have a [[Construct]] internal method, nor do they have a prototype.
    return typeof argument === 'function' && !!argument.prototype;
  }

  // _ESAbstract.OrdinaryToPrimitive
  /* global Get, IsCallable, Call, Type */
  // 7.1.1.1. OrdinaryToPrimitive ( O, hint )
  function OrdinaryToPrimitive(O, hint) {
    // eslint-disable-line no-unused-vars
    // 1. Assert: Type(O) is Object.
    // 2. Assert: Type(hint) is String and its value is either "string" or "number".
    // 3. If hint is "string", then
    if (hint === 'string') {
      // a. Let methodNames be « "toString", "valueOf" ».
      var methodNames = ['toString', 'valueOf'];
      // 4. Else,
    } else {
      // a. Let methodNames be « "valueOf", "toString" ».
      methodNames = ['valueOf', 'toString'];
    }
    // 5. For each name in methodNames in List order, do
    for (var i = 0; i < methodNames.length; ++i) {
      var name = methodNames[i];
      // a. Let method be ? Get(O, name).
      var method = Get(O, name);
      // b. If IsCallable(method) is true, then
      if (IsCallable(method)) {
        // i. Let result be ? Call(method, O).
        var result = Call(method, O);
        // ii. If Type(result) is not Object, return result.
        if (Type(result) !== 'object') {
          return result;
        }
      }
    }
    // 6. Throw a TypeError exception.
    throw new TypeError('Cannot convert to primitive.');
  }

  // _ESAbstract.ToPrimitive
  /* global Type, GetMethod, Call, OrdinaryToPrimitive */
  // 7.1.1. ToPrimitive ( input [ , PreferredType ] )
  function ToPrimitive(input /* [, PreferredType] */) {
    // eslint-disable-line no-unused-vars
    var PreferredType = arguments.length > 1 ? arguments[1] : undefined;
    // 1. Assert: input is an ECMAScript language value.
    // 2. If Type(input) is Object, then
    if (Type(input) === 'object') {
      // a. If PreferredType is not present, let hint be "default".
      if (arguments.length < 2) {
        var hint = 'default';
        // b. Else if PreferredType is hint String, let hint be "string".
      } else if (PreferredType === String) {
        hint = 'string';
        // c. Else PreferredType is hint Number, let hint be "number".
      } else if (PreferredType === Number) {
        hint = 'number';
      }
      // d. Let exoticToPrim be ? GetMethod(input, @@toPrimitive).
      var exoticToPrim =
        typeof this.Symbol === 'function' &&
        typeof this.Symbol.toPrimitive === 'symbol'
          ? GetMethod(input, this.Symbol.toPrimitive)
          : undefined;
      // e. If exoticToPrim is not undefined, then
      if (exoticToPrim !== undefined) {
        // i. Let result be ? Call(exoticToPrim, input, « hint »).
        var result = Call(exoticToPrim, input, [hint]);
        // ii. If Type(result) is not Object, return result.
        if (Type(result) !== 'object') {
          return result;
        }
        // iii. Throw a TypeError exception.
        throw new TypeError('Cannot convert exotic object to primitive.');
      }
      // f. If hint is "default", set hint to "number".
      if (hint === 'default') {
        hint = 'number';
      }
      // g. Return ? OrdinaryToPrimitive(input, hint).
      return OrdinaryToPrimitive(input, hint);
    }
    // 3. Return input
    return input;
  }

  // _ESAbstract.ToString
  /* global Type, ToPrimitive */
  // 7.1.12. ToString ( argument )
  // The abstract operation ToString converts argument to a value of type String according to Table 11:
  // Table 11: ToString Conversions
  /*
|---------------|--------------------------------------------------------|
| Argument Type | Result                                                 |
|---------------|--------------------------------------------------------|
| Undefined     | Return "undefined".                                    |
|---------------|--------------------------------------------------------|
| Null	        | Return "null".                                         |
|---------------|--------------------------------------------------------|
| Boolean       | If argument is true, return "true".                    |
|               | If argument is false, return "false".                  |
|---------------|--------------------------------------------------------|
| Number        | Return NumberToString(argument).                       |
|---------------|--------------------------------------------------------|
| String        | Return argument.                                       |
|---------------|--------------------------------------------------------|
| Symbol        | Throw a TypeError exception.                           |
|---------------|--------------------------------------------------------|
| Object        | Apply the following steps:                             |
|               | Let primValue be ? ToPrimitive(argument, hint String). |
|               | Return ? ToString(primValue).                          |
|---------------|--------------------------------------------------------|
*/
  function ToString(argument) {
    // eslint-disable-line no-unused-vars
    switch (Type(argument)) {
      case 'symbol':
        throw new TypeError('Cannot convert a Symbol value to a string');
        break;
      case 'object':
        var primValue = ToPrimitive(argument, 'string');
        return ToString(primValue);
      default:
        return String(argument);
    }
  }
  if (
    !(
      'defineProperty' in Object &&
      (function() {
        try {
          var e = {};
          return Object.defineProperty(e, 'test', { value: 42 }), !0;
        } catch (t) {
          return !1;
        }
      })()
    )
  ) {
    // Object.defineProperty
    (function(nativeDefineProperty) {
      var supportsAccessors = Object.prototype.hasOwnProperty(
        '__defineGetter__'
      );
      var ERR_ACCESSORS_NOT_SUPPORTED =
        'Getters & setters cannot be defined on this javascript engine';
      var ERR_VALUE_ACCESSORS =
        'A property cannot both have accessors and be writable or have a value';

      // Polyfill.io - This does not use CreateMethodProperty because our CreateMethodProperty function uses Object.defineProperty.
      Object['defineProperty'] = function defineProperty(
        object,
        property,
        descriptor
      ) {
        // Where native support exists, assume it
        if (
          nativeDefineProperty &&
          (object === window ||
            object === document ||
            object === Element.prototype ||
            object instanceof Element)
        ) {
          return nativeDefineProperty(object, property, descriptor);
        }

        if (
          object === null ||
          !(object instanceof Object || typeof object === 'object')
        ) {
          throw new TypeError('Object.defineProperty called on non-object');
        }

        if (!(descriptor instanceof Object)) {
          throw new TypeError('Property description must be an object');
        }

        var propertyString = String(property);
        var hasValueOrWritable =
          'value' in descriptor || 'writable' in descriptor;
        var getterType = 'get' in descriptor && typeof descriptor.get;
        var setterType = 'set' in descriptor && typeof descriptor.set;

        // handle descriptor.get
        if (getterType) {
          if (getterType !== 'function') {
            throw new TypeError('Getter must be a function');
          }
          if (!supportsAccessors) {
            throw new TypeError(ERR_ACCESSORS_NOT_SUPPORTED);
          }
          if (hasValueOrWritable) {
            throw new TypeError(ERR_VALUE_ACCESSORS);
          }
          Object.__defineGetter__.call(object, propertyString, descriptor.get);
        } else {
          object[propertyString] = descriptor.value;
        }

        // handle descriptor.set
        if (setterType) {
          if (setterType !== 'function') {
            throw new TypeError('Setter must be a function');
          }
          if (!supportsAccessors) {
            throw new TypeError(ERR_ACCESSORS_NOT_SUPPORTED);
          }
          if (hasValueOrWritable) {
            throw new TypeError(ERR_VALUE_ACCESSORS);
          }
          Object.__defineSetter__.call(object, propertyString, descriptor.set);
        }

        // OK to define value unconditionally - if a getter has been specified as well, an error would be thrown above
        if ('value' in descriptor) {
          object[propertyString] = descriptor.value;
        }

        return object;
      };
    })(Object.defineProperty);
  }

  // _ESAbstract.CreateDataProperty
  // 7.3.4. CreateDataProperty ( O, P, V )
  // NOTE
  // This abstract operation creates a property whose attributes are set to the same defaults used for properties created by the ECMAScript language assignment operator.
  // Normally, the property will not already exist. If it does exist and is not configurable or if O is not extensible, [[DefineOwnProperty]] will return false.
  function CreateDataProperty(O, P, V) {
    // eslint-disable-line no-unused-vars
    // 1. Assert: Type(O) is Object.
    // 2. Assert: IsPropertyKey(P) is true.
    // 3. Let newDesc be the PropertyDescriptor{ [[Value]]: V, [[Writable]]: true, [[Enumerable]]: true, [[Configurable]]: true }.
    var newDesc = {
      value: V,
      writable: true,
      enumerable: true,
      configurable: true,
    };
    // 4. Return ? O.[[DefineOwnProperty]](P, newDesc).
    try {
      Object.defineProperty(O, P, newDesc);
      return true;
    } catch (e) {
      return false;
    }
  }

  // _ESAbstract.CreateDataPropertyOrThrow
  /* global CreateDataProperty */
  // 7.3.6. CreateDataPropertyOrThrow ( O, P, V )
  function CreateDataPropertyOrThrow(O, P, V) {
    // eslint-disable-line no-unused-vars
    // 1. Assert: Type(O) is Object.
    // 2. Assert: IsPropertyKey(P) is true.
    // 3. Let success be ? CreateDataProperty(O, P, V).
    var success = CreateDataProperty(O, P, V);
    // 4. If success is false, throw a TypeError exception.
    if (!success) {
      throw new TypeError(
        'Cannot assign value `' +
          Object.prototype.toString.call(V) +
          '` to property `' +
          Object.prototype.toString.call(P) +
          '` on object `' +
          Object.prototype.toString.call(O) +
          '`'
      );
    }
    // 5. Return success.
    return success;
  }

  // _ESAbstract.CreateMethodProperty
  // 7.3.5. CreateMethodProperty ( O, P, V )
  function CreateMethodProperty(O, P, V) {
    // eslint-disable-line no-unused-vars
    // 1. Assert: Type(O) is Object.
    // 2. Assert: IsPropertyKey(P) is true.
    // 3. Let newDesc be the PropertyDescriptor{[[Value]]: V, [[Writable]]: true, [[Enumerable]]: false, [[Configurable]]: true}.
    var newDesc = {
      value: V,
      writable: true,
      enumerable: false,
      configurable: true,
    };
    // 4. Return ? O.[[DefineOwnProperty]](P, newDesc).
    Object.defineProperty(O, P, newDesc);
  }
  if (!('forEach' in Array.prototype)) {
    // Array.prototype.forEach
    /* global Call, CreateMethodProperty, Get, HasProperty, IsCallable, ToLength, ToObject, ToString */
    // 22.1.3.10. Array.prototype.forEach ( callbackfn [ , thisArg ] )
    CreateMethodProperty(Array.prototype, 'forEach', function forEach(
      callbackfn /* [ , thisArg ] */
    ) {
      // 1. Let O be ? ToObject(this value).
      var O = ToObject(this);
      // Polyfill.io - If O is a String object, split it into an array in order to iterate correctly.
      // We will use arrayLike in place of O when we are iterating through the list.
      var arraylike = O instanceof String ? O.split('') : O;
      // 2. Let len be ? ToLength(? Get(O, "length")).
      var len = ToLength(Get(O, 'length'));
      // 3. If IsCallable(callbackfn) is false, throw a TypeError exception.
      if (IsCallable(callbackfn) === false) {
        throw new TypeError(callbackfn + ' is not a function');
      }
      // 4. If thisArg is present, let T be thisArg; else let T be undefined.
      var T = arguments.length > 1 ? arguments[1] : undefined;
      // 5. Let k be 0.
      var k = 0;
      // 6. Repeat, while k < len
      while (k < len) {
        // a. Let Pk be ! ToString(k).
        var Pk = ToString(k);
        // b. Let kPresent be ? HasProperty(O, Pk).
        var kPresent = HasProperty(arraylike, Pk);
        // c. If kPresent is true, then
        if (kPresent) {
          // i. Let kValue be ? Get(O, Pk).
          var kValue = Get(arraylike, Pk);
          // ii. Perform ? Call(callbackfn, T, « kValue, k, O »).
          Call(callbackfn, T, [kValue, k, O]);
        }
        // d. Increase k by 1.
        k = k + 1;
      }
      // 7. Return undefined.
      return undefined;
    });
  }

  if (!('bind' in Function.prototype)) {
    // Function.prototype.bind
    /* global CreateMethodProperty, IsCallable */
    // 19.2.3.2. Function.prototype.bind ( thisArg, ...args )
    // https://github.com/es-shims/es5-shim/blob/d6d7ff1b131c7ba14c798cafc598bb6780d37d3b/es5-shim.js#L182
    CreateMethodProperty(Function.prototype, 'bind', function bind(that) {
      // .length is 1
      // add necessary es5-shim utilities
      var $Array = Array;
      var $Object = Object;
      var ArrayPrototype = $Array.prototype;
      var Empty = function Empty() {};
      var array_slice = ArrayPrototype.slice;
      var array_concat = ArrayPrototype.concat;
      var array_push = ArrayPrototype.push;
      var max = Math.max;
      // /add necessary es5-shim utilities

      // 1. Let Target be the this value.
      var target = this;
      // 2. If IsCallable(Target) is false, throw a TypeError exception.
      if (!IsCallable(target)) {
        throw new TypeError(
          'Function.prototype.bind called on incompatible ' + target
        );
      }
      // 3. Let A be a new (possibly empty) internal list of all of the
      //   argument values provided after thisArg (arg1, arg2 etc), in order.
      // XXX slicedArgs will stand in for "A" if used
      var args = array_slice.call(arguments, 1); // for normal call
      // 4. Let F be a new native ECMAScript object.
      // 11. Set the [[Prototype]] internal property of F to the standard
      //   built-in Function prototype object as specified in 15.3.3.1.
      // 12. Set the [[Call]] internal property of F as described in
      //   15.3.4.5.1.
      // 13. Set the [[Construct]] internal property of F as described in
      //   15.3.4.5.2.
      // 14. Set the [[HasInstance]] internal property of F as described in
      //   15.3.4.5.3.
      var bound;
      var binder = function() {
        if (this instanceof bound) {
          // 15.3.4.5.2 [[Construct]]
          // When the [[Construct]] internal method of a function object,
          // F that was created using the bind function is called with a
          // list of arguments ExtraArgs, the following steps are taken:
          // 1. Let target be the value of F's [[TargetFunction]]
          //   internal property.
          // 2. If target has no [[Construct]] internal method, a
          //   TypeError exception is thrown.
          // 3. Let boundArgs be the value of F's [[BoundArgs]] internal
          //   property.
          // 4. Let args be a new list containing the same values as the
          //   list boundArgs in the same order followed by the same
          //   values as the list ExtraArgs in the same order.
          // 5. Return the result of calling the [[Construct]] internal
          //   method of target providing args as the arguments.

          var result = target.apply(
            this,
            array_concat.call(args, array_slice.call(arguments))
          );
          if ($Object(result) === result) {
            return result;
          }
          return this;
        } else {
          // 15.3.4.5.1 [[Call]]
          // When the [[Call]] internal method of a function object, F,
          // which was created using the bind function is called with a
          // this value and a list of arguments ExtraArgs, the following
          // steps are taken:
          // 1. Let boundArgs be the value of F's [[BoundArgs]] internal
          //   property.
          // 2. Let boundThis be the value of F's [[BoundThis]] internal
          //   property.
          // 3. Let target be the value of F's [[TargetFunction]] internal
          //   property.
          // 4. Let args be a new list containing the same values as the
          //   list boundArgs in the same order followed by the same
          //   values as the list ExtraArgs in the same order.
          // 5. Return the result of calling the [[Call]] internal method
          //   of target providing boundThis as the this value and
          //   providing args as the arguments.

          // equiv: target.call(this, ...boundArgs, ...args)
          return target.apply(
            that,
            array_concat.call(args, array_slice.call(arguments))
          );
        }
      };

      // 15. If the [[Class]] internal property of Target is "Function", then
      //     a. Let L be the length property of Target minus the length of A.
      //     b. Set the length own property of F to either 0 or L, whichever is
      //       larger.
      // 16. Else set the length own property of F to 0.

      var boundLength = max(0, target.length - args.length);

      // 17. Set the attributes of the length own property of F to the values
      //   specified in 15.3.5.1.
      var boundArgs = [];
      for (var i = 0; i < boundLength; i++) {
        array_push.call(boundArgs, '$' + i);
      }

      // XXX Build a dynamic function with desired amount of arguments is the only
      // way to set the length property of a function.
      // In environments where Content Security Policies enabled (Chrome extensions,
      // for ex.) all use of eval or Function costructor throws an exception.
      // However in all of these environments Function.prototype.bind exists
      // and so this code will never be executed.
      bound = Function(
        'binder',
        'return function (' +
          boundArgs.join(',') +
          '){ return binder.apply(this, arguments); }'
      )(binder);

      if (target.prototype) {
        Empty.prototype = target.prototype;
        bound.prototype = new Empty();
        // Clean up dangling references.
        Empty.prototype = null;
      }

      // TODO
      // 18. Set the [[Extensible]] internal property of F to true.

      // TODO
      // 19. Let thrower be the [[ThrowTypeError]] function Object (13.2.3).
      // 20. Call the [[DefineOwnProperty]] internal method of F with
      //   arguments "caller", PropertyDescriptor {[[Get]]: thrower, [[Set]]:
      //   thrower, [[Enumerable]]: false, [[Configurable]]: false}, and
      //   false.
      // 21. Call the [[DefineOwnProperty]] internal method of F with
      //   arguments "arguments", PropertyDescriptor {[[Get]]: thrower,
      //   [[Set]]: thrower, [[Enumerable]]: false, [[Configurable]]: false},
      //   and false.

      // TODO
      // NOTE Function objects created using Function.prototype.bind do not
      // have a prototype property or the [[Code]], [[FormalParameters]], and
      // [[Scope]] internal properties.
      // XXX can't delete prototype in pure-js.

      // 22. Return F.
      return bound;
    });
  }

  if (!('freeze' in Object)) {
    // Object.freeze
    /* global CreateMethodProperty */
    // 19.1.2.6. Object.freeze ( O )
    CreateMethodProperty(Object, 'freeze', function freeze(O) {
      // This feature cannot be implemented fully as a polyfill.
      // We choose to silently fail which allows "securable" code
      // to "gracefully" degrade to working but insecure code.
      return O;
    });
  }

  if (
    !(
      'getOwnPropertyDescriptor' in Object &&
      'function' == typeof Object.getOwnPropertyDescriptor &&
      (function() {
        try {
          var t = {};
          return (
            (t.test = 0), 0 === Object.getOwnPropertyDescriptor(t, 'test').value
          );
        } catch (e) {
          return !1;
        }
      })()
    )
  ) {
    // Object.getOwnPropertyDescriptor
    /* global CreateMethodProperty */
    (function() {
      var call = Function.prototype.call;
      var prototypeOfObject = Object.prototype;
      var owns = call.bind(prototypeOfObject.hasOwnProperty);

      var lookupGetter;
      var lookupSetter;
      var supportsAccessors;
      if ((supportsAccessors = owns(prototypeOfObject, '__defineGetter__'))) {
        lookupGetter = call.bind(prototypeOfObject.__lookupGetter__);
        lookupSetter = call.bind(prototypeOfObject.__lookupSetter__);
      }
      function doesGetOwnPropertyDescriptorWork(object) {
        try {
          object.sentinel = 0;
          return (
            Object.getOwnPropertyDescriptor(object, 'sentinel').value === 0
          );
        } catch (exception) {
          // returns falsy
        }
      }
      // check whether getOwnPropertyDescriptor works if it's given. Otherwise,
      // shim partially.
      if (Object.defineProperty) {
        var getOwnPropertyDescriptorWorksOnObject = doesGetOwnPropertyDescriptorWork(
          {}
        );
        var getOwnPropertyDescriptorWorksOnDom =
          typeof document == 'undefined' ||
          doesGetOwnPropertyDescriptorWork(document.createElement('div'));
        if (
          !getOwnPropertyDescriptorWorksOnDom ||
          !getOwnPropertyDescriptorWorksOnObject
        ) {
          var getOwnPropertyDescriptorFallback =
            Object.getOwnPropertyDescriptor;
        }
      }

      if (
        !Object.getOwnPropertyDescriptor ||
        getOwnPropertyDescriptorFallback
      ) {
        var ERR_NON_OBJECT =
          'Object.getOwnPropertyDescriptor called on a non-object: ';

        CreateMethodProperty(
          Object,
          'getOwnPropertyDescriptor',
          function getOwnPropertyDescriptor(object, property) {
            if (
              (typeof object != 'object' && typeof object != 'function') ||
              object === null
            ) {
              throw new TypeError(ERR_NON_OBJECT + object);
            }

            // make a valiant attempt to use the real getOwnPropertyDescriptor
            // for I8's DOM elements.
            if (getOwnPropertyDescriptorFallback) {
              try {
                return getOwnPropertyDescriptorFallback.call(
                  Object,
                  object,
                  property
                );
              } catch (exception) {
                // try the shim if the real one doesn't work
              }
            }

            // If object does not owns property return undefined immediately.
            if (!owns(object, property)) {
              return;
            }

            // If object has a property then it's for sure both `enumerable` and
            // `configurable`.
            var descriptor = { enumerable: true, configurable: true };

            // If JS engine supports accessor properties then property may be a
            // getter or setter.
            if (supportsAccessors) {
              // Unfortunately `__lookupGetter__` will return a getter even
              // if object has own non getter property along with a same named
              // inherited getter. To avoid misbehavior we temporary remove
              // `__proto__` so that `__lookupGetter__` will return getter only
              // if it's owned by an object.
              var prototype = object.__proto__;
              object.__proto__ = prototypeOfObject;

              var getter = lookupGetter(object, property);
              var setter = lookupSetter(object, property);

              // Once we have getter and setter we can put values back.
              object.__proto__ = prototype;

              if (getter || setter) {
                if (getter) {
                  descriptor.get = getter;
                }
                if (setter) {
                  descriptor.set = setter;
                }
                // If it was accessor property we're done and return here
                // in order to avoid adding `value` to the descriptor.
                return descriptor;
              }
            }

            // If we got this far we know that object has an own property that is
            // not an accessor so we set it as a value and return descriptor.
            descriptor.value = object[property];
            descriptor.writable = true;
            return descriptor;
          }
        );
      }
    })();
  }

  if (!('getOwnPropertyNames' in Object)) {
    // Object.getOwnPropertyNames
    /* global CreateMethodProperty */

    var toString = {}.toString;
    var split = ''.split;

    CreateMethodProperty(
      Object,
      'getOwnPropertyNames',
      function getOwnPropertyNames(object) {
        var buffer = [];
        var key;

        // Non-enumerable properties cannot be discovered but can be checked for by name.
        // Define those used internally by JS to allow an incomplete solution
        var commonProps = [
          'length',
          'name',
          'arguments',
          'caller',
          'prototype',
          'observe',
          'unobserve',
        ];

        if (typeof object === 'undefined' || object === null) {
          throw new TypeError('Cannot convert undefined or null to object');
        }

        // Polyfill.io fallback for non-array-like strings which exist in some ES3 user-agents (IE 8)
        object =
          toString.call(object) == '[object String]'
            ? split.call(object, '')
            : Object(object);

        // Enumerable properties only
        for (key in object) {
          if (Object.prototype.hasOwnProperty.call(object, key)) {
            buffer.push(key);
          }
        }

        // Check for and add the common non-enumerable properties
        for (var i = 0, s = commonProps.length; i < s; i++) {
          if (commonProps[i] in object) buffer.push(commonProps[i]);
        }

        return buffer;
      }
    );
  }

  if (!('getPrototypeOf' in Object)) {
    // Object.getPrototypeOf
    /* global CreateMethodProperty */
    // Based on: https://github.com/es-shims/es5-shim/blob/master/es5-sham.js

    // https://github.com/es-shims/es5-shim/issues#issue/2
    // http://ejohn.org/blog/objectgetprototypeof/
    // recommended by fschaefer on github
    //
    // sure, and webreflection says ^_^
    // ... this will nerever possibly return null
    // ... Opera Mini breaks here with infinite loops
    CreateMethodProperty(Object, 'getPrototypeOf', function getPrototypeOf(
      object
    ) {
      if (object !== Object(object)) {
        throw new TypeError('Object.getPrototypeOf called on non-object');
      }
      var proto = object.__proto__;
      if (proto || proto === null) {
        return proto;
      } else if (
        typeof object.constructor == 'function' &&
        object instanceof object.constructor
      ) {
        return object.constructor.prototype;
      } else if (object instanceof Object) {
        return Object.prototype;
      } else {
        // Correctly return null for Objects created with `Object.create(null)`
        // (shammed or native) or `{ __proto__: null}`.  Also returns null for
        // cross-realm objects on browsers that lack `__proto__` support (like
        // IE <11), but that's the best we can do.
        return null;
      }
    });
  }

  if (
    !(
      'keys' in Object &&
      (function() {
        return 2 === Object.keys(arguments).length;
      })(1, 2) &&
      (function() {
        try {
          return Object.keys(''), !0;
        } catch (t) {
          return !1;
        }
      })()
    )
  ) {
    // Object.keys
    /* global CreateMethodProperty */
    CreateMethodProperty(
      Object,
      'keys',
      (function() {
        'use strict';

        // modified from https://github.com/es-shims/object-keys

        var has = Object.prototype.hasOwnProperty;
        var toStr = Object.prototype.toString;
        var isEnumerable = Object.prototype.propertyIsEnumerable;
        var hasDontEnumBug = !isEnumerable.call({ toString: null }, 'toString');
        var hasProtoEnumBug = isEnumerable.call(function() {}, 'prototype');
        var dontEnums = [
          'toString',
          'toLocaleString',
          'valueOf',
          'hasOwnProperty',
          'isPrototypeOf',
          'propertyIsEnumerable',
          'constructor',
        ];
        var equalsConstructorPrototype = function(o) {
          var ctor = o.constructor;
          return ctor && ctor.prototype === o;
        };
        var excludedKeys = {
          $console: true,
          $external: true,
          $frame: true,
          $frameElement: true,
          $frames: true,
          $innerHeight: true,
          $innerWidth: true,
          $outerHeight: true,
          $outerWidth: true,
          $pageXOffset: true,
          $pageYOffset: true,
          $parent: true,
          $scrollLeft: true,
          $scrollTop: true,
          $scrollX: true,
          $scrollY: true,
          $self: true,
          $webkitIndexedDB: true,
          $webkitStorageInfo: true,
          $window: true,
        };
        var hasAutomationEqualityBug = (function() {
          /* global window */
          if (typeof window === 'undefined') {
            return false;
          }
          for (var k in window) {
            try {
              if (
                !excludedKeys['$' + k] &&
                has.call(window, k) &&
                window[k] !== null &&
                typeof window[k] === 'object'
              ) {
                try {
                  equalsConstructorPrototype(window[k]);
                } catch (e) {
                  return true;
                }
              }
            } catch (e) {
              return true;
            }
          }
          return false;
        })();
        var equalsConstructorPrototypeIfNotBuggy = function(o) {
          /* global window */
          if (typeof window === 'undefined' || !hasAutomationEqualityBug) {
            return equalsConstructorPrototype(o);
          }
          try {
            return equalsConstructorPrototype(o);
          } catch (e) {
            return false;
          }
        };

        function isArgumentsObject(value) {
          var str = toStr.call(value);
          var isArgs = str === '[object Arguments]';
          if (!isArgs) {
            isArgs =
              str !== '[object Array]' &&
              value !== null &&
              typeof value === 'object' &&
              typeof value.length === 'number' &&
              value.length >= 0 &&
              toStr.call(value.callee) === '[object Function]';
          }
          return isArgs;
        }

        return function keys(object) {
          var isFunction = toStr.call(object) === '[object Function]';
          var isArguments = isArgumentsObject(object);
          var isString = toStr.call(object) === '[object String]';
          var theKeys = [];

          if (object === undefined || object === null) {
            throw new TypeError('Cannot convert undefined or null to object');
          }

          var skipProto = hasProtoEnumBug && isFunction;
          if (isString && object.length > 0 && !has.call(object, 0)) {
            for (var i = 0; i < object.length; ++i) {
              theKeys.push(String(i));
            }
          }

          if (isArguments && object.length > 0) {
            for (var j = 0; j < object.length; ++j) {
              theKeys.push(String(j));
            }
          } else {
            for (var name in object) {
              if (
                !(skipProto && name === 'prototype') &&
                has.call(object, name)
              ) {
                theKeys.push(String(name));
              }
            }
          }

          if (hasDontEnumBug) {
            var skipConstructor = equalsConstructorPrototypeIfNotBuggy(object);

            for (var k = 0; k < dontEnums.length; ++k) {
              if (
                !(skipConstructor && dontEnums[k] === 'constructor') &&
                has.call(object, dontEnums[k])
              ) {
                theKeys.push(dontEnums[k]);
              }
            }
          }
          return theKeys;
        };
      })()
    );
  }

  if (!('defineProperties' in Object)) {
    // Object.defineProperties
    /* global CreateMethodProperty, Get, ToObject, Type */
    // 19.1.2.3. Object.defineProperties ( O, Properties )
    CreateMethodProperty(Object, 'defineProperties', function defineProperties(
      O,
      Properties
    ) {
      // 1. If Type(O) is not Object, throw a TypeError exception.
      if (Type(O) !== 'object') {
        throw new TypeError('Object.defineProperties called on non-object');
      }
      // 2. Let props be ? ToObject(Properties).
      var props = ToObject(Properties);
      // 3. Let keys be ? props.[[OwnPropertyKeys]]().
      /*
		Polyfill.io - This step in our polyfill is not complying with the specification.
		[[OwnPropertyKeys]] is meant to return ALL keys, including non-enumerable and symbols.
		TODO: When we have Reflect.ownKeys, use that instead as it is the userland equivalent of [[OwnPropertyKeys]].
	*/
      var keys = Object.keys(props);
      // 4. Let descriptors be a new empty List.
      var descriptors = [];
      // 5. For each element nextKey of keys in List order, do
      for (var i = 0; i < keys.length; i++) {
        var nextKey = keys[i];
        // a. Let propDesc be ? props.[[GetOwnProperty]](nextKey).
        var propDesc = Object.getOwnPropertyDescriptor(props, nextKey);
        // b. If propDesc is not undefined and propDesc.[[Enumerable]] is true, then
        if (propDesc !== undefined && propDesc.enumerable) {
          // i. Let descObj be ? Get(props, nextKey).
          var descObj = Get(props, nextKey);
          // ii. Let desc be ? ToPropertyDescriptor(descObj).
          // Polyfill.io - We skip this step because Object.defineProperty deals with it.
          // TODO: Implement this step?
          var desc = descObj;
          // iii. Append the pair (a two element List) consisting of nextKey and desc to the end of descriptors.
          descriptors.push([nextKey, desc]);
        }
      }
      // 6. For each pair from descriptors in list order, do
      for (var i = 0; i < descriptors.length; i++) {
        // a. Let P be the first element of pair.
        var P = descriptors[i][0];
        // b. Let desc be the second element of pair.
        var desc = descriptors[i][1];
        // c. Perform ? DefinePropertyOrThrow(O, P, desc).
        Object.defineProperty(O, P, desc);
      }
      // 7. Return O.
      return O;
    });
  }

  if (!('create' in Object)) {
    // Object.create
    /* global CreateMethodProperty, Type */
    CreateMethodProperty(Object, 'create', function create(O, properties) {
      // 1. If Type(O) is neither Object nor Null, throw a TypeError exception.
      if (Type(O) !== 'object' && Type(O) !== 'null') {
        throw new TypeError('Object prototype may only be an Object or null');
      }
      // 2. Let obj be ObjectCreate(O).
      var obj = new Function(
        'e',
        'function Object() {}Object.prototype=e;return new Object'
      )(O);

      obj.constructor.prototype = O;

      // 3. If Properties is not undefined, then
      if (1 in arguments) {
        // a. Return ? ObjectDefineProperties(obj, Properties).
        return Object.defineProperties(obj, properties);
      }

      return obj;
    });
  }

  // _ESAbstract.OrdinaryCreateFromConstructor
  /* global GetPrototypeFromConstructor */
  // 9.1.13. OrdinaryCreateFromConstructor ( constructor, intrinsicDefaultProto [ , internalSlotsList ] )
  function OrdinaryCreateFromConstructor(constructor, intrinsicDefaultProto) {
    // eslint-disable-line no-unused-vars
    var internalSlotsList = arguments[2] || {};
    // 1. Assert: intrinsicDefaultProto is a String value that is this specification's name of an intrinsic object.
    // The corresponding object must be an intrinsic that is intended to be used as the[[Prototype]] value of an object.

    // 2. Let proto be ? GetPrototypeFromConstructor(constructor, intrinsicDefaultProto).
    var proto = GetPrototypeFromConstructor(constructor, intrinsicDefaultProto);

    // 3. Return ObjectCreate(proto, internalSlotsList).
    // Polyfill.io - We do not pass internalSlotsList to Object.create because Object.create does not use the default ordinary object definitions specified in 9.1.
    var obj = Object.create(proto);
    for (var name in internalSlotsList) {
      if (Object.prototype.hasOwnProperty.call(internalSlotsList, name)) {
        Object.defineProperty(obj, name, {
          configurable: true,
          enumerable: false,
          writable: true,
          value: internalSlotsList[name],
        });
      }
    }
    return obj;
  }

  // _ESAbstract.Construct
  /* global IsConstructor, OrdinaryCreateFromConstructor, Call */
  // 7.3.13. Construct ( F [ , argumentsList [ , newTarget ]] )
  function Construct(F /* [ , argumentsList [ , newTarget ]] */) {
    // eslint-disable-line no-unused-vars
    // 1. If newTarget is not present, set newTarget to F.
    var newTarget = arguments.length > 2 ? arguments[2] : F;

    // 2. If argumentsList is not present, set argumentsList to a new empty List.
    var argumentsList = arguments.length > 1 ? arguments[1] : [];

    // 3. Assert: IsConstructor(F) is true.
    if (!IsConstructor(F)) {
      throw new TypeError('F must be a constructor.');
    }

    // 4. Assert: IsConstructor(newTarget) is true.
    if (!IsConstructor(newTarget)) {
      throw new TypeError('newTarget must be a constructor.');
    }

    // 5. Return ? F.[[Construct]](argumentsList, newTarget).
    // Polyfill.io - If newTarget is the same as F, it is equivalent to new F(...argumentsList).
    if (newTarget === F) {
      return new (Function.prototype.bind.apply(
        F,
        [null].concat(argumentsList)
      ))();
    } else {
      // Polyfill.io - This is mimicking section 9.2.2 step 5.a.
      var obj = OrdinaryCreateFromConstructor(newTarget, Object.prototype);
      return Call(F, obj, argumentsList);
    }
  }

  // _ESAbstract.ArraySpeciesCreate
  /* global IsArray, ArrayCreate, Get, Type, IsConstructor, Construct */
  // 9.4.2.3. ArraySpeciesCreate ( originalArray, length )
  function ArraySpeciesCreate(originalArray, length) {
    // eslint-disable-line no-unused-vars
    // 1. Assert: length is an integer Number ≥ 0.
    // 2. If length is -0, set length to +0.
    if (1 / length === -Infinity) {
      length = 0;
    }

    // 3. Let isArray be ? IsArray(originalArray).
    var isArray = IsArray(originalArray);

    // 4. If isArray is false, return ? ArrayCreate(length).
    if (isArray === false) {
      return ArrayCreate(length);
    }

    // 5. Let C be ? Get(originalArray, "constructor").
    var C = Get(originalArray, 'constructor');

    // Polyfill.io - We skip this section as not sure how to make a cross-realm normal Array, a same-realm Array.
    // 6. If IsConstructor(C) is true, then
    // if (IsConstructor(C)) {
    // a. Let thisRealm be the current Realm Record.
    // b. Let realmC be ? GetFunctionRealm(C).
    // c. If thisRealm and realmC are not the same Realm Record, then
    // i. If SameValue(C, realmC.[[Intrinsics]].[[%Array%]]) is true, set C to undefined.
    // }
    // 7. If Type(C) is Object, then
    if (Type(C) === 'object') {
      // a. Set C to ? Get(C, @@species).
      C =
        'Symbol' in this && 'species' in this.Symbol
          ? Get(C, this.Symbol.species)
          : undefined;
      // b. If C is null, set C to undefined.
      if (C === null) {
        C = undefined;
      }
    }
    // 8. If C is undefined, return ? ArrayCreate(length).
    if (C === undefined) {
      return ArrayCreate(length);
    }
    // 9. If IsConstructor(C) is false, throw a TypeError exception.
    if (!IsConstructor(C)) {
      throw new TypeError('C must be a constructor');
    }
    // 10. Return ? Construct(C, « length »).
    return Construct(C, [length]);
  }
  if (!('filter' in Array.prototype)) {
    // Array.prototype.filter
    /* global CreateMethodProperty, ToObject, ToLength, Get, IsCallable, ArraySpeciesCreate, ToString, HasProperty, ToBoolean, Call, CreateDataPropertyOrThrow */
    // 22.1.3.7. Array.prototype.filter ( callbackfn [ , thisArg ] )
    CreateMethodProperty(Array.prototype, 'filter', function filter(
      callbackfn /* [ , thisArg ] */
    ) {
      // 1. Let O be ? ToObject(this value).
      var O = ToObject(this);
      // 2. Let len be ? ToLength(? Get(O, "length")).
      var len = ToLength(Get(O, 'length'));
      // 3. If IsCallable(callbackfn) is false, throw a TypeError exception.
      if (IsCallable(callbackfn) === false) {
        throw new TypeError(callbackfn + ' is not a function');
      }
      // 4. If thisArg is present, let T be thisArg; else let T be undefined.
      var T = arguments.length > 1 ? arguments[1] : undefined;
      // 5. Let A be ? ArraySpeciesCreate(O, 0).
      var A = ArraySpeciesCreate(O, 0);
      // 6. Let k be 0.
      var k = 0;
      // 7. Let to be 0.
      var to = 0;
      // 8. Repeat, while k < len
      while (k < len) {
        // a. Let Pk be ! ToString(k).
        var Pk = ToString(k);
        // b. Let kPresent be ? HasProperty(O, Pk).
        var kPresent = HasProperty(O, Pk);
        // c. If kPresent is true, then
        if (kPresent) {
          // i. Let kValue be ? Get(O, Pk).
          var kValue = Get(O, Pk);
          // ii. Let selected be ToBoolean(? Call(callbackfn, T, « kValue, k, O »)).
          var selected = ToBoolean(Call(callbackfn, T, [kValue, k, O]));
          // iii. If selected is true, then
          if (selected) {
            // 1. Perform ? CreateDataPropertyOrThrow(A, ! ToString(to), kValue)
            CreateDataPropertyOrThrow(A, ToString(to), kValue);
            // 2. Increase to by 1.
            to = to + 1;
          }
        }
        // d. Increase k by 1.
        k = k + 1;
      }
      // 9. Return A.
      return A;
    });
  }

  if (!('map' in Array.prototype)) {
    // Array.prototype.map
    /* global ArraySpeciesCreate, Call, CreateDataPropertyOrThrow, CreateMethodProperty, Get, HasProperty, IsCallable, ToLength, ToObject, ToString */
    /* global CreateMethodProperty, ToObject, ToLength, Get, ArraySpeciesCreate, ToString, HasProperty, Call, CreateDataPropertyOrThrow */
    // 22.1.3.16. Array.prototype.map ( callbackfn [ , thisArg ] )
    CreateMethodProperty(Array.prototype, 'map', function map(
      callbackfn /* [ , thisArg ] */
    ) {
      // 1. Let O be ? ToObject(this value).
      var O = ToObject(this);
      // 2. Let len be ? ToLength(? Get(O, "length")).
      var len = ToLength(Get(O, 'length'));
      // 3. If IsCallable(callbackfn) is false, throw a TypeError exception.
      if (IsCallable(callbackfn) === false) {
        throw new TypeError(callbackfn + ' is not a function');
      }
      // 4. If thisArg is present, let T be thisArg; else let T be undefined.
      var T = arguments.length > 1 ? arguments[1] : undefined;
      // 5. Let A be ? ArraySpeciesCreate(O, len).
      var A = ArraySpeciesCreate(O, len);
      // 6. Let k be 0.
      var k = 0;
      // 7. Repeat, while k < len
      while (k < len) {
        // a. Let Pk be ! ToString(k).
        var Pk = ToString(k);
        // b. Let kPresent be ? HasProperty(O, Pk).
        var kPresent = HasProperty(O, Pk);
        // c. If kPresent is true, then
        if (kPresent) {
          // i. Let kValue be ? Get(O, Pk).
          var kValue = Get(O, Pk);
          // ii. Let mappedValue be ? Call(callbackfn, T, « kValue, k, O »).
          var mappedValue = Call(callbackfn, T, [kValue, k, O]);
          // iii. Perform ? CreateDataPropertyOrThrow(A, Pk, mappedValue).
          CreateDataPropertyOrThrow(A, Pk, mappedValue);
        }
        // d. Increase k by 1.
        k = k + 1;
      }
      // 8. Return A.
      return A;
    });
  }

  if (!('Reflect' in this)) {
    // Reflect
    // 26.1 The Reflect Object
    Object.defineProperty(self, 'Reflect', {
      value: self.Reflect || {},
      writable: true,
      configurable: true,
    });
    Object.defineProperty(self, 'Reflect', {
      value: self.Reflect || {},
      enumerable: false,
    });
  }

  if (!('Symbol' in this && 0 === this.Symbol.length)) {
    // Symbol
    // A modification of https://github.com/WebReflection/get-own-property-symbols
    // (C) Andrea Giammarchi - MIT Licensed

    (function(Object, GOPS, global) {
      'use strict'; //so that ({}).toString.call(null) returns the correct [object Null] rather than [object Window]

      var setDescriptor;
      var id = 0;
      var random = '' + Math.random();
      var prefix = '__\x01symbol:';
      var prefixLength = prefix.length;
      var internalSymbol = '__\x01symbol@@' + random;
      var DP = 'defineProperty';
      var DPies = 'defineProperties';
      var GOPN = 'getOwnPropertyNames';
      var GOPD = 'getOwnPropertyDescriptor';
      var PIE = 'propertyIsEnumerable';
      var ObjectProto = Object.prototype;
      var hOP = ObjectProto.hasOwnProperty;
      var pIE = ObjectProto[PIE];
      var toString = ObjectProto.toString;
      var concat = Array.prototype.concat;
      var cachedWindowNames = Object.getOwnPropertyNames
        ? Object.getOwnPropertyNames(window)
        : [];
      var nGOPN = Object[GOPN];
      var gOPN = function getOwnPropertyNames(obj) {
        if (toString.call(obj) === '[object Window]') {
          try {
            return nGOPN(obj);
          } catch (e) {
            // IE bug where layout engine calls userland gOPN for cross-domain `window` objects
            return concat.call([], cachedWindowNames);
          }
        }
        return nGOPN(obj);
      };
      var gOPD = Object[GOPD];
      var create = Object.create;
      var keys = Object.keys;
      var freeze = Object.freeze || Object;
      var defineProperty = Object[DP];
      var $defineProperties = Object[DPies];
      var descriptor = gOPD(Object, GOPN);
      var addInternalIfNeeded = function(o, uid, enumerable) {
        if (!hOP.call(o, internalSymbol)) {
          try {
            defineProperty(o, internalSymbol, {
              enumerable: false,
              configurable: false,
              writable: false,
              value: {},
            });
          } catch (e) {
            o[internalSymbol] = {};
          }
        }
        o[internalSymbol]['@@' + uid] = enumerable;
      };
      var createWithSymbols = function(proto, descriptors) {
        var self = create(proto);
        gOPN(descriptors).forEach(function(key) {
          if (propertyIsEnumerable.call(descriptors, key)) {
            $defineProperty(self, key, descriptors[key]);
          }
        });
        return self;
      };
      var copyAsNonEnumerable = function(descriptor) {
        var newDescriptor = create(descriptor);
        newDescriptor.enumerable = false;
        return newDescriptor;
      };
      var get = function get() {};
      var onlyNonSymbols = function(name) {
        return name != internalSymbol && !hOP.call(source, name);
      };
      var onlySymbols = function(name) {
        return name != internalSymbol && hOP.call(source, name);
      };
      var propertyIsEnumerable = function propertyIsEnumerable(key) {
        var uid = '' + key;
        return onlySymbols(uid)
          ? hOP.call(this, uid) && this[internalSymbol]['@@' + uid]
          : pIE.call(this, key);
      };
      var setAndGetSymbol = function(uid) {
        var descriptor = {
          enumerable: false,
          configurable: true,
          get: get,
          set: function(value) {
            setDescriptor(this, uid, {
              enumerable: false,
              configurable: true,
              writable: true,
              value: value,
            });
            addInternalIfNeeded(this, uid, true);
          },
        };
        try {
          defineProperty(ObjectProto, uid, descriptor);
        } catch (e) {
          ObjectProto[uid] = descriptor.value;
        }
        return freeze(
          (source[uid] = defineProperty(
            Object(uid),
            'constructor',
            sourceConstructor
          ))
        );
      };
      var Symbol = function Symbol() {
        var description = arguments[0];
        if (this instanceof Symbol) {
          throw new TypeError('Symbol is not a constructor');
        }
        return setAndGetSymbol(prefix.concat(description || '', random, ++id));
      };
      var source = create(null);
      var sourceConstructor = { value: Symbol };
      var sourceMap = function(uid) {
        return source[uid];
      };
      var $defineProperty = function defineProp(o, key, descriptor) {
        var uid = '' + key;
        if (onlySymbols(uid)) {
          setDescriptor(
            o,
            uid,
            descriptor.enumerable ? copyAsNonEnumerable(descriptor) : descriptor
          );
          addInternalIfNeeded(o, uid, !!descriptor.enumerable);
        } else {
          defineProperty(o, key, descriptor);
        }
        return o;
      };

      var onlyInternalSymbols = function(obj) {
        return function(name) {
          return (
            hOP.call(obj, internalSymbol) &&
            hOP.call(obj[internalSymbol], '@@' + name)
          );
        };
      };
      var $getOwnPropertySymbols = function getOwnPropertySymbols(o) {
        return gOPN(o)
          .filter(o === ObjectProto ? onlyInternalSymbols(o) : onlySymbols)
          .map(sourceMap);
      };
      descriptor.value = $defineProperty;
      defineProperty(Object, DP, descriptor);

      descriptor.value = $getOwnPropertySymbols;
      defineProperty(Object, GOPS, descriptor);

      descriptor.value = function getOwnPropertyNames(o) {
        return gOPN(o).filter(onlyNonSymbols);
      };
      defineProperty(Object, GOPN, descriptor);

      descriptor.value = function defineProperties(o, descriptors) {
        var symbols = $getOwnPropertySymbols(descriptors);
        if (symbols.length) {
          keys(descriptors)
            .concat(symbols)
            .forEach(function(uid) {
              if (propertyIsEnumerable.call(descriptors, uid)) {
                $defineProperty(o, uid, descriptors[uid]);
              }
            });
        } else {
          $defineProperties(o, descriptors);
        }
        return o;
      };
      defineProperty(Object, DPies, descriptor);

      descriptor.value = propertyIsEnumerable;
      defineProperty(ObjectProto, PIE, descriptor);

      descriptor.value = Symbol;
      defineProperty(global, 'Symbol', descriptor);

      // defining `Symbol.for(key)`
      descriptor.value = function(key) {
        var uid = prefix.concat(prefix, key, random);
        return uid in ObjectProto ? source[uid] : setAndGetSymbol(uid);
      };
      defineProperty(Symbol, 'for', descriptor);

      // defining `Symbol.keyFor(symbol)`
      descriptor.value = function(symbol) {
        if (onlyNonSymbols(symbol))
          throw new TypeError(symbol + ' is not a symbol');
        return hOP.call(source, symbol)
          ? symbol.slice(prefixLength * 2, -random.length)
          : void 0;
      };
      defineProperty(Symbol, 'keyFor', descriptor);

      descriptor.value = function getOwnPropertyDescriptor(o, key) {
        var descriptor = gOPD(o, key);
        if (descriptor && onlySymbols(key)) {
          descriptor.enumerable = propertyIsEnumerable.call(o, key);
        }
        return descriptor;
      };
      defineProperty(Object, GOPD, descriptor);

      descriptor.value = function(proto, descriptors) {
        return arguments.length === 1 || typeof descriptors === 'undefined'
          ? create(proto)
          : createWithSymbols(proto, descriptors);
      };
      defineProperty(Object, 'create', descriptor);

      var strictModeSupported =
        function() {
          'use strict';
          return this;
        }.call(null) === null;
      if (strictModeSupported) {
        descriptor.value = function() {
          var str = toString.call(this);
          return str === '[object String]' && onlySymbols(this)
            ? '[object Symbol]'
            : str;
        };
      } else {
        descriptor.value = function() {
          // https://github.com/Financial-Times/polyfill-library/issues/164#issuecomment-486965300
          // Polyfill.io this code is here for the situation where a browser does not
          // support strict mode and is executing `Object.prototype.toString.call(null)`.
          // This code ensures that we return the correct result in that situation however,
          // this code also introduces a bug where it will return the incorrect result for
          // `Object.prototype.toString.call(window)`. We can't have the correct result for
          // both `window` and `null`, so we have opted for `null` as we believe this is the more
          // common situation.
          if (this === window) {
            return '[object Null]';
          }

          var str = toString.call(this);
          return str === '[object String]' && onlySymbols(this)
            ? '[object Symbol]'
            : str;
        };
      }
      defineProperty(ObjectProto, 'toString', descriptor);

      setDescriptor = function(o, key, descriptor) {
        var protoDescriptor = gOPD(ObjectProto, key);
        delete ObjectProto[key];
        defineProperty(o, key, descriptor);
        if (o !== ObjectProto) {
          defineProperty(ObjectProto, key, protoDescriptor);
        }
      };
    })(Object, 'getOwnPropertySymbols', this);
  }

  if (!('ownKeys' in Reflect)) {
    // Reflect.ownKeys
    /* global CreateMethodProperty, Reflect, Type */
    // 26.1.10 Reflect.ownKeys ( target )
    CreateMethodProperty(Reflect, 'ownKeys', function ownKeys(target) {
      // 1. If Type(target) is not Object, throw a TypeError exception.
      if (Type(target) !== 'object') {
        throw new TypeError(
          Object.prototype.toString.call(target) + ' is not an Object'
        );
      }
      // polyfill-library - These steps are taken care of by Object.getOwnPropertyNames.
      // 2. Let keys be ? target.[[OwnPropertyKeys]]().
      // 3. Return CreateArrayFromList(keys).
      return Object.getOwnPropertyNames(target).concat(
        Object.getOwnPropertySymbols(target)
      );
    });
  }

  if (
    !(
      'getOwnPropertyDescriptor' in Object &&
      'function' == typeof Object.getOwnPropertyDescriptor &&
      (function() {
        try {
          var t = {};
          return (
            (t.test = 0), 0 === Object.getOwnPropertyDescriptors(t).test.value
          );
        } catch (e) {
          return !1;
        }
      })()
    )
  ) {
    // Object.getOwnPropertyDescriptors
    /* global CreateMethodProperty, Reflect, ToObject, CreateDataProperty */

    // 19.1.2.9. Object.getOwnPropertyDescriptors ( O )
    CreateMethodProperty(
      Object,
      'getOwnPropertyDescriptors',
      function getOwnPropertyDescriptors(O) {
        // 1. Let obj be ? ToObject(O).
        var obj = ToObject(O);
        // 2. Let ownKeys be ? obj.[[OwnPropertyKeys]]().
        var ownKeys = Reflect.ownKeys(obj);
        // 3. Let descriptors be ! ObjectCreate(%ObjectPrototype%).
        var descriptors = {};
        // 4. For each element key of ownKeys in List order, do
        var length = ownKeys.length;
        for (var i = 0; i < length; i++) {
          var key = ownKeys[i];
          // a. Let desc be ? obj.[[GetOwnProperty]](key).
          // b. Let descriptor be ! FromPropertyDescriptor(desc).
          var descriptor = Object.getOwnPropertyDescriptor(O, key);
          // c. If descriptor is not undefined, perform ! CreateDataProperty(descriptors, key, descriptor).
          if (descriptor !== undefined) {
            CreateDataProperty(descriptors, key, descriptor);
          }
        }
        // 5. Return descriptors.
        return descriptors;
      }
    );
  }
}.call(
  ('object' === typeof window && window) ||
    ('object' === typeof self && self) ||
    ('object' === typeof global && global) ||
    {}
));

/* jshint ignore:end */
/* eslint-enable */
