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

.controller('RegLicCtrl', function($scope, $state, $ionicModal, $ionicActionSheet,
    RegSvc, RegDataSvc, GenericSvc, infoMsgs) {
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
            $scope.regAddProps.hidesavebtn = $scope.regAddProps.regselectedlic == "0" ? true : false;
            $scope.regAddProps.qualifiedAllowedOrNot = $scope.regAddProps.regselectedlic == "0" ? true : false;
            RegSvc.getLicenceDetail($scope.regAddProps.regselectedlic).then(function(response) {
                if (response.data.IsSuccessful) {
                    var licenceInfo = response.data.Result;
                    $scope.regAddProps.qualifiedAllowedOrNot = $scope.regAddProps.regselectedlic == "0" ? true : licenceInfo.IsQualifiedAllowed;
                    $scope.regAddProps.onlyforexp = licenceInfo.IsQualifiedAllowed;
                    $scope.regAddProps.showorhideexp = licenceInfo.IsQualifiedAllowed;
                    $scope.regAddProps.licType = licenceInfo.LicenceAbbr;
                    $scope.regAddProps.licName = licenceInfo.Name;
                }
                GenericSvc.hideLoader();
            }, function(err) {
                GenericSvc.hideLoader();
            });
        } else
            GenericSvc.toast(errorMsgs.noInternet);
    };
    $scope.toggleExpFields = function() {
        // Method to show or hide Experienced fields
        $scope.regAddProps.onlyforexp = $scope.regAddProps.reglicexporqua == "1" ? true : false;
        $scope.regAddProps.showorhideexp = $scope.regAddProps.reglicexporqua != "0" ? true : false;
    };
    $scope.saveLicence = function() {
        // Method to save licence 
        var licObj = {};
        licObj.Id = licObj.LicenceTicketTypeId = $scope.regAddProps.regselectedlic;
        licObj.Name = $scope.regAddProps.licName;
        licObj.Experience = $scope.regAddProps.regaddexp;
        licObj.LicenceNumber = $scope.regAddProps.regaddlicno;
        licObj.LicenceExpiry = $scope.regAddProps.regaddlicexpiry;
        licObj.LicenceType = $scope.regAddProps.licType;
        licObj.UserCertificationTypeId = $scope.regAddProps.reglicexporqua;
        licObj.UserCertificationTypeName = $scope.regAddProps.onlyforexp ? 'Qualified' : 'Experienced';
        if ($scope.licenceTicketList.length > 0) {
            angular.forEach($scope.licenceTicketList, function(value, key) {
                console.log(value.Name);
                if (value.Id == licObj.Id)
                    GenericSvc.toast(infoMsgs.licenceDuplication);
                else {
                    GenericSvc.toast(infoMsgs.ticketAdded);
                    $scope.licenceTicketList.push(licObj);
                }
            });
        } else {
            GenericSvc.toast(infoMsgs.ticketAdded);
            $scope.licenceTicketList.push(licObj);
        }
        console.warn($scope.licenceTicketList);
    };
    $scope.resetAddLicForm = function() {
        // Method to reset Add Licence form
        $scope.regAddProps.qualifiedAllowedOrNot = true; // Hide the Radio buttons initially
        $scope.regAddProps.onlyforexp = false; // Initially hide the Experienced details
        $scope.regAddProps.showorhideexp = false; // Initially hide experience field
        $scope.regAddProps.hidesavebtn = true; // Initially hide save button
        $scope.regAddProps.regselectedlic = "0";
        $scope.regAddProps.reglicexporqua = "0";
        $scope.regAddProps.licType = "";
        $scope.regAddProps.licName = "";
    };
    /*Function calls & Initialization*/
    $scope.regAddProps = {};
    $scope.licenceTicketList = RegDataSvc.licenceList;
    $scope.fetchActiveLicences(); // Fetch active licences
    $scope.resetAddLicForm(); // reset/initialize form fields
})



