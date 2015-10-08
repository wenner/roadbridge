angular.module('bridge').controller(
    'DiseaseCtrl',
    function ($scope, $rootScope, $stateParams, $ionicLoading, $ionicModal,
              $timeout, $state, $location, $log ,
              DiseaseService , BaseData) {

        $log.debug('disease ctrl', $stateParams);
        $scope.conditon = {};

        $ionicModal.fromTemplateUrl("views/diseaseConditionModal.html" , {
            scope: $scope
        }).then(function(modal) {
            $scope.conditionModal = modal;
        });

        $scope.roads = BaseData.roads;
        $scope.bridges = BaseData.bridges;

        $scope.query = function () {
            $scope.loading = true;
            DiseaseService
                .query($scope.condition)
                .then(function (data) {
                    $scope.diseases = data.data;
                })
                .finally(function () {
                    $scope.loading = false;
                    $scope.$broadcast('scroll.refreshComplete');
                    return $scope.$broadcast('scroll.infiniteScrollComplete');
                })
        };
        $scope.query();

        $scope.showConditionModal = function(){
            $scope.conditionModal.show();
        }



    }
);
