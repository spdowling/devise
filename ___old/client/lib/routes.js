'use strict';

var index = require('./controllers');

/**
 * Application routes
 */
module.exports = function(app) {
  // All other routes to use Angular routing in app/scripts/app.js
  app.route('/partials/*')
    .get(index.partials);
  app.route('/*')
    .get( index.index);
};