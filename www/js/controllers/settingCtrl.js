angular.module('bridge').controller(
    'SettingCtrl',
    function ($scope, $rootScope, $stateParams, $ionicLoading, $ionicModal,
              $timeout, $state, $location, $log ,
              UserService , DataBaseService) {
        $scope.user = UserService.info;

        //login
        $scope.logout = function(){
            $ionicLoading.show({template:"退出系统"});
            UserService.logout().then(function(){
                $ionicLoading.hide();
                $state.go("login");
            });
        }

        DataBaseService.single("select count(*) as count from LocalDisease")
            .then(function(item){
                $scope.localDiseaseCount = item.count;
            });

    }
);
