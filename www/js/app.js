// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var WSUrl;
angular.module('dowells', ['ionic','dowells.Services','dowells.Controllers'])

.run(function($ionicPlatform) {
  WSUrl='http://202.60.69.12/emsapi/api/'; // webservice url
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider,$urlRouterProvider){
  $stateProvider
  .state('login', {
      url: '/login',
      templateUrl: 'templates/signupin/login.html'/*,
      controller: 'LoginCtrl'*/
  })
  .state('registration', {
      url: '/registration',
      templateUrl: 'templates/signupin/registration.html',
      controller: 'RegCtrl'
  })

  .state('regliclist',{
    url:'regliclist',
    templateUrl:'templates/signupin/reglicencelist.html',
    controller:'RegCtrl'
  })

  $urlRouterProvider.otherwise('/login');
})

