angular.module('dowells.Services')
    .service('LoginSvc', function($http) {
        this.loginUser = function(loginData) {
            // Method to login user 
            return $http.get(WSUrl + 'Account/AuthenticateUser', { params: loginData });
        };

        this.loginErrorFinder = function(loginErrorCode) {
            // Method to find the error from Login
            var errorMessage = "";
            switch (loginErrorCode) {
                case 10:
                    errorMessage = 'Applicant login pending';
                    break;
                case 5:
                    errorMessage = 'Applicant login declined';
                    break;
                default:
                    errorMessage = 'Incorrect username or pin';
            }
            return errorMessage;
        };

    })
