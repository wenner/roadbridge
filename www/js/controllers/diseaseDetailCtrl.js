angular.module('bridge').controller(
    'DiseaseDetailCtrl',
    function ($scope, $rootScope, $stateParams, $ionicLoading, $ionicModal,
              $timeout, $state, $location, $log ,
              DiseaseService) {

        $scope.isLoading = false;

        $scope.load = function(id){
            $scope.isLoading = true;
            id = id || $stateParams.id;
            DiseaseService.getDiseaseById(id)
                .then(function(data){
                    var dm = data.data;
                    $scope.disease =  dm.Disease;
                    $scope.medias = dm.Medias;
                })
                .finally(function() {
                    $scope.isLoading = false;
                    return $scope.$broadcast('scroll.refreshComplete');
                });
        };

        $scope.load();


    }
);
