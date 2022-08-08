'use strict';

var mongoose = require('mongoose'),
    BaseSchema = require('./base');

function ListenerSchema() {
  return new BaseSchema({
    callback: {
      type: String,
      required: true
    },
    type: {
      type: String,
      // the idea is that once we get to a point where we need to trigger a particular type of event
      // within the system, we should refer to the subscriber/listener system to alert any known subscriber
      // of wha thas jsut happened. we can define different types of listeners according to the type of callback
      // that should be supported (REST, SOAP .... something else?) and then the type of even that is being triggered
      // so that we might have 6 external systems waiting to know when a REST type event for Workflow occurs, or perhaps 
      // we want to know when a Publish occurs in just one system and that particular listener should support SOAP only
      // for now
      enum: ['Publish', 'Workflow'],
      required: true
    }
  });
}
var listenerSchema = new ListenerSchema();

mongoose.model('Listener', listenerSchema);

module.exports = ListenerSchema;
