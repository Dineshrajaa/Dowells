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

.controller('StatusCtrl', function($scope, $ionicModal,
    StatusSvc, GenericSvc, errorMsgs, infoMsgs) {
    // $scope.map = plugin.google.maps.Map.getMap();
    $scope.statusData = $scope.jobsData = {};
    $scope.jobsData.declineReason = '';
    $scope.jobsData.showJobs = $scope.statusData.showStatusChange = false;
    $scope.jobsData.showFinishButton = false;
    $ionicModal.fromTemplateUrl('templates/home/dashboard/declinejob-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.jobDecModal = modal;
    });

    $ionicModal.fromTemplateUrl('templates/home/dashboard/availabilitychanger-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.availChaModal = modal;
    });
    $ionicModal.fromTemplateUrl('templates/home/dashboard/induced-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.inducedModal = modal;
    });
    $scope.changeUserWorkStatus = function() {
        // Method to change the work status to available or not available
        if ($scope.callFinishService) $scope.finishJob();
        else {
            if (GenericSvc.checkInternet()) {
                var currentUserData = angular.fromJson(localStorage.userData);
                var statusObj = {};
                statusObj.userId = currentUserData.ID;
                statusObj.statusId = $scope.statusData.choosenWorkStatusId;
                StatusSvc.setWorkStatus(statusObj).then(function(response) {
                    var res = response.data;
                    if (res.IsSuccessful) {
                        $scope.availChaModal.hide();
                        $scope.fetchUserStatus();
                    }
                }, function(err) {});
            } else GenericSvc.toast(errorMsgs.noInternet);
        }
    };
    $scope.fetchUserStatus = function() {
        // Method to fetch logged in user work status
        alert("fetchUserStatus in");
        var currentUserData = angular.fromJson(localStorage.userData);

        if (GenericSvc.checkInternet()) {
            var userDataParam = {};
            userDataParam.id = currentUserData.ID;
            GenericSvc.showLoader(infoMsgs.statusCheck);
            StatusSvc.getUserStatus(userDataParam).then(function(response) {
                alert("fetchUserStatus service:"+JSON.stringify(response));
                var res = response.data;
                currentUserData.JobStatusType=res.Result;
                localStorage.userData=angular.toJson(currentUserData);
                $scope.statusData.curWorkStatus = StatusSvc.getStatusType(res.Result);
                $scope.statusData.statusChangeText = $scope.statusData.curWorkStatus == 'Available' ? infoMsgs.availableChangeText : infoMsgs.unAvailableChangeText;
                $scope.statusData.avaiOrNot = $scope.statusData.curWorkStatus == 'Available' ? true : false;
                GenericSvc.hideLoader();
                $scope.fetchUserJobs();
            }, function(err) {
                GenericSvc.hideLoader();
            });
        } else GenericSvc.toast(errorMsgs.noInternet);
    };
    $scope.configureMapWithMarker = function() {
        // Method to configure Map and add Marker on the given Lat and Lng
        /*console.log('$scope.map:' + $scope.map);
        $scope.map.showDialog();
        $scope.map.addEventListener(plugin.google.maps.event.MAP_READY, function() {
            console.warn('Map ready');
            $scope.markerLoc = new plugin.google.maps.LatLng($scope.jobsData.lat, $scope.jobsData.lng);
            $scope.map.addMarker({
                'position': $scope.markerLoc,
                'title': $scope.jobsData.projectAddress
            }, function(marker) {
                console.warn('Added Marker');
                marker.showInfoWindow();

            });

        });*/
        launchnavigator.navigate([$scope.jobsData.lat, $scope.jobsData.lng]);
    };

    $scope.$on("$ionicView.enter", function(event, data) {
        // handle event
        $scope.fetchUserStatus();
    });
    $scope.fetchUserJobs = function() {
        // Method to fetch logged in user jobs
        var currentUserData = angular.fromJson(localStorage.userData);
        if (GenericSvc.checkInternet()) {
            var userDataParam = {};
            userDataParam.userId = currentUserData.ID;
            GenericSvc.showLoader(infoMsgs.gettingUserJob);
            StatusSvc.getUserJob(userDataParam).then(function(response) {

                var res = response.data;
                if (res.IsSuccessful) {
                    var res = res.Result;
                    if (res.ID > 0) {
                        if (res.IsAccepted) {
                            $scope.jobsData.showFinishButton = true;
                            $scope.statusData.curWorkStatus = 'Working';
                        } else if (!res.IsAccepted)
                            $scope.statusData.curWorkStatus = 'Pending Jobs';
                        $scope.statusData.showStatusChange = false;
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
                        $scope.jobsData.showJobs = false; // Hide the Jobs section
                    }
                }
                GenericSvc.hideLoader();
            }, function(err) {
                GenericSvc.hideLoader();
            });
        } else GenericSvc.toast(errorMsgs.noInternet);
    };
    $scope.manageJob = function(jobAccOrDec) {
        // Method to Manage Jobs(Accept or Reject)

        if (GenericSvc.checkInternet()) {
            var jobPre = {};
            if (jobAccOrDec == 'Decline' && $scope.jobsData.declineReason == '') {
                GenericSvc.toast('Please enter decline reason');
                return;
            }
            GenericSvc.showLoader(jobAccOrDec + 'ing the Job');
            var currentUserData = angular.fromJson(localStorage.userData);
            var jobAccOrDec = jobAccOrDec == 'Accept' ? true : false;
            jobPre.userJobHistoryId = $scope.jobsData.jobId;
            jobPre.isAccepted = jobAccOrDec;
            jobPre.declinedReason = $scope.jobsData.declineReason || "";
            jobPre.statusId=currentUserData.JobStatusType;
            StatusSvc.setJobPref(jobPre).then(function(response) {
                console.warn('Accept/Decline:' + angular.toJson(response));
                var res = response.data;
                if (res.IsSuccessful) {
                    // if (jobAccOrDec == 'Decline')
                        $scope.jobDecModal.hide();
                    GenericSvc.toast( 'Request completed');
                    $scope.fetchUserStatus();
                }
                GenericSvc.hideLoader();
            }, function(err) {
                GenericSvc.hideLoader();
            });
        } else GenericSvc.toast(errorMsgs.noInternet);
    };
    $scope.showStatusPopup = function() {
        $scope.callFinishService = true;
        $scope.inducedModal.hide();
        $scope.availChaModal.show();

    };
    $scope.finishJob = function() {
        // Method to finish job
        if (GenericSvc.checkInternet()) {
            GenericSvc.showLoader('Completing the Job');
            var jobPre = {};
            jobPre.userJobHistoryId = $scope.jobsData.jobId;
            jobPre.isInducted = $scope.statusData.inducedOrNot;
            jobPre.markAvailable = $scope.statusData.avaiOrNot;
            StatusSvc.completeJob(jobPre).then(function(response) {
                console.warn('finish job:' + angular.toJson(response));
                var res = response.data;
                if (res.IsSuccessful) {
                    GenericSvc.toast('Completed the Job Successfully');
                    $scope.hideAvailableChanger();
                    $scope.fetchUserStatus();
                }

                GenericSvc.hideLoader();
            }, function(err) {
                GenericSvc.hideLoader();
            });
        } else GenericSvc.toast(errorMsgs.noInternet);
    };
    $scope.hideAvailableChanger=function(){
        $scope.callFinishService=false;
        $scope.availChaModal.hide();
    };
    $scope.$watch('statusData.avaiOrNot', function() {
        if ($scope.statusData.avaiOrNot) {
            $scope.statusData.choosenWorkStatus = 'Available';
            $scope.statusData.choosenWorkStatusId = 2;
        } else if (!$scope.statusData.avaiOrNot) {
            $scope.statusData.choosenWorkStatus = 'Not Available';
            $scope.statusData.choosenWorkStatusId = 3;
        }
    })
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
                if (res.IsSuccessful) {
                    if (res.Result.length > 0)
                        $scope.userMessages = res.Result;
                    else GenericSvc.toast('No Message Found!');
                }
                GenericSvc.hideLoader();
            }, function(err) {
                GenericSvc.hideLoader();
            });
        } else GenericSvc.toast(errorMsgs.noInternet);
    };
    $scope.$on("$ionicView.enter", function(event, data) {
        // handle event
        $scope.fetchUserMessage();
    });
})
