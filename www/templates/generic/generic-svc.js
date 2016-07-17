angular.module('dowells.Services', [])
    .service('GenericSvc', function($ionicLoading, $state) {
        this.toast = function(msg) {
            window.plugins.toast.showShortBottom(msg, function(a) { console.log('toast success: ' + a) },
                function(b) { alert('toast error: ' + b) });
        };
        this.checkInternet = function() {
            var internetAvailable = (navigator.connection.type == Connection.NONE) ? false : true;
            return internetAvailable;
        };

        this.showLoader = function(msg) {
            // Method to show loader with message
            var loaderMessage = msg || "";
            $ionicLoading.show({
                template: '<ion-spinner icon="lines" class="spinner-calm"></ion-spinner><p>' + loaderMessage + '</p>'
            });
        };

        this.hideLoader = function() {
            $ionicLoading.hide();
        };

        this.checkLoginStatus = function() {
            // Method to check whether user has already logged in or not
            if (localStorage.userData != undefined)
                $state.go('home.status');
            else
                $state.go('master.login');
        };

        this.getDeviceIdForPush = function() {
            // Method to get device id for push notification
            try {
                window.push = PushNotification.init({
                    android: { senderID: "739681536553", forceShow: true },
                    ios: { alert: "true", badge: "true", sound: "true", clearBadge: "true" },
                    windows: {}
                });
            } catch (error) {
                alert(error)
            }

            window.push.on('registration', function(data) {
                // I can get registration id here        
                localStorage.pushRegID = data.registrationId;
            });
        };

        this.fillProfilePic = function(profilePic,elementId) {
            // Method to fill profile picture
            if (!profilePic.match(/^data:.*?;base64,/i))
                profilePic = 'data:image/jpg;base64,' + profilePic;
            var profilePicHolder = document.querySelector('#'+elementId);
            angular.element(profilePicHolder).css('background-image', 'url(' + profilePic + ')')
                .removeClass('no-picture');
        };

        this.configureActionSheet=function(){
            // Method to configure action sheet which is to be used in Create and edit profile picture
        };
    })
