angular.module('dowells.Services')
    .service('ProfileSvc', function($http) {
        this.getProfileDetails = function(userInfo) {
            // Method to get profile details
            return $http.get(WSUrl + 'Account/GetUserById', { params: userInfo });
        };

        this.setProfilePicture=function(userPicInfo){
            // Method to set profile picture
            return $http.post(WSUrl+'Account/UpdateProfilePicture',userPicInfo);
        };

        this.setUserProfile=function(userProfile){
            // Method to update user profile
            return $http.post(WSUrl+'Account/UpdateUser',userProfile);
        };

        this.getDocumentDetails = function(userInfo) {
            // Method to get document details
            return $http.get(WSUrl + 'Account/GetEmployeeDetails', { params: userInfo });
        };
        this.getSelectedTicketInfo = function(ticketId) {
            // Method to get selected Ticket info
            return $http.get(WSUrl + 'Account/GetUserLicenceTicketType/'+ticketId);
        };
        this.saveTicket=function(ticketObj){
            // Method to save the licence
            return $http.post(WSUrl+'Account/AddUserLicenceTicketType',ticketObj);
        };
        this.deleteTicket=function(ticketId){
            return $http.post(WSUrl + 'Account/DeleteUserLicenceTicketType/'+ticketId);
        };
        this.getSelectedTradeInfo = function(tradeId) {
            // Method to get Selected Trade Info
            return $http.get(WSUrl + 'Account/GetUserTradeExp/'+tradeId);
        };
        this.saveTrade=function(tradeObj){
            // Method to save the trade
            return $http.post(WSUrl+'Account/AddUserTradeExp',tradeObj);
        };
        this.deleteTrade=function(tradeId){
            // Method to delete Trade
            return $http.post(WSUrl + 'Account/DeleteUserTradeExp/'+tradeId);
        };
        this.getSelectedPositionInfo = function(positionId) {
            // Method to get Selected Trade Info
            return $http.get(WSUrl + 'Account/GetUserPositionHeld/'+positionId);
        };
        this.savePosition=function(positionObj){
            // Method to save the position
            return $http.post(WSUrl+'Account/AddUserPositionHeld',positionObj);
        };
        this.deletePosition=function(positionId){
            // Method to delete position
            return $http.post(WSUrl + 'Account/DeleteUserPositionHeld/'+positionId);
        };
        this.tellGenderName = function(genderId) {
            // Method to tell gender name from gender id
            var genderName = "";
            switch (genderId) {
                case 1:
                    genderName = 'Not Specified';
                    break;
                case 2:
                    genderName = 'Male';
                    break;
                case 3:
                    genderName = 'Female';
                    break;
                default:
                    genderName = 'Male';
                    break;
            }
            return genderName;
        };
    })
