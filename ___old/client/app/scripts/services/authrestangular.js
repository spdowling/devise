'use strict';

angular.module('catalogApp')
.factory('AuthRestangular', ['restangular', function (Restangular) {
  console.log('test');
  return Restangular.withConfig(function(RestangularConfigurer) {
    RestangularConfigurer.setBaseUrl('http://localhost:3000');
  });
}]);