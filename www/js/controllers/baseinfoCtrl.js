angular.module('bridge').controller(
    'BaseInfoCtrl',
    function ($scope, $rootScope, $stateParams, $ionicLoading, $ionicModal,
              $timeout, $state, $location, $log , $q , $ionicHistory,
              DataBaseService , EnvService) {
        var db = DataBaseService;
        _.extend($scope , {
            action: "create" ,
            checkCreated: function(){
                $scope.action = "create";
                $ionicLoading.show();
                db.checkCreated()
                    .then($scope.confirmReCreate)
                    .catch($scope.createDataBase)
                    .finally(function(){
                        $ionicLoading.hide();
                    })
            } ,
            confirmReCreate: function(){
                db.getTables().then(function(data){
                    $scope.createItems = data;
                    if (confirm("已有本地数据库 , 确定要删除以前数据并重新创建数据库么?")){
                        $scope.createDataBase();
                    }
                });
            } ,
            createDataBase: function(){
                db.createDataBase().then(function(data){
                    $scope.createItems = data;
                } , function(){
                    $scope.error = "不能获取初始化脚本,请联系管理员!";
                });
            } ,

            checkUpdated: function(){
                $ionicLoading.show();
                $scope.action = "update";
                db.checkUpdated().then(function(data){
                    $scope.updateItems = data.items;
                    $ionicLoading.hide();
                    if (data.isChanged) $scope.updateDataBase(data.items);
                });
            } ,
            updateDataBase: function(items){
                _.each(items , function(item){
                    if (item.isChanged){
                        $scope.updateTable(item);
                    }
                })
            } ,
            tableStatus: {
                ok: "已是最新" ,
                change: "需要更新" ,
                load: "读取数据" ,
                parse: "解析数据" ,
                insert: "写入数据" ,
                complete: "更新完成" ,
                error: "错误"
            } ,
            updateTable: function(item){
                db.updateTable(item).then(
                    function(count){
                        item.status = "complete";
                        item.message = " , "+count+"条数据";
                        item.isChanged = false;
                    } ,
                    function(msg){
                        item.status = "error";
                        item.message = " : "+msg;
                    } ,
                    function(status){
                        item.status = status;
                    }
                );
                //item.status = "更新中,获取数据";
            }
        });
        $scope.action = $stateParams.action;
        if ($stateParams.action == "create"){
            $scope.checkCreated();
        }else{
            $scope.checkUpdated();
        }
    }
);
