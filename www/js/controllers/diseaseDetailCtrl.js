angular.module('bridge').controller(
    'DiseaseDetailCtrl',
    function ($scope, $rootScope, $stateParams, $ionicLoading, $ionicModal,
              $timeout, $state, $location, $log ,
              DiseaseService) {

        $scope.isLoading = false;

        $scope.load = function(sn){
            $scope.isLoading = true;
            sn = sn || $stateParams.sn;
            console.log(sn)
            DiseaseService.getDiseaseBySn(sn)
                .then(function(data){
                    _.extend($scope , data);
                })
                .finally(function() {
                    $scope.isLoading = false;
                    return $scope.$broadcast('scroll.refreshComplete');
                });


        }

        $scope.load();


    }
);
