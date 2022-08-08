'use strict';

describe('Service: LSCache', function () {

  // load the service's module
  beforeEach(module('catalogApp'));

  // instantiate service
  var LSCache;
  beforeEach(inject(function (_LSCache_) {
    LSCache = _LSCache_;
  }));

  it('should do something', function () {
    expect(!!LSCache).toBe(true);
  });

});
