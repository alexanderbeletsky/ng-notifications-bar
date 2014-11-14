var app = angular.module('app', ['ngNotificationsBar', 'ngSanitize']);

app.config(['notificationsConfigProvider', function(notificationsConfigProvider){
	notificationsConfigProvider.setHideDelay(10000);
	notificationsConfigProvider.setAutoHide(false);
}]);

app.controller('main', function ($scope, notifications) {
	$scope.showError = function () {
		notifications.showError({message: 'Oops! Something bad just happend! (hides faster)', hideDelay: 1500});
	};

	$scope.showWarning = function () {
		notifications.showWarning({message: 'Hey! Take a look here.. (doesn\'t hides)', hide: false});
	};

	$scope.showSuccess = function () {
		notifications.showSuccess({message: 'Congrats! Life is great! (uses default settings) <a href="http://www.google.com">safe link!</a>', hideClose: true});
	};

});
