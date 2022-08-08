'use strict';

/**
 * We can assign either underscore or lodash for this require import. We are
 * starting out by using underscore for no other reason that it's what we know.
 * Later down the line we can replace this as required.
 */
var _ = require('underscore');

/**
 * Filtering enabling middleware.
 * 
 * This will attempt to assign an Object value to request.filters that describes
 * the requested querying filters passed in by the user. This filters Object
 * can then be interrogated to inject the operations and values required into
 * the Mongoose query against the corresponding path provided
 * 
 * A user can provide operation query string parameters to any collection
 * resource URL, but not for any individual resource URL.
 *
 * The query string parameters take the form:
 *
 * ?path.op=value
 *
 * Where op may be any of the following:
 *
 * gt - Greater Than (Number, Date)
 * gte - Greater Than or Equal (Number, Date)
 * lt - Less Than (Number, Date)
 * lte - Less Than or Equal (Number, Date)
 * in - In (Array)
 * nin - Not In (Number, String)
 * eq - Equal (String, Number)
 * ne - Not Equal (String, Number)
 *
 * In the example of the following query:
 *
 * ?path.gt=4&path.lt=6
 *
 * We will end up with the following Object assigned to request.filters:
 *
 * { [ path: [ { 'gt': 4 }, { 'lt': 6 } ] ] }
 *
 * In the example of the following multi-value query:
 *
 * ?path.gt=4,2,1&path.lt=6,9
 *
 * We will end up with the following Object assigned to request.filters:
 *
 * { path: [ { 'gt': [4, 2, 1] }, { 'lt': [6, 9] } ] }
 *
 */

module.exports = function () {
  var operations = [
    'gt',
    'gte',
    'lt',
    'lte',
    'in',
    'nin',
    'eq',
    'ne'
  ];

  function valuesToArray(values) {
    var result;

    if (_.isString(values)) {
      result = values.split(',');
    } else if (_.isArray(values)) {
      result = [];

      _.each(values, function (element) {
        var parts = element.split(',');
        result = _.union(result, parts);
      });
    }

    return result;
  }

  return function (req, res, next) {
    var queries;

    _.each(req.query, function (value, key) {
      var matches = key.split('.');
      var op = matches[1];
      var path = matches[0];

      if (_.contains(operations, op)) {
        var opts = [];
        var result = valuesToArray(value);

        if (result) {
          var item = {};
          if (result.length > 1) {
            item.$or = [];
            _.each(result, function (element) {
              var val;
              if (op === 'eq') {
                val = element;
              } else {
                val = {};
                val['$' + op] = element;
              }
              var name = {};
              name[path] = val;
              item.$or.push(name);
            });
            opts.push(item);
          } else {
            var val;
            if (op === 'eq') {
              val = result[0];
            } else {
              val = {};
              val['$' + op] = result[0];
            }
            item[path] = val;
            opts = item;
          }
        }
        
        if (!queries) {
          queries = opts;
        } else {
          if (_.isArray(queries)) queries.push(opts);
          var old = queries;
          queries = [];
          queries.push(old);
          queries.push(opts);
        }
      }
    });

    if (queries) {
      var query = {};
      if (_.isArray(queries)) {
        if (queries.length>1) {
          query.$and = queries;
        } else {
          query = queries[0];
        }
      } else {
        query = queries;
      }

      if (!res.locals.mongoose) res.locals.mongoose = {};
      res.locals.mongoose.query = query;
    }

    next();
  };
};
