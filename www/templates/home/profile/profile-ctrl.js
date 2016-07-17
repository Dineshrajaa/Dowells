angular.module('dowells.Controllers')
    .controller('ProfileCtrl', function($scope, $ionicActionSheet, GenericSvc, ProfileSvc, errorMsgs, infoMsgs) {
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
        $scope.triggerActionSheet = function() {
            // Method to open Action sheet
        };
        $scope.fetchProfileInfo();
    })
