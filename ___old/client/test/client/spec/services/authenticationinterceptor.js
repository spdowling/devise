'use strict';

describe('Service: authenticationInterceptor', function () {

  // load the service's module
  beforeEach(module('catalogApp'));

  // instantiate service
  var authenticationInterceptor;
  beforeEach(inject(function (_authenticationInterceptor_) {
    authenticationInterceptor = _authenticationInterceptor_;
  }));

  it('should do something', function () {
    expect(!!authenticationInterceptor).toBe(true);
  });

});
