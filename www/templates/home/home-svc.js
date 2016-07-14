angular.module('dowells.Services')
    .service('SettingSvc', function(GenericSvc, infoMsgs) {
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
            cordova.plugins.notification.local.schedule({
                // title: infoMsgs.appName,
                text: infoMsgs.localNotiText,
                every: notificationOptions.frequency,
                at: new Date(notificationOptions.alertTime)

            }, function() {
                GenericSvc.toast(infoMsgs.settingsSaved);
            });
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
