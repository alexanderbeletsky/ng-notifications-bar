(function (root, factory) {
	if (typeof exports === 'object') {
		module.exports = factory(root, require('angular'));
	} else if (typeof define === 'function' && define.amd) {
		define(['angular'], function (angular) {
			return (root.ngNotificationsBar = factory(root, angular));
		});
	} else {
		root.ngNotificationsBar = factory(root, root.angular);
	}
}(this, function (window, angular) {
	var module = angular.module('ngNotificationsBar', []);

	module.provider('notificationsConfig', function() {
		var config = {
			hideDelay: 3000,
			autoHide: false,
			acceptHTML: false,
			saveReponse: false,
			cookiePrefix: 'ngNotificationsBar'
		};

		function setHideDelay(value){
			config.hideDelay = value;
		}

		function getHideDelay(){
			return config.hideDelay;
		}

		function setAcceptHTML(value){
			config.acceptHTML = value;
		}

		function getAcceptHTML(){
			return config.acceptHTML;
		}

		function setAutoHide(value){
			config.autoHide = value;
		}

		function getAutoHide(){
			return config.autoHide;
		}

		function setSaveResponse(value){
			config.saveReponse = value;
		}

		function getSaveResponse(){
			return config.saveReponse;
		}

		function setCookiePrefix(value){
			config.cookiePrefix = value;
		}

		function getCookiePrefix(){
			return config.cookiePrefix;
		}

		return {
			setHideDelay: setHideDelay,
			setAutoHide: setAutoHide,
			setAcceptHTML: setAcceptHTML,
			setSaveResponse: setSaveResponse,
			setCookiePrefix: setCookiePrefix,

			$get: function(){
				return {
					getHideDelay: getHideDelay,
					getAutoHide: getAutoHide,
					getAcceptHTML: getAcceptHTML,
					getSaveResponse: getSaveResponse,
					getCookiePrefix: getCookiePrefix
				};
			}
		};
	});

	module.factory('notifications', function ($rootScope, $cookieStore, notificationsConfig) {
		var getCookieName = function () {
			return notificationsConfig.getCookiePrefix() + '_notificationsToIgnore';
		};

		var setCookie = function (value) {
			$cookieStore.put(getCookieName(), value);
		};

		var normalizeIdForCookie = function(id) {
			return id.split('_').splice(1, 1).toString();
		};

		var notificationFactory = {
			showError: function (message) {
				$rootScope.$broadcast('notifications:error', message);
			},

			showWarning: function (message) {
				$rootScope.$broadcast('notifications:warning', message);
			},

			showSuccess: function (message) {
				$rootScope.$broadcast('notifications:success', message);
			},

			getCookie: function () {
				return $cookieStore.get(getCookieName());
			},

			deleteCookie: function() {
				$cookieStore.remove(getCookieName());
			},

			ignoreNotification: function(id) {
				var currentIgnoredNotifications = this.getCookie() || {};

				currentIgnoredNotifications[normalizeIdForCookie(id)] = true;
				setCookie(currentIgnoredNotifications);
			},

			isNotificationIgnored: function(id) {
				var currentIgnoredNotifications = this.getCookie() || {};

				if (currentIgnoredNotifications[normalizeIdForCookie(id)]) {
					return true;
				}

				return false;
			}
		};

		return notificationFactory;
	});

	module.directive('notificationsBar', function ($timeout, notificationsConfig) {
		return {
			restrict: 'EA',
			template: function(){
				return notificationsConfig.getAcceptHTML() ? '\
					<div class="notifications-container" ng-if="notificationList.length">\
						<div class="{{note.type}}" ng-repeat="note in notificationList">\
							<span class="message" ng-bind-html="note.message"></span>\
							<span class="glyphicon glyphicon-remove close-click" ng-click="close(note)"></span>\
						</div>\
					</div>\
				' : '\
					<div class="notifications-container" ng-if="notificationList.length">\
						<div class="{{note.type}}" ng-repeat="note in notificationList">\
							<span class="message">{{note.message}}</span>\
							<span class="glyphicon glyphicon-remove close-click" ng-click="close(note)"></span>\
						</div>\
					</div>\
				';
			},
			controllerAs: 'ngNotificationsCtrl',
			controller: function($scope, notifications) {
				var notificationFactory = notifications;
				$scope.notificationList = [];

				$scope.removeById = function (id) {
					/* Use every vs. foreach to give a loop break mechanism */
					$scope.notificationList.every(function (el, index) {
						if (el.id === id) {
							if (el.saveResponse) {
								notificationFactory.ignoreNotification(el.id);
							}

							$scope.notificationList.splice(index, 1);
							return false;
						}

						return true;
					});
				};

				$scope.close = function (notification) {
					$scope.removeById(notification.id);
				};

				$scope.createId = function(id) {
					var moduleKey = 'notif';
					var timestamp = String(new Date().getTime());

					return [
						moduleKey,
						id.replace(/_/g, '-'),
						timestamp
					].join('_');
				};

				/*
				 * Convert all notification input formats into a consistent object
				 *
				 */
				$scope.normalizeNotificationData = function(notificationData, type) {
					var result = {
						'id': String(notificationData.id || Math.floor(Math.random() * 128)),
						'hide': notificationsConfig.getAutoHide(),
						'hideDelay': notificationsConfig.getHideDelay(),
						'saveResponse': notificationsConfig.getSaveResponse(),
						'type': type
					};

					if (typeof notificationData === 'object') {
						result.message = notificationData.message;

						if (typeof notificationData.hide === 'boolean') {
							result.hide = notificationData.hide;
						}

						if (typeof notificationData.hideDelay === 'boolean') {
							result.hideDelay = notificationData.hideDelay;
						}

						if (typeof notificationData.saveResponse === 'boolean') {
							result.saveResponse = notificationData.saveResponse;
						}

					} else if (typeof notificationData === 'string') {
						result.message = notificationData;
					}

					// TODO: consider an error for invalid notificationData format
					/*else {
						console.error('invalid notification data format', typeof notificationData);
					}*/

					result.id = $scope.createId(result.id);

					return result;
				};

				$scope.notificationHandler = function (event, data, type) {
					var notificationData = $scope.normalizeNotificationData(data, type);

					if (notificationFactory.isNotificationIgnored(notificationData.id)) {
						return;
					}

					$scope.notificationList.push(notificationData);

					if (notificationData.hide) {
						var timer = $timeout(function () {
							$scope.removeById(notificationData.id);
							$timeout.cancel(timer);
						}, notificationData.hideDelay);
					}
				};
			},
			link: function ($scope) {
				$scope.$on('notifications:error', function (event, data) {
					$scope.notificationHandler(event, data, 'error');
				});

				$scope.$on('notifications:warning', function (event, data) {
					$scope.notificationHandler(event, data, 'warning');
				});

				$scope.$on('notifications:success', function (event, data) {
					$scope.notificationHandler(event, data, 'success');
				});
			}
		};
	});

	return module;
}));
