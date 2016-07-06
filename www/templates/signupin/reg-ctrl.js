angular.module('dowells.Controllers', ['dowells.Services'])
    .controller('RegCtrl', function($scope, $state, $ionicHistory, $ionicModal, RegSvc, GenericSvc) {
        console.log("RegCtrl");
        $scope.nu = {};
        // Load Ionic Modal
        $ionicModal.fromTemplateUrl('templates/signupin/regaddlic-modal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.redAddLicModal = modal;
        });

        $scope.openModal=function(){
            // Method to open modals based on the current state
            var currentState = $ionicHistory.currentStateName();
                if(currentState=='regliclist')
                    $scope.redAddLicModal.show(); 
        };
        $scope.validateReg = function(isValid) {

            // check to make sure the form is completely valid
            if (isValid) {
                alert('our form is amazing');
            } else {
                alert('invalid form');
            }

        };
        $scope.checkEmail = function(regForm) {
            // Method to check the mail existance

            if (regForm.email.$valid) {
                var userEmail = regForm.email;
                RegSvc.checkMailExistance(userEmail.$modelValue).then(function(response) {
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

        $scope.changeToSubpage = function() {
            // Method to change subpages 
            console.warn("Current state:" + $ionicHistory.currentStateName());
            var currentState = $ionicHistory.currentStateName();
            if (currentState == 'registration')
                $state.go('regliclist');
        };
    })
