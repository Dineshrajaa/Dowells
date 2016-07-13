angular.module('dowells.Controllers')
    .controller('HomeCtrl', function($scope,$state) {
        $scope.currentUser = {};
        $scope.fillUserInfo = function() {
            var userData = angular.fromJson(localStorage.userData);
            $scope.currentUser.disName = userData.DisplayName; // Show Display name of the current user
            var profilePic = userData.ProfilePicture;
            if (!profilePic.match(/^data:.*?;base64,/i))
                profilePic = 'data:image/jpg;base64,' + profilePic;
            var profilePicHolder = document.querySelector('#userProfilePic');
            angular.element(profilePicHolder).css('background-image', 'url(' + profilePic + ')')
                .removeClass('no-picture');
        };

        $scope.logout = function() {
            // Method to logout user from the app
            localStorage.removeItem('userData');
            $state.go('master.login');
        };

        /*Function calls*/
        $scope.fillUserInfo();
    })

    .controller('SettingsCtrl',function($scope,GenericSvc,SettingSvc,errorMsgs){
    	$scope.settingsData={};
    	$scope.saveLNPref=function(){
            // Method to save the Local notification preference
            if(settingsData.alertTime==''){
                GenericSvc.toast(errorMsgs.noNotiTime);
                return;
            }else if(settingsData.frequency==''){
                GenericSvc.toast(errorMsgs.noNotiFrequency);
                return;
            }
            localStorage.savedLNPref =angular.toJson($scope.settingsData);
            SettingSvc.configureLocalNotification($scope.settingsData);
        };
    })
