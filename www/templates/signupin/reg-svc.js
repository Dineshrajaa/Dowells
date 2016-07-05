angular.module('dowells.Services')
.service('RegSvc',function($http){
	/*Service for Registration module*/
	this.checkMailExistance=function(email){
		// Method to check the existance of email id
		return $http.get(WSUrl+'Account/IsUserWithSameEmailExist',{params:{email:email}});
	};
})