angular.module('dowells.Controllers', ['dowells.Services'])
    .controller('RegCtrl', function($scope, RegSvc, GenericSvc) {
        console.log("RegCtrl");
        $scope.nu = {};
        $scope.validateReg = function(isValid) {

            // check to make sure the form is completely valid
            if (isValid) {
                alert('our form is amazing');
            } else {
                alert('invalid form');
            }

        };
        $scope.checkEmail = function() {

            var userEmail = $scope.nu.email;
            if (regForm.email.$valid) {
                RegSvc.checkMailExistance(userEmail).then(function(response) {
                    var res = response.data;
                    if (res.IsSuccessful) {
                        GenericSvc.toast('Email already registered');
                    } else {
                        // Todo: Move to ticket list page
                        GenericSvc.toast('Email not registered');
                    }
                }, function(err) {});
            }
        };
    })
