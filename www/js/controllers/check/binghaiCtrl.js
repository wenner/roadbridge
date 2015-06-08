angular.module('bridge').controller(
    'BinghaiCtrl',
    function ($scope, $rootScope, $stateParams, $ionicLoading, $ionicModal, $ionicTabsDelegate ,
              $timeout, $state, $location, $log , $ionicSideMenuDelegate ,
		BaseData , CheckService , BinghaiService) {

        $scope.saveButtonText = "保存并评价";
        var binghai = {
            dun: 1
        };
        $scope.binghai = _.clone(binghai);
        $scope.duns = _.range(1,15);

        $scope.save = function(){
            var data = {
                nextstep:"pingjia" ,
                code: "binghai" ,
                value: $scope.binghai ,
                display: _.template($scope.binghai.template)($scope.binghai)
            }
            CheckService.add(data);

            var stepInfo = CheckService.getStateSteps();
            var sp = stepInfo.stateParams;
            console.log("选择后跳转" , sp.url , sp.code);
            $state.go("check.content" , sp);
            $scope.$emit('change');
            $scope.binghai = binghai;
        }
    }
)
