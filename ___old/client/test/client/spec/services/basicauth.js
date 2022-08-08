'use strict';

describe('Service: basicAuth', function () {

  // load the service's module
  beforeEach(module('catalogApp'));

  // instantiate service
  var basicAuth;
  beforeEach(inject(function (_basicAuth_) {
    basicAuth = _basicAuth_;
  }));

  it('should do something', function () {
    expect(!!basicAuth).toBe(true);
  });

});
