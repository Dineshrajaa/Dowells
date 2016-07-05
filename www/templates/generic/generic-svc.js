angular.module('dowells.Services', [])
    .service('GenericSvc', function() {
        this.toast = function(msg) {
            window.plugins.toast.showShortBottom(msg,function(a) { console.log('toast success: ' + a) },
                function(b) { alert('toast error: ' + b) });
        }
    })
