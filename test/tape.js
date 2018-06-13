(function(f) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = f();
  } else if (typeof define === 'function' && define.amd) {
    define([], f);
  } else {
    var g;
    if (typeof window !== 'undefined') {
      g = window;
    } else if (typeof global !== 'undefined') {
      g = global;
    } else if (typeof self !== 'undefined') {
      g = self;
    } else {
      g = this;
    }
    g.test = f();
  }
})(function() {
  var define, module, exports;
  return (function e(t, n, r) {
    function s(o, u) {
      if (!n[o]) {
        if (!t[o]) {
          var a = typeof require == 'function' && require;
          if (!u && a) return a(o, !0);
          if (i) return i(o, !0);
          var f = new Error("Cannot find module '" + o + "'");
          throw ((f.code = 'MODULE_NOT_FOUND'), f);
        }
        var l = (n[o] = { exports: {} });
        t[o][0].call(
          l.exports,
          function(e) {
            var n = t[o][1][e];
            return s(n ? n : e);
          },
          l,
          l.exports,
          e,
          t,
          n,
          r
        );
      }
      return n[o].exports;
    }
    var i = typeof require == 'function' && require;
    for (var o = 0; o < r.length; o++) s(r[o]);
    return s;
  })(
    {
      1: [
        function(require, module, exports) {
          var pSlice = Array.prototype.slice;
          var objectKeys = require('./lib/keys.js');
          var isArguments = require('./lib/is_arguments.js');
          var deepEqual = (module.exports = function(actual, expected, opts) {
            if (!opts) opts = {};
            if (actual === expected) {
              return true;
            } else if (actual instanceof Date && expected instanceof Date) {
              return actual.getTime() === expected.getTime();
            } else if (
              !actual ||
              !expected ||
              (typeof actual != 'object' && typeof expected != 'object')
            ) {
              return opts.strict ? actual === expected : actual == expected;
            } else {
              return objEquiv(actual, expected, opts);
            }
          });
          function isUndefinedOrNull(value) {
            return value === null || value === undefined;
          }
          function isBuffer(x) {
            if (!x || typeof x !== 'object' || typeof x.length !== 'number')
              return false;
            if (typeof x.copy !== 'function' || typeof x.slice !== 'function') {
              return false;
            }
            if (x.length > 0 && typeof x[0] !== 'number') return false;
            return true;
          }
          function objEquiv(a, b, opts) {
            var i, key;
            if (isUndefinedOrNull(a) || isUndefinedOrNull(b)) return false;
            if (a.prototype !== b.prototype) return false;
            if (isArguments(a)) {
              if (!isArguments(b)) {
                return false;
              }
              a = pSlice.call(a);
              b = pSlice.call(b);
              return deepEqual(a, b, opts);
            }
            if (isBuffer(a)) {
              if (!isBuffer(b)) {
                return false;
              }
              if (a.length !== b.length) return false;
              for (i = 0; i < a.length; i++) {
                if (a[i] !== b[i]) return false;
              }
              return true;
            }
            try {
              var ka = objectKeys(a),
                kb = objectKeys(b);
            } catch (e) {
              return false;
            }
            if (ka.length != kb.length) return false;
            ka.sort();
            kb.sort();
            for (i = ka.length - 1; i >= 0; i--) {
              if (ka[i] != kb[i]) return false;
            }
            for (i = ka.length - 1; i >= 0; i--) {
              key = ka[i];
              if (!deepEqual(a[key], b[key], opts)) return false;
            }
            return typeof a === typeof b;
          }
        },
        { './lib/is_arguments.js': 2, './lib/keys.js': 3 }
      ],
      2: [
        function(require, module, exports) {
          var supportsArgumentsClass =
            (function() {
              return Object.prototype.toString.call(arguments);
            })() == '[object Arguments]';
          exports = module.exports = supportsArgumentsClass
            ? supported
            : unsupported;
          exports.supported = supported;
          function supported(object) {
            return (
              Object.prototype.toString.call(object) == '[object Arguments]'
            );
          }
          exports.unsupported = unsupported;
          function unsupported(object) {
            return (
              (object &&
                typeof object == 'object' &&
                typeof object.length == 'number' &&
                Object.prototype.hasOwnProperty.call(object, 'callee') &&
                !Object.prototype.propertyIsEnumerable.call(
                  object,
                  'callee'
                )) ||
              false
            );
          }
        },
        {}
      ],
      3: [
        function(require, module, exports) {
          exports = module.exports =
            typeof Object.keys === 'function' ? Object.keys : shim;
          exports.shim = shim;
          function shim(obj) {
            var keys = [];
            for (var key in obj) keys.push(key);
            return keys;
          }
        },
        {}
      ],
      4: [
        function(require, module, exports) {
          'use strict';
          var keys = require('object-keys');
          var foreach = require('foreach');
          var hasSymbols =
            typeof Symbol === 'function' && typeof Symbol() === 'symbol';
          var toStr = Object.prototype.toString;
          var isFunction = function(fn) {
            return (
              typeof fn === 'function' && toStr.call(fn) === '[object Function]'
            );
          };
          var arePropertyDescriptorsSupported = function() {
            var obj = {};
            try {
              Object.defineProperty(obj, 'x', {
                enumerable: false,
                value: obj
              });
              for (var _ in obj) {
                return false;
              }
              return obj.x === obj;
            } catch (e) {
              return false;
            }
          };
          var supportsDescriptors =
            Object.defineProperty && arePropertyDescriptorsSupported();
          var defineProperty = function(object, name, value, predicate) {
            if (name in object && (!isFunction(predicate) || !predicate())) {
              return;
            }
            if (supportsDescriptors) {
              Object.defineProperty(object, name, {
                configurable: true,
                enumerable: false,
                value: value,
                writable: true
              });
            } else {
              object[name] = value;
            }
          };
          var defineProperties = function(object, map) {
            var predicates = arguments.length > 2 ? arguments[2] : {};
            var props = keys(map);
            if (hasSymbols) {
              props = props.concat(Object.getOwnPropertySymbols(map));
            }
            foreach(props, function(name) {
              defineProperty(object, name, map[name], predicates[name]);
            });
          };
          defineProperties.supportsDescriptors = !!supportsDescriptors;
          module.exports = defineProperties;
        },
        { foreach: 14, 'object-keys': 22 }
      ],
      5: [
        function(require, module, exports) {
          module.exports = function() {
            for (var i = 0; i < arguments.length; i++) {
              if (arguments[i] !== undefined) return arguments[i];
            }
          };
        },
        {}
      ],
      6: [
        function(require, module, exports) {
          'use strict';
          var $isNaN = require('./helpers/isNaN');
          var $isFinite = require('./helpers/isFinite');
          var sign = require('./helpers/sign');
          var mod = require('./helpers/mod');
          var IsCallable = require('is-callable');
          var toPrimitive = require('es-to-primitive/es5');
          var has = require('has');
          var ES5 = {
            ToPrimitive: toPrimitive,
            ToBoolean: function ToBoolean(value) {
              return !!value;
            },
            ToNumber: function ToNumber(value) {
              return Number(value);
            },
            ToInteger: function ToInteger(value) {
              var number = this.ToNumber(value);
              if ($isNaN(number)) {
                return 0;
              }
              if (number === 0 || !$isFinite(number)) {
                return number;
              }
              return sign(number) * Math.floor(Math.abs(number));
            },
            ToInt32: function ToInt32(x) {
              return this.ToNumber(x) >> 0;
            },
            ToUint32: function ToUint32(x) {
              return this.ToNumber(x) >>> 0;
            },
            ToUint16: function ToUint16(value) {
              var number = this.ToNumber(value);
              if ($isNaN(number) || number === 0 || !$isFinite(number)) {
                return 0;
              }
              var posInt = sign(number) * Math.floor(Math.abs(number));
              return mod(posInt, 65536);
            },
            ToString: function ToString(value) {
              return String(value);
            },
            ToObject: function ToObject(value) {
              this.CheckObjectCoercible(value);
              return Object(value);
            },
            CheckObjectCoercible: function CheckObjectCoercible(
              value,
              optMessage
            ) {
              if (value == null) {
                throw new TypeError(
                  optMessage || 'Cannot call method on ' + value
                );
              }
              return value;
            },
            IsCallable: IsCallable,
            SameValue: function SameValue(x, y) {
              if (x === y) {
                if (x === 0) {
                  return 1 / x === 1 / y;
                }
                return true;
              }
              return $isNaN(x) && $isNaN(y);
            },
            Type: function Type(x) {
              if (x === null) {
                return 'Null';
              }
              if (typeof x === 'undefined') {
                return 'Undefined';
              }
              if (typeof x === 'function' || typeof x === 'object') {
                return 'Object';
              }
              if (typeof x === 'number') {
                return 'Number';
              }
              if (typeof x === 'boolean') {
                return 'Boolean';
              }
              if (typeof x === 'string') {
                return 'String';
              }
            },
            IsPropertyDescriptor: function IsPropertyDescriptor(Desc) {
              if (this.Type(Desc) !== 'Object') {
                return false;
              }
              var allowed = {
                '[[Configurable]]': true,
                '[[Enumerable]]': true,
                '[[Get]]': true,
                '[[Set]]': true,
                '[[Value]]': true,
                '[[Writable]]': true
              };
              for (var key in Desc) {
                if (has(Desc, key) && !allowed[key]) {
                  return false;
                }
              }
              var isData = has(Desc, '[[Value]]');
              var IsAccessor = has(Desc, '[[Get]]') || has(Desc, '[[Set]]');
              if (isData && IsAccessor) {
                throw new TypeError(
                  'Property Descriptors may not be both accessor and data descriptors'
                );
              }
              return true;
            },
            IsAccessorDescriptor: function IsAccessorDescriptor(Desc) {
              if (typeof Desc === 'undefined') {
                return false;
              }
              if (!this.IsPropertyDescriptor(Desc)) {
                throw new TypeError('Desc must be a Property Descriptor');
              }
              if (!has(Desc, '[[Get]]') && !has(Desc, '[[Set]]')) {
                return false;
              }
              return true;
            },
            IsDataDescriptor: function IsDataDescriptor(Desc) {
              if (typeof Desc === 'undefined') {
                return false;
              }
              if (!this.IsPropertyDescriptor(Desc)) {
                throw new TypeError('Desc must be a Property Descriptor');
              }
              if (!has(Desc, '[[Value]]') && !has(Desc, '[[Writable]]')) {
                return false;
              }
              return true;
            },
            IsGenericDescriptor: function IsGenericDescriptor(Desc) {
              if (typeof Desc === 'undefined') {
                return false;
              }
              if (!this.IsPropertyDescriptor(Desc)) {
                throw new TypeError('Desc must be a Property Descriptor');
              }
              if (
                !this.IsAccessorDescriptor(Desc) &&
                !this.IsDataDescriptor(Desc)
              ) {
                return true;
              }
              return false;
            },
            FromPropertyDescriptor: function FromPropertyDescriptor(Desc) {
              if (typeof Desc === 'undefined') {
                return Desc;
              }
              if (!this.IsPropertyDescriptor(Desc)) {
                throw new TypeError('Desc must be a Property Descriptor');
              }
              if (this.IsDataDescriptor(Desc)) {
                return {
                  value: Desc['[[Value]]'],
                  writable: !!Desc['[[Writable]]'],
                  enumerable: !!Desc['[[Enumerable]]'],
                  configurable: !!Desc['[[Configurable]]']
                };
              } else if (this.IsAccessorDescriptor(Desc)) {
                return {
                  get: Desc['[[Get]]'],
                  set: Desc['[[Set]]'],
                  enumerable: !!Desc['[[Enumerable]]'],
                  configurable: !!Desc['[[Configurable]]']
                };
              } else {
                throw new TypeError(
                  'FromPropertyDescriptor must be called with a fully populated Property Descriptor'
                );
              }
            },
            ToPropertyDescriptor: function ToPropertyDescriptor(Obj) {
              if (this.Type(Obj) !== 'Object') {
                throw new TypeError('ToPropertyDescriptor requires an object');
              }
              var desc = {};
              if (has(Obj, 'enumerable')) {
                desc['[[Enumerable]]'] = this.ToBoolean(Obj.enumerable);
              }
              if (has(Obj, 'configurable')) {
                desc['[[Configurable]]'] = this.ToBoolean(Obj.configurable);
              }
              if (has(Obj, 'value')) {
                desc['[[Value]]'] = Obj.value;
              }
              if (has(Obj, 'writable')) {
                desc['[[Writable]]'] = this.ToBoolean(Obj.writable);
              }
              if (has(Obj, 'get')) {
                var getter = Obj.get;
                if (typeof getter !== 'undefined' && !this.IsCallable(getter)) {
                  throw new TypeError('getter must be a function');
                }
                desc['[[Get]]'] = getter;
              }
              if (has(Obj, 'set')) {
                var setter = Obj.set;
                if (typeof setter !== 'undefined' && !this.IsCallable(setter)) {
                  throw new TypeError('setter must be a function');
                }
                desc['[[Set]]'] = setter;
              }
              if (
                (has(desc, '[[Get]]') || has(desc, '[[Set]]')) &&
                (has(desc, '[[Value]]') || has(desc, '[[Writable]]'))
              ) {
                throw new TypeError(
                  'Invalid property descriptor. Cannot both specify accessors and a value or writable attribute'
                );
              }
              return desc;
            }
          };
          module.exports = ES5;
        },
        {
          './helpers/isFinite': 7,
          './helpers/isNaN': 8,
          './helpers/mod': 9,
          './helpers/sign': 10,
          'es-to-primitive/es5': 11,
          has: 17,
          'is-callable': 19
        }
      ],
      7: [
        function(require, module, exports) {
          var $isNaN =
            Number.isNaN ||
            function(a) {
              return a !== a;
            };
          module.exports =
            Number.isFinite ||
            function(x) {
              return (
                typeof x === 'number' &&
                !$isNaN(x) &&
                x !== Infinity &&
                x !== -Infinity
              );
            };
        },
        {}
      ],
      8: [
        function(require, module, exports) {
          module.exports =
            Number.isNaN ||
            function isNaN(a) {
              return a !== a;
            };
        },
        {}
      ],
      9: [
        function(require, module, exports) {
          module.exports = function mod(number, modulo) {
            var remain = number % modulo;
            return Math.floor(remain >= 0 ? remain : remain + modulo);
          };
        },
        {}
      ],
      10: [
        function(require, module, exports) {
          module.exports = function sign(number) {
            return number >= 0 ? 1 : -1;
          };
        },
        {}
      ],
      11: [
        function(require, module, exports) {
          'use strict';
          var toStr = Object.prototype.toString;
          var isPrimitive = require('./helpers/isPrimitive');
          var isCallable = require('is-callable');
          var ES5internalSlots = {
            '[[DefaultValue]]': function(O, hint) {
              var actualHint =
                hint || (toStr.call(O) === '[object Date]' ? String : Number);
              if (actualHint === String || actualHint === Number) {
                var methods =
                  actualHint === String
                    ? ['toString', 'valueOf']
                    : ['valueOf', 'toString'];
                var value, i;
                for (i = 0; i < methods.length; ++i) {
                  if (isCallable(O[methods[i]])) {
                    value = O[methods[i]]();
                    if (isPrimitive(value)) {
                      return value;
                    }
                  }
                }
                throw new TypeError('No default value');
              }
              throw new TypeError('invalid [[DefaultValue]] hint supplied');
            }
          };
          module.exports = function ToPrimitive(input, PreferredType) {
            if (isPrimitive(input)) {
              return input;
            }
            return ES5internalSlots['[[DefaultValue]]'](input, PreferredType);
          };
        },
        { './helpers/isPrimitive': 12, 'is-callable': 19 }
      ],
      12: [
        function(require, module, exports) {
          module.exports = function isPrimitive(value) {
            return (
              value === null ||
              (typeof value !== 'function' && typeof value !== 'object')
            );
          };
        },
        {}
      ],
      13: [
        function(require, module, exports) {
          var isFunction = require('is-function');
          module.exports = forEach;
          var toString = Object.prototype.toString;
          var hasOwnProperty = Object.prototype.hasOwnProperty;
          function forEach(list, iterator, context) {
            if (!isFunction(iterator)) {
              throw new TypeError('iterator must be a function');
            }
            if (arguments.length < 3) {
              context = this;
            }
            if (toString.call(list) === '[object Array]')
              forEachArray(list, iterator, context);
            else if (typeof list === 'string')
              forEachString(list, iterator, context);
            else forEachObject(list, iterator, context);
          }
          function forEachArray(array, iterator, context) {
            for (var i = 0, len = array.length; i < len; i++) {
              if (hasOwnProperty.call(array, i)) {
                iterator.call(context, array[i], i, array);
              }
            }
          }
          function forEachString(string, iterator, context) {
            for (var i = 0, len = string.length; i < len; i++) {
              iterator.call(context, string.charAt(i), i, string);
            }
          }
          function forEachObject(object, iterator, context) {
            for (var k in object) {
              if (hasOwnProperty.call(object, k)) {
                iterator.call(context, object[k], k, object);
              }
            }
          }
        },
        { 'is-function': 20 }
      ],
      14: [
        function(require, module, exports) {
          var hasOwn = Object.prototype.hasOwnProperty;
          var toString = Object.prototype.toString;
          module.exports = function forEach(obj, fn, ctx) {
            if (toString.call(fn) !== '[object Function]') {
              throw new TypeError('iterator must be a function');
            }
            var l = obj.length;
            if (l === +l) {
              for (var i = 0; i < l; i++) {
                fn.call(ctx, obj[i], i, obj);
              }
            } else {
              for (var k in obj) {
                if (hasOwn.call(obj, k)) {
                  fn.call(ctx, obj[k], k, obj);
                }
              }
            }
          };
        },
        {}
      ],
      15: [
        function(require, module, exports) {
          'use strict';
          var ERROR_MESSAGE = 'Function.prototype.bind called on incompatible ';
          var slice = Array.prototype.slice;
          var toStr = Object.prototype.toString;
          var funcType = '[object Function]';
          module.exports = function bind(that) {
            var target = this;
            if (
              typeof target !== 'function' ||
              toStr.call(target) !== funcType
            ) {
              throw new TypeError(ERROR_MESSAGE + target);
            }
            var args = slice.call(arguments, 1);
            var bound;
            var binder = function() {
              if (this instanceof bound) {
                var result = target.apply(
                  this,
                  args.concat(slice.call(arguments))
                );
                if (Object(result) === result) {
                  return result;
                }
                return this;
              } else {
                return target.apply(that, args.concat(slice.call(arguments)));
              }
            };
            var boundLength = Math.max(0, target.length - args.length);
            var boundArgs = [];
            for (var i = 0; i < boundLength; i++) {
              boundArgs.push('$' + i);
            }
            bound = Function(
              'binder',
              'return function (' +
                boundArgs.join(',') +
                '){ return binder.apply(this,arguments); }'
            )(binder);
            if (target.prototype) {
              var Empty = function Empty() {};
              Empty.prototype = target.prototype;
              bound.prototype = new Empty();
              Empty.prototype = null;
            }
            return bound;
          };
        },
        {}
      ],
      16: [
        function(require, module, exports) {
          'use strict';
          var implementation = require('./implementation');
          module.exports = Function.prototype.bind || implementation;
        },
        { './implementation': 15 }
      ],
      17: [
        function(require, module, exports) {
          var bind = require('function-bind');
          module.exports = bind.call(
            Function.call,
            Object.prototype.hasOwnProperty
          );
        },
        { 'function-bind': 16 }
      ],
      18: [
        function(require, module, exports) {
          if (typeof Object.create === 'function') {
            module.exports = function inherits(ctor, superCtor) {
              ctor.super_ = superCtor;
              ctor.prototype = Object.create(superCtor.prototype, {
                constructor: {
                  value: ctor,
                  enumerable: false,
                  writable: true,
                  configurable: true
                }
              });
            };
          } else {
            module.exports = function inherits(ctor, superCtor) {
              ctor.super_ = superCtor;
              var TempCtor = function() {};
              TempCtor.prototype = superCtor.prototype;
              ctor.prototype = new TempCtor();
              ctor.prototype.constructor = ctor;
            };
          }
        },
        {}
      ],
      19: [
        function(require, module, exports) {
          'use strict';
          var fnToStr = Function.prototype.toString;
          var constructorRegex = /^\s*class /;
          var isES6ClassFn = function isES6ClassFn(value) {
            try {
              var fnStr = fnToStr.call(value);
              var singleStripped = fnStr.replace(/\/\/.*\n/g, '');
              var multiStripped = singleStripped.replace(
                /\/\*[.\s\S]*\*\//g,
                ''
              );
              var spaceStripped = multiStripped
                .replace(/\n/gm, ' ')
                .replace(/ {2}/g, ' ');
              return constructorRegex.test(spaceStripped);
            } catch (e) {
              return false;
            }
          };
          var tryFunctionObject = function tryFunctionObject(value) {
            try {
              if (isES6ClassFn(value)) {
                return false;
              }
              fnToStr.call(value);
              return true;
            } catch (e) {
              return false;
            }
          };
          var toStr = Object.prototype.toString;
          var fnClass = '[object Function]';
          var genClass = '[object GeneratorFunction]';
          var hasToStringTag =
            typeof Symbol === 'function' &&
            typeof Symbol.toStringTag === 'symbol';
          module.exports = function isCallable(value) {
            if (!value) {
              return false;
            }
            if (typeof value !== 'function' && typeof value !== 'object') {
              return false;
            }
            if (hasToStringTag) {
              return tryFunctionObject(value);
            }
            if (isES6ClassFn(value)) {
              return false;
            }
            var strClass = toStr.call(value);
            return strClass === fnClass || strClass === genClass;
          };
        },
        {}
      ],
      20: [
        function(require, module, exports) {
          module.exports = isFunction;
          var toString = Object.prototype.toString;
          function isFunction(fn) {
            var string = toString.call(fn);
            return (
              string === '[object Function]' ||
              (typeof fn === 'function' && string !== '[object RegExp]') ||
              (typeof window !== 'undefined' &&
                (fn === window.setTimeout ||
                  fn === window.alert ||
                  fn === window.confirm ||
                  fn === window.prompt))
            );
          }
        },
        {}
      ],
      21: [
        function(require, module, exports) {
          var hasMap = typeof Map === 'function' && Map.prototype;
          var mapSizeDescriptor =
            Object.getOwnPropertyDescriptor && hasMap
              ? Object.getOwnPropertyDescriptor(Map.prototype, 'size')
              : null;
          var mapSize =
            hasMap &&
            mapSizeDescriptor &&
            typeof mapSizeDescriptor.get === 'function'
              ? mapSizeDescriptor.get
              : null;
          var mapForEach = hasMap && Map.prototype.forEach;
          var hasSet = typeof Set === 'function' && Set.prototype;
          var setSizeDescriptor =
            Object.getOwnPropertyDescriptor && hasSet
              ? Object.getOwnPropertyDescriptor(Set.prototype, 'size')
              : null;
          var setSize =
            hasSet &&
            setSizeDescriptor &&
            typeof setSizeDescriptor.get === 'function'
              ? setSizeDescriptor.get
              : null;
          var setForEach = hasSet && Set.prototype.forEach;
          var booleanValueOf = Boolean.prototype.valueOf;
          var objectToString = Object.prototype.toString;
          var inspectCustom = require('./util.inspect').custom;
          var inspectSymbol =
            inspectCustom && isSymbol(inspectCustom) ? inspectCustom : null;
          module.exports = function inspect_(obj, opts, depth, seen) {
            if (!opts) opts = {};
            if (
              has(opts, 'quoteStyle') &&
              (opts.quoteStyle !== 'single' && opts.quoteStyle !== 'double')
            ) {
              throw new TypeError(
                'option "quoteStyle" must be "single" or "double"'
              );
            }
            if (typeof obj === 'undefined') {
              return 'undefined';
            }
            if (obj === null) {
              return 'null';
            }
            if (typeof obj === 'boolean') {
              return obj ? 'true' : 'false';
            }
            if (typeof obj === 'string') {
              return inspectString(obj, opts);
            }
            if (typeof obj === 'number') {
              if (obj === 0) {
                return Infinity / obj > 0 ? '0' : '-0';
              }
              return String(obj);
            }
            var maxDepth = typeof opts.depth === 'undefined' ? 5 : opts.depth;
            if (typeof depth === 'undefined') depth = 0;
            if (depth >= maxDepth && maxDepth > 0 && typeof obj === 'object') {
              return '[Object]';
            }
            if (typeof seen === 'undefined') seen = [];
            else if (indexOf(seen, obj) >= 0) {
              return '[Circular]';
            }
            function inspect(value, from) {
              if (from) {
                seen = seen.slice();
                seen.push(from);
              }
              return inspect_(value, opts, depth + 1, seen);
            }
            if (typeof obj === 'function') {
              var name = nameOf(obj);
              return '[Function' + (name ? ': ' + name : '') + ']';
            }
            if (isSymbol(obj)) {
              var symString = Symbol.prototype.toString.call(obj);
              return typeof obj === 'object' ? markBoxed(symString) : symString;
            }
            if (isElement(obj)) {
              var s = '<' + String(obj.nodeName).toLowerCase();
              var attrs = obj.attributes || [];
              for (var i = 0; i < attrs.length; i++) {
                s +=
                  ' ' +
                  attrs[i].name +
                  '=' +
                  wrapQuotes(quote(attrs[i].value), 'double', opts);
              }
              s += '>';
              if (obj.childNodes && obj.childNodes.length) s += '...';
              s += '</' + String(obj.nodeName).toLowerCase() + '>';
              return s;
            }
            if (isArray(obj)) {
              if (obj.length === 0) return '[]';
              return '[ ' + arrObjKeys(obj, inspect).join(', ') + ' ]';
            }
            if (isError(obj)) {
              var parts = arrObjKeys(obj, inspect);
              if (parts.length === 0) return '[' + String(obj) + ']';
              return '{ [' + String(obj) + '] ' + parts.join(', ') + ' }';
            }
            if (typeof obj === 'object') {
              if (inspectSymbol && typeof obj[inspectSymbol] === 'function') {
                return obj[inspectSymbol]();
              } else if (typeof obj.inspect === 'function') {
                return obj.inspect();
              }
            }
            if (isMap(obj)) {
              var parts = [];
              mapForEach.call(obj, function(value, key) {
                parts.push(inspect(key, obj) + ' => ' + inspect(value, obj));
              });
              return collectionOf('Map', mapSize.call(obj), parts);
            }
            if (isSet(obj)) {
              var parts = [];
              setForEach.call(obj, function(value) {
                parts.push(inspect(value, obj));
              });
              return collectionOf('Set', setSize.call(obj), parts);
            }
            if (isNumber(obj)) {
              return markBoxed(inspect(Number(obj)));
            }
            if (isBoolean(obj)) {
              return markBoxed(booleanValueOf.call(obj));
            }
            if (isString(obj)) {
              return markBoxed(inspect(String(obj)));
            }
            if (!isDate(obj) && !isRegExp(obj)) {
              var xs = arrObjKeys(obj, inspect);
              if (xs.length === 0) return '{}';
              return '{ ' + xs.join(', ') + ' }';
            }
            return String(obj);
          };
          function wrapQuotes(s, defaultStyle, opts) {
            var quoteChar =
              (opts.quoteStyle || defaultStyle) === 'double' ? '"' : "'";
            return quoteChar + s + quoteChar;
          }
          function quote(s) {
            return String(s).replace(/"/g, '&quot;');
          }
          function isArray(obj) {
            return toStr(obj) === '[object Array]';
          }
          function isDate(obj) {
            return toStr(obj) === '[object Date]';
          }
          function isRegExp(obj) {
            return toStr(obj) === '[object RegExp]';
          }
          function isError(obj) {
            return toStr(obj) === '[object Error]';
          }
          function isSymbol(obj) {
            return toStr(obj) === '[object Symbol]';
          }
          function isString(obj) {
            return toStr(obj) === '[object String]';
          }
          function isNumber(obj) {
            return toStr(obj) === '[object Number]';
          }
          function isBoolean(obj) {
            return toStr(obj) === '[object Boolean]';
          }
          var hasOwn =
            Object.prototype.hasOwnProperty ||
            function(key) {
              return key in this;
            };
          function has(obj, key) {
            return hasOwn.call(obj, key);
          }
          function toStr(obj) {
            return objectToString.call(obj);
          }
          function nameOf(f) {
            if (f.name) return f.name;
            var m = String(f).match(/^function\s*([\w$]+)/);
            if (m) return m[1];
          }
          function indexOf(xs, x) {
            if (xs.indexOf) return xs.indexOf(x);
            for (var i = 0, l = xs.length; i < l; i++) {
              if (xs[i] === x) return i;
            }
            return -1;
          }
          function isMap(x) {
            if (!mapSize) {
              return false;
            }
            try {
              mapSize.call(x);
              try {
                setSize.call(x);
              } catch (s) {
                return true;
              }
              return x instanceof Map;
            } catch (e) {}
            return false;
          }
          function isSet(x) {
            if (!setSize) {
              return false;
            }
            try {
              setSize.call(x);
              try {
                mapSize.call(x);
              } catch (m) {
                return true;
              }
              return x instanceof Set;
            } catch (e) {}
            return false;
          }
          function isElement(x) {
            if (!x || typeof x !== 'object') return false;
            if (
              typeof HTMLElement !== 'undefined' &&
              x instanceof HTMLElement
            ) {
              return true;
            }
            return (
              typeof x.nodeName === 'string' &&
              typeof x.getAttribute === 'function'
            );
          }
          function inspectString(str, opts) {
            var s = str
              .replace(/(['\\])/g, '\\$1')
              .replace(/[\x00-\x1f]/g, lowbyte);
            return wrapQuotes(s, 'single', opts);
          }
          function lowbyte(c) {
            var n = c.charCodeAt(0);
            var x = { 8: 'b', 9: 't', 10: 'n', 12: 'f', 13: 'r' }[n];
            if (x) return '\\' + x;
            return '\\x' + (n < 16 ? '0' : '') + n.toString(16);
          }
          function markBoxed(str) {
            return 'Object(' + str + ')';
          }
          function collectionOf(type, size, entries) {
            return type + ' (' + size + ') {' + entries.join(', ') + '}';
          }
          function arrObjKeys(obj, inspect) {
            var isArr = isArray(obj);
            var xs = [];
            if (isArr) {
              xs.length = obj.length;
              for (var i = 0; i < obj.length; i++) {
                xs[i] = has(obj, i) ? inspect(obj[i], obj) : '';
              }
            }
            for (var key in obj) {
              if (!has(obj, key)) continue;
              if (isArr && String(Number(key)) === key && key < obj.length)
                continue;
              if (/[^\w$]/.test(key)) {
                xs.push(inspect(key, obj) + ': ' + inspect(obj[key], obj));
              } else {
                xs.push(key + ': ' + inspect(obj[key], obj));
              }
            }
            return xs;
          }
        },
        { './util.inspect': 36 }
      ],
      22: [
        function(require, module, exports) {
          'use strict';
          var has = Object.prototype.hasOwnProperty;
          var toStr = Object.prototype.toString;
          var slice = Array.prototype.slice;
          var isArgs = require('./isArguments');
          var isEnumerable = Object.prototype.propertyIsEnumerable;
          var hasDontEnumBug = !isEnumerable.call(
            { toString: null },
            'toString'
          );
          var hasProtoEnumBug = isEnumerable.call(function() {}, 'prototype');
          var dontEnums = [
            'toString',
            'toLocaleString',
            'valueOf',
            'hasOwnProperty',
            'isPrototypeOf',
            'propertyIsEnumerable',
            'constructor'
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
            $window: true
          };
          var hasAutomationEqualityBug = (function() {
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
            if (typeof window === 'undefined' || !hasAutomationEqualityBug) {
              return equalsConstructorPrototype(o);
            }
            try {
              return equalsConstructorPrototype(o);
            } catch (e) {
              return false;
            }
          };
          var keysShim = function keys(object) {
            var isObject = object !== null && typeof object === 'object';
            var isFunction = toStr.call(object) === '[object Function]';
            var isArguments = isArgs(object);
            var isString = isObject && toStr.call(object) === '[object String]';
            var theKeys = [];
            if (!isObject && !isFunction && !isArguments) {
              throw new TypeError('Object.keys called on a non-object');
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
              var skipConstructor = equalsConstructorPrototypeIfNotBuggy(
                object
              );
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
          keysShim.shim = function shimObjectKeys() {
            if (Object.keys) {
              var keysWorksWithArguments = (function() {
                return (Object.keys(arguments) || '').length === 2;
              })(1, 2);
              if (!keysWorksWithArguments) {
                var originalKeys = Object.keys;
                Object.keys = function keys(object) {
                  if (isArgs(object)) {
                    return originalKeys(slice.call(object));
                  } else {
                    return originalKeys(object);
                  }
                };
              }
            } else {
              Object.keys = keysShim;
            }
            return Object.keys || keysShim;
          };
          module.exports = keysShim;
        },
        { './isArguments': 23 }
      ],
      23: [
        function(require, module, exports) {
          'use strict';
          var toStr = Object.prototype.toString;
          module.exports = function isArguments(value) {
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
          };
        },
        {}
      ],
      24: [
        function(require, module, exports) {
          (function(process) {
            var through = require('through');
            var nextTick =
              typeof setImmediate !== 'undefined'
                ? setImmediate
                : process.nextTick;
            module.exports = function(write, end) {
              var tr = through(write, end);
              tr.pause();
              var resume = tr.resume;
              var pause = tr.pause;
              var paused = false;
              tr.pause = function() {
                paused = true;
                return pause.apply(this, arguments);
              };
              tr.resume = function() {
                paused = false;
                return resume.apply(this, arguments);
              };
              nextTick(function() {
                if (!paused) tr.resume();
              });
              return tr;
            };
          }.call(this, require('_process')));
        },
        { _process: 46, through: 33 }
      ],
      25: [
        function(require, module, exports) {
          'use strict';
          var bind = require('function-bind');
          var ES = require('es-abstract/es5');
          var replace = bind.call(Function.call, String.prototype.replace);
          var leftWhitespace = /^[\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF]+/;
          var rightWhitespace = /[\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF]+$/;
          module.exports = function trim() {
            var S = ES.ToString(ES.CheckObjectCoercible(this));
            return replace(replace(S, leftWhitespace, ''), rightWhitespace, '');
          };
        },
        { 'es-abstract/es5': 6, 'function-bind': 16 }
      ],
      26: [
        function(require, module, exports) {
          'use strict';
          var bind = require('function-bind');
          var define = require('define-properties');
          var implementation = require('./implementation');
          var getPolyfill = require('./polyfill');
          var shim = require('./shim');
          var boundTrim = bind.call(Function.call, getPolyfill());
          define(boundTrim, {
            getPolyfill: getPolyfill,
            implementation: implementation,
            shim: shim
          });
          module.exports = boundTrim;
        },
        {
          './implementation': 25,
          './polyfill': 27,
          './shim': 28,
          'define-properties': 4,
          'function-bind': 16
        }
      ],
      27: [
        function(require, module, exports) {
          'use strict';
          var implementation = require('./implementation');
          var zeroWidthSpace = '​';
          module.exports = function getPolyfill() {
            if (
              String.prototype.trim &&
              zeroWidthSpace.trim() === zeroWidthSpace
            ) {
              return String.prototype.trim;
            }
            return implementation;
          };
        },
        { './implementation': 25 }
      ],
      28: [
        function(require, module, exports) {
          'use strict';
          var define = require('define-properties');
          var getPolyfill = require('./polyfill');
          module.exports = function shimStringTrim() {
            var polyfill = getPolyfill();
            define(String.prototype, { trim: polyfill }, {
              trim: function() {
                return String.prototype.trim !== polyfill;
              }
            });
            return polyfill;
          };
        },
        { './polyfill': 27, 'define-properties': 4 }
      ],
      29: [
        function(require, module, exports) {
          (function(process) {
            var defined = require('defined');
            var createDefaultStream = require('./lib/default_stream');
            var Test = require('./lib/test');
            var createResult = require('./lib/results');
            var through = require('through');
            var canEmitExit =
              typeof process !== 'undefined' &&
              process &&
              typeof process.on === 'function' &&
              process.browser !== true;
            var canExit =
              typeof process !== 'undefined' &&
              process &&
              typeof process.exit === 'function';
            var nextTick =
              typeof setImmediate !== 'undefined'
                ? setImmediate
                : process.nextTick;
            exports = module.exports = (function() {
              var harness;
              var lazyLoad = function() {
                return getHarness().apply(this, arguments);
              };
              lazyLoad.only = function() {
                return getHarness().only.apply(this, arguments);
              };
              lazyLoad.createStream = function(opts) {
                if (!opts) opts = {};
                if (!harness) {
                  var output = through();
                  getHarness({ stream: output, objectMode: opts.objectMode });
                  return output;
                }
                return harness.createStream(opts);
              };
              lazyLoad.onFinish = function() {
                return getHarness().onFinish.apply(this, arguments);
              };
              lazyLoad.onFailure = function() {
                return getHarness().onFailure.apply(this, arguments);
              };
              lazyLoad.getHarness = getHarness;
              return lazyLoad;
              function getHarness(opts) {
                if (!opts) opts = {};
                opts.autoclose = !canEmitExit;
                if (!harness) harness = createExitHarness(opts);
                return harness;
              }
            })();
            function createExitHarness(conf) {
              if (!conf) conf = {};
              var harness = createHarness({
                autoclose: defined(conf.autoclose, false)
              });
              var stream = harness.createStream({
                objectMode: conf.objectMode
              });
              var es = stream.pipe(conf.stream || createDefaultStream());
              if (canEmitExit) {
                es.on('error', function(err) {
                  harness._exitCode = 1;
                });
              }
              var ended = false;
              stream.on('end', function() {
                ended = true;
              });
              if (conf.exit === false) return harness;
              if (!canEmitExit || !canExit) return harness;
              var inErrorState = false;
              process.on('exit', function(code) {
                if (code !== 0) {
                  return;
                }
                if (!ended) {
                  var only = harness._results._only;
                  for (var i = 0; i < harness._tests.length; i++) {
                    var t = harness._tests[i];
                    if (only && t !== only) continue;
                    t._exit();
                  }
                }
                harness.close();
                process.exit(code || harness._exitCode);
              });
              return harness;
            }
            exports.createHarness = createHarness;
            exports.Test = Test;
            window.test = exports.test = exports;
            Object.prototype.toString = Array.prototype.toString = function() {
              return JSON.stringify(this);
            };
            exports.test.skip = Test.skip;
            var exitInterval;
            function createHarness(conf_) {
              if (!conf_) conf_ = {};
              var results = createResult();
              if (conf_.autoclose !== false) {
                results.once('done', function() {
                  results.close();
                });
              }
              var test = function(name, conf, cb) {
                var t = new Test(name, conf, cb);
                test._tests.push(t);
                (function inspectCode(st) {
                  st.on('test', function sub(st_) {
                    inspectCode(st_);
                  });
                  st.on('result', function(r) {
                    if (!r.ok && typeof r !== 'string') test._exitCode = 1;
                  });
                })(t);
                results.push(t);
                return t;
              };
              test._results = results;
              test._tests = [];
              test.createStream = function(opts) {
                return results.createStream(opts);
              };
              test.onFinish = function(cb) {
                results.on('done', cb);
              };
              test.onFailure = function(cb) {
                results.on('fail', cb);
              };
              var only = false;
              test.only = function() {
                if (only) throw new Error('there can only be one only test');
                only = true;
                var t = test.apply(null, arguments);
                results.only(t);
                return t;
              };
              test._exitCode = 0;
              test.close = function() {
                results.close();
              };
              return test;
            }
          }.call(this, require('_process')));
        },
        {
          './lib/default_stream': 30,
          './lib/results': 31,
          './lib/test': 32,
          _process: 46,
          defined: 5,
          through: 33
        }
      ],
      30: [
        function(require, module, exports) {
          (function(process) {
            var through = require('through');
            var fs = require('fs');
            module.exports = function() {
              var line = '';
              var stream = through(write, flush);
              return stream;
              function write(buf) {
                for (var i = 0; i < buf.length; i++) {
                  var c =
                    typeof buf === 'string'
                      ? buf.charAt(i)
                      : String.fromCharCode(buf[i]);
                  if (c === '\n') flush();
                  else line += c;
                }
              }
              function flush() {
                if (fs.writeSync && /^win/.test(process.platform)) {
                  try {
                    fs.writeSync(1, line + '\n');
                  } catch (e) {
                    stream.emit('error', e);
                  }
                } else {
                  try {
                    console.log(line);
                  } catch (e) {
                    stream.emit('error', e);
                  }
                }
                line = '';
              }
            };
          }.call(this, require('_process')));
        },
        { _process: 46, fs: 34, through: 33 }
      ],
      31: [
        function(require, module, exports) {
          (function(process) {
            var defined = require('defined');
            var EventEmitter = require('events').EventEmitter;
            var inherits = require('inherits');
            var through = require('through');
            var resumer = require('resumer');
            var inspect = require('object-inspect');
            var bind = require('function-bind');
            var has = require('has');
            var regexpTest = bind.call(Function.call, RegExp.prototype.test);
            var yamlIndicators = /\:|\-|\?/;
            var nextTick =
              typeof setImmediate !== 'undefined'
                ? setImmediate
                : process.nextTick;
            module.exports = Results;
            inherits(Results, EventEmitter);
            function Results() {
              if (!(this instanceof Results)) return new Results();
              this.count = 0;
              this.fail = 0;
              this.pass = 0;
              this._stream = through();
              this.tests = [];
              this._only = null;
            }
            Results.prototype.createStream = function(opts) {
              if (!opts) opts = {};
              var self = this;
              var output,
                testId = 0;
              if (opts.objectMode) {
                output = through();
                self.on('_push', function ontest(t, extra) {
                  if (!extra) extra = {};
                  var id = testId++;
                  t.once('prerun', function() {
                    var row = { type: 'test', name: t.name, id: id };
                    if (has(extra, 'parent')) {
                      row.parent = extra.parent;
                    }
                    output.queue(row);
                  });
                  t.on('test', function(st) {
                    ontest(st, { parent: id });
                  });
                  t.on('result', function(res) {
                    res.test = id;
                    res.type = 'assert';
                    output.queue(res);
                  });
                  t.on('end', function() {
                    output.queue({ type: 'end', test: id });
                  });
                });
                self.on('done', function() {
                  output.queue(null);
                });
              } else {
                output = resumer();
                output.queue('TAP version 13\n');
                self._stream.pipe(output);
              }
              nextTick(function next() {
                var t;
                while ((t = getNextTest(self))) {
                  t.run();
                  if (!t.ended)
                    return t.once('end', function() {
                      nextTick(next);
                    });
                }
                self.emit('done');
              });
              return output;
            };
            Results.prototype.push = function(t) {
              var self = this;
              self.tests.push(t);
              self._watch(t);
              self.emit('_push', t);
            };
            Results.prototype.only = function(t) {
              this._only = t;
            };
            Results.prototype._watch = function(t) {
              var self = this;
              var write = function(s) {
                self._stream.queue(s);
              };
              t.once('prerun', function() {
                write('# ' + t.name + '\n');
              });
              t.on('result', function(res) {
                if (typeof res === 'string') {
                  write('# ' + res + '\n');
                  return;
                }
                write(encodeResult(res, self.count + 1));
                self.count++;
                if (res.ok) self.pass++;
                else {
                  self.fail++;
                  self.emit('fail');
                }
              });
              t.on('test', function(st) {
                self._watch(st);
              });
            };
            Results.prototype.close = function() {
              var self = this;
              if (self.closed)
                self._stream.emit('error', new Error('ALREADY CLOSED'));
              self.closed = true;
              var write = function(s) {
                self._stream.queue(s);
              };
              write('\n1..' + self.count + '\n');
              write('# tests ' + self.count + '\n');
              write('# pass  ' + self.pass + '\n');
              if (self.fail) write('# fail  ' + self.fail + '\n');
              else write('\n# ok\n');
              self._stream.queue(null);
            };
            function encodeResult(res, count) {
              var output = '';
              output += (res.ok ? 'ok ' : 'not ok ') + count;
              output += res.name
                ? ' ' + res.name.toString().replace(/\s+/g, ' ')
                : '';
              if (res.skip) output += ' # SKIP';
              else if (res.todo) output += ' # TODO';
              output += '\n';
              if (res.ok) return output;
              var outer = '  ';
              var inner = outer + '  ';
              output += outer + '---\n';
              output += inner + 'operator: ' + res.operator + '\n';
              if (has(res, 'expected') || has(res, 'actual')) {
                var ex = inspect(res.expected, { depth: res.objectPrintDepth });
                var ac = inspect(res.actual, { depth: res.objectPrintDepth });
                if (
                  Math.max(ex.length, ac.length) > 65 ||
                  invalidYaml(ex) ||
                  invalidYaml(ac)
                ) {
                  output += inner + 'expected: |-\n' + inner + '  ' + ex + '\n';
                  output += inner + 'actual: |-\n' + inner + '  ' + ac + '\n';
                } else {
                  output += inner + 'expected: ' + ex + '\n';
                  output += inner + 'actual:   ' + ac + '\n';
                }
              }
              if (res.at) {
                output += inner + 'at: ' + res.at + '\n';
              }
              var actualStack =
                res.actual &&
                (typeof res.actual === 'object' ||
                  typeof res.actual === 'function')
                  ? res.actual.stack
                  : undefined;
              var errorStack = res.error && res.error.stack;
              var stack = defined(actualStack, errorStack);
              if (stack) {
                var lines = String(stack).split('\n');
                output += inner + 'stack: |-\n';
                for (var i = 0; i < lines.length; i++) {
                  output += inner + '  ' + lines[i] + '\n';
                }
              }
              output += outer + '...\n';
              return output;
            }
            function getNextTest(results) {
              if (!results._only) {
                return results.tests.shift();
              }
              do {
                var t = results.tests.shift();
                if (!t) continue;
                if (results._only === t) {
                  return t;
                }
              } while (results.tests.length !== 0);
            }
            function invalidYaml(str) {
              return regexpTest(yamlIndicators, str);
            }
          }.call(this, require('_process')));
        },
        {
          _process: 46,
          defined: 5,
          events: 39,
          'function-bind': 16,
          has: 17,
          inherits: 18,
          'object-inspect': 21,
          resumer: 24,
          through: 33
        }
      ],
      32: [
        function(require, module, exports) {
          (function(process, __dirname) {
            var deepEqual = require('deep-equal');
            var defined = require('defined');
            var path = require('path');
            var inherits = require('inherits');
            var EventEmitter = require('events').EventEmitter;
            var has = require('has');
            var trim = require('string.prototype.trim');
            var bind = require('function-bind');
            var forEach = require('for-each');
            var isEnumerable = bind.call(
              Function.call,
              Object.prototype.propertyIsEnumerable
            );
            var toLowerCase = bind.call(
              Function.call,
              String.prototype.toLowerCase
            );
            module.exports = Test;
            var nextTick =
              typeof setImmediate !== 'undefined'
                ? setImmediate
                : process.nextTick;
            var safeSetTimeout = setTimeout;
            var safeClearTimeout = clearTimeout;
            inherits(Test, EventEmitter);
            var getTestArgs = function(name_, opts_, cb_) {
              var name = '(anonymous)';
              var opts = {};
              var cb;
              for (var i = 0; i < arguments.length; i++) {
                var arg = arguments[i];
                var t = typeof arg;
                if (t === 'string') {
                  name = arg;
                } else if (t === 'object') {
                  opts = arg || opts;
                } else if (t === 'function') {
                  cb = arg;
                }
              }
              return { name: name, opts: opts, cb: cb };
            };
            function Test(name_, opts_, cb_) {
              if (!(this instanceof Test)) {
                return new Test(name_, opts_, cb_);
              }
              var args = getTestArgs(name_, opts_, cb_);
              this.readable = true;
              this.name = args.name || '(anonymous)';
              this.assertCount = 0;
              this.pendingCount = 0;
              this._skip = args.opts.skip || false;
              this._timeout = args.opts.timeout;
              this._plan = undefined;
              this._cb = args.cb;
              this._progeny = [];
              this._ok = true;
              var depthEnvVar = process.env.NODE_TAPE_OBJECT_PRINT_DEPTH;
              if (args.opts.objectPrintDepth) {
                this._objectPrintDepth = args.opts.objectPrintDepth;
              } else if (depthEnvVar) {
                if (toLowerCase(depthEnvVar) === 'infinity') {
                  this._objectPrintDepth = Infinity;
                } else {
                  this._objectPrintDepth = depthEnvVar;
                }
              } else {
                this._objectPrintDepth = 5;
              }
              for (var prop in this) {
                this[prop] = (function bind(self, val) {
                  if (typeof val === 'function') {
                    return function bound() {
                      return val.apply(self, arguments);
                    };
                  }
                  return val;
                })(this, this[prop]);
              }
            }
            Test.prototype.run = function() {
              if (this._skip) {
                this.comment('SKIP ' + this.name);
              }
              if (!this._cb || this._skip) {
                return this._end();
              }
              if (this._timeout != null) {
                this.timeoutAfter(this._timeout);
              }
              this.emit('prerun');
              var p;
              try {
                p = this._cb(this);
              } catch (e) {
                this.end(e);
              }
              if (p instanceof Promise) {
                p.then(() => this.end()).catch(e => this.end(e));
              }
              this.emit('run');
            };
            Test.prototype.test = function(name, opts, cb) {
              var self = this;
              var t = new Test(name, opts, cb);
              this._progeny.push(t);
              this.pendingCount++;
              this.emit('test', t);
              t.on('prerun', function() {
                self.assertCount++;
              });
              if (!self._pendingAsserts()) {
                nextTick(function() {
                  self._end();
                });
              }
              nextTick(function() {
                if (!self._plan && self.pendingCount == self._progeny.length) {
                  self._end();
                }
              });
            };
            Test.prototype.comment = function(msg) {
              var that = this;
              forEach(trim(msg).split('\n'), function(aMsg) {
                that.emit('result', trim(aMsg).replace(/^#\s*/, ''));
              });
            };
            Test.prototype.plan = function(n) {
              this._plan = n;
              this.emit('plan', n);
            };
            Test.prototype.timeoutAfter = function(ms) {
              if (!ms) throw new Error('timeoutAfter requires a timespan');
              var self = this;
              var timeout = safeSetTimeout(function() {
                self.fail('test timed out after ' + ms + 'ms');
                self.end();
              }, ms);
              this.once('end', function() {
                safeClearTimeout(timeout);
              });
            };
            Test.prototype.end = function(err) {
              var self = this;
              if (arguments.length >= 1 && !!err) {
                this.ifError(err);
              }
              if (this.calledEnd) {
                this.fail('.end() called twice');
              }
              this.calledEnd = true;
              this._end();
            };
            Test.prototype._end = function(err) {
              var self = this;
              if (this._progeny.length) {
                var t = this._progeny.shift();
                t.on('end', function() {
                  self._end();
                });
                t.run();
                return;
              }
              if (!this.ended) this.emit('end');
              var pendingAsserts = this._pendingAsserts();
              if (
                !this._planError &&
                this._plan !== undefined &&
                pendingAsserts
              ) {
                this._planError = true;
                this.fail('plan != count', {
                  expected: this._plan,
                  actual: this.assertCount
                });
              }
              this.ended = true;
            };
            Test.prototype._exit = function() {
              if (
                this._plan !== undefined &&
                !this._planError &&
                this.assertCount !== this._plan
              ) {
                this._planError = true;
                this.fail('plan != count', {
                  expected: this._plan,
                  actual: this.assertCount,
                  exiting: true
                });
              } else if (!this.ended) {
                this.fail('test exited without ending', { exiting: true });
              }
            };
            Test.prototype._pendingAsserts = function() {
              if (this._plan === undefined) {
                return 1;
              }
              return this._plan - (this._progeny.length + this.assertCount);
            };
            Test.prototype._assert = function assert(ok, opts) {
              var self = this;
              var extra = opts.extra || {};
              var res = {
                id: self.assertCount++,
                ok: Boolean(ok),
                skip: defined(extra.skip, opts.skip),
                name: defined(extra.message, opts.message, '(unnamed assert)'),
                operator: defined(extra.operator, opts.operator),
                objectPrintDepth: self._objectPrintDepth
              };
              if (has(opts, 'actual') || has(extra, 'actual')) {
                res.actual = defined(extra.actual, opts.actual);
              }
              if (has(opts, 'expected') || has(extra, 'expected')) {
                res.expected = defined(extra.expected, opts.expected);
              }
              this._ok = Boolean(this._ok && ok);
              if (!ok) {
                res.error = defined(
                  extra.error,
                  opts.error,
                  new Error(res.name)
                );
              }
              if (!ok) {
                var e = new Error('exception');
                var err = (e.stack || '').split('\n');
                var dir = __dirname + path.sep;
                for (var i = 0; i < err.length; i++) {
                  var re = /^(?:[^\s]*\s*\bat\s+)(?:(.*)\s+\()?((?:\/|[A-Z]:\\)[^:\)]+:(\d+)(?::(\d+))?)/;
                  var m = re.exec(err[i]);
                  if (!m) {
                    continue;
                  }
                  var callDescription = m[1] || '<anonymous>';
                  var filePath = m[2];
                  if (filePath.slice(0, dir.length) === dir) {
                    continue;
                  }
                  res.functionName = callDescription.split(/s+/)[0];
                  res.file = filePath;
                  res.line = Number(m[3]);
                  if (m[4]) res.column = Number(m[4]);
                  res.at = callDescription + ' (' + filePath + ')';
                  break;
                }
              }
              self.emit('result', res);
              var pendingAsserts = self._pendingAsserts();
              if (!pendingAsserts) {
                if (extra.exiting) {
                  self._end();
                } else {
                  nextTick(function() {
                    self._end();
                  });
                }
              }
              if (!self._planError && pendingAsserts < 0) {
                self._planError = true;
                self.fail('plan != count', {
                  expected: self._plan,
                  actual: self._plan - pendingAsserts
                });
              }
            };
            Test.prototype.fail = function(msg, extra) {
              this._assert(false, {
                message: msg,
                operator: 'fail',
                extra: extra
              });
            };
            Test.prototype.pass = function(msg, extra) {
              this._assert(true, {
                message: msg,
                operator: 'pass',
                extra: extra
              });
            };
            Test.prototype.skip = function(msg, extra) {
              this._assert(true, {
                message: msg,
                operator: 'skip',
                skip: true,
                extra: extra
              });
            };
            Test.prototype.ok = Test.prototype[
              'true'
            ] = Test.prototype.assert = function(value, msg, extra) {
              this._assert(value, {
                message: defined(msg, 'should be truthy'),
                operator: 'ok',
                expected: true,
                actual: value,
                extra: extra
              });
            };
            Test.prototype.notOk = Test.prototype[
              'false'
            ] = Test.prototype.notok = function(value, msg, extra) {
              this._assert(!value, {
                message: defined(msg, 'should be falsy'),
                operator: 'notOk',
                expected: false,
                actual: value,
                extra: extra
              });
            };
            Test.prototype.error = Test.prototype.ifError = Test.prototype.ifErr = Test.prototype.iferror = function(
              err,
              msg,
              extra
            ) {
              this._assert(!err, {
                message: defined(msg, String(err)),
                operator: 'error',
                actual: err,
                extra: extra
              });
            };
            Test.prototype.equal = Test.prototype.equals = Test.prototype.isEqual = Test.prototype.is = Test.prototype.strictEqual = Test.prototype.strictEquals = function(
              a,
              b,
              msg,
              extra
            ) {
              this._assert(a === b, {
                message: defined(msg, 'should be equal'),
                operator: 'equal',
                actual: a,
                expected: b,
                extra: extra
              });
            };
            Test.prototype.notEqual = Test.prototype.notEquals = Test.prototype.notStrictEqual = Test.prototype.notStrictEquals = Test.prototype.isNotEqual = Test.prototype.isNot = Test.prototype.not = Test.prototype.doesNotEqual = Test.prototype.isInequal = function(
              a,
              b,
              msg,
              extra
            ) {
              this._assert(a !== b, {
                message: defined(msg, 'should not be equal'),
                operator: 'notEqual',
                actual: a,
                notExpected: b,
                extra: extra
              });
            };
            Test.prototype.deepEqual = Test.prototype.deepEquals = Test.prototype.isEquivalent = Test.prototype.same = function(
              a,
              b,
              msg,
              extra
            ) {
              this._assert(deepEqual(a, b, { strict: true }), {
                message: defined(msg, 'should be equivalent'),
                operator: 'deepEqual',
                actual: a,
                expected: b,
                extra: extra
              });
            };
            Test.prototype.deepLooseEqual = Test.prototype.looseEqual = Test.prototype.looseEquals = function(
              a,
              b,
              msg,
              extra
            ) {
              this._assert(deepEqual(a, b), {
                message: defined(msg, 'should be equivalent'),
                operator: 'deepLooseEqual',
                actual: a,
                expected: b,
                extra: extra
              });
            };
            Test.prototype.notDeepEqual = Test.prototype.notEquivalent = Test.prototype.notDeeply = Test.prototype.notSame = Test.prototype.isNotDeepEqual = Test.prototype.isNotDeeply = Test.prototype.isNotEquivalent = Test.prototype.isInequivalent = function(
              a,
              b,
              msg,
              extra
            ) {
              this._assert(!deepEqual(a, b, { strict: true }), {
                message: defined(msg, 'should not be equivalent'),
                operator: 'notDeepEqual',
                actual: a,
                notExpected: b,
                extra: extra
              });
            };
            Test.prototype.notDeepLooseEqual = Test.prototype.notLooseEqual = Test.prototype.notLooseEquals = function(
              a,
              b,
              msg,
              extra
            ) {
              this._assert(!deepEqual(a, b), {
                message: defined(msg, 'should be equivalent'),
                operator: 'notDeepLooseEqual',
                actual: a,
                expected: b,
                extra: extra
              });
            };
            Test.prototype['throws'] = function(fn, expected, msg, extra) {
              if (typeof expected === 'string') {
                msg = expected;
                expected = undefined;
              }
              var caught = undefined;
              try {
                fn();
              } catch (err) {
                caught = { error: err };
                if (
                  err != null &&
                  (!isEnumerable(err, 'message') || !has(err, 'message'))
                ) {
                  var message = err.message;
                  delete err.message;
                  err.message = message;
                }
              }
              var passed = caught;
              if (expected instanceof RegExp) {
                passed = expected.test(caught && caught.error);
                expected = String(expected);
              }
              if (typeof expected === 'function' && caught) {
                passed = caught.error instanceof expected;
                caught.error = caught.error.constructor;
              }
              this._assert(typeof fn === 'function' && passed, {
                message: defined(msg, 'should throw'),
                operator: 'throws',
                actual: caught && caught.error,
                expected: expected,
                error: !passed && caught && caught.error,
                extra: extra
              });
            };
            Test.prototype.doesNotThrow = function(fn, expected, msg, extra) {
              if (typeof expected === 'string') {
                msg = expected;
                expected = undefined;
              }
              var caught = undefined;
              try {
                fn();
              } catch (err) {
                caught = { error: err };
              }
              this._assert(!caught, {
                message: defined(msg, 'should not throw'),
                operator: 'throws',
                actual: caught && caught.error,
                expected: expected,
                error: caught && caught.error,
                extra: extra
              });
            };
            Test.skip = function(name_, _opts, _cb) {
              var args = getTestArgs.apply(null, arguments);
              args.opts.skip = true;
              return Test(args.name, args.opts, args.cb);
            };
          }.call(this, require('_process'), '/lib'));
        },
        {
          _process: 46,
          'deep-equal': 1,
          defined: 5,
          events: 39,
          'for-each': 13,
          'function-bind': 16,
          has: 17,
          inherits: 18,
          path: 44,
          'string.prototype.trim': 26
        }
      ],
      33: [
        function(require, module, exports) {
          (function(process) {
            var Stream = require('stream');
            exports = module.exports = through;
            through.through = through;
            function through(write, end, opts) {
              write =
                write ||
                function(data) {
                  this.queue(data);
                };
              end =
                end ||
                function() {
                  this.queue(null);
                };
              var ended = false,
                destroyed = false,
                buffer = [],
                _ended = false;
              var stream = new Stream();
              stream.readable = stream.writable = true;
              stream.paused = false;
              stream.autoDestroy = !(opts && opts.autoDestroy === false);
              stream.write = function(data) {
                write.call(this, data);
                return !stream.paused;
              };
              function drain() {
                while (buffer.length && !stream.paused) {
                  var data = buffer.shift();
                  if (null === data) return stream.emit('end');
                  else stream.emit('data', data);
                }
              }
              stream.queue = stream.push = function(data) {
                if (_ended) return stream;
                if (data === null) _ended = true;
                buffer.push(data);
                drain();
                return stream;
              };
              stream.on('end', function() {
                stream.readable = false;
                if (!stream.writable && stream.autoDestroy)
                  process.nextTick(function() {
                    stream.destroy();
                  });
              });
              function _end() {
                stream.writable = false;
                end.call(stream);
                if (!stream.readable && stream.autoDestroy) stream.destroy();
              }
              stream.end = function(data) {
                if (ended) return;
                ended = true;
                if (arguments.length) stream.write(data);
                _end();
                return stream;
              };
              stream.destroy = function() {
                if (destroyed) return;
                destroyed = true;
                ended = true;
                buffer.length = 0;
                stream.writable = stream.readable = false;
                stream.emit('close');
                return stream;
              };
              stream.pause = function() {
                if (stream.paused) return;
                stream.paused = true;
                return stream;
              };
              stream.resume = function() {
                if (stream.paused) {
                  stream.paused = false;
                  stream.emit('resume');
                }
                drain();
                if (!stream.paused) stream.emit('drain');
                return stream;
              };
              return stream;
            }
          }.call(this, require('_process')));
        },
        { _process: 46, stream: 61 }
      ],
      34: [function(require, module, exports) {}, {}],
      35: [
        function(require, module, exports) {
          'use strict';
          exports.byteLength = byteLength;
          exports.toByteArray = toByteArray;
          exports.fromByteArray = fromByteArray;
          var lookup = [];
          var revLookup = [];
          var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array;
          var code =
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
          for (var i = 0, len = code.length; i < len; ++i) {
            lookup[i] = code[i];
            revLookup[code.charCodeAt(i)] = i;
          }
          revLookup['-'.charCodeAt(0)] = 62;
          revLookup['_'.charCodeAt(0)] = 63;
          function placeHoldersCount(b64) {
            var len = b64.length;
            if (len % 4 > 0) {
              throw new Error('Invalid string. Length must be a multiple of 4');
            }
            return b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0;
          }
          function byteLength(b64) {
            return (b64.length * 3) / 4 - placeHoldersCount(b64);
          }
          function toByteArray(b64) {
            var i, l, tmp, placeHolders, arr;
            var len = b64.length;
            placeHolders = placeHoldersCount(b64);
            arr = new Arr((len * 3) / 4 - placeHolders);
            l = placeHolders > 0 ? len - 4 : len;
            var L = 0;
            for (i = 0; i < l; i += 4) {
              tmp =
                (revLookup[b64.charCodeAt(i)] << 18) |
                (revLookup[b64.charCodeAt(i + 1)] << 12) |
                (revLookup[b64.charCodeAt(i + 2)] << 6) |
                revLookup[b64.charCodeAt(i + 3)];
              arr[L++] = (tmp >> 16) & 255;
              arr[L++] = (tmp >> 8) & 255;
              arr[L++] = tmp & 255;
            }
            if (placeHolders === 2) {
              tmp =
                (revLookup[b64.charCodeAt(i)] << 2) |
                (revLookup[b64.charCodeAt(i + 1)] >> 4);
              arr[L++] = tmp & 255;
            } else if (placeHolders === 1) {
              tmp =
                (revLookup[b64.charCodeAt(i)] << 10) |
                (revLookup[b64.charCodeAt(i + 1)] << 4) |
                (revLookup[b64.charCodeAt(i + 2)] >> 2);
              arr[L++] = (tmp >> 8) & 255;
              arr[L++] = tmp & 255;
            }
            return arr;
          }
          function tripletToBase64(num) {
            return (
              lookup[(num >> 18) & 63] +
              lookup[(num >> 12) & 63] +
              lookup[(num >> 6) & 63] +
              lookup[num & 63]
            );
          }
          function encodeChunk(uint8, start, end) {
            var tmp;
            var output = [];
            for (var i = start; i < end; i += 3) {
              tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + uint8[i + 2];
              output.push(tripletToBase64(tmp));
            }
            return output.join('');
          }
          function fromByteArray(uint8) {
            var tmp;
            var len = uint8.length;
            var extraBytes = len % 3;
            var output = '';
            var parts = [];
            var maxChunkLength = 16383;
            for (
              var i = 0, len2 = len - extraBytes;
              i < len2;
              i += maxChunkLength
            ) {
              parts.push(
                encodeChunk(
                  uint8,
                  i,
                  i + maxChunkLength > len2 ? len2 : i + maxChunkLength
                )
              );
            }
            if (extraBytes === 1) {
              tmp = uint8[len - 1];
              output += lookup[tmp >> 2];
              output += lookup[(tmp << 4) & 63];
              output += '==';
            } else if (extraBytes === 2) {
              tmp = (uint8[len - 2] << 8) + uint8[len - 1];
              output += lookup[tmp >> 10];
              output += lookup[(tmp >> 4) & 63];
              output += lookup[(tmp << 2) & 63];
              output += '=';
            }
            parts.push(output);
            return parts.join('');
          }
        },
        {}
      ],
      36: [
        function(require, module, exports) {
          arguments[4][34][0].apply(exports, arguments);
        },
        { dup: 34 }
      ],
      37: [
        function(require, module, exports) {
          'use strict';
          var base64 = require('base64-js');
          var ieee754 = require('ieee754');
          exports.Buffer = Buffer;
          exports.SlowBuffer = SlowBuffer;
          exports.INSPECT_MAX_BYTES = 50;
          var K_MAX_LENGTH = 2147483647;
          exports.kMaxLength = K_MAX_LENGTH;
          Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport();
          if (
            !Buffer.TYPED_ARRAY_SUPPORT &&
            typeof console !== 'undefined' &&
            typeof console.error === 'function'
          ) {
            console.error(
              'This browser lacks typed array (Uint8Array) support which is required by ' +
                '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
            );
          }
          function typedArraySupport() {
            try {
              var arr = new Uint8Array(1);
              arr.__proto__ = {
                __proto__: Uint8Array.prototype,
                foo: function() {
                  return 42;
                }
              };
              return arr.foo() === 42;
            } catch (e) {
              return false;
            }
          }
          function createBuffer(length) {
            if (length > K_MAX_LENGTH) {
              throw new RangeError('Invalid typed array length');
            }
            var buf = new Uint8Array(length);
            buf.__proto__ = Buffer.prototype;
            return buf;
          }
          function Buffer(arg, encodingOrOffset, length) {
            if (typeof arg === 'number') {
              if (typeof encodingOrOffset === 'string') {
                throw new Error(
                  'If encoding is specified then the first argument must be a string'
                );
              }
              return allocUnsafe(arg);
            }
            return from(arg, encodingOrOffset, length);
          }
          if (
            typeof Symbol !== 'undefined' &&
            Symbol.species &&
            Buffer[Symbol.species] === Buffer
          ) {
            Object.defineProperty(Buffer, Symbol.species, {
              value: null,
              configurable: true,
              enumerable: false,
              writable: false
            });
          }
          Buffer.poolSize = 8192;
          function from(value, encodingOrOffset, length) {
            if (typeof value === 'number') {
              throw new TypeError('"value" argument must not be a number');
            }
            if (isArrayBuffer(value)) {
              return fromArrayBuffer(value, encodingOrOffset, length);
            }
            if (typeof value === 'string') {
              return fromString(value, encodingOrOffset);
            }
            return fromObject(value);
          }
          Buffer.from = function(value, encodingOrOffset, length) {
            return from(value, encodingOrOffset, length);
          };
          Buffer.prototype.__proto__ = Uint8Array.prototype;
          Buffer.__proto__ = Uint8Array;
          function assertSize(size) {
            if (typeof size !== 'number') {
              throw new TypeError('"size" argument must be a number');
            } else if (size < 0) {
              throw new RangeError('"size" argument must not be negative');
            }
          }
          function alloc(size, fill, encoding) {
            assertSize(size);
            if (size <= 0) {
              return createBuffer(size);
            }
            if (fill !== undefined) {
              return typeof encoding === 'string'
                ? createBuffer(size).fill(fill, encoding)
                : createBuffer(size).fill(fill);
            }
            return createBuffer(size);
          }
          Buffer.alloc = function(size, fill, encoding) {
            return alloc(size, fill, encoding);
          };
          function allocUnsafe(size) {
            assertSize(size);
            return createBuffer(size < 0 ? 0 : checked(size) | 0);
          }
          Buffer.allocUnsafe = function(size) {
            return allocUnsafe(size);
          };
          Buffer.allocUnsafeSlow = function(size) {
            return allocUnsafe(size);
          };
          function fromString(string, encoding) {
            if (typeof encoding !== 'string' || encoding === '') {
              encoding = 'utf8';
            }
            if (!Buffer.isEncoding(encoding)) {
              throw new TypeError('"encoding" must be a valid string encoding');
            }
            var length = byteLength(string, encoding) | 0;
            var buf = createBuffer(length);
            var actual = buf.write(string, encoding);
            if (actual !== length) {
              buf = buf.slice(0, actual);
            }
            return buf;
          }
          function fromArrayLike(array) {
            var length = array.length < 0 ? 0 : checked(array.length) | 0;
            var buf = createBuffer(length);
            for (var i = 0; i < length; i += 1) {
              buf[i] = array[i] & 255;
            }
            return buf;
          }
          function fromArrayBuffer(array, byteOffset, length) {
            if (byteOffset < 0 || array.byteLength < byteOffset) {
              throw new RangeError("'offset' is out of bounds");
            }
            if (array.byteLength < byteOffset + (length || 0)) {
              throw new RangeError("'length' is out of bounds");
            }
            var buf;
            if (byteOffset === undefined && length === undefined) {
              buf = new Uint8Array(array);
            } else if (length === undefined) {
              buf = new Uint8Array(array, byteOffset);
            } else {
              buf = new Uint8Array(array, byteOffset, length);
            }
            buf.__proto__ = Buffer.prototype;
            return buf;
          }
          function fromObject(obj) {
            if (Buffer.isBuffer(obj)) {
              var len = checked(obj.length) | 0;
              var buf = createBuffer(len);
              if (buf.length === 0) {
                return buf;
              }
              obj.copy(buf, 0, 0, len);
              return buf;
            }
            if (obj) {
              if (isArrayBufferView(obj) || 'length' in obj) {
                if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
                  return createBuffer(0);
                }
                return fromArrayLike(obj);
              }
              if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
                return fromArrayLike(obj.data);
              }
            }
            throw new TypeError(
              'First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.'
            );
          }
          function checked(length) {
            if (length >= K_MAX_LENGTH) {
              throw new RangeError(
                'Attempt to allocate Buffer larger than maximum ' +
                  'size: 0x' +
                  K_MAX_LENGTH.toString(16) +
                  ' bytes'
              );
            }
            return length | 0;
          }
          function SlowBuffer(length) {
            if (+length != length) {
              length = 0;
            }
            return Buffer.alloc(+length);
          }
          Buffer.isBuffer = function isBuffer(b) {
            return b != null && b._isBuffer === true;
          };
          Buffer.compare = function compare(a, b) {
            if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
              throw new TypeError('Arguments must be Buffers');
            }
            if (a === b) return 0;
            var x = a.length;
            var y = b.length;
            for (var i = 0, len = Math.min(x, y); i < len; ++i) {
              if (a[i] !== b[i]) {
                x = a[i];
                y = b[i];
                break;
              }
            }
            if (x < y) return -1;
            if (y < x) return 1;
            return 0;
          };
          Buffer.isEncoding = function isEncoding(encoding) {
            switch (String(encoding).toLowerCase()) {
              case 'hex':
              case 'utf8':
              case 'utf-8':
              case 'ascii':
              case 'latin1':
              case 'binary':
              case 'base64':
              case 'ucs2':
              case 'ucs-2':
              case 'utf16le':
              case 'utf-16le':
                return true;
              default:
                return false;
            }
          };
          Buffer.concat = function concat(list, length) {
            if (!Array.isArray(list)) {
              throw new TypeError(
                '"list" argument must be an Array of Buffers'
              );
            }
            if (list.length === 0) {
              return Buffer.alloc(0);
            }
            var i;
            if (length === undefined) {
              length = 0;
              for (i = 0; i < list.length; ++i) {
                length += list[i].length;
              }
            }
            var buffer = Buffer.allocUnsafe(length);
            var pos = 0;
            for (i = 0; i < list.length; ++i) {
              var buf = list[i];
              if (!Buffer.isBuffer(buf)) {
                throw new TypeError(
                  '"list" argument must be an Array of Buffers'
                );
              }
              buf.copy(buffer, pos);
              pos += buf.length;
            }
            return buffer;
          };
          function byteLength(string, encoding) {
            if (Buffer.isBuffer(string)) {
              return string.length;
            }
            if (isArrayBufferView(string) || isArrayBuffer(string)) {
              return string.byteLength;
            }
            if (typeof string !== 'string') {
              string = '' + string;
            }
            var len = string.length;
            if (len === 0) return 0;
            var loweredCase = false;
            for (;;) {
              switch (encoding) {
                case 'ascii':
                case 'latin1':
                case 'binary':
                  return len;
                case 'utf8':
                case 'utf-8':
                case undefined:
                  return utf8ToBytes(string).length;
                case 'ucs2':
                case 'ucs-2':
                case 'utf16le':
                case 'utf-16le':
                  return len * 2;
                case 'hex':
                  return len >>> 1;
                case 'base64':
                  return base64ToBytes(string).length;
                default:
                  if (loweredCase) return utf8ToBytes(string).length;
                  encoding = ('' + encoding).toLowerCase();
                  loweredCase = true;
              }
            }
          }
          Buffer.byteLength = byteLength;
          function slowToString(encoding, start, end) {
            var loweredCase = false;
            if (start === undefined || start < 0) {
              start = 0;
            }
            if (start > this.length) {
              return '';
            }
            if (end === undefined || end > this.length) {
              end = this.length;
            }
            if (end <= 0) {
              return '';
            }
            end >>>= 0;
            start >>>= 0;
            if (end <= start) {
              return '';
            }
            if (!encoding) encoding = 'utf8';
            while (true) {
              switch (encoding) {
                case 'hex':
                  return hexSlice(this, start, end);
                case 'utf8':
                case 'utf-8':
                  return utf8Slice(this, start, end);
                case 'ascii':
                  return asciiSlice(this, start, end);
                case 'latin1':
                case 'binary':
                  return latin1Slice(this, start, end);
                case 'base64':
                  return base64Slice(this, start, end);
                case 'ucs2':
                case 'ucs-2':
                case 'utf16le':
                case 'utf-16le':
                  return utf16leSlice(this, start, end);
                default:
                  if (loweredCase)
                    throw new TypeError('Unknown encoding: ' + encoding);
                  encoding = (encoding + '').toLowerCase();
                  loweredCase = true;
              }
            }
          }
          Buffer.prototype._isBuffer = true;
          function swap(b, n, m) {
            var i = b[n];
            b[n] = b[m];
            b[m] = i;
          }
          Buffer.prototype.swap16 = function swap16() {
            var len = this.length;
            if (len % 2 !== 0) {
              throw new RangeError('Buffer size must be a multiple of 16-bits');
            }
            for (var i = 0; i < len; i += 2) {
              swap(this, i, i + 1);
            }
            return this;
          };
          Buffer.prototype.swap32 = function swap32() {
            var len = this.length;
            if (len % 4 !== 0) {
              throw new RangeError('Buffer size must be a multiple of 32-bits');
            }
            for (var i = 0; i < len; i += 4) {
              swap(this, i, i + 3);
              swap(this, i + 1, i + 2);
            }
            return this;
          };
          Buffer.prototype.swap64 = function swap64() {
            var len = this.length;
            if (len % 8 !== 0) {
              throw new RangeError('Buffer size must be a multiple of 64-bits');
            }
            for (var i = 0; i < len; i += 8) {
              swap(this, i, i + 7);
              swap(this, i + 1, i + 6);
              swap(this, i + 2, i + 5);
              swap(this, i + 3, i + 4);
            }
            return this;
          };
          Buffer.prototype.toString = function toString() {
            var length = this.length;
            if (length === 0) return '';
            if (arguments.length === 0) return utf8Slice(this, 0, length);
            return slowToString.apply(this, arguments);
          };
          Buffer.prototype.equals = function equals(b) {
            if (!Buffer.isBuffer(b))
              throw new TypeError('Argument must be a Buffer');
            if (this === b) return true;
            return Buffer.compare(this, b) === 0;
          };
          Buffer.prototype.inspect = function inspect() {
            var str = '';
            var max = exports.INSPECT_MAX_BYTES;
            if (this.length > 0) {
              str = this.toString('hex', 0, max)
                .match(/.{2}/g)
                .join(' ');
              if (this.length > max) str += ' ... ';
            }
            return '<Buffer ' + str + '>';
          };
          Buffer.prototype.compare = function compare(
            target,
            start,
            end,
            thisStart,
            thisEnd
          ) {
            if (!Buffer.isBuffer(target)) {
              throw new TypeError('Argument must be a Buffer');
            }
            if (start === undefined) {
              start = 0;
            }
            if (end === undefined) {
              end = target ? target.length : 0;
            }
            if (thisStart === undefined) {
              thisStart = 0;
            }
            if (thisEnd === undefined) {
              thisEnd = this.length;
            }
            if (
              start < 0 ||
              end > target.length ||
              thisStart < 0 ||
              thisEnd > this.length
            ) {
              throw new RangeError('out of range index');
            }
            if (thisStart >= thisEnd && start >= end) {
              return 0;
            }
            if (thisStart >= thisEnd) {
              return -1;
            }
            if (start >= end) {
              return 1;
            }
            start >>>= 0;
            end >>>= 0;
            thisStart >>>= 0;
            thisEnd >>>= 0;
            if (this === target) return 0;
            var x = thisEnd - thisStart;
            var y = end - start;
            var len = Math.min(x, y);
            var thisCopy = this.slice(thisStart, thisEnd);
            var targetCopy = target.slice(start, end);
            for (var i = 0; i < len; ++i) {
              if (thisCopy[i] !== targetCopy[i]) {
                x = thisCopy[i];
                y = targetCopy[i];
                break;
              }
            }
            if (x < y) return -1;
            if (y < x) return 1;
            return 0;
          };
          function bidirectionalIndexOf(
            buffer,
            val,
            byteOffset,
            encoding,
            dir
          ) {
            if (buffer.length === 0) return -1;
            if (typeof byteOffset === 'string') {
              encoding = byteOffset;
              byteOffset = 0;
            } else if (byteOffset > 2147483647) {
              byteOffset = 2147483647;
            } else if (byteOffset < -2147483648) {
              byteOffset = -2147483648;
            }
            byteOffset = +byteOffset;
            if (numberIsNaN(byteOffset)) {
              byteOffset = dir ? 0 : buffer.length - 1;
            }
            if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
            if (byteOffset >= buffer.length) {
              if (dir) return -1;
              else byteOffset = buffer.length - 1;
            } else if (byteOffset < 0) {
              if (dir) byteOffset = 0;
              else return -1;
            }
            if (typeof val === 'string') {
              val = Buffer.from(val, encoding);
            }
            if (Buffer.isBuffer(val)) {
              if (val.length === 0) {
                return -1;
              }
              return arrayIndexOf(buffer, val, byteOffset, encoding, dir);
            } else if (typeof val === 'number') {
              val = val & 255;
              if (typeof Uint8Array.prototype.indexOf === 'function') {
                if (dir) {
                  return Uint8Array.prototype.indexOf.call(
                    buffer,
                    val,
                    byteOffset
                  );
                } else {
                  return Uint8Array.prototype.lastIndexOf.call(
                    buffer,
                    val,
                    byteOffset
                  );
                }
              }
              return arrayIndexOf(buffer, [val], byteOffset, encoding, dir);
            }
            throw new TypeError('val must be string, number or Buffer');
          }
          function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
            var indexSize = 1;
            var arrLength = arr.length;
            var valLength = val.length;
            if (encoding !== undefined) {
              encoding = String(encoding).toLowerCase();
              if (
                encoding === 'ucs2' ||
                encoding === 'ucs-2' ||
                encoding === 'utf16le' ||
                encoding === 'utf-16le'
              ) {
                if (arr.length < 2 || val.length < 2) {
                  return -1;
                }
                indexSize = 2;
                arrLength /= 2;
                valLength /= 2;
                byteOffset /= 2;
              }
            }
            function read(buf, i) {
              if (indexSize === 1) {
                return buf[i];
              } else {
                return buf.readUInt16BE(i * indexSize);
              }
            }
            var i;
            if (dir) {
              var foundIndex = -1;
              for (i = byteOffset; i < arrLength; i++) {
                if (
                  read(arr, i) ===
                  read(val, foundIndex === -1 ? 0 : i - foundIndex)
                ) {
                  if (foundIndex === -1) foundIndex = i;
                  if (i - foundIndex + 1 === valLength)
                    return foundIndex * indexSize;
                } else {
                  if (foundIndex !== -1) i -= i - foundIndex;
                  foundIndex = -1;
                }
              }
            } else {
              if (byteOffset + valLength > arrLength)
                byteOffset = arrLength - valLength;
              for (i = byteOffset; i >= 0; i--) {
                var found = true;
                for (var j = 0; j < valLength; j++) {
                  if (read(arr, i + j) !== read(val, j)) {
                    found = false;
                    break;
                  }
                }
                if (found) return i;
              }
            }
            return -1;
          }
          Buffer.prototype.includes = function includes(
            val,
            byteOffset,
            encoding
          ) {
            return this.indexOf(val, byteOffset, encoding) !== -1;
          };
          Buffer.prototype.indexOf = function indexOf(
            val,
            byteOffset,
            encoding
          ) {
            return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
          };
          Buffer.prototype.lastIndexOf = function lastIndexOf(
            val,
            byteOffset,
            encoding
          ) {
            return bidirectionalIndexOf(this, val, byteOffset, encoding, false);
          };
          function hexWrite(buf, string, offset, length) {
            offset = Number(offset) || 0;
            var remaining = buf.length - offset;
            if (!length) {
              length = remaining;
            } else {
              length = Number(length);
              if (length > remaining) {
                length = remaining;
              }
            }
            var strLen = string.length;
            if (strLen % 2 !== 0) throw new TypeError('Invalid hex string');
            if (length > strLen / 2) {
              length = strLen / 2;
            }
            for (var i = 0; i < length; ++i) {
              var parsed = parseInt(string.substr(i * 2, 2), 16);
              if (numberIsNaN(parsed)) return i;
              buf[offset + i] = parsed;
            }
            return i;
          }
          function utf8Write(buf, string, offset, length) {
            return blitBuffer(
              utf8ToBytes(string, buf.length - offset),
              buf,
              offset,
              length
            );
          }
          function asciiWrite(buf, string, offset, length) {
            return blitBuffer(asciiToBytes(string), buf, offset, length);
          }
          function latin1Write(buf, string, offset, length) {
            return asciiWrite(buf, string, offset, length);
          }
          function base64Write(buf, string, offset, length) {
            return blitBuffer(base64ToBytes(string), buf, offset, length);
          }
          function ucs2Write(buf, string, offset, length) {
            return blitBuffer(
              utf16leToBytes(string, buf.length - offset),
              buf,
              offset,
              length
            );
          }
          Buffer.prototype.write = function write(
            string,
            offset,
            length,
            encoding
          ) {
            if (offset === undefined) {
              encoding = 'utf8';
              length = this.length;
              offset = 0;
            } else if (length === undefined && typeof offset === 'string') {
              encoding = offset;
              length = this.length;
              offset = 0;
            } else if (isFinite(offset)) {
              offset = offset >>> 0;
              if (isFinite(length)) {
                length = length >>> 0;
                if (encoding === undefined) encoding = 'utf8';
              } else {
                encoding = length;
                length = undefined;
              }
            } else {
              throw new Error(
                'Buffer.write(string, encoding, offset[, length]) is no longer supported'
              );
            }
            var remaining = this.length - offset;
            if (length === undefined || length > remaining) length = remaining;
            if (
              (string.length > 0 && (length < 0 || offset < 0)) ||
              offset > this.length
            ) {
              throw new RangeError('Attempt to write outside buffer bounds');
            }
            if (!encoding) encoding = 'utf8';
            var loweredCase = false;
            for (;;) {
              switch (encoding) {
                case 'hex':
                  return hexWrite(this, string, offset, length);
                case 'utf8':
                case 'utf-8':
                  return utf8Write(this, string, offset, length);
                case 'ascii':
                  return asciiWrite(this, string, offset, length);
                case 'latin1':
                case 'binary':
                  return latin1Write(this, string, offset, length);
                case 'base64':
                  return base64Write(this, string, offset, length);
                case 'ucs2':
                case 'ucs-2':
                case 'utf16le':
                case 'utf-16le':
                  return ucs2Write(this, string, offset, length);
                default:
                  if (loweredCase)
                    throw new TypeError('Unknown encoding: ' + encoding);
                  encoding = ('' + encoding).toLowerCase();
                  loweredCase = true;
              }
            }
          };
          Buffer.prototype.toJSON = function toJSON() {
            return {
              type: 'Buffer',
              data: Array.prototype.slice.call(this._arr || this, 0)
            };
          };
          function base64Slice(buf, start, end) {
            if (start === 0 && end === buf.length) {
              return base64.fromByteArray(buf);
            } else {
              return base64.fromByteArray(buf.slice(start, end));
            }
          }
          function utf8Slice(buf, start, end) {
            end = Math.min(buf.length, end);
            var res = [];
            var i = start;
            while (i < end) {
              var firstByte = buf[i];
              var codePoint = null;
              var bytesPerSequence =
                firstByte > 239
                  ? 4
                  : firstByte > 223
                    ? 3
                    : firstByte > 191
                      ? 2
                      : 1;
              if (i + bytesPerSequence <= end) {
                var secondByte, thirdByte, fourthByte, tempCodePoint;
                switch (bytesPerSequence) {
                  case 1:
                    if (firstByte < 128) {
                      codePoint = firstByte;
                    }
                    break;
                  case 2:
                    secondByte = buf[i + 1];
                    if ((secondByte & 192) === 128) {
                      tempCodePoint =
                        ((firstByte & 31) << 6) | (secondByte & 63);
                      if (tempCodePoint > 127) {
                        codePoint = tempCodePoint;
                      }
                    }
                    break;
                  case 3:
                    secondByte = buf[i + 1];
                    thirdByte = buf[i + 2];
                    if (
                      (secondByte & 192) === 128 &&
                      (thirdByte & 192) === 128
                    ) {
                      tempCodePoint =
                        ((firstByte & 15) << 12) |
                        ((secondByte & 63) << 6) |
                        (thirdByte & 63);
                      if (
                        tempCodePoint > 2047 &&
                        (tempCodePoint < 55296 || tempCodePoint > 57343)
                      ) {
                        codePoint = tempCodePoint;
                      }
                    }
                    break;
                  case 4:
                    secondByte = buf[i + 1];
                    thirdByte = buf[i + 2];
                    fourthByte = buf[i + 3];
                    if (
                      (secondByte & 192) === 128 &&
                      (thirdByte & 192) === 128 &&
                      (fourthByte & 192) === 128
                    ) {
                      tempCodePoint =
                        ((firstByte & 15) << 18) |
                        ((secondByte & 63) << 12) |
                        ((thirdByte & 63) << 6) |
                        (fourthByte & 63);
                      if (tempCodePoint > 65535 && tempCodePoint < 1114112) {
                        codePoint = tempCodePoint;
                      }
                    }
                }
              }
              if (codePoint === null) {
                codePoint = 65533;
                bytesPerSequence = 1;
              } else if (codePoint > 65535) {
                codePoint -= 65536;
                res.push(((codePoint >>> 10) & 1023) | 55296);
                codePoint = 56320 | (codePoint & 1023);
              }
              res.push(codePoint);
              i += bytesPerSequence;
            }
            return decodeCodePointsArray(res);
          }
          var MAX_ARGUMENTS_LENGTH = 4096;
          function decodeCodePointsArray(codePoints) {
            var len = codePoints.length;
            if (len <= MAX_ARGUMENTS_LENGTH) {
              return String.fromCharCode.apply(String, codePoints);
            }
            var res = '';
            var i = 0;
            while (i < len) {
              res += String.fromCharCode.apply(
                String,
                codePoints.slice(i, (i += MAX_ARGUMENTS_LENGTH))
              );
            }
            return res;
          }
          function asciiSlice(buf, start, end) {
            var ret = '';
            end = Math.min(buf.length, end);
            for (var i = start; i < end; ++i) {
              ret += String.fromCharCode(buf[i] & 127);
            }
            return ret;
          }
          function latin1Slice(buf, start, end) {
            var ret = '';
            end = Math.min(buf.length, end);
            for (var i = start; i < end; ++i) {
              ret += String.fromCharCode(buf[i]);
            }
            return ret;
          }
          function hexSlice(buf, start, end) {
            var len = buf.length;
            if (!start || start < 0) start = 0;
            if (!end || end < 0 || end > len) end = len;
            var out = '';
            for (var i = start; i < end; ++i) {
              out += toHex(buf[i]);
            }
            return out;
          }
          function utf16leSlice(buf, start, end) {
            var bytes = buf.slice(start, end);
            var res = '';
            for (var i = 0; i < bytes.length; i += 2) {
              res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
            }
            return res;
          }
          Buffer.prototype.slice = function slice(start, end) {
            var len = this.length;
            start = ~~start;
            end = end === undefined ? len : ~~end;
            if (start < 0) {
              start += len;
              if (start < 0) start = 0;
            } else if (start > len) {
              start = len;
            }
            if (end < 0) {
              end += len;
              if (end < 0) end = 0;
            } else if (end > len) {
              end = len;
            }
            if (end < start) end = start;
            var newBuf = this.subarray(start, end);
            newBuf.__proto__ = Buffer.prototype;
            return newBuf;
          };
          function checkOffset(offset, ext, length) {
            if (offset % 1 !== 0 || offset < 0)
              throw new RangeError('offset is not uint');
            if (offset + ext > length)
              throw new RangeError('Trying to access beyond buffer length');
          }
          Buffer.prototype.readUIntLE = function readUIntLE(
            offset,
            byteLength,
            noAssert
          ) {
            offset = offset >>> 0;
            byteLength = byteLength >>> 0;
            if (!noAssert) checkOffset(offset, byteLength, this.length);
            var val = this[offset];
            var mul = 1;
            var i = 0;
            while (++i < byteLength && (mul *= 256)) {
              val += this[offset + i] * mul;
            }
            return val;
          };
          Buffer.prototype.readUIntBE = function readUIntBE(
            offset,
            byteLength,
            noAssert
          ) {
            offset = offset >>> 0;
            byteLength = byteLength >>> 0;
            if (!noAssert) {
              checkOffset(offset, byteLength, this.length);
            }
            var val = this[offset + --byteLength];
            var mul = 1;
            while (byteLength > 0 && (mul *= 256)) {
              val += this[offset + --byteLength] * mul;
            }
            return val;
          };
          Buffer.prototype.readUInt8 = function readUInt8(offset, noAssert) {
            offset = offset >>> 0;
            if (!noAssert) checkOffset(offset, 1, this.length);
            return this[offset];
          };
          Buffer.prototype.readUInt16LE = function readUInt16LE(
            offset,
            noAssert
          ) {
            offset = offset >>> 0;
            if (!noAssert) checkOffset(offset, 2, this.length);
            return this[offset] | (this[offset + 1] << 8);
          };
          Buffer.prototype.readUInt16BE = function readUInt16BE(
            offset,
            noAssert
          ) {
            offset = offset >>> 0;
            if (!noAssert) checkOffset(offset, 2, this.length);
            return (this[offset] << 8) | this[offset + 1];
          };
          Buffer.prototype.readUInt32LE = function readUInt32LE(
            offset,
            noAssert
          ) {
            offset = offset >>> 0;
            if (!noAssert) checkOffset(offset, 4, this.length);
            return (
              (this[offset] |
                (this[offset + 1] << 8) |
                (this[offset + 2] << 16)) +
              this[offset + 3] * 16777216
            );
          };
          Buffer.prototype.readUInt32BE = function readUInt32BE(
            offset,
            noAssert
          ) {
            offset = offset >>> 0;
            if (!noAssert) checkOffset(offset, 4, this.length);
            return (
              this[offset] * 16777216 +
              ((this[offset + 1] << 16) |
                (this[offset + 2] << 8) |
                this[offset + 3])
            );
          };
          Buffer.prototype.readIntLE = function readIntLE(
            offset,
            byteLength,
            noAssert
          ) {
            offset = offset >>> 0;
            byteLength = byteLength >>> 0;
            if (!noAssert) checkOffset(offset, byteLength, this.length);
            var val = this[offset];
            var mul = 1;
            var i = 0;
            while (++i < byteLength && (mul *= 256)) {
              val += this[offset + i] * mul;
            }
            mul *= 128;
            if (val >= mul) val -= Math.pow(2, 8 * byteLength);
            return val;
          };
          Buffer.prototype.readIntBE = function readIntBE(
            offset,
            byteLength,
            noAssert
          ) {
            offset = offset >>> 0;
            byteLength = byteLength >>> 0;
            if (!noAssert) checkOffset(offset, byteLength, this.length);
            var i = byteLength;
            var mul = 1;
            var val = this[offset + --i];
            while (i > 0 && (mul *= 256)) {
              val += this[offset + --i] * mul;
            }
            mul *= 128;
            if (val >= mul) val -= Math.pow(2, 8 * byteLength);
            return val;
          };
          Buffer.prototype.readInt8 = function readInt8(offset, noAssert) {
            offset = offset >>> 0;
            if (!noAssert) checkOffset(offset, 1, this.length);
            if (!(this[offset] & 128)) return this[offset];
            return (255 - this[offset] + 1) * -1;
          };
          Buffer.prototype.readInt16LE = function readInt16LE(
            offset,
            noAssert
          ) {
            offset = offset >>> 0;
            if (!noAssert) checkOffset(offset, 2, this.length);
            var val = this[offset] | (this[offset + 1] << 8);
            return val & 32768 ? val | 4294901760 : val;
          };
          Buffer.prototype.readInt16BE = function readInt16BE(
            offset,
            noAssert
          ) {
            offset = offset >>> 0;
            if (!noAssert) checkOffset(offset, 2, this.length);
            var val = this[offset + 1] | (this[offset] << 8);
            return val & 32768 ? val | 4294901760 : val;
          };
          Buffer.prototype.readInt32LE = function readInt32LE(
            offset,
            noAssert
          ) {
            offset = offset >>> 0;
            if (!noAssert) checkOffset(offset, 4, this.length);
            return (
              this[offset] |
              (this[offset + 1] << 8) |
              (this[offset + 2] << 16) |
              (this[offset + 3] << 24)
            );
          };
          Buffer.prototype.readInt32BE = function readInt32BE(
            offset,
            noAssert
          ) {
            offset = offset >>> 0;
            if (!noAssert) checkOffset(offset, 4, this.length);
            return (
              (this[offset] << 24) |
              (this[offset + 1] << 16) |
              (this[offset + 2] << 8) |
              this[offset + 3]
            );
          };
          Buffer.prototype.readFloatLE = function readFloatLE(
            offset,
            noAssert
          ) {
            offset = offset >>> 0;
            if (!noAssert) checkOffset(offset, 4, this.length);
            return ieee754.read(this, offset, true, 23, 4);
          };
          Buffer.prototype.readFloatBE = function readFloatBE(
            offset,
            noAssert
          ) {
            offset = offset >>> 0;
            if (!noAssert) checkOffset(offset, 4, this.length);
            return ieee754.read(this, offset, false, 23, 4);
          };
          Buffer.prototype.readDoubleLE = function readDoubleLE(
            offset,
            noAssert
          ) {
            offset = offset >>> 0;
            if (!noAssert) checkOffset(offset, 8, this.length);
            return ieee754.read(this, offset, true, 52, 8);
          };
          Buffer.prototype.readDoubleBE = function readDoubleBE(
            offset,
            noAssert
          ) {
            offset = offset >>> 0;
            if (!noAssert) checkOffset(offset, 8, this.length);
            return ieee754.read(this, offset, false, 52, 8);
          };
          function checkInt(buf, value, offset, ext, max, min) {
            if (!Buffer.isBuffer(buf))
              throw new TypeError(
                '"buffer" argument must be a Buffer instance'
              );
            if (value > max || value < min)
              throw new RangeError('"value" argument is out of bounds');
            if (offset + ext > buf.length)
              throw new RangeError('Index out of range');
          }
          Buffer.prototype.writeUIntLE = function writeUIntLE(
            value,
            offset,
            byteLength,
            noAssert
          ) {
            value = +value;
            offset = offset >>> 0;
            byteLength = byteLength >>> 0;
            if (!noAssert) {
              var maxBytes = Math.pow(2, 8 * byteLength) - 1;
              checkInt(this, value, offset, byteLength, maxBytes, 0);
            }
            var mul = 1;
            var i = 0;
            this[offset] = value & 255;
            while (++i < byteLength && (mul *= 256)) {
              this[offset + i] = (value / mul) & 255;
            }
            return offset + byteLength;
          };
          Buffer.prototype.writeUIntBE = function writeUIntBE(
            value,
            offset,
            byteLength,
            noAssert
          ) {
            value = +value;
            offset = offset >>> 0;
            byteLength = byteLength >>> 0;
            if (!noAssert) {
              var maxBytes = Math.pow(2, 8 * byteLength) - 1;
              checkInt(this, value, offset, byteLength, maxBytes, 0);
            }
            var i = byteLength - 1;
            var mul = 1;
            this[offset + i] = value & 255;
            while (--i >= 0 && (mul *= 256)) {
              this[offset + i] = (value / mul) & 255;
            }
            return offset + byteLength;
          };
          Buffer.prototype.writeUInt8 = function writeUInt8(
            value,
            offset,
            noAssert
          ) {
            value = +value;
            offset = offset >>> 0;
            if (!noAssert) checkInt(this, value, offset, 1, 255, 0);
            this[offset] = value & 255;
            return offset + 1;
          };
          Buffer.prototype.writeUInt16LE = function writeUInt16LE(
            value,
            offset,
            noAssert
          ) {
            value = +value;
            offset = offset >>> 0;
            if (!noAssert) checkInt(this, value, offset, 2, 65535, 0);
            this[offset] = value & 255;
            this[offset + 1] = value >>> 8;
            return offset + 2;
          };
          Buffer.prototype.writeUInt16BE = function writeUInt16BE(
            value,
            offset,
            noAssert
          ) {
            value = +value;
            offset = offset >>> 0;
            if (!noAssert) checkInt(this, value, offset, 2, 65535, 0);
            this[offset] = value >>> 8;
            this[offset + 1] = value & 255;
            return offset + 2;
          };
          Buffer.prototype.writeUInt32LE = function writeUInt32LE(
            value,
            offset,
            noAssert
          ) {
            value = +value;
            offset = offset >>> 0;
            if (!noAssert) checkInt(this, value, offset, 4, 4294967295, 0);
            this[offset + 3] = value >>> 24;
            this[offset + 2] = value >>> 16;
            this[offset + 1] = value >>> 8;
            this[offset] = value & 255;
            return offset + 4;
          };
          Buffer.prototype.writeUInt32BE = function writeUInt32BE(
            value,
            offset,
            noAssert
          ) {
            value = +value;
            offset = offset >>> 0;
            if (!noAssert) checkInt(this, value, offset, 4, 4294967295, 0);
            this[offset] = value >>> 24;
            this[offset + 1] = value >>> 16;
            this[offset + 2] = value >>> 8;
            this[offset + 3] = value & 255;
            return offset + 4;
          };
          Buffer.prototype.writeIntLE = function writeIntLE(
            value,
            offset,
            byteLength,
            noAssert
          ) {
            value = +value;
            offset = offset >>> 0;
            if (!noAssert) {
              var limit = Math.pow(2, 8 * byteLength - 1);
              checkInt(this, value, offset, byteLength, limit - 1, -limit);
            }
            var i = 0;
            var mul = 1;
            var sub = 0;
            this[offset] = value & 255;
            while (++i < byteLength && (mul *= 256)) {
              if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
                sub = 1;
              }
              this[offset + i] = (((value / mul) >> 0) - sub) & 255;
            }
            return offset + byteLength;
          };
          Buffer.prototype.writeIntBE = function writeIntBE(
            value,
            offset,
            byteLength,
            noAssert
          ) {
            value = +value;
            offset = offset >>> 0;
            if (!noAssert) {
              var limit = Math.pow(2, 8 * byteLength - 1);
              checkInt(this, value, offset, byteLength, limit - 1, -limit);
            }
            var i = byteLength - 1;
            var mul = 1;
            var sub = 0;
            this[offset + i] = value & 255;
            while (--i >= 0 && (mul *= 256)) {
              if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
                sub = 1;
              }
              this[offset + i] = (((value / mul) >> 0) - sub) & 255;
            }
            return offset + byteLength;
          };
          Buffer.prototype.writeInt8 = function writeInt8(
            value,
            offset,
            noAssert
          ) {
            value = +value;
            offset = offset >>> 0;
            if (!noAssert) checkInt(this, value, offset, 1, 127, -128);
            if (value < 0) value = 255 + value + 1;
            this[offset] = value & 255;
            return offset + 1;
          };
          Buffer.prototype.writeInt16LE = function writeInt16LE(
            value,
            offset,
            noAssert
          ) {
            value = +value;
            offset = offset >>> 0;
            if (!noAssert) checkInt(this, value, offset, 2, 32767, -32768);
            this[offset] = value & 255;
            this[offset + 1] = value >>> 8;
            return offset + 2;
          };
          Buffer.prototype.writeInt16BE = function writeInt16BE(
            value,
            offset,
            noAssert
          ) {
            value = +value;
            offset = offset >>> 0;
            if (!noAssert) checkInt(this, value, offset, 2, 32767, -32768);
            this[offset] = value >>> 8;
            this[offset + 1] = value & 255;
            return offset + 2;
          };
          Buffer.prototype.writeInt32LE = function writeInt32LE(
            value,
            offset,
            noAssert
          ) {
            value = +value;
            offset = offset >>> 0;
            if (!noAssert)
              checkInt(this, value, offset, 4, 2147483647, -2147483648);
            this[offset] = value & 255;
            this[offset + 1] = value >>> 8;
            this[offset + 2] = value >>> 16;
            this[offset + 3] = value >>> 24;
            return offset + 4;
          };
          Buffer.prototype.writeInt32BE = function writeInt32BE(
            value,
            offset,
            noAssert
          ) {
            value = +value;
            offset = offset >>> 0;
            if (!noAssert)
              checkInt(this, value, offset, 4, 2147483647, -2147483648);
            if (value < 0) value = 4294967295 + value + 1;
            this[offset] = value >>> 24;
            this[offset + 1] = value >>> 16;
            this[offset + 2] = value >>> 8;
            this[offset + 3] = value & 255;
            return offset + 4;
          };
          function checkIEEE754(buf, value, offset, ext, max, min) {
            if (offset + ext > buf.length)
              throw new RangeError('Index out of range');
            if (offset < 0) throw new RangeError('Index out of range');
          }
          function writeFloat(buf, value, offset, littleEndian, noAssert) {
            value = +value;
            offset = offset >>> 0;
            if (!noAssert) {
              checkIEEE754(
                buf,
                value,
                offset,
                4,
                3.4028234663852886e38,
                -3.4028234663852886e38
              );
            }
            ieee754.write(buf, value, offset, littleEndian, 23, 4);
            return offset + 4;
          }
          Buffer.prototype.writeFloatLE = function writeFloatLE(
            value,
            offset,
            noAssert
          ) {
            return writeFloat(this, value, offset, true, noAssert);
          };
          Buffer.prototype.writeFloatBE = function writeFloatBE(
            value,
            offset,
            noAssert
          ) {
            return writeFloat(this, value, offset, false, noAssert);
          };
          function writeDouble(buf, value, offset, littleEndian, noAssert) {
            value = +value;
            offset = offset >>> 0;
            if (!noAssert) {
              checkIEEE754(
                buf,
                value,
                offset,
                8,
                1.7976931348623157e308,
                -1.7976931348623157e308
              );
            }
            ieee754.write(buf, value, offset, littleEndian, 52, 8);
            return offset + 8;
          }
          Buffer.prototype.writeDoubleLE = function writeDoubleLE(
            value,
            offset,
            noAssert
          ) {
            return writeDouble(this, value, offset, true, noAssert);
          };
          Buffer.prototype.writeDoubleBE = function writeDoubleBE(
            value,
            offset,
            noAssert
          ) {
            return writeDouble(this, value, offset, false, noAssert);
          };
          Buffer.prototype.copy = function copy(
            target,
            targetStart,
            start,
            end
          ) {
            if (!start) start = 0;
            if (!end && end !== 0) end = this.length;
            if (targetStart >= target.length) targetStart = target.length;
            if (!targetStart) targetStart = 0;
            if (end > 0 && end < start) end = start;
            if (end === start) return 0;
            if (target.length === 0 || this.length === 0) return 0;
            if (targetStart < 0) {
              throw new RangeError('targetStart out of bounds');
            }
            if (start < 0 || start >= this.length)
              throw new RangeError('sourceStart out of bounds');
            if (end < 0) throw new RangeError('sourceEnd out of bounds');
            if (end > this.length) end = this.length;
            if (target.length - targetStart < end - start) {
              end = target.length - targetStart + start;
            }
            var len = end - start;
            var i;
            if (this === target && start < targetStart && targetStart < end) {
              for (i = len - 1; i >= 0; --i) {
                target[i + targetStart] = this[i + start];
              }
            } else if (len < 1e3) {
              for (i = 0; i < len; ++i) {
                target[i + targetStart] = this[i + start];
              }
            } else {
              Uint8Array.prototype.set.call(
                target,
                this.subarray(start, start + len),
                targetStart
              );
            }
            return len;
          };
          Buffer.prototype.fill = function fill(val, start, end, encoding) {
            if (typeof val === 'string') {
              if (typeof start === 'string') {
                encoding = start;
                start = 0;
                end = this.length;
              } else if (typeof end === 'string') {
                encoding = end;
                end = this.length;
              }
              if (val.length === 1) {
                var code = val.charCodeAt(0);
                if (code < 256) {
                  val = code;
                }
              }
              if (encoding !== undefined && typeof encoding !== 'string') {
                throw new TypeError('encoding must be a string');
              }
              if (
                typeof encoding === 'string' &&
                !Buffer.isEncoding(encoding)
              ) {
                throw new TypeError('Unknown encoding: ' + encoding);
              }
            } else if (typeof val === 'number') {
              val = val & 255;
            }
            if (start < 0 || this.length < start || this.length < end) {
              throw new RangeError('Out of range index');
            }
            if (end <= start) {
              return this;
            }
            start = start >>> 0;
            end = end === undefined ? this.length : end >>> 0;
            if (!val) val = 0;
            var i;
            if (typeof val === 'number') {
              for (i = start; i < end; ++i) {
                this[i] = val;
              }
            } else {
              var bytes = Buffer.isBuffer(val)
                ? val
                : new Buffer(val, encoding);
              var len = bytes.length;
              for (i = 0; i < end - start; ++i) {
                this[i + start] = bytes[i % len];
              }
            }
            return this;
          };
          var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g;
          function base64clean(str) {
            str = str.trim().replace(INVALID_BASE64_RE, '');
            if (str.length < 2) return '';
            while (str.length % 4 !== 0) {
              str = str + '=';
            }
            return str;
          }
          function toHex(n) {
            if (n < 16) return '0' + n.toString(16);
            return n.toString(16);
          }
          function utf8ToBytes(string, units) {
            units = units || Infinity;
            var codePoint;
            var length = string.length;
            var leadSurrogate = null;
            var bytes = [];
            for (var i = 0; i < length; ++i) {
              codePoint = string.charCodeAt(i);
              if (codePoint > 55295 && codePoint < 57344) {
                if (!leadSurrogate) {
                  if (codePoint > 56319) {
                    if ((units -= 3) > -1) bytes.push(239, 191, 189);
                    continue;
                  } else if (i + 1 === length) {
                    if ((units -= 3) > -1) bytes.push(239, 191, 189);
                    continue;
                  }
                  leadSurrogate = codePoint;
                  continue;
                }
                if (codePoint < 56320) {
                  if ((units -= 3) > -1) bytes.push(239, 191, 189);
                  leadSurrogate = codePoint;
                  continue;
                }
                codePoint =
                  (((leadSurrogate - 55296) << 10) | (codePoint - 56320)) +
                  65536;
              } else if (leadSurrogate) {
                if ((units -= 3) > -1) bytes.push(239, 191, 189);
              }
              leadSurrogate = null;
              if (codePoint < 128) {
                if ((units -= 1) < 0) break;
                bytes.push(codePoint);
              } else if (codePoint < 2048) {
                if ((units -= 2) < 0) break;
                bytes.push((codePoint >> 6) | 192, (codePoint & 63) | 128);
              } else if (codePoint < 65536) {
                if ((units -= 3) < 0) break;
                bytes.push(
                  (codePoint >> 12) | 224,
                  ((codePoint >> 6) & 63) | 128,
                  (codePoint & 63) | 128
                );
              } else if (codePoint < 1114112) {
                if ((units -= 4) < 0) break;
                bytes.push(
                  (codePoint >> 18) | 240,
                  ((codePoint >> 12) & 63) | 128,
                  ((codePoint >> 6) & 63) | 128,
                  (codePoint & 63) | 128
                );
              } else {
                throw new Error('Invalid code point');
              }
            }
            return bytes;
          }
          function asciiToBytes(str) {
            var byteArray = [];
            for (var i = 0; i < str.length; ++i) {
              byteArray.push(str.charCodeAt(i) & 255);
            }
            return byteArray;
          }
          function utf16leToBytes(str, units) {
            var c, hi, lo;
            var byteArray = [];
            for (var i = 0; i < str.length; ++i) {
              if ((units -= 2) < 0) break;
              c = str.charCodeAt(i);
              hi = c >> 8;
              lo = c % 256;
              byteArray.push(lo);
              byteArray.push(hi);
            }
            return byteArray;
          }
          function base64ToBytes(str) {
            return base64.toByteArray(base64clean(str));
          }
          function blitBuffer(src, dst, offset, length) {
            for (var i = 0; i < length; ++i) {
              if (i + offset >= dst.length || i >= src.length) break;
              dst[i + offset] = src[i];
            }
            return i;
          }
          function isArrayBuffer(obj) {
            return (
              obj instanceof ArrayBuffer ||
              (obj != null &&
                obj.constructor != null &&
                obj.constructor.name === 'ArrayBuffer' &&
                typeof obj.byteLength === 'number')
            );
          }
          function isArrayBufferView(obj) {
            return (
              typeof ArrayBuffer.isView === 'function' &&
              ArrayBuffer.isView(obj)
            );
          }
          function numberIsNaN(obj) {
            return obj !== obj;
          }
        },
        { 'base64-js': 35, ieee754: 40 }
      ],
      38: [
        function(require, module, exports) {
          (function(Buffer) {
            function isArray(arg) {
              if (Array.isArray) {
                return Array.isArray(arg);
              }
              return objectToString(arg) === '[object Array]';
            }
            exports.isArray = isArray;
            function isBoolean(arg) {
              return typeof arg === 'boolean';
            }
            exports.isBoolean = isBoolean;
            function isNull(arg) {
              return arg === null;
            }
            exports.isNull = isNull;
            function isNullOrUndefined(arg) {
              return arg == null;
            }
            exports.isNullOrUndefined = isNullOrUndefined;
            function isNumber(arg) {
              return typeof arg === 'number';
            }
            exports.isNumber = isNumber;
            function isString(arg) {
              return typeof arg === 'string';
            }
            exports.isString = isString;
            function isSymbol(arg) {
              return typeof arg === 'symbol';
            }
            exports.isSymbol = isSymbol;
            function isUndefined(arg) {
              return arg === void 0;
            }
            exports.isUndefined = isUndefined;
            function isRegExp(re) {
              return objectToString(re) === '[object RegExp]';
            }
            exports.isRegExp = isRegExp;
            function isObject(arg) {
              return typeof arg === 'object' && arg !== null;
            }
            exports.isObject = isObject;
            function isDate(d) {
              return objectToString(d) === '[object Date]';
            }
            exports.isDate = isDate;
            function isError(e) {
              return (
                objectToString(e) === '[object Error]' || e instanceof Error
              );
            }
            exports.isError = isError;
            function isFunction(arg) {
              return typeof arg === 'function';
            }
            exports.isFunction = isFunction;
            function isPrimitive(arg) {
              return (
                arg === null ||
                typeof arg === 'boolean' ||
                typeof arg === 'number' ||
                typeof arg === 'string' ||
                typeof arg === 'symbol' ||
                typeof arg === 'undefined'
              );
            }
            exports.isPrimitive = isPrimitive;
            exports.isBuffer = Buffer.isBuffer;
            function objectToString(o) {
              return Object.prototype.toString.call(o);
            }
          }.call(this, { isBuffer: require('../../is-buffer/index.js') }));
        },
        { '../../is-buffer/index.js': 42 }
      ],
      39: [
        function(require, module, exports) {
          function EventEmitter() {
            this._events = this._events || {};
            this._maxListeners = this._maxListeners || undefined;
          }
          module.exports = EventEmitter;
          EventEmitter.EventEmitter = EventEmitter;
          EventEmitter.prototype._events = undefined;
          EventEmitter.prototype._maxListeners = undefined;
          EventEmitter.defaultMaxListeners = 10;
          EventEmitter.prototype.setMaxListeners = function(n) {
            if (!isNumber(n) || n < 0 || isNaN(n))
              throw TypeError('n must be a positive number');
            this._maxListeners = n;
            return this;
          };
          EventEmitter.prototype.emit = function(type) {
            var er, handler, len, args, i, listeners;
            if (!this._events) this._events = {};
            if (type === 'error') {
              if (
                !this._events.error ||
                (isObject(this._events.error) && !this._events.error.length)
              ) {
                er = arguments[1];
                if (er instanceof Error) {
                  throw er;
                } else {
                  var err = new Error(
                    'Uncaught, unspecified "error" event. (' + er + ')'
                  );
                  err.context = er;
                  throw err;
                }
              }
            }
            handler = this._events[type];
            if (isUndefined(handler)) return false;
            if (isFunction(handler)) {
              switch (arguments.length) {
                case 1:
                  handler.call(this);
                  break;
                case 2:
                  handler.call(this, arguments[1]);
                  break;
                case 3:
                  handler.call(this, arguments[1], arguments[2]);
                  break;
                default:
                  args = Array.prototype.slice.call(arguments, 1);
                  handler.apply(this, args);
              }
            } else if (isObject(handler)) {
              args = Array.prototype.slice.call(arguments, 1);
              listeners = handler.slice();
              len = listeners.length;
              for (i = 0; i < len; i++) listeners[i].apply(this, args);
            }
            return true;
          };
          EventEmitter.prototype.addListener = function(type, listener) {
            var m;
            if (!isFunction(listener))
              throw TypeError('listener must be a function');
            if (!this._events) this._events = {};
            if (this._events.newListener)
              this.emit(
                'newListener',
                type,
                isFunction(listener.listener) ? listener.listener : listener
              );
            if (!this._events[type]) this._events[type] = listener;
            else if (isObject(this._events[type]))
              this._events[type].push(listener);
            else this._events[type] = [this._events[type], listener];
            if (isObject(this._events[type]) && !this._events[type].warned) {
              if (!isUndefined(this._maxListeners)) {
                m = this._maxListeners;
              } else {
                m = EventEmitter.defaultMaxListeners;
              }
              if (m && m > 0 && this._events[type].length > m) {
                this._events[type].warned = true;
                console.error(
                  '(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                  this._events[type].length
                );
                if (typeof console.trace === 'function') {
                  console.trace();
                }
              }
            }
            return this;
          };
          EventEmitter.prototype.on = EventEmitter.prototype.addListener;
          EventEmitter.prototype.once = function(type, listener) {
            if (!isFunction(listener))
              throw TypeError('listener must be a function');
            var fired = false;
            function g() {
              this.removeListener(type, g);
              if (!fired) {
                fired = true;
                listener.apply(this, arguments);
              }
            }
            g.listener = listener;
            this.on(type, g);
            return this;
          };
          EventEmitter.prototype.removeListener = function(type, listener) {
            var list, position, length, i;
            if (!isFunction(listener))
              throw TypeError('listener must be a function');
            if (!this._events || !this._events[type]) return this;
            list = this._events[type];
            length = list.length;
            position = -1;
            if (
              list === listener ||
              (isFunction(list.listener) && list.listener === listener)
            ) {
              delete this._events[type];
              if (this._events.removeListener)
                this.emit('removeListener', type, listener);
            } else if (isObject(list)) {
              for (i = length; i-- > 0; ) {
                if (
                  list[i] === listener ||
                  (list[i].listener && list[i].listener === listener)
                ) {
                  position = i;
                  break;
                }
              }
              if (position < 0) return this;
              if (list.length === 1) {
                list.length = 0;
                delete this._events[type];
              } else {
                list.splice(position, 1);
              }
              if (this._events.removeListener)
                this.emit('removeListener', type, listener);
            }
            return this;
          };
          EventEmitter.prototype.removeAllListeners = function(type) {
            var key, listeners;
            if (!this._events) return this;
            if (!this._events.removeListener) {
              if (arguments.length === 0) this._events = {};
              else if (this._events[type]) delete this._events[type];
              return this;
            }
            if (arguments.length === 0) {
              for (key in this._events) {
                if (key === 'removeListener') continue;
                this.removeAllListeners(key);
              }
              this.removeAllListeners('removeListener');
              this._events = {};
              return this;
            }
            listeners = this._events[type];
            if (isFunction(listeners)) {
              this.removeListener(type, listeners);
            } else if (listeners) {
              while (listeners.length)
                this.removeListener(type, listeners[listeners.length - 1]);
            }
            delete this._events[type];
            return this;
          };
          EventEmitter.prototype.listeners = function(type) {
            var ret;
            if (!this._events || !this._events[type]) ret = [];
            else if (isFunction(this._events[type])) ret = [this._events[type]];
            else ret = this._events[type].slice();
            return ret;
          };
          EventEmitter.prototype.listenerCount = function(type) {
            if (this._events) {
              var evlistener = this._events[type];
              if (isFunction(evlistener)) return 1;
              else if (evlistener) return evlistener.length;
            }
            return 0;
          };
          EventEmitter.listenerCount = function(emitter, type) {
            return emitter.listenerCount(type);
          };
          function isFunction(arg) {
            return typeof arg === 'function';
          }
          function isNumber(arg) {
            return typeof arg === 'number';
          }
          function isObject(arg) {
            return typeof arg === 'object' && arg !== null;
          }
          function isUndefined(arg) {
            return arg === void 0;
          }
        },
        {}
      ],
      40: [
        function(require, module, exports) {
          exports.read = function(buffer, offset, isLE, mLen, nBytes) {
            var e, m;
            var eLen = nBytes * 8 - mLen - 1;
            var eMax = (1 << eLen) - 1;
            var eBias = eMax >> 1;
            var nBits = -7;
            var i = isLE ? nBytes - 1 : 0;
            var d = isLE ? -1 : 1;
            var s = buffer[offset + i];
            i += d;
            e = s & ((1 << -nBits) - 1);
            s >>= -nBits;
            nBits += eLen;
            for (
              ;
              nBits > 0;
              e = e * 256 + buffer[offset + i], i += d, nBits -= 8
            ) {}
            m = e & ((1 << -nBits) - 1);
            e >>= -nBits;
            nBits += mLen;
            for (
              ;
              nBits > 0;
              m = m * 256 + buffer[offset + i], i += d, nBits -= 8
            ) {}
            if (e === 0) {
              e = 1 - eBias;
            } else if (e === eMax) {
              return m ? NaN : (s ? -1 : 1) * Infinity;
            } else {
              m = m + Math.pow(2, mLen);
              e = e - eBias;
            }
            return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
          };
          exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
            var e, m, c;
            var eLen = nBytes * 8 - mLen - 1;
            var eMax = (1 << eLen) - 1;
            var eBias = eMax >> 1;
            var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
            var i = isLE ? 0 : nBytes - 1;
            var d = isLE ? 1 : -1;
            var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;
            value = Math.abs(value);
            if (isNaN(value) || value === Infinity) {
              m = isNaN(value) ? 1 : 0;
              e = eMax;
            } else {
              e = Math.floor(Math.log(value) / Math.LN2);
              if (value * (c = Math.pow(2, -e)) < 1) {
                e--;
                c *= 2;
              }
              if (e + eBias >= 1) {
                value += rt / c;
              } else {
                value += rt * Math.pow(2, 1 - eBias);
              }
              if (value * c >= 2) {
                e++;
                c /= 2;
              }
              if (e + eBias >= eMax) {
                m = 0;
                e = eMax;
              } else if (e + eBias >= 1) {
                m = (value * c - 1) * Math.pow(2, mLen);
                e = e + eBias;
              } else {
                m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
                e = 0;
              }
            }
            for (
              ;
              mLen >= 8;
              buffer[offset + i] = m & 255, i += d, m /= 256, mLen -= 8
            ) {}
            e = (e << mLen) | m;
            eLen += mLen;
            for (
              ;
              eLen > 0;
              buffer[offset + i] = e & 255, i += d, e /= 256, eLen -= 8
            ) {}
            buffer[offset + i - d] |= s * 128;
          };
        },
        {}
      ],
      41: [
        function(require, module, exports) {
          arguments[4][18][0].apply(exports, arguments);
        },
        { dup: 18 }
      ],
      42: [
        function(require, module, exports) {
          module.exports = function(obj) {
            return (
              obj != null &&
              (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer)
            );
          };
          function isBuffer(obj) {
            return (
              !!obj.constructor &&
              typeof obj.constructor.isBuffer === 'function' &&
              obj.constructor.isBuffer(obj)
            );
          }
          function isSlowBuffer(obj) {
            return (
              typeof obj.readFloatLE === 'function' &&
              typeof obj.slice === 'function' &&
              isBuffer(obj.slice(0, 0))
            );
          }
        },
        {}
      ],
      43: [
        function(require, module, exports) {
          var toString = {}.toString;
          module.exports =
            Array.isArray ||
            function(arr) {
              return toString.call(arr) == '[object Array]';
            };
        },
        {}
      ],
      44: [
        function(require, module, exports) {
          (function(process) {
            function normalizeArray(parts, allowAboveRoot) {
              var up = 0;
              for (var i = parts.length - 1; i >= 0; i--) {
                var last = parts[i];
                if (last === '.') {
                  parts.splice(i, 1);
                } else if (last === '..') {
                  parts.splice(i, 1);
                  up++;
                } else if (up) {
                  parts.splice(i, 1);
                  up--;
                }
              }
              if (allowAboveRoot) {
                for (; up--; up) {
                  parts.unshift('..');
                }
              }
              return parts;
            }
            var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
            var splitPath = function(filename) {
              return splitPathRe.exec(filename).slice(1);
            };
            exports.resolve = function() {
              var resolvedPath = '',
                resolvedAbsolute = false;
              for (
                var i = arguments.length - 1;
                i >= -1 && !resolvedAbsolute;
                i--
              ) {
                var path = i >= 0 ? arguments[i] : process.cwd();
                if (typeof path !== 'string') {
                  throw new TypeError(
                    'Arguments to path.resolve must be strings'
                  );
                } else if (!path) {
                  continue;
                }
                resolvedPath = path + '/' + resolvedPath;
                resolvedAbsolute = path.charAt(0) === '/';
              }
              resolvedPath = normalizeArray(
                filter(resolvedPath.split('/'), function(p) {
                  return !!p;
                }),
                !resolvedAbsolute
              ).join('/');
              return (resolvedAbsolute ? '/' : '') + resolvedPath || '.';
            };
            exports.normalize = function(path) {
              var isAbsolute = exports.isAbsolute(path),
                trailingSlash = substr(path, -1) === '/';
              path = normalizeArray(
                filter(path.split('/'), function(p) {
                  return !!p;
                }),
                !isAbsolute
              ).join('/');
              if (!path && !isAbsolute) {
                path = '.';
              }
              if (path && trailingSlash) {
                path += '/';
              }
              return (isAbsolute ? '/' : '') + path;
            };
            exports.isAbsolute = function(path) {
              return path.charAt(0) === '/';
            };
            exports.join = function() {
              var paths = Array.prototype.slice.call(arguments, 0);
              return exports.normalize(
                filter(paths, function(p, index) {
                  if (typeof p !== 'string') {
                    throw new TypeError(
                      'Arguments to path.join must be strings'
                    );
                  }
                  return p;
                }).join('/')
              );
            };
            exports.relative = function(from, to) {
              from = exports.resolve(from).substr(1);
              to = exports.resolve(to).substr(1);
              function trim(arr) {
                var start = 0;
                for (; start < arr.length; start++) {
                  if (arr[start] !== '') break;
                }
                var end = arr.length - 1;
                for (; end >= 0; end--) {
                  if (arr[end] !== '') break;
                }
                if (start > end) return [];
                return arr.slice(start, end - start + 1);
              }
              var fromParts = trim(from.split('/'));
              var toParts = trim(to.split('/'));
              var length = Math.min(fromParts.length, toParts.length);
              var samePartsLength = length;
              for (var i = 0; i < length; i++) {
                if (fromParts[i] !== toParts[i]) {
                  samePartsLength = i;
                  break;
                }
              }
              var outputParts = [];
              for (var i = samePartsLength; i < fromParts.length; i++) {
                outputParts.push('..');
              }
              outputParts = outputParts.concat(toParts.slice(samePartsLength));
              return outputParts.join('/');
            };
            exports.sep = '/';
            exports.delimiter = ':';
            exports.dirname = function(path) {
              var result = splitPath(path),
                root = result[0],
                dir = result[1];
              if (!root && !dir) {
                return '.';
              }
              if (dir) {
                dir = dir.substr(0, dir.length - 1);
              }
              return root + dir;
            };
            exports.basename = function(path, ext) {
              var f = splitPath(path)[2];
              if (ext && f.substr(-1 * ext.length) === ext) {
                f = f.substr(0, f.length - ext.length);
              }
              return f;
            };
            exports.extname = function(path) {
              return splitPath(path)[3];
            };
            function filter(xs, f) {
              if (xs.filter) return xs.filter(f);
              var res = [];
              for (var i = 0; i < xs.length; i++) {
                if (f(xs[i], i, xs)) res.push(xs[i]);
              }
              return res;
            }
            var substr =
              'ab'.substr(-1) === 'b'
                ? function(str, start, len) {
                    return str.substr(start, len);
                  }
                : function(str, start, len) {
                    if (start < 0) start = str.length + start;
                    return str.substr(start, len);
                  };
          }.call(this, require('_process')));
        },
        { _process: 46 }
      ],
      45: [
        function(require, module, exports) {
          (function(process) {
            'use strict';
            if (
              !process.version ||
              process.version.indexOf('v0.') === 0 ||
              (process.version.indexOf('v1.') === 0 &&
                process.version.indexOf('v1.8.') !== 0)
            ) {
              module.exports = nextTick;
            } else {
              module.exports = process.nextTick;
            }
            function nextTick(fn, arg1, arg2, arg3) {
              if (typeof fn !== 'function') {
                throw new TypeError('"callback" argument must be a function');
              }
              var len = arguments.length;
              var args, i;
              switch (len) {
                case 0:
                case 1:
                  return process.nextTick(fn);
                case 2:
                  return process.nextTick(function afterTickOne() {
                    fn.call(null, arg1);
                  });
                case 3:
                  return process.nextTick(function afterTickTwo() {
                    fn.call(null, arg1, arg2);
                  });
                case 4:
                  return process.nextTick(function afterTickThree() {
                    fn.call(null, arg1, arg2, arg3);
                  });
                default:
                  args = new Array(len - 1);
                  i = 0;
                  while (i < args.length) {
                    args[i++] = arguments[i];
                  }
                  return process.nextTick(function afterTick() {
                    fn.apply(null, args);
                  });
              }
            }
          }.call(this, require('_process')));
        },
        { _process: 46 }
      ],
      46: [
        function(require, module, exports) {
          var process = (module.exports = {});
          var cachedSetTimeout;
          var cachedClearTimeout;
          function defaultSetTimout() {
            throw new Error('setTimeout has not been defined');
          }
          function defaultClearTimeout() {
            throw new Error('clearTimeout has not been defined');
          }
          (function() {
            try {
              if (typeof setTimeout === 'function') {
                cachedSetTimeout = setTimeout;
              } else {
                cachedSetTimeout = defaultSetTimout;
              }
            } catch (e) {
              cachedSetTimeout = defaultSetTimout;
            }
            try {
              if (typeof clearTimeout === 'function') {
                cachedClearTimeout = clearTimeout;
              } else {
                cachedClearTimeout = defaultClearTimeout;
              }
            } catch (e) {
              cachedClearTimeout = defaultClearTimeout;
            }
          })();
          function runTimeout(fun) {
            if (cachedSetTimeout === setTimeout) {
              return setTimeout(fun, 0);
            }
            if (
              (cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) &&
              setTimeout
            ) {
              cachedSetTimeout = setTimeout;
              return setTimeout(fun, 0);
            }
            try {
              return cachedSetTimeout(fun, 0);
            } catch (e) {
              try {
                return cachedSetTimeout.call(null, fun, 0);
              } catch (e) {
                return cachedSetTimeout.call(this, fun, 0);
              }
            }
          }
          function runClearTimeout(marker) {
            if (cachedClearTimeout === clearTimeout) {
              return clearTimeout(marker);
            }
            if (
              (cachedClearTimeout === defaultClearTimeout ||
                !cachedClearTimeout) &&
              clearTimeout
            ) {
              cachedClearTimeout = clearTimeout;
              return clearTimeout(marker);
            }
            try {
              return cachedClearTimeout(marker);
            } catch (e) {
              try {
                return cachedClearTimeout.call(null, marker);
              } catch (e) {
                return cachedClearTimeout.call(this, marker);
              }
            }
          }
          var queue = [];
          var draining = false;
          var currentQueue;
          var queueIndex = -1;
          function cleanUpNextTick() {
            if (!draining || !currentQueue) {
              return;
            }
            draining = false;
            if (currentQueue.length) {
              queue = currentQueue.concat(queue);
            } else {
              queueIndex = -1;
            }
            if (queue.length) {
              drainQueue();
            }
          }
          function drainQueue() {
            if (draining) {
              return;
            }
            var timeout = runTimeout(cleanUpNextTick);
            draining = true;
            var len = queue.length;
            while (len) {
              currentQueue = queue;
              queue = [];
              while (++queueIndex < len) {
                if (currentQueue) {
                  currentQueue[queueIndex].run();
                }
              }
              queueIndex = -1;
              len = queue.length;
            }
            currentQueue = null;
            draining = false;
            runClearTimeout(timeout);
          }
          process.nextTick = function(fun) {
            var args = new Array(arguments.length - 1);
            if (arguments.length > 1) {
              for (var i = 1; i < arguments.length; i++) {
                args[i - 1] = arguments[i];
              }
            }
            queue.push(new Item(fun, args));
            if (queue.length === 1 && !draining) {
              runTimeout(drainQueue);
            }
          };
          function Item(fun, array) {
            this.fun = fun;
            this.array = array;
          }
          Item.prototype.run = function() {
            this.fun.apply(null, this.array);
          };
          process.title = 'browser';
          process.browser = true;
          process.env = {};
          process.argv = [];
          process.version = '';
          process.versions = {};
          function noop() {}
          process.on = noop;
          process.addListener = noop;
          process.once = noop;
          process.off = noop;
          process.removeListener = noop;
          process.removeAllListeners = noop;
          process.emit = noop;
          process.prependListener = noop;
          process.prependOnceListener = noop;
          process.listeners = function(name) {
            return [];
          };
          process.binding = function(name) {
            throw new Error('process.binding is not supported');
          };
          process.cwd = function() {
            return '/';
          };
          process.chdir = function(dir) {
            throw new Error('process.chdir is not supported');
          };
          process.umask = function() {
            return 0;
          };
        },
        {}
      ],
      47: [
        function(require, module, exports) {
          module.exports = require('./lib/_stream_duplex.js');
        },
        { './lib/_stream_duplex.js': 48 }
      ],
      48: [
        function(require, module, exports) {
          'use strict';
          var processNextTick = require('process-nextick-args');
          var objectKeys =
            Object.keys ||
            function(obj) {
              var keys = [];
              for (var key in obj) {
                keys.push(key);
              }
              return keys;
            };
          module.exports = Duplex;
          var util = require('core-util-is');
          util.inherits = require('inherits');
          var Readable = require('./_stream_readable');
          var Writable = require('./_stream_writable');
          util.inherits(Duplex, Readable);
          var keys = objectKeys(Writable.prototype);
          for (var v = 0; v < keys.length; v++) {
            var method = keys[v];
            if (!Duplex.prototype[method])
              Duplex.prototype[method] = Writable.prototype[method];
          }
          function Duplex(options) {
            if (!(this instanceof Duplex)) return new Duplex(options);
            Readable.call(this, options);
            Writable.call(this, options);
            if (options && options.readable === false) this.readable = false;
            if (options && options.writable === false) this.writable = false;
            this.allowHalfOpen = true;
            if (options && options.allowHalfOpen === false)
              this.allowHalfOpen = false;
            this.once('end', onend);
          }
          function onend() {
            if (this.allowHalfOpen || this._writableState.ended) return;
            processNextTick(onEndNT, this);
          }
          function onEndNT(self) {
            self.end();
          }
          Object.defineProperty(Duplex.prototype, 'destroyed', {
            get: function() {
              if (
                this._readableState === undefined ||
                this._writableState === undefined
              ) {
                return false;
              }
              return (
                this._readableState.destroyed && this._writableState.destroyed
              );
            },
            set: function(value) {
              if (
                this._readableState === undefined ||
                this._writableState === undefined
              ) {
                return;
              }
              this._readableState.destroyed = value;
              this._writableState.destroyed = value;
            }
          });
          Duplex.prototype._destroy = function(err, cb) {
            this.push(null);
            this.end();
            processNextTick(cb, err);
          };
          function forEach(xs, f) {
            for (var i = 0, l = xs.length; i < l; i++) {
              f(xs[i], i);
            }
          }
        },
        {
          './_stream_readable': 50,
          './_stream_writable': 52,
          'core-util-is': 38,
          inherits: 41,
          'process-nextick-args': 45
        }
      ],
      49: [
        function(require, module, exports) {
          'use strict';
          module.exports = PassThrough;
          var Transform = require('./_stream_transform');
          var util = require('core-util-is');
          util.inherits = require('inherits');
          util.inherits(PassThrough, Transform);
          function PassThrough(options) {
            if (!(this instanceof PassThrough)) return new PassThrough(options);
            Transform.call(this, options);
          }
          PassThrough.prototype._transform = function(chunk, encoding, cb) {
            cb(null, chunk);
          };
        },
        { './_stream_transform': 51, 'core-util-is': 38, inherits: 41 }
      ],
      50: [
        function(require, module, exports) {
          (function(process, global) {
            'use strict';
            var processNextTick = require('process-nextick-args');
            module.exports = Readable;
            var isArray = require('isarray');
            var Duplex;
            Readable.ReadableState = ReadableState;
            var EE = require('events').EventEmitter;
            var EElistenerCount = function(emitter, type) {
              return emitter.listeners(type).length;
            };
            var Stream = require('./internal/streams/stream');
            var Buffer = require('safe-buffer').Buffer;
            var OurUint8Array = global.Uint8Array || function() {};
            function _uint8ArrayToBuffer(chunk) {
              return Buffer.from(chunk);
            }
            function _isUint8Array(obj) {
              return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
            }
            var util = require('core-util-is');
            util.inherits = require('inherits');
            var debugUtil = require('util');
            var debug = void 0;
            if (debugUtil && debugUtil.debuglog) {
              debug = debugUtil.debuglog('stream');
            } else {
              debug = function() {};
            }
            var BufferList = require('./internal/streams/BufferList');
            var destroyImpl = require('./internal/streams/destroy');
            var StringDecoder;
            util.inherits(Readable, Stream);
            var kProxyEvents = ['error', 'close', 'destroy', 'pause', 'resume'];
            function prependListener(emitter, event, fn) {
              if (typeof emitter.prependListener === 'function') {
                return emitter.prependListener(event, fn);
              } else {
                if (!emitter._events || !emitter._events[event])
                  emitter.on(event, fn);
                else if (isArray(emitter._events[event]))
                  emitter._events[event].unshift(fn);
                else emitter._events[event] = [fn, emitter._events[event]];
              }
            }
            function ReadableState(options, stream) {
              Duplex = Duplex || require('./_stream_duplex');
              options = options || {};
              this.objectMode = !!options.objectMode;
              if (stream instanceof Duplex)
                this.objectMode =
                  this.objectMode || !!options.readableObjectMode;
              var hwm = options.highWaterMark;
              var defaultHwm = this.objectMode ? 16 : 16 * 1024;
              this.highWaterMark = hwm || hwm === 0 ? hwm : defaultHwm;
              this.highWaterMark = Math.floor(this.highWaterMark);
              this.buffer = new BufferList();
              this.length = 0;
              this.pipes = null;
              this.pipesCount = 0;
              this.flowing = null;
              this.ended = false;
              this.endEmitted = false;
              this.reading = false;
              this.sync = true;
              this.needReadable = false;
              this.emittedReadable = false;
              this.readableListening = false;
              this.resumeScheduled = false;
              this.destroyed = false;
              this.defaultEncoding = options.defaultEncoding || 'utf8';
              this.awaitDrain = 0;
              this.readingMore = false;
              this.decoder = null;
              this.encoding = null;
              if (options.encoding) {
                if (!StringDecoder)
                  StringDecoder = require('string_decoder/').StringDecoder;
                this.decoder = new StringDecoder(options.encoding);
                this.encoding = options.encoding;
              }
            }
            function Readable(options) {
              Duplex = Duplex || require('./_stream_duplex');
              if (!(this instanceof Readable)) return new Readable(options);
              this._readableState = new ReadableState(options, this);
              this.readable = true;
              if (options) {
                if (typeof options.read === 'function')
                  this._read = options.read;
                if (typeof options.destroy === 'function')
                  this._destroy = options.destroy;
              }
              Stream.call(this);
            }
            Object.defineProperty(Readable.prototype, 'destroyed', {
              get: function() {
                if (this._readableState === undefined) {
                  return false;
                }
                return this._readableState.destroyed;
              },
              set: function(value) {
                if (!this._readableState) {
                  return;
                }
                this._readableState.destroyed = value;
              }
            });
            Readable.prototype.destroy = destroyImpl.destroy;
            Readable.prototype._undestroy = destroyImpl.undestroy;
            Readable.prototype._destroy = function(err, cb) {
              this.push(null);
              cb(err);
            };
            Readable.prototype.push = function(chunk, encoding) {
              var state = this._readableState;
              var skipChunkCheck;
              if (!state.objectMode) {
                if (typeof chunk === 'string') {
                  encoding = encoding || state.defaultEncoding;
                  if (encoding !== state.encoding) {
                    chunk = Buffer.from(chunk, encoding);
                    encoding = '';
                  }
                  skipChunkCheck = true;
                }
              } else {
                skipChunkCheck = true;
              }
              return readableAddChunk(
                this,
                chunk,
                encoding,
                false,
                skipChunkCheck
              );
            };
            Readable.prototype.unshift = function(chunk) {
              return readableAddChunk(this, chunk, null, true, false);
            };
            function readableAddChunk(
              stream,
              chunk,
              encoding,
              addToFront,
              skipChunkCheck
            ) {
              var state = stream._readableState;
              if (chunk === null) {
                state.reading = false;
                onEofChunk(stream, state);
              } else {
                var er;
                if (!skipChunkCheck) er = chunkInvalid(state, chunk);
                if (er) {
                  stream.emit('error', er);
                } else if (state.objectMode || (chunk && chunk.length > 0)) {
                  if (
                    typeof chunk !== 'string' &&
                    !state.objectMode &&
                    Object.getPrototypeOf(chunk) !== Buffer.prototype
                  ) {
                    chunk = _uint8ArrayToBuffer(chunk);
                  }
                  if (addToFront) {
                    if (state.endEmitted)
                      stream.emit(
                        'error',
                        new Error('stream.unshift() after end event')
                      );
                    else addChunk(stream, state, chunk, true);
                  } else if (state.ended) {
                    stream.emit('error', new Error('stream.push() after EOF'));
                  } else {
                    state.reading = false;
                    if (state.decoder && !encoding) {
                      chunk = state.decoder.write(chunk);
                      if (state.objectMode || chunk.length !== 0)
                        addChunk(stream, state, chunk, false);
                      else maybeReadMore(stream, state);
                    } else {
                      addChunk(stream, state, chunk, false);
                    }
                  }
                } else if (!addToFront) {
                  state.reading = false;
                }
              }
              return needMoreData(state);
            }
            function addChunk(stream, state, chunk, addToFront) {
              if (state.flowing && state.length === 0 && !state.sync) {
                stream.emit('data', chunk);
                stream.read(0);
              } else {
                state.length += state.objectMode ? 1 : chunk.length;
                if (addToFront) state.buffer.unshift(chunk);
                else state.buffer.push(chunk);
                if (state.needReadable) emitReadable(stream);
              }
              maybeReadMore(stream, state);
            }
            function chunkInvalid(state, chunk) {
              var er;
              if (
                !_isUint8Array(chunk) &&
                typeof chunk !== 'string' &&
                chunk !== undefined &&
                !state.objectMode
              ) {
                er = new TypeError('Invalid non-string/buffer chunk');
              }
              return er;
            }
            function needMoreData(state) {
              return (
                !state.ended &&
                (state.needReadable ||
                  state.length < state.highWaterMark ||
                  state.length === 0)
              );
            }
            Readable.prototype.isPaused = function() {
              return this._readableState.flowing === false;
            };
            Readable.prototype.setEncoding = function(enc) {
              if (!StringDecoder)
                StringDecoder = require('string_decoder/').StringDecoder;
              this._readableState.decoder = new StringDecoder(enc);
              this._readableState.encoding = enc;
              return this;
            };
            var MAX_HWM = 8388608;
            function computeNewHighWaterMark(n) {
              if (n >= MAX_HWM) {
                n = MAX_HWM;
              } else {
                n--;
                n |= n >>> 1;
                n |= n >>> 2;
                n |= n >>> 4;
                n |= n >>> 8;
                n |= n >>> 16;
                n++;
              }
              return n;
            }
            function howMuchToRead(n, state) {
              if (n <= 0 || (state.length === 0 && state.ended)) return 0;
              if (state.objectMode) return 1;
              if (n !== n) {
                if (state.flowing && state.length)
                  return state.buffer.head.data.length;
                else return state.length;
              }
              if (n > state.highWaterMark)
                state.highWaterMark = computeNewHighWaterMark(n);
              if (n <= state.length) return n;
              if (!state.ended) {
                state.needReadable = true;
                return 0;
              }
              return state.length;
            }
            Readable.prototype.read = function(n) {
              debug('read', n);
              n = parseInt(n, 10);
              var state = this._readableState;
              var nOrig = n;
              if (n !== 0) state.emittedReadable = false;
              if (
                n === 0 &&
                state.needReadable &&
                (state.length >= state.highWaterMark || state.ended)
              ) {
                debug('read: emitReadable', state.length, state.ended);
                if (state.length === 0 && state.ended) endReadable(this);
                else emitReadable(this);
                return null;
              }
              n = howMuchToRead(n, state);
              if (n === 0 && state.ended) {
                if (state.length === 0) endReadable(this);
                return null;
              }
              var doRead = state.needReadable;
              debug('need readable', doRead);
              if (
                state.length === 0 ||
                state.length - n < state.highWaterMark
              ) {
                doRead = true;
                debug('length less than watermark', doRead);
              }
              if (state.ended || state.reading) {
                doRead = false;
                debug('reading or ended', doRead);
              } else if (doRead) {
                debug('do read');
                state.reading = true;
                state.sync = true;
                if (state.length === 0) state.needReadable = true;
                this._read(state.highWaterMark);
                state.sync = false;
                if (!state.reading) n = howMuchToRead(nOrig, state);
              }
              var ret;
              if (n > 0) ret = fromList(n, state);
              else ret = null;
              if (ret === null) {
                state.needReadable = true;
                n = 0;
              } else {
                state.length -= n;
              }
              if (state.length === 0) {
                if (!state.ended) state.needReadable = true;
                if (nOrig !== n && state.ended) endReadable(this);
              }
              if (ret !== null) this.emit('data', ret);
              return ret;
            };
            function onEofChunk(stream, state) {
              if (state.ended) return;
              if (state.decoder) {
                var chunk = state.decoder.end();
                if (chunk && chunk.length) {
                  state.buffer.push(chunk);
                  state.length += state.objectMode ? 1 : chunk.length;
                }
              }
              state.ended = true;
              emitReadable(stream);
            }
            function emitReadable(stream) {
              var state = stream._readableState;
              state.needReadable = false;
              if (!state.emittedReadable) {
                debug('emitReadable', state.flowing);
                state.emittedReadable = true;
                if (state.sync) processNextTick(emitReadable_, stream);
                else emitReadable_(stream);
              }
            }
            function emitReadable_(stream) {
              debug('emit readable');
              stream.emit('readable');
              flow(stream);
            }
            function maybeReadMore(stream, state) {
              if (!state.readingMore) {
                state.readingMore = true;
                processNextTick(maybeReadMore_, stream, state);
              }
            }
            function maybeReadMore_(stream, state) {
              var len = state.length;
              while (
                !state.reading &&
                !state.flowing &&
                !state.ended &&
                state.length < state.highWaterMark
              ) {
                debug('maybeReadMore read 0');
                stream.read(0);
                if (len === state.length) break;
                else len = state.length;
              }
              state.readingMore = false;
            }
            Readable.prototype._read = function(n) {
              this.emit('error', new Error('_read() is not implemented'));
            };
            Readable.prototype.pipe = function(dest, pipeOpts) {
              var src = this;
              var state = this._readableState;
              switch (state.pipesCount) {
                case 0:
                  state.pipes = dest;
                  break;
                case 1:
                  state.pipes = [state.pipes, dest];
                  break;
                default:
                  state.pipes.push(dest);
                  break;
              }
              state.pipesCount += 1;
              debug('pipe count=%d opts=%j', state.pipesCount, pipeOpts);
              var doEnd =
                (!pipeOpts || pipeOpts.end !== false) &&
                dest !== process.stdout &&
                dest !== process.stderr;
              var endFn = doEnd ? onend : unpipe;
              if (state.endEmitted) processNextTick(endFn);
              else src.once('end', endFn);
              dest.on('unpipe', onunpipe);
              function onunpipe(readable, unpipeInfo) {
                debug('onunpipe');
                if (readable === src) {
                  if (unpipeInfo && unpipeInfo.hasUnpiped === false) {
                    unpipeInfo.hasUnpiped = true;
                    cleanup();
                  }
                }
              }
              function onend() {
                debug('onend');
                dest.end();
              }
              var ondrain = pipeOnDrain(src);
              dest.on('drain', ondrain);
              var cleanedUp = false;
              function cleanup() {
                debug('cleanup');
                dest.removeListener('close', onclose);
                dest.removeListener('finish', onfinish);
                dest.removeListener('drain', ondrain);
                dest.removeListener('error', onerror);
                dest.removeListener('unpipe', onunpipe);
                src.removeListener('end', onend);
                src.removeListener('end', unpipe);
                src.removeListener('data', ondata);
                cleanedUp = true;
                if (
                  state.awaitDrain &&
                  (!dest._writableState || dest._writableState.needDrain)
                )
                  ondrain();
              }
              var increasedAwaitDrain = false;
              src.on('data', ondata);
              function ondata(chunk) {
                debug('ondata');
                increasedAwaitDrain = false;
                var ret = dest.write(chunk);
                if (false === ret && !increasedAwaitDrain) {
                  if (
                    ((state.pipesCount === 1 && state.pipes === dest) ||
                      (state.pipesCount > 1 &&
                        indexOf(state.pipes, dest) !== -1)) &&
                    !cleanedUp
                  ) {
                    debug(
                      'false write response, pause',
                      src._readableState.awaitDrain
                    );
                    src._readableState.awaitDrain++;
                    increasedAwaitDrain = true;
                  }
                  src.pause();
                }
              }
              function onerror(er) {
                debug('onerror', er);
                unpipe();
                dest.removeListener('error', onerror);
                if (EElistenerCount(dest, 'error') === 0)
                  dest.emit('error', er);
              }
              prependListener(dest, 'error', onerror);
              function onclose() {
                dest.removeListener('finish', onfinish);
                unpipe();
              }
              dest.once('close', onclose);
              function onfinish() {
                debug('onfinish');
                dest.removeListener('close', onclose);
                unpipe();
              }
              dest.once('finish', onfinish);
              function unpipe() {
                debug('unpipe');
                src.unpipe(dest);
              }
              dest.emit('pipe', src);
              if (!state.flowing) {
                debug('pipe resume');
                src.resume();
              }
              return dest;
            };
            function pipeOnDrain(src) {
              return function() {
                var state = src._readableState;
                debug('pipeOnDrain', state.awaitDrain);
                if (state.awaitDrain) state.awaitDrain--;
                if (state.awaitDrain === 0 && EElistenerCount(src, 'data')) {
                  state.flowing = true;
                  flow(src);
                }
              };
            }
            Readable.prototype.unpipe = function(dest) {
              var state = this._readableState;
              var unpipeInfo = { hasUnpiped: false };
              if (state.pipesCount === 0) return this;
              if (state.pipesCount === 1) {
                if (dest && dest !== state.pipes) return this;
                if (!dest) dest = state.pipes;
                state.pipes = null;
                state.pipesCount = 0;
                state.flowing = false;
                if (dest) dest.emit('unpipe', this, unpipeInfo);
                return this;
              }
              if (!dest) {
                var dests = state.pipes;
                var len = state.pipesCount;
                state.pipes = null;
                state.pipesCount = 0;
                state.flowing = false;
                for (var i = 0; i < len; i++) {
                  dests[i].emit('unpipe', this, unpipeInfo);
                }
                return this;
              }
              var index = indexOf(state.pipes, dest);
              if (index === -1) return this;
              state.pipes.splice(index, 1);
              state.pipesCount -= 1;
              if (state.pipesCount === 1) state.pipes = state.pipes[0];
              dest.emit('unpipe', this, unpipeInfo);
              return this;
            };
            Readable.prototype.on = function(ev, fn) {
              var res = Stream.prototype.on.call(this, ev, fn);
              if (ev === 'data') {
                if (this._readableState.flowing !== false) this.resume();
              } else if (ev === 'readable') {
                var state = this._readableState;
                if (!state.endEmitted && !state.readableListening) {
                  state.readableListening = state.needReadable = true;
                  state.emittedReadable = false;
                  if (!state.reading) {
                    processNextTick(nReadingNextTick, this);
                  } else if (state.length) {
                    emitReadable(this);
                  }
                }
              }
              return res;
            };
            Readable.prototype.addListener = Readable.prototype.on;
            function nReadingNextTick(self) {
              debug('readable nexttick read 0');
              self.read(0);
            }
            Readable.prototype.resume = function() {
              var state = this._readableState;
              if (!state.flowing) {
                debug('resume');
                state.flowing = true;
                resume(this, state);
              }
              return this;
            };
            function resume(stream, state) {
              if (!state.resumeScheduled) {
                state.resumeScheduled = true;
                processNextTick(resume_, stream, state);
              }
            }
            function resume_(stream, state) {
              if (!state.reading) {
                debug('resume read 0');
                stream.read(0);
              }
              state.resumeScheduled = false;
              state.awaitDrain = 0;
              stream.emit('resume');
              flow(stream);
              if (state.flowing && !state.reading) stream.read(0);
            }
            Readable.prototype.pause = function() {
              debug('call pause flowing=%j', this._readableState.flowing);
              if (false !== this._readableState.flowing) {
                debug('pause');
                this._readableState.flowing = false;
                this.emit('pause');
              }
              return this;
            };
            function flow(stream) {
              var state = stream._readableState;
              debug('flow', state.flowing);
              while (state.flowing && stream.read() !== null) {}
            }
            Readable.prototype.wrap = function(stream) {
              var state = this._readableState;
              var paused = false;
              var self = this;
              stream.on('end', function() {
                debug('wrapped end');
                if (state.decoder && !state.ended) {
                  var chunk = state.decoder.end();
                  if (chunk && chunk.length) self.push(chunk);
                }
                self.push(null);
              });
              stream.on('data', function(chunk) {
                debug('wrapped data');
                if (state.decoder) chunk = state.decoder.write(chunk);
                if (state.objectMode && (chunk === null || chunk === undefined))
                  return;
                else if (!state.objectMode && (!chunk || !chunk.length)) return;
                var ret = self.push(chunk);
                if (!ret) {
                  paused = true;
                  stream.pause();
                }
              });
              for (var i in stream) {
                if (this[i] === undefined && typeof stream[i] === 'function') {
                  this[i] = (function(method) {
                    return function() {
                      return stream[method].apply(stream, arguments);
                    };
                  })(i);
                }
              }
              for (var n = 0; n < kProxyEvents.length; n++) {
                stream.on(
                  kProxyEvents[n],
                  self.emit.bind(self, kProxyEvents[n])
                );
              }
              self._read = function(n) {
                debug('wrapped _read', n);
                if (paused) {
                  paused = false;
                  stream.resume();
                }
              };
              return self;
            };
            Readable._fromList = fromList;
            function fromList(n, state) {
              if (state.length === 0) return null;
              var ret;
              if (state.objectMode) ret = state.buffer.shift();
              else if (!n || n >= state.length) {
                if (state.decoder) ret = state.buffer.join('');
                else if (state.buffer.length === 1)
                  ret = state.buffer.head.data;
                else ret = state.buffer.concat(state.length);
                state.buffer.clear();
              } else {
                ret = fromListPartial(n, state.buffer, state.decoder);
              }
              return ret;
            }
            function fromListPartial(n, list, hasStrings) {
              var ret;
              if (n < list.head.data.length) {
                ret = list.head.data.slice(0, n);
                list.head.data = list.head.data.slice(n);
              } else if (n === list.head.data.length) {
                ret = list.shift();
              } else {
                ret = hasStrings
                  ? copyFromBufferString(n, list)
                  : copyFromBuffer(n, list);
              }
              return ret;
            }
            function copyFromBufferString(n, list) {
              var p = list.head;
              var c = 1;
              var ret = p.data;
              n -= ret.length;
              while ((p = p.next)) {
                var str = p.data;
                var nb = n > str.length ? str.length : n;
                if (nb === str.length) ret += str;
                else ret += str.slice(0, n);
                n -= nb;
                if (n === 0) {
                  if (nb === str.length) {
                    ++c;
                    if (p.next) list.head = p.next;
                    else list.head = list.tail = null;
                  } else {
                    list.head = p;
                    p.data = str.slice(nb);
                  }
                  break;
                }
                ++c;
              }
              list.length -= c;
              return ret;
            }
            function copyFromBuffer(n, list) {
              var ret = Buffer.allocUnsafe(n);
              var p = list.head;
              var c = 1;
              p.data.copy(ret);
              n -= p.data.length;
              while ((p = p.next)) {
                var buf = p.data;
                var nb = n > buf.length ? buf.length : n;
                buf.copy(ret, ret.length - n, 0, nb);
                n -= nb;
                if (n === 0) {
                  if (nb === buf.length) {
                    ++c;
                    if (p.next) list.head = p.next;
                    else list.head = list.tail = null;
                  } else {
                    list.head = p;
                    p.data = buf.slice(nb);
                  }
                  break;
                }
                ++c;
              }
              list.length -= c;
              return ret;
            }
            function endReadable(stream) {
              var state = stream._readableState;
              if (state.length > 0)
                throw new Error('"endReadable()" called on non-empty stream');
              if (!state.endEmitted) {
                state.ended = true;
                processNextTick(endReadableNT, state, stream);
              }
            }
            function endReadableNT(state, stream) {
              if (!state.endEmitted && state.length === 0) {
                state.endEmitted = true;
                stream.readable = false;
                stream.emit('end');
              }
            }
            function forEach(xs, f) {
              for (var i = 0, l = xs.length; i < l; i++) {
                f(xs[i], i);
              }
            }
            function indexOf(xs, x) {
              for (var i = 0, l = xs.length; i < l; i++) {
                if (xs[i] === x) return i;
              }
              return -1;
            }
          }.call(
            this,
            require('_process'),
            typeof global !== 'undefined'
              ? global
              : typeof self !== 'undefined'
                ? self
                : typeof window !== 'undefined'
                  ? window
                  : {}
          ));
        },
        {
          './_stream_duplex': 48,
          './internal/streams/BufferList': 53,
          './internal/streams/destroy': 54,
          './internal/streams/stream': 55,
          _process: 46,
          'core-util-is': 38,
          events: 39,
          inherits: 41,
          isarray: 43,
          'process-nextick-args': 45,
          'safe-buffer': 60,
          'string_decoder/': 62,
          util: 36
        }
      ],
      51: [
        function(require, module, exports) {
          'use strict';
          module.exports = Transform;
          var Duplex = require('./_stream_duplex');
          var util = require('core-util-is');
          util.inherits = require('inherits');
          util.inherits(Transform, Duplex);
          function TransformState(stream) {
            this.afterTransform = function(er, data) {
              return afterTransform(stream, er, data);
            };
            this.needTransform = false;
            this.transforming = false;
            this.writecb = null;
            this.writechunk = null;
            this.writeencoding = null;
          }
          function afterTransform(stream, er, data) {
            var ts = stream._transformState;
            ts.transforming = false;
            var cb = ts.writecb;
            if (!cb) {
              return stream.emit(
                'error',
                new Error('write callback called multiple times')
              );
            }
            ts.writechunk = null;
            ts.writecb = null;
            if (data !== null && data !== undefined) stream.push(data);
            cb(er);
            var rs = stream._readableState;
            rs.reading = false;
            if (rs.needReadable || rs.length < rs.highWaterMark) {
              stream._read(rs.highWaterMark);
            }
          }
          function Transform(options) {
            if (!(this instanceof Transform)) return new Transform(options);
            Duplex.call(this, options);
            this._transformState = new TransformState(this);
            var stream = this;
            this._readableState.needReadable = true;
            this._readableState.sync = false;
            if (options) {
              if (typeof options.transform === 'function')
                this._transform = options.transform;
              if (typeof options.flush === 'function')
                this._flush = options.flush;
            }
            this.once('prefinish', function() {
              if (typeof this._flush === 'function')
                this._flush(function(er, data) {
                  done(stream, er, data);
                });
              else done(stream);
            });
          }
          Transform.prototype.push = function(chunk, encoding) {
            this._transformState.needTransform = false;
            return Duplex.prototype.push.call(this, chunk, encoding);
          };
          Transform.prototype._transform = function(chunk, encoding, cb) {
            throw new Error('_transform() is not implemented');
          };
          Transform.prototype._write = function(chunk, encoding, cb) {
            var ts = this._transformState;
            ts.writecb = cb;
            ts.writechunk = chunk;
            ts.writeencoding = encoding;
            if (!ts.transforming) {
              var rs = this._readableState;
              if (
                ts.needTransform ||
                rs.needReadable ||
                rs.length < rs.highWaterMark
              )
                this._read(rs.highWaterMark);
            }
          };
          Transform.prototype._read = function(n) {
            var ts = this._transformState;
            if (ts.writechunk !== null && ts.writecb && !ts.transforming) {
              ts.transforming = true;
              this._transform(
                ts.writechunk,
                ts.writeencoding,
                ts.afterTransform
              );
            } else {
              ts.needTransform = true;
            }
          };
          Transform.prototype._destroy = function(err, cb) {
            var _this = this;
            Duplex.prototype._destroy.call(this, err, function(err2) {
              cb(err2);
              _this.emit('close');
            });
          };
          function done(stream, er, data) {
            if (er) return stream.emit('error', er);
            if (data !== null && data !== undefined) stream.push(data);
            var ws = stream._writableState;
            var ts = stream._transformState;
            if (ws.length)
              throw new Error('Calling transform done when ws.length != 0');
            if (ts.transforming)
              throw new Error('Calling transform done when still transforming');
            return stream.push(null);
          }
        },
        { './_stream_duplex': 48, 'core-util-is': 38, inherits: 41 }
      ],
      52: [
        function(require, module, exports) {
          (function(process, global) {
            'use strict';
            var processNextTick = require('process-nextick-args');
            module.exports = Writable;
            function WriteReq(chunk, encoding, cb) {
              this.chunk = chunk;
              this.encoding = encoding;
              this.callback = cb;
              this.next = null;
            }
            function CorkedRequest(state) {
              var _this = this;
              this.next = null;
              this.entry = null;
              this.finish = function() {
                onCorkedFinish(_this, state);
              };
            }
            var asyncWrite =
              !process.browser &&
              ['v0.10', 'v0.9.'].indexOf(process.version.slice(0, 5)) > -1
                ? setImmediate
                : processNextTick;
            var Duplex;
            Writable.WritableState = WritableState;
            var util = require('core-util-is');
            util.inherits = require('inherits');
            var internalUtil = { deprecate: require('util-deprecate') };
            var Stream = require('./internal/streams/stream');
            var Buffer = require('safe-buffer').Buffer;
            var OurUint8Array = global.Uint8Array || function() {};
            function _uint8ArrayToBuffer(chunk) {
              return Buffer.from(chunk);
            }
            function _isUint8Array(obj) {
              return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
            }
            var destroyImpl = require('./internal/streams/destroy');
            util.inherits(Writable, Stream);
            function nop() {}
            function WritableState(options, stream) {
              Duplex = Duplex || require('./_stream_duplex');
              options = options || {};
              this.objectMode = !!options.objectMode;
              if (stream instanceof Duplex)
                this.objectMode =
                  this.objectMode || !!options.writableObjectMode;
              var hwm = options.highWaterMark;
              var defaultHwm = this.objectMode ? 16 : 16 * 1024;
              this.highWaterMark = hwm || hwm === 0 ? hwm : defaultHwm;
              this.highWaterMark = Math.floor(this.highWaterMark);
              this.finalCalled = false;
              this.needDrain = false;
              this.ending = false;
              this.ended = false;
              this.finished = false;
              this.destroyed = false;
              var noDecode = options.decodeStrings === false;
              this.decodeStrings = !noDecode;
              this.defaultEncoding = options.defaultEncoding || 'utf8';
              this.length = 0;
              this.writing = false;
              this.corked = 0;
              this.sync = true;
              this.bufferProcessing = false;
              this.onwrite = function(er) {
                onwrite(stream, er);
              };
              this.writecb = null;
              this.writelen = 0;
              this.bufferedRequest = null;
              this.lastBufferedRequest = null;
              this.pendingcb = 0;
              this.prefinished = false;
              this.errorEmitted = false;
              this.bufferedRequestCount = 0;
              this.corkedRequestsFree = new CorkedRequest(this);
            }
            WritableState.prototype.getBuffer = function getBuffer() {
              var current = this.bufferedRequest;
              var out = [];
              while (current) {
                out.push(current);
                current = current.next;
              }
              return out;
            };
            (function() {
              try {
                Object.defineProperty(WritableState.prototype, 'buffer', {
                  get: internalUtil.deprecate(
                    function() {
                      return this.getBuffer();
                    },
                    '_writableState.buffer is deprecated. Use _writableState.getBuffer ' +
                      'instead.',
                    'DEP0003'
                  )
                });
              } catch (_) {}
            })();
            var realHasInstance;
            if (
              typeof Symbol === 'function' &&
              Symbol.hasInstance &&
              typeof Function.prototype[Symbol.hasInstance] === 'function'
            ) {
              realHasInstance = Function.prototype[Symbol.hasInstance];
              Object.defineProperty(Writable, Symbol.hasInstance, {
                value: function(object) {
                  if (realHasInstance.call(this, object)) return true;
                  return (
                    object && object._writableState instanceof WritableState
                  );
                }
              });
            } else {
              realHasInstance = function(object) {
                return object instanceof this;
              };
            }
            function Writable(options) {
              Duplex = Duplex || require('./_stream_duplex');
              if (
                !realHasInstance.call(Writable, this) &&
                !(this instanceof Duplex)
              ) {
                return new Writable(options);
              }
              this._writableState = new WritableState(options, this);
              this.writable = true;
              if (options) {
                if (typeof options.write === 'function')
                  this._write = options.write;
                if (typeof options.writev === 'function')
                  this._writev = options.writev;
                if (typeof options.destroy === 'function')
                  this._destroy = options.destroy;
                if (typeof options.final === 'function')
                  this._final = options.final;
              }
              Stream.call(this);
            }
            Writable.prototype.pipe = function() {
              this.emit('error', new Error('Cannot pipe, not readable'));
            };
            function writeAfterEnd(stream, cb) {
              var er = new Error('write after end');
              stream.emit('error', er);
              processNextTick(cb, er);
            }
            function validChunk(stream, state, chunk, cb) {
              var valid = true;
              var er = false;
              if (chunk === null) {
                er = new TypeError('May not write null values to stream');
              } else if (
                typeof chunk !== 'string' &&
                chunk !== undefined &&
                !state.objectMode
              ) {
                er = new TypeError('Invalid non-string/buffer chunk');
              }
              if (er) {
                stream.emit('error', er);
                processNextTick(cb, er);
                valid = false;
              }
              return valid;
            }
            Writable.prototype.write = function(chunk, encoding, cb) {
              var state = this._writableState;
              var ret = false;
              var isBuf = _isUint8Array(chunk) && !state.objectMode;
              if (isBuf && !Buffer.isBuffer(chunk)) {
                chunk = _uint8ArrayToBuffer(chunk);
              }
              if (typeof encoding === 'function') {
                cb = encoding;
                encoding = null;
              }
              if (isBuf) encoding = 'buffer';
              else if (!encoding) encoding = state.defaultEncoding;
              if (typeof cb !== 'function') cb = nop;
              if (state.ended) writeAfterEnd(this, cb);
              else if (isBuf || validChunk(this, state, chunk, cb)) {
                state.pendingcb++;
                ret = writeOrBuffer(this, state, isBuf, chunk, encoding, cb);
              }
              return ret;
            };
            Writable.prototype.cork = function() {
              var state = this._writableState;
              state.corked++;
            };
            Writable.prototype.uncork = function() {
              var state = this._writableState;
              if (state.corked) {
                state.corked--;
                if (
                  !state.writing &&
                  !state.corked &&
                  !state.finished &&
                  !state.bufferProcessing &&
                  state.bufferedRequest
                )
                  clearBuffer(this, state);
              }
            };
            Writable.prototype.setDefaultEncoding = function setDefaultEncoding(
              encoding
            ) {
              if (typeof encoding === 'string')
                encoding = encoding.toLowerCase();
              if (
                !(
                  [
                    'hex',
                    'utf8',
                    'utf-8',
                    'ascii',
                    'binary',
                    'base64',
                    'ucs2',
                    'ucs-2',
                    'utf16le',
                    'utf-16le',
                    'raw'
                  ].indexOf((encoding + '').toLowerCase()) > -1
                )
              )
                throw new TypeError('Unknown encoding: ' + encoding);
              this._writableState.defaultEncoding = encoding;
              return this;
            };
            function decodeChunk(state, chunk, encoding) {
              if (
                !state.objectMode &&
                state.decodeStrings !== false &&
                typeof chunk === 'string'
              ) {
                chunk = Buffer.from(chunk, encoding);
              }
              return chunk;
            }
            function writeOrBuffer(stream, state, isBuf, chunk, encoding, cb) {
              if (!isBuf) {
                var newChunk = decodeChunk(state, chunk, encoding);
                if (chunk !== newChunk) {
                  isBuf = true;
                  encoding = 'buffer';
                  chunk = newChunk;
                }
              }
              var len = state.objectMode ? 1 : chunk.length;
              state.length += len;
              var ret = state.length < state.highWaterMark;
              if (!ret) state.needDrain = true;
              if (state.writing || state.corked) {
                var last = state.lastBufferedRequest;
                state.lastBufferedRequest = {
                  chunk: chunk,
                  encoding: encoding,
                  isBuf: isBuf,
                  callback: cb,
                  next: null
                };
                if (last) {
                  last.next = state.lastBufferedRequest;
                } else {
                  state.bufferedRequest = state.lastBufferedRequest;
                }
                state.bufferedRequestCount += 1;
              } else {
                doWrite(stream, state, false, len, chunk, encoding, cb);
              }
              return ret;
            }
            function doWrite(stream, state, writev, len, chunk, encoding, cb) {
              state.writelen = len;
              state.writecb = cb;
              state.writing = true;
              state.sync = true;
              if (writev) stream._writev(chunk, state.onwrite);
              else stream._write(chunk, encoding, state.onwrite);
              state.sync = false;
            }
            function onwriteError(stream, state, sync, er, cb) {
              --state.pendingcb;
              if (sync) {
                processNextTick(cb, er);
                processNextTick(finishMaybe, stream, state);
                stream._writableState.errorEmitted = true;
                stream.emit('error', er);
              } else {
                cb(er);
                stream._writableState.errorEmitted = true;
                stream.emit('error', er);
                finishMaybe(stream, state);
              }
            }
            function onwriteStateUpdate(state) {
              state.writing = false;
              state.writecb = null;
              state.length -= state.writelen;
              state.writelen = 0;
            }
            function onwrite(stream, er) {
              var state = stream._writableState;
              var sync = state.sync;
              var cb = state.writecb;
              onwriteStateUpdate(state);
              if (er) onwriteError(stream, state, sync, er, cb);
              else {
                var finished = needFinish(state);
                if (
                  !finished &&
                  !state.corked &&
                  !state.bufferProcessing &&
                  state.bufferedRequest
                ) {
                  clearBuffer(stream, state);
                }
                if (sync) {
                  asyncWrite(afterWrite, stream, state, finished, cb);
                } else {
                  afterWrite(stream, state, finished, cb);
                }
              }
            }
            function afterWrite(stream, state, finished, cb) {
              if (!finished) onwriteDrain(stream, state);
              state.pendingcb--;
              cb();
              finishMaybe(stream, state);
            }
            function onwriteDrain(stream, state) {
              if (state.length === 0 && state.needDrain) {
                state.needDrain = false;
                stream.emit('drain');
              }
            }
            function clearBuffer(stream, state) {
              state.bufferProcessing = true;
              var entry = state.bufferedRequest;
              if (stream._writev && entry && entry.next) {
                var l = state.bufferedRequestCount;
                var buffer = new Array(l);
                var holder = state.corkedRequestsFree;
                holder.entry = entry;
                var count = 0;
                var allBuffers = true;
                while (entry) {
                  buffer[count] = entry;
                  if (!entry.isBuf) allBuffers = false;
                  entry = entry.next;
                  count += 1;
                }
                buffer.allBuffers = allBuffers;
                doWrite(
                  stream,
                  state,
                  true,
                  state.length,
                  buffer,
                  '',
                  holder.finish
                );
                state.pendingcb++;
                state.lastBufferedRequest = null;
                if (holder.next) {
                  state.corkedRequestsFree = holder.next;
                  holder.next = null;
                } else {
                  state.corkedRequestsFree = new CorkedRequest(state);
                }
              } else {
                while (entry) {
                  var chunk = entry.chunk;
                  var encoding = entry.encoding;
                  var cb = entry.callback;
                  var len = state.objectMode ? 1 : chunk.length;
                  doWrite(stream, state, false, len, chunk, encoding, cb);
                  entry = entry.next;
                  if (state.writing) {
                    break;
                  }
                }
                if (entry === null) state.lastBufferedRequest = null;
              }
              state.bufferedRequestCount = 0;
              state.bufferedRequest = entry;
              state.bufferProcessing = false;
            }
            Writable.prototype._write = function(chunk, encoding, cb) {
              cb(new Error('_write() is not implemented'));
            };
            Writable.prototype._writev = null;
            Writable.prototype.end = function(chunk, encoding, cb) {
              var state = this._writableState;
              if (typeof chunk === 'function') {
                cb = chunk;
                chunk = null;
                encoding = null;
              } else if (typeof encoding === 'function') {
                cb = encoding;
                encoding = null;
              }
              if (chunk !== null && chunk !== undefined)
                this.write(chunk, encoding);
              if (state.corked) {
                state.corked = 1;
                this.uncork();
              }
              if (!state.ending && !state.finished)
                endWritable(this, state, cb);
            };
            function needFinish(state) {
              return (
                state.ending &&
                state.length === 0 &&
                state.bufferedRequest === null &&
                !state.finished &&
                !state.writing
              );
            }
            function callFinal(stream, state) {
              stream._final(function(err) {
                state.pendingcb--;
                if (err) {
                  stream.emit('error', err);
                }
                state.prefinished = true;
                stream.emit('prefinish');
                finishMaybe(stream, state);
              });
            }
            function prefinish(stream, state) {
              if (!state.prefinished && !state.finalCalled) {
                if (typeof stream._final === 'function') {
                  state.pendingcb++;
                  state.finalCalled = true;
                  processNextTick(callFinal, stream, state);
                } else {
                  state.prefinished = true;
                  stream.emit('prefinish');
                }
              }
            }
            function finishMaybe(stream, state) {
              var need = needFinish(state);
              if (need) {
                prefinish(stream, state);
                if (state.pendingcb === 0) {
                  state.finished = true;
                  stream.emit('finish');
                }
              }
              return need;
            }
            function endWritable(stream, state, cb) {
              state.ending = true;
              finishMaybe(stream, state);
              if (cb) {
                if (state.finished) processNextTick(cb);
                else stream.once('finish', cb);
              }
              state.ended = true;
              stream.writable = false;
            }
            function onCorkedFinish(corkReq, state, err) {
              var entry = corkReq.entry;
              corkReq.entry = null;
              while (entry) {
                var cb = entry.callback;
                state.pendingcb--;
                cb(err);
                entry = entry.next;
              }
              if (state.corkedRequestsFree) {
                state.corkedRequestsFree.next = corkReq;
              } else {
                state.corkedRequestsFree = corkReq;
              }
            }
            Object.defineProperty(Writable.prototype, 'destroyed', {
              get: function() {
                if (this._writableState === undefined) {
                  return false;
                }
                return this._writableState.destroyed;
              },
              set: function(value) {
                if (!this._writableState) {
                  return;
                }
                this._writableState.destroyed = value;
              }
            });
            Writable.prototype.destroy = destroyImpl.destroy;
            Writable.prototype._undestroy = destroyImpl.undestroy;
            Writable.prototype._destroy = function(err, cb) {
              this.end();
              cb(err);
            };
          }.call(
            this,
            require('_process'),
            typeof global !== 'undefined'
              ? global
              : typeof self !== 'undefined'
                ? self
                : typeof window !== 'undefined'
                  ? window
                  : {}
          ));
        },
        {
          './_stream_duplex': 48,
          './internal/streams/destroy': 54,
          './internal/streams/stream': 55,
          _process: 46,
          'core-util-is': 38,
          inherits: 41,
          'process-nextick-args': 45,
          'safe-buffer': 60,
          'util-deprecate': 63
        }
      ],
      53: [
        function(require, module, exports) {
          'use strict';
          function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor)) {
              throw new TypeError('Cannot call a class as a function');
            }
          }
          var Buffer = require('safe-buffer').Buffer;
          function copyBuffer(src, target, offset) {
            src.copy(target, offset);
          }
          module.exports = (function() {
            function BufferList() {
              _classCallCheck(this, BufferList);
              this.head = null;
              this.tail = null;
              this.length = 0;
            }
            BufferList.prototype.push = function push(v) {
              var entry = { data: v, next: null };
              if (this.length > 0) this.tail.next = entry;
              else this.head = entry;
              this.tail = entry;
              ++this.length;
            };
            BufferList.prototype.unshift = function unshift(v) {
              var entry = { data: v, next: this.head };
              if (this.length === 0) this.tail = entry;
              this.head = entry;
              ++this.length;
            };
            BufferList.prototype.shift = function shift() {
              if (this.length === 0) return;
              var ret = this.head.data;
              if (this.length === 1) this.head = this.tail = null;
              else this.head = this.head.next;
              --this.length;
              return ret;
            };
            BufferList.prototype.clear = function clear() {
              this.head = this.tail = null;
              this.length = 0;
            };
            BufferList.prototype.join = function join(s) {
              if (this.length === 0) return '';
              var p = this.head;
              var ret = '' + p.data;
              while ((p = p.next)) {
                ret += s + p.data;
              }
              return ret;
            };
            BufferList.prototype.concat = function concat(n) {
              if (this.length === 0) return Buffer.alloc(0);
              if (this.length === 1) return this.head.data;
              var ret = Buffer.allocUnsafe(n >>> 0);
              var p = this.head;
              var i = 0;
              while (p) {
                copyBuffer(p.data, ret, i);
                i += p.data.length;
                p = p.next;
              }
              return ret;
            };
            return BufferList;
          })();
        },
        { 'safe-buffer': 60 }
      ],
      54: [
        function(require, module, exports) {
          'use strict';
          var processNextTick = require('process-nextick-args');
          function destroy(err, cb) {
            var _this = this;
            var readableDestroyed =
              this._readableState && this._readableState.destroyed;
            var writableDestroyed =
              this._writableState && this._writableState.destroyed;
            if (readableDestroyed || writableDestroyed) {
              if (cb) {
                cb(err);
              } else if (
                err &&
                (!this._writableState || !this._writableState.errorEmitted)
              ) {
                processNextTick(emitErrorNT, this, err);
              }
              return;
            }
            if (this._readableState) {
              this._readableState.destroyed = true;
            }
            if (this._writableState) {
              this._writableState.destroyed = true;
            }
            this._destroy(err || null, function(err) {
              if (!cb && err) {
                processNextTick(emitErrorNT, _this, err);
                if (_this._writableState) {
                  _this._writableState.errorEmitted = true;
                }
              } else if (cb) {
                cb(err);
              }
            });
          }
          function undestroy() {
            if (this._readableState) {
              this._readableState.destroyed = false;
              this._readableState.reading = false;
              this._readableState.ended = false;
              this._readableState.endEmitted = false;
            }
            if (this._writableState) {
              this._writableState.destroyed = false;
              this._writableState.ended = false;
              this._writableState.ending = false;
              this._writableState.finished = false;
              this._writableState.errorEmitted = false;
            }
          }
          function emitErrorNT(self, err) {
            self.emit('error', err);
          }
          module.exports = { destroy: destroy, undestroy: undestroy };
        },
        { 'process-nextick-args': 45 }
      ],
      55: [
        function(require, module, exports) {
          module.exports = require('events').EventEmitter;
        },
        { events: 39 }
      ],
      56: [
        function(require, module, exports) {
          module.exports = require('./readable').PassThrough;
        },
        { './readable': 57 }
      ],
      57: [
        function(require, module, exports) {
          exports = module.exports = require('./lib/_stream_readable.js');
          exports.Stream = exports;
          exports.Readable = exports;
          exports.Writable = require('./lib/_stream_writable.js');
          exports.Duplex = require('./lib/_stream_duplex.js');
          exports.Transform = require('./lib/_stream_transform.js');
          exports.PassThrough = require('./lib/_stream_passthrough.js');
        },
        {
          './lib/_stream_duplex.js': 48,
          './lib/_stream_passthrough.js': 49,
          './lib/_stream_readable.js': 50,
          './lib/_stream_transform.js': 51,
          './lib/_stream_writable.js': 52
        }
      ],
      58: [
        function(require, module, exports) {
          module.exports = require('./readable').Transform;
        },
        { './readable': 57 }
      ],
      59: [
        function(require, module, exports) {
          module.exports = require('./lib/_stream_writable.js');
        },
        { './lib/_stream_writable.js': 52 }
      ],
      60: [
        function(require, module, exports) {
          var buffer = require('buffer');
          var Buffer = buffer.Buffer;
          function copyProps(src, dst) {
            for (var key in src) {
              dst[key] = src[key];
            }
          }
          if (
            Buffer.from &&
            Buffer.alloc &&
            Buffer.allocUnsafe &&
            Buffer.allocUnsafeSlow
          ) {
            module.exports = buffer;
          } else {
            copyProps(buffer, exports);
            exports.Buffer = SafeBuffer;
          }
          function SafeBuffer(arg, encodingOrOffset, length) {
            return Buffer(arg, encodingOrOffset, length);
          }
          copyProps(Buffer, SafeBuffer);
          SafeBuffer.from = function(arg, encodingOrOffset, length) {
            if (typeof arg === 'number') {
              throw new TypeError('Argument must not be a number');
            }
            return Buffer(arg, encodingOrOffset, length);
          };
          SafeBuffer.alloc = function(size, fill, encoding) {
            if (typeof size !== 'number') {
              throw new TypeError('Argument must be a number');
            }
            var buf = Buffer(size);
            if (fill !== undefined) {
              if (typeof encoding === 'string') {
                buf.fill(fill, encoding);
              } else {
                buf.fill(fill);
              }
            } else {
              buf.fill(0);
            }
            return buf;
          };
          SafeBuffer.allocUnsafe = function(size) {
            if (typeof size !== 'number') {
              throw new TypeError('Argument must be a number');
            }
            return Buffer(size);
          };
          SafeBuffer.allocUnsafeSlow = function(size) {
            if (typeof size !== 'number') {
              throw new TypeError('Argument must be a number');
            }
            return buffer.SlowBuffer(size);
          };
        },
        { buffer: 37 }
      ],
      61: [
        function(require, module, exports) {
          module.exports = Stream;
          var EE = require('events').EventEmitter;
          var inherits = require('inherits');
          inherits(Stream, EE);
          Stream.Readable = require('readable-stream/readable.js');
          Stream.Writable = require('readable-stream/writable.js');
          Stream.Duplex = require('readable-stream/duplex.js');
          Stream.Transform = require('readable-stream/transform.js');
          Stream.PassThrough = require('readable-stream/passthrough.js');
          Stream.Stream = Stream;
          function Stream() {
            EE.call(this);
          }
          Stream.prototype.pipe = function(dest, options) {
            var source = this;
            function ondata(chunk) {
              if (dest.writable) {
                if (false === dest.write(chunk) && source.pause) {
                  source.pause();
                }
              }
            }
            source.on('data', ondata);
            function ondrain() {
              if (source.readable && source.resume) {
                source.resume();
              }
            }
            dest.on('drain', ondrain);
            if (!dest._isStdio && (!options || options.end !== false)) {
              source.on('end', onend);
              source.on('close', onclose);
            }
            var didOnEnd = false;
            function onend() {
              if (didOnEnd) return;
              didOnEnd = true;
              dest.end();
            }
            function onclose() {
              if (didOnEnd) return;
              didOnEnd = true;
              if (typeof dest.destroy === 'function') dest.destroy();
            }
            function onerror(er) {
              cleanup();
              if (EE.listenerCount(this, 'error') === 0) {
                throw er;
              }
            }
            source.on('error', onerror);
            dest.on('error', onerror);
            function cleanup() {
              source.removeListener('data', ondata);
              dest.removeListener('drain', ondrain);
              source.removeListener('end', onend);
              source.removeListener('close', onclose);
              source.removeListener('error', onerror);
              dest.removeListener('error', onerror);
              source.removeListener('end', cleanup);
              source.removeListener('close', cleanup);
              dest.removeListener('close', cleanup);
            }
            source.on('end', cleanup);
            source.on('close', cleanup);
            dest.on('close', cleanup);
            dest.emit('pipe', source);
            return dest;
          };
        },
        {
          events: 39,
          inherits: 41,
          'readable-stream/duplex.js': 47,
          'readable-stream/passthrough.js': 56,
          'readable-stream/readable.js': 57,
          'readable-stream/transform.js': 58,
          'readable-stream/writable.js': 59
        }
      ],
      62: [
        function(require, module, exports) {
          'use strict';
          var Buffer = require('safe-buffer').Buffer;
          var isEncoding =
            Buffer.isEncoding ||
            function(encoding) {
              encoding = '' + encoding;
              switch (encoding && encoding.toLowerCase()) {
                case 'hex':
                case 'utf8':
                case 'utf-8':
                case 'ascii':
                case 'binary':
                case 'base64':
                case 'ucs2':
                case 'ucs-2':
                case 'utf16le':
                case 'utf-16le':
                case 'raw':
                  return true;
                default:
                  return false;
              }
            };
          function _normalizeEncoding(enc) {
            if (!enc) return 'utf8';
            var retried;
            while (true) {
              switch (enc) {
                case 'utf8':
                case 'utf-8':
                  return 'utf8';
                case 'ucs2':
                case 'ucs-2':
                case 'utf16le':
                case 'utf-16le':
                  return 'utf16le';
                case 'latin1':
                case 'binary':
                  return 'latin1';
                case 'base64':
                case 'ascii':
                case 'hex':
                  return enc;
                default:
                  if (retried) return;
                  enc = ('' + enc).toLowerCase();
                  retried = true;
              }
            }
          }
          function normalizeEncoding(enc) {
            var nenc = _normalizeEncoding(enc);
            if (
              typeof nenc !== 'string' &&
              (Buffer.isEncoding === isEncoding || !isEncoding(enc))
            )
              throw new Error('Unknown encoding: ' + enc);
            return nenc || enc;
          }
          exports.StringDecoder = StringDecoder;
          function StringDecoder(encoding) {
            this.encoding = normalizeEncoding(encoding);
            var nb;
            switch (this.encoding) {
              case 'utf16le':
                this.text = utf16Text;
                this.end = utf16End;
                nb = 4;
                break;
              case 'utf8':
                this.fillLast = utf8FillLast;
                nb = 4;
                break;
              case 'base64':
                this.text = base64Text;
                this.end = base64End;
                nb = 3;
                break;
              default:
                this.write = simpleWrite;
                this.end = simpleEnd;
                return;
            }
            this.lastNeed = 0;
            this.lastTotal = 0;
            this.lastChar = Buffer.allocUnsafe(nb);
          }
          StringDecoder.prototype.write = function(buf) {
            if (buf.length === 0) return '';
            var r;
            var i;
            if (this.lastNeed) {
              r = this.fillLast(buf);
              if (r === undefined) return '';
              i = this.lastNeed;
              this.lastNeed = 0;
            } else {
              i = 0;
            }
            if (i < buf.length)
              return r ? r + this.text(buf, i) : this.text(buf, i);
            return r || '';
          };
          StringDecoder.prototype.end = utf8End;
          StringDecoder.prototype.text = utf8Text;
          StringDecoder.prototype.fillLast = function(buf) {
            if (this.lastNeed <= buf.length) {
              buf.copy(
                this.lastChar,
                this.lastTotal - this.lastNeed,
                0,
                this.lastNeed
              );
              return this.lastChar.toString(this.encoding, 0, this.lastTotal);
            }
            buf.copy(
              this.lastChar,
              this.lastTotal - this.lastNeed,
              0,
              buf.length
            );
            this.lastNeed -= buf.length;
          };
          function utf8CheckByte(byte) {
            if (byte <= 127) return 0;
            else if (byte >> 5 === 6) return 2;
            else if (byte >> 4 === 14) return 3;
            else if (byte >> 3 === 30) return 4;
            return -1;
          }
          function utf8CheckIncomplete(self, buf, i) {
            var j = buf.length - 1;
            if (j < i) return 0;
            var nb = utf8CheckByte(buf[j]);
            if (nb >= 0) {
              if (nb > 0) self.lastNeed = nb - 1;
              return nb;
            }
            if (--j < i) return 0;
            nb = utf8CheckByte(buf[j]);
            if (nb >= 0) {
              if (nb > 0) self.lastNeed = nb - 2;
              return nb;
            }
            if (--j < i) return 0;
            nb = utf8CheckByte(buf[j]);
            if (nb >= 0) {
              if (nb > 0) {
                if (nb === 2) nb = 0;
                else self.lastNeed = nb - 3;
              }
              return nb;
            }
            return 0;
          }
          function utf8CheckExtraBytes(self, buf, p) {
            if ((buf[0] & 192) !== 128) {
              self.lastNeed = 0;
              return '�'.repeat(p);
            }
            if (self.lastNeed > 1 && buf.length > 1) {
              if ((buf[1] & 192) !== 128) {
                self.lastNeed = 1;
                return '�'.repeat(p + 1);
              }
              if (self.lastNeed > 2 && buf.length > 2) {
                if ((buf[2] & 192) !== 128) {
                  self.lastNeed = 2;
                  return '�'.repeat(p + 2);
                }
              }
            }
          }
          function utf8FillLast(buf) {
            var p = this.lastTotal - this.lastNeed;
            var r = utf8CheckExtraBytes(this, buf, p);
            if (r !== undefined) return r;
            if (this.lastNeed <= buf.length) {
              buf.copy(this.lastChar, p, 0, this.lastNeed);
              return this.lastChar.toString(this.encoding, 0, this.lastTotal);
            }
            buf.copy(this.lastChar, p, 0, buf.length);
            this.lastNeed -= buf.length;
          }
          function utf8Text(buf, i) {
            var total = utf8CheckIncomplete(this, buf, i);
            if (!this.lastNeed) return buf.toString('utf8', i);
            this.lastTotal = total;
            var end = buf.length - (total - this.lastNeed);
            buf.copy(this.lastChar, 0, end);
            return buf.toString('utf8', i, end);
          }
          function utf8End(buf) {
            var r = buf && buf.length ? this.write(buf) : '';
            if (this.lastNeed)
              return r + '�'.repeat(this.lastTotal - this.lastNeed);
            return r;
          }
          function utf16Text(buf, i) {
            if ((buf.length - i) % 2 === 0) {
              var r = buf.toString('utf16le', i);
              if (r) {
                var c = r.charCodeAt(r.length - 1);
                if (c >= 55296 && c <= 56319) {
                  this.lastNeed = 2;
                  this.lastTotal = 4;
                  this.lastChar[0] = buf[buf.length - 2];
                  this.lastChar[1] = buf[buf.length - 1];
                  return r.slice(0, -1);
                }
              }
              return r;
            }
            this.lastNeed = 1;
            this.lastTotal = 2;
            this.lastChar[0] = buf[buf.length - 1];
            return buf.toString('utf16le', i, buf.length - 1);
          }
          function utf16End(buf) {
            var r = buf && buf.length ? this.write(buf) : '';
            if (this.lastNeed) {
              var end = this.lastTotal - this.lastNeed;
              return r + this.lastChar.toString('utf16le', 0, end);
            }
            return r;
          }
          function base64Text(buf, i) {
            var n = (buf.length - i) % 3;
            if (n === 0) return buf.toString('base64', i);
            this.lastNeed = 3 - n;
            this.lastTotal = 3;
            if (n === 1) {
              this.lastChar[0] = buf[buf.length - 1];
            } else {
              this.lastChar[0] = buf[buf.length - 2];
              this.lastChar[1] = buf[buf.length - 1];
            }
            return buf.toString('base64', i, buf.length - n);
          }
          function base64End(buf) {
            var r = buf && buf.length ? this.write(buf) : '';
            if (this.lastNeed)
              return r + this.lastChar.toString('base64', 0, 3 - this.lastNeed);
            return r;
          }
          function simpleWrite(buf) {
            return buf.toString(this.encoding);
          }
          function simpleEnd(buf) {
            return buf && buf.length ? this.write(buf) : '';
          }
        },
        { 'safe-buffer': 60 }
      ],
      63: [
        function(require, module, exports) {
          (function(global) {
            module.exports = deprecate;
            function deprecate(fn, msg) {
              if (config('noDeprecation')) {
                return fn;
              }
              var warned = false;
              function deprecated() {
                if (!warned) {
                  if (config('throwDeprecation')) {
                    throw new Error(msg);
                  } else if (config('traceDeprecation')) {
                    console.trace(msg);
                  } else {
                    console.warn(msg);
                  }
                  warned = true;
                }
                return fn.apply(this, arguments);
              }
              return deprecated;
            }
            function config(name) {
              try {
                if (!global.localStorage) return false;
              } catch (_) {
                return false;
              }
              var val = global.localStorage[name];
              if (null == val) return false;
              return String(val).toLowerCase() === 'true';
            }
          }.call(
            this,
            typeof global !== 'undefined'
              ? global
              : typeof self !== 'undefined'
                ? self
                : typeof window !== 'undefined'
                  ? window
                  : {}
          ));
        },
        {}
      ]
    },
    {},
    [29]
  )(29);
});
