(function (root, factory) {
    if (typeof module != 'undefined' && module &&
        typeof exports == 'object' && exports && module.exports === exports) {
        // CommonJS
        module.exports = factory();
    }  else {
        // Global variable
        root.$ = factory();
    }
})(this, function() { 
    var utils = {};
    var hasOwn = Object.prototype.hasOwnProperty;
    var toString = Object.prototype.toString;
    var trim = String.prototype.trim;
    var indexOf = Array.prototype.indexOf;

    // Used for trimming whitespace
    var trimLeft = /^\s+/;
    var trimRight = /\s+$/;

    // JSON RegExp
    var rvalidchars = /^[\],:{}\s]*$/;
    var rvalidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;
    var rvalidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
    var rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g;

    var class2type = {};
    utils.ajax = require('./najax');
    
    utils.isArray = (function() {
        return Array.prototype.isArray ? Array.prototype.isArray :
            function(o) { return o.constructor ? o.constructor.name === 'Array' : false };
    })();
    
    utils.inArray = function( elem, array, i ) {
        var len;

        if ( array ) {
	    if ( indexOf ) {
	        return indexOf.call( array, elem, i );
	    }

	    len = array.length;
	    i = i ? i < 0 ? Math.max( 0, len + i ) : i : 0;

	    for ( ; i < len; i++ ) {
	        // Skip accessing in sparse arrays
	        if ( i in array && array[ i ] === elem ) {
		    return i;
	        }
	    }
        }

        return -1;
    },
    utils.isPlainObject = function isPlainObject(obj) {
	"use strict";
	if (!obj || toString.call(obj) !== '[object Object]' || obj.nodeType || obj.setInterval) {
	    return false;
	}

	    var has_own_constructor = hasOwn.call(obj, 'constructor');
	    var has_is_property_of_method = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
	// Not own constructor property must be Object
	if (obj.constructor && !has_own_constructor && !has_is_property_of_method) {
	    return false;
	}

	// Own properties are enumerated firstly, so to speed up,
	// if last one is own, then all properties are own.
	var key;
	for (key in obj) {}

	return key === undefined || hasOwn.call(obj, key);
    };

    utils.extend = function extend() {
	"use strict";
	    var options, name, src, copy, copyIsArray, clone,
	target = arguments[0],
	i = 1,
	length = arguments.length,
	deep = false;

	// Handle a deep copy situation
	if (typeof target === "boolean") {
	    deep = target;
	    target = arguments[1] || {};
	    // skip the boolean and the target
	    i = 2;
	} else if (typeof target !== "object" && typeof target !== "function" || target == undefined) {
	    target = {};
	}

	for (; i < length; ++i) {
	    // Only deal with non-null/undefined values
	    if ((options = arguments[i]) != null) {
		// Extend the base object
		for (name in options) {
		    src = target[name];
		    copy = options[name];

		    // Prevent never-ending loop
		    if (target === copy) {
			continue;
		    }

		    // Recurse if we're merging plain objects or arrays
		    if (deep && copy && (isPlainObject(copy) || (copyIsArray = Array.isArray(copy)))) {
			if (copyIsArray) {
			    copyIsArray = false;
			    clone = src && Array.isArray(src) ? src : [];
			} else {
			    clone = src && isPlainObject(src) ? src : {};
			}

			// Never move original objects, clone them
			target[name] = extend(deep, clone, copy);

			// Don't bring in undefined values
		    } else if (copy !== undefined) {
			target[name] = copy;
		    }
		}
	    }
	}

	// Return the modified object
	return target;
    };
    
    utils.type = function ( obj ) {
	return obj == null ?
	    String( obj ) :
	    class2type[ toString.call(obj) ] || "object";
    };
    
    utils.each = function ( object, callback, args ) {
	var name, i = 0,
	length = object.length,
	isObj = length === undefined || utils.isFunction( object );

	if ( args ) {
	    if ( isObj ) {
		for ( name in object ) {
		    if ( callback.apply( object[ name ], args ) === false ) {
			break;
		    }
		}
	    } else {
		for ( ; i < length; ) {
		    if ( callback.apply( object[ i++ ], args ) === false ) {
			break;
		    }
		}
	    }

	    // A special, fast, case for the most common use of each
	} else {
	    if ( isObj ) {
		for ( name in object ) {
		    if ( callback.call( object[ name ], name, object[ name ] ) === false ) {
			break;
		    }
		}
	    } else {
		for ( ; i < length; ) {
		    if ( callback.call( object[ i ], i, object[ i++ ] ) === false ) {
			break;
		    }
		}
	    }
	}

	return object;
    };
    
    utils.isFunction = function ( obj ) {
	return utils.type(obj) === "function";
    };

    utils.trim =  trim ?
	function( text ) {
	    return text == null ?
		"" :
		trim.call( text );
	} :

    // Otherwise use our own trimming functionality
    function( text ) {
	return text == null ?
	    "" :
	    text.toString().replace( trimLeft, "" ).replace( trimRight, "" );
    };


    //===============================
    utils.parseJSON = function ( data ) {
	if ( typeof data !== "string" || !data ) {
	    return null;
	}

	// Make sure leading/trailing whitespace is removed (IE can't handle it)
	data = utils.trim( data );

	// Attempt to parse using the native JSON parser first
	if ( this && this.JSON && this.JSON.parse ) {
	    return this.JSON.parse( data );
	}
        
        if (typeof JSON !== 'undefined') {
            return JSON.parse(data);
        }

	// Make sure the incoming data is actual JSON
	// Logic borrowed from http://json.org/json2.js
	if ( rvalidchars.test( data.replace( rvalidescape, "@" )
			       .replace( rvalidtokens, "]" )
			       .replace( rvalidbraces, "")) ) {

	    return ( new Function( "return " + data ) )();

	}
	throw Error( "Invalid JSON: " + data );
    }
    
    utils.each("Boolean Number String Function Array Date RegExp Object".split(" "), function(i, name) {
        class2type[ "[object " + name + "]" ] = name.toLowerCase();
    });
    
    return utils;

});


