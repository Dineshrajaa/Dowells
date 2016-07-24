angular.module('dowells.Controllers')
    .controller('LoginCtrl', function($scope, $state,
     LoginSvc, GenericSvc, errorMsgs, infoMsgs) {
        // Login module controler
        $scope.loginData = {};
        console.log('LoginCtrl');
        $scope.login = function() {
            // Method to login user to home page
            var loginObj = {}; // holder of login info
            loginObj.username = $scope.loginData.username;
            loginObj.password = $scope.loginData.password;
            loginObj.isWebApp = false;
            loginObj.deviceId = localStorage.pushRegID || "";
            loginObj.deviceTypeId = device.platform == "Android" ? 2 : 1;
            if (GenericSvc.checkInternet()) {
                GenericSvc.showLoader(infoMsgs.loginCheck);
                LoginSvc.loginUser(loginObj).then(function(response) {
                    var res = response.data;
                    if (res.IsSuccessful) { // Login success
                        localStorage.userData = angular.toJson(res.Result);
                        GenericSvc.toast(infoMsgs.loginWin);
                        $state.go('home.status');
                    }else{
                        // Login failed
                        if(res.MessageType==5 ||res.MessageType==10){
                            var appStatus=LoginSvc.loginErrorFinder(res.MessageType);
                            localStorage.appStatus=angular.toJson(appStatus);
                            $state.go('master.appstatus');
                        }else
                        GenericSvc.toast(LoginSvc.loginErrorFinder(res.MessageType).status); 
                    }                    
                    GenericSvc.hideLoader();
                }, function(err) {
                    GenericSvc.hideLoader();
                });
            } else GenericSvc.toast(errorMsgs.noInternet);

        };
    })
    .controller('AppStatusCtrl',function($scope,$state){
        $scope.appStatus={};
        var appData=angular.fromJson(localStorage.appStatus);
        $scope.appStatus.applicationStatus=appData.status;
        $scope.appStatus.appDeclined=appData.status=='Application declined'?true:false;
        $scope.appStatus.applicationInfo=appData.msg;
    })