angular.module('dowells.Services')
    .service('SettingSvc', function(GenericSvc, infoMsgs, $cordovaLocalNotification) {
        this.formatTime = function(choosedTime) {
            // Method to format time for saving local notification preference
            var now = new Date();
            var time = choosedTime;
            var day = ("0" + now.getDate()).slice(-2);
            var month = ("0" + (now.getMonth() + 1)).slice(-2)
            var dateSplit = now.getFullYear() + '-' + month + '-' + day + " " + time;
            var formattedTime = new Date((dateSplit).replace(/-/g, "/")).getTime();
            return formattedTime;
        };

        this.setLNPref = function(notificationOptions) {
            // Method to configure Local Notification
            /*cordova.plugins.notification.local.schedule({
                // title: infoMsgs.appName,
                text: infoMsgs.localNotiText,
                every: notificationOptions.frequency,
                at: new Date(notificationOptions.alertTime)

            }, function() {
                GenericSvc.toast(infoMsgs.settingsSaved);
            });*/
            $cordovaLocalNotification.schedule({
                // title: infoMsgs.appName,
                text: infoMsgs.localNotiText,
                every: notificationOptions.frequency,
                at: new Date(notificationOptions.alertTime).getTime()

            }).then(function() {
                GenericSvc.toast(infoMsgs.settingsSaved);
            })
        };

        this.getLNPref = function() {
            // Method to get the saved Local notification preference
            if (localStorage.savedLNPref != undefined) {
                var savedLNData = angular.fromJson(localStorage.savedLNPref);
                savedLNData.alertTime = new Date(savedLNData.alertTime);
                return savedLNData;
            } else return {};
        };

        this.removeLNPref = function() {
            // Method to remove the local notification preference
            localStorage.removeItem('savedLNPref');
        };
    })

.service('StatusSvc', function($http) {
    this.getUserStatus = function(userData) {
        // Method to get the user status
        return $http.get(WSUrl + 'Account/GetUserStatus', { params: userData });
    };

    this.getStatusType = function(statusId) {
        // Method to get the user status type
        if (statusId == 1)
            return 'Working';
        else if (statusId == 2)
            return 'Available';
        else if (statusId == 3)
            return 'Not Available';
    };
    this.getUserJob = function(userData) {
        // Method to get the user jobs
        return $http.get(WSUrl + 'Account/GetUserPendingJob', { params: userData });
    };

    this.setJobPref = function(jobPref) {
        // Method to accept or decline job
        return $http.get(WSUrl + 'Account/AcceptDeclineJobScheduling', { params: jobPref });
    };
    this.setWorkStatus = function(workStatus) {
        // Method to set work status
        return $http.get(WSUrl + 'Account/UpdateUserJobStatus', { params: workStatus });
    };
    this.completeJob = function(jobData) {
        // Method to finish a job
        return $http.get(WSUrl + 'Account/MarkFinishJob', { params: jobData });
    };
})


.service('MessageSvc', function($http) {
    this.getUserMessages = function(userData) {
        // Method to get messages
        return $http.get(WSUrl + 'Account/GetUserMessages', { params: userData });
    };
})
