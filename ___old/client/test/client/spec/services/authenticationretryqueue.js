'use strict';

describe('Service: authenticationRetryQueue', function () {

  // load the service's module
  beforeEach(module('catalogApp'));

  // instantiate service
  var authenticationRetryQueue;
  beforeEach(inject(function (_authenticationRetryQueue_) {
    authenticationRetryQueue = _authenticationRetryQueue_;
  }));

  it('should do something', function () {
    expect(!!authenticationRetryQueue).toBe(true);
  });

});
