angular.module('bridge')
    .controller(
    'LoginCtrl',
    function ($scope, $rootScope, $state, $log, $timeout, $ionicLoading ,
              UserService , StorageService) {
        var _this = this;

        $scope.user = {};

        $scope.login = function () {
            var user = $scope.user;
            if (!user.name || !user.password) {
                navigator.notification.alert('请填写用户名和密码!');
                return;
            }
            $ionicLoading.show({template:"登录验证..."});

            UserService.login(user).
                then(function (data) {
                    $ionicLoading.hide();
                    $state.go('tab.disease');
                    $log.log(StorageService.get("user"));
                    $log.log(UserService.info);
                }, function (err , status) {
                    $ionicLoading.hide();
                    navigator.notification.alert(err , "验证失败");
                    $log.error('HTTP error - status:', status, 'Error:', err);
                });
        };

        $scope.goHome = function () {
            $scope.goingHome = true;
            $state.go('app.discover');
        };
    });
