angular.module('dowells.Services')
.service('ProfileSvc',function($http){
	this.getProfileDetails=function(userInfo){
		// Method to get profile details
		return $http.get(WSUrl+'Account/GetUserById',{params:userInfo});
	};
})