// var $ = module.exports;
// console.log($);


// console.log($.inArray(1, [1,2,3, 4], 1));
// console.log($.extend({b:1}, { a: 1}));
// console.log($.type(1));
// $.each([1,2,3], function(i, v) { console.log(i,v); });
// $.each({ a:1, b:2 }, function(i, v) { console.log(i,v); });
// console.log($.parseJSON(JSON.stringify({a:1})));
// console.log(JSON.parse(JSON.stringify({a:1})));





    // utils.extend = function () {
    //     var options, name, src, copy, copyIsArray, clone,
    //     target = arguments[0] || {},
    //     i = 1,
    //     length = arguments.length,
    //     deep = false;

    //     // Handle a deep copy situation
    //     if ( typeof target === "boolean" ) {
    //         deep = target;
    //         target = arguments[1] || {};
    //         // skip the boolean and the target
    //         i = 2;
    //     }

    //     // Handle case when target is a string or something (possible in deep copy)
    //     if ( typeof target !== "object" && !utils.isFunction(target) ) {
    //         target = {};
    //     }

    //     // extend jQuery itself if only one argument is passed
    //     if ( length === i ) {
    //         target = this;
    //         --i;
    //     }

    //     for ( ; i < length; i++ ) {
    //         // Only deal with non-null/undefined values
    //         if ( (options = arguments[ i ]) != null ) {
    //     	// Extend the base object
    //     	for ( name in options ) {
    //     	    src = target[ name ];
    //     	    copy = options[ name ];

    //     	    // Prevent never-ending loop
    //     	    if ( target === copy ) {
    //     		continue;
    //     	    }

    //     	    // Recurse if we're merging plain objects or arrays
    //     	    if ( deep && copy && ( utils.isPlainObject(copy) || (copyIsArray = utils.isArray(copy)) ) ) {
    //     		if ( copyIsArray ) {
    //     		    copyIsArray = false;
    //     		    clone = src && utils.isArray(src) ? src : [];

    //     		} else {
    //     		    clone = src && utils.isPlainObject(src) ? src : {};
    //     		}

    //     		// Never move original objects, clone them
    //     		target[ name ] = utils.extend( deep, clone, copy );

    //     		// Don't bring in undefined values
    //     	    } else if ( copy !== undefined ) {
    //     		target[ name ] = copy;
    //     	    }
    //     	}
    //         }
    //     }

    //     // Return the modified object
    //     return target;
    // }


    // utils.isPlainObject = function ( obj ) {
    //     // Must be an Object.
    //     // Because of IE, we also have to check the presence of the constructor property.
    //     // Make sure that DOM nodes and window objects don't pass through, as well
    //     if ( !obj || utils.type(obj) !== "object" || obj.nodeType
    //          || jQuery.isWindow( obj ) ) {
    //         return false;
    //     }

    //     try {
    //         // Not own constructor property must be Object
    //         if ( obj.constructor &&
    //     	 !hasOwn.call(obj, "constructor") &&
    //     	 !hasOwn.call(obj.constructor.prototype, "isPrototypeOf") ) {
    //     	return false;
    //         }
    //     } catch ( e ) {
    //         // IE8,9 Will throw exceptions on certain host objects #9897
    //         return false;
    //     }

    //     // Own properties are enumerated firstly, so to speed up,
    //     // if last one is own, then all properties are own.

    //     var key;
    //     for ( key in obj ) {}

    //     return key === undefined || hasOwn.call( obj, key );
    // };
