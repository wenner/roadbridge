angular.module('bridge').controller(
    'SettingCtrl',
    function ($scope, $rootScope, $stateParams, $ionicLoading, $ionicModal,
              $timeout, $state, $location, $log ,
              UserService) {
        $scope.user = UserService.info;

        //login
        $scope.logout = function(){
            $ionicLoading.show({template:"退出系统"});
            UserService.logout().then(function(){
                $ionicLoading.hide();
                $state.go("login");
            });
        }
    }
);
