angular.module('bridge')
    .controller(
    'TabCtrl',
    function ($scope, $rootScope, $state, $log, $timeout, $ionicLoading ,
              $ionicPopover ,
              CheckSwipeService) {
        // .fromTemplateUrl() method
        $ionicPopover.fromTemplateUrl('views/addcheckmenu.html', {
            scope: $scope
        }).then(function(popover) {
                $scope.popover = popover;
        });

        angular.extend($scope , {
            showPopover: function(event){
                $scope.popover.show(event);
            } ,
            goCheckSwipe: function(){
                var url = "checkswipe.disease";
                if (CheckSwipeService.current.isEmpty()){
                    url = "checkswipe.baseinfo";
                }
                $state.go(url);
            }
        });
    });
