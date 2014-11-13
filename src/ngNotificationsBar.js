(function (window, angular) {
	var module = angular.module('ngNotificationsBar', []);

	module.provider('notificationsConfig', function() {
		var config = {};

		function setHideDelay(value){
			config.hideDelay = value;
		}

		function getHideDelay(){
			return config.hideDelay;
		}

		function setAutoHide(value){
			config.autoHide = value;
		}

		function getAutoHide(){
			return config.autoHide;
		}

		return {
			setHideDelay: setHideDelay,
			setAutoHide: setAutoHide,
			$get: function(){
				return {
					getHideDelay: getHideDelay,
					getAutoHide: getAutoHide
				};
			}
		};
	});

	module.factory('notifications', ['$rootScope', function ($rootScope) {
		var showError = function (message, options) {
			$rootScope.$broadcast('notifications:error', message);
		};

		var showWarning = function (message, options) {
			$rootScope.$broadcast('notifications:warning', message);
		};

		var showSuccess = function (message, options) {
			$rootScope.$broadcast('notifications:success', message);
		};

		return {
			showError: showError,
			showWarning: showWarning,
			showSuccess: showSuccess
		};
	}]);

	module.directive('notificationsBar', function (notificationsConfig, $timeout) {
		return {
			restrict: 'EA',
			template: '\
				<div class="notifications-container" ng-if="notifications.length">\
					<div class="{{note.type}}" ng-repeat="note in notifications">\
						<span class="message" ng-bind-html="note.message"></span>\
						<span class="glyphicon glyphicon-remove close-click" ng-click="close($index)" ng-show="!hideClose"></span>\
					</div>\
				</div>\
			',
			link: function (scope) {
				var notifications = scope.notifications = [];
				var timers = [];
				var defaultTimeout = notificationsConfig.getHideDelay() || 3000; //control hide delay globaly throught module.config()
				var autoHide = notificationsConfig.getAutoHide() || false; //control auto hide globaly throught module.config()
				var removeById = function (id) {
					var found = -1;

					notifications.forEach(function (el, index) {
						if (el.id === id) {
							found = index;
						}
					});

					if (found >= 0) {
						notifications.splice(found, 1);
					}
				};

				var notificationHandler = function (event, data, type) {
					var message, hide, hideClose = false;

					if (typeof data === 'object') {
						message = data.message;
						hide = (typeof data.hide === 'undefined') ? autoHide : !! data.hide; //control auto hide per notification
						hideDelay = data.hideDelay || defaultTimeout; //control hide delay per notification
						hideClose = data.hideClose || false; //control hide the close button
					} else {
						message = data;
					}

					var id = 'notif_' + (Math.floor(Math.random() * 100));
					notifications.push({id: id, type: type, message: message});
					if (hide) {
						var timer = $timeout(function () {
							// TODO: apply the animation
							removeById(id);
							$timeout.cancel(timer);
						}, hideDelay);
					}
				};

				scope.$on('notifications:error', function (event, data) {
					notificationHandler(event, data, 'error');
				});

				scope.$on('notifications:warning', function (event, data) {
					notificationHandler(event, data, 'warning');
				});

				scope.$on('notifications:success', function (event, data) {
					notificationHandler(event, data, 'success');
				});

				scope.close = function (index) {
					notifications.splice(index, 1);
				};
			}
		};
	});

})(window, angular);
