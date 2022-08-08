'use strict';

angular.module('catalogApp', [
  'ui.router',
  'restangular',
  'ui.bootstrap',
  'jmdobry.angular-cache',
  'http-auth-interceptor'
])
.config(function ($urlRouterProvider, $locationProvider, $stateProvider, RestangularProvider) {
  // may need to move to run or the controller, since we don't yet have access to AuthService here?
  $stateProvider
    .state('app', {
      abstract: true,
      template: '<ui-view></ui-view>',
      url: '/',
      controller: 'AppController',
        resolve: {
          authorize: ['authorization',
            function(authorization) {
              return authorization.authorize();
            }
          ]
        }
    });

  $urlRouterProvider.otherwise('/');
  $locationProvider.html5Mode(true);

  // this should be configurable at run time, since we may be connecting to different API providers
  // in one environment... 
  RestangularProvider.setBaseUrl('http://localhost:3000');
  RestangularProvider.setRestangularFields({
    id: '_id'
  });
})
.run(function ($state) {
  $state.transitionTo('app.dashboard');
})
.controller('AppController', function ($scope, $state, $stateParams, authentication, authorization) {
  $scope.$state = $state;
  $scope.$stateParams = $stateParams;

  var resolveDone = function () { $scope.doingResolve = false; };
  $scope.doingResolve = false;

  $scope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
    $scope.toState = toState;
    $scope.toStateParams = toParams;
    $scope.fromState = fromState;
    $scope.fromStateParams = fromParams;
    
    if (authentication.isIdentityResolved()) { authorization.authorize(); }

    $scope.doingResolve = true;
  });

  $scope.$on('$stateChangeSuccess', resolveDone);
  $scope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
    console.log(error);
    resolveDone();
  });
  // interesting ....
  $scope.$on('$statePermissionError', resolveDone);

  /*
  $scope.Session = session;
  session.setCache(userSessionCache);
  session.refresh();

  $scope.Auth = AuthService;
  // make sure that we properly manage the use of events in the correct places
  // we shouldn't be mixing control of an event that is app related between this top-level app
  // set of notifications and logic inside of controllers themselvevs.
  */
  $scope.$on('event:auth-loginRequired', function (scope, data) {
    // in receiving a 401 from the remote server, we trigger this event.
    // we can also trigger this same event locally...
    console.log(scope);
    console.log(data);

    // trigger the dialog, gather the credentials and attempt to login.
    //$state.go('app.login');
  });

  $scope.$on('event:auth-loginConfirmed', function (scope, data) {
    console.log('we are now confirmed');
    console.log(data);
    console.log($scope.$state);
    //$state.go()
  });
});

// the API server will give us a 401 when we attempt to access a resource that we can't handle according to our user permissions
// if we haven't yet logged in, when we go to the dashboard, we should be stopped from going any further by attempting to
// retrieve information from the REST API.
// add instance listings to the dashbaord as a resolve...
