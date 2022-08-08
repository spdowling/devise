'use strict';

angular.module('catalogApp')
.config(function ($stateProvider) {
  $stateProvider
    .state('app.home', {
      url: '/',
      templateUrl: 'partials/home',
      controller: 'HomeController',
      /*resolve: {
        instances: function (Restangular) {
          console.log(Restangular.all('instances'));
          return Restangular.all('instances').getList();
        }
      }*/
    });
})
.controller('HomeController', function ($scope) {
  $scope.environment = {};
  
  $scope.connect = function() {
    //
  };
  // make it so that we can conenct to various environments from one web app..
});
