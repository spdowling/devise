'use strict';

angular.module('catalogApp')
.directive('authorizeUser', ['$rootScope', 'AuthService', function ($rootScope, AuthService) {
  return {
    // what weneed to do here, is ensure that we are Authorized, not authenticated.
    link: function postLink() {
      $rootScope.$on('$stateChangeStart', function (event, toState) {
        // if we require authentication, and we don't yet have it, then fix that issue...
        if (toState.authenticate) {
          if (!AuthService.isAuthenticated()) {
            event.preventDefault();
            // in doing this, we are saying that we need to 
            $rootScope.$broadcast('event:auth-login-required');
          } else {
            console.log('Check authorization using roles ...');
          }
        }
      });
    }
  };
}]);