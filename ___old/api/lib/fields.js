'use strict';

/**
 * We can assign either underscore or lodash for this require import. We are
 * starting out by using underscore for no other reason that it's what we know.
 * Later down the line we can replace this as required.
 */
var _ = require('underscore');

module.exports = function (opt) {
  opt = opt || {};

  return function (req, res, next) {
    var param = req.query[opt.query || 'fields'];

    if (param) {
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

        res.locals.mongoose.select = result.join(' ');
      }
    }
    
    next();
  };
};
