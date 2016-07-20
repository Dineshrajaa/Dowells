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

.controller('EditProfileCtrl', function($scope, $timeout,
    GenericSvc, RegDataSvc) {
    $scope.uu={};
    $scope.uu = RegDataSvc.regFormData;
    $scope.uu.titleId = GenericSvc.tellTitleId($scope.uu.Title);
    $scope.titleList=[{id:1,text:'Mr'},{id:2,text:'Mrs'},{id:3,text:'Miss'},{id:4,text:'Ms'}];
    $scope.changeSelectedItem = function() {
        console.log('wow' + $scope.uu.titleId);
    }

    console.warn($scope.uu.titleId + 'GenderId' + $scope.uu.GenderId);
})
