'use strict';
var app = angular.module('app', [
	'ngNotificationsBar',
	'ngCookies'
]);
app.config(['notificationsConfigProvider', function(notificationsConfigProvider){
	notificationsConfigProvider.setHideDelay(3000);
	notificationsConfigProvider.setAutoHide(true);

	// Create unique prefix for cookies
	notificationsConfigProvider.setCookiePrefix('ngNotificationsApp');
}]);

app.controller('main', function ($scope, $cookieStore, notifications) {
	// Purge cookies for each use on example page reload.
	notifications.deleteCookie();

	$scope.model = {
		saveUserResponse: false
	};

	$scope.showError = function () {
		notifications.showError({
			id: 'something-bad-happened',
			saveResponse: $scope.model.saveUserResponse,
			message: 'Oops! Something bad just happend!'
		});
	};

	$scope.showWarning = function () {
		notifications.showWarning({
			id: 'take-a-look',
			saveResponse: $scope.model.saveUserResponse,
			message: 'Hey! Take a look here..'
		});
	};

	$scope.showSuccess = function () {
		notifications.showSuccess({
			id: 'life-is-great',
			saveResponse: $scope.model.saveUserResponse,
			message: 'Congrats! Life is great!'
		});
	};
});
