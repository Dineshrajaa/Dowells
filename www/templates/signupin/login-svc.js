angular.module('dowells.Services')
    .service('LoginSvc', function($http) {
        this.loginUser = function(loginData) {
            // Method to login user 
            return $http.get(WSUrl + 'Account/AuthenticateUser', { params: loginData });
        };

        this.loginErrorFinder = function(loginErrorCode) {
            // Method to find the error from Login
            var appStatusMsg = {};
            switch (loginErrorCode) {
                case 10:
                    appStatusMsg.status = 'Application pending';
                    appStatusMsg.msg='Your application is still under review please check again';
                    break;
                case 5:
                    appStatusMsg.status = 'Application declined';
                    appStatusMsg.msg='Your application was unsuccessful. For futher details contact Dowells office on 0755492144';
                    break;
                default:
                    appStatusMsg.status = 'Incorrect username or pin';
            }
            return appStatusMsg;
        };

    })
