angular.
  module('stockMarketChart').
  config(['$locationProvider' ,'$routeProvider',
    function config($locationProvider, $routeProvider) {
      $locationProvider.html5Mode(true);

      $routeProvider.
        when('/', {
          template: '<graph-data></graph-data>'
        }).
        otherwise('/');
    }
  ]);