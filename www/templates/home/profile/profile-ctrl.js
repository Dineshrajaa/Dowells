angular.module('dowells.Controllers')
    .controller('ProfileCtrl', function($scope, $ionicActionSheet, $state,
        GenericSvc, ProfileSvc, RegDataSvc, errorMsgs, infoMsgs) {
        // Profile page controller
        $scope.fetchedUserInfo = {};
        $scope.fetchProfileInfo = function() {
            // Method to get profile information
            var currentUserData = angular.fromJson(localStorage.userData);
            if (GenericSvc.checkInternet()) {
                var userDataParam = {};
                userDataParam.userId = currentUserData.ID;
                GenericSvc.showLoader(infoMsgs.gettingUserInfo);
                ProfileSvc.getProfileDetails(userDataParam).then(function(response) {
                    var res = response.data;
                    $scope.fetchedUserInfo = res.Result;
                    $scope.fetchedUserInfo.GenderName = ProfileSvc.tellGenderName($scope.fetchedUserInfo.GenderId);
                    $scope.fetchedUserInfo.paySlipSent = $scope.fetchedUserInfo.IsPaySlipSent ? 'Yes' : 'No';
                    GenericSvc.fillProfilePic($scope.fetchedUserInfo.ProfilePicture, 'userProfilePicture');
                    GenericSvc.hideLoader();
                }, function(err) {
                    GenericSvc.hideLoader();
                });
            } else GenericSvc.toast(errorMsgs.noInternet);
        };
        $scope.showPicOptions = function() {
            // Method to open show picture options
            $scope.actionSheet = $ionicActionSheet.show({
                buttons: [
                    { text: '<b><i class="icon ion-camera calm"></i>Take Photo</b>' },
                    { text: '<b><i class="icon ion-document-text calm"></i>Use Existing Photo</b>' }
                ],
                destructiveText: '<b><i class="icon ion-android-cancel assertive"></i>Cancel</b>',
                titleText: 'Choose option',
                cancelText: 'Cancel',
                destructiveButtonClicked: function() {
                    //Do Stuff
                    return true; //Close the model?
                },
                cancel: function() {
                    $scope.actionSheet();
                },
                buttonClicked: function(index) {
                    if (index == 0) {
                        $scope.openCameraOrGallery('Camera.PictureSourceType.CAMERA');
                    } else if (index == 1) {
                        $scope.openCameraOrGallery('Camera.PictureSourceType.PHOTOLIBRARY');
                    } else
                        return true;
                    $scope.actionSheet();
                }
            });
        };
        $scope.openCameraOrGallery = function(sourceType) {
            // Method to open device camera
            if (sourceType == "Camera.PictureSourceType.CAMERA")
                sourceType = Camera.PictureSourceType.CAMERA;
            else if (sourceType == "Camera.PictureSourceType.PHOTOLIBRARY")
                sourceType = Camera.PictureSourceType.PHOTOLIBRARY;
            var cameraOptions = GenericSvc.setCameraOptions(sourceType);
            //console.warn("sourceType:" + sourceType + "cameraOptions:" + JSON.stringify(cameraOptions));
            navigator.camera.getPicture(function(dataUrl) {
                $scope.updateProfilePic(dataUrl);

            }, function() {}, cameraOptions);
        };
        $scope.updateProfilePic = function(dataUrl) {
            // Method to upload profile picture
            var currentUserData = angular.fromJson(localStorage.userData);
            if (GenericSvc.checkInternet()) {
                var userDataParam = {};
                userDataParam.UserId = currentUserData.ID;
                userDataParam.ProfileImage = dataUrl;
                GenericSvc.showLoader(infoMsgs.updatingPic);
                ProfileSvc.setProfilePicture(userDataParam).then(function(response) {
                        var res = response.data;
                        if (res.IsSuccessful) {
                            currentUserData.ProfilePicture = dataUrl;
                            localStorage.userData = angular.toJson(currentUserData);
                            GenericSvc.fillProfilePic(dataUrl, 'userProfilePic');
                            GenericSvc.fillProfilePic(dataUrl, 'userProfilePicture');
                            GenericSvc.toast(infoMsgs.updatePicSuc);
                        }
                        GenericSvc.hideLoader();
                    },
                    function(err) {
                        GenericSvc.hideLoader();
                    });
            } else GenericSvc.toast(errorMsgs.noInternet);

        };
        $scope.changeToEditProPage = function() {
            // Method to navigate to edit profile page
            RegDataSvc.storeRegFormData($scope.fetchedUserInfo);
            $state.go('home.updatepersdetails');
            // $scope.configureForPlaceSearch();
        };
        $scope.configureForPlaceSearch = function() {
            // Method to configure options for Google search
            var options = {
                types: ['geocode'],
                componentRestrictions: { country: "au" }
            };
            $scope.placeSearch, $scope.autocomplete;
            $scope.componentForm = {
                street_number: 'long_name',
                route: 'long_name',
                locality: 'long_name',
                administrative_area_level_1: 'long_name',
                //country: 'long_name',
                postal_code: 'long_name'
            };

            var input = document.getElementById("keyword");
            console.warn(input);
            $scope.autocomplete = new google.maps.places.Autocomplete(input, options);
            autocomplete.addListener('place_changed', $scope.fillInAddress);
        };
        $scope.fillInAddress = function() {
            // Method to fill the address fields based on search
            // Get the place details from the autocomplete object.
            var place = $scope.autocomplete.getPlace();
            for (var component in $scope.componentForm) {
                if (component == "route") continue;
                document.getElementById(component).value = '';
                document.getElementById(component).disabled = false;
            }

            // Get each component of the address from the place details
            // and fill the corresponding field on the form.
            for (var i = 0; i < place.address_components.length; i++) {
                var addressType = place.address_components[i].types[0];
                if ($scope.componentForm[addressType]) {
                    if (addressType == 'route') {
                        var val = place.address_components[i][$scope.componentForm[addressType]];
                        document.getElementById('street_number').value += " " + val;
                        document.getElementById('street_number').value = document.getElementById('street_number').value.trim();
                        continue;
                    }
                    var val = place.address_components[i][$scope.componentForm[addressType]];
                    document.getElementById(addressType).value = val;
                }
            }
        };
        $scope.fetchProfileInfo();

    })

