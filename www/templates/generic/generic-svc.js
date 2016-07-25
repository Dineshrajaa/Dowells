angular.module('dowells.Services', [])
    .service('GenericSvc', function($ionicLoading, $state, $ionicActionSheet) {
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
                $state.go('master.regsuc');
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

        /*this.configureAddressSearch = function(comp, inputField) {
            // Method to configure Address search
            var options = {
                types: ['geocode'],
                componentRestrictions: { country: "au" }
            };
            var placeSearch, autocomplete;
            this.componentForm = comp;
            
            var jsonObj = {};
            var input = document.getElementById(inputField);
            this.autocomplete = new google.maps.places.Autocomplete(input, options);
            autocomplete.addListener('place_changed', this.fillInAddress);
        };

        this.fillInAddress = function() {
            // Method to fill in Address in the text fields based on search
            // Get the place details from the autocomplete object.
            var place = autocomplete.getPlace();
            for (var component in this.componentForm) {
                if (component == "route") continue;
                document.getElementById(component).value = '';
                document.getElementById(component).disabled = false;
            }

            // Get each component of the address from the place details
            // and fill the corresponding field on the form.
            for (var i = 0; i < place.address_components.length; i++) {
                var addressType = place.address_components[i].types[0];
                if (componentForm[addressType]) {
                    if (addressType == 'route') {
                        var val = place.address_components[i][componentForm[addressType]];
                        document.getElementById('street_number').value += " " + val;
                        document.getElementById('street_number').value = document.getElementById('street_number').value.trim();
                        continue;
                    }
                    var val = place.address_components[i][componentForm[addressType]];
                    document.getElementById(addressType).value = val;
                }
            }
        };*/

        this.fillProfilePic = function(profilePic, elementId) {
            // Method to fill profile picture
            if (!profilePic.match(/^data:.*?;base64,/i))
                profilePic = 'data:image/jpg;base64,' + profilePic;
            var profilePicHolder = document.querySelector('#' + elementId);
            angular.element(profilePicHolder).css('background-image', 'url(' + profilePic + ')')
                .removeClass('no-picture');
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
    })
