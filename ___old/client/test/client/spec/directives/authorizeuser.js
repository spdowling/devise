'use strict';

describe('Directive: authorizeUser', function () {

  // load the directive's module
  beforeEach(module('catalogApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<authorize-user></authorize-user>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the authorizeUser directive');
  }));
});
