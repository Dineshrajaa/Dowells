angular.module('dowells.Controllers', ['dowells.Services'])
    .controller('RegCtrl', function($scope, $state, $ionicHistory, $ionicModal,
        RegSvc, RegDataSvc, GenericSvc, errorMsgs, infoMsgs) {
        console.log("RegCtrl");
        $scope.nu = RegDataSvc.regFormData;
        $scope.checkEmail = function(regForm) {
            // Method to check the mail existance

            if (GenericSvc.checkInternet()) {
                if (regForm.email.$valid) {
                    var userEmail = regForm.email;
                    GenericSvc.showLoader('Checking email availability');
                    RegSvc.checkMailExistance(userEmail.$modelValue).then(function(response) {
                        var res = response.data;
                        if (res.IsSuccessful) {
                            if (res.Result)
                                GenericSvc.toast(infoMsgs.emailDuplication);
                            else {
                                // Todo: Move to ticket list page
                                GenericSvc.toast('Email not registered');
                            }
                        }
                        GenericSvc.hideLoader();
                    }, function(err) {
                        GenericSvc.hideLoader();
                    });
                }
            } else
                GenericSvc.toast(errorMsgs.noInternet);

        };



        $scope.changeToLicpage = function() {
            // Method to change subpages 
            $state.go('regliclist');
            RegDataSvc.storeRegFormData($scope.nu);
        };



    })

.controller('RegLicCtrl', function($scope, $state, $ionicModal,
    RegSvc, RegDataSvc, GenericSvc) {
        // Load Ionic Modal    
    $ionicModal.fromTemplateUrl('templates/signupin/regaddlic-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.redAddLicModal = modal;
    });

    $scope.fetchActiveLicences = function() {
        // Method to fetch active licences

        if (GenericSvc.checkInternet()) {
            GenericSvc.showLoader();
            RegSvc.getActiveLicence().then(function(response) {
                var res = response.data;
                $scope.activeLicences = res.Result;
                $scope.regselectedlic = "0";
                GenericSvc.hideLoader();
            }, function(err) {
                GenericSvc.hideLoader();
            });
        } else
            GenericSvc.toast(errorMsgs.noInternet);
    };

    $scope.fetchSelectedLicenceDetail = function() {
        // Method to fetch the details of selected licence
        if (GenericSvc.checkInternet()) {
            GenericSvc.showLoader();
            RegSvc.getLicenceDetail($scope.regselectedlic).then(function(response) {
                if(response.data.IsSuccessful){
                    var licenceInfo=response.data.Result;
                    $scope.qualifiedAllowedOrNot=licenceInfo.IsQualifiedAllowed;
                }
                GenericSvc.hideLoader();
            }, function(err) {
                GenericSvc.hideLoader();
            });
        } else
            GenericSvc.toast(errorMsgs.noInternet);
    };
    $scope.toggleExpFields=function(){
        // Method to show or hide Experienced fields
        $scope.onlyforexp=$scope.reglicexporqua=="2"?true:false;
        console.warn($scope.reglicexporqua);
    };
    /*Function calls*/
    $scope.fetchActiveLicences(); // Fetch active licences
    $scope.qualifiedAllowedOrNot=false; // Hide the Radio buttons initially
    $scope.onlyforexp=false; // Initially hide the Experienced details
    // $scope.reglicexporqua="2";
})


.controller('LoginCtrl',function($scope){
    $scope.toggleExpFields=function(){
        // Method to show or hide Experienced fields
        // $scope.onlyforexp=$scope.reglicexporqua=="2"?true:false;
        console.warn($scope.reglicexporqua);
    };
})
