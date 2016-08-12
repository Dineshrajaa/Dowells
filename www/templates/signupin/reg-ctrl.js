angular.module('dowells.Controllers', ['dowells.Services'])
    .controller('RegCtrl', function($scope, $state,
        RegSvc, RegDataSvc, GenericSvc, errorMsgs, infoMsgs) {
        console.log("RegCtrl");

        $scope.formHandler = {};
        $scope.formHandler.disableNextBtn = false;
        $scope.nu = RegDataSvc.regFormData;
                   var options = {
        types: ['geocode'],
        componentRestrictions: { country: "au" }
    };
    var placeSearch, autocomplete;
    var componentForm = {
        street_number: 'long_name',
        route: 'long_name',
        locality: 'long_name',
        administrative_area_level_1: 'long_name',
        //country: 'long_name',
        postal_code: 'long_name'
    };
     var input = document.getElementById("keyword");
    var autocomplete = new google.maps.places.Autocomplete(input, options);
     autocomplete.addListener('place_changed', fillInAddress);

    function fillInAddress() {  
        // Get the place details from the autocomplete object.
        var place = autocomplete.getPlace();
        $scope.nu.streetaddress = '';
        $scope.nu.city = '';
        $scope.nu.state = '';
        $scope.nu.postcode = ''

        // Get each component of the address from the place details
        // and fill the corresponding field on the form.
        for (var i = 0; i < place.address_components.length; i++) {
            var addressType = place.address_components[i].types[0];
            if (componentForm[addressType]) {
            switch(addressType)
            {
                case 'route':
                    var val = place.address_components[i][componentForm[addressType]];
                    $scope.nu.streetaddress += " " + val;
                    $scope.nu.streetaddress = $scope.nu.streetaddress.trim();
                    break;
                case 'locality':
                    $scope.nu.city = place.address_components[i][componentForm[addressType]];
                    break;
                case 'administrative_area_level_1':
                    $scope.nu.state = place.address_components[i][componentForm[addressType]];
                    break;
                case 'postal_code':
                    $scope.nu.postcode = place.address_components[i][componentForm[addressType]];
                    break;
            }
               
                 
            }
             $scope.$apply()
        }
    }
        $scope.checkEmail = function(regForm) {
            // Method to check the mail existance

            if (GenericSvc.checkInternet()) {
                if (regForm.email.$valid) {
                    var userEmail = regForm.email;
                    GenericSvc.showLoader(infoMsgs.emailCheck);
                    RegSvc.checkMailExistance(userEmail.$modelValue).then(function(response) {
                        var res = response.data;
                        if (res.IsSuccessful) {
                            if (res.Result) {
                                GenericSvc.toast(infoMsgs.emailDuplication);
                                $scope.nu.email = ''; // clear the email to prevent duplication
                            } else {
                                // Todo: Move to ticket list page
                                GenericSvc.toast('Email Available for registration');
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
            if ($scope.nu.confirmpinno == $scope.nu.pinno) {
                $state.go('master.regliclist');
                RegDataSvc.storeRegFormData($scope.nu);
            } else {
                GenericSvc.toast("Pin no. doesn't match");
            }

        };
        $scope.nu.title = '1';
        $scope.nu.gender = '2';
       /* $scope.$watch('nu.confirmpinno', function() {
            if (!$scope.formHandler.disableNextBtn) {
                if ($scope.nu.confirmpinno == nu.pinno) {
                    $scope.formHandler.disableNextBtn = true;
                } else {
                    $scope.formHandler.disableNextBtn = false;
                }
            }
        });*/

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
                    if (licenceInfo.IsQualifiedAllowed)
                        $scope.regAddProps.reglicexporqua = '1';
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
        licObj.LicenceExpiryNonFormatted = $scope.regAddProps.regaddlicexpiry;
        licObj.LicenceExpiry = GenericSvc.convertUIDateToDb($scope.regAddProps.regaddlicexpiry);
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
                    GenericSvc.toast(infoMsgs.licenceDuplication);
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
        $scope.regAddProps.regaddlicno = "";
        $scope.regAddProps.regaddlicexpiry = "";
        $scope.regAddProps.regaddexp = "";
        $scope.regAddProps.regLicAddBtnTxt = 'Add';
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

.controller('RegTraCtrl', function($scope, $state, $ionicModal,
    RegSvc, RegDataSvc, GenericSvc, infoMsgs) {
    // Load Add Trade Modal    
    $ionicModal.fromTemplateUrl('templates/signupin/regaddtra-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.regAddTraModal = modal;
    });

    $scope.resetAddTraForm = function() {
        // Method to reset Add Trade form
        $scope.regTraProps.regselectedtra = '0';
        $scope.regTraProps.qualifiedAllowedOrNot = true;
        $scope.regTraProps.regtraexporqua = '0';
        $scope.regTraProps.onlyforexp = false;
        $scope.regTraProps.regaddtrano = "";
        $scope.regTraProps.regaddtraexperience = "";
        $scope.regTraProps.showorhideexp = false;
        $scope.regTraProps.hidesavebtn = true;
        $scope.regTraProps.regTraAddBtnTxt = 'Add';
    };
    $scope.closeAddTraModal = function() {
        // Method to close Add Trade Modal and reset the form
        $scope.regAddTraModal.hide();
        $scope.resetAddTraForm();
    };
    $scope.fetchActiveTrades = function() {
        // Method to fetch active trades
        if (GenericSvc.checkInternet()) {
            GenericSvc.showLoader();
            RegSvc.getActiveTrade().then(function(response) {
                var res = response.data;
                $scope.activeTrades = res.Result;
                GenericSvc.hideLoader();
            }, function(err) {
                GenericSvc.hideLoader();
            });
        } else
            GenericSvc.toast(errorMsgs.noInternet);
    };
    $scope.fetchSelectedTradeDetail = function() {
        // Method to fetch the details of selected licence
        if (GenericSvc.checkInternet()) {
            GenericSvc.showLoader();
            $scope.regTraProps.hidesavebtn = $scope.regTraProps.regselectedtra == "0" ? true : false;
            $scope.regTraProps.qualifiedAllowedOrNot = $scope.regTraProps.regselectedtra == "0" ? true : false;
            RegSvc.getTradeDetail($scope.regTraProps.regselectedtra).then(function(response) {
                if (response.data.IsSuccessful) {
                    var tradeInfo = response.data.Result;
                    $scope.regTraProps.qualifiedAllowedOrNot = $scope.regTraProps.regselectedtra == "0" ? true : tradeInfo.IsQualifiedAllowed;
                    if (tradeInfo.IsQualifiedAllowed)
                        $scope.regTraProps.regtraexporqua = '1';
                    $scope.regTraProps.onlyforexp = tradeInfo.IsQualifiedAllowed;
                    $scope.regTraProps.showorhideexp = tradeInfo.IsQualifiedAllowed;
                    // $scope.regTraProps.traType = tradeInfo.LicenceAbbr;
                    $scope.regTraProps.traName = tradeInfo.Name;
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
        $scope.regTraProps.onlyforexp = $scope.regTraProps.regtraexporqua == "1" ? true : false;
        $scope.regTraProps.showorhideexp = $scope.regTraProps.regtraexporqua != "0" ? true : false;
    };
    $scope.saveTrade = function() {
        // Method to save trade
        var traObj = {};
        traObj.Id = traObj.TradeExperienceId = $scope.regTraProps.regselectedtra;
        traObj.Name = $scope.regTraProps.traName;
        traObj.Experience = $scope.regTraProps.regaddtraexperience;
        traObj.QualificationNumber = $scope.regTraProps.regaddtrano;
        console.warn('$scope.regTraProps.regtraexporqua:' + $scope.regTraProps.regtraexporqua);
        traObj.UserCertificationTypeId = $scope.regTraProps.regtraexporqua;
        traObj.UserCertificationTypeName = traObj.UserCertificationTypeId == '2' ? 'Experienced' : 'Qualified';
        traObj.isQualified = $scope.regTraProps.onlyforexp;
        traObj.qualifiedAllowedOrNot = $scope.regTraProps.qualifiedAllowedOrNot;
        if ($scope.tradeList.length > 0) {
            angular.forEach($scope.tradeList, function(value, key) {
                console.log(value.Name);
                if (value.Id == traObj.Id) {
                    $scope.tradeList.splice($scope.tradeList.indexOf(key), 1);
                    GenericSvc.toast(infoMsgs.tradeDuplication);
                }
            });
            GenericSvc.toast(infoMsgs.tradeAdded);
            $scope.tradeList.push(traObj);
        } else {
            GenericSvc.toast(infoMsgs.tradeAdded);
            $scope.tradeList.push(traObj);
        }
        $scope.closeAddTraModal(); // close modal and reset form fields
        console.warn($scope.tradeList);
    };
    $scope.editTrade = function(tradeToEdit) {
        // Method to edit licence from list
        $scope.regAddTraModal.show();
        $scope.regTraProps.regselectedtra = tradeToEdit.Id;
        $scope.regTraProps.traName = tradeToEdit.Name;
        $scope.regTraProps.regaddtraexperience = tradeToEdit.Experience;
        $scope.regTraProps.regaddtrano = tradeToEdit.QualificationNumber;
        // $scope.regTraProps.regaddlicexpiry = tradeToEdit.LicenceExpiry;
        // $scope.regTraProps.licType = tradeToEdit.LicenceType;
        $scope.regTraProps.regtraexporqua = tradeToEdit.UserCertificationTypeId;
        $scope.regTraProps.qualifiedAllowedOrNot = $scope.regTraProps.onlyforexp = $scope.regTraProps.showorhideexp = tradeToEdit.isQualified;
        $scope.regTraProps.hidesavebtn = false;
        $scope.regTraProps.regTraAddBtnTxt = 'Update';
    };
    $scope.removeTrade = function(tradeToRemove) {
        // Method to remove trade from list
        $scope.tradeList.splice($scope.tradeList.indexOf(tradeToRemove), 1);
    };
    $scope.changeToPosPage = function() {
        // Method to change to Position list page
        RegDataSvc.tradeList = $scope.tradeList; // save ticket list 
        $state.go('master.regposlist');
    };
    $scope.$watch('regTraProps.regtraexporqua', function() {
        $scope.toggleExpFields();
    });
    $scope.regTraProps = {};
    $scope.tradeList = RegDataSvc.tradeList;
    $scope.resetAddTraForm();
    $scope.fetchActiveTrades();

})

.controller('RegPosCtrl', function($scope, $state, $ionicModal,
    RegSvc, RegDataSvc, GenericSvc, infoMsgs) {
    // Load Add Licence Modal    
    $ionicModal.fromTemplateUrl('templates/signupin/regaddpos-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.regAddPosModal = modal;
    });

    $scope.resetAddPosForm = function() {
        // Method to reset Add Trade form
        $scope.regPosProps.regselectedpos = '0';
        $scope.regPosProps.qualifiedAllowedOrNot = true;
        $scope.regPosProps.regposexporqua = '0';
        $scope.regPosProps.onlyforexp = false;
        $scope.regPosProps.regaddposno = '';
        $scope.regPosProps.regaddposexperience = '';
        $scope.regPosProps.showorhideexp = false;
        $scope.regPosProps.hidesavebtn = true;
        $scope.regPosProps.regPosAddBtnTxt = 'Add';
    };
    $scope.closeAddPosModal = function() {
        // Method to close Add Trade Modal and reset the form
        $scope.regAddPosModal.hide();
        $scope.resetAddPosForm();
    };
    $scope.fetchActivePositions = function() {
        // Method to fetch active trades
        if (GenericSvc.checkInternet()) {
            GenericSvc.showLoader();
            RegSvc.getActivePosition().then(function(response) {
                var res = response.data;
                $scope.activePositions = res.Result;
                GenericSvc.hideLoader();
            }, function(err) {
                GenericSvc.hideLoader();
            });
        } else
            GenericSvc.toast(errorMsgs.noInternet);
    };
    $scope.fetchSelectedPositionDetail = function() {
        // Method to fetch the details of selected licence
        if (GenericSvc.checkInternet()) {
            GenericSvc.showLoader();
            $scope.regPosProps.hidesavebtn = $scope.regPosProps.regselectedpos == "0" ? true : false;
            $scope.regPosProps.qualifiedAllowedOrNot = $scope.regPosProps.regselectedpos == "0" ? true : false;
            RegSvc.getPositionDetail($scope.regPosProps.regselectedpos).then(function(response) {
                if (response.data.IsSuccessful) {
                    var positionInfo = response.data.Result;
                    $scope.regPosProps.qualifiedAllowedOrNot = $scope.regPosProps.regselectedpos == "0" ? true : positionInfo.IsQualifiedAllowed;
                    $scope.regPosProps.onlyforexp = positionInfo.IsQualifiedAllowed;
                    if (positionInfo.IsQualifiedAllowed)
                        $scope.regPosProps.regposexporqua = '1';
                    $scope.regPosProps.showorhideexp = positionInfo.IsQualifiedAllowed;
                    // $scope.regTraProps.traType = tradeInfo.LicenceAbbr;
                    $scope.regPosProps.posName = positionInfo.Name;
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
        $scope.regPosProps.onlyforexp = $scope.regPosProps.regposexporqua == "1" ? true : false;
        $scope.regPosProps.showorhideexp = $scope.regPosProps.regposexporqua != "0" ? true : false;
    };
    $scope.savePosition = function() {
        // Method to save trade
        var posObj = {};
        posObj.Id = posObj.PositionHeldId = $scope.regPosProps.regselectedpos;
        posObj.Name = $scope.regPosProps.posName;
        posObj.Experience = $scope.regPosProps.regaddposexperience;
        posObj.QualificationNumber = $scope.regPosProps.regaddposno;
        posObj.UserCertificationTypeId = $scope.regPosProps.regposexporqua;
        posObj.UserCertificationTypeName = posObj.UserCertificationTypeId == '2' ? 'Experienced' : 'Qualified';
        posObj.isQualified = $scope.regPosProps.onlyforexp;
        posObj.qualifiedAllowedOrNot = $scope.regPosProps.qualifiedAllowedOrNot;
        if ($scope.positionList.length > 0) {
            angular.forEach($scope.positionList, function(value, key) {
                console.log(value.Name);
                if (value.Id == posObj.Id) {
                    $scope.positionList.splice($scope.positionList.indexOf(key), 1);
                    GenericSvc.toast(infoMsgs.positionDuplication);
                }
            });
            GenericSvc.toast(infoMsgs.positionAdded);
            $scope.positionList.push(posObj);
        } else {
            GenericSvc.toast(infoMsgs.positionAdded);
            $scope.positionList.push(posObj);
        }
        $scope.closeAddPosModal(); // close modal and reset form fields
        console.warn($scope.positionList);
    };
    $scope.editPosition = function(positionToEdit) {
        // Method to edit licence from list
        $scope.regAddPosModal.show();
        $scope.regPosProps.regselectedpos = positionToEdit.Id;
        $scope.regPosProps.posName = positionToEdit.Name;
        $scope.regPosProps.regaddposexperience = positionToEdit.Experience;
        $scope.regPosProps.regaddposno = positionToEdit.QualificationNumber;
        // $scope.regPosProps.regaddlicexpiry = positionToEdit.LicenceExpiry;
        // $scope.regTraProps.licType = tradeToEdit.LicenceType;
        $scope.regPosProps.regposexporqua = positionToEdit.UserCertificationTypeId;
        $scope.regPosProps.qualifiedAllowedOrNot = $scope.regPosProps.onlyforexp = $scope.regPosProps.showorhideexp = positionToEdit.isQualified;
        $scope.regPosProps.hidesavebtn = false;
        $scope.regPosProps.regPosAddBtnTxt = 'Update';
    };
    $scope.removePosition = function(positionToRemove) {
        // Method to remove trade from list
        $scope.positionList.splice($scope.positionList.indexOf(positionToRemove), 1);
    };
    $scope.changeToPhotoPage = function() {
        // Method to change to Position list page
        RegDataSvc.positionList = $scope.positionList; // save ticket list 
        $state.go('master.regphotopage');
    };
    $scope.$watch('regPosProps.regposexporqua', function() {
        $scope.toggleExpFields();
    });
    $scope.regPosProps = {};
    $scope.positionList = RegDataSvc.positionList;
    $scope.resetAddPosForm();
    $scope.fetchActivePositions();

})

.controller('RegPhotoCtrl', function($scope, $cordovaCamera, $state, $ionicActionSheet, $filter,
    GenericSvc, RegSvc, RegDataSvc, errorMsgs, infoMsgs) {
    $scope.userPicData={};
    $scope.userPicData.userPicUrl;
    $scope.showPicOptions = function() {
        // Method to open show picture options
        $scope.actionSheet = $ionicActionSheet.show({
            buttons: [
                { text: '<b><i class="icon ion-camera calm"></i>Take Photo</b>' },
                { text: '<b><i class="icon ion-document-text calm"></i>Use Existing Photo</b>' }
            ],
            destructiveText: '<b><i class="icon ion-android-cancel assertive"></i>Cancel</b>',
            titleText: 'Choose option',
            /*cancelText: 'Cancel',
            cancel: function() {
                // add cancel code..
            },*/
            buttonClicked: function(index) {
                if (index == 0) {
                    $scope.openCameraOrGallery('Camera.PictureSourceType.CAMERA');
                    // $scope.regPhotoProps.hideregbtn = false;
                } else if (index == 1) {
                    $scope.openCameraOrGallery('Camera.PictureSourceType.PHOTOLIBRARY');
                    // $scope.regPhotoProps.hideregbtn = false;
                } else
                    return true;
                $scope.actionSheet();
            },
            destructiveButtonClicked: function() {
                //Do Stuff
                return true; //Close the model?
            }
        });
    };
    $scope.showRegisterBtn = function() {
        // Method to show register button
        $scope.regPhotoProps.hideregbtn = false;
        console.log("Showing Register button");
    };
    $scope.openCameraOrGallery = function(sourceType) {
        // Method to open device camera
        if (sourceType == "Camera.PictureSourceType.CAMERA")
            sourceType = Camera.PictureSourceType.CAMERA;
        else if (sourceType == "Camera.PictureSourceType.PHOTOLIBRARY")
            sourceType = Camera.PictureSourceType.PHOTOLIBRARY;
        var cameraOptions = GenericSvc.setCameraOptions(sourceType);
        //console.warn("sourceType:" + sourceType + "cameraOptions:" + JSON.stringify(cameraOptions));
        $cordovaCamera.getPicture(cameraOptions).then(function(dataUrl) {
            $scope.userPicData.userPicUrl= dataUrl;
            $scope.userPicData.style={};
            RegDataSvc.regProfilePic = dataUrl;
            localStorage.regProfilePic=dataUrl;
            /*var profilePic=GenericSvc.tellImageID(dataUrl);
            $scope.pictureLoader={
                'background-image':'url(' + profilePic + ')'
            };*/
            GenericSvc.fillProfilePic($scope.userPicData.userPicUrl, 'regpropic');
            $scope.showRegisterBtn();            
        }, function(err) {GenericSvc.toast(err)});
    };
    $scope.configureForReg = function() {
        // Method to configure the object for registration
        var tempFormObj = RegDataSvc.regFormData;
        var regObj = {};
        regObj.titleId = tempFormObj.title;
        regObj.Title = RegSvc.tellTitleName(tempFormObj.title)
        regObj.FirstName = tempFormObj.fname;
        regObj.MiddleName = tempFormObj.mname;
        regObj.LastName = tempFormObj.lname;
        regObj.DateOfBirth = GenericSvc.convertUIDateToDb(new Date(tempFormObj.dob));
        regObj.Email = tempFormObj.email;
        regObj.StreetAddress = tempFormObj.streetaddress;
        regObj.City = tempFormObj.city;
        regObj.State = tempFormObj.state;
        regObj.Postcode = tempFormObj.postcode;
        regObj.ContactNumber = tempFormObj.primarycontact;
        regObj.SecondaryContact = tempFormObj.secondarycontact;
        regObj.IsPaySlipSent = tempFormObj.isemailsent;
        regObj.Password = tempFormObj.pinno;
        regObj.GenderId = tempFormObj.gender;
        regObj.UserLicenceTicketTypes = RegDataSvc.licenceList;
        regObj.UserTradeExperiences = RegDataSvc.tradeList;
        regObj.UserPositionHelds = RegDataSvc.positionList;
        regObj.ProfileImage = RegDataSvc.regProfilePic;
        $scope.completerRegistration(regObj);
    };
    $scope.completerRegistration = function(regObj) {
        // Method to submit the user registration form
        if (GenericSvc.checkInternet()) {
            GenericSvc.showLoader();
            RegSvc.submitUserForm(regObj).then(function(response) {
                if (response.data.IsSuccessful) {
                    GenericSvc.toast(infoMsgs.regSuc);
                    $state.go('master.regsuc');
                } else
                    GenericSvc.toast(infoMsgs.regFail);
                GenericSvc.hideLoader();
            }, function() {
                GenericSvc.hideLoader();
            });
        } else GenericSvc.toast(errorMsgs.noInternet);
    };
    $scope.regPhotoProps = {};
    $scope.regPhotoProps.hideregbtn = true;
})
