angular.module('dowells.Controllers', ['dowells.Services'])
    .controller('RegCtrl', function($scope, $state,
        RegSvc, RegDataSvc, GenericSvc, errorMsgs, infoMsgs) {
        console.log("RegCtrl");
        $scope.nu = RegDataSvc.regFormData;
        $scope.checkEmail = function(regForm) {
            // Method to check the mail existance

            if (GenericSvc.checkInternet()) {
                if (regForm.email.$valid) {
                    var userEmail = regForm.email;
                    GenericSvc.showLoader(infoMsgs.emailCheck);
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
            $state.go('master.regliclist');
            RegDataSvc.storeRegFormData($scope.nu);
        };

    })

.controller('RegLicCtrl', function($scope, $state, $ionicModal, $ionicActionSheet,
    RegSvc, RegDataSvc, GenericSvc, infoMsgs) {
    // Load Add Licence Modal    
    $ionicModal.fromTemplateUrl('templates/signupin/regaddlic-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.regAddLicModal = modal;
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

    $scope.closeAddLicModal = function() {
        // Method to close Add Licence modal window
        $scope.regAddLicModal.hide();
        $scope.resetAddLicForm();
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
        console.warn('toggleExpFields invoked');
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
        licObj.isLicenced = $scope.regAddProps.onlyforexp;
        licObj.qualifiedAllowedOrNot = $scope.regAddProps.qualifiedAllowedOrNot;
        if ($scope.licenceTicketList.length > 0) {
            angular.forEach($scope.licenceTicketList, function(value, key) {
                console.log(value.Name);
                if (value.Id == licObj.Id) {
                    $scope.licenceTicketList.splice($scope.licenceTicketList.indexOf(key), 1);
                    // GenericSvc.toast(infoMsgs.licenceDuplication);
                }
            });
            GenericSvc.toast(infoMsgs.ticketAdded);
            $scope.licenceTicketList.push(licObj);
        } else {
            GenericSvc.toast(infoMsgs.ticketAdded);
            $scope.licenceTicketList.push(licObj);
        }
        $scope.closeAddLicModal(); // close modal and reset form fields
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
        $scope.regAddProps.regLicAddBtnTxt = 'Save';
    };

    $scope.removeLicence = function(licenceToRemove) {
        // Method to remove licence from list
        $scope.licenceTicketList.splice($scope.licenceTicketList.indexOf(licenceToRemove), 1);
    };

    $scope.editLicence = function(licenceToEdit) {
        // Method to edit licence from list
        console.warn("Before update:" + $scope.regAddProps);
        $scope.regAddLicModal.show();
        $scope.regAddProps.regselectedlic = licenceToEdit.Id;
        $scope.regAddProps.licName = licenceToEdit.Name;
        $scope.regAddProps.regaddexp = licenceToEdit.Experience;
        $scope.regAddProps.regaddlicno = licenceToEdit.LicenceNumber;
        $scope.regAddProps.regaddlicexpiry = licenceToEdit.LicenceExpiry;
        $scope.regAddProps.licType = licenceToEdit.LicenceType;
        $scope.regAddProps.reglicexporqua = licenceToEdit.UserCertificationTypeId;
        $scope.regAddProps.onlyforexp = licenceToEdit.isLicenced;
        $scope.regAddProps.qualifiedAllowedOrNot = $scope.regAddProps.onlyforexp = $scope.regAddProps.showorhideexp = licenceToEdit.qualifiedAllowedOrNot;
        $scope.regAddProps.hidesavebtn = false;
        $scope.regAddProps.regLicAddBtnTxt = 'Update';
        console.warn("After update:" + angular.toJson($scope.regAddProps));
    };

    $scope.changeToTraPage = function() {
        // Method to change to Trade list page
        RegDataSvc.licenceList = $scope.licenceTicketList; // save ticket list 
        $state.go('master.regtralist');
    };
    /*Function calls & Initialization*/
    $scope.regAddProps = {};
    $scope.licenceTicketList = RegDataSvc.licenceList;
    $scope.fetchActiveLicences(); // Fetch active licences
    $scope.resetAddLicForm(); // reset/initialize form fields

    $scope.$watch('regAddProps.reglicexporqua', function() {
        $scope.toggleExpFields();
    });
})

.controller('RegTraCtrl', function($scope, $state, $ionicModal, $ionicActionSheet,
    RegSvc, RegDataSvc, GenericSvc, infoMsgs) {
    // Load Add Licence Modal    
    $ionicModal.fromTemplateUrl('templates/signupin/regaddtra-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.regAddTraModal = modal;
    });

})
