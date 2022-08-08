'use strict';

var express = require('express'),
    https = require('https'),
    http = require('http'),
    fs = require('fs'),
    resource = require('express-resource-new'),
    passport = require('passport');

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var config = require('./config/config'),
    mongoose = require('mongoose');

// create two of these.... appDb and dataDb
// we can do appDb.useDb('datastore') for example, to ensure we can share connection pooling.
// then when we do any work with mongoose, we know that we have both the application database and the datastore database
// available to us as long as we pass it around.
var db = mongoose.connect(config.db);

// reload application with in-memory schemas and models
// this should be something we do separately to load all the items ...
var PatternSchema = require('./app/models/patterns');
var WorkflowSchema = require('./app/models/workflows');
var JobSchema = require('./app/models/jobs');
var Instance = require('./app/models/instances');
var User = require('./app/models/user');
var Client = require('./app/models/clients');
var Token = require('./app/models/tokens');
var Role = require('./app/models/roles');


var Instance = mongoose.model('Instance');

// This is how we load all of the instances as model items ...
// Since we have Patterns which are a resource in its own right, we then need
// to go through and register them as discriminators, since they are not yet
// recognised models inside of the mongoose instance that we are working with here
// this then allows us to act upon Instances and that will include the subtypes supported
// by the use of a discriminator.
var Pattern = mongoose.model('Pattern');
Pattern.find(function(err, patterns) {
  patterns.forEach(function(pattern) {
    if (!Instance.discriminators || !Instance.discriminators[pattern.name]) {
      var testSchema = new mongoose.Schema(pattern.definition);
      Instance.discriminator(pattern.name, testSchema);
    }
  });
});

// Bootstrap passport config
require('./config/passport')(passport);

var app = express();

// Express settings
require('./config/express')(app, passport);

// might be nice to in the future take this out of this main server and instead have it inside of config?
app.set('controllers', __dirname + '/app/controllers');

// we should be able to handle versioning for this somehow
// this means that we need to do it for resource routing as well as managing the controllers as above...
// we also want to manage the use of models per version so that we can identify improvements or changes to
// the way that we handle models.

// ideally the schemas shouldn't change much between the same major version, but we can do semver style work
// such that there are no breaking changes and we only include new items into the response and they are not
// required in the response or request.

app.resource('patterns', function() {
  this.resource('instances', function() {
    this.resource('jobs');
  });
});

// looking at instances from their perspective and tracking jobs against them
app.resource('instances', function() {
  this.resource('jobs');
});

// this is to track and manage workflow definitions
app.resource('workflows');

// this is to get the high-level view of all jobs currently active
// events only exist under a job, so no point in having them as a top-level resource
// it wont add value to our API endpoints
app.resource('jobs', function() {
  this.resource('events');
});

app.resource('auth', function() {

});

app.resource('roles');
app.resource('users');

// Start the app by listening on <port>
var port = process.env.PORT || config.port;

var privateKey  = fs.readFileSync('./config/server.key', 'utf8');
var certificate = fs.readFileSync('./config/server.crt', 'utf8');

var credentials = {key: privateKey, cert: certificate};

http.createServer(app).listen(port);
https.createServer(credentials, app).listen(3443);

console.log('Server listening on secure port: ' + port);

// Expose app
exports = module.exports = app;