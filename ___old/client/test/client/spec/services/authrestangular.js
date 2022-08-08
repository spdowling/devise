'use strict';

describe('Service: AuthRestangular', function () {

  // load the service's module
  beforeEach(module('catalogApp'));

  // instantiate service
  var AuthRestangular;
  beforeEach(inject(function (_AuthRestangular_) {
    AuthRestangular = _AuthRestangular_;
  }));

  it('should do something', function () {
    expect(!!AuthRestangular).toBe(true);
  });

});
