'use strict';

/**
 * Module dependencies.
 */
var express = require('express'),
    config = require('./config'),
    embedding = require('../lib/embedding'),
    sorting = require('../lib/sorting'),
    fields = require('../lib/fields'),
    pagination = require('../lib/pagination'),
    filtering = require('../lib/filtering');

module.exports = function(app, passport) {
    app.set('showStackError', true);

    app.use(express.compress({
        filter: function(req, res) {
            return (/json|text|javascript|css/).test(res.getHeader('Content-Type'));
        },
        level: 9
    }));

    if (process.env.NODE_ENV === 'development') {
        app.use(express.logger('dev'));
    }

    // set .html as the default extension
    app.set('view engine', 'html');

    // Set views path, template engine and default layout
    //app.set('views', config.root + '/app/views');

    app.configure(function() {
      app.use(embedding());
      app.use(sorting());
      app.use(fields());
      app.use(filtering());
      app.use(pagination());
      
      //app.use(partialResponse());

      app.use(express.urlencoded());
      app.use(express.json());
      app.use(express.methodOverride());

      app.use(passport.initialize());

      app.use(function(req, res, next) {
        res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
        res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization, Content-Length, X-Requested-With');

        if ('OPTIONS' === req.method) { res.send(200); } else { next(); }
      });

      app.use(app.router);

      //app.use(express.favicon());
      //
      // We could instead utilize the static serving nature of express here for the documentation for developers
      // then when we can't find the URL provided, we push back to the public API
      // information
      app.use(express.static(config.root + '/public'));
    });
};
