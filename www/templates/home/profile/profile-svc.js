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
