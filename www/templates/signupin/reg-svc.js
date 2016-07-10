angular.module('dowells.Services')
    .service('RegSvc', function($http) {
        /*Service for Registration module*/
        this.checkMailExistance = function(email) {
            // Method to check the existance of email id
            return $http.get(WSUrl + 'Account/IsUserWithSameEmailExist', { params: { email: email } });
        };

        this.getActiveLicence = function() {
            // Method to list the active licence
            return $http.get(WSUrl + 'Account/GetActiveLicenceTicketTypes');
        };
        this.getLicenceDetail = function(licId) {
            // Method to get the detail of selected licence
            return $http.get(WSUrl + 'Account/GetLicenceTicketTypeById', { params: { id: licId } });
        };
    })


.service('RegDataSvc', function() {
    /*Service for sharing data among different controllers*/
    this.regFormData = {};
    this.licenceList=[];
    this.storeRegFormData = function(formInfo) {
        // Method to save the registration form data
        this.regFormData = formInfo;
        console.warn(this.regFormData);
    };
    this.storeLicenceList=function(formLicenceList){
        // Method to save the licence list
        this.licenceList=formLicenceList;
    };
})
