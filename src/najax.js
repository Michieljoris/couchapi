/*
 * najax
 * https://github.com/alanclarke/najax
 *
 * Copyright (c) 2012 Alan Clarke
 * Licensed under the MIT license.
 */

var https   = require('https'),
http        = require('http'),
querystring = require('querystring'),
url         = require('url'),
    
$           = require('jquery-deferred'),
_           = require('underscore'),
default_settings = { type: 'GET' },
najax       = module.exports = request;

var encode = encodeURIComponent;
var decode = decodeURIComponent;
var AuthSession;

/// Serialize the a name value pair into a cookie string suitable for
/// http headers. An optional options object specified cookie parameters
///
/// serialize('foo', 'bar', { httpOnly: true })
///   => "foo=bar; httpOnly"
///
/// @param {String} name
/// @param {String} val
/// @param {Object} options
/// @return {String}
var serialize = function(name, val, opt){
    opt = opt || {};
    var enc = opt.encode || encode;
    var pairs = [name + '=' + enc(val)];

    if (null != opt.maxAge) {
        var maxAge = opt.maxAge - 0;
        if (isNaN(maxAge)) throw new Error('maxAge should be a Number');
        pairs.push('Max-Age=' + maxAge);
    }

    if (opt.domain) pairs.push('Domain=' + opt.domain);
    if (opt.path) pairs.push('Path=' + opt.path);
    if (opt.expires) pairs.push('Expires=' + opt.expires.toUTCString());
    if (opt.httpOnly) pairs.push('HttpOnly');
    if (opt.secure) pairs.push('Secure');

    return pairs.join('; ');
};

/// Parse the given cookie header string into an object
/// The object has the various cookies as keys(names) => values
/// @param {String} str
/// @return {Object}
var parse = function(str, opt) {
    opt = opt || {};
    var obj = {};
    var pairs = str.split(/; */);
    var dec = opt.decode || decode;

    pairs.forEach(function(pair) {
        var eq_idx = pair.indexOf('=');

        // skip things that don't look like key=value
        if (eq_idx < 0) {
            return;
        }

        var key = pair.substr(0, eq_idx).trim();
        var val = pair.substr(++eq_idx, pair.length).trim();

        // quoted values
        if ('"' == val[0]) {
            val = val.slice(1, -1);
        }

        // only assign once
        if (undefined == obj[key]) {
            try {
                obj[key] = dec(val);
            } catch (e) {
                obj[key] = val;
            }
        }
    });

    return obj;
};

// module.exports.serialize = serialize;
// module.exports.parse = parse;


/* set default settings */
module.exports.defaults = function(opts) {
	return _.extend(default_settings, opts);
};

function _parseOptions(options, a, b){
    var args = [], opts = _.extend({}, default_settings); ;
    if (_.isString(options)) { opts.url = options; }
    else { _.extend(opts, options); }
    _.each([a, b], function(fn) {
        if (_.isFunction(fn)) { opts.complete = fn; }
    });
    if (!_.isFunction(a)) { _.extend(opts, a); }
    return opts;
}

/* auto rest interface go! */
_.each('get post put delete'.split(' '),function(method){
	najax[method] = module.exports[method] = function(options, a, b) {
		var opts = _parseOptions(options, a, b);
		opts.type = method.toUpperCase();
		return najax(opts);
	};
});

