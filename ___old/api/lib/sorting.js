'use strict';

/**
 * We can assign either underscore or lodash for this require import. We are
 * starting out by using underscore for no other reason that it's what we know.
 * Later down the line we can replace this as required.
 */
var _ = require('underscore');

/**
 * Sorting enabling middleware.
 * 
 * This will attempt to assign a value to request.sorting that identifies
 * paths within a Mongoose schema that should be used to sort the matching
 * query result set.
 * 
 * A user can provide sorting query string parameters to any collection
 * resource URL, but not for any individual resource URL.
 *
 * The query string parameter takes the form:
 *
 * ?sort=path,-anotherPath
 *
 * OR
 *
 * ?sort=path&sort=anotherPath
 * 
 * @param  {Object} opt Options that can be passed to this middleware. The only
 *                      currently supported option would be to pass a different
 *                      name for the query parameter to look for. By default
 *                      we will continue to use 'sort'.
 */
module.exports = function (opt) {
  opt = opt || {};

  return function (req, res, next) {
    var param = req.query[opt.query || 'sort'];

    var result;

    if (_.isString(param)) {
      result = param.split(',');
    } else if (_.isArray(param)) {
      result = [];

      _.each(param, function (element) {
        var parts = element.split(',');
        result = _.union(result, parts);
      });
    }

    if (result) {
      if (!res.locals.mongoose) res.locals.mongoose = {};

      res.locals.mongoose.sorting = result.join(' ');
    }

    next();
  };
};
