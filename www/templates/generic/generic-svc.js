angular.module('dowells.Services', [])
    .service('GenericSvc', function($ionicLoading) {
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
            var loaderMessage=msg||"";
            $ionicLoading.show({
                template: '<ion-spinner icon="lines" class="spinner-calm"></ion-spinner><p>'+loaderMessage+'</p>'
            });
        };

        this.hideLoader=function(){
            $ionicLoading.hide();
        };
    })
