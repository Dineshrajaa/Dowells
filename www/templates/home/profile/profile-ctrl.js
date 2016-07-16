angular.module('dowells.Controllers')
    .controller('ProfileCtrl', function($scope, GenericSvc, ProfileSvc, errorMsgs,infoMsgs) {
        // Profile page controller
        $scope.fetchedUserInfo={};
        $scope.fetchProfileInfo = function() {
            // Method to get profile information
            var currentUserData = angular.fromJson(localStorage.userData);
            if (GenericSvc.checkInternet()) {
                var userDataParam = {};
                userDataParam.userId = currentUserData.ID;
                GenericSvc.showLoader(infoMsgs.gettingUserInfo);
                ProfileSvc.getProfileDetails(userDataParam).then(function(response){
                	var res=response.data;                	
                	$scope.fetchedUserInfo=res.Result;
                	console.warn("ProfileInfo:"+$scope.fetchedUserInfo.ProfilePicture);
                	GenericSvc.fillProfilePic($scope.fetchedUserInfo.ProfilePicture,'userProfilePi');
                	
                	GenericSvc.hideLoader();
                },function(err){
                	GenericSvc.hideLoader();
                });
            } else GenericSvc.toast(errorMsgs.noInternet);
        };
        $scope.fetchProfileInfo();
    })
