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

.controller('EditDocuCtrl', function($scope, $ionicModal,$ionicPopup,
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
                $scope.fetchActiveLicences();
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
                    $scope.proAddLicProps.onlyforexp = licenceInfo.IsQualifiedAllowed;
                    $scope.proAddLicProps.showorhideexp = licenceInfo.IsQualifiedAllowed;
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
        $scope.proAddLicProps.onlyforexp = false; // Initially hide the Experienced details
        $scope.proAddLicProps.showorhideexp = false; // Initially hide experience field
        $scope.proAddLicProps.hidesavebtn = true; // Initially hide save button
        // $scope.proAddLicProps.proselectedlic = "0";
        $scope.proAddLicProps.prolicexporqua = "0";
        $scope.proAddLicProps.licType = "";
        $scope.proAddLicProps.licName = "";
        $scope.proAddLicProps.regLicAddBtnTxt = 'Update';
    };
    $scope.editLicence = function(licenceToEdit) {
        // Method to edit licence from list
        console.warn("licenceToEdit:" + angular.toJson(licenceToEdit));
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

                    $scope.proAddLicProps.onlyforexp = res.UserCertificationTypeId == 2 ? true : false;
                    console.warn(angular.toJson($scope.proAddLicProps));
                    $scope.proAddLicProps.qualifiedAllowedOrNot = $scope.proAddLicProps.onlyforexp;
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
                if(GenericSvc.checkInternet()){
                    ProfileSvc.deleteTicket(selectedLicence.Id).then(function(response){
                      var res=response.data;
                      if(res.IsSuccessful){
                        GenericSvc.toast(infoMsgs.delLicSuc);
                        $scope.fetchDocumentDetails();
                      }
                    })
                    
                }else GenericSvc.toast(errorMsgs.noInternet);
            } else {
                console.log('You are not sure');
            }
        });
    };

    $scope.toggleExpFields = function() {
        // Method to show or hide Experienced fields
        console.warn('toggleExpFields invoked');
        $scope.proAddLicProps.onlyforexp = $scope.proAddLicProps.prolicexporqua == "2" ? true : false;
        $scope.proAddLicProps.showorhideexp = $scope.proAddLicProps.prolicexporqua != "0" ? true : false;
    };

    $scope.fetchDocumentDetails();
    $scope.resetAddLicForm();
    $scope.$watch('proAddLicProps.prolicexporqua', function() {
        $scope.toggleExpFields();
    });
    $scope.$watch('proAddLicProps.proselectedlic', function() {
        $scope.fetchSelectedLicenceDetail();
    });
})