/* main function definition */
function request(options, a, b) {
    // console.log('options pure\n', options, a,b);
    //OPTIONS
    /* 
       method overloading, can use:
       -function(url, opts, callback) or 
       -function(url, callback)
       -function(opts)
    */
	

    if (_.isString(options) || _.isFunction(a)) {
	return request(_parseOptions(options, a, b));
    }

    var dfd = new $.Deferred(),
        o = _.extend({}, default_settings, options),
        l = url.parse(o.url),
        ssl = l.protocol.indexOf('https') === 0,
        data = '';

    //DATA
    /* massage request data according to options */
    o.data = o.data || '';
    o.contentType = o.contentType ? 'application/'+o.contentType :'application/x-www-form-urlencoded';

    if(!o.encoder){ 
	switch(o.contentType){
	  case 'application/json': o.data = JSON.stringify(o.data); break;
	  case 'application/x-www-form-urlencoded': o.data = querystring.stringify(o.data); break;
	default: o.data = o.data.toString();
	}
    } else { 
	o.data = o.encoder(o.data);
    }

    /* if get, use querystring method for data */
    if (o.type === 'GET') {
	l.search = (l.search ? l.search + '&' : ( o.data ? '?'+o.data : '' ));
    }

    /* if get, use querystring method for data */
        var requestOptions = {
	    host: l.hostname,
	    path: l.pathname + (l.search||''),
	    method: o.type,
	    port: l.port || (ssl? 443 : 80),
            headers: {}
        };

    
    /* set data content type */
    if(o.type!=='GET' && o.data){
	// o.data = o.data+'\n';
	requestOptions.headers = {
	    'Content-Type': o.contentType+';charset=utf-8',
	    'Content-Length': o.data ? Buffer.byteLength(o.data) : 0
	};
    }

    //AUTHENTICATION
    /* add authentication to http request */
    if (l.auth) {
	requestOptions.auth = l.auth;
    } else if (o.username && o.password) {
	requestOptions.auth = o.username + ':' + o.password;
    } else if (o.auth){
	requestOptions.auth = o.auth;
    }
    
    if (o.beforeSend) {
        o.beforeSend({
            setRequestHeader: function(header, str) {
                // console.log('beforeSend: ', header + ':' + str);
                requestOptions.headers[header] = str;
            }
        });
    }

    if (AuthSession) requestOptions.headers.cookie = AuthSession;
    /* apply header overrides */
    _.extend({}, requestOptions.headers, o.headers);
    _.extend(requestOptions, _.pick(o, ['auth', 'agent']));

    /* for debugging, method to get options and return */
    if(o.getopts){
	// var getopts =  [ssl, options, o.data||false, o.success||false, o.error||false];
	var getopts =  [ssl, requestOptions, o.data||false, o.complete||false, o.error||false];
	return getopts;
    }

    // console.log('requestOptions as requested in najax:', requestOptions);
    //REQUEST
    var req = (ssl ? https : http).request(requestOptions, function(res) {
	res.on('data', function(d) {
	    data += d;
	});
	res.on('end', function() {
	    // if (o.dataType === 'json') { 
	    //     //replace control characters
	    //     try { data = JSON.parse(data.replace(/[\cA-\cZ]/gi,'')); }
	    //     catch(e){ return !o.error||o.error(e); } 
	    // }
	    // if ( _.isFunction(o.success)) {o.success(data); }
            var cookies = res.headers['set-cookie'] ?
                res.headers['set-cookie'].map(function(str) {
                    return parse(str);
                }) : [];
            // console.log(cookies);
            cookies = cookies.filter(function(cookie) {
                return typeof cookie.AuthSession !== 'undefined';
            });
            if (cookies.length)
                AuthSession = serialize("AuthSession", cookies[0].AuthSession);
            
            // console.log('cookies:\n', cookies, AuthSession);
            
	    if ( _.isFunction(o.complete)) {o.complete(
                { status: res.statusCode,
                  responseText: data
                }
            ); }
	    dfd.resolve(data);
	});
    });

    //ERROR
    req.on('error', function(e) {
	if (_.isFunction(o.error)) { o.error(e); }
	dfd.reject(e);
    });

    //SEND DATA
    if (o.type !== 'GET' && o.data) {
	req.write(o.data , 'utf-8');
    }
    req.end();

    //DEFERRED
    dfd.success = dfd.done;
    dfd.error = dfd.fail;
    return dfd;
}
