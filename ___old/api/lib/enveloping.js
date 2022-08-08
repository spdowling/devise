'use strict';



/**
 * We can assign either underscore or lodash for this require import. We are
 * starting out by using underscore for no other reason that it's what we know.
 * Later down the line we can replace this as required.
 */
var _ = require('underscore');

// ENVELOPING
// if we include callback, jsonp or enveloper=true in the request.query
// we should reply with a 200 and bundle the response proper
// into an enveloped response
// in the case of callback or jsonp that should be named by the value
// in the case of envelop=true, there is no wrapper, but it's a full json response object

module.exports = function () {
  var identifiers = ['envelope', 'jsonp', 'callback'];

  return function (req, res, next) {
    // check whether any of the items match anything in the req.query
    var match = _.some(identifiers, function (element, index, list) {
      if (req.query[element]) return element;
    });

    if (match) {
      var envelope;

      switch (match) {
        case 'envelope':
          envelope = {};
          break;
        /**
         * Any additional HTTP headers that would have been passed alongside the response should be mapped to JSON fields, like so:

          callback_function({
            status_code: 200,
            next_page: "https://..",
            response: {
              ... actual JSON response body ... 
            }
          })
         */
        case 'jsonp':
        case 'callback':
          // fn holds the name of the function
          var fn = req.query.jsonp ? req.query.jsonp : req.query.callback;
          envelope = 

          // we ant to wrap it in something named according to the value
          break;
      }
    }
    // By default we are reading for 'embed'. Initialize the middleware with
    // the query option in an Object to assign a different query param such as:
    // app.use(embed({ query: 'populate' }));
    var param = req.query[opt.query || 'embed'];

    if (_.isString(param)) {
      // ?embed=path,path.subpath,anotherPath
      var parts = param.split(',');
      if (parts.length>1) req.populate = parts.join(' ');
    } else if (_.isArray(param)) {
      // ?embed=path&embed=path.subpath&embed=anotherPath
      req.populate = param.join(' ');
    }
    next();
  };
};