.controller('EditProfileCtrl', function($scope, $timeout, $filter,
    GenericSvc, RegDataSvc, ProfileSvc, errorMsgs, infoMsgs) {
    $scope.titleList = [{ id: 1, text: 'Mr' }, { id: 2, text: 'Mrs' }, { id: 3, text: 'Miss' }, { id: 4, text: 'Ms' }];
    $scope.genderList = [{ id: 1, text: 'Please Select' }, { id: 2, text: 'Male' }, { id: 3, text: 'Female' }];
    $scope.uu = {};
    $scope.uu = RegDataSvc.regFormData;
    $scope.uu.titleId = GenericSvc.tellTitleId($scope.uu.Title);
    $scope.uu.DateOfBirth = new Date($scope.uu.DateOfBirth);
    $scope.changeSelectedItem = function() {
        console.log('wow' + $scope.uu.titleId);
    };

    $scope.updateUserProfile = function() {
        // Method to save the updated profile
        if (GenericSvc.checkInternet()) {
            GenericSvc.showLoader(infoMsgs.updatingPro);
            ProfileSvc.setUserProfile($scope.uu).then(function(response) {
                var currentUserObj = angular.fromJson(localStorage.userData);
                $scope.uu.JobStatusType = currentUserObj.JobStatusType;
                localStorage.userData = angular.toJson($scope.uu);
                RegDataSvc.regFormData = {}; // clear the regForm data
                GenericSvc.toast(infoMsgs.updatingProSuc);
                GenericSvc.hideLoader();
            }, function(err) {
                GenericSvc.hideLoader();
            })
        } else GenericSvc.toast(errorMsgs.noInternet);
    };

})

