'use strict';

module.exports = {
  // we can add two different databases here, one for the app settings (env global items)
  // and one for the datastore (specific to chosen data set)
  // the benefit of this is that technically we can manipulate the settings without taking anything down
  // in restarting the service, we are then reloading a different schema. similar to restart the PPM Service
  // in Windows inside of Tribold, but with less hassle in terms of the remaining dependent services also needing
  // to be restart.

  // another interesting consideration is for things like worker services, we should probably manage that per environment as well
  // and all of that can be configured inside of the application settings database. so if we come across a need to use queueing
  // mechanisms of some kind, or even to get tasks to run with multiple workers, we can start defining some of that per env
  // so we are tracking things like queueing inside of the app settings

  // in the end we end up with one NodeJS API instance per environment - sharing configuration via the appSettings database
  // and one instance of the datastore per usage. we can indeed kick off multiple API instances
  // to handle the workload of many interactions with the catalogue, but we need far fewer instances of the client servers
  // and the databases.

  // when it comes to managing the clients, it may be our best interest to manage that via a MEAN stack approach
  // whereby we are using the API as a datastore and interactive point, but using NodeJS as a backend and then angular
  // served on top.

  // it should be possible to host the client and the api on the same machine, since we are technically just kicking off another
  // node instance. we're not going to host them all over the place, we don't need that kind of redundancy
  appSettingsDb: 'mongodb://localhost/application-dev',
  dataStoreDb: 'mongodb://localhost/datastore-dev',
  db: 'mongodb://localhost/mean-dev',
  app: {
    name: 'Catalogue - Data Centralized'
  }
};
