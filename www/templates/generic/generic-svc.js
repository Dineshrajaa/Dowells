angular.module('dowells.Services', [])
    .service('GenericSvc', function($ionicLoading, $state, $ionicActionSheet, $ionicHistory) {
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

        this.fillProfilePic = function(profilePic, elementId) {
            // Method to fill profile picture
            var profilePic = profilePic;
            if (!profilePic.match(/^data:.*?;base64,/i))
                profilePic = 'data:image/jpg;base64,' + profilePic;
            // var profilePicHolder = document.querySelector('#' + elementId);
            var profilePicHolder = document.getElementById(elementId);
            var bgImg = 'url(' + profilePic + ')';

            angular.element(profilePicHolder).css('background-image', bgImg);
                // .removeClass('no-picture');
        };

        this.tellImageID=function(profilePic){
            // Method to find the dataurl
            var profilePic = profilePic;
            if (!profilePic.match(/^data:.*?;base64,/i))
                profilePic = 'data:image/jpg;base64,' + profilePic;
            return profilePic;
        };

        this.openActionSheet = function() {
            // Method to configure action sheet which is to be used in Create and edit profile picture
            var actionSheet = $ionicActionSheet.show({
                buttons: [
                    { text: '<b><i class="icon ion-camera calm"></i>Take Photo</b>' },
                    { text: '<b><i class="icon ion-document-text calm"></i>Use Existing Photo</b>' }
                ],
                destructiveText: '<b><i class="icon ion-android-cancel assertive"></i>Cancel</b>',
                titleText: 'Choose option',
                cancelText: 'Cancel',
                cancel: function() {
                    // add cancel code..
                },
                buttonClicked: function(index) {
                    alert(index);
                    return true;
                }
            });

        };
        this.setCameraOptions = function(sourceType) {
            var options = {
                // Some common settings are 20, 50, and 100
                quality: 50,
                destinationType: Camera.DestinationType.DATA_URL,
                encodingType: Camera.EncodingType.JPEG,
                // In this app, dynamically set the picture source, Camera or photo gallery
                sourceType: sourceType,
                allowEdit: true,
                correctOrientation: true //Corrects Android orientation quirks
            }
            return options;
        };

        this.tellTitleId = function(titleName) {
            // Method to return Title Id
            var titleId;
            switch (titleName) {
                case 'Mr':
                    titleId = 1;
                    break;
                case 'Mrs':
                    titleId = 2;
                    break;
                case 'Miss':
                    titleId = 3;
                    break;
                case 'Ms':
                    titleId = 4;
                    break;
            }
            return titleId;
        };

        this.handleBackButton = function() {
            // Method to handle back button
            var currentStateName = $ionicHistory.currentStateName();
            switch (currentStateName) {
                case 'master.regsuc':
                    $state.go('master.login');
                    break;
                default:
                    break;

            }

        };
        this.convertUIDateToDb = function(inputDate) {
            // Method to convert ui date to db format
            var ret = Date.parse(inputDate);
            return "\/Date(" + ret + ")\/";
        };
    })
