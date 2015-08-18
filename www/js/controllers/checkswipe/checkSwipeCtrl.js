angular.module('bridge').controller(
    'CheckSwipeCtrl',
    function ($scope, $rootScope, $stateParams, $ionicLoading, $ionicModal,
              $ionicTabsDelegate , $ionicPopover , $ionicActionSheet ,
              $timeout, $state, $location, $log , $ionicSideMenuDelegate ,
			  $cordovaCapture , $cordovaCamera , $cordovaGeolocation ,
			  SwipeBaseData , CheckSwipeService , $ionicSlideBoxDelegate) {

        var srv = CheckSwipeService;
        var db = SwipeBaseData;

        //$ionicSlideBoxDelegate.enableSlide(false);
        //$scope.current = CheckService.current;
        //$scope.currentStep = CheckService.getCurrentStep();
        //$scope.result = CheckService.update();
        //$scope.medias = CheckService.medias;

        $scope.current = srv.current;

        $scope.roads = srv.getRoads();
        $scope.bridges = srv.getBridges();
        $scope.directions = [];
        $scope.buweis = srv.getBuweis();
        $scope.weathers = srv.getWeathers();
        $scope.info = {
            road:1 ,
            bridge:1 ,
            direction: "L" ,
            bujianGroup: "桥下检测" ,
            weather: "晴" ,
            checkdept: "天津交通科学研究院" ,
            checkuser: "张文涛" ,
            checkday: new Date()
        };



        $scope.result = {
            bujiannum: {
                name:"联" ,
                code:"bujiannum" ,
                items:(function(){
                    var rs  = [];
                    for(var i =  1 ; i<=25; i++){
                        rs.push({name:"第"+i+"孔" , code:"" , value:i});
                    }
                    return rs;
                })()
            } ,
            bujian: {
                name:"部件" ,
                code:"bujian" ,
                items:[
                    {name:"主要承重构件" , code:"TCmain" , value:"主要承重构件"} ,
                    {name:"一般承重构件" , code:"TCnormal" , value:"一般承重构件"} ,
                    {name:"支座" , code:"TCsupport" , value:"支座"} ,
                    {name:"翼墙/耳墙" , code:"BCwingwall" , value:"翼墙/耳墙" } ,
                    {name:"锥坡/护坡" , code:"BCslope" , value:"锥坡/护坡"} ,
                    {name:"桥墩" , code:"BCpier" , value:"桥墩"} ,
                    {name:"桥台" , code:"BCabutment" , value:"桥台"} ,
                    {name:"墩台基础" , code:"BCbase" , value:"墩台基础"} ,
                    {name:"河床" , code:"BCbed" , value:"河床"} ,
                    {name:"调治构造物" , code:"BCrs" , value:"调治构造物"}
                ]
            }
        };

		var s = [
			{name:"梁号" , code:"1" ,  width:80 ,
				items:["整梁" , "1#" , "2#" , "3#" , "4#" , "5#" , "6#" , "7#" , "8#" , "9#" , "10#"]

            } ,
			{name:"形式" , code:"2" ,  
				items:["挂梁" , "悬臂梁" , "板梁" , "箱梁" , "T梁" , "小箱梁" , "钢箱梁" , "组合梁"]} , 
			{name:"距墩" , code:"3" , 
				items:["距6#墩" , "距7#墩" , "1/4跨" , "跨中" , "3/4跨"]} , 
			{name:"m" , code:"4" , 
				items:(function(){
					var rs  = [];
					for(var i =  1 ; i<=25; i++){
						rs.push(i)
					}
					return rs;
				})()
			} , 
			{name:"位置" , code:"5" , 
				items:["内测腹板" , "外侧腹板" , "底板" , "外侧翼板" , "内测翼板"]} , 
			{name:"分类" , code:"6" ,  
				items:["砼缺陷" , "裂缝" , "钢筋锈蚀"]} , 
			{name:"类型" , code:"7" ,  
				items:["网状龟裂" , "蜂窝" , "麻面" , "砼剥落" , "露筋" , "掉角" , "空洞" , "刮蹭"]} , 
			{name:"长" , code:"8" ,   width:60 ,
				items:(function(){
					var step = 0.1 , 
						rs = [];
					for(var i = 0.1 ; i<50 ; i=(i*10000000000000+step*10000000000000)/10000000000000){
						step = i<1 ? 0.1 : 1;
						rs.push(i);
					}
					return rs;
				})()
			} , 
			{name:"宽" , code:"9" ,  width:60 ,
				items:(function(){
					var step = 0.1 , 
						rs = [];
					for(var i = 0.1 ; i<50 ; i=(i*10000000000000+step*10000000000000)/10000000000000){
						step = i<1 ? 0.1 : 1;
						rs.push(i);
					}
					return rs;
				})()
			} , 
			{name:"评价" , code:"10" ,  width:60 ,
				items:[1,2,3,4]}
		]

        _.each(s , function(n){
            var items = [];
            _.each(n.items , function(item){
                items.push({name:item , value:item})
            });
            n.items = items;
        });

		$scope.s  = s;

        //goback
        $scope.goback = function(){
            history.back();
        }

        _.extend($scope , {
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
                console.log(bujianSns)
                $scope.bujianSns = {
                    name:"部件号" , code:"bujianSn" , items: bujianSns
                };
                //获取部件类型
                var bujians = srv.getBujians();
                $scope.bujians = {
                    name:"部件" , code:"bujian" , items: bujians
                };
                $scope.infoModal.hide();
                console.log($scope.current);
            } ,

            changeCol: function(coldata){
                var itemData = coldata.items[coldata.activeIndex];
                if ($scope.current[coldata.code]){
                    $scope.current[coldata.code].value = coldata.value;
                }
                //$scope.result.values = $scope.getValues();
                console.log($scope.current)
            } ,
            getValues: function(){
                var vs = [];
                _.each($scope.current , function(n){
                    vs.push(n.value);
                });
                //return vs.join("-");
            }

        });

        $scope.initInfo();
        $scope.$on('$ionicView.beforeEnter', function(){
            if ($scope.current.isEmpty) $scope.showInfoModal();
        });






    }
);
