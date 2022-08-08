angular.module('security.interceptor', ['security.retryQueue'])

// we need to manage folders correctly by grouping instead of by type of script, we do it by feature
// for example /common/security
// angular-app is the perfect example for what we want to do overall it seems
// not sure angular-app uses ui-router, but we should
// I don't want to use event based auth, because it doesn't work nicely with resolves
// which is the basis for most complex applications

// This http interceptor listens for authentication failures
.factory('securityInterceptor', ['$injector', 'securityRetryQueue', function($injector, queue) {
  return function(promise) {
    // Intercept failed requests
    return promise.then(null, function(originalResponse) {
      if(originalResponse.status === 401) {
        // The request bounced because it was not authorized - add a new request to the retry queue
        promise = queue.pushRetryFn('unauthorized-server', function retryRequest() {
          // We must use $injector to get the $http service to prevent circular dependency
          return $injector.get('$http')(originalResponse.config);
        });
      }
      return promise;
    });
  };
}])
.config(['$httpProvider', function($httpProvider) {
  $httpProvider.responseInterceptors.push('securityInterceptor');
}]);

