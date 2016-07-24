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
        this.getActiveTrade=function(){
            // Method to list the active trade
            return $http.get(WSUrl + 'Account/GetActiveTradeExperiences');
        };
        this.getTradeDetail = function(traId) {
            // Method to get the detail of selected trade
            return $http.get(WSUrl + 'Account/GetTradeExperienceById', { params: { id: traId } });
        };
        this.getPositionDetail = function(posId) {
            // Method to get the detail of selected trade
            console.warn('posId:'+posId);
            return $http.get(WSUrl + 'Account/GetPositionHeldById', { params: { id: posId } });
        };
        this.getActivePosition=function(){
            // Method to list the active position
            return $http.get(WSUrl + 'Account/GetActivePositionHelds');
        };

        this.submitUserForm=function(regObj){
            // Method to list the active position
            return $http.post(WSUrl + 'Account/AddUser',regObj);
        };
        this.tellTitleName=function(titleId){
            // Method to tell the title name from title id
            var titleName='';
            switch(titleId){
                case '1':
                titleName='Mr';
                break;
                case '2':
                titleName='Mrs';
                break;
                case '3':
                titleName='Miss';
                break;
                case '4':
                titleName='Ms';
                break;
            }
            return titleName;
        };
    })


.service('RegDataSvc', function() {
    /*Service for sharing data among different controllers*/
    this.regFormData = {};
    this.licenceList=[];
    this.tradeList=[];
    this.positionList=[];
    this.regProfilePic="";
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
