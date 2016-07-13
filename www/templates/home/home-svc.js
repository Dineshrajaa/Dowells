angular.module('dowells.Services')
    .service('SettingSvc', function(GenericSvc,infoMsgs) {
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

        this.configureLocalNotification = function(notificationOptions) {
            // Method to configure Local Notification
            cordova.plugins.notification.local.schedule({
                title: infoMsgs.appName,
                text: infoMsgs.localNotiText,
                every: notificationOptions.frequency,
                at: new Date(this.formatTime(notificationOptions.alertTime));

            }, function() {
            	GenericSvc.toast(infoMsgs.settingsSaved);
             });
        };
    })
