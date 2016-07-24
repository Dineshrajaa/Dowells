// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var WSUrl;
angular.module('dowells', ['ionic', 'ion-profile-picture', 'dowells.Services', 'dowells.Controllers'])
    .constant('errorMsgs', {
        noInternet: 'Please Check your Internet Connection',
        10: '(Applicant login pending)',
        5: '(Applicant login declined)',
        noNotiTime:'Please pick notification time',
        noNotiFrequency:'Please pick notification frequency'

    })
    .constant('infoMsgs', {
        appName:'Dowells',
        emailCheck:'Checking email availability',
        loginCheck: 'Verifying user',
        loginWin: 'Login Successful',
        emailDuplication: 'Email already used',
        licenceDuplication: 'You have already added this Licence/Ticket',
        ticketAdded: 'Licence/Ticket added Successfully',
        tradeAdded:'Trade added Successfully',
        positionAdded:'Position added Successfully',        
        statusCheck:'Checking your Work availability',
        gettingUserJob:'Fetching your Jobs',
        localNotiText:'Please check that your work availability status is correct',
        settingsSaved:'Settings Saved successfully',
        gettingUserInfo:'Fetching your info',
        regSuc:'Registration Successful',
        messageFetch:'Fetching your messages',
        updatingPic:'Updating Profile Picture',
        updatePicSuc:'Profile Picture updated Successfully',
        updatingPro:'Updating your info',
        updatingProSuc:'Profile Update Sucessfully',
        gettingDocInfo:'Fetching your documents',
        gettingTicInfo:'Fetching Ticket info',
        gettingTraInfo:'Fetching Trade info',
        gettingPosInfo:'Fetching Position info',
        savingLic:'Saving your Licence',
        savingTra:'Saving your Trade',
        savingPos:'Saving your Trade',
        delLicSuc:'Deleted your Licence/Ticket Successfully',
        delTraSuc:'Deleted your Trade experience Successfully',
        delPosSuc:'Deleted your Position Successfully'
    })
    .run(function($ionicPlatform, GenericSvc) {
        WSUrl = 'http://202.60.69.12/emsapi/api/'; // webservice url
        $ionicPlatform.ready(function() {
            if (window.cordova && window.cordova.plugins.Keyboard) {
                // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
                // for form inputs)
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

                // Don't remove this line unless you know what you are doing. It stops the viewport
                // from snapping when text inputs are focused. Ionic handles this internally for
                // a much nicer keyboard experience.
                cordova.plugins.Keyboard.disableScroll(true);
            }
            if (window.StatusBar) {
                StatusBar.styleDefault();
            }
            GenericSvc.getDeviceIdForPush(); // Register pushnotification device id
            GenericSvc.checkLoginStatus(); // Check whether user has already logged in
        });
    })

.config(function($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('home', {
            url: '/home',
            cache:false,
            abstract: true,
            templateUrl: 'templates/menu.html',
            controller:'HomeCtrl'
        })
        .state('master', {
            url: '/master',
            abstract: true,
            templateUrl: 'templates/master.html'
        })
        .state('master.login', {
            url: '/login',
            views: {
                'masterPage': {
                    templateUrl: 'templates/signupin/login.html',
                    controller: 'LoginCtrl'
                }
            }
        })
        .state('master.appstatus', {
            url: '/appstatus',
            views: {
                'masterPage': {
                    templateUrl: 'templates/signupin/appstatus.html',
                    controller: 'AppStatusCtrl'
                }
            }
        })
        .state('master.registration', {
            url: '/registration',
            views: {
                'masterPage': {
                    templateUrl: 'templates/signupin/registration.html',
                    controller: 'RegCtrl'
                }
            }
        })

    .state('master.regliclist', {
        url: 'regliclist',
        views: {
            'masterPage': {
                templateUrl: 'templates/signupin/reglicencelist.html',
                controller: 'RegLicCtrl'
            }
        }
    })

    .state('master.regtralist',{
        url:'regtralist',
        views:{
            'masterPage':{
                templateUrl:'templates/signupin/regtradelist.html',
                controller:'RegTraCtrl'
            }
        }
    })

    .state('master.regposlist',{
        url:'regposlist',
        views:{
            'masterPage':{
                templateUrl:'templates/signupin/regpositionlist.html',
                controller:'RegPosCtrl'
            }
        }
    })
    .state('master.regphotopage',{
        url:'regposlist',
        views:{
            'masterPage':{
                templateUrl:'templates/signupin/regphoto.html',
                controller:'RegPhotoCtrl'
            }
        }
    })
    .state('master.regsuc',{
        url:'/regsuc',
        views:{
            'masterPage':{
                templateUrl:'templates/signupin/regsuc.html'
            }
        }
    })

    .state('home.status', {
        url: '/status',
        views: {
            'menuPage': {
                templateUrl: 'templates/home/dashboard/status.html',
                controller:'StatusCtrl'
            }
        }
    })
    .state('home.settings', {
        url: '/settings',
        views: {
            'menuPage': {
                templateUrl: 'templates/home/settings/settings.html',
                controller:'SettingsCtrl'
            }
        }
    })
    .state('home.leaves', {
        url: '/leaves',
        views: {
            'menuPage': {
                templateUrl: 'templates/home/leave/leave.html'
            }
        }
    })
    .state('home.profileoptions',{
        url:'/profileoptions',
        views:{
            'menuPage':{
                templateUrl:'templates/home/profile/profileoptions.html'
            }
        }
    })

    .state('home.personaldetails',{
        url:'/personaldetails',
        views:{
            'menuPage':{
                templateUrl:'templates/home/profile/personaldetails.html',
                controller:'ProfileCtrl'
            }
        }
    })

    .state('home.updatepersdetails',{
        url:'/updatepersdetails',
        views:{
            'menuPage':{
                templateUrl:'templates/home/profile/editprofile.html',
                controller:'EditProfileCtrl'
            }
        }
    })

    .state('home.listofdocuments',{
        url:'/listofdocuments',
        views:{
            'menuPage':{
                templateUrl:'templates/home/profile/listdocuments.html',
                controller:'EditDocuCtrl'
            }
        }
    })
    .state('home.message',{
        url:'/message',
        views:{
            'menuPage':{
                templateUrl:'templates/home/message/message.html',
                controller:'MessageCtrl'
            }
        }
    })

    $urlRouterProvider.otherwise('/master/login');
})
