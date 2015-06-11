angular.module('bridge').controller(
    'CheckSelectorCtrl',
    function ($scope, $rootScope, $stateParams, $ionicLoading, $ionicModal,
              $ionicPopup ,
              $timeout, $state, $location, $log , $ionicSideMenuDelegate ,
              BaseData , CheckService , CheckListService) {
        var binghai = {};

        _.extend($scope , {
            saveButtonText:"保存并评价" ,
            binghai:_.clone(binghai) ,
            duns: _.range(1,15) ,
            current: CheckService.current ,
            commonSelect: function(item){
                var isEnd = $scope.currentStep.isEnd;
                var resultItem = {
                    code: $scope.currentStep.code ,
                    value: item.value || item.name
                };
                CheckService.add(resultItem);
                $scope.$emit('change' , isEnd);
                if (isEnd){
                }else{
                    var currentStep = CheckService.getCurrentStep() ,
                        stateParams = CheckService.getCurrentStateParams(currentStep);
                    $state.go("check.content" , stateParams);
                }
            } ,
            saveBinghai: function(){
                var data = {
                    code: $scope.currentStep.code ,
                    value: $scope.binghai ,
                    display: _.template($scope.binghai.template)($scope.binghai)
                }
                CheckService.add(data);
                $scope.$emit('change');

                var currentStep = CheckService.getCurrentStep() ,
                    stateParams = CheckService.getCurrentStateParams(currentStep);
                console.log("选择后跳转" , stateParams.url , stateParams.code);
                $state.go("check.content" , stateParams);
                $scope.binghai = binghai;
            }
        });

        $scope.$on('$ionicView.beforeEnter', function(){
            var currentStep = CheckService.getCurrentStep() ,
                stateParams = CheckService.getCurrentStateParams(currentStep);
            $scope.currentStep = currentStep;

            if ($stateParams.url == stateParams.url
                && $stateParams.code == stateParams.code){
                CheckListService.getList(currentStep , $scope.current).then(function(data){
                    $scope.currentItems = data;
                });
                //var currentItems = CheckService.getCurrentList(currentStep);
                //$scope.currentItems = currentItems;
                $scope.title = currentStep.title || "请选择"+currentStep.name;
            }else{
                $state.go("check.content" , stateParams);
            }
        });

    }
);
