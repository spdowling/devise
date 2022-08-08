'use strict';

angular.module('catalogApp')
.config(function ($stateProvider) {
  $stateProvider
    .state('app.login', {
      url: '/login',
      onEnter: function($q, $stateParams, $state, $modal, AuthService) {
        // can we defer it here?
        $modal.open({
          backdrop: 'static',
          keyboard: true,
          modalFade: true,
          templateUrl: 'partials/login.html',
          controller: ['$scope', function($scope) {
            $scope.data = {
              username: '',
              password: '',
              remember: false
            };
            $scope.ok = function() {
              $scope.$close($scope.data);
            };
          }]
        }).result.then(function(result) {
          if (result) {
            console.log(result);
            AuthService.login(result);
            $state.transitionTo($state.previous.url);
          }
        });
      }
    });
});
