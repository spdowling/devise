'use strict';

describe('Service: ApiRestangular', function () {

  // load the service's module
  beforeEach(module('catalogApp'));

  // instantiate service
  var ApiRestangular;
  beforeEach(inject(function (_ApiRestangular_) {
    ApiRestangular = _ApiRestangular_;
  }));

  it('should do something', function () {
    expect(!!ApiRestangular).toBe(true);
  });

});
