'use strict';

var path = require('path');
var rootPath = path.normalize(__dirname + '/../..');

module.exports = {
  root: rootPath,
  port: process.env.PORT || 3000,
  db: process.env.MONGOHQ_URL,
  tokenSecret: 'Po99w3r',
  tokenExpiry: 7200000 // this is 2 hours of time in milliseconds before a token will naturally expire.
};
