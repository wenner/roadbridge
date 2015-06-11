angular.module('bridge').controller(
    'BridgeDetailCtrl',
    function ($scope, $rootScope, $stateParams, $ionicLoading, $ionicModal,
              $timeout, $state, $location, $log ,
              BridgeService) {
        $scope.isLoading = false;

        $scope.load = function(sn){
            $scope.isLoading = true;
            sn = sn || $stateParams.sn;
            BridgeService.getBridgeBySn(sn)
                .then(function(data){
                    $scope.bridge = data;
                })
                .finally(function() {
                    $scope.isLoading = false;
                    return $scope.$broadcast('scroll.refreshComplete');
                });


        }

        $scope.load();

    }
);
