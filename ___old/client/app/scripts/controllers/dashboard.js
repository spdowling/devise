'use strict';

angular.module('catalogApp')
.config(function ($stateProvider) {
  $stateProvider
    .state('app.dashboard', {
      url: '/dash',
      templateUrl: 'partials/dashboard',
      controller: 'DashController',
      resolve: {
        instances: function (Restangular) {
          //console.log(Restangular.all('instances'));
          return Restangular.all('instances').getList();
        }
      }
    });
})
.controller('DashController', function ($scope, instances) {
  $scope.instances = instances;
});
