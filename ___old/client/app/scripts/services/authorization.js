'use strict';

angular.module('catalogApp')
.factory('authorization', ['$rootScope', '$state', 'authentication',
  function($rootScope, $state, authentication) {
    return {
      authorize: function() {
        return authentication.identity()
          .then(function() {
            var isAuthenticated = authentication.isAuthenticated();

            if ($rootScope.toState.data.roles && $rootScope.toState.data.roles.length > 0 && !authentication.isInAnyRole($rootScope.toState.data.roles)) {
              if (isAuthenticated) {
                console.log('authenticated, but not authorized');
                //$state.go('accessdenied'); // user is signed in but not authorized for desired state
              } else {
                // user is not authenticated. stow the state they wanted before you
                // send them to the signin state, so you can return them when you're done
                $rootScope.returnToState = $rootScope.toState;
                $rootScope.returnToStateParams = $rootScope.toStateParams;

                // now, send them to the signin state so they can log in
                console.log('not authenticated');
                //$state.go('signin');
              }
            }
          });
      }
    };
  }
]);
