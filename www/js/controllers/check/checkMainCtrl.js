angular.module('bridge').controller(
    'CheckMainCtrl',
    function ($scope, $rootScope, $stateParams, $ionicLoading, $ionicModal, $ionicTabsDelegate ,
              $timeout, $state, $location, $log , $ionicSideMenuDelegate ,
		BaseData , CheckService) {
        console.log("checkmain ctrl")
        $scope.result = CheckService.update();
        $scope.images = CheckService.getImages();

        //sidmenu toggle
        $scope.toggleSide = function() {
            $ionicSideMenuDelegate.toggleRight();
        };

        //goback
        $scope.goback = function(){
            history.back();
        }

        $scope.changeTab = function(){
            $scope.title = ["检查信息" , "现场照片"][$ionicTabsDelegate.selectedIndex()]
        }

        $scope.reSelect = function(item){
            CheckService.remove(item);
            $scope.result = CheckService.update();
            var stepInfo = CheckService.getStateSteps();
            var sp = stepInfo.stateParams;
            $state.go("check.content" , sp);
        }

        $scope.$on('change', function() {
            $scope.result = CheckService.update();
            $ionicTabsDelegate.select(0);
        });

    }
);
