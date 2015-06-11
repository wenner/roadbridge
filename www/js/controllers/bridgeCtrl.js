angular.module('bridge').controller(
    'BridgeCtrl',
    function ($scope, $rootScope, $stateParams, $ionicLoading, $ionicModal,
              $timeout, $state, $location, $log, BridgeService , BaseData) {
        $log.debug('bridge ctrl', $stateParams);

        $scope.roads = BaseData.roads;

        $scope.query = function () {
            $scope.loading = true;
            var condition = {road:$scope.road};
            BridgeService.query(condition).then(function (data) {
                $scope.bridges = data;
            }).finally(function () {
                $scope.loading = false;
                $scope.$broadcast('scroll.refreshComplete');
                return $scope.$broadcast('scroll.infiniteScrollComplete');
            })
        }

        $scope.query();


    }
);
