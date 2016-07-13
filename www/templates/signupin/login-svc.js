angular.module('dowells.Services')
    .service('LoginSvc', function($http) {
        this.loginUser = function(loginData) {
            // Method to login user 
            return $http.get(WSUrl + 'Account/AuthenticateUser', { params: loginData });
        };

    })
