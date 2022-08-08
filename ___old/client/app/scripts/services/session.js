'use strict';

// when we log that we refresh for example, is that a session change?
// is that something we want to trigger as an event, because items like Restangular should be updated?
// makes sense.


angular.module('catalogApp')
.factory('Session', [
  '$rootScope',
  '$q',
  '$angularCacheFactory',
  function ($rootScope, $q, $angularCacheFactory) {
    var userSessionCache = $angularCacheFactory('userCache', {
      maxAge: 3600000,
      deleteOnExpire: 'aggressive',
      onExpire: function (key, value) {
        // trigger a refresh on expire....
        // since we are tracking mostly the expiration of items ... perhaps we need to check what is expiring?
        console.log(key);
        console.log(value);
      }
    });

    return {
      create: function(userData) {
        this.cacheUser(userData);
      },
      destroy: function() {
        //lscache.flush();
        this.User = null;
      },
      refresh: function() {
        var cachedUserData = userSessionCache.get('userData');

        // if we don't have a user and we have a cached version, load it
        if (!this.User && cachedUserData) {
          this.User = cachedUserData;
        } else {
          // obviously we didn't have a cached version, force an auth...
          $rootScope.$broadcast('event:auth-login-required');
        }

        // when refreshing a token, we need to trigger another event ...

        // we have a user and it has an access token value, so refresh it..
        if (this.User && this.User.accessToken) {
          $rootScope.$broadcast('event:auth-token-refresh');
        }
      },
      cacheUser: function(userData) {
        if (!this.User) {
          // we dont have a current user, so we need to read the userdata
          console.log(userData);
          if (!userData.hasOwnProperty('id') && userData.hasOwnProperty('resource_uri')) {
            var bits = userData.resource_uri.split('/');
            this.User.id = Number(bits[bits.length-1]);
          }
        } else {
          // User is already set once ....
          console.log(this.User);
        }
        
        var cacheResult = userSessionCache.put('userData', this.User);

        return cacheResult;
      },
      userRoles: function() {
        // use this function to validate authorization or permissions for something
      },
      wipeUser: function(){
        userSessionCache.remove('userData');
        this.User = null;
        $rootScope.$broadcast('event:session-changed');
      }
    };
  }]);
