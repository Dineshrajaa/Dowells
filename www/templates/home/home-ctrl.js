angular.module('dowells.Controllers')
    .controller('HomeCtrl', function($scope, $state) {
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

.controller('SettingsCtrl', function($scope, GenericSvc, SettingSvc, errorMsgs) {
    $scope.settingsData = SettingSvc.getLNPref();
    /*if ($scope.settingsData.alertTime != undefined)
        $scope.settingsData.alertTime = new Date($scope.settingsData.alertTime);*/
    $scope.saveLNPref = function() {
        // Method to save the Local notification preference
        if ($scope.settingsData.alertTime == '' || $scope.settingsData.alertTime == undefined) {
            GenericSvc.toast(errorMsgs.noNotiTime);
            return;
        } else if ($scope.settingsData.frequency == '' || $scope.settingsData.frequency == undefined) {
            GenericSvc.toast(errorMsgs.noNotiFrequency);
            return;
        }
        console.warn($scope.settingsData.alertTime);
        localStorage.savedLNPref = angular.toJson($scope.settingsData);
        SettingSvc.setLNPref($scope.settingsData);
    };
    $scope.$watch('settingsData.statusAlert', function() {
        // Watch the changes on toggle
        console.warn($scope.settingsData.statusAlert);
        if (!$scope.settingsData.statusAlert) {
            $scope.settingsData.alertTime = $scope.settingsData.frequency = "";
            SettingSvc.removeLNPref();
        } else {
            $scope.settingsData = SettingSvc.getLNPref();
            $scope.settingsData.statusAlert = true;
        }
    })
})
