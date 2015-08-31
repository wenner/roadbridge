angular.module('bridge').controller(
    'CheckSwipeCtrl',
    function ($scope, $rootScope, $stateParams, $ionicLoading, $ionicModal,
              $ionicTabsDelegate , $ionicPopover , $ionicActionSheet ,
              $timeout, $state, $location, $log , $ionicSideMenuDelegate ,
			  $cordovaCapture , $cordovaCamera , $cordovaGeolocation ,
			   CheckSwipeService , $ionicSlideBoxDelegate) {

        var srv = CheckSwipeService;

        // .fromTemplateUrl() method
        $ionicPopover.fromTemplateUrl('views/checkswipe/menu.html', {
            scope: $scope
        }).then(function(popover) {
            $scope.popover = popover;
        });


        var db = window.openDatabase("test", 1.1, 'mydb', 30000);
        /*
        db.transaction(function(tx){
            tx.executeSql("select * from product",[],function(tx,results){
                console.log(results.rows.item(1))
            },function(tx,error){
                return false;
            });
        });
        */
        _.extend($scope , {
            current : srv.current,

            roads : srv.getRoads(),
            bridges : srv.getBridges(),
            directions : [],
            buweis : srv.getBuweis(),
            weathers : srv.getWeathers(),
            info : {
                road:1 ,
                bridge:1 ,
                direction: "L" ,
                bujianGroup: "桥下检测" ,
                weather: "晴" ,
                checkdept: "天津市交通科学研究院" ,
                checkuser: "张文涛" ,
                checkday: new Date()
            },

            showPopover: function(event){
                $scope.popover.show(event);
            } ,

            goback: function(){
                history.back();
            } ,
            initInfo: function(){
                var road = srv.getRoadById($scope.info.road);
                if (road){
                    $scope.info.roadRecord = road;
                }
                var bridge = srv.getBridgeById($scope.info.bridge);
                if (bridge){
                    $scope.info.bridgeRecord = bridge;
                    if (bridge.wayType == "double"){
                        $scope.info.hasDirection = bridge.wayType == "double";
                        $scope.directions = srv.getDirections($scope.info.roadRecord , $scope.info.bridgeRecord);
                    }else{
                        $scope.info.direction = "S";
                    }
                }
            } ,
            showInfoModal: function(){
                if (!$scope.infoModal){
                    $ionicModal.fromTemplateUrl("views/checkswipe/infoModal.html" , {
                        scope: $scope ,
                        backdropClickToClose: false
                    }).then(function(modal) {
                        $scope.infoModal = modal;
                        $scope.infoModal.show();
                    });
                }else{
                    $scope.infoModal.show();
                }
            } ,
            reSelectInfo: function(){
                $scope.infoModal.show();
            } ,
            changeRoad: function(){
                delete $scope.info.bridge;
                delete $scope.info.direction;
                delete $scope.info.bridgeRecord;
                delete $scope.info.hasDirection;
                var road = srv.getRoadById($scope.info.road);
                if (road){
                    $scope.info.roadRecord = road;
                }
            } ,
            changeBridge: function(){
                var bridge = srv.getBridgeById($scope.info.bridge);
                if (bridge){
                    $scope.info.bridgeRecord = bridge;
                }
                if (bridge.wayType == "double"){
                    $scope.info.hasDirection = bridge.wayType == "double";
                    $scope.directions = srv.getDirections($scope.info.roadRecord , $scope.info.bridgeRecord);
                }else{
                    $scope.info.direction = "S";
                }
            } ,
            onInfoSelect: function(){
                //设置基础信息
                $scope.current.setInfo($scope.info);
                //获取部件号(孔/联)
                var bujianSns = srv.getBujianSns();
                $scope.bujianSns = {
                    name:"部件号" , code:"bujianSn" , items: bujianSns
                };
                //获取部件类型
                var bujians = srv.getBujians();
                $scope.bujians = {
                    name:"部件" , code:"bujian" , items: bujians
                };
                $scope.infoModal.hide();
            } ,

            changeCol: function(coldata){
                var code = coldata.code;
                console.log("change "+ code);
                var itemData = coldata.items[coldata.activeIndex];
                $scope.current.set(code , {
                    value: coldata.value ,
                    record: itemData
                });
                switch (coldata.code){
                    case "bujianSn":
                        $scope.changeColumnsByBujianSn(code);
                        break;
                    case "bujian":
                        if (!$scope.pickerColumns){
                            $scope.pickerColumns = srv.getPickerColumns();
                        }
                        $scope.changeColumnsByBujian(code);
                        $scope.changeColumnsByBujianSn(code);
                        break;
                    default:
                        $scope.changeColumnsByPick(code);
                        break;
                }
                if (!$scope.result) $scope.result = {};
                $scope.result.values = $scope.getValues();
            } ,
            applyChanges: function(changes){
                if(!$scope.$$phase) {
                    $scope.$apply(function(){
                        _.each(changes , function(n , index){
                            _.extend($scope.pickerColumns[index] , n);
                        });
                    });
                }else{
                    _.each(changes , function(n , index){
                        _.extend($scope.pickerColumns[index] , n);
                    });
                }
            } ,
            changeColumnsByBujian: function(){
                var changes = srv.getColumnsByBujian($scope.pickerColumns);
                $scope.applyChanges(changes);
            },
            changeColumnsByBujianSn: function(code){
                if (!$scope.pickerColumns) return;
                var changes = srv.getColumnsByBujianSn($scope.pickerColumns);
                $scope.applyChanges(changes);

                //修改部件的badge
                if (code == "bujianSn"){
                    var badge = $scope.current.bujianSn.record.badge;
                    var bujianBadge = 0;
                    _.each($scope.bujians.items , function(n){
                        n.badge = 0;
                        if (badge - bujianBadge != 0) {
                            var count = _.random(badge-bujianBadge);
                            n.badge = count;
                            bujianBadge += count;
                        };

                    });
                }
            } ,

            changeColumnsByPick: function(code){
                if (!$scope.pickerColumns) return;
                var changes = srv.getColumnsByPick($scope.pickerColumns , code);
                $scope.applyChanges(changes);
            } ,
            getValues: function(){
                var vs = {};
                _.each($scope.current , function(n , key){
                    if (n) vs[key] = n.display || n.value;
                });
                var template = _.template([
                    "{{bujianSn}} {{liang}}{{formal}} " ,
                    "{{dun}}{{distance}}m {{position}} " ,
                    "{{diseaseQualitative}} {{length}} {{width}} " ,
                    "{{diseaseEvaluate}}"].join(""));
                var html;
                try{
                    html= template(vs);
                }catch(e){

                }
                return html;
            } ,


            showMediaMenu: function(event){
                //$scope.popover.show(event)
                var hideSheet = $ionicActionSheet.show({
                    buttons: [
                        {text: '<i class="icon ion-ios-camera"></i>拍摄照片' , code:"camera"},
                        {text: '<i class="icon ion-ios-albums"></i>从相册获取照片' , code:"album"} ,
                        {text: '<i class="icon ion-ios-videocam"></i>拍摄视频' , code:"video"} ,
                        {text: '<i class="icon ion-ios-recording"></i>录音' , code:"audio"}
                    ],
                    //destructiveText: '删除',
                    //titleText: '添加媒体信息',
                    cancelText: '取消',
                    cancel: function() {
                        // add cancel code..
                    },
                    buttonClicked: function(index , btn) {
                        var fn = $scope["get"+_.capitalize(btn.code)];
                        if (fn && _.isFunction(fn)){
                            fn();
                        }
                        return true;
                    }
                });
            }

        });

        $scope.initInfo();
        $scope.$on('$ionicView.beforeEnter', function(){
            if ($scope.current.isEmpty()) $scope.showInfoModal();
        });






    }
);
