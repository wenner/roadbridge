angular.module('bridge')
    .controller(
    'TabCtrl',
    function ($scope, $rootScope, $state, $log, $timeout, $ionicLoading ,
              $ionicPopover) {
        // .fromTemplateUrl() method
        $ionicPopover.fromTemplateUrl('views/addcheckmenu.html', {
            scope: $scope
        }).then(function(popover) {
                $scope.popover = popover;
        });

        angular.extend($scope , {
            showPopover: function(event){
                $scope.popover.show(event);
            }
        });
    });
