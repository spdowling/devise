'use strict';

/*
Authentication and Authorization events:

  'auth-login-success'
  'auth-login-failed'
  'auth-logout-success'
  'auth-session-timeout'
  'auth-not-authenticated'
  'auth-not-authorized'    

when logging in, we should attempt to login (by calling auth)
which will trigger an authentication flow according to the http auth interceptor
once that has effectively returned, then we need to store the session...
how can we pick up that we have suceeded inside of the auth service?
do we need to track success in auth service and not in the app?
seems a bit weird...

*/
angular.module('catalogApp')
.factory('authentication', [
  '$q',
  'Restangular',
  //'Session',
  function ($q, Restangular) {
    var _identity = undefined,
        _authenticated = false;

    return {
      isIdentityResolved: function() {
        return angular.isDefined(_identity);
      },
      // check if we are authenticated
      isAuthenticated: function() {
        return _authenticated;
      },
      // check whether this user is in a particular role
      isInRole: function(role) {
        if (!_authenticated || !_identity.roles) return false;

        return _identity.roles.indexOf(role) != -1;
      },
      // cehck whether this user is in any role
      isInAnyRole: function(roles) {
        if (!_authenticated || !_identity.roles) return false;

        for (var i = 0; i < roles.length; i++) {
          if (this.isInRole(roles[i])) return true;
        }

        return false;
      },
      // authenticate the user by attempting to resolve a promise on 'identity'
      // if identity has a value, then we must be authenticated
      authenticate: function(identity) {
        _identity = identity;
        _authenticated = identity != null;
      },
      // how we handle the actual authentication
      identity: function(force) {
        var deferred = $q.defer();

        if (force === true) _identity = undefined;

        // check and see if we have retrieved the identity data from the server. if we have, reuse it by immediately resolving
        if (angular.isDefined(_identity)) {
          deferred.resolve(_identity);

          return deferred.promise;
        }

        var credentials = {
          username: 'simon',
          password: 'test',
          grant_type: 'password'
        };
        
        // we have a problem which is that right now we are using http_auth_interceptor
        // and it ends up triggering an event instead of returning some kind of promise ....
        // not sure whether promises are the correct idea here, but the concept is similar
        // we want to effectively let somebody know or inject the failure

        // then when we come to look at what to do, we can either resubmit an auth request, or
        // attempt to do something else
        var test = Restangular.all('auth').post(credentials);
        console.log(test);

        // otherwise, retrieve the identity data from the server, update the identity object, and then resolve.
        //                   $http.get('/svc/account/identity', { ignoreErrors: true })
        //                        .success(function(data) {
        //                            _identity = data;
        //                            _authenticated = true;
        //                            deferred.resolve(_identity);
        //                        })
        //                        .error(function () {
        //                            _identity = null;
        //                            _authenticated = false;
        //                            deferred.resolve(_identity);
        //                        });

        return deferred.promise;
      }



/*
      logout: function() {
        Session.destroy('userData');
      },
      isAuthenticated: function () {
        if (!!Session.user) {
          return false;
        } else {
          if (Session.user.id && Session.user.accessToken && Session.use.refreshToken) {
            return true;
          } else {
            return false;
          }
        }
        
        return false;
      },
      // we may be in a case where we haven't yet retrieved the roles?
      // no: we should have the roles as soon as we are authenticated
      isAuthorized: function () {
        // would be good to know what we are attempting to authorize
        // we need to check the resource that we are dealing with and the action that relates to that resource
        // from the API side, that means read/write/update/delete
        // so we can include directive items related to that?
        // if we have anything that requires that mapping, we don't show it to the user
        // if I go to instances/:id in the URL bar, that should hot link to the correct item
        // wow, this is large ...

        // let's see if the current user has any particular roles ...
        return false;
      },
      // if we want to refresh the token, we must have a refreshToken in the local storage
      // we can use that to refresh our access token
      refreshToken: function() {
        Restangular
          .one('users', this.User.id)
          .get().then(function (res) {
            this.User = res;
            this.cacheUser();
            authService.loginConfirmed();
          }, function (res) {
            console.log(res);
            // we failed to auth, so log the user out completely...
            this.logout();
          });
      },
      encode: function (input) {
        jshint bitwise: false
        var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
        var output = '';
        var chr1, chr2, chr3 = '';
        var enc1, enc2, enc3, enc4 = '';
        var i = 0;

        do {
          chr1 = input.charCodeAt(i++);
          chr2 = input.charCodeAt(i++);
          chr3 = input.charCodeAt(i++);

          enc1 = chr1 >> 2;
          enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
          enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
          enc4 = chr3 & 63;

          if (isNaN(chr2)) {
            enc3 = enc4 = 64;
          } else if (isNaN(chr3)) {
            enc4 = 64;
          }

          output = output +
            keyStr.charAt(enc1) +
            keyStr.charAt(enc2) +
            keyStr.charAt(enc3) +
            keyStr.charAt(enc4);
          chr1 = chr2 = chr3 = '';
          enc1 = enc2 = enc3 = enc4 = '';
        } while (i < input.length);

        return output;
      },*/
    };
  }]);
