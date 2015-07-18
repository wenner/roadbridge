angular.module('bridge').controller(
    'CheckSwipeCtrl',
    function ($scope, $rootScope, $stateParams, $ionicLoading, $ionicModal,
              $ionicTabsDelegate , $ionicPopover , $ionicActionSheet ,
              $timeout, $state, $location, $log , $ionicSideMenuDelegate ,
			  $cordovaCapture , $cordovaCamera , $cordovaGeolocation ,
			  BaseData , CheckService , $ionicSlideBoxDelegate) {

        //$ionicSlideBoxDelegate.enableSlide(false);

        //$scope.current = CheckService.current;
        //$scope.currentStep = CheckService.getCurrentStep();
        //$scope.result = CheckService.update();
        //$scope.medias = CheckService.medias;

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

		$scope.showdrag = function(){
			console.log("drag")
		}

        $scope.testWatch = function(){
            $scope.s[0].items = _.range(1 , _.random(10 , 50))
        }

        $scope.showClick = function(col){
            alert(col.code)
        }

        $scope.changeCol = function(coldata){
            var itemData = coldata.items[coldata.activeIndex];
            $scope.result.values = $scope.getValues();
        }

        $scope.getValues = function(){
            //bujiannum , bujian columns
            var result = $scope.result;
            var s = $scope.s;
            var vs = [];
            vs.push(result.bujiannum.value);
            vs.push(result.bujian.value);
            _.each(s , function(n){
                vs.push(n.value);
            })
            return vs.join("-");

        }
    }
);
