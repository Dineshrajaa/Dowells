angular.module('dowells.Controllers')
    .controller('HomeCtrl', function($scope, $state, GenericSvc) {
        $scope.currentUser = {};
        $scope.fillUserInfo = function() {
            var userData = angular.fromJson(localStorage.userData);
            $scope.currentUser.disName = userData.DisplayName; // Show Display name of the current user
            var profilePic = userData.ProfilePicture;
            GenericSvc.fillProfilePic(profilePic, 'userProfilePic');
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

.controller('StatusCtrl', function($scope,$ionicModal,
    StatusSvc, GenericSvc, errorMsgs, infoMsgs) {
    $ionicModal.fromTemplateUrl('templates/home/dashboard/declinejob-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.jobDecModal = modal;
    });
    // $scope.jobDecModal.show();
    $scope.fetchUserStatus = function() {
        // Method to fetch logged in user work status
        $scope.map = plugin.google.maps.Map.getMap();
        $scope.statusData = $scope.jobsData = {};
        $scope.jobsData.showJobs = $scope.statusData.showStatusChange = false;
        var currentUserData = angular.fromJson(localStorage.userData);

        if (GenericSvc.checkInternet()) {
            var userDataParam = {};
            userDataParam.id = currentUserData.ID;
            GenericSvc.showLoader(infoMsgs.statusCheck);
            StatusSvc.getUserStatus(userDataParam).then(function(response) {
                var res = response.data;
                $scope.statusData.curWorkStatus = StatusSvc.getStatusType(res.Result);
                $scope.statusData.statusChangeText = $scope.statusData.curWorkStatus == 'Available' ? infoMsgs.availableChangeText : infoMsgs.unAvailableChangeText;
                GenericSvc.hideLoader();
                $scope.fetchUserJobs();
            }, function(err) {
                GenericSvc.hideLoader();
            });
        } else GenericSvc.toast(errorMsgs.noInternet);
    };
    $scope.configureMapWithMarker = function() {
        // Method to configure Map and add Marker on the given Lat and Lng
        $scope.map.addEventListener(plugin.google.maps.event.MAP_READY, function() {
            $scope.markerLoc = new plugin.google.maps.LatLng($scope.jobsData.lat, $scope.jobsData.lng);
            $scope.map.addMarker({
                'position': $scope.markerLoc,
                'title': $scope.jobsData.projectAddress
            }, function(marker) {

                marker.showInfoWindow();

            });

        });
    };
    $scope.fetchUserStatus();
    $scope.fetchUserJobs = function() {
        // Method to fetch logged in user jobs
        var currentUserData = angular.fromJson(localStorage.userData);
        if (GenericSvc.checkInternet()) {
            var userDataParam = {};
            userDataParam.userId = currentUserData.ID;
            GenericSvc.showLoader(infoMsgs.gettingUserJob);
            StatusSvc.getUserJob(userDataParam).then(function(response) {
                var res = response.data.Result;
                console.warn('User Jobs:' + angular.toJson(res));
                if (res.ID > 0) {
                    $scope.statusData.curWorkStatus = 'Pending Jobs';
                    $scope.jobsData.showJobs = true;
                    $scope.jobsData.clientName = res.ClientName;
                    $scope.jobsData.projectName = res.ProjectName;
                    $scope.jobsData.projectAddress = res.ProjectAddress;
                    $scope.jobsData.startDate = res.StartDate;
                    $scope.jobsData.message = res.Message;
                    $scope.jobsData.lat = res.Latitude;
                    $scope.jobsData.lng = res.Longitude;
                    $scope.jobsData.jobId = res.UserSchedulingID;
                } else {
                    // No Pending Jobs
                    $scope.statusData.showStatusChange = true; // Show the status change option
                }
                GenericSvc.hideLoader();
            }, function(err) {
                GenericSvc.hideLoader();
            });
        } else GenericSvc.toast(errorMsgs.noInternet);
    };
    $scope.manageJob = function(jobAccOrDec) {
        // Method to Manage Jobs(Accept or Reject)
        var currentUserData = angular.fromJson(localStorage.userData);
        if (GenericSvc.checkInternet()) {
            var jobPre = {};
            var jobAccOrDec = jobAccOrDec == 'Accept' ? true : false;
            jobPre.userJobHistoryId = $scope.jobsData.jobId;
            jobPre.isAccepted = jobAccOrDec;
            StatusSvc.setJobPref(jobPre).then(function(response) {}, function(err) {});
        } else GenericSvc.toast(errorMsgs.noInternet);
    };
})

.controller('MessageCtrl', function($scope, MessageSvc, GenericSvc, errorMsgs, infoMsgs) {
    $scope.fetchUserMessage = function() {
        // Method to fetch logged in user work status
        $scope.userMessages = [];
        var currentUserData = angular.fromJson(localStorage.userData);

        if (GenericSvc.checkInternet()) {
            var userDataParam = {};
            userDataParam.userId = currentUserData.ID;
            GenericSvc.showLoader(infoMsgs.messageFetch);
            MessageSvc.getUserMessages(userDataParam).then(function(response) {
                var res = response.data;
                if (res.IsSuccessful)
                    $scope.userMessages = res.Result;
                GenericSvc.hideLoader();
            }, function(err) {
                GenericSvc.hideLoader();
            });
        } else GenericSvc.toast(errorMsgs.noInternet);
    };
    $scope.fetchUserMessage();
})