.controller('EditDocuCtrl', function($scope, $ionicModal, $ionicPopup,
    GenericSvc, RegSvc, ProfileSvc, errorMsgs, infoMsgs) {
    $scope.licenceList = $scope.tradeList = $scope.positionList = [];
    $scope.proAddLicProps = {};
    // Load Add Licence Modal    
    $ionicModal.fromTemplateUrl('templates/home/profile/profileaddlic-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.proAddLicModal = modal;
    });
    $scope.closeAddLicModal = function() {
        // Method to close Add Licence modal window
        $scope.proAddLicModal.hide();
        $scope.resetAddLicForm();

    };
    $scope.fetchDocumentDetails = function() {
        // Method to fetch the document details
        if (GenericSvc.checkInternet()) {
            GenericSvc.showLoader(infoMsgs.gettingDocInfo);
            var currentUserData = angular.fromJson(localStorage.userData);
            var userDataParam = {};
            userDataParam.id = currentUserData.ID;
            ProfileSvc.getDocumentDetails(userDataParam).then(function(response) {
                var res = response.data;
                if (res.IsSuccessful) {
                    $scope.licenceList = res.Result.LicenceTicketTypeList;
                    $scope.tradeList = res.Result.TradeExpList;
                    $scope.positionList = res.Result.PositionHeldList;
                    console.warn("Trade list:" + $scope.tradeList);
                }
                GenericSvc.hideLoader();
                
            }, function(err) {
                GenericSvc.hideLoader();
            });
        } else GenericSvc.toast(errorMsgs.noInternet);
    };
    $scope.fetchActiveLicences = function() {
        // Method to fetch active licences

        if (GenericSvc.checkInternet()) {
            GenericSvc.showLoader();
            RegSvc.getActiveLicence().then(function(response) {
                var res = response.data;
                $scope.activeLicences = res.Result;
                console.warn("$scope.activeLicences:" + angular.toJson($scope.activeLicences));
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
            $scope.proAddLicProps.hidesavebtn = $scope.proAddLicProps.proselectedlic == "0" ? true : false;
            $scope.proAddLicProps.qualifiedAllowedOrNot = $scope.proAddLicProps.proselectedlic == "0" ? true : false;
            RegSvc.getLicenceDetail($scope.proAddLicProps.proselectedlic).then(function(response) {
                if (response.data.IsSuccessful) {
                    var licenceInfo = response.data.Result;
                    $scope.proAddLicProps.qualifiedAllowedOrNot = $scope.proAddLicProps.proselectedlic == "0" ? true : licenceInfo.IsQualifiedAllowed;
                    // $scope.proAddLicProps.onlyforexplic = licenceInfo.IsQualifiedAllowed;
                    // $scope.proAddLicProps.showorhideexp = licenceInfo.IsQualifiedAllowed;
                    $scope.proAddLicProps.licType = licenceInfo.LicenceAbbr;
                    $scope.proAddLicProps.licName = licenceInfo.Name;
                }
                GenericSvc.hideLoader();
            }, function(err) {
                GenericSvc.hideLoader();
            });
        } else
            GenericSvc.toast(errorMsgs.noInternet);
    };
    $scope.resetAddLicForm = function() {
        // Method to reset Add Licence form
        $scope.proAddLicProps.qualifiedAllowedOrNot = true; // Hide the Radio buttons initially
        $scope.proAddLicProps.onlyforexplic = false; // Initially hide the Experienced details
        $scope.proAddLicProps.showorhideexp = false; // Initially hide experience field
        $scope.proAddLicProps.hidesavebtn = true; // Initially hide save button
        $scope.proAddLicProps.proselectedlic = "0";
        $scope.proAddLicProps.prolicexporqua = "0";
        $scope.proAddLicProps.licType = "";
        $scope.proAddLicProps.licName = "";
        $scope.proAddLicProps.regLicAddBtnTxt = 'Update';
    };
    $scope.editLicence = function(licenceToEdit) {
        // Method to edit licence from list

        if (GenericSvc.checkInternet()) {
            GenericSvc.showLoader(infoMsgs.gettingTicInfo);
            ProfileSvc.getSelectedTicketInfo(licenceToEdit.Id).then(function(response) {
                console.log('Licence info:' + angular.toJson(response.data));
                var res = response.data;
                if (res.IsSuccessful) {
                    var res = res.Result;
                    $scope.proAddLicProps.selectedTicketId = res.Id;
                    $scope.proAddLicProps.proselectedlic = res.LicenceTicketTypeId;
                    $scope.proAddLicProps.proaddexp = res.Experience;
                    $scope.proAddLicProps.prolicexporqua = res.UserCertificationTypeId;
                    $scope.proAddLicProps.proaddlicno = res.LicenceNumber;
                    $scope.proAddLicProps.proaddlicexpiry = new Date(res.LicenceExpiry);
                    $scope.proAddLicProps.hidesavebtn = false;
                    $scope.proAddLicProps.showorhideexp=true;
                    $scope.proAddLicProps.onlyforexplic = res.UserCertificationTypeId == 1 ? true : false;
                    console.warn(angular.toJson($scope.proAddLicProps));
                    $scope.proAddLicProps.qualifiedAllowedOrNot = $scope.proAddLicProps.onlyforexplic;
                    $scope.proAddLicProps.regLicAddBtnTxt = 'Update';
                    $scope.proAddLicModal.show();
                    GenericSvc.hideLoader();
                }
                /*$scope.proAddLicProps.licName = licenceToEdit.Name;
                $scope.proAddLicProps.licType = licenceToEdit.LicenceType;
                $scope.proAddLicProps.qualifiedAllowedOrNot = $scope.proAddLicProps.onlyforexp = $scope.proAddLicProps.showorhideexp = licenceToEdit.qualifiedAllowedOrNot;*/
            }, function(err) {
                GenericSvc.hideLoader();
            })
        } else
            GenericSvc.toast(errorMsgs.noInternet);
    };

    $scope.saveLicence = function() {
        // Method to configure licence for saving
        var licObj = {};
        var currentUserData = angular.fromJson(localStorage.userData);
        licObj.Id = $scope.proAddLicProps.selectedTicketId;
        licObj.LicenceTicketTypeId = $scope.proAddLicProps.proselectedlic;
        licObj.UserId = currentUserData.ID;
        licObj.Name = $scope.proAddLicProps.licName;
        licObj.Experience = $scope.proAddLicProps.proaddexp;
        licObj.LicenceNumber = $scope.proAddLicProps.proaddlicno;
        licObj.LicenceExpiry = $scope.proAddLicProps.proaddlicexpiry;
        licObj.LicenceType = $scope.proAddLicProps.licType;
        licObj.UserCertificationTypeId = $scope.proAddLicProps.prolicexporqua;
        licObj.UserCertificationTypeName = licObj.UserCertificationTypeId == 1 ? 'Experienced' : 'Qualified';
        if (GenericSvc.checkInternet()) {
            GenericSvc.showLoader(infoMsgs.savingLic);
            ProfileSvc.saveTicket(licObj).then(function(response) {
                var res = response.data;
                if (res.IsSuccessful) {
                    GenericSvc.hideLoader();
                    GenericSvc.toast(infoMsgs.ticketAdded);
                    $scope.closeAddLicModal();
                    $scope.fetchDocumentDetails();
                }
            }, function(err) {
                GenericSvc.hideLoader();
            });
        } else
            GenericSvc.toast(errorMsgs.noInternet);

    };

    $scope.deleteLicence = function(selectedLicence) {
        // Method to delete licence
        var delLicConfirm = $ionicPopup.confirm({
            title: 'Delete Licence/Ticket',
            template: 'Are you sure you want to delete this Licence/Ticket?'
        });

        delLicConfirm.then(function(res) {
            if (res) {
                if (GenericSvc.checkInternet()) {
                    ProfileSvc.deleteTicket(selectedLicence.Id).then(function(response) {
                        var res = response.data;
                        if (res.IsSuccessful) {
                            GenericSvc.toast(infoMsgs.delLicSuc);
                            $scope.fetchDocumentDetails();
                        }
                    })

                } else GenericSvc.toast(errorMsgs.noInternet);
            } else {
                console.log('You are not sure');
            }
        });
    };

    $scope.toggleLicExpFields = function() {
        // Method to show or hide Experienced fields
        console.warn('toggleLicExpFields invoked');
        $scope.proAddLicProps.onlyforexplic = $scope.proAddLicProps.prolicexporqua == "1" ? true : false;
        $scope.proAddLicProps.showorhideexp = $scope.proAddLicProps.prolicexporqua != "0" ? true : false;
    };

    $scope.fetchDocumentDetails();
    $scope.fetchActiveLicences();
    $scope.resetAddLicForm();
    $scope.$watch('proAddLicProps.prolicexporqua', function() {
        $scope.toggleLicExpFields();
    });
    $scope.$watch('proAddLicProps.proselectedlic', function() {
        if ($scope.proAddLicProps.proselectedlic != 0)
            $scope.fetchSelectedLicenceDetail();
    });

    /*Trade methods start*/
    // Load Add Trade Modal 
    $scope.proTraProps = {};
    $ionicModal.fromTemplateUrl('templates/home/profile/profileaddtra-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.proAddTraModal = modal;
    });

    $scope.resetAddTraForm = function() {
        // Method to reset Add Trade form
        $scope.proTraProps.proselectedtra = '0';
        $scope.proTraProps.qualifiedAllowedOrNot = true;
        $scope.proTraProps.protraexporqua = '0';
        $scope.proTraProps.onlyforexptra = false;
        $scope.proTraProps.proaddtrano = '';
        $scope.proTraProps.proaddtraexperience = '';
        $scope.proTraProps.showorhideexp = false;
        $scope.proTraProps.hidesavebtn = true;
        $scope.proTraProps.proTraAddBtnTxt = 'Add';
    };
    $scope.closeAddTraModal = function() {
        // Method to close Add Trade Modal and reset the form
        $scope.proAddTraModal.hide();
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
            $scope.proTraProps.hidesavebtn = $scope.proTraProps.proselectedtra == "0" ? true : false;
            $scope.proTraProps.qualifiedAllowedOrNot = $scope.proTraProps.proselectedtra == "0" ? true : false;
            RegSvc.getTradeDetail($scope.proTraProps.proselectedtra).then(function(response) {
                if (response.data.IsSuccessful) {
                    var tradeInfo = response.data.Result;
                    $scope.proTraProps.qualifiedAllowedOrNot = $scope.proTraProps.proselectedtra == "0" ? true : tradeInfo.IsQualifiedAllowed;
                    // $scope.proTraProps.onlyforexptra = tradeInfo.IsQualifiedAllowed;
                    // $scope.proTraProps.showorhideexp = tradeInfo.IsQualifiedAllowed;
                    // $scope.proTraProps.traType = tradeInfo.LicenceAbbr;
                    $scope.proTraProps.traName = tradeInfo.Name;
                }
                GenericSvc.hideLoader();
            }, function(err) {
                GenericSvc.hideLoader();
            });
        } else
            GenericSvc.toast(errorMsgs.noInternet);
    };
    $scope.toggleTraExpFields = function() {
        // Method to show or hide Experienced fields
        console.warn('toggleExpFields invoked');
        $scope.proTraProps.onlyforexptra = $scope.proTraProps.protraexporqua == "1" ? true : false;
        $scope.proTraProps.showorhideexp = $scope.proTraProps.protraexporqua != "0" ? true : false;
    };
    $scope.saveTrade = function() {
        // Method to save trade
        var traObj = {};
        var currentUserData = angular.fromJson(localStorage.userData);
        traObj.UserId = currentUserData.ID;
        traObj.Id = $scope.proTraProps.selectedTradeId;
        traObj.Name = $scope.proTraProps.traName;
        traObj.Experience = $scope.proTraProps.proaddtraexperience;
        traObj.QualificationNumber = $scope.proTraProps.proaddtrano;
        traObj.TradeExperienceId = $scope.proTraProps.proselectedtra;
        traObj.UserCertificationTypeId = $scope.proTraProps.protraexporqua;
        traObj.UserCertificationTypeName = traObj.UserCertificationTypeId == '2' ? 'Experienced' : 'Qualified';
        // traObj.isQualified = $scope.proTraProps.onlyforexp;
        // traObj.qualifiedAllowedOrNot = $scope.proTraProps.qualifiedAllowedOrNot;
        if (GenericSvc.checkInternet()) {
            GenericSvc.showLoader(infoMsgs.savingTra);
            ProfileSvc.saveTrade(traObj).then(function(response) {
                var res = response.data;
                if (res.IsSuccessful) {
                    GenericSvc.hideLoader();
                    GenericSvc.toast(infoMsgs.tradeAdded);
                    $scope.closeAddTraModal();
                    $scope.fetchDocumentDetails();
                }
            }, function(err) {
                GenericSvc.hideLoader();
            });
        } else
            GenericSvc.toast(errorMsgs.noInternet);




    };
    $scope.editTrade = function(tradeToEdit) {
        // Method to edit Trade from list
        console.warn("TradeToEdit:" + angular.toJson(tradeToEdit));
        if (GenericSvc.checkInternet()) {
            GenericSvc.showLoader(infoMsgs.gettingTraInfo);
            ProfileSvc.getSelectedTradeInfo(tradeToEdit.Id).then(function(response) {
                console.log('Trade info:' + angular.toJson(response.data));
                var res = response.data;
                if (res.IsSuccessful) {
                    var res = res.Result;
                    $scope.proTraProps.selectedTradeId = res.Id;
                    $scope.proTraProps.proselectedtra = res.TradeExperienceId;
                    $scope.proTraProps.proaddtraexperience = res.Experience;
                    $scope.proTraProps.protraexporqua = res.UserCertificationTypeId;
                    $scope.proTraProps.proaddquano = res.QualificationNumber;
                    $scope.proTraProps.proTraAddBtnTxt = 'Update';
                    $scope.proTraProps.hidesavebtn = false;
                    $scope.proTraProps.onlyforexptra = res.UserCertificationTypeId == 2 ? true : false;
                    $scope.proTraProps.qualifiedAllowedOrNot = $scope.proTraProps.onlyforexptra;
                    $scope.proAddTraModal.show();
                    GenericSvc.hideLoader();
                }

            }, function(err) {
                GenericSvc.hideLoader();
            })
        } else
            GenericSvc.toast(errorMsgs.noInternet);
    };
    $scope.deleteTrade = function(tradeToRemove) {
        // Method to remove trade from list
        var delTraConfirm = $ionicPopup.confirm({
            title: 'Delete Licence/Ticket',
            template: 'Are you sure you want to delete this Trade?'
        });

        delTraConfirm.then(function(res) {
            if (res) {
                if (GenericSvc.checkInternet()) {
                    ProfileSvc.deleteTrade(tradeToRemove.Id).then(function(response) {
                        var res = response.data;
                        if (res.IsSuccessful) {
                            GenericSvc.toast(infoMsgs.delTraSuc);
                            $scope.fetchDocumentDetails();
                        }
                    })

                } else GenericSvc.toast(errorMsgs.noInternet);
            } else {
                console.log('You are not sure');
            }
        });
    };

    $scope.$watch('proTraProps.protraexporqua', function() {
        $scope.toggleTraExpFields();
    });
    $scope.$watch('proTraProps.proselectedtra', function() {
        if ($scope.proTraProps.proselectedtra != '0')
            $scope.fetchSelectedTradeDetail();
    });
    $scope.resetAddTraForm();
    $scope.fetchActiveTrades();
    /*Trade methods end*/

    /*Position methods start*/
    $scope.proPosProps = {};
    $ionicModal.fromTemplateUrl('templates/home/profile/profileaddpos-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.proAddPosModal = modal;
    });

    $scope.resetAddPosForm = function() {
        // Method to reset Add Trade form
        $scope.proPosProps.proselectedpos = '0';
        $scope.proPosProps.qualifiedAllowedOrNot = true;
        $scope.proPosProps.proposexporqua = '0';
        $scope.proPosProps.onlyforexppos = false;
        $scope.proPosProps.proaddposno = '';
        $scope.proPosProps.proaddposexperience = '';
        $scope.proPosProps.showorhideexp = false;
        $scope.proPosProps.hidesavebtn = true;
        $scope.proPosProps.proPosAddBtnTxt = 'Add';
    };
    $scope.closeAddPosModal = function() {
        // Method to close Add Trade Modal and reset the form
        $scope.proAddPosModal.hide();
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
            $scope.proPosProps.hidesavebtn = $scope.proPosProps.proselectedpos == "0" ? true : false;
            $scope.proPosProps.qualifiedAllowedOrNot = $scope.proPosProps.proselectedpos == "0" ? true : false;
            RegSvc.getPositionDetail($scope.proPosProps.proselectedpos).then(function(response) {
                if (response.data.IsSuccessful) {
                    var positionInfo = response.data.Result;
                    $scope.proPosProps.qualifiedAllowedOrNot = $scope.proPosProps.proselectedpos == "0" ? true : positionInfo.IsQualifiedAllowed;
                    // $scope.proPosProps.onlyforexppos = positionInfo.IsQualifiedAllowed;
                    // $scope.proPosProps.showorhideexp = positionInfo.IsQualifiedAllowed;
                    $scope.proPosProps.posName = positionInfo.Name;
                }
                GenericSvc.hideLoader();
            }, function(err) {
                GenericSvc.hideLoader();
            });
        } else
            GenericSvc.toast(errorMsgs.noInternet);
    };
    $scope.togglePosExpFields = function() {
        // Method to show or hide Experienced fields
        console.warn('$scope.proPosProps.proposexporqua:'+$scope.proPosProps.proposexporqua);
        $scope.proPosProps.onlyforexppos = $scope.proPosProps.proposexporqua == "1" ? true : false;
        $scope.proPosProps.showorhideexp = $scope.proPosProps.proposexporqua != "0" ? true : false;
    };
    $scope.savePosition = function() {
        // Method to save trade
        var posObj = {};
        var currentUserData = angular.fromJson(localStorage.userData);
        posObj.UserId = currentUserData.ID;
        posObj.Id = $scope.proPosProps.selectedPositionId;
        posObj.Name = $scope.proPosProps.posName;
        posObj.Experience = $scope.proPosProps.proaddposexperience;
        posObj.QualificationNumber = $scope.proPosProps.proaddposno;
        posObj.PositionHeldId = $scope.proPosProps.proselectedpos;
        posObj.UserCertificationTypeId = $scope.proPosProps.proposexporqua;
        posObj.UserCertificationTypeName = posObj.UserCertificationTypeId == '2' ? 'Experienced' : 'Qualified';
        // posObj.isQualified = $scope.proPosProps.onlyforexp;
        // posObj.qualifiedAllowedOrNot = $scope.proPosProps.qualifiedAllowedOrNot;
        if (GenericSvc.checkInternet()) {
            GenericSvc.showLoader(infoMsgs.savingPos);
            ProfileSvc.savePosition(posObj).then(function(response) {
                var res = response.data;
                if (res.IsSuccessful) {
                    GenericSvc.hideLoader();
                    GenericSvc.toast(infoMsgs.positionAdded);
                    $scope.closeAddPosModal();
                    $scope.fetchDocumentDetails();
                }
            }, function(err) {
                GenericSvc.hideLoader();
            });
        } else
            GenericSvc.toast(errorMsgs.noInternet);




    };
    $scope.editPosition = function(positionToEdit) {
        // Method to edit Trade from list
        console.warn("positionToEdit:" + angular.toJson(positionToEdit));
        if (GenericSvc.checkInternet()) {
            GenericSvc.showLoader(infoMsgs.gettingPosInfo);
            ProfileSvc.getSelectedPositionInfo(positionToEdit.Id).then(function(response) {
                console.log('Trade info:' + angular.toJson(response.data));
                var res = response.data;
                if (res.IsSuccessful) {
                    var res = res.Result;
                    $scope.proPosProps.selectedPositionId = res.Id;
                    $scope.proPosProps.proselectedpos = res.PositionHeldId;
                    $scope.proPosProps.proaddposexperience = res.Experience;
                    $scope.proPosProps.proposexporqua = res.UserCertificationTypeId;
                    $scope.proPosProps.proaddquano = res.QualificationNumber;
                    $scope.proPosProps.proPosAddBtnTxt = 'Update';
                    $scope.proPosProps.hidesavebtn = false;
                    $scope.proPosProps.onlyforexppos = res.UserCertificationTypeId == 2 ? true : false;
                    $scope.proPosProps.qualifiedAllowedOrNot = $scope.proPosProps.onlyforexppos;
                    $scope.proAddPosModal.show();
                    GenericSvc.hideLoader();
                }

            }, function(err) {
                GenericSvc.hideLoader();
            })
        } else
            GenericSvc.toast(errorMsgs.noInternet);
    };
    $scope.deletePosition = function(positionToRemove) {
        // Method to remove trade from list
        var delPosConfirm = $ionicPopup.confirm({
            title: 'Delete Position',
            template: 'Are you sure you want to delete this Position?'
        });

        delPosConfirm.then(function(res) {
            if (res) {
                if (GenericSvc.checkInternet()) {
                    ProfileSvc.deletePosition(positionToRemove.Id).then(function(response) {
                        var res = response.data;
                        if (res.IsSuccessful) {
                            GenericSvc.toast(infoMsgs.delPosSuc);
                            $scope.fetchDocumentDetails();
                        }
                    })

                } else GenericSvc.toast(errorMsgs.noInternet);
            } else {
                console.log('You are not sure');
            }
        });
    };

    $scope.$watch('proPosProps.proposexporqua', function() {
        $scope.togglePosExpFields();
    });
    $scope.$watch('proPosProps.proselectedpos', function() {
        if ($scope.proPosProps.proselectedpos != '0')
            $scope.fetchSelectedPositionDetail();
    });
    $scope.resetAddPosForm();
    $scope.fetchActivePositions();
    /*Position methods end*/

})